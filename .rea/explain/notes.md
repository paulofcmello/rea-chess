# Game Review explanations — evidence and implementation

Captured 2026-10-18 through read-only navigation of debug Chrome on localhost:9222. Local verification used http://localhost:5179/#/review. No games were played, account settings changed, or reviews uploaded.

## Reference observations

- Own finished reference game: https://www.chess.com/analysis/game/live/185342069780?tab=review (PauloM18–sparta-et). Chess.com canonicalizes this to /review.
- Per-move coach headings show SAN, classification and evaluation. Controls observed: Explain, Best, Next; expanded mode shows Explaining, a continuation on the board, an inserted variation, and Got it! to return. The separate Show Follow-Up label did not appear in this account's captured positions; REA implements the plan's requested label and step/play/pause/return controls.
- Opening/positional wording captured: a central pawn advance gains influence and restricts counterplay. Capture wording: an equal trade after the captures resolve. See coach-captures.json, move-captures.json, coach-details.json and coach-explanation-complete.json. Some intermediate screenshots contain text still streaming; chesscom-explanation-complete.png contains the completed equal-trade phrase.
- Best alternatives are available on inaccurate moves (e.g. ...b6 and Nc3). Explain temporarily shows another board position and variation rather than editing the game. Threat markings in the final inspected reference position were empty; no server threat-square payload was exposed there.
- Network sample: network-82088-1260.json, GET /callback/analysis/game/live/185342069780/all, HTTP 200. Actual JSON is {data:null,selfAnalysis:[],pgn:null,analysisLogExists:true}; it does **not** contain the populated classifications/explanation/threat/line fields anticipated by the plan. This is retained verbatim rather than inventing a server schema.
- The loaded tab-review script exposes a binary CEE client/gamePoint path and a UCI alternative. The reference also loads an encoded coach text/audio asset (phrase-asset.json); it is not plain JSON. No decoder, proprietary full phrase table or external service is needed by REA.
- Existing .rea/scripts/ exports were searched for coach/explanation/follow-up/tactical phrase tables. They principally contain puzzle and navigation code; no usable review phrase table was found. chesscom-tab-review.js is a reference capture from this session, stored only in this permitted evidence folder.

## Template catalogue implemented

Immediate consequences take priority over alternatives, with mover-relative language for both colours:

1. Hanging/en-prise moved or other piece: piece, square, legal attacker and attacker square; red arrows. Uses attack/defence counts and lower-value attackers, with legal-capture validation to exclude pinned attackers.
2. Allows forced mate in N, including terminal checkmate and signed white-perspective mate scores.
3. Missed forced mate, compared before/after for the mover.
4. Missed winning material / wins material, measured over the first up to four legal PV plies.
5. Fork, pin, skewer and discovered attack in the played move, best line or opponent refutation; concrete pieces and squares.
6. Trapped piece: vulnerable piece has no legal unattacked destination.
7. Back-rank weakness when the opponent has forced mate and the king is boxed in by its pawns.
8. Passed-pawn promotion threats, including promotion SAN in the continuation.
9. Losing the exchange: refutation captures a rook in return for a bishop/knight with a material loss.
10. Stalemate traps, including a missed saving stalemate in the best line.
11. Development from the back rank; castling; increased central control; existing ECO book classification.
12. Trading when ahead; pushing a passed pawn; improved king safety; pawn-shield weakening near a castled king.
13. Classification-specific neutral fallback when the position does not establish one of these facts.
14. Best was SAN, which ...: verified motif/capture/castling/activation/mate reason, with a neutral engine-evaluation reason when no stronger board fact is established.

Phrases are deterministic client-side templates in the concise coach style of the captures, filled with SAN/pieces/squares. They are heuristics grounded in board geometry and the retained Stockfish line, not an exhaustive tactical proof or remote generated commentary. No unsupported motif is guessed when a line is absent or illegal.

## Files and behavior

- app/src/lib/explain.ts: pure detectors, validated PV board positions, cached lazy explanations (WeakMap by immutable reviewed move and FEN), best/threat arrows.
- app/src/lib/review.ts: retains the best PV from before the move and the refutation from after it (up to 12 plies).
- app/src/lib/reviewCache.ts: older cached reviews without PVs are recomputed once; normal cache storage still uses load/save.
- app/src/components/Coach.tsx: short bubble text and accessible expandable explanation.
- app/src/pages/Review.tsx: green Best arrow on the correct pre-move board, red threats on the played position, best/refutation autoplay and manual steps, pause, return, Escape, navigation resets, existing retry integration.
- app/src/index.css: coach expansion and continuation controls using existing review/cc styles.
- app/scripts/test-explanations.mjs: standalone Node detector harness using the existing TypeScript compiler; temporary compilation is removed afterward.

## Verification

- detector-tests.txt: 20 FEN+move fixtures, plus memoization, invalid-PV truncation and sound-sacrifice safeguards. Includes all eight mandatory cases, additional geometry/endgame motifs and both colours.
- ui-checks.json: CDP assertions on the actual imported own finished game Gracetamayo–PauloM18, https://www.chess.com/game/live/185399382196. Black 22...exf3 is the tested blunder, White 6.d3 is the tested best move. Follow-up changes the board; return restores it; best line starts before the move; retry accepts the exact engine best move; Escape exits playback; 390px layout has no horizontal overflow.
- compare/rea-blunder-explain.png and compare/rea-best-explain.png: requested expanded screenshots. Follow-up and mobile screenshots are also present.
- build.txt: npx tsc -b and npm run build pass with no build warnings. Full npm run lint output was compared as a set of lines against its pre-change baseline: zero added warnings (existing warnings remain).
- No dependencies, commits, pushes or changes outside the authorized source/test/evidence scope.

## Deviations from assumptions in the plan

The live callback returned an empty analysis payload and the coach phrase asset was encoded; populated server explanation JSON and a tactical phrase table were unavailable. The captures document the actual response/UI, and the app uses deterministic board/engine templates. The account showed Explain continuation playback with Got it! rather than a separate Show Follow-Up button; REA still supplies all explicitly requested playback controls. Old review caches require one recomputation because they did not retain engine lines.
