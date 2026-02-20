const { Chess } = require("chess.js");
const { getBestMove } = require("./engine/bot");

const game = new Chess();
const start = performance.now();
const bestMove = getBestMove(game, 4, 15000);
const end = performance.now();

console.log(`Depth 4 took ${(end - start).toFixed(2)}ms`);
console.log(`Best move:`, bestMove);
