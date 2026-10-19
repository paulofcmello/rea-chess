# Insights implementation evidence — 2026-10-18

## Reference capture

Read `AGENTS.md` and `docs/plan-insights.md`. This directory is the plan's explicit exception to the normal `.rea/` write restriction. All chess.com interactions were read-only navigation, demo controls, and GET requests; no membership or account settings were changed.

Opened `https://www.chess.com/insights` and `/insights/PauloM18` in the logged-in debug Chrome. Both led to the gated Hikaru demo at `/insights/hikaru`. Captured the upgrade modal, then dismissed it to inspect the demo. Opened `https://www.chess.com/stats/overview/PauloM18`; it redirects to the member's Stats view and gates Advanced Stats behind an upgrade.

The demo is a dark card dashboard with right-hand section navigation. Its Type, Time Class, and Date Range controls sit above the cards. Games contains Overview, Game Results, Game Shapes, and Game Phases; other sections include Openings, Tactics, Moves, Calendar, and Geography. REA follows the seven sections specified by the implementation plan.

Charts captured: a W/D/L ring, volume and accuracy time series, horizontal comparison bars, opening result bars, piece charts, and calendar comparisons. Time-series axes use dates/years and numeric counts or percentages. Move quality distinguishes classification colours. Sampled SVG computed styles are in `chart-styles.json`: green `#81b64c`, grey `#8b8987`, red `#fa412d`, volume blue `#008cd1`, muted white labels, and faint grid lines. REA uses these result/volume colours and the existing review classification palette. Screenshots named `chesscom-*-charts.png` capture the charts after scrolling beneath their section headers.

Help-center references used for the gated personal view:

- [What is Insights?](https://support.chess.com/en/articles/8708925-what-is-insights-on-chess-com): results, phases, move quality, pieces, calendar, and filter coverage.
- [Advanced Stats](https://support.chess.com/en/articles/15451190-how-do-i-use-advanced-stats): the newer Stats entry point, category structure, and review classifications.
- [Opening Stats](https://support.chess.com/en/articles/8705347-how-can-i-see-my-opening-stats): opening-phase accuracy and colour separation.

## Network JSON shapes

Only Insights endpoints are retained in `network-index.json`. `insights-shape-0.json`, `-1.json`, and `-2.json` are real read-only GET responses from the public demo:

- `/service/insights/<hikaru-uuid>/blitz/all-time?uuid=...`: `gamesOverview` has total, win/draw/loss, overallAccuracy, and result-specific accuracy. Date-keyed objects include `gamesOverTime`, `accuracyOverTime`, and `movesByClassificationOverTime`. `gameResults` is result → termination → count. `movesByClassification` maps classifications to counts. `movesAndAccuracyByPieceAndGamePhase` is piece → phase → accuracy/moves. Other objects include `gamePhase`, `dayOfWeek`, `timeOfDay`, and opponent-rating results/accuracy.
- `/service/insights/<uuid>/game-counts`: time class → counts.
- `/service/insights/<uuid>/blitz/split-by/color/all-time?...`: `white` and `black`, each containing the requested insight objects. Provider aliases such as `greatfind` and `missedwin` are kept in captured evidence; the app uses its existing `great` and `miss` classifications.

These responses are references only. No demo aggregates are used as REA user data.

## Data and implementation

- `ccGames.fetchMonth` now persists and deduplicates each imported account's games. My Games and Insights share the same imports. Import latest month explicitly refreshes the month; other months are available in My Games. All time means all saved imports, with this scope stated in the UI.
- Existing `reviewCache.ts` already retained 30 full reviews. Each completed review now additionally saves a compact durable Insights summary keyed by the same game ID. Old full reviews are reused when available. Eviction of a full interactive review no longer removes its Insights measurements.
- Existing bot storage contained W/D/L totals without dates, colours, or PGN; friend storage contained only a resumable current session. New completed bot/friend games now save PGN, result, colour, source, date, time class, and opponent metadata. Aborted friend games are excluded. Stable IDs match their Game Review cache keys. The final bot SAN is included when checkmate ends a game.
- Puzzle practice reuses `puzzleHistory`, rating, and daily solve logs. New rated attempts have timestamps; old undated attempts are available only under All time. Puzzle source/colour/time-class independence is labelled.
- Phase heuristic: first 10 moves are opening, remaining moves middlegame until reduced non-pawn material (<=14 total, or <=26 with no queens) or move 41 onward starts an endgame. Starting FENs are respected.
- Clock times come from real PGN `%clk` annotations, including increment. Missing annotations break the elapsed-time chain; daily/untimed games are skipped. Final-clock numbers mean the user's last recorded move clock, as labelled.
- Accuracy and classification calculations reuse REA's review engine; no peer ratings or provider analysis are fabricated. Batch review uses a worker and depth 14, offers 5/20/all batches, reports progress, and can be cancelled. Leaving Stats stops the active worker and keeps finished reviews.

## Acceptance checks

Dev server: `http://localhost:5179`. Chrome CDP: `http://localhost:9222`.

Imported **Hikaru's latest monthly archive only (October 2026), 313 standard games**, using the actual My Games username form and Load games button. No fixture games were substituted for the acceptance data. Reviewed the next five games with the page's Analyze button. The first batch produced **5 reviews, 230 user moves, average accuracy 77.66**; the final browser state contains **10 reviews, 423 user moves, average accuracy 82.96** after further review checks. These completed reviews survived reload. PGNs supplied **13,494 timed user moves** across the imported games.

- `metric-checks.json`: 19 checks pass, including PGN parsing, clocks/increments, clock gaps, absent clocks, starting FEN/endgame, opening detection, invalid PGN, all filters, no-data accuracy, termination categories, and conservation of real imported counts.
- `integration-checks.json`: friend completion persistence, duplicate prevention, aborted-game exclusion, summary retention after 32 full-review writes, batch cache joins, user-only moves, and phase coverage. Temporary test records were restored/removed.
- `cancel-check.json`: a second batch was cancelled during its first game; completed-summary count remained 5 and no partial game was cached. The cancellation-check snapshot shows 313 games / 5 reviews; later checks expanded the reviewed sample.
- `filter-checks.json`: combined bullet/white/30-day/chess.com filters produce 101 real games, chart focus reveals a tooltip, arrow keys navigate tabs, and empty filters show an import CTA.
- `ui-checks.json`: all seven tabs render at desktop and 390px with no runtime exceptions and no horizontal overflow. Final desktop/mobile images are in `compare/`.
- Bot UI completion and shared review ID are checked separately in `bot-checks.json`; temporary local game and record changes are restored after the check.
- Required `cd app && npx tsc -b && npm run build` passes. Lint comparison: 154 pre-existing warnings before and after; zero new warnings. `git diff --check` passes. No dependencies added.

## Deviations / data limitations

No feature sections omitted. Personal chess.com Insights is paywalled, so the permitted demo/stats/help-center fallback was used. Historical bot totals and older undated puzzle attempts cannot provide missing dates or moves; these limitations are disclosed in the UI. Existing review caching was extended instead of introducing a second full-review engine. No commits or pushes; changes remain uncommitted.
