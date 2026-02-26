# Chess Bot MVP
![CI Pipeline](https://github.com/MortezaSaf12/chessbot/actions/workflows/ci.yml/badge.svg)

Ett schack-projekt byggt för att träna på att spela schack. Målet var att skapa en *schackmotor* (chess engine) i JavaScript som presterar väl upp till **Depth 6**, vilket är extremt utmanande i en webbläsare/Node-miljö.
## Funktioner (MVP)
Detta är den minimala, fungerande versionen av projektet:
* **Spelbar klient:** Ett elegant, mörkt GUI i webbläsaren för att spela mot motorn.
* **Schackmotor (Engine):** Egenutvecklad `getBestMove` med Negamax, Alpha-Beta pruning, Quiescence Search och Transposition Table (Zobrist Hashing).
* **Optimerad Evaluering:** Extremt snabb positionsbedömning via FEN-strängar utan minnesallokeringar (Klarar Depth 4 på under 2 sekunder).

## Utveckling & CI/CD
* Starta servern lokalt med `node server.js` (Körs lokalt på port 3000).
* Använd `npm test` för att köra alla automatiserade kontroller över motorlogik och routing.
* Projektet använder **GitHub Actions** för Continuous Integration. Varje push till `main` triggar en pipeline (`.github/workflows/ci.yml`) som automatiskt validerar att inga min-max prestandagränser bryts eller engine loop-buggar introduceras.

## Källor och Inspiration
* [Chessprogramming Wiki - Simplified Evaluation Function](https://www.chessprogramming.org/Simplified_Evaluation_Function)
* [The Real Greco]([https://www.chess.com/blog/the_real_greco/](https://www.chess.com/blog/the_real_greco/engines-navigating-the-tree-ab-pruning-minimax))
* Algoritmer: Minimax, Alpha-Beta pruning, Negamax.
