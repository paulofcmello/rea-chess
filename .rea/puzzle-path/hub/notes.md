# Puzzles hub evidence

Captured chess.com `/puzzles` through the existing debug Chrome on localhost:9222. Only landing UI, the expanded menu, its close control, DOM, and computed styles were inspected. No chess.com puzzle was started or solved.

## Reference and implementation

- `compare/chesscom-landing.png` and `compare/chesscom-list.png`: reference at 1440×900, device scale 1.
- `compare/rea-landing.png` and `compare/rea-list.png`: implemented hub at the same viewport.
- `compare/rea-mobile.png`: complete page at 390px wide.
- `compare/rea-tile7.png`: Pass 2 framing at level 17, current tile 7.
- `chesscom-list-dom.json`: scoped menu/header DOM and return control. `chesscom-list-styles.json`: measured styles and dimensions. `chesscom-return.json`: closed-menu state.
- The list button opens a bottom-aligned dark menu over the path with a close button, 24px side padding, 8px gaps and 64px mode buttons. REA maps Solve Puzzles to the existing rated flow, Daily Puzzle to `#/daily`, Puzzle Rush to `#/rush`, Themes to `#/themes`, and Endgames to `#/endgames`. Unsupported Puzzle Battle is omitted.
- The path uses its existing hotlinked artwork. Pass 2 replaces full-level fitting with the focused camera described below. Props remain anchored to path indices in the side margins. Clouds stay under the coach. The blue next-level region and tile 1 move with the path.
- User board, piece, coordinate and reduced-motion settings continue through the existing Board and CSS settings infrastructure.

## Pass 1 verification (historical)

`verification.json` records browser assertions: the desktop geometry, all 20 tiles within the path viewport, loaded CDN images, menu routes/focus/Escape, rated-flow entry and Back, actual mode-link navigation, and responsive layouts at 390, 760 and 900px. No horizontal document overflow at those widths.

The screenshot fixture is `rea-chess:puzzlePath = { solved: 326, points: 31039 }`: level 17, six completed puzzles and current tile 7. The prior storage value was restored after capture. No local puzzle was solved by these checks.

`npx tsc -b` and `npm run build` passed without warnings. Whole-app lint diagnostics are identical to the pre-task baseline after normalizing shifted line numbers/order. Existing Move Explanations files and the Review CSS section were checked against pre-task hashes/content and remain unchanged.

## Plan correction

The plan describes the sidebar as the board's height, but the actual 1440×900 reference has a 728px board and an 868px sidebar. The implementation follows the captured dimensions using the existing `cc-layout` and `cc-sidebar` sizing. It also retains the existing 1000px stacking breakpoint, including the required board-above-card layout at ≤760px.

All changes are uncommitted. No dependencies were added.

## Pass 2: path zoom

- Tile artwork is 70px at the 300px desktop sidebar width; numbered tiles use 28px text. The pawn shares the tile scale. Props are 126px wide and sit beside the appropriate path bends (frame at tile 9, gramophone at tile 5, globe at tile 17, clocks at tile 13).
- The path has fixed 32px vertical steps, scaled with sidebar width. The camera places the current tile at 52% of the scene (about 54% of the card). Background checks, next-level area, props and tiles follow the same camera. The card remains 868px high at 1440×900.
- The focused camera deliberately clips distant tiles instead of fitting the entire 1–20 path. This follows Pass 2 and supersedes the full-level visibility assertion from Pass 1. At tile 15 the visible window includes completed tiles 9–14 and upcoming tiles 16–20. The level 17/tile 7 fixture is captured separately in `compare/rea-tile7.png`.
- The primary landing/list comparisons now use level 15, current tile 15 (`solved: 294`) to match the reference's progress. The mobile capture uses level 17, current tile 7. The original local progress (`solved: 24, points: 720`) was restored after capture.
- `path-zoom-verification.json` records current-tile framing at tiles 1, 7, 15, 20 and the next level, loaded artwork, no horizontal overflow at 390px, menu opening and Escape/focus restoration, and zero runtime exceptions.
- `npx tsc -b`, `npm run build`, and targeted component lint passed without warnings. No chess.com puzzle was started or solved; the reference menu was closed after capture.
