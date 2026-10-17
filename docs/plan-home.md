# Plan: Home page = chess.com logged-in home

Replace `app/src/pages/Home.tsx` (route `''`) with a replica of chess.com's logged-in home. Read AGENTS.md first.

## Evidence (REA capture of chess.com/home, logged in as PauloM18)
- `.rea/home/home-full.png` — full page screenshot (scaled 0.6). **Match this layout.**
- `.rea/home/home.html` (body DOM, paths stripped) and `.rea/home/home.css` (relevant CSS rules) — class names like `game-history-games-*`, `cc-section`, `cc-aside-header-*`, `recommended-activity-*`, `game-preview-*`. Use for sizes, paddings, fonts, colors.
- `.rea/home/glyphs.json` — `{ glyphName: { svg, color } }`: exact chess.com inline SVG icons (`game-time-blitz|bullet|rapid|daily`, `game-type-puzzle`, `game-lesson`, `board`, `element-fire-blank`, `square-fill-plus`, `square-fill-minus`, `circle-fill-star`, `arrow-chevron-right`, `hand-pawn`, …). Paths use `currentColor`.
  Glyph colors on chess.com: bullet `#E3AA24`, blitz `#FAD541`, rapid `#81B64C`, daily `#F7C045`, streak fire `#FFA459`, win plus `#81B64C`, loss minus `#FA412D`, others `rgba(255,255,255,.5)`.

Create `app/src/components/glyphs.tsx` (exists already — extend it) with `export function CcGlyph({ name, size = 24, color })` built from glyphs.json (embed only the glyphs you use as a TS map; don't import the JSON at runtime). Also use these glyphs in My Games (`Games.tsx`) for the time-class icon instead of the current text/img fallback.

## Layout (desktop; collapse to one column under ~900px, 16px gutters at 360px)
Max content width ~1100px, two columns: main (~65%) + right rail (~30%), gap 16px, dark sections `cc-section` style (`#262421`-ish bg, radius 5px — take exact values from home.css).

**Header row:** avatar (chess.com avatar via `fetchAvatar(ccUsername)` from `app/src/lib/ccGames.ts` if a username is set, else pawn) + username (or "Guest") + flag (skip if unknown) on the left; on the right fire glyph + "**N Days**" = current puzzle streak (`useStreak()` from `app/src/lib/streak.ts`).

**Hero section** (one `cc-section`, 4 columns like the screenshot):
1. **Play** column: big green "Start Game" (`cc-button-primary`, like Play Bots) → `#/bots`; then secondary buttons with icons: "Play Bots" → `#/bots`, "Play a Friend" → `#/friend` (route will be added later; link anyway), "Puzzle Rush" → `#/rush`. Omit the chess.com time-control chips (bots have no clocks).
2. **Puzzles card**: static mini board preview (see Board preview below) of the next puzzle position for the user's rating (`loadPuzzles` + `pickPuzzle` from `app/src/lib/puzzles.ts`, or the first unsolved), under it the puzzle-rating row (rating + streak fire count as in screenshot, orange progress bar = today's solved count / 10) and secondary button "Solve Puzzles" → `#/puzzles`.
3. **Themes card** (chess.com "Next Lesson" slot): preview of a themed puzzle, title = a theme label from `themeLabels`, button "Practice Theme" → `#/themes`.
4. **Last game card**: preview of the final position of the user's most recent chess.com game (via `fetchArchives`/`fetchMonth` when ccUsername set), avatar + "vs <opponent>", button "Review Game" → `openInReview(game, username)` (from `app/src/pages/Review.tsx`). If no username: card says "Import your games" → `#/games`.

**Game History section** (main column, below hero): header "Game History"; columns exactly like chess.com: time icon + label ("5 min") · players (two stacked lines: 24px avatar optional, small white/black square, username (rating)) · result (stacked 1/0 digits + plus/minus square glyph) · Accuracy (stacked two numbers if a cached review exists — read via the review cache in `app/src/lib/reviewCache.ts`; otherwise a small secondary "Review" button) · Moves (full moves count) · Date ("Oct 15, 2026"). Last 10 games. Row click → Game Review. Footer link "View All Games ›" → `#/games`. No username → empty state with username form identical to My Games (reuse logic).

**Right rail:**
- **Daily Puzzle** card: title "Daily Puzzle", board preview of today's daily puzzle (`dailyPuzzle` from puzzles.ts), its theme/title line, green "Solve Daily Puzzle" → `#/daily` (show "Solved ✓" state if already solved today — see `dailyLog` in Daily.tsx).
- **Streak** card: fire glyph + "N Day Streak", last 5 weekday letters with green check squares for days with a solve (from `app/src/lib/streak.ts` solve log).
- **Stats** card ("Stats ›" → `#/stats`): rows with glyph + label + value: Puzzles solved (count from `puzzleHistory`), Puzzle rating (`puzzleRating`), Bots beaten (`botRecords` wins), and if ccUsername set, Rapid / Blitz / Bullet / Daily ratings from `https://api.chess.com/pub/player/{u}/stats` (`chess_*.last.rating`, '-' if absent; reuse the stats fetch from the Stats page if one exists in lib).

Skip: ads, Friends, ChessTV, Recommended Match, footer.

## Board preview
`export function BoardPreview({ fen, orientation = 'white' })` (in `app/src/components/BoardPreview.tsx`): square, CSS background = user's board image (`boardUrl(settings.board)` from `app/src/lib/theme.ts`, `useSettings` from storage.ts) and absolutely positioned piece `<img>`s (`pieceUrl(code, settings.pieceSet, 150)`) at `left: file*12.5%`, `bottom: rank*12.5%` — same technique as chess.com's `game-preview-lazy-piece`. Non-interactive, lazy images.

## Acceptance
1. `cd app && npx tsc -b && npm run build` passes, no new warnings.
2. Page renders with and without `rea-chess:ccUsername` in localStorage (no crash, sensible empty states).
3. Do not commit. Final message: files changed + deviations.
