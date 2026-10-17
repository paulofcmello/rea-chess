# Plan: polish batch 1

Six independent items. Do them in order; keep each self-contained. Read AGENTS.md first.

## A. Figurine notation in every move list (chess.com style)
chess.com renders the piece letter of SAN as a glyph from its icon font **Chess V3** (CORS `*`, hotlink OK):
```css
@font-face { font-family: 'Chess V3'; font-display: block; src: url(https://www.chess.com/bundles/web/fonts/chessglyph-v3/chessglyph-v3.3e78f81f.woff2) format('woff2'); }
.figurine { font-family: 'Chess V3'; font-size: 22px; line-height: 20px; margin: 0 2px 2px; font-weight: 400; } /* chess.com values */
```
Dark-mode move-list characters (captured from chess.com CSS):
```
king  white "Ā" black "Ą"   queen  white "Į" black "Ķ"   rook   white "Ľ" black "Ļ"
bishop white "Ă" black "Ä"  knight white "Ç" black "Ė"
```
- Add `export function SanText({ san, color }: { san: string; color: 'w' | 'b' })` to `app/src/components/ui.tsx`: if SAN starts with K/Q/R/B/N, render `<span className="figurine">{char}</span>` + rest of SAN; promotions (`e8=Q`) render the promoted piece as figurine too. Pawn moves unchanged.
- Use it in `MoveList` (`ui.tsx`) and in the Game Review move list (`app/src/pages/Review.tsx`, `ReviewMoves`), and in the Review coach title ("♗c4 is excellent" → figurine + `c4 is excellent`).

## B. Review for bot games
`app/src/pages/Bots.tsx` has `const review = () => openInAnalysis(START, sans, ...)`. Make it open **Game Review** instead.
- In `Review.tsx`, add a generic `export function openReview(input: ReviewInput)` where `ReviewInput = { pgn: string; url?: string; white: { username: string; rating?: number; avatar?: string }; black: {...}; me: string }`; make the existing `openInReview(game, me)` call it. Review must work without `url` (cache key = hash of pgn) and without ECOUrl (bookPlies 0 is fine).
- Bots: build the PGN with chess.js (`new Chess()`, play `sans`, `setHeader` White/Black/Result/Date), players: user = `{ username: 'You' }`, bot = `{ username: bot.name, rating: bot.rating, avatar: bot.image }`.
- Wherever the bot game-over screen offers "Analysis"/"Review", label it **Game Review** (chess.com wording).

## C. Real avatars
- `app/src/lib/ccGames.ts`: `export function fetchAvatar(username): Promise<string | null>` → `GET https://api.chess.com/pub/player/{lowercase}` → `.avatar` (may be absent → null). Cache: in-memory Map + localStorage `avatar:<user>` (no expiry needed).
- Review: player bars (top/bottom) and the summary "Players" tiles show the avatar (input.avatar if given, else fetchAvatar), fallback = current pawn image.
- My Games rows: small 24px avatar before each opponent name is NOT needed (keep rows light).

## D. My Games time-class icons
Currently they 404 and fall back to text. chess.com shows these as glyphs from the same **Chess V3** font. grep `.rea/css` and `.rea/review/review-all.css` for `.icon-font-chess.(bullet|blitz|rapid|daily)` (or `game-time-*`) `:before{content:...}` and render `<span className="figurine games-time-glyph">` with that char; colors as chess.com (bullet `#e3aa24`, blitz `#f7c631`, rapid `#81b64c`, daily `#f7c045` — use the CSS colors you find if present). If no rule is found, keep the text fallback.

## E. Clocks in Game Review
chess.com PGNs contain `{[%clk 0:04:59.9]}` after each move. Parse them in `gameToAnalysis`/review input (array `clocks: string[]` per ply, e.g. "4:59"). Review player bars show the clock of that player at the current ply (chess.com style dark clock box on the right of the player bar: white player's clock box light bg `#fff`/dark text when it was their move, otherwise `#262421` with grey text — match `.rea/review/summary.png`). Hide clocks if the PGN has none (bot games).

## F. Stats page
New route `stats: { label: 'Stats', icon: 'chart-line'... }` — find a chess.com color-icon that exists (`curl -sI https://assets-ds.chess.com/color-icons/<name>.svg`; try `stats`, `chart`, `graph`, `trophy`, else reuse `binoculars`). Uses the stored `ccUsername` (same `useStored('ccUsername','')` as My Games; if empty, show a link to My Games to set it).
- `GET https://api.chess.com/pub/player/{u}/stats` → `chess_bullet|chess_blitz|chess_rapid|chess_daily` each `{ last: { rating }, best: { rating }, record: { win, loss, draw } }`. Show a card per time class: glyph/label, current rating (big), best rating, W/L/D with a thin tri-color bar (win `#81b64c`, draw `#8b8987`, loss `#fa412d`).
- Rating graph: from the last 6 archives (reuse `fetchArchives`/`fetchMonth`), per selected time class (tabs), the user's rating after each game, plotted as an SVG line (green `#81b64c`, light grid, x = game index, y labels min/max). Use chess.com dark card style consistent with My Games.
- Recent results row: last 10 games as small W/L/D squares (click → Game Review via `openInReview`).

## Acceptance
1. `cd app && npx tsc -b && npm run build` passes, no new warnings.
2. Node check (temp, delete): `SanText` char mapping for `Nf3` (white) → "Ç", `Qxd8+` (black) → "Ķ"; clock parsing of a real PGN from `https://api.chess.com/pub/player/paulom18/games/2026/10` returns one clock per ply.
3. Do not commit. Final message: files changed + deviations.
