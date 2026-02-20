# Chess Bot MVP

Ett schack-projekt byggt för att träna på att spela schack och utvecklas inom AI-programmering. Målet var att skapa en *schackmotor* (chess engine) i JavaScript som presterar väl upp till **Depth 6** (vilket är extremt utmanande i en webbläsare/Node-miljö), samt integrera med Google Gemini 2.0 Flash för att få LLM-genererade kommentarer till dragen.

## Funktioner (MVP)
Detta är den minimala, fungerande versionen av projektet:
* **Spelbar klient:** Ett elegant, mörkt GUI i webbläsaren för att spela mot motorn.
* **Schackmotor (Engine):** Egenutvecklad `getBestMove` med Negamax, Alpha-Beta pruning, Quiescence Search och Transposition Table (Zobrist Hashing).
* **Optimerad Evaluering:** Extremt snabb positionsbedömning via FEN-strängar utan minnesallokeringar (Klarar Depth 4 på under 2 sekunder).
* **LLM Integration:** Ger korta strategiska dragkommentarer via Gemini.

## Utveckling
* Inställningar och API-nyckel (`GEMINI_API_KEY`) konfigureras i en `.env` fil.
* Starta servern med `node server.js` (Körs lokalt på port 3000).

## Källor och Inspiration
* [Chessprogramming Wiki - Simplified Evaluation Function](https://www.chessprogramming.org/Simplified_Evaluation_Function)
* [The Real Greco](https://www.chess.com/blog/the_real_greco/)
* Algoritmer: Minimax, Alpha-Beta pruning, Negamax.
