# Endgames implementation evidence

Captured 2026-10-18 from the logged-in debug Chrome at localhost:9222. Chess.com navigation and read-only GET requests only; no moves or completed drills on the Chess.com account. All playthroughs are on localhost:5179.

## Sources and shape

- Catalogue: `https://www.chess.com/endgames`, `window.chesscom.endgames.navigation.categories` (saved in `bootstrap.json`). Six categories, 29 themes, 145 drills.
- Positions: `GET https://www.chess.com/callback/endgames/theme/{theme UUID}`. Each of the 29 `{theme-slug}.json` files is an unmodified response.
- Theme response: `{id, category, sortOrder, url, name, description, drills}`. Each drill has `{id, sortOrder, fen, alternativeFens, goal, isPremium, isLocked, skillLevel, relatedLinks}`. Goals: 120 Win and 25 Draw. Difficulties: Beginner, Intermediate, Advanced. No move limits were present.
- Script inspected via CDP: `https://www.chess.com/bundles/app/vite/endgames.DvN3FvGFv9.js`. Its goal check also accepts a win for a Draw goal. Its read-only theme request supplies the full catalogue, including the FENs of positions shown as locked in the reference UI. No account results endpoint was called.
- Local catalogue: `app/public/data/endgames.json`. All 145 original drills and their ordering are preserved, with 868 valid primary/alternative FENs.

## Reference UI

The landing screen uses the standard board, Maximum (3200), player row, and a right sidebar. Categories: Checkmates, Pawn, Minor Piece, Rook, Queen, Imbalances. A category opens its themes; a theme opens Challenge/Practice/Learn. Practice has five numbered position boxes, a 120px board preview, goal, difficulty, and Practice button. Active Practice offers hint, new position, move navigation, and reset. Challenge runs through all five positions and tracks a personal time. The implementation supplies local Practice and Challenge, saved completion, attempt counts, best move counts/times, and per-category percentages. No backend-dependent global leaderboard is presented.

`layout.json` records measured CSS pixels: reference sidebar 313px wide at the original viewport; position buttons 40×40 with 8px gaps; preview 120×120. The implementation follows the existing app's 300px `cc-sidebar` layout and visual tokens, with 36px position boxes to fit its narrower content area. At 390px the board and sidebar stack; the catalogue, theme, and drill all have `scrollWidth === innerWidth`.

Image URLs remain hotlinked:

- `https://www.chess.com/bundles/web/images/color-icons/game-endgames.svg`
- `https://www.chess.com/bundles/web/images/color-icons/checkmate-light.svg`
- `https://www.chess.com/bundles/web/images/color-icons/piece-white-pawn.svg`
- `https://www.chess.com/bundles/web/images/color-icons/piece-white-bishop.svg`
- `https://www.chess.com/bundles/web/images/color-icons/piece-white-rook.svg`
- `https://www.chess.com/bundles/web/images/color-icons/piece-white-queen.svg`
- `https://www.chess.com/bundles/web/images/color-icons/imbalance-light.svg`

Board, pieces, coach, and sounds reuse the app's existing CDN integrations. `compare/` contains reference/implementation screenshots of the landing, category, theme and drill, plus implementation success, Challenge, and mobile screens. Matching desktop captures use a 1440×1000 viewport, device scale factor 1.

## Validation

- Required `cd app && npx tsc -b && npm run build`: passes without warnings.
- Oxlint: no diagnostics in the added files or changed App.tsx.
- `node docs/evidence/endgames/verify-outcomes.mjs`: validates all 868 FENs and covers mate/loss, stalemate, repetition, insufficient material, 50-move draw, optional move-limit boundary, and completion percentage.
- `queen-mate-playthrough.json`: real board clicks using Stockfish-best user moves, `Kf6 Kf8 Qf7#`; success effect/coach and persisted completion verified, including after reload.
- `hook-checks.json`: eight passing browser checks for hint arrow, failed Win on stalemate, takeback from failure, mate, Draw after capture, engine reply, two-ply takeback, and cancellation of a pending engine reply.
- Defence and hints use the existing Stockfish engine at depth 20, with full-strength defence. Win goals require actual checkmate; promotions continue into the resulting position. Draw goals accept the chess.js draw rules or a win, as the reference does.

- `challenge-playthrough.json`: all five Queen Mate positions completed through real board clicks, including the promotion chooser. Retry resets the run; the final completion saves a local best time and Done returns to the theme with that record. Mobile theme verified at 390px without overflow.

## Deviations and data correction

- Evidence is under `docs/evidence/endgames/` instead of `.rea/endgames/` because AGENTS.md prohibits touching `.rea/`.
- `npx --no-install rea-agents --help` failed with EPERM in the user's npm cache. Used the plan's CDP fallback for inspection, script retrieval, network responses, screenshots, and browser checks; no dependency was installed.
- The API contains one malformed alternative FEN for Advanced Queen Endings drill `650749f0-716e-11eb-a8fe-6b7f3b426219`: `k6/2p2q2/1p1p4/p2p4/P7/1PQ3P1/1KP4P/8 w - - 0 1` has only seven squares in its first rank. Omitted that single alternative from the app catalogue rather than guessing a position; the unmodified response remains in `advanced-queen-endings.json`. All primary positions are valid and retained.
