const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

let model = null;

if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini free tier as of 2026/02/18" });
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
    if (!model) return "";

    const prompt = `You are a chess commentator. The bot just played ${botMove} (move ${moveNum}). The position FEN is: ${fen}. Give a single short sentence (max 20 words) explaining why this move is good or what it does strategically. No preamble, just the sentence.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return text;
    } catch (err) {
        console.error("Gemini error:", err.message);
        return "";
    }
}

module.exports = { getCommentary };