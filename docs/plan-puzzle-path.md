# Plan: Puzzle Path card (chess.com Puzzles hub)

Read AGENTS.md first. You MAY write evidence into `.rea/puzzle-path/`.

## 0. Capture evidence (read-only on the user's real account)
Debug Chrome on `localhost:9222` is logged into chess.com. **Never solve, start, or skip a puzzle on that account** — only load pages and read DOM/CSS/network.
- Open `https://www.chess.com/puzzles` (and `/puzzles/path` or whatever the card links to). The target is the left/hub card the user screenshotted: header "<level badge 15> Puzzles", coach avatar + speech bubble ("Doing Puzzles every day helps you choose safe moves in your own games."), an isometric brown/blue chequered path of numbered gold tiles (completed = green with check, current = pawn standing on it, upcoming = gold numbered), decorative props (globe, clocks, picture frame), clouds at the top, then points "31,039", streak flame "2", yellow progress bar with next level badge "16", a list-icon button and green "Solve Puzzles" button.
- Use REA (`rea inspect-web-page --include-script-sources`, `rea capture-web-screenshot`) + CDP network capture to get: image URLs (path background/tiles/props/badges are almost certainly CDN images or a sprite/canvas — find which), the level/points data source (API endpoint + JSON shape), coach tips list, CSS (sizes, fonts, colours, bar). Save findings to `.rea/puzzle-path/notes.md`.
- Hotlink all images from chess.com CDNs (never copy).

## 1. Build
- New component `app/src/components/PuzzlePathCard.tsx`, shown on `app/src/pages/Puzzles.tsx` hub/landing state (where the user picks a puzzle mode) and on Home's puzzle preview if layout allows — Puzzles page is required, Home optional.
- Data is local: derive from existing puzzle progress in `lib/storage.ts` / `lib/usePuzzle.ts` / `lib/streak.ts`:
  - points = cumulative puzzle points (add a stored counter if none exists: +N per solved puzzle, use chess.com's scheme if found in evidence, otherwise +10 first-try, +5 retry).
  - level & tiles: 20 tiles per level (as in screenshot) — current tile index = puzzles solved in level; level-up when the path is complete; badge shows level; bar = progress to next level.
  - streak = existing streak.
- Rendering: reproduce the isometric path. Prefer chess.com's own images positioned as in the capture. If the path is a canvas/Lottie/procedural, recreate with CSS (rotated chequer background, absolutely positioned tile images/divs at isometric coordinates) — must look close to the screenshot, including completed (green check), current (pawn), upcoming (gold numbered) tiles and the pawn bubble.
- Coach bubble rotates through tips (from capture; else 5 sensible ones).
- "Solve Puzzles" starts the normal rated puzzle flow; list button opens the modes/themes list (existing).
- Animate: on returning after solving, pawn hops to the next tile (CSS transition ~400ms) and bar fills.

## 2. Acceptance
1. Build passes, no new warnings.
2. Screenshot REA card next to chess.com's into `.rea/puzzle-path/compare/`; visually close.
3. Solving a puzzle in REA advances the tile/points (verify via CDP on dev server).
4. Do not commit. Final message: files, data source found, deviations.
