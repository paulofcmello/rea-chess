import { load, save, updateStored } from './storage'
import type { CcGame } from './ccGames'
import type { Review, ReviewedMove } from './review'

export const RESULT_COLORS = { win: '#81b64c', draw: '#8b8987', loss: '#fa412d' }

export type InsightTimeClass = CcGame['time_class'] | 'untimed'
export interface InsightGame {
  id: string
  pgn: string
  source: 'chess.com' | 'REA'
  me: string
  color: 'w' | 'b'
  opponent: string
  rated?: boolean
  rating?: number
  opponentRating?: number
  timeClass: InsightTimeClass
  timeControl: string
  playedAt: number
  result: 'win' | 'draw' | 'loss'
  termination: string
}
export type InsightMove = Pick<ReviewedMove, 'san' | 'uci' | 'color' | 'cls' | 'before' | 'after'>
export interface InsightReview { accuracy: Review['accuracy']; moves: InsightMove[] }

export function rememberImportedGames(username: string, games: CcGame[]) {
  const key = `games:${username.trim().toLowerCase()}`
  updateStored<CcGame[]>(key, [], (previous) => [...new Map([...previous, ...games].map(g => [g.url, g])).values()].sort((a, b) => a.end_time - b.end_time))
}

export function rememberLocalGame(game: InsightGame) {
  updateStored<InsightGame[]>('insights:localGames', [], games => [...games.filter(g => g.id !== game.id), game])
}

/** Compact summaries outlive the 30 full reviews retained for interactive playback. */
export function rememberInsightReview(key: string, review: Review) {
  const summary: InsightReview = {
    accuracy: review.accuracy,
    moves: review.moves.map(({ san, uci, color, cls, before, after }) => ({ san, uci, color, cls, before, after })),
  }
  save(`insights:${key}`, summary)
  updateStored('insights:reviewVersion', 0, n => n + 1)
}

export function insightReview(key: string): InsightReview | null {
  return load<InsightReview | null>(`insights:${key}`, null) ?? load<Review | null>(key, null)
}

export function timeClassFor(control: string): InsightTimeClass {
  if (!control || control === '-' || control === '0') return 'untimed'
  if (control.includes('/')) return 'daily'
  const [base, inc = 0] = control.split('+').map(Number)
  const duration = base + 40 * inc
  return duration < 180 ? 'bullet' : duration < 600 ? 'blitz' : 'rapid'
}

export function localGameId(peerId: string, round: number) { return `rea:friend:${peerId}:${round}` }
