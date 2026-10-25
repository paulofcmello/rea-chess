# Plan: calibrate Game Review to chess.com (accuracy, classifications, Game Rating)

Goal: our Game Review numbers should track chess.com's for the same game, and we should show chess.com's **Game Rating** row. Calibrate against real chess.com reviews of the user's own games (chess.com user `PauloM18`).

Exception to AGENTS.md for this task: you may write under `.rea/review/calibration/` (evidence only). Everything else in AGENTS.md applies (no commits, no new app dependencies).

## 1. Capture chess.com reviews (CDP)

A debug Chrome is running with `--remote-debugging-port=9222` (profile `~/.rea-chrome-profile`), logged into chess.com by the user. Never enter credentials, never click upgrade/purchase/trial buttons, never make moves, post, or change anything on the account. Bring the tab to front before any synthetic input.

Write `app/scripts/capture-reviews.mjs` (Node, global `WebSocket`, no deps):
- In a chess.com page context, `fetch` `https://api.chess.com/pub/player/paulom18/games/archives` and the latest archive(s) (curl/Node are blocked by Cloudflare; fetch from the page). Take the ~12 most recent standard-chess games with ≥ 10 moves per side (prefer a mix of wins/losses/colors).
- For each game open `https://www.chess.com/analysis/game/live/<id>?tab=review` and wait for the review summary to render.
- Record with the CDP `Network` domain: every XHR/fetch response body and every WebSocket frame whose text contains any of `effectiveElo`, `gameRatingV2`, `accuracy`, `classification`, `CAPS`, `tallies`. (The client reads ratings via `effectiveElo` / `gameRatingV2`, see `.rea/explain/chesscom-tab-review.js`.)
- Also scrape the rendered summary DOM as ground truth: both accuracies, every tally row (Brilliant…Blunder, expand the collapsed tallies via the chevron), both Game Ratings (`.review-rating-component`), or the "not enough moves" text. Selectors: see `.rea/review/summary-sidebar.html`.
- Save one file per game: `.rea/review/calibration/<id>.json` = `{ id, url, pgn, white, black, ratings from PGN, dom: {...}, network: [...] }`.
- If chess.com shows a review limit / paywall, stop capturing, keep what you have, and report how many games you got.

If the network payload has **per-move** classifications/evals, keep them: per-move comparison is the main calibration signal.

## 2. Calibrate (offline script)

Write `app/scripts/calibrate-review.mjs`:
- Run Stockfish in Node with the same settings as the app (`reviewGame` in `app/src/lib/review.ts`: depth 14, multipv 2). Reuse the Stockfish WASM the app already ships/loads (see `app/src/lib/engine.ts`); if that can't run in Node, install the `stockfish` npm package into a scratch dir outside `app/` (not into app dependencies). Cache engine output per game in `.rea/review/calibration/evals/<id>.json` so fitting runs fast.
- Reuse `classifyMove`, `expectedPoints`, `accuracyOf` logic (import or mirror the TS) and compare with chess.com per game: accuracy (both sides), tally counts, and per-move classes if captured.
- Fit, in this order, keeping models small (≤ 3–4 params each) and validated with leave-one-game-out:
  1. Expected-points curve: try the current one vs. a rating-dependent one (scale depends on the mover's rating from the PGN). Keep it only if it clearly reduces classification + accuracy error.
  2. Accuracy formula constant(s) (`ACCURACY_K`, the arithmetic/harmonic blend) given the chosen curve.
  3. Classification thresholds / miss rule only if the per-move data clearly supports it.
  4. Also test depth 18 once; report the error change and per-game runtime. Don't change the app's depth unless the gain is large and runtime stays reasonable — just report it.
- **Game Rating**: fit `gameRating(side)` from features we have: that side's accuracy, its PGN rating, the opponent's PGN rating/accuracy, move count. Pick the simplest model that holds up out-of-sample; round to the nearest 50 like chess.com does (check the captured values). Reproduce the "not enough moves" cutoff (find the threshold from data; if no example, use < 10 moves by that side).
- Write `docs/review-calibration.md`: games used, before/after tables (accuracy MAE, tally differences, Game Rating error), chosen parameters, and caveats.

## 3. Implement in the app

- `app/src/lib/review.ts`: apply the chosen constants/curve. Add `gameRating?: { w: number | null; b: number | null }` to `Review` (null = not enough moves) and an exported `gameRatingOf(...)`. `reviewGame` needs player ratings → add an optional param, pass them from `Review.tsx` (PGN `WhiteElo`/`BlackElo` or the input players).
- Stored reviews (`loadReview`) predate this: recompute accuracy and Game Rating from stored `before/after` evals where possible instead of re-analyzing. If classifications changed in a way that needs data we don't store, bump the review cache key version so they re-run.
- `app/src/pages/Review.tsx` summary: add a **Game Rating** row after the tallies, separated by an `hr`, laid out like the Accuracy row (white box for White, dark box for Black, same widths) per `.rea/review/summary-sidebar.html`; unrated side shows "There were not enough moves to rate this game." as chess.com does.
- Check other users of `accuracyOf` (`lib/insights.ts`) still compile and make sense.

## Acceptance
- `cd app && npx tsc -b && npm run build` passes, no new warnings.
- `docs/review-calibration.md` exists with before/after numbers; out-of-sample accuracy error and Game Rating error are reported honestly.
- Final message: number of games captured, key fitted values, before/after errors, anything you couldn't do.

## Update (re-run)
The first run hit chess.com's free DAILY LIMIT on a never-reviewed game. Verified: games the user **already reviewed** reopen with the full summary (accuracy, tallies, Game Rating) even after the limit. Those are exactly the archive games that have an `accuracies` field in the public API (54 in the last 6 archives; check all archives). So:
- Change `capture-reviews.mjs` to select only games with `accuracies` (all archives, newest first, cap 40), never open un-reviewed games. Wait ~15 s per page; the summary renders in `document.body.innerText` (rows like `Accuracy 72.6 65.4`, tallies, `Game Rating 950 600`).
- The API `accuracies` of every reviewed game is extra free accuracy ground truth.
- Then do steps 2–3 for real (fit, implement, report) on the code you already wrote. Hold out ~25% of games for the reported errors.
