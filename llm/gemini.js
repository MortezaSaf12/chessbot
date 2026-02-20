const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

let model = null;

if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

/**
 * Get a short commentary on the bot's move from Gemini.
 *
 * @param {string} fen     - FEN after the bot's move
 * @param {string} botMove - Bot's move in SAN
 * @param {string} moveNum - Full move number
 * @returns {Promise<string>}
 */
async function getCommentary(fen, botMove, moveNum) {
    if (!model) return "Tip: Control the center and develop your pieces! (Add GEMINI_API_KEY to .env for AI)";

    const prompt = `You are a chess coach and guide. The bot just played ${botMove} (move ${moveNum}). The new position FEN is: ${fen}.
Give a single short sentence (max 20 words) giving the human player a strategic hint or guiding them on what they should focus their resources on next. Keep it encouraging but educational. No preamble, just the sentence.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return text;
    } catch (err) {
        console.error("Gemini error:", err.message);
        if (err.message.includes("429") || err.message.includes("quota")) {
            return "Tip: Control the center and your pawn structure!";
        }
        return "Tip: Keep your king safe. (AI unavailable: check API key)";
    }
}

module.exports = { getCommentary };