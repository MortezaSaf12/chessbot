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
   0,   0,   0,   0,   0,   0,   0,   0,
  50,  50,  50,  50,  50,  50,  50,  50,
  10,  10,  20,  30,  30,  20,  10,  10,
   5,   5,  10,  25,  25,  10,   5,   5,
   0,   0,   0,  20,  20,   0,   0,   0,
   5,  -5, -10,   0,   0, -10,  -5,   5,
   5,  10,  10, -20, -20,  10,  10,   5,
   0,   0,   0,   0,   0,   0,   0,   0,
];

//KNIGHT
// Strong in center, terrible on rim
const PST_KNIGHT_MG = [
 -50, -40, -30, -30, -30, -30, -40, -50,
 -40, -20,   0,   0,   0,   0, -20, -40,
 -30,   0,  10,  15,  15,  10,   0, -30,
 -30,   5,  15,  20,  20,  15,   5, -30,
 -30,   0,  15,  20,  20,  15,   0, -30,
 -30,   5,  10,  15,  15,  10,   5, -30,
 -40, -20,   0,   5,   5,   0, -20, -40,
 -50, -40, -30, -30, -30, -30, -40, -50,
];

//BISHOP
// Reasoning: Open diagonals, small center bonus, avoid corners/edges
const PST_BISHOP_MG = [
 -20, -10, -10, -10, -10, -10, -10, -20,
 -10,   0,   0,   0,   0,   0,   0, -10,
 -10,   0,   5,  10,  10,   5,   0, -10,
 -10,   5,   5,  10,  10,   5,   5, -10,
 -10,   0,  10,  10,  10,  10,   0, -10,
 -10,  10,  10,  10,  10,  10,  10, -10,
 -10,   5,   0,   0,   0,   0,   5, -10,
 -20, -10, -10, -10, -10, -10, -10, -20,
];

//ROOK
// Reasoning: 7th rank bonus, open file preference, avoid corners early
const PST_ROOK_MG = [
   0,   0,   0,   0,   0,   0,   0,   0,
   5,  10,  10,  10,  10,  10,  10,   5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
  -5,   0,   0,   0,   0,   0,   0,  -5,
   0,   0,   0,   5,   5,   0,   0,   0,
];

// ---------- QUEEN ----------
// Slight center preference, avoid edges
const PST_QUEEN_MG = [
 -20, -10, -10,  -5,  -5, -10, -10, -20,
 -10,   0,   0,   0,   0,   0,   0, -10,
 -10,   0,   5,   5,   5,   5,   0, -10,
  -5,   0,   5,   5,   5,   5,   0,  -5,
   0,   0,   5,   5,   5,   5,   0,  -5,
 -10,   5,   5,   5,   5,   5,   0, -10,
 -10,   0,   5,   0,   0,   0,   0, -10,
 -20, -10, -10,  -5,  -5, -10, -10, -20,
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
  20,  20,   0,   0,   0,   0,  20,  20,
  20,  30,  10,   0,   0,  10,  30,  20,
];

// ---------- KING ENDGAME ----------
// Move to center, be active
const PST_KING_EG = [
 -50, -40, -30, -20, -20, -30, -40, -50,
 -30, -20, -10,   0,   0, -10, -20, -30,
 -30, -10,  20,  30,  30,  20, -10, -30,
 -30, -10,  30,  40,  40,  30, -10, -30,
 -30, -10,  30,  40,  40,  30, -10, -30,
 -30, -10,  20,  30,  30,  20, -10, -30,
 -30, -30,   0,   0,   0,   0, -30, -30,
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

module.exports = { PIECE_VALUES, PST_MG, PST_EG };