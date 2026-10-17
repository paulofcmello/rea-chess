# Plan: Game Review (chess.com-style)

Goal: clicking a game in **My Games** opens a chess.com-style **Game Review**: coach + accuracy summary, then move-by-move with classification icons, coach bubble, eval graph, best-move arrows. Fully client-side using our Stockfish (`app/src/lib/engine.ts`).

## Evidence (captured from chess.com with REA — use these, don't guess)
`.rea/review/`:
- `summary.png` — summary screen (coach, eval graph, Players/Accuracy, classification table, "Start Review").
- `move-by-move.png` — move-by-move screen (coach bubble "c4 is excellent  +0.68", Best/Next buttons, move list with icons, graph, nav buttons).
- `class-icons.json` — **exact chess.com classification icons**: `{ name: "<g id=...>...</g>" }`, viewBox `0 0 18 19`. Keys used: `Brilliant`, `great_find`, `best`, `excellent`, `good`, `book`, `inaccuracy`, `mistake`, `missed_win`, `blunder`, `forced`. Inner `class="shadow|background|component|componentshadow"` attrs are harmless (fills are inline).
- `review-all.css` (111 KB, grep it) / `summary-sidebar.html` / `review-sidebar.html` — chess.com DOM + CSS for `move-feedback-box-*`, `flow-buttons-*`, `bot-speech-content-*`, game arc, tally table. Use for sizes, fonts, paddings, colors.

Classification colors (from chess.com CSS vars `--color-classification-*`):
```
brilliant #26C2A3  great #749BBF  best #81B64C  excellent #81B64C  good #95B776
book #D5A47D  inaccuracy #F7C631  mistake #FFA459  miss #FF7769  blunder #FA412D  forced #81B64C
```

## Files

### 1. `app/src/lib/reviewIcons.ts` (new)
Generate from `.rea/review/class-icons.json` (a one-off node script is fine; don't commit the script). Export
`CLASS_ICON: Record<Classification, string>` (inner SVG markup) and a React component `ClassIcon({ c, size = 18 })` rendering `<svg viewBox="0 0 18 19" width height dangerouslySetInnerHTML>`.
Mapping: brilliant→`Brilliant`, great→`great_find`, best→`best`, excellent→`excellent`, good→`good`, book→`book`, inaccuracy→`inaccuracy`, mistake→`mistake`, miss→`missed_win`, blunder→`blunder`, forced→`forced`.

### 2. `app/src/lib/review.ts` (new, pure logic — no React)
```ts
export type Classification = 'brilliant'|'great'|'best'|'excellent'|'good'|'book'|'inaccuracy'|'mistake'|'miss'|'blunder'|'forced'
export interface PlyEval { cp?: number; mate?: number }          // WHITE perspective
export interface ReviewedMove { san: string; uci: string; color: 'w'|'b'; cls: Classification; before: PlyEval; after: PlyEval; best: string /*uci*/; bestSan: string; loss: number /*expected points*/ }
export interface Review { moves: ReviewedMove[]; evals: PlyEval[] /*len = plies+1*/; accuracy: { w: number; b: number }; counts: { w: Record<Classification, number>; b: Record<Classification, number> } }
```
- **Expected points** (mover's perspective) `ep(cp) = 1 / (1 + Math.exp(-0.00368208 * cp))`; mate for mover → 1, mated → 0.
- **Analysis**: for each position `fens[i]` (i = 0..plies) run `engine.search(fen, { depth: 14, multipv: 2 })`. Convert `lines[0]` cp/mate (side-to-move perspective) to white perspective. Terminal positions (checkmate/stalemate): evaluate directly with chess.js, no engine call.
- `loss = ep_mover(evals[i]) - ep_mover(evals[i+1])` clamped ≥ 0 (mover = side to move in `fens[i]`).
- **Classification for move i** (first match wins):
  1. `forced` — only one legal move.
  2. `book` — ply index < bookPlies (see below).
  3. `brilliant` — loss ≤ 0.02 AND move is a piece sacrifice (after the move, opponent's best reply in `lines[0].pv` of position i+1 captures a piece worth ≥ 3 (N/B=3, R=5, Q=9) and mover's material after 2 plies of PV is ≥ 2 lower than before the move) AND ep_mover before < 0.9 AND ep_mover after ≥ 0.5.
  4. `great` — played == engine best AND position i had a 2nd line with (ep(best) − ep(second)) ≥ 0.15 AND ep_mover before < 0.9.
  5. `best` — played uci == `lines[0].move` of position i, or loss ≤ 0.001.
  6. `miss` — previous move (opponent's) was `mistake`/`blunder`/`inaccuracy`, AND loss ≥ 0.05, AND ep_mover after < ep_mover at i−1 (gave the advantage back).
  7. `excellent` loss ≤ 0.02 · `good` ≤ 0.05 · `inaccuracy` ≤ 0.10 · `mistake` ≤ 0.20 · else `blunder`.
- **bookPlies**: parse PGN header `ECOUrl` (e.g. `https://www.chess.com/openings/Scotch-Game-3...exd4-4.Nxd4-Nxd4-5.Qxd4`) — count SAN tokens after the opening name (tokens matching move-number patterns `\d+\.+` followed by SAN, separated by `-`). If absent/unparseable: 0.
- **Accuracy** per move (lichess formula, used as stand-in for chess.com CAPS): `winPct(cp) = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1)` (mover persp.); `acc = clamp(103.1668 * Math.exp(-0.04354 * (winBefore - winAfter)) - 3.1669, 0, 100)`. Player accuracy = (arithmetic mean + harmonic mean) / 2 of that player's move accuracies, 1 decimal. Book/forced moves count as 100.
- `export async function reviewGame(startFen, sans, engine, onProgress:(done,total)=>void): Promise<Review>`.
- Also export pure helpers (`ep`, `classifyMove` inputs→cls, `accuracyOf`) so they can be checked in node.
- Coach text: `export function coachLine(m: ReviewedMove): { title: string; text: string }` — title `"<san> is <a/an> <label>"` (e.g. "c4 is excellent", "Nxd5 is a blunder", "e4 is a book move", "Qxf7+ is a miss"), text: pick deterministically (by ply) from 2–3 short phrases per class you write in chess.com's tone (e.g. blunder: "This loses significant material.", "A costly error."; best: "The best move in this position."; miss: "You missed a chance to take advantage."; book: "This is a known opening move."). For bad moves append `"The best move was <bestSan>."`.

### 3. Caching
Store finished reviews in localStorage via `save/load` (`app/src/lib/storage.ts`), key `review:<game url or hash of pgn>`; reopening a reviewed game is instant. Keep only the last 30 reviews (store an index list).

### 4. `app/src/pages/Review.tsx` (new) + route
- Route in `app/src/App.tsx`: `review: { label: 'Game Review', icon: 'magnifier-star', el: Review }` — but **hide it from the nav list** (filter it out where nav items are rendered; only reachable by link).
- Input: `sessionStorage['rea-chess:review'] = JSON.stringify({ pgn, url, white:{username,rating}, black:{username,rating}, me })`. Add `export function openInReview(game: CcGame, me: string)` in `Review.tsx` and use it in `app/src/pages/Games.tsx` as the **row click action** (replace openInAnalysis there). In Review, the header right icon (magnifier) opens the same game in Analysis via existing `openInAnalysis`.
- Layout: same 3-column structure as `Analysis.tsx`/`Bots.tsx` (eval bar · board with player bars top/bottom · `cc-sidebar`). Reuse `Board` (it already applies the user's chosen board/piece theme via `useSettings` — do not pass theme props), `EvalBar`, `NavButtons`, `CoachAvatar` (`app/src/components/Coach.tsx`), and the player bar used by `Bots.tsx` if exportable (otherwise a simple equivalent). Orientation = user's color.
- While analyzing: sidebar shows coach (emotion `thinking`) + bubble "Analyzing your game…" + progress bar (% of positions). Engine instance created on mount, destroyed on unmount.
- **Summary view** (match `summary.png`): header "Game Review" (icon `https://assets-ds.chess.com/color-icons/magnifier-star.svg`); coach + bubble ("Nice win! Let's review it together." / "Tough loss — let's review it together." / "A hard-fought draw. Let's review it together."), coach emotion happy/concerned/idle; eval graph; Players row (usernames above two avatar tiles, user's tile green border); Accuracy row (white player's box white bg/dark text, black player's dark bg/white text); divider; table rows for all 10 classes in order Brilliant, Great, Best, Excellent, Good, Book, Inaccuracy, Mistake, Miss, Blunder: label · white count · icon · black count, counts colored by class color; big green "Start Review" button (`cc-button-primary` style, as in Play Bots).
- **Move-by-move view** (match `move-by-move.png`): coach + bubble containing `ClassIcon` + title + eval chip on the right (white-persp. `formatScore`, light grey chip) and text below; buttons row: "Best" (secondary; toggles showing best-move arrow) + "Next" (green, primary; advances ply). Move list (two columns, like existing `MoveList` but with `ClassIcon` 16px before the SAN for great/brilliant/inaccuracy/mistake/miss/blunder and SAN text colored with the class color for those). Clicking a move jumps there. Graph under the list. `NavButtons` at bottom. Keyboard ←/→ navigate.
- Board decorations at ply p>0 for move m = moves[p−1]: highlight from/to squares with class color at opacity 0.5; classification icon badge at the top-right corner of the destination square (extend `Board`'s `effects`/badge rendering to accept any `Classification`, rendered with `ClassIcon`, same position/size as existing correct/incorrect effects); for inaccuracy/mistake/miss/blunder automatically show the best-move arrow (green `#81b64c`-ish, existing arrow style) for position p−1; "Best" button toggles that arrow for any move.
- **Eval graph** (SVG, no chart library): width 100%, height ~100px, white area = white advantage, background `#403d39`-ish dark (see screenshots: dark top/white bottom, mid line grey). Map eval with clamp ±(ep curve) or cp clamp ±1000 → y. Colored dots at plies classified great/brilliant/inaccuracy/mistake/miss/blunder. Vertical line at current ply (green as in screenshot). Click → jump to ply.

### 5. CSS
`/* Game Review */` section at end of `app/src/index.css`. Pull exact values from `.rea/review/review-all.css` (classes `move-feedback-box-*`, `flow-buttons-*`, `bot-speech-content-*`, tally/accuracy). Reuse existing coach bubble styles from the puzzles page if similar. Must fit at 360px (sidebar stacks below board like other pages).

## Acceptance
1. `cd app && npx tsc -b && npm run build` passes.
2. Node check (temp script, delete after) of the pure helpers: `ep(0)=0.5`; a 300cp drop from +100 classifies `blunder`; 0-loss engine move → `best`; accuracy of all-zero-loss moves ≈ 100.
3. Do not commit. Final message: files changed + any deviation from this plan.
