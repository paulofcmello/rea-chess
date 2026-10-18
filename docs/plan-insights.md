# Plan: Advanced Stats / Insights (chess.com Diamond)

Read AGENTS.md first. You MAY write evidence into `.rea/insights/`.

## 0. Capture evidence
Debug Chrome on `localhost:9222` is logged into chess.com. Read-only.
- Open `https://www.chess.com/insights` (and `/insights/<username>` / tabs: Overview, Games, Results, Accuracy, Openings, Moves, Pieces, Time Management, etc. — follow real tabs) and `https://www.chess.com/stats/overview/<username>`. If insights is paywalled, capture the preview/marketing page plus the stats pages and use the chess.com help-center descriptions.
- Capture layout + charts (types, colours, axes, labels), filters (time class, colour, date range), and network JSON shapes. Save screenshots + `.rea/insights/notes.md`.

## 1. Build
- Upgrade `app/src/pages/Stats.tsx` (keep route; add tabs like chess.com Insights). Data sources: REA's own games (bots, friend games — check what's stored), imported chess.com games (`lib/ccGames.ts` / Games page storage) and cached reviews (`lib/review.ts` results, check where reviews are cached; if not cached, add a cache keyed by game id when a review completes). Puzzles stats from existing puzzle history.
- Filters: time class, colour, date range (last 30/90/365 days/all), source (chess.com / REA).
- Sections (chess.com Insights equivalents):
  - **Overview**: games, W/D/L donut, rating trend line per time class, average accuracy, best win.
  - **Results**: win% by colour, by time class, by day of week, by hour of day; how games end (checkmate, resign, timeout, draw types).
  - **Accuracy**: avg accuracy over time, by game phase (opening/middlegame/endgame — split using `review.ts` phase logic or move-number/material heuristics), vs opponent rating buckets.
  - **Moves**: classification frequency (brilliant, great, best, excellent, good, book, inaccuracy, mistake, miss, blunder) per game and by phase, compared across colour.
  - **Openings**: table of openings (ECO/name from imported PGN headers or book detection) with games, W/D/L bar, accuracy; separate for white/black.
  - **Pieces**: accuracy/blunder rate by piece moved.
  - **Time Management**: avg time per move by phase, time left at end, games lost on time, move time vs blunder rate (needs clock data from PGN `%clk`; skip gracefully when absent).
- Charts: plain SVG components (no new deps) styled with chess.com colours from the capture. Hover tooltips.
- Empty states when there is no data ("Import your games" CTA linking to My Games).
- Reviews needed for accuracy/moves: show "N games not reviewed yet — Analyze" button that batch-reviews in the background with the existing review engine (cancellable, progress bar), caching results.
- Mobile responsive, no horizontal scroll at 390px.

## 2. Acceptance
1. Build passes, no new warnings.
2. Via CDP on dev server: import games for a public chess.com username (use the one in REA storage, or `hikaru` limited to last month), batch-review a few, check every tab renders with real numbers; screenshots to `.rea/insights/compare/`.
3. Do not commit. Final message: files, sections done, deviations.
