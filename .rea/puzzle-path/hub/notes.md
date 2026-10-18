# Puzzles hub evidence

Captured chess.com `/puzzles` through the existing debug Chrome on localhost:9222. Only landing UI, the expanded menu, its close control, DOM, and computed styles were inspected. No chess.com puzzle was started or solved.

## Reference and implementation

- `compare/chesscom-landing.png` and `compare/chesscom-list.png`: reference at 1440×900, device scale 1.
- `compare/rea-landing.png` and `compare/rea-list.png`: implemented hub at the same viewport.
- `compare/rea-mobile.png`: complete page at 390px wide.
- `chesscom-list-dom.json`: scoped menu/header DOM and return control. `chesscom-list-styles.json`: measured styles and dimensions. `chesscom-return.json`: closed-menu state.
- The list button opens a bottom-aligned dark menu over the path with a close button, 24px side padding, 8px gaps and 64px mode buttons. REA maps Solve Puzzles to the existing rated flow, Daily Puzzle to `#/daily`, Puzzle Rush to `#/rush`, Themes to `#/themes`, and Endgames to `#/endgames`. Unsupported Puzzle Battle is omitted.
- The path uses its existing hotlinked artwork. Coordinates are framed around current progress and fitted to the scene height; all 20 tiles fit, including current tile 7 and upcoming tiles 8–20. Props remain anchored to path indices in the side margins. Clouds stay under the coach without covering upcoming tiles. A blue next-level region includes tile 1.
- User board, piece, coordinate and reduced-motion settings continue through the existing Board and CSS settings infrastructure.

## Verification

`verification.json` records browser assertions: the desktop geometry, all 20 tiles within the path viewport, loaded CDN images, menu routes/focus/Escape, rated-flow entry and Back, actual mode-link navigation, and responsive layouts at 390, 760 and 900px. No horizontal document overflow at those widths.

The screenshot fixture is `rea-chess:puzzlePath = { solved: 326, points: 31039 }`: level 17, six completed puzzles and current tile 7. The prior storage value was restored after capture. No local puzzle was solved by these checks.

`npx tsc -b` and `npm run build` passed without warnings. Whole-app lint diagnostics are identical to the pre-task baseline after normalizing shifted line numbers/order. Existing Move Explanations files and the Review CSS section were checked against pre-task hashes/content and remain unchanged.

## Plan correction

The plan describes the sidebar as the board's height, but the actual 1440×900 reference has a 728px board and an 868px sidebar. The implementation follows the captured dimensions using the existing `cc-layout` and `cc-sidebar` sizing. It also retains the existing 1000px stacking breakpoint, including the required board-above-card layout at ≤760px.

All changes are uncommitted. No dependencies were added.
