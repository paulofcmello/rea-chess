Implemented the Puzzle Path hub with persistent points, 20-tile levels, streaks, rotating coach tips, and pawn/progress animations.

Changed `PuzzlePathCard.tsx`, `puzzlePath.ts`, `usePuzzle.ts`, `Puzzles.tsx`, and `index.css`.

TypeScript/build pass with no new warnings. Browser checks passed for solving, retry awards, level rollover, persistence, and mobile layout.

Found chess.com’s stats and points-config endpoints; used their normal awards: **30 points per solve, 5 after retry/help**.

[Visual comparison](/Users/paulomello/REA%20Chess/.rea/puzzle-path/compare/index.html) · [Evidence and details](/Users/paulomello/REA%20Chess/.rea/puzzle-path/notes.md)

Adaptations: CDP replaced the unavailable REA CLI; CSS and hotlinked SVGs replace Rive. Server bonuses and optional Home integration were omitted. Changes remain uncommitted.