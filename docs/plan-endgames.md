# Plan: Train Endgames (chess.com /endgames)

Read AGENTS.md first. You MAY write evidence into `.rea/endgames/`.

## 0. Capture evidence
Debug Chrome on `localhost:9222` is logged into chess.com. Read-only: browsing is fine, but do not complete drills on the account (opening one to read its structure/positions is OK; do not make moves).
- Open `https://www.chess.com/endgames` and follow its structure: categories/themes list, each endgame's page, drill/practice screen, progress UI, difficulty, "Practice"/"Challenge" modes if present, completion badges.
- REA: `rea inspect-web-page --include-script-sources`, `rea export-web-scripts`, `rea capture-web-screenshot`; CDP network capture for the API that returns the endgame catalogue + positions (FENs, goals like "Win"/"Draw", move limits). Save the raw JSON to `.rea/endgames/` and write `.rea/endgames/notes.md` (endpoints, data shape, layout measurements, image URLs).
- If the full catalogue is accessible from the API, extract it to `app/public/data/endgames.json` (FENs, names, categories, goals, ordering). This is data, not assets — OK to store. Images stay hotlinked.

## 1. Build
- Route `#/endgames` (add to App.tsx routes + left nav under Puzzles/Learn like chess.com, with chess.com's endgame icon hotlinked).
- `app/src/pages/Endgames.tsx`: landing page matching chess.com (categories, cards, progress per category).
- Drill screen reusing the standard layout (`cc-layout`, `Board`, sidebar like Bots/Puzzles): user plays the given side vs Stockfish (`lib/engine.ts`, full strength, or a tablebase-quality defence: use the existing engine at high depth). Goal checks: "Win" = checkmate (or promotion into a won position if chess.com accepts that) within the move limit if any; "Draw" = reach a draw (stalemate/repetition/insufficient material/50 move). Success/fail feedback using existing effects + coach bubble, Retry / Next / hint (engine best arrow) / takeback as chess.com allows.
- Progress persisted with `useStored` (`endgames` key): completed, best attempts, per-category %.
- Mobile layout works (no horizontal scroll at 390px).

## 2. Acceptance
1. Build passes, no new warnings.
2. Comparison screenshots in `.rea/endgames/compare/`.
3. Via CDP on the dev server: open an easy endgame (e.g. K+Q vs K), play engine-best moves for the user side until mate, see success + progress saved.
4. Do not commit. Final message: files, data source, deviations.
