/**
 * Material piece values (centipawn scale)
 */
const PIECE_VALUES = {
  p: 100,    // Pawn
  n: 320,    // Knight
  b: 330,    // Bishop
  r: 500,    // Rook
  q: 900,    // Queen
  k: 20000,  // King
};

/**
 * Piece-Square Tables (PST)
 *
 * Indexed from White's perspective, rank 8 (index 0) to rank 1 (index 63).
 * For Black, the table is mirrored vertically.
 */

// PAWN
// Reasoning: Center control (d4/e4), advance bonus, slight penalty for a/h pawns
const PST_PAWN_MG = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

//KNIGHT
// Strong in center, terrible on rim
const PST_KNIGHT_MG = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

//BISHOP
// Reasoning: Open diagonals, small center bonus, avoid corners/edges
const PST_BISHOP_MG = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10,
  -10, 0, 10, 10, 10, 10, 0, -10,
  -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 5, 0, 0, 0, 0, 5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

//ROOK
// Reasoning: 7th rank bonus, open file preference, avoid corners early
const PST_ROOK_MG = [
  0, 0, 0, 0, 0, 0, 0, 0,
  5, 10, 10, 10, 10, 10, 10, 5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  0, 0, 0, 5, 5, 0, 0, 0,
];

// ---------- QUEEN ----------
// Slight center preference, avoid edges
const PST_QUEEN_MG = [
  -20, -10, -10, -5, -5, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 5, 5, 5, 0, -10,
  -5, 0, 5, 5, 5, 5, 0, -5,
  0, 0, 5, 5, 5, 5, 0, -5,
  -10, 5, 5, 5, 5, 5, 0, -10,
  -10, 0, 5, 0, 0, 0, 0, -10,
  -20, -10, -10, -5, -5, -10, -10, -20,
];

// ---------- KING MIDDLEGAME ----------
// Stay castled (kingside/queenside), penalize center and open positions
const PST_KING_MG = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20, 20, 0, 0, 0, 0, 20, 20,
  20, 30, 10, 0, 0, 10, 30, 20,
];

// ---------- KING ENDGAME ----------
// Move to center, be active
const PST_KING_EG = [
  -50, -40, -30, -20, -20, -30, -40, -50,
  -30, -20, -10, 0, 0, -10, -20, -30,
  -30, -10, 20, 30, 30, 20, -10, -30,
  -30, -10, 30, 40, 40, 30, -10, -30,
  -30, -10, 30, 40, 40, 30, -10, -30,
  -30, -10, 20, 30, 30, 20, -10, -30,
  -30, -30, 0, 0, 0, 0, -30, -30,
  -50, -30, -30, -30, -30, -30, -30, -50,
];

/**
 * Lookup maps keyed by piece type (lowercase).
 * King has separate middlegame and endgame tables.
 */
const PST_MG = {
  p: PST_PAWN_MG,
  n: PST_KNIGHT_MG,
  b: PST_BISHOP_MG,
  r: PST_ROOK_MG,
  q: PST_QUEEN_MG,
  k: PST_KING_MG,
};

const PST_EG = {
  k: PST_KING_EG,
};

// ---------- Helpers ----------

/*Convert a square string (e.g. "e4") to a 0-63 index, from White's perspective (a8=0, h1=63).*/
function squareIndex(sq) {
  const file = sq.charCodeAt(0) - 97; // a=0 … h=7
  const rank = parseInt(sq[1], 10);   // 1-8
  return (8 - rank) * 8 + file;
}

/*Mirror an index vertically for Black's perspective*/
function mirrorIndex(idx) {
  const row = Math.floor(idx / 8);
  const col = idx % 8;
  return (7 - row) * 8 + col;
}


// Evaluation

/**
 * Evaluate the position (White's perspective). 
 * Positive = White is better, Negative = Black is better.
 * @param {import('chess.js').Chess} game
 * @returns {number} centipawn score
 */
function evaluate(game) {

  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -99999 : 99999;
  }
  if (game.isStalemate() || game.isDraw()) {
    return 0;
  }

  const fen = game.fen();
  let material = 0;
  let score = 0;
  let whiteBishops = 0;
  let blackBishops = 0;
  let whiteKingIdx = -1;
  let blackKingIdx = -1;

  // Per-file pawn tracking for doubled/isolated detection
  const whitePawnsPerFile = new Array(8).fill(0);
  const blackPawnsPerFile = new Array(8).fill(0);

  let r = 0, c = 0;
  for (let i = 0; i < fen.length; i++) {
    const ch = fen[i];
    if (ch === ' ') break; // End of board layout
    if (ch === '/') { r++; c = 0; continue; }

    const code = ch.charCodeAt(0);
    // If it's a digit 1-8
    if (code >= 49 && code <= 56) {
      c += (code - 48);
      continue;
    }

    const isWhite = code < 97;
    const type = isWhite ? ch.toLowerCase() : ch;
    const value = PIECE_VALUES[type];
    const idx = r * 8 + c;

    if (type !== 'p' && type !== 'k') {
      material += value;
    }

    if (isWhite) {
      score += value;
      if (type === 'k') {
        whiteKingIdx = idx;
      } else {
        score += PST_MG[type][idx];
      }
      if (type === 'b') whiteBishops++;
      if (type === 'p') whitePawnsPerFile[c]++;
    } else {
      score -= value;
      const mIdx = mirrorIndex(idx);
      if (type === 'k') {
        blackKingIdx = mIdx;
      } else {
        score -= PST_MG[type][mIdx];
      }
      if (type === 'b') blackBishops++;
      if (type === 'p') blackPawnsPerFile[c]++;
    }
    c++;
  }

  const MAX_MATERIAL = 2 * (320 + 330 + 500 + 500 + 900); // 5780
  const egW = 1 - Math.min(material / MAX_MATERIAL, 1);

  if (whiteKingIdx !== -1) {
    const mgVal = PST_MG.k[whiteKingIdx];
    const egVal = PST_EG.k[whiteKingIdx];
    score += mgVal + (egVal - mgVal) * egW;
  }
  if (blackKingIdx !== -1) {
    const mgVal = PST_MG.k[blackKingIdx];
    const egVal = PST_EG.k[blackKingIdx];
    score -= mgVal + (egVal - mgVal) * egW;
  }

  // Bishop pair bonus
  if (whiteBishops >= 2) score += 50;
  if (blackBishops >= 2) score -= 50;

  // Penalty for pawn structure
  for (let f = 0; f < 8; f++) {
    if (whitePawnsPerFile[f] > 1) score -= 20 * (whitePawnsPerFile[f] - 1);
    if (blackPawnsPerFile[f] > 1) score += 20 * (blackPawnsPerFile[f] - 1);

    const wHasAdj = (f > 0 && whitePawnsPerFile[f - 1] > 0) ||
      (f < 7 && whitePawnsPerFile[f + 1] > 0);
    if (whitePawnsPerFile[f] > 0 && !wHasAdj) score -= 15 * whitePawnsPerFile[f];

    const bHasAdj = (f > 0 && blackPawnsPerFile[f - 1] > 0) ||
      (f < 7 && blackPawnsPerFile[f + 1] > 0);
    if (blackPawnsPerFile[f] > 0 && !bHasAdj) score += 15 * blackPawnsPerFile[f];
  }

  // Mobility bonus removed for performance.
  return score;
}

module.exports = { PIECE_VALUES, PST_MG, PST_EG, evaluate };