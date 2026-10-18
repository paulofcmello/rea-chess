# Plan: Puzzles hub = chess.com /puzzles layout

Read AGENTS.md first. You MAY write evidence to `.rea/puzzle-path/hub/`.

User compared chess.com `/puzzles` with REA `#/puzzles` (Puzzle Path card from `docs/plan-puzzle-path.md` is already built: `components/PuzzlePathCard.tsx`, `lib/puzzlePath.ts`).

## chess.com behaviour (verify with debug Chrome on localhost:9222, logged in; read-only — never solve or start a puzzle on the account)
1. `/puzzles` landing: standard play layout — big board on the left (starting position, user's board/piece theme, coordinates, settings gear top-right of the board), and the Puzzle Path card as the RIGHT SIDEBAR (same width/height as other sidebars like Bots, full height of the board). No "Train your tactical vision" mode list.
2. Clicking the list button (bottom-left of the card) swaps the sidebar content to a list view (puzzle modes: Puzzles / Puzzle Rush / Puzzle Battle / Daily / Custom/Themes etc.). Capture this view: click the list button in the debug Chrome (UI only), screenshot + DOM/CSS, then capture how to return (back arrow / header). Save to `.rea/puzzle-path/hub/`.
3. "Solve Puzzles" opens the normal rated puzzle page (REA's existing puzzle solving flow).

## Build
- `app/src/pages/Puzzles.tsx` landing state: use the same `cc-layout` board + sidebar structure as Bots (board on left with a static start position via `Board`, sidebar on the right = `PuzzlePathCard` filling the sidebar height). Remove the "Train your tactical vision" list from the landing.
- List button: toggle the sidebar to the captured list view, mapping each item to REA routes (Puzzles → rated flow, Puzzle Rush `#/rush`, Daily `#/daily`, Themes `#/themes`, Endgames `#/endgames`; omit items REA doesn't have, e.g. Puzzle Battle). Back control returns to the path card. Match chess.com styling from the capture.
- Path rendering fixes visible in the user's REA screenshot vs chess.com:
  - The path must be framed around the CURRENT tile like chess.com: current tile + pawn in the middle, upcoming numbered gold tiles up to 20 above, completed green tiles below, blue chequered "next level" area top-right with tile "1", clouds under the coach bubble. REA currently shows only completed tiles with the upcoming ones scrolled off/hidden behind the bubble and a "13" cut off at the top.
  - Props (globe, clocks, frame, gramophone) must not cover tiles; keep chess.com placement relative to tile indices.
  - Card fits the sidebar height (scale the scene to available height, no cropping of the current/upcoming tiles).
- Mobile (≤760px): board on top, card below (like other pages); no horizontal scroll at 390px.

## Acceptance
1. `cd app && npx tsc -b && npm run build` passes, no new warnings.
2. Screenshots (REA vs chess.com: landing + list view) at 1440x900 in `.rea/puzzle-path/hub/compare/`, visually matching layout.
3. With stored progress at tile 7 of level 17 (set localStorage), the current tile + pawn and tiles 8–20 are visible.
4. Do not commit. Final message: files changed + deviations.
