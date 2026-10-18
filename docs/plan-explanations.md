# Plan: Full Move Explanations in Game Review (chess.com Diamond "Explain")

Read AGENTS.md first. You MAY write evidence into `.rea/explain/`.

## 0. Capture evidence
Debug Chrome on `localhost:9222` is logged into chess.com (Diamond features may or may not be active; read only).
- Open a game review on chess.com for one of the user's own finished games (find one via `https://www.chess.com/games/archive` or the public API username in REA's storage/import code) → `https://www.chess.com/analysis/game/live/<id>?tab=review`. Step through moves; capture the coach panel: the per-move text, the "Explain"/"Show explanation" button, the "Show Follow-Up"/"Best" line playback, threat arrows, and the text templates used.
- Capture network: the review API (often `analysis` / `game-review` endpoints) — the JSON includes classification, explanation keys/strings, threat squares, best lines. Save sample JSON to `.rea/explain/` and catalogue the explanation template types in `.rea/explain/notes.md` (e.g. "X hangs a piece", "allows mate in N", "misses a fork", "loses the exchange", "this move develops", "controls the centre", "best was Y because ..."). Also check exported scripts in `.rea/scripts/` for coach phrase tables.

## 1. Build (pure client-side, engine-driven)
Extend `app/src/lib/review.ts` (+ new `app/src/lib/explain.ts`) and `app/src/pages/Review.tsx` / `components/Coach.tsx`:
- For each move, generate a chess.com-style explanation from engine data + board analysis with chess.js:
  - Tactical detectors: hanging piece (moved piece or other piece now en prise: attacked more than defended / attacked by lower value), allows mate in N (eval mate score after move), misses mate, misses winning material (best line wins material: compare material after best line's first 2–4 plies), forks/pins/skewers/discovered attacks in best or refutation line (geometric detection), trapped piece, back-rank weakness, promotion threats, losing the exchange, stalemate traps in endgames.
  - Positional/opening: develops a piece, castles, controls centre, book move (existing book detection), trades when ahead, pushes passed pawn, improves king safety, weakens king (pawn moves in front of castled king).
  - Phrase tables and tone copied from chess.com captures (coach voice), with SAN/piece names filled in.
- UI like chess.com: coach bubble shows short text; an "Explain" button expands a longer explanation; "Show Follow-Up" plays the refutation/best line on the board with arrows (step through, then return). Threat arrows (red) for what the opponent now threatens; best move arrow (green) explanation "Best was Nf3, which ...".
- Works for both players' moves. Retry mode (existing) keeps working.
- Performance: explanation computed lazily when a move is viewed, cached.

## 2. Acceptance
1. Build passes, no new warnings.
2. Write a small test script (node, outside the app bundle, in `app/scripts/` or `/tmp`) with ≥8 hand-picked FEN+move cases (hanging piece, allows mate, missed fork, missed mate, good developing move, castling, blunder losing exchange, book) asserting the detector tag. Run it and include output.
3. Via CDP on the dev server: open a reviewed game, open Explain on a blunder and a best move, screenshot to `.rea/explain/compare/`.
4. Do not commit. Final message: files, template types implemented, deviations.
