# Game Review calibration

Report generated: 2026-10-25T01:23:55.411Z. 22 complete games; 41 attempted.

Games used: 168718861344, 168719147526, 168842027474, 168950954792, 168982960000, 169223121380, 169438032210, 169561304968, 169819478994, 169908392012, 169963371090, 174393248770, 184717265086, 184907143292, 184969139482, 185189219708, 185244476396, 185331067166, 185342069780, 185783104308, 185839426188, 185894637180

## Evidence

431 already-reviewed standard live games found across 37 public monthly archives. Their PGNs and API accuracy labels are preserved in archive-accuracies.json. The newest 40 games with at least ten moves per side are eligible for browser capture; no unreviewed game is opened by the re-run. 19 saved captures lack complete summaries (including the original blocked attempt). Only complete summaries enter fitting.

DOM/API accuracy MAE on captured games: 1.63 points. The sources disagree on some games; fit targets use the current rendered summary, with API values retained as additional reference ground truth. 18 selected games whose summary did not reopen are evaluated separately using API accuracy only, without entering training/model selection: MAE 18.70 → 6.15 points. The remaining archive-only games have no Stockfish evals in this run and are not included in the fitted/test metrics.

## Before / after

| Metric | Before | After (out of sample) |
| --- | ---: | ---: |
| Accuracy MAE, percentage points | 12.31 | 5.21 |
| Tally L1 difference per side | 13.17 | 14.33 |
| Per-move classification mismatch | N/A | N/A |
| Game Rating MAE, Elo (own-PGN-rating baseline vs fitted model) | 416.67 | 162.50 |

16 training games, 6 untouched test games. Test IDs: 168719147526, 185839426188, 169963371090, 184969139482, 185894637180, 168718861344. Deterministic split: SHA-256(game ID), first ceil(N/4). Training LOO accuracy: 13.39 → 7.53; tally: 12.69 → 12.50. Nested training Game Rating MAE: 181.25 Elo.

N/A means unmeasurable, not zero error. App Game Rating had no previous estimator. PGN rating is a comparison baseline only.

## Parameters and decisions

- Expected-points logistic scale: 0.0027615599999999997; rating slope: 0.75. Rating is centered at 1500 and scaled by 1000. Curve accepted: true.
- Accuracy K: 0.12; arithmetic weight: 0.75, harmonic weight: 0.25. Accuracy change accepted: true.
- Classification thresholds remain 0.001 / 0.02 / 0.05 / 0.10 / 0.20; miss rule unchanged. 0 games have unambiguously aligned per-move labels. No unsupported threshold changes.
- Game Rating model: {"features":["rating","accuracy"],"coefficients":[-1389.5440821760078,1.070099890908159,22.543184596382424]}
- Short-game cutoff: fewer than 10 moves by that side. No captured short-game example; the plan’s < 10 fallback applies.
- Ratings are rounded to nearest 50 (with a nonnegative floor). Captured values verify rounding: true.
- App search depth remains 14, MultiPV 2.

## Held-out tally means per side

| Classification | Chess.com | Before | After |
| --- | ---: | ---: | ---: |
| brilliant | 0.17 | 0.00 | 0.00 |
| great | 1.00 | 1.17 | 0.75 |
| best | 8.00 | 10.33 | 10.75 |
| excellent | 7.50 | 5.33 | 7.58 |
| good | 4.92 | 5.92 | 4.42 |
| book | 3.08 | 2.92 | 2.92 |
| inaccuracy | 2.25 | 1.83 | 2.17 |
| mistake | 2.33 | 1.50 | 1.17 |
| miss | 0.92 | 1.00 | 0.83 |
| blunder | 0.75 | 0.92 | 0.33 |

## Depth experiment

| Game | Depth 14 seconds | Depth 18 seconds | Accuracy MAE change | Tally difference change |
| --- | ---: | ---: | ---: | ---: |
| 168842027474 | 8.15 | 39.54 | 3.85 | 1.00 |

The exact shipped Stockfish 19 Lite single-threaded WASM runs in Node via a temporary CommonJS wrapper. Hash 16 MB, MultiPV 2, depth 14/18, fresh game hash per game. Depth-14 mean / median full-game runtime across 40 evaluated games: 10.48 / 9.19 seconds. Runtime is full-game engine time, excluding cache reads; cache fingerprint includes PGN, engine bytes and settings. Depth comparison uses one median-length training game; it does not tune on the held-out quarter.

## Validation and caveats

At least six training games are required to fit curves/accuracy; at least eight for nested Game Rating validation. Whole games, including both sides, stay together in every leave-one-game-out fold. Curve and accuracy stages refit on the training games. Rating candidate features (at most three plus intercept) cover own accuracy/rating, opponent accuracy/rating and move count. The simplest candidate within 25 Elo of the best LOO error is selected; nested whole-game CV reports selection error. Curve adoption requires at least 0.5 percentage-point / 5% accuracy improvement and lower tally error; accuracy fitting requires at least 0.25 point / 5%. Game Rating adoption requires nested CV to beat the own-rating baseline by 5%. Selection gates still use this small corpus, so all estimates need confirmation on an independent larger sample.

See fit.json for all candidate scores and folds.

Held-out tally L1 worsened from 13.17 to 14.33 despite the small training-CV tally gain; classification parity has not been achieved. No aligned per-move labels were captured, so thresholds and the miss rule remain unchanged. The sample comes from one user’s reviewed games, with low/sub-1000 PGN ratings; extrapolation to stronger players is unvalidated.

Stored reviews refresh accuracy and available Game Ratings from before/after evals. A classification-version mismatch invalidates cached interactive reviews and Insights when a chosen curve changes classifications. Insights recomputes accuracy from stored evals with each player’s rating, including mixed-game move groups.

## Reproduce

From app/: `node scripts/capture-reviews.mjs`, then `node scripts/calibrate-review.mjs`. Evidence is in `.rea/review/calibration/<id>.json`; evals in `evals/<id>.json` and `evals/<id>-depth18.json`; all model metrics and parameters in `fit.json`. `--skip-depth18` skips the expensive experiment for fitting iterations; `--apply` applies only validated models. No app dependencies are added.

## Per-game accuracy

| ID | White / Black | PGN ratings | Target accuracy W / B | Before W / B | Fitted W / B |
| --- | --- | --- | --- | --- | --- |
| 168842027474 | BASsEelL767 / PauloM18 | 225 / 230 | 59.1 / 76.8 | 78 / 91.3 | 65.9 / 79.4 |
| 168950954792 | PauloM18 / viveknitn | 371 / 350 | 62.9 / 62 | 38.9 / 54.7 | 55.5 / 75.5 |
| 168982960000 | ckeat1762 / PauloM18 | 396 / 396 | 79.7 / 75.1 | 42.8 / 39.7 | 73 / 59.2 |
| 169223121380 | mgazulli77 / PauloM18 | 326 / 338 | 58.8 / 78.4 | 65.8 / 86.3 | 53.2 / 82.5 |
| 169438032210 | Colossal_Toad123 / PauloM18 | 376 / 380 | 62.8 / 58.2 | 37.9 / 35.4 | 56 / 54.1 |
| 169561304968 | PauloM18 / Joelleee18 | 401 / 381 | 67.9 / 46.7 | 38.4 / 50.3 | 59.9 / 50.9 |
| 169819478994 | PauloM18 / Yuri265 | 323 / 330 | 80.2 / 44.5 | 73.6 / 53.8 | 78.7 / 54.1 |
| 169908392012 | PauloM18 / K353 | 333 / 340 | 89.8 / 80.2 | 90.8 / 67.5 | 91.6 / 78.4 |
| 174393248770 | PauloM18 / anthandius | 268 / 257 | 80.9 / 72.9 | 66.9 / 58.8 | 87.9 / 83.5 |
| 184717265086 | tahmaj_buckshack / PauloM18 | 577 / 609 | 61.1 / 78 | 63.7 / 71.7 | 58.6 / 83 |
| 184907143292 | Roti_bhau / PauloM18 | 255 / 284 | 39.5 / 54.2 | 44.6 / 48.3 | 59.4 / 67.8 |
| 185189219708 | PauloM18 / zahwa96 | 782 / 676 | 81.9 / 72.5 | 69 / 45.8 | 75.1 / 64.6 |
| 185244476396 | KiNGyosou / PauloM18 | 276 / 379 | 70.2 / 68 | 50.4 / 37.3 | 71.6 / 58.7 |
| 185331067166 | PauloM18 / tedreidelas | 847 / 333 | 72 / 44.2 | 62.6 / 52.8 | 74.1 / 68.5 |
| 185342069780 | PauloM18 / sparta-et | 727 / 708 | 84 / 76.3 | 87.2 / 79.8 | 91.8 / 83.3 |
| 185783104308 | PauloM18 / chamoooo84 | 711 / 733 | 61.6 / 97.9 | 61.3 / 94.9 | 60.1 / 96.3 |

The per-game table contains training games; its fitted column is in-sample. Aggregate before/after errors above use only the untouched test quarter. Model adoption uses training cross-validation only, regardless of test results.
