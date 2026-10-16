# REA Chess

A local, single-player take on chess.com's puzzles and bots. No accounts, no multiplayer.
Progress (puzzle rating, rush scores, bot records, daily streak) is kept in your browser's localStorage.

## Run

```sh
cd app
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in app/dist
```

## Features

- **Puzzles (rated):** Elo-style rating that starts at 800, picks puzzles near your level, with hints (using one fails the puzzle), retry, solution, themes reveal and a recent-results strip.
- **Puzzle Rush:** 3 min / 5 min / Survival, 3 strikes, ramping difficulty, best scores.
- **Daily Puzzle:** the same puzzle for everyone on a given date, with a day streak.
- **Themes:** drill one tactic (mate in N, fork, pin, ...) at 5 difficulty levels, unrated.
- **Play Bots:** 13 bots from 250 to 3200 with personalities and chat, color choice, hints, takebacks, an optional eval bar, a result screen and game review.
- **Analysis:** Stockfish 19 eval bar, top 3 lines, move navigation (arrow keys), FEN/PGN import and export.
- **chess.com look and sound:** all 39 chess.com piece sets, 31 boards and 9 sound themes, plus animation speed, move highlights, legal-move dots and coordinates (Settings).
- **Puzzle page cloned 1:1 from chess.com:** same layout, Chess Sans font, animated coach (their Rive file), speech bubble, footer buttons, correct/incorrect badges and colors, two-step hint, puzzle sounds.
- **Board engine modelled on chess.com's:** 180 ms slides, capture fade-out, drag hover outline, click-again to deselect, right-click square marks and arrows (Shift/Ctrl/Alt colors, L-shaped knight arrows).

## How it was made

The UI and flows were reverse-engineered from chess.com's `/puzzles/rated` and `/play/computer` with
[REA](https://github.com/morluto/rea) (`inspect-web-page`, `capture-web-screenshot`, `analyze-web-bundle`).
The evidence is in `.rea/`. The piece-set list comes from chess.com's own bundle (via REA).

- Puzzles: [Lichess puzzle database](https://database.lichess.org/#puzzles) (CC0), about 4,100 sampled. Run `app/scripts/build-puzzles.sh` to regenerate.
- Engine: [Stockfish.js 19](https://github.com/nmrugg/stockfish.js) lite single-threaded WASM (GPLv3, see `app/public/engine/COPYING.txt`).
- Pieces, boards and sounds: chess.com's, loaded at runtime from `images.chesscomfiles.com` (nothing is copied into this repo). They're chess.com's artwork, so keep this app for personal use and don't publish it with them.
- Bots above 1320 use Stockfish's `UCI_Elo`. Weaker bots sample from MultiPV lines with rating-scaled noise and occasional random moves.
