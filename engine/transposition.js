/* According to (Chessprogram wiki), A transposition table stores previous search results in a hash table 
to avoid redundant calculations when the same chess position arises via different move sequences.

Utilizing Zobrist hashing, significantly reducing search time and cutting off unused.

*/

// Initialize random numbers for each piece on each square
const ZOBRIST_KEYS = {};

function initZobrist() {
    const pieces = ['p', 'n', 'b', 'r', 'q', 'k'];
    const colors = ['w', 'b'];
    for (const color of colors) {
        for (const piece of pieces) {
            for (let sq = 0; sq < 64; sq++) {
                ZOBRIST_KEYS[`${color}${piece}${sq}`] = Math.floor(Math.random() * 2147483647);
            }
        }
    }
    ZOBRIST_KEYS['side'] = Math.floor(Math.random() * 2147483647);
}

function hashBoard(game) {
    const board = game.board();
    let hash = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                hash ^= ZOBRIST_KEYS[`${piece.color}${piece.type}${row * 8 + col}`];
            }
        }
    }
    if (game.turn() === 'b') hash ^= ZOBRIST_KEYS['side'];
    return hash;
}


class TranspositionTable {
    constructor(sizeMB = 64) {
        this.size = (sizeMB * 1024 * 1024) / 32;
        this.table = new Map();
    }

    static EXACT = 0;
    static ALPHA = 1;  // Upper bound (fail-low)
    static BETA = 2;   // Lower bound (fail-high / cutoff)

    store(hash, depth, score, flag, bestMove) {
        const existing = this.table.get(hash);
        if (!existing || existing.depth <= depth) {
            this.table.set(hash, { depth, score, flag, bestMove });
        }
        if (this.table.size > this.size) {
            const firstKey = this.table.keys().next().value;
            this.table.delete(firstKey);
        }
    }

    probe(hash, depth, alpha, beta) {
        const entry = this.table.get(hash);
        if (!entry || entry.depth < depth) return null;

        if (entry.flag === TranspositionTable.EXACT) {
            return { score: entry.score, bestMove: entry.bestMove };
        }
        if (entry.flag === TranspositionTable.ALPHA && entry.score <= alpha) {
            return { score: alpha, bestMove: entry.bestMove };
        }
        if (entry.flag === TranspositionTable.BETA && entry.score >= beta) {
            return { score: beta, bestMove: entry.bestMove };
        }

        return { score: null, bestMove: entry.bestMove };
    }

    clear() {
        this.table.clear();
    }
}

initZobrist();
module.exports = { TranspositionTable, hashBoard, initZobrist };