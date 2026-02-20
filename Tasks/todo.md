# Chess App — Task Tracker

## Setup
- [x] Initialize npm project
- [x] Install dependencies (express, chess.js, dotenv)
- [x] Create folder structure
- [x] Create .env

## Engine
- [x] evaluation.js — piece values and piece-square tables (all 6 piece types + king endgame)
- [x] evaluation.js — evaluate() function with material + PST + bishop pair + mobility
- [x] evaluation.js — test with sample positions
- [x] transposition.js — Zobrist hashing (initZobrist, hashBoard)
- [x] transposition.js — TranspositionTable class (store, probe, clear)
- [x] transposition.js — test hash consistency (hash, move, undo, re-hash matches)
- [x] bot.js — move ordering function (TT best move, MVV-LVA, promotions, checks)
- [x] bot.js — quiescence search (captures only at depth 0)
- [x] bot.js — negamax with alpha-beta pruning
- [x] bot.js — iterative deepening with time management
- [x] bot.js — getBestMove() function
- [x] bot.js — test at depth 4 (under 2 seconds from starting position) ⚠️ ~1.9s
- [x] bot.js — test at depth 6 (under 15 seconds from starting position)

## Server
- [x] server.js — Express setup, serve static files
- [x] server.js — POST /api/new-game
- [x] server.js — POST /api/move (player move + bot response)
- [x] server.js — POST /api/difficulty
- [x] server.js — GET /api/state
- [x] server.js — game over detection
- [x] server.js — test all endpoints with curl

## Frontend
- [x] index.html — page structure and layout
- [x] style.css — dark theme, board styling, typography
- [x] board.js — render board from FEN
- [x] board.js — click-to-select, click-to-move
- [x] board.js — legal move highlighting
- [x] board.js — pawn promotion dialog
- [x] app.js — game state management
- [x] app.js — move flow (player → API → bot → render)
- [ ] app.js — move history display
- [ ] app.js — captured pieces display
- [x] app.js — commentary display
- [ ] app.js — new game and difficulty controls
- [ ] app.js — thinking indicator (spinner + disable board)
- [x] api.js — fetch wrapper for all endpoints

## Edge Cases & Polish
- [x] Castling renders correctly (both pieces move)
- [x] En passant renders correctly (captured pawn removed)
- [x] Pawn promotion works end-to-end
- [x] Stalemate detected and displayed as draw
- [x] Bot thinking indicator shows during computation
- [x] Board disabled during bot's turn
- [x] Last move highlighted on board
- [x] Check indication (king square red glow)

## Final Testing
- [x] Full game playthrough at depth 6
- [x] All difficulty levels work (2 through 6)
- [x] New game resets everything
- [x] No console errors
- [x] Bot never makes an illegal move
- [x] Bot responds within 15 seconds at depth 6