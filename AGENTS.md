# REA Chess — agent instructions (Codex)

Personal chess.com clone. Vite + React + TS, all code in `app/`. Deployed to GitHub Pages from `main` (static, no backend).

- Run: `cd app && npm run dev`. Verify before finishing: `cd app && npx tsc -b && npm run build` (must pass, no new warnings).
- Match surrounding code: function components + hooks, no new dependencies unless the plan says so, plain CSS in `app/src/index.css` using existing `cc-*` classes/variables where possible.
- chess.com assets (icons, pieces, images) are hotlinked from their CDNs, never copied into the repo.
- Persist user data with `useStored` / `load` / `save` from `app/src/lib/storage.ts` (localStorage, `rea-chess:` prefix).
- Do NOT commit, push, or touch `.github/`, `CLAUDE.md`, `.rea/`. Leave changes uncommitted for review.
- When a task comes from `docs/plan-*.md`, follow it exactly; if something in the plan is wrong, do the sensible fix and note it at the end of your final message.
