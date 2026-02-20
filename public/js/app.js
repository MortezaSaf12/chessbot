/**
 * app.js — Game controller.
 */

const App = (() => {
    let localGame = new Chess();
    let selected = null; // { square, piece }
    let moveHistory = []; // track moves ourselves (load() wipes Chess history)

    const moveListEl = document.getElementById("move-list");
    const statusEl = document.getElementById("game-status");
    const evalEl = document.getElementById("eval-display");
    const capturedEl = document.getElementById("captured");
    const difficultyEl = document.getElementById("difficulty");
    const newGameBtn = document.getElementById("new-game-btn");
    const gameoverModal = document.getElementById("gameover-modal");
    const gameoverTitle = document.getElementById("gameover-title");
    const gameoverMsg = document.getElementById("gameover-message");
    const gameoverBtn = document.getElementById("gameover-btn");
    const promotionModal = document.getElementById("promotion-modal");
    const promotionChoices = document.getElementById("promotion-choices");

    // Piece values for captured display
    const PIECE_ORDER = { p: 1, n: 2, b: 3, r: 4, q: 5 };
    const PIECE_UNICODE = {
        wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕",
        bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛",
    };

    function init() {
        Board.setClickHandler(onSquareClick);
        newGameBtn.addEventListener("click", startNewGame);
        gameoverBtn.addEventListener("click", startNewGame);
        difficultyEl.addEventListener("change", () => {
            API.setDifficulty(+difficultyEl.value);
        });
        syncState();
    }

    async function syncState() {
        const state = await API.getState();
        localGame.load(state.fen);
        moveHistory = state.history || [];
        renderAll(state);
        rebuildMoveList();
    }

    async function startNewGame() {
        gameoverModal.classList.add("hidden");
        const data = await API.newGame();
        localGame = new Chess();
        moveHistory = [];
        moveListEl.innerHTML = "";
        capturedEl.textContent = "";
        renderAll({ fen: data.fen, inCheck: false, evaluation: 0, gameOver: false });
        statusEl.textContent = "Your turn";
    }

    function onSquareClick(square, piece) {
        if (localGame.turn() !== "w" || localGame.isGameOver()) return;

        // If a piece is selected …
        if (selected) {
            const from = selected.square;
            const to = square;

            // Try the move locally first to check legality
            const legalMoves = localGame.moves({ square: from, verbose: true });
            const match = legalMoves.find(m => m.to === to);

            if (match) {
                // Check for promotion
                if (match.flags.includes("p")) {
                    showPromotion(from, to);
                } else {
                    sendMove(from, to);
                }
                return;
            }

            // Clicked elsewhere — deselect
            Board.clearHighlights();
            selected = null;
        }

        // Select own piece
        if (piece && piece.startsWith("w")) {
            selected = { square, piece };
            Board.clearHighlights();
            Board.highlight(square, "selected");

            const moves = localGame.moves({ square, verbose: true });
            for (const m of moves) {
                Board.highlight(m.to, m.captured ? "legal-capture" : "legal");
            }
        }
    }

    function showPromotion(from, to) {
        promotionModal.classList.remove("hidden");
        promotionChoices.innerHTML = "";
        for (const p of ["q", "r", "b", "n"]) {
            const btn = document.createElement("button");
            btn.textContent = PIECE_UNICODE["w" + p];
            btn.addEventListener("click", () => {
                promotionModal.classList.add("hidden");
                sendMove(from, to, p);
            });
            promotionChoices.appendChild(btn);
        }
    }

    async function sendMove(from, to, promotion) {
        selected = null;
        Board.clearHighlights();
        Board.showThinking(true);
        statusEl.textContent = "Bot thinking…";

        try {
            const san = toSan(from, to, promotion);
            const data = await API.makeMove(san);

            // Sync local game
            localGame.load(data.fen);

            // Highlight last moves
            Board.render(data.fen);
            if (data.botMove) {
                const botVerbose = findMoveSquares(data.fen, data.botMove);
                if (botVerbose) {
                    Board.highlight(botVerbose.from, "last-move");
                    Board.highlight(botVerbose.to, "last-move");
                }
            }

            if (data.playerMove) moveHistory.push(data.playerMove);
            if (data.botMove) moveHistory.push(data.botMove);
            rebuildMoveList();
            updateEval(data.evaluation);
            updateCaptured();

            if (data.inCheck) highlightKing();

            if (data.gameOver) {
                showGameOver(data.result);
            } else {
                statusEl.textContent = "Your turn";
            }
        } catch (err) {
            statusEl.textContent = err.message;
        } finally {
            Board.showThinking(false);
        }
    }

    // Convert from/to to SAN using local game state (before applying)
    function toSan(from, to, promotion) {
        const moves = localGame.moves({ verbose: true });
        const match = moves.find(m =>
            m.from === from && m.to === to &&
            (!promotion || m.promotion === promotion)
        );
        return match ? match.san : `${from}${to}`;
    }

    // After the board is updated, find which squares a SAN move used
    function findMoveSquares(fen, san) {
        const g = new Chess(fen);
        g.undo(); // go back one move
        try {
            const m = g.move(san);
            return m ? { from: m.from, to: m.to } : null;
        } catch { return null; }
    }

    function rebuildMoveList() {
        moveListEl.innerHTML = "";
        for (let i = 0; i < moveHistory.length; i += 2) {
            const row = document.createElement("div");
            row.className = "move-row";
            const n = Math.floor(i / 2) + 1;
            row.innerHTML = `<span class="move-num">${n}.</span>` +
                `<span class="move-white">${moveHistory[i]}</span>` +
                `<span class="move-black">${moveHistory[i + 1] || ""}</span>`;
            moveListEl.appendChild(row);
        }
        moveListEl.scrollTop = moveListEl.scrollHeight;
    }

    function updateEval(ev) {
        if (ev == null) return;
        const pawn = (ev / 100).toFixed(1);
        const sign = ev >= 0 ? "+" : "";
        evalEl.textContent = `Eval: ${sign}${pawn}`;
    }

    function updateCaptured() {
        const start = { wp: 8, wn: 2, wb: 2, wr: 2, wq: 1, bp: 8, bn: 2, bb: 2, br: 2, bq: 1 };
        const board = localGame.board();
        const current = {};
        for (const row of board) {
            for (const sq of row) {
                if (!sq) continue;
                const key = sq.color + sq.type;
                current[key] = (current[key] || 0) + 1;
            }
        }
        let text = "";
        for (const [key, count] of Object.entries(start)) {
            const onBoard = current[key] || 0;
            const lost = count - onBoard;
            if (lost > 0 && PIECE_UNICODE[key]) {
                text += PIECE_UNICODE[key].repeat(lost);
            }
        }
        capturedEl.textContent = text;
    }

    function highlightKing() {
        const board = localGame.board();
        const turn = localGame.turn();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const sq = board[r][c];
                if (sq && sq.type === "k" && sq.color === turn) {
                    const sqName = String.fromCharCode(97 + c) + (8 - r);
                    Board.highlight(sqName, "check");
                    return;
                }
            }
        }
    }

    function renderAll(state) {
        Board.render(state.fen);
        updateEval(state.evaluation);
        updateCaptured();
        if (state.inCheck) highlightKing();
        if (state.gameOver) showGameOver(state.result);
    }

    function showGameOver(result) {
        const messages = {
            white_wins: { title: "Checkmate!", msg: "You win! 🎉" },
            black_wins: { title: "Checkmate!", msg: "Bot wins." },
            draw: { title: "Draw", msg: "The game is a draw." },
        };
        const info = messages[result] || { title: "Game Over", msg: result };
        gameoverTitle.textContent = info.title;
        gameoverMsg.textContent = info.msg;
        gameoverModal.classList.remove("hidden");
    }

    document.addEventListener("DOMContentLoaded", init);
})();
