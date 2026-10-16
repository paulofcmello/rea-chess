# REA Chess

Personal chess.com clone (puzzles + bots, no multiplayer yet). Vite + React + TS in `app/`. Deployed via GitHub Pages (`.github/workflows`, repo paulofcmello/rea-chess): changes go live only after commit + push to `main`.

## Run
`cd app && npm run dev` · `npx tsc -b && npm run build` to verify.

## Built with REA (Reverse Engineer Anything)
This project recreates chess.com by reverse-engineering it with **REA** (`npx rea-agents`, repo morluto/rea, clone at `~/rea`). Always use REA to get real values instead of guessing:
- Website: launch a debug Chrome (`--remote-debugging-port=9222`, isolated profile), then `rea inspect-web-page --include-script-sources`, `rea export-web-scripts`, `rea capture-web-screenshot`, plus CDP network capture for API data (e.g. bot roster from `BotGroupService/ListBotGroups`).
- Evidence so far lives in `.rea/` (exported chess.com scripts, CSS, screenshots).
- Logged-in features (bot chat phrases, puzzle rating box, streak UI, Puzzle Path): the user logs into chess.com themselves in the debug Chrome profile (never enter credentials for them), then capture with REA.
- Alternative source: chess.com's iPad app on Mac (App Store); REA can analyze the app bundle/binary and extract bundled assets.

## Key facts
- chess.com assets (pieces/boards/sounds/fonts/coach/bot images) are hotlinked at runtime, never copied; personal use only.
- Board engine mirrors chess.com: `app/src/components/Board.tsx` (slides, drag hover, arrows, premoves, effects, result badges).
- Puzzles flow: `app/src/lib/usePuzzle.ts`; sidebar UI: `components/PuzzleSidebar.tsx`, `pages/puzzleUi.tsx`.
- Bots: roster `app/public/data/bots.json` (from chess.com ListBotGroups), strength in `lib/bots.ts` (Stockfish 19 WASM, `lib/engine.ts`), page `pages/Bots.tsx`.
- Progress in localStorage via `lib/storage.ts` (`useStored`, `updateStored`); streaks in `lib/streak.ts`.
- Testing UI: debug Chrome with `--remote-debugging-port=9222` + a small CDP script (bring tab to front before synthetic input).

## Roadmap (do one per session)
1. ~~Bots page restyle~~ (done)
2. Fix 3D piece sets (chess.com "pseudo3d" taller pieces render wrong)
3. Game Review (move classifications, accuracy, eval graph; local Stockfish)
4. Online play with friends (PeerJS P2P or Supabase Realtime)
Other gaps: puzzle punish-move arrow, time-bonus rating, Puzzle Path, figurine move list, stats page.

## Working style
User is token-conscious: be concise, ask before big steps, commit + push when a step is done (only if asked).
