/**
 * board.js — Board rendering and click interaction.
 */

const PIECE_UNICODE = {
    wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
    bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const Board = (() => {
    const boardEl = document.getElementById("board");
    let squares = [];       // 64 DOM elements
    let onSquareClick = null;

    // Parse FEN rank string into 8 pieces (or null)
    function parseFen(fen) {
        const rows = fen.split(" ")[0].split("/");
        const board = [];
        for (const row of rows) {
            for (const ch of row) {
                if (ch >= "1" && ch <= "8") {
                    for (let i = 0; i < +ch; i++) board.push(null);
                } else {
                    const color = ch === ch.toUpperCase() ? "w" : "b";
                    board.push(color + ch.toLowerCase());
                }
            }
        }
        return board; // 64 entries
    }

    function render(fen) {
        const pieces = parseFen(fen);
        boardEl.innerHTML = "";
        squares = [];

        for (let i = 0; i < 64; i++) {
            const r = Math.floor(i / 8);
            const c = i % 8;
            const sq = document.createElement("div");
            sq.className = "square " + ((r + c) % 2 === 0 ? "light" : "dark");
            sq.dataset.square = String.fromCharCode(97 + c) + (8 - r); // e.g. "e4"
            if (pieces[i]) {
                sq.textContent = PIECE_UNICODE[pieces[i]];
                sq.classList.add(pieces[i][0] === "w" ? "wp" : "bp");
            }
            sq.addEventListener("click", () => {
                if (onSquareClick) onSquareClick(sq.dataset.square, pieces[i]);
            });
            boardEl.appendChild(sq);
            squares.push(sq);
        }
    }

    function getSquareEl(sq) {
        return squares.find(el => el.dataset.square === sq) || null;
    }

    function clearHighlights() {
        for (const s of squares) {
            s.classList.remove("selected", "legal", "legal-capture", "last-move", "check");
        }
    }

    function highlight(sq, cls) {
        const el = getSquareEl(sq);
        if (el) el.classList.add(cls);
    }

    function showThinking(show) {
        document.getElementById("thinking").classList.toggle("hidden", !show);
    }

    function setClickHandler(fn) { onSquareClick = fn; }

    return { render, clearHighlights, highlight, showThinking, setClickHandler, getSquareEl };
})();
