# Plan: polish batch 2

Read AGENTS.md first. Independent items, in order.

## A. Game Review: "Retry" on mistakes (chess.com feature)
In `app/src/pages/Review.tsx` move-by-move view, when the current move is classified `inaccuracy | mistake | miss | blunder` **and it was the user's move** (`me`), show a third flow button **"Retry"** (secondary, chess.com glyph `arrow-rotate`-style icon or `↻`) left of Best/Next.
- Retry mode: board shows the position *before* the move, user's color movable (`Board` `movable` prop), coach bubble "Find a better move" (emotion `thinking`), best arrow hidden.
- User move = engine best (`moves[p-1].best`, compare uci incl. promotion) or a move with loss ≤ 0.02 (evaluate the reply position quickly with the review engine at depth 12; if engine busy, only accept exact best): coach "Great find! <san> is the best move." emotion `impressed`, green effect badge `correct` on the square, play `playMove`; button "Continue" exits retry.
- Otherwise: coach "<san> isn't best. Try again." emotion `concerned`, `incorrect` badge, piece snaps back after 600ms; buttons "Retry" again / "Show Best" (draws the best arrow and exits retry).
- Esc or Next exits retry mode.

## B. Move sounds while navigating
In Review and Analysis (`app/src/pages/Analysis.tsx`), stepping forward one ply (Next button, → key, NavButtons forward, clicking the next move) plays the move sound (`playMove(san)` from `app/src/lib/sound.ts` — check its signature; it already handles capture/check/castle sounds). Jumps of more than one ply and backwards steps: no sound (chess.com behaviour).

## C. Home page on phones
`app/src/pages/Home.tsx` / `index.css` `/* Home */` section: at ≤560px the three preview cards (Puzzles / Theme / Last game) stack full-width and are very tall. Make them a horizontal scroll-snap row (each card 72vw, `scroll-snap-type: x mandatory`, no page horizontal overflow — the row itself scrolls), keeping the Play column above. Game History table at ≤560px: hide the Moves and Date columns and keep Players / Result / Accuracy (chess.com mobile does this).

## Acceptance
1. `cd app && npx tsc -b && npm run build` passes, no new warnings.
2. At 390px width: `document.documentElement.scrollWidth === 390` on `#/`.
3. Do not commit. Final message: files changed + deviations.
