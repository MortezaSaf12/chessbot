/**
 * api.js — Thin fetch wrapper for the chess server API.
 */

const API = {
    async newGame() {
        const res = await fetch("/api/new-game", { method: "POST" });
        return res.json();
    },

    async makeMove(move) {
        const res = await fetch("/api/move", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ move }),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Invalid move");
        }
        return res.json();
    },

    async setDifficulty(depth) {
        const res = await fetch("/api/difficulty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ depth }),
        });
        return res.json();
    },

    async getState() {
        const res = await fetch("/api/state");
        return res.json();
    },
};
