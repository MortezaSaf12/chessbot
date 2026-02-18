const { evaluate } = require('./evaluation');

/**
 * Order moves so alpha-beta prunes more aggressively.
 * Captures and promotions are searched first.
 */
function orderMoves(game) {
  const moves = game.moves({ verbose: true });

  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Promotions first
    if (a.promotion) scoreA += 900;
    if (b.promotion) scoreB += 900;

    // Captures scored by MVV-LVA (Most Valuable Victim – Least Valuable Attacker)
    const victimVal = { p: 1, n: 3, b: 3, r: 5, q: 9 };
    const attackerVal = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 10 };
    if (a.captured) scoreA += victimVal[a.captured] * 10 - attackerVal[a.piece];
    if (b.captured) scoreB += victimVal[b.captured] * 10 - attackerVal[b.piece];

    // Checks get a small boost
    if (a.san && a.san.includes('+')) scoreA += 5;
    if (b.san && b.san.includes('+')) scoreB += 5;

    return scoreB - scoreA; // higher score first
  });

  return moves;
}

/**
 * Minimax search with alpha-beta pruning.
 *
 * @param {import('chess.js').Chess} game   - current position (mutated in place)
 * @param {number} depth                    - remaining search depth
 * @param {number} alpha                    - best score White can guarantee
 * @param {number} beta                     - best score Black can guarantee
 * @param {boolean} isMaximizing            - true when it's White's turn
 * @returns {number} evaluation score (White-positive)
 */
function minimax(game, depth, alpha, beta, isMaximizing) {
  // Base case: leaf node or terminal position
  if (depth === 0 || game.isGameOver()) {
    return evaluate(game);
  }

  const moves = orderMoves(game);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move.san);
      const score = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move.san);
      const score = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Find the best move for the current side to move.
 *
 * @param {import('chess.js').Chess} game  - current position
 * @param {number} [depth=6]              - search depth
 * @returns {{ move: string, score: number }} best move in SAN and its score
 */
function getBestMove(game, depth = 6) {
  const isMaximizing = game.turn() === 'w';
  const moves = orderMoves(game);

  let bestMove = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move.san);
    const score = minimax(game, depth - 1, -Infinity, Infinity, !isMaximizing);
    game.undo();

    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move.san;
    }
  }

  return { move: bestMove, score: bestScore };
}

module.exports = { getBestMove, minimax, orderMoves };