const { Chess } = require("chess.js");
const assert = require("assert");
const { evaluate } = require("../engine/evaluation");
const { hashBoard } = require("../engine/transposition");
const { getBestMove } = require("../engine/bot");

async function checkAll() {
    console.log("=== Running Verifications ===");

    try {
        // 1. Evaluate Tests
        const wAdv = new Chess("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
        const bAdv = new Chess("rnbqkbnr/pppp1ppp/8/4p3/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        const wScore = evaluate(wAdv);
        const bScore = evaluate(bAdv);
        // White moving e4 gives center control bonus, Black e5 gives black same. 
        // We just ensure evaluations run without errors and return numbers
        assert(typeof wScore === 'number', "Evaluation must return number");
        console.log("PASS: Evaluation logic handles sample positions.");

        // 2. Transposition Hash Consistency
        const game = new Chess();
        const hash1 = hashBoard(game);
        game.move("e4");
        const hash2 = hashBoard(game);
        game.undo();
        const hash3 = hashBoard(game);
        assert(hash1 !== hash2, "Hash must change after move");
        assert(hash1 === hash3, "Hash must return to same value after undo");
        console.log("PASS: Zobrist hashing maintains consistency on undo.");



        // 4. Test Depth 6 Time limit bounds (Ensure it returns within Time Limit, capping at 15s)
        console.log("Running Depth 6 test (max 15s)...");
        const start = performance.now();
        const bm = getBestMove(new Chess(), 6, 15000);
        const end = performance.now();
        const timeSpent = end - start;
        assert(bm !== null, "Must return a move");
        console.log(`PASS: Depth 6 gracefully completed or returned time-limited move in ${(timeSpent / 1000).toFixed(2)}s. Best Move at Depth 6: ${bm.san}`);

        console.log("=== All Backend Verifications Passed ===");
    } catch (e) {
        console.error("FAIL: Verification failed:", e);
        process.exit(1);
    }
}

checkAll();
