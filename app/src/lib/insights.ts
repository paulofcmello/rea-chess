import { Chess, DEFAULT_POSITION } from 'chess.js'
import { outcome, type CcGame } from './ccGames'
import { accuracyOf } from './review'
import { reviewKey } from './reviewCache'
import { insightReview, type InsightGame, type InsightMove, type InsightReview, type InsightTimeClass } from './insightsStore'

export const PHASES = ['Opening', 'Middlegame', 'Endgame'] as const
export type Phase = typeof PHASES[number]
export const PIECES = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' } as const
export interface GameMove {
  piece: keyof typeof PIECES
  color: 'w' | 'b'
  phase: Phase
  seconds?: number
  clock?: number
}
export interface PreparedGame extends InsightGame {
  startFen: string
  sans: string[]
  headers: Record<string, string>
  key: string
  opening: string
  eco: string
  plies: GameMove[]
}
export interface ReviewedGame extends PreparedGame { review: InsightReview | null }
export interface AnalyzedMove extends GameMove { evaluation: InsightMove; game: ReviewedGame; index: number }
export interface InsightFilters { timeClass: InsightTimeClass | 'all'; color: 'all' | 'w' | 'b'; days: '30' | '90' | '365' | 'all'; source: 'all' | 'chess.com' | 'REA' }

export function importedGame(game: CcGame, username: string): InsightGame | null {
  const me = username.trim().toLowerCase()
  if (![game.white.username, game.black.username].some(n => n.toLowerCase() === me)) return null
  const color = game.white.username.toLowerCase() === me ? 'w' : 'b'
  const player = color === 'w' ? game.white : game.black
  const opponent = color === 'w' ? game.black : game.white
  return { id: game.url, pgn: game.pgn, source: 'chess.com', me: username, color, opponent: opponent.username, rated: game.rated, rating: player.rating, opponentRating: opponent.rating, timeClass: game.time_class, timeControl: game.time_control, playedAt: game.end_time * 1000, result: outcome(game, username), termination: player.result === 'win' ? opponent.result : player.result }
}

const OPENINGS: [string, string, string][] = [
  ['e4 e5 Nf3 Nc6 Bb5', 'C60', 'Ruy Lopez'], ['e4 e5 Nf3 Nc6 Bc4', 'C50', 'Italian Game'],
  ['e4 e5 Nf3 Nf6', 'C42', 'Petrov Defense'], ['e4 e5 f4', 'C30', "King's Gambit"],
  ['d4 d5 c4', 'D06', "Queen's Gambit"], ['d4 Nf6 c4 g6', 'E60', "King's Indian Defense"],
  ['e4 c5', 'B20', 'Sicilian Defense'], ['e4 c6', 'B10', 'Caro-Kann Defense'],
  ['e4 e6', 'C00', 'French Defense'], ['e4 d5', 'B01', 'Scandinavian Defense'],
  ['e4 d6', 'B07', 'Pirc Defense'], ['e4 e5', 'C20', "King's Pawn Game"],
  ['d4 d5', 'D00', "Queen's Pawn Game"], ['d4 Nf6', 'A45', 'Indian Game'],
  ['c4', 'A10', 'English Opening'], ['Nf3', 'A04', 'Réti Opening'], ['b3', 'A01', 'Nimzowitsch-Larsen Attack'],
]
function openingFor(headers: Record<string, string>, sans: string[]) {
  if (headers.Opening) return { opening: [headers.Opening, headers.Variation].filter(Boolean).join(': '), eco: headers.ECO ?? '—' }
  if (headers.ECOUrl) {
    try {
      const slug = decodeURIComponent(new URL(headers.ECOUrl).pathname.split('/').pop() ?? '').replace(/-\d+\..*$/, '').replaceAll('-', ' ')
      if (slug) return { opening: slug, eco: headers.ECO ?? '—' }
    } catch { /* fall through to move detection */ }
  }
  const line = sans.join(' ')
  const match = OPENINGS.find(([prefix]) => line === prefix || line.startsWith(prefix + ' '))
  return { opening: match?.[2] ?? 'Unclassified opening', eco: headers.ECO ?? match?.[1] ?? '—' }
}
function clockSeconds(comment?: string) {
  const match = comment?.match(/\[%clk\s+(\d+):(\d{2}):(\d{2}(?:\.\d+)?)\]/)
  return match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) : undefined
}

export function prepareGames(games: InsightGame[]): PreparedGame[] {
  return games.flatMap(game => {
    try {
      const chess = new Chess()
      chess.loadPgn(game.pgn)
      const headers = chess.getHeaders()
      const startFen = headers.FEN ?? DEFAULT_POSITION
      const history = chess.history({ verbose: true })
      const comments = new Map(chess.getComments().map(c => [c.fen, c.comment]))
      const timed = /^\d+(?:\+\d+)?$/.test(game.timeControl) && game.timeClass !== 'daily'
      const [base, increment = 0] = timed ? game.timeControl.split('+').map(Number) : [0, 0]
      const clocks: Partial<Record<'w' | 'b', number>> = startFen === DEFAULT_POSITION && base > 0 ? { w: base, b: base } : {}
      let endgame = false
      const plies = history.map((move): GameMove => {
        const pieces = move.before.split(' ')[0]
        const nonPawnMaterial = [...pieces.toLowerCase()].reduce((n, p) => n + ({ n: 3, b: 3, r: 5, q: 9 }[p] ?? 0), 0)
        const number = Number(move.before.split(' ')[5])
        endgame ||= nonPawnMaterial <= 14 || (nonPawnMaterial <= 26 && !/q/i.test(pieces)) || number > 40
        const phase: Phase = endgame ? 'Endgame' : number <= 10 ? 'Opening' : 'Middlegame'
        const clock = timed && base > 0 ? clockSeconds(comments.get(move.after)) : undefined
        const previous = clocks[move.color]
        const elapsed = clock != null && previous != null ? previous + increment - clock : undefined
        // A missing clock breaks the chain; never guess the next move's duration.
        clocks[move.color] = clock
        return { piece: move.piece, color: move.color, phase, clock, seconds: elapsed != null && elapsed >= 0 ? elapsed : undefined }
      })
      return [{ ...game, startFen, headers, sans: chess.history(), key: reviewKey(game.pgn, game.id), ...openingFor(headers, chess.history()), plies }]
    } catch { return [] }
  }).sort((a, b) => a.playedAt - b.playedAt)
}

export function filterGames(games: PreparedGame[], filters: InsightFilters, now: number) {
  const since = filters.days === 'all' ? -Infinity : now - Number(filters.days) * 86400000
  return games.filter(g => g.playedAt >= since && (filters.timeClass === 'all' || g.timeClass === filters.timeClass) && (filters.color === 'all' || g.color === filters.color) && (filters.source === 'all' || g.source === filters.source))
}
export function withReviews(games: PreparedGame[]): ReviewedGame[] {
  return games.map(g => {
    const review = insightReview(g.key)
    return { ...g, review: review && review.moves.length === g.plies.length ? review : null }
  })
}
export function analyzedMoves(games: ReviewedGame[]): AnalyzedMove[] {
  return games.flatMap(game => game.review?.moves.flatMap((evaluation, index) => {
    const ply = game.plies[index]
    return evaluation.color === game.color && ply ? [{ ...ply, evaluation, game, index }] : []
  }) ?? [])
}
export function average(values: number[]): number | null { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null }
export function moveAccuracy(moves: AnalyzedMove[]) { return moves.length ? accuracyOf(moves.map(m => m.evaluation)) : null }
export function gameAccuracy(game: ReviewedGame) { return game.review ? game.review.accuracy[game.color] : null }
export function groups<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const label = key(item)
    const bucket = map.get(label) ?? []
    bucket.push(item)
    map.set(label, bucket)
  }
  return [...map.entries()]
}
export function record(games: InsightGame[]) {
  return { win: games.filter(g => g.result === 'win').length, draw: games.filter(g => g.result === 'draw').length, loss: games.filter(g => g.result === 'loss').length }
}
export function dateKey(time: number) {
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function terminationLabel(value: string) {
  const labels: Record<string, string> = { checkmated: 'Checkmate', checkmate: 'Checkmate', resigned: 'Resignation', resign: 'Resignation', resignation: 'Resignation', timeout: 'Timeout', abandoned: 'Abandonment', agreed: 'Agreement', agreement: 'Agreement', repetition: 'Repetition', stalemate: 'Stalemate', insufficient: 'Insufficient material', 'insufficient material': 'Insufficient material', '50move': '50-move rule', '50-move rule': '50-move rule', timevsinsufficient: 'Timeout vs insufficient material' }
  return labels[value] ?? 'Other'
}
