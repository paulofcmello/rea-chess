# Plan: "My Games" — import chess.com games into Analysis

Goal: user enters their chess.com username once; a new page lists their games (newest first) and one click opens a game on the existing Analysis board. Pure client-side, no auth, no download.

## API (verified)
chess.com Published-Data API, CORS `Access-Control-Allow-Origin: *`, no key. Use plain `fetch` (browser sends a UA; no custom headers needed).

- `GET https://api.chess.com/pub/player/{username_lowercase}/games/archives`
  → `{ "archives": ["https://api.chess.com/pub/player/x/games/2023/01", ..., ".../2026/10"] }` (oldest → newest). 404 = unknown user.
- `GET <archive url>` → `{ "games": [Game, ...] }` (oldest → newest within the month).

Game fields used (others ignored):
```ts
interface CcGame {
  url: string            // https://www.chess.com/game/live/185399382196
  pgn: string            // full PGN with headers + {[%clk 0:04:59.9]} comments
  time_control: string   // "300", "180+2", "1/86400" (daily)
  end_time: number       // unix seconds
  rated: boolean
  time_class: 'bullet' | 'blitz' | 'rapid' | 'daily'
  rules: string          // only show rules === 'chess'
  initial_setup?: string // start FEN
  white: { username: string; rating: number; result: string }
  black: { username: string; rating: number; result: string }
}
```
`result` values: `win`, `checkmated`, `resigned`, `timeout`, `abandoned`, `agreed`, `repetition`, `stalemate`, `insufficient`, `50move`, `timevsinsufficient`, `lose`, `bughousepartnerlose`. Win = `win`; draw = one of `agreed|repetition|stalemate|insufficient|50move|timevsinsufficient`; otherwise loss.

## Files

### 1. `app/src/lib/ccGames.ts` (new)
- `export interface CcGame` (above).
- `fetchArchives(username): Promise<string[]>` — returns archive URLs **newest first**. Throw `Error('User not found')` on 404, generic error otherwise.
- `fetchMonth(url): Promise<CcGame[]>` — returns games with `rules === 'chess'`, **newest first**.
- In-memory cache (`Map<string, Promise<...>>`) per URL so revisiting the page/month doesn't refetch. Do NOT cache the current (last) month across reloads; no localStorage caching needed.
- `gameToAnalysis(g: CcGame, me: string): { fen: string; sans: string[]; orientation: 'white' | 'black' }`
  - `new Chess()` from chess.js, `loadPgn(g.pgn)`; `sans = c.history()`; `fen = c.getHeaders().FEN ?? g.initial_setup ?? START`.
  - If `loadPgn` throws on the clock comments, strip `\{[^}]*\}` from the PGN and retry.
  - `orientation` = side whose username equals `me` (case-insensitive), default white.
- `outcome(g, me): 'win' | 'loss' | 'draw'` using the rules above.

### 2. `app/src/pages/Games.tsx` (new, default export `Games`)
Layout: reuse the same page shell other pages use (look at `Analysis.tsx` / `Bots.tsx` for the main+sidebar structure and `cc-*` classes; simplest acceptable: a single centered content column using existing panel/card styles).

State:
- `const [username, setUsername] = useStored('ccUsername', '')`
- input + "Load games" button when no username or user clicks "Change". Trim, lowercase for API calls; keep display as typed.
- On username set: `fetchArchives` → months list; select newest month; `fetchMonth` it.
- Month selector (`<select>`, label like "October 2026") listing all archives newest first.
- Loading state ("Loading games…"), error state (show message + keep input visible), empty month ("No games this month").

Game row (button, whole row clickable), one per game, newest first:
- Result marker: small square badge — win green `#81b64c` "+", loss red `#fa412d` "−", draw grey `#8b8987` "=".
- Time-class icon: hotlink `https://assets-ds.chess.com/color-icons/{bullet|blitz|rapid|daily}.svg` (if one 404s, fall back to text label). Plus time control text formatted: `"300"`→`5 min`, `"180+2"`→`3 | 2`, `"1/86400"`→`1 day`.
- Players: `White (rating)` vs `Black (rating)`, user's own name bold.
- Date: `new Date(end_time*1000).toLocaleDateString()` short format.
- Small external link icon/text "chess.com ↗" to `g.url` (`target="_blank" rel="noreferrer"`, `stopPropagation` so it doesn't open analysis).
- onClick: `const a = gameToAnalysis(g, username); openInAnalysis(a.fen, a.sans, a.orientation)` — `openInAnalysis` already exists, exported from `app/src/pages/Analysis.tsx` (it writes sessionStorage and sets `location.hash = '#/analysis'`).

### 3. `app/src/App.tsx`
Add route between `themes` and `analysis`:
```ts
games: { label: 'My Games', icon: 'archive', el: Games },
```
Icon URL pattern is `${ICONS}/${icon}.svg` with `ICONS = 'https://assets-ds.chess.com/color-icons'`. If `archive.svg` doesn't exist, try `chess-board.svg`, then `binoculars.svg` (check with `curl -sI`).

### 4. `app/src/pages/Analysis.tsx`
When opened via `openInAnalysis` with moves, it currently starts at the last ply (`useState(init.sans.length)`). Keep that. No other change needed — verify the board, move list and engine work with an imported game.

### 5. CSS (`app/src/index.css`)
Add a `/* My Games */` section at the end. Dark chess.com look: rows `background: rgba(255,255,255,.04)`, hover `rgba(255,255,255,.08)`, `border-radius: 5px`, gap 4px, padding `10px 12px`, text `#fff`/muted `rgba(255,255,255,.72)`. Must work at 360px wide (wrap/ellipsis, no horizontal scroll).

## Acceptance (do all)
1. `cd app && npx tsc -b && npm run build` passes.
2. Quick logic check with node (e.g. a temporary script, delete after): for username `paulom18`, archives load, latest month has games, `gameToAnalysis` on the first 20 games returns `sans.length > 0` for every non-empty game and never throws.
3. Unknown username (`zz-not-a-user-9x7`) shows "User not found", page doesn't crash.
4. Leave everything uncommitted. Final message: list files changed and anything that deviated from this plan.
