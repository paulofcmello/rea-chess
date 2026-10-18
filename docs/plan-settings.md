# Plan: Settings page (chess.com /settings)

Read AGENTS.md first. For this plan you MAY write evidence into `.rea/settings/` (screenshots, HTML, CSS); that's the one exception to the `.rea/` rule.

## 0. Capture evidence first (do not guess)
A debug Chrome is running on `localhost:9222`, logged into chess.com (do NOT log out or change any settings on the real account; read only).
- Use REA (`npx rea-agents`, docs at `~/rea`; e.g. `rea inspect-web-page`, `rea capture-web-screenshot`) or raw CDP to open `https://www.chess.com/settings` and each section (Board & Pieces `/settings/board`, Gameplay `/settings/gameplay`, Interface/`/settings/interface`, Sound, Notifications, Profile, etc.; follow the real left-nav links).
- Save one screenshot per section + the computed styles of: left nav (width, item height, icon size, active item colours, font), section header, row layout (label left, control right), toggles (`cc-switch`), selects, the board/piece preview on Board & Pieces.
- Existing exported chess.com CSS is in `.rea/css/` (look for `cc-switch`, `cc-select`, `settings`).

## 1. Route + page
- Settings is currently a modal in `app/src/App.tsx` (`showSettings`, `open-settings` event). Replace it with a full page route `#/settings` (add to the routes map in App.tsx; nav "Settings" button and the `open-settings` event both navigate there). Optional subroute `#/settings/<section>`.
- New `app/src/pages/Settings.tsx`. Layout like chess.com: left vertical nav of sections (icon + label, active highlight), right content card with section title and rows (label + optional description on the left, control on the right). Mobile ≤760px: nav becomes a horizontal scroll row on top.
- Use chess.com icons hotlinked (same CDN/`ICONS` base already used in App.tsx; find the real settings section icon URLs in the capture).

## 2. Sections (only what makes sense for REA Chess: no account/membership/privacy/email/notifications/friends/payments)
Extend `Settings` + `defaultSettings` in `app/src/lib/storage.ts` (merged over defaults, so old saves keep working). Wire every setting into real behaviour — no dead toggles. If a setting can't be wired cheaply, leave it out.
- **Board & Pieces**: piece set, board theme (existing), live board preview (use `BoardPreview` or `Board` with a fixed FEN), coordinates (off / inside / outside if Board supports it, otherwise on/off), highlight moves, show legal moves, piece animation speed (existing), piece notation: figurine vs letter (`glyphs.tsx` / move lists), show board arrows/right-click marks on/off.
- **Gameplay**: auto-promote to queen (Board promotion picker skipped; holding a modifier still opens picker if easy), premoves on/off (Bots + Friend `premoveColor`), confirm resign/draw, "Always play as" default colour for bots (white/black/random → Bots page initial `colorChoice`), move method: click+drag / drag only / click only (Board pointer handling).
- **Sound**: sound on/off, sound theme (existing), volume slider (wire into `lib/sound.ts`), "play sound on premove"? only if trivial.
- **Puzzles**: show timer in puzzles on/off, auto-advance to next puzzle on success on/off (check `lib/usePuzzle.ts`), puzzle rating visible on/off.
- **Analysis / Review**: engine depth (Analysis), show eval bar (Review/Analysis), show best-move arrow, coach on/off in Review.
- **Interface**: reduce motion (disables tooltips/slide animations), show move list as figurine/letters (if not in Board section), compact sidebar? only if real.
- **Data**: chess.com username for imports (existing import username storage), export all REA data (download JSON of every `rea-chess:` localStorage key), import from JSON file, reset progress (confirm via in-page dialog, NOT `window.confirm`).

## 3. Acceptance
1. `cd app && npx tsc -b && npm run build` passes, no new warnings.
2. `#/settings` renders all sections; nav "Settings" opens it; old modal code removed.
3. Toggling each setting changes behaviour (spot-check via CDP on the dev server: coordinates, legal-move dots, auto-queen, volume 0 = silent).
4. At 390px: no horizontal page scroll.
5. Save comparison screenshots (REA vs chess.com) into `.rea/settings/compare/`.
6. Do not commit. Final message: files changed, which chess.com settings you skipped and why, deviations.
