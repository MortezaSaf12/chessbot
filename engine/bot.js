const { evaluate } = require('./evaluation');
const { TranspositionTable, hashBoard } = require('./transposition');

const tt = new TranspositionTable(64);

/**
 * Order moves so alpha-beta prunes more aggressively.
 * TT best move is searched first, then captures/promotions.
 */
function orderMoves(game, moves, ttBestMove) {
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

  // If the TT gave us a best move, put it first
  if (ttBestMove) {
    const idx = moves.findIndex(m => m.from === ttBestMove.from && m.to === ttBestMove.to);
    if (idx > 0) {
      const [hit] = moves.splice(idx, 1);
      moves.unshift(hit);
    }
  }

  return moves;
}

/**
 * Quiescence search — resolve captures so the static eval isn't on a noisy position.
 * Scores are returned from the side-to-move's perspective (negamax convention).
 */
function quiescence(game, alpha, beta, evalFn) {
  const standPat = game.turn() === 'w' ? evalFn(game) : -evalFn(game);

  if (standPat >= beta) return beta;
  if (standPat > alpha) alpha = standPat;

  const moves = game.moves({ verbose: true });
  const captures = moves.filter(m => m.captured);

  const victimVal = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const attackerVal = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 10 };
  captures.sort((a, b) => {
    const sa = victimVal[a.captured] * 10 - attackerVal[a.piece];
    const sb = victimVal[b.captured] * 10 - attackerVal[b.piece];
    return sb - sa;
  });

  for (const move of captures) {
    game.move(move);
    const score = -quiescence(game, -beta, -alpha, evalFn);
    game.undo();

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

/**
 * Negamax search with alpha-beta pruning and transposition table.
 * Always returns the score from the side-to-move's perspective.
 */
function negamax(game, depth, alpha, beta) {
    const originalAlpha = alpha;

    // 1. TT lookup
    const hash = hashBoard(game);
    const ttEntry = tt.probe(hash, depth, alpha, beta);
    if (ttEntry && ttEntry.score !== null) {
        return ttEntry.score;
    }
    const ttBestMove = ttEntry ? ttEntry.bestMove : null;

    // 2. Leaf node: quiescence search
    if (depth <= 0) {
        return quiescence(game, alpha, beta, evaluate);
    }

    // 3. Game over check
    if (game.isGameOver()) {
        if (game.isCheckmate()) return -99999 - depth; // prefer faster mates
        return 0;
    }

    // 4. Generate and order moves
    const moves = game.moves({ verbose: true });
    const orderedMoves = orderMoves(game, moves, ttBestMove);

    let bestMove = orderedMoves[0];
    let bestScore = -Infinity;

    // 5. Search each move
    for (const move of orderedMoves) {
        game.move(move);
        const score = -negamax(game, depth - 1, -beta, -alpha);
        game.undo();

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }

        alpha = Math.max(alpha, score);

        // Alpha-beta cutoff — prune remaining moves
        if (alpha >= beta) {
            break;
        }
    }

    // 6. Store in TT
    let flag;
    if (bestScore <= originalAlpha) {
        flag = TranspositionTable.ALPHA;
    } else if (bestScore >= beta) {
        flag = TranspositionTable.BETA;
    } else {
        flag = TranspositionTable.EXACT;
    }
    tt.store(hash, depth, bestScore, flag, bestMove);

    return bestScore;
}

/**
 * Find the best move using iterative deepening with time management.
 *
 * @param {import('chess.js').Chess} game       - current position
 * @param {number} [maxDepth=6]                 - maximum search depth
 * @param {number} [timeLimitMs=15000]          - hard time limit in ms
 * @returns {{ move: string, score: number }}   - best move (verbose object) and score
 */
function getBestMove(game, maxDepth = 6, timeLimitMs = 15000) {
    tt.clear();

    const startTime = Date.now();
    let bestMove = null;
    let bestScore = -Infinity;

    for (let depth = 1; depth <= maxDepth; depth++) {
        const moves = game.moves({ verbose: true });
        const ttEntry = tt.probe(hashBoard(game), 0, -Infinity, Infinity);
        const orderedMoves = orderMoves(game, moves, ttEntry ? ttEntry.bestMove : null);

        let currentBestMove = null;
        let currentBestScore = -Infinity;

        for (const move of orderedMoves) {
            if (Date.now() - startTime > timeLimitMs) {
                console.log(`Time limit reached at depth ${depth}`);
                return bestMove || moves[0];
            }

            game.move(move);
            const score = -negamax(game, depth - 1, -Infinity, Infinity);
            game.undo();

            if (score > currentBestScore) {
                currentBestScore = score;
                currentBestMove = move;
            }
        }

        if (currentBestMove) {
            bestMove = currentBestMove;
            bestScore = currentBestScore;
        }

        const elapsed = Date.now() - startTime;
        console.log(`Depth ${depth}: best=${bestMove.san}, score=${bestScore}, time=${elapsed}ms`);

        if (Math.abs(bestScore) > 90000) break; // Found checkmate
        if (elapsed * 5 > timeLimitMs) break;    // Next depth would exceed time
    }

    return bestMove;
}

module.exports = { getBestMove };