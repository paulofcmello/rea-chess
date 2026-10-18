# Puzzle Path evidence — 2026-10-18

## Capture and account boundary

Reference: https://www.chess.com/puzzles in the existing debug Chrome session on localhost:9222. The path is the Puzzles page sidebar itself; there is no separate `/puzzles/path` anchor in its DOM. No real-account puzzle was started, solved, skipped, or submitted. Page loads, DOM/computed-style reads, network observation, and public asset/script reads only. For unobstructed screenshots, the first-time dialog and its backdrop were temporarily hidden with a local style element, then restored; its buttons were not clicked.

`rea` was not installed/on PATH (`command not found`), so CDP Runtime/Network/Page supplied the equivalent evidence, script sources, and screenshots. Raw full-page DOM was discarded to avoid retaining unrelated account/session data. Captured network evidence is limited to puzzle stats/config and public coach metadata; friend profiles were excluded.

## Data sources and shapes

- `GET /callback/tactics/stats/user`: `{ rating, highestRating, percentCorrect, todayAttempted, totalAttempted, currentStreak, ..., puzzlePath: { xp, bestStreak, totalEasyPuzzles, totalHardPuzzles, totalXHardPuzzles, tier, level, currentStreak, hardestSolvedPuzzleRating, prestigeLevel } }`.
- `/service/puzzle-path-gateway/chesscom.puzzle_path.v1.PuzzlePathGatewayService/GetPuzzlePathUserWithFriends`: `{ user: { userView, tier, level, xpPoints, prestige }, friends: [...] }`. Reference user path: tier 3 (bronze), level 15, 31,039 points, prestige 1. User/friend identity fields are not needed by REA.
- `GET /callback/tactics/prestige-level-point-system-config/1`: `{ data: { tier: [{ tier, prestige, awards: [{ puzzle_type, base_point, base_partial_points, retry_points, time_points, milestones }], levels: [{ level, next_level_required_points, next_level_total_required_points }], bonuses }, ...] } }`.
- Normal/easy base award: **30**; retry: **5**. Hard and extra-hard awards are 40/8 and 50/10 in the first tier. Live chess.com also has timing, partial-move, streak, and milestone bonuses and points-based level thresholds. REA uses the normal base awards with its existing normal puzzle flow; no server bonuses are synthesized.
- Coach metadata: `https://api.chess.com/rpc/chesscom.coaches.v2.CoachesService/GetCurrentCoach`, returning `{ currentCoach: { name, imageUrl, iconUrl, riveAnimationUrl, ... } }`.

See `network.json` for the observed response data.

## Rendering and asset source

The path is **procedurally painted on canvas**, not one background image. Its surface draws diamond checker cells, preloaded SVG props and tiles; Rive provides the animated pawn/coach. Source inspected: `https://www.chess.com/r2/client-packages/puzzles/2026.10.3/puzzles.js`; stylesheet `.../puzzles.css`.

Public images, all hotlinked in the app:

- `https://www.chess.com/bundles/web/images/puzzles/bronze-level-{light,dark,checked,pawn}.svg` (tiles 78×78; checked 80×77; pawn 80×80).
- `.../puzzles/bronze-art-{L1,L2,R1,R2}.svg` (188×368; picture frame, globe, gramophone, clocks).
- `.../puzzles/path-fog-{L0,R1}.svg` (clouds).
- `.../color-icons/puzzle-tier-bronze.svg` (badge).
- `https://assets-coaches.chess.com/image/coachdavid.png?v=41de5a5d` (static coach alternative to Rive).
- Original pawn Rive: `https://assets-ds.chess.com/motion/rive/workstreams/puzzles/puzzlepath/puzzles-path-pawn-ae4d1f4.riv`.

No chess.com image files were copied into the repository. Screenshots are evidence of the rendered pages.

## Geometry, typography and colours

- Reference sidebar: 300 CSS px wide, 781px tall at the captured viewport. Main heading uses Chess Sans extra bold; stats use Chess Sans bold (17px). Coach uses system sans, dark text on white.
- Canvas nominal checker: 108×92, scaled to 75×64 for a 300px path. Tile X zigzag sequence: `[0.5, 0, -0.5, -1, -1.5, -1, -0.5, 0]`; each successive tile rises half a cell (32px).
- Bronze checker: light `#774618`, dark `#663C15`; next tier blue: `#90ADC7` / `#6E93B5`.
- Reference progress track: 16px high, rounded, yellow `#FAD541`. Footer includes points and flame/streak, then next-level badge, list icon, and green primary button.
- Captured reference progress: 1,039 / 1,100 XP towards next level. REA's bar instead follows the requested completed-solves / 20 rule.
- `styles.json` contains measured computed styles. `resources.json` lists the relevant loaded asset/script URLs.

## Coach tips

The live `zPe()` function contains 16 English tips, captured in `coach-tips.json`. Five of those rotate every 12 seconds in REA, beginning with “Doing Puzzles every day helps you choose safe moves in your own games.”

## Local model and integration

- New `rea-chess:puzzlePath` counter `{ solved, points }`, persisted through storage helpers.
- Existing solve log, rated history and daily log seed old progress using their maximum solve count, avoiding adding overlapping histories together. Historical solves receive 30 base points because retry metadata did not exist.
- 20 solves per level as explicitly requested, starting at level 1. Current tile is solved modulo 20; bar follows that count. Existing streak is reused.
- Shared `usePuzzle` completion records all modes. Failure/hint/solution alone awards nothing; completing after help awards 5. Restarting the same completed puzzle in a session cannot award twice.
- Puzzles previously had no hub; its new landing view contains the path and links to existing Rush/Daily/Themes pages. Solve Puzzles opens the existing rated flow. Sidebar Back returns to the retained hub, so the pawn and progress animate for 400ms. The list icon opens existing Themes.
- CSS positions the hotlinked SVGs, uses a green tint for the static pawn, and replaces the Rive runtime without adding dependencies. All 20 tiles remain scrollable. Reduced-motion preference/settings disable the animation.
- Optional Home insertion omitted to preserve its compact activity previews.

## Verification and screenshots

`verification.json` records CDP checks against REA's dev server. Tests solve actual shipped puzzle sequences through the board callback; they never interact with chess.com's puzzle controls. The test saves and restores every original `rea-chess:` storage value.

- First-try solve: `{ solved:19, points:570 }` → `{ solved:20, points:600 }`; level becomes 2, current puzzle 1, bar 0/20.
- Wrong move: no reward; retry and solve → `{ solved:21, points:605 }`.
- Replaying that completed puzzle: unchanged counter.
- Themes navigation, reload persistence, all CDN images loaded, mobile no horizontal overflow checked.
- Screenshot fixture `{ solved:294, points:31039 }` with a two-day streak matches the reference level 15/current tile 15 for visual comparison; fixture removed after capture.
- `compare/chess-com.png`: full reference. `chess-com-card.png`: its cropped path card. `rea-card.png`: REA desktop card. `rea-mobile.png`: REA card at 390px viewport. `compare/index.html`: side-by-side view.
- Required `npx tsc -b` and `npm run build` pass. Targeted lint warnings match baseline exactly (3 existing refs, 2 existing purity, 1 existing set-state-in-effect); no new warnings.

## Plan adaptations

REA CLI unavailable → CDP equivalent. The plan's canvas fallback is used with the original SVG artwork and CSS rather than importing a Rive dependency. The real service's XP-level thresholds are intentionally replaced by the plan's 20-solves-per-level rule. Only normal base/retry awards apply; timed/partial/milestone bonuses and server tiers are outside the local model. Home remains unchanged (optional).
