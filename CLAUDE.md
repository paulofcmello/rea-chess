# REA Chess

Personal chess.com clone (puzzles, bots, game import + review, P2P play with friends). Vite + React + TS in `app/`. Deployed via GitHub Pages (`.github/workflows`, repo paulofcmello/rea-chess): changes go live only after commit + push to `main`.

## Run
`cd app && npm run dev` · `npx tsc -b && npm run build` to verify.

## Built with REA (Reverse Engineer Anything)
This project recreates chess.com by reverse-engineering it with **REA** (`npx rea-agents`, repo morluto/rea, clone at `~/rea`). Always use REA to get real values instead of guessing:
- Website: launch a debug Chrome (`--remote-debugging-port=9222`, isolated profile), then `rea inspect-web-page --include-script-sources`, `rea export-web-scripts`, `rea capture-web-screenshot`, plus CDP network capture for API data (e.g. bot roster from `BotGroupService/ListBotGroups`).
- Evidence so far lives in `.rea/` (exported chess.com scripts, CSS, screenshots).
- Logged-in features (bot chat phrases, puzzle rating box, streak UI, Puzzle Path): the user logs into chess.com themselves in the debug Chrome profile (never enter credentials for them), then capture with REA.
- Alternative source: chess.com's iPad app on Mac (App Store); REA can analyze the app bundle/binary and extract bundled assets.

## Key facts
- chess.com assets (pieces/boards/sounds/fonts/coach/bot images) are hotlinked at runtime, never copied; personal use only.
- Board engine mirrors chess.com: `app/src/components/Board.tsx` (slides, drag hover, arrows, premoves, effects, result badges).
- Puzzles flow: `app/src/lib/usePuzzle.ts`; sidebar UI: `components/PuzzleSidebar.tsx`, `pages/puzzleUi.tsx`.
- Bots: roster `app/public/data/bots.json` (from chess.com ListBotGroups), strength in `lib/bots.ts` (Stockfish 19 WASM, `lib/engine.ts`), page `pages/Bots.tsx`.
- Progress in localStorage via `lib/storage.ts` (`useStored`, `updateStored`); streaks in `lib/streak.ts`.
- Testing UI: debug Chrome with `--remote-debugging-port=9222` + a small CDP script (bring tab to front before synthetic input).

## Features (done)
Home (chess.com logged-in home), Play Bots, Puzzles/Rush/Daily/Themes, My Games (chess.com public API import), Game Review (`pages/Review.tsx`, `lib/review.ts`: classifications, accuracy calibrated to chess.com, eval graph, coach), Stats, Play a Friend (`pages/Friend.tsx`, PeerJS P2P, `lib/friendGame.ts`), Analysis, Settings (`#/settings`, chess.com layout), Puzzle Path hub (`components/PuzzlePathCard.tsx`), Train Endgames (`#/endgames`, `public/data/endgames.json`), Move Explanations (`lib/explain.ts`), Insights/Advanced Stats (`pages/Stats.tsx`, `lib/insights.ts`). Figurine notation via chess.com "Chess V3" font.

## Codex workflow (DEFAULT: saves Claude tokens)
Use Codex for every task, small fixes included: implementation, evidence digging in `.rea/`, and headless/CDP testing. Claude is the architect: it scopes the task, writes the plan or prompt, reviews the diff, builds, then commits and pushes. Work inline only when that's quicker than writing the prompt. Write `docs/plan-<x>.md` (exact files, values from `.rea/` evidence, acceptance steps), then run
`codex exec -m gpt-6.1-sol -C . -s workspace-write -c sandbox_workspace_write.network_access=true -c model_reasoning_effort=high -o <out.md> "Read AGENTS.md, then implement docs/plan-<x>.md exactly." < /dev/null` (the `< /dev/null` is required or it hangs on stdin). `AGENTS.md` holds Codex's rules (no commits).

## Roadmap / gaps
- Puzzle punish-move arrow, time-bonus rating, Puzzle Path (need logged-in chess.com captures; don't solve puzzles on the user's real account without asking).
- Game Review: Brilliant detection untested.
- Diamond gaps left: Lessons, Play Coach.
- Play a Friend: cross-network (NAT) connectivity untested; may need a TURN server.
- ~~3D piece sets~~ (user doesn't care).

## Working style
User is token-conscious: be concise, ask before big steps, commit + push when a step is done.
