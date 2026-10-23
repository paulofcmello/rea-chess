# Plan: puzzle variety (bigger DB + weighted repeats)

Problem: only 4,116 puzzles (340 per 200-pt band); `pickPuzzle` draws from ±75 first (~130 candidates); each mode tracks "seen" differently (Puzzles: last 300 history ids; Themes/Rush: in-memory Set reset per reload/run; Home: excludes solved only). Result: frequent repeats.

Goal: seen puzzles are NOT excluded, just much less likely, and the pool is ~10x bigger.

## 1. Bigger database — `app/scripts/build-puzzles.sh`
- Stream more of the Lichess CSV: `head -n 3000001` (was 400001) so high/low bands fill up.
- Keep the same quality filters (Popularity ≥ 85, NbPlays ≥ 300, RatingDeviation ≤ 90, 400 ≤ rating < 3000).
- Sample **1500 per 100-point band** (was 170). Same row format `[id, fen, moves, rating, themes]`, sorted by rating, same output path `public/data/puzzles.json`.
- Run the script and commit-ready the regenerated file (target ~35–40k puzzles, ~5–6 MB raw; fine since GitHub Pages gzips). Print the per-band counts at the end of the run. If a band comes up short, that's OK.
- Use `$TMPDIR` or a path inside the repo's ignored dirs instead of `/tmp` only if `/tmp` fails in the sandbox; don't commit the CSV.

## 2. Shared "seen" memory — new `app/src/lib/puzzleSeen.ts`
- Stored via `useStored`/`load`/`save` from `lib/storage.ts`, key `puzzleSeen`: `Record<string, { n: number; last: number; solved: boolean }>` (n = times shown, last = Date.now() of last attempt, solved = last result).
- `markSeen(id: string, solved: boolean)` — updates the record (read with `load`, write with `save`).
- `seenWeight(id, seen, now)` returns the selection weight:
  - unseen → `1`
  - seen in the last 24h → `0.01`
  - otherwise base `solved ? 0.08 : 0.2` (failed ones come back a bit more, spaced-repetition-ish), multiplied by `min(1, daysSinceLast / 30)` floored at `0.02`, and divided by `n` (more repeats → rarer).
- One-time migration: if `puzzleSeen` is empty and `puzzleHistory` exists, seed it from history (id, solved, playedAt ?? 0, n += 1 per entry).

## 3. Weighted picking — `app/src/lib/puzzles.ts`
- Change `pickPuzzle(all, target, seen, filter)` so `seen` is the `puzzleSeen` record (not a `Set`) and selection is weighted:
  - For each spread in `[75, 150, 300, 600, 3000]`: pool = in-range & filter. If the pool has **≥ 15 unseen** puzzles, or this is the last spread, do weighted random over the pool using `seenWeight` and return.
  - Keep an optional `avoid?: Set<string>` param for hard per-session exclusion (Rush run, current puzzle) — those get weight 0.
  - Fallback (nothing in any spread): weighted over `all.filter(filter)`.
- Rating spread loop and return type unchanged otherwise.

## 4. Call sites
- `pages/Puzzles.tsx:35` — drop the `history.slice(-300)` Set; pass `load('puzzleSeen')` (or a `useStored` value) and `avoid = new Set([puzzle?.id])`. When a puzzle result is recorded into history, also call `markSeen(id, solved)`.
- `pages/Rush.tsx` — keep `seen.current` as `avoid` (no repeat within one run), pass the stored seen record, call `markSeen` on each result.
- `pages/Themes.tsx` — keep in-memory `seen` as `avoid`, pass the stored record, `markSeen` on each result.
- `pages/Home.tsx:143` — use the stored record instead of the solved-only Set (Home only previews, do NOT markSeen there).
- Daily puzzle unchanged (deterministic by date). Endgames untouched.
- Theme counts in Themes still computed from `all` (just bigger numbers now).

## Acceptance
- `cd app && npx tsc -b && npm run build` passes, no new warnings.
- `node -e` on `public/data/puzzles.json`: ≥ 30k rows, unique ids, per-100-band counts printed in the final message.
- Quick node test (inline, no new test file needed): with a fake seen record marking all but 20 puzzles in a ±75 window as seen yesterday, 1000 picks return an unseen puzzle ≥ 90% of the time, and a puzzle seen 40 days ago still appears occasionally.
- Final message: per-band counts, file size, and any deviation from this plan.
