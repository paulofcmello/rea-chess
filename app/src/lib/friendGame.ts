import { Chess } from 'chess.js'

export type Color = 'w' | 'b'
export interface FriendSettings { hostColor: Color; base: number; inc: number }
export interface Clocks { w: number; b: number }
export interface FriendResult {
  winner: Color | null
  reason: 'checkmate' | 'resignation' | 'timeout' | 'agreement' | 'stalemate' | 'repetition' | 'insufficient material' | '50-move rule' | 'aborted'
}
export interface FriendGame {
  sans: string[]
  clocks: Clocks
  turnStartedAt: number
  result: FriendResult | null
  round: number
}
export type Msg =
  | { t: 'hello'; name: string; state?: FriendGame }
  | { t: 'start'; name: string; state?: FriendGame } & FriendSettings
  | { t: 'move'; ply: number; uci: string; clocks: Clocks; sentAt: number }
  | { t: 'resign' | 'draw-offer' | 'draw-accept' | 'draw-decline' | 'abort' | 'rematch-offer' | 'rematch-accept' | 'flag' }
  | { t: 'chat'; text: string }
  | { t: 'ping' | 'pong'; at: number }

export const opposite = (color: Color): Color => color === 'w' ? 'b' : 'w'
export function position(sans: string[]) {
  const chess = new Chess()
  for (const san of sans) chess.move(san)
  return chess
}
export function boardResult(chess: Chess): FriendResult | null {
  if (chess.isCheckmate()) return { winner: opposite(chess.turn()), reason: 'checkmate' }
  if (chess.isStalemate()) return { winner: null, reason: 'stalemate' }
  if (chess.isInsufficientMaterial()) return { winner: null, reason: 'insufficient material' }
  if (chess.isThreefoldRepetition()) return { winner: null, reason: 'repetition' }
  if (chess.isDraw()) return { winner: null, reason: '50-move rule' }
  return null
}
export function newFriendGame(settings: FriendSettings, now: number, round = 0): FriendGame {
  return { sans: [], clocks: { w: settings.base, b: settings.base }, turnStartedAt: now, result: null, round }
}
export function currentClocks(game: FriendGame, settings: FriendSettings, now: number): Clocks {
  if (!settings.base || game.result) return game.clocks
  const turn = game.sans.length % 2 === 0 ? 'w' : 'b'
  return { ...game.clocks, [turn]: Math.max(0, game.clocks[turn] - Math.max(0, now - game.turnStartedAt)) }
}
export function validClocks(value: unknown): value is Clocks {
  const c = value as Clocks | null
  return !!c && Number.isFinite(c.w) && Number.isFinite(c.b) && c.w >= 0 && c.b >= 0
}
/** Untrusted moves never mutate state, including illegal/out-of-order/duplicate plies. */
export function applyFriendMove(game: FriendGame, msg: Extract<Msg, { t: 'move' }>, now: number): FriendGame {
  if (game.result || msg.ply !== game.sans.length + 1 || !validClocks(msg.clocks) || !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(msg.uci)) return game
  try {
    const chess = position(game.sans)
    const move = chess.move({ from: msg.uci.slice(0, 2), to: msg.uci.slice(2, 4), promotion: msg.uci[4] })
    return { ...game, sans: [...game.sans, move.san], clocks: { ...msg.clocks }, turnStartedAt: now, result: boardResult(chess) }
  } catch { return game }
}
export function makeFriendMove(game: FriendGame, settings: FriendSettings, color: Color, uci: string, now: number): { game: FriendGame; message: Extract<Msg, { t: 'move' }> } | null {
  if (game.result || position(game.sans).turn() !== color) return null
  const clocks = currentClocks(game, settings, now)
  if (settings.base && clocks[color] <= 0) return null
  if (settings.base) clocks[color] += settings.inc
  const message = { t: 'move' as const, ply: game.sans.length + 1, uci, clocks, sentAt: now }
  const next = applyFriendMove(game, message, now)
  return next === game ? null : { game: next, message }
}
export function validSettings(value: unknown): value is FriendSettings {
  const s = value as FriendSettings | null
  return !!s && (s.hostColor === 'w' || s.hostColor === 'b') && Number.isFinite(s.base) && s.base >= 0 && s.base <= 86400000 && Number.isFinite(s.inc) && s.inc >= 0 && s.inc <= 60000
}
export function validGame(value: unknown): value is FriendGame {
  const g = value as FriendGame | null
  if (!g || !Array.isArray(g.sans) || g.sans.some((san) => typeof san !== 'string') || g.sans.length > 10000 || !validClocks(g.clocks) || !Number.isFinite(g.turnStartedAt) || !Number.isInteger(g.round) || g.round < 0) return false
  if (g.result && (!['w', 'b', null].includes(g.result.winner) || !['checkmate', 'resignation', 'timeout', 'agreement', 'stalemate', 'repetition', 'insufficient material', '50-move rule', 'aborted'].includes(g.result.reason))) return false
  try { position(g.sans); return true } catch { return false }
}
/** Only a matching history can extend the local game during reconnect. */
export function reconcileGame(local: FriendGame, remote: FriendGame): FriendGame {
  if (remote.round !== local.round || remote.sans.length < local.sans.length || !local.sans.every((san, i) => remote.sans[i] === san)) return local
  if (local.result) return local
  return remote.sans.length > local.sans.length || remote.result ? remote : local
}
