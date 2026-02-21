const { evaluate } = require('./evaluation');
const { TranspositionTable, hashBoard } = require('./transposition');

const tt = new TranspositionTable(64);

// Order moves for better pruning: TT best move first, then captures (MVV-LVA), promotions.
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


function sideToMoveEval(game) {
    return game.turn() === 'w' ? evaluate(game) : -evaluate(game);
}

// Quiescence search — keep searching captures to avoid noisy evaluations.
function quiescence(game, alpha, beta, evaluate, depth = 0) {
    const standPat = evaluate(game);

    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
    if (depth >= 8) return alpha; // limit quiescence depth

    const captures = game.moves({ verbose: true }).filter(m => m.captured);
    const orderedCaptures = orderMoves(game, captures, null);

    for (const move of orderedCaptures) {
        game.move(move);
        const score = -quiescence(game, -beta, -alpha, evaluate, depth + 1);
        game.undo();

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }

    return alpha;
}

// Negamax + alpha-beta with TT lookup.
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
        return quiescence(game, alpha, beta, sideToMoveEval);
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

// Iterative deepening with time management.
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
        let alpha = -Infinity;
        const beta = Infinity;

        for (const move of orderedMoves) {
            if (Date.now() - startTime > timeLimitMs) {
                console.log(`Time limit reached at depth ${depth}`);
                return bestMove || moves[0];
            }

            game.move(move);
            const score = -negamax(game, depth - 1, -beta, -alpha);
            game.undo();

            if (score > currentBestScore) {
                currentBestScore = score;
                currentBestMove = move;
            }
            alpha = Math.max(alpha, score);
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