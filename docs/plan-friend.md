# Plan: Play a Friend (online, peer-to-peer)

New route `friend` ("Play a Friend") — two people play live over WebRTC via **PeerJS** (no backend; uses the free public PeerJS cloud signaling server). Static GitHub Pages compatible. Read AGENTS.md first.

## Dependency
`cd app && npm install peerjs` (allowed by this plan). Import `Peer` from `peerjs`. Peer ids: `rea-chess-` + 8 random base36 chars.

## Flow
1. **Lobby** (`#/friend`): sidebar like Play Bots (`cc-sidebar`, header icon `https://assets-ds.chess.com/color-icons/friends.svg`, title "Play a Friend"). Options: time control chips (chess.com style toggle buttons) `1 min`, `3 | 2`, `5 min`, `10 min`, `30 min`, `No timer`; color: White / Random / Black (same piece-icon toggle as Bots `bots-color` buttons). Green "Create Invite Link".
2. After create: show the link `${location.origin}${location.pathname}#/friend?join=<peerId>` in a readonly input + "Copy" button (navigator.clipboard) + "Waiting for your friend…" with a spinner. Keep the Peer open.
3. **Guest** opening `#/friend?join=<id>`: creates its own Peer, `peer.connect(id, { reliable: true })`, sends `hello`. Host replies `start` with settings; both render the game.
4. Name: stored `ccUsername` if set else "Guest"; exchanged in `hello`. Avatars via `fetchAvatar` (`app/src/lib/ccGames.ts`) when a username is known.

## Protocol (JSON over the DataConnection)
```ts
type Msg =
 | { t: 'hello'; name: string }
 | { t: 'start'; hostColor: 'w'|'b'; base: number /*ms, 0 = untimed*/; inc: number /*ms*/; name: string }
 | { t: 'move'; ply: number; uci: string; clocks: { w: number; b: number }; sentAt: number }
 | { t: 'resign' } | { t: 'draw-offer' } | { t: 'draw-accept' } | { t: 'draw-decline' }
 | { t: 'abort' } | { t: 'rematch-offer' } | { t: 'rematch-accept' }
 | { t: 'chat'; text: string } | { t: 'ping'; at: number } | { t: 'pong'; at: number }
```
- The mover is authoritative for its own clock: on making a move, subtract elapsed think time, add increment, send `clocks`. Receiver applies the move (validate with chess.js; ignore illegal/duplicate `ply`) and adopts the clocks. Locally tick the side to move every 100ms; flag fall on your own clock ends the game (send `resign`-equivalent result `timeout` — add `{ t: 'flag' }` if cleaner).
- Rematch swaps colors.
- Heartbeat ping every 3s; if no pong for 10s show "Opponent disconnected — waiting…" banner; PeerJS `reconnect()` on peer `disconnected`. Persist `{ peerId, role, settings, sans, clocks }` in sessionStorage so a refresh resumes (host re-opens the same peer id; guest reconnects to it).

## Game UI (reuse, don't rewrite)
- Same board layout as `app/src/pages/Bots.tsx` during a game: player bars top/bottom with clocks (chess.com clock boxes; active clock highlighted, low-time red under 20s), `Board` with `movable` = my color, **premoves** (copy the Bots premove wiring), move sounds (`playMove` from `app/src/lib/sound.ts`), check/capture highlights, result badges on game end (same as Bots).
- Sidebar during the game: move list (`MoveList` from `ui.tsx`), buttons: Draw offer (½), Resign (flag), Abort (only before both made a move); incoming draw offer shows Accept/Decline inline. Small chat box (last 50 messages, Enter to send).
- Game over: same game-over modal style as Bots (result title, reason: checkmate / resignation / timeout / agreement / stalemate / repetition / insufficient material), buttons "Rematch", "Game Review" (uses `openReview` from `app/src/pages/Review.tsx` with a PGN built by chess.js, white/black names), "New Invite".
- Add the route in `app/src/App.tsx` (visible in nav, label "Play a Friend", icon `friends`). The Home page links to `#/friend` already.

## Acceptance
1. `cd app && npx tsc -b && npm run build` passes, no new warnings.
2. Pure protocol/clock logic factored into `app/src/lib/friendGame.ts` with a node check (temp, delete): applying a legal move updates sans + clocks, illegal or duplicate ply is ignored, increment applied.
3. Do not commit. Final message: files changed + deviations + anything the reviewer must test manually (two browser tabs).
