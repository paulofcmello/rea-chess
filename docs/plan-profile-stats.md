# Plan: chess.com profile Stats table on `#/stats`

Add chess.com's **profile Stats tab** (`chess.com/member/<user>/stats`, free/non-upgraded view) to the top of the existing Stats page. The existing Insights dashboard stays below it unchanged.

Evidence (captured 2026-10-22, logged out, user PauloM18) is in `.rea/profile-stats/`:
- `overview-90d.png`, `overview-more.png`: screenshots
- `overview-more.txt`: table text with "Show More Stats" expanded
- `dom.json`: row HTML plus computed styles
- `network.json`: real `StatsService/GetAllStats` and `callback/member/stats` responses

Chess.com's internal endpoints are blocked by CORS for us. Use only `https://api.chess.com/pub/...`, which works from the browser.

## UI (match chess.com exactly)

1. **Filter bar**: one dark card, 64px tall, with two dropdown buttons (`.stats-dropdown-button`, padding `0 12px 0 16px`) split by a divider. The right part of the bar stays empty.
   - Left button: icon `https://assets-ds.chess.com/color-icons/rating-stats.svg` (32px), label in large bold, and a chevron-down.
     - Options: `All Stats, Rapid, Blitz, Bullet, Daily, Puzzles, Tournaments`.
     - Choosing one type shows only that row.
     - Choosing a game type (Rapid, Blitz, Bullet, Daily) also sets the Insights `timeClass` filter below it.
   - Right button: icon `https://assets-ds.chess.com/color-icons/calendar-month.svg`.
     - Options: `7 days, 30 days, 90 days, 1 year, All time`. Default `90 days`.
   - Each dropdown is a small menu in chess.com style. Close it on outside click and on Esc.
2. **Card "Stats"**: a header row with "Stats" in bold, then a table:
   - Header cells: `Type | Rating | Change | Games | Percentile | (chevron column)`. Style: 600 14px, `rgba(255,255,255,.72)`, background `rgba(0,0,0,.14)`, padding `16px 32px 16px 24px`. Type is left-aligned; the numeric columns are right-aligned.
   - Body rows: 74px tall, cell padding `16px 32px` (`16px 32px 16px 24px` for the first cell).
     - Type cell: 32px icon `https://assets-ds.chess.com/color-icons/time-<rapid|blitz|daily|bullet>.svg` (Puzzles: `.../color-icons/puzzle.svg`; check it loads, otherwise reuse the app's puzzle icon). Then the name in heading-xx-small bold.
     - Rating: bold white.
     - Change: green `delta-positive` with an up-arrow glyph plus the absolute value. Negative: red with a down arrow (chess.com shows `↓ 25` for −25). Zero or unknown: `-`.
     - Games and Percentile: `rgba(255,255,255,.72)`.
     - The chevron-right sits at the far right.
   - Default rows: Rapid, Blitz, Daily, Bullet.
   - A centred "Show More Stats" / "Show Less Stats" text link adds Puzzles and "Tournaments (Daily)". Tournaments is a row with no values, as on chess.com.
   - Clicking a row (or its chevron) for a game type sets the Insights time-class filter and scrolls to the Insights header. For Puzzles it goes to `#/puzzles`.
3. Responsive: at 390px wide, hide the Percentile column and keep the table inside the card with no horizontal page scroll.

## Data

Use `ccUsername` (already in `Stats.tsx`). If there's no username, show the card with a "Import your games in My Games" link instead of the rows.

- **Rating**: `fetchStats(username)` → `chess_<tc>.last.rating`. Show `?` when `last.rd >= 300` (provisional; matches chess.com's Daily `?` with rd 350) or when the time class is missing.
- **Games** (in period): count the user's games of that time class with `end_time` inside the window. Load the months covering the window with the existing `fetchArchives` + `fetchMonth` (cached). Only rated games count, and only `rules === 'chess'` (chess.com counts standard games only).
  - For All time: `record.win + loss + draw`.
- **Change**: rating at the user's latest game in the window minus the user's rating after the last game before the window. If no game exists before the window, use the first in-window game's rating. No games in the window → `-`.
  - For All time: current minus the earliest rating found in the first archive month.
- **Percentile**: not available from the public API, so always `-`.
- **Puzzles row** (REA's own puzzles): rating = local `puzzleRating`; games = `puzzleHistory` entries whose `playedAt` is in the window; change = sum of their `delta`. Entries without `playedAt` count only for All time.
- Show a light loading state per row (`…`) while months are loading, and an inline error line if a fetch fails.

## Files
- New `app/src/components/ProfileStats.tsx`. Put the logic in a small `app/src/lib/profileStats.ts` (pure functions for window, change and games, so they're unit-testable).
- Styles go in the existing CSS file used by Insights. Use `profile-stats-*` class names.
- `app/src/pages/Stats.tsx`: render `<ProfileStats>` at the top of the page and pass a callback that sets `filters.timeClass` and scrolls to the Insights header.

## Acceptance
1. `cd app && npx tsc -b && npm run build` passes, with no new lint warnings.
2. With `ccUsername = PauloM18` and 90 days selected, the table shows Rapid 847, Blitz 719, Daily `?`, Bullet ~387. Change and Games should be close to chess.com's (Rapid ↑140 / 2, Blitz ↑129 / 36, Bullet ↑105 / 63 on 2026-10-22). Note in your output any difference and its likely cause.
3. Both dropdowns open, select and close. Type filtering, Show More/Less and row click work. 390px layout has no overflow.
4. Save screenshots of the desktop and 390px views to `.rea/profile-stats/rea-*.png`. Do not commit.
