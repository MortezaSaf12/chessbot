require("dotenv").config();
const express = require("express");
const { Chess } = require("chess.js");
const { getBestMove } = require("./engine/bot");
const { evaluate } = require("./engine/evaluation");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Game statae

let game = new Chess();
let maxDepth = 6;

// Helpers

/** Build a standard game-status object. */
function gameStatus() {
    const inCheck = game.isCheck();
    const eval_ = evaluate(game);

    if (!game.isGameOver()) {
        return { gameOver: false, result: null, inCheck, evaluation: eval_ };
    }

    let result = "draw";
    if (game.isCheckmate()) {
        result = game.turn() === "w" ? "black_wins" : "white_wins";
    }
    return { gameOver: true, result, inCheck, evaluation: eval_ };
}

/** Current full-move number (1-based). */
function moveNumber() {
    return Math.floor(game.moveNumber());
}

// Routes

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

/**
 * POST /api/new-game
 * Reset the board to the starting position.
 */
app.post("/api/new-game", (_req, res) => {
    game = new Chess();
    console.log("New game started");
    res.json({ fen: game.fen() });
});

/**
 * POST /api/difficulty
 * Set search depth (2–6).
 * Body: { depth: number }
 */
app.post("/api/difficulty", (req, res) => {
    const { depth } = req.body;
    if (!depth || depth < 2 || depth > 6) {
        return res.status(400).json({ error: "Depth must be between 2 and 6" });
    }
    maxDepth = depth;
    console.log(`Difficulty set to depth ${maxDepth}`);
    res.json({ depth: maxDepth });
});

/**
 * POST /api/move
 * Accept the player's move (SAN), compute the bot's reply, fetch commentary.
 * Body: { move: string }  — e.g. "e4", "Nf3", "O-O"
 */
app.post("/api/move", async (req, res) => {
    const { move } = req.body;
    if (!move) {
        return res.status(400).json({ error: "Missing 'move' field" });
    }

    // 1. Apply the player's move
    let playerMove;
    try {
        playerMove = game.move(move);
    } catch {
        return res.status(400).json({ error: `Illegal move: ${move}` });
    }

    // 2. Check if game ended after player's move
    const statusAfterPlayer = gameStatus();
    if (statusAfterPlayer.gameOver) {
        return res.json({
            playerMove: playerMove.san,
            botMove: null,
            fen: game.fen(),
            ...statusAfterPlayer,
        });
    }

    // 3. Bot's turn — compute best move
    const timeLimitMs = maxDepth * 2500;
    const botMoveObj = getBestMove(game, maxDepth, timeLimitMs);
    const botPlayed = game.move(botMoveObj);
    console.log(`Bot played: ${botPlayed.san}`);

    // 4. Check if game ended after bot's move
    const statusAfterBot = gameStatus();

    res.json({
        playerMove: playerMove.san,
        botMove: botPlayed.san,
        fen: game.fen(),
        ...statusAfterBot,
    });
});

/**
 * GET /api/state
 * Return the current game state.
 */
app.get("/api/state", (_req, res) => {
    res.json({
        fen: game.fen(),
        history: game.history(),
        turn: game.turn(),
        moveNumber: moveNumber(),
        ...gameStatus(),
    });
});

// Start

const http = require("http");
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.on("listening", () => {
    const addr = server.address();
    console.log(`Chess server running on http://localhost:${addr.port}`);
});

server.on("error", (err) => {
    console.error("Server error:", err.message);
    process.exit(1);
});

server.listen(PORT);