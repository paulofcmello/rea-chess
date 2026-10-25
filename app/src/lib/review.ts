import { Chess } from 'chess.js'
import type { Engine, EngineLine, SearchResult } from './engine'
import { buildPositions, material } from './game'
import { REVIEW_CALIBRATION } from './reviewCalibration'

export type Classification = 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'miss' | 'blunder' | 'forced'
export interface PlyEval { cp?: number; mate?: number }
export interface ReviewedMove {
  san: string; uci: string; color: 'w' | 'b'; cls: Classification
  before: PlyEval; after: PlyEval; best: string; bestSan: string; loss: number
  /** UCI continuations from before the move and after it, respectively. */
  bestLine?: string[]; refutation?: string[]
}
export interface Review {
  moves: ReviewedMove[]
  evals: PlyEval[]
  accuracy: { w: number; b: number }
  counts: { w: Record<Classification, number>; b: Record<Classification, number> }
  /** Leading book plies used for this review (absent in reviews made before the opening book). */
  book?: number
  gameRating?: { w: number | null; b: number | null }
  ratings?: PlayerRatings
  calibrationVersion?: number
}
export interface PlayerRatings { w?: number; b?: number }

export const CLASSIFICATIONS: Classification[] = ['brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'miss', 'blunder', 'forced']
export const CLASS_COLOR: Record<Classification, string> = {
  brilliant: '#26C2A3', great: '#749BBF', best: '#81B64C', excellent: '#81B64C', good: '#95B776',
  book: '#D5A47D', inaccuracy: '#F7C631', mistake: '#FFA459', miss: '#FF7769', blunder: '#FA412D', forced: '#81B64C',
}
export const CLASS_LABEL: Record<Classification, string> = {
  brilliant: 'Brilliant', great: 'Great', best: 'Best', excellent: 'Excellent', good: 'Good', book: 'Book',
  inaccuracy: 'Inaccuracy', mistake: 'Mistake', miss: 'Miss', blunder: 'Blunder', forced: 'Forced',
}
export const BAD_MOVES: Classification[] = ['inaccuracy', 'mistake', 'miss', 'blunder']
export const MARKED_MOVES: Classification[] = ['brilliant', 'great', ...BAD_MOVES]

export function ep(cp: number, rating = 1500) {
  const scale = REVIEW_CALIBRATION.epScale * Math.exp(REVIEW_CALIBRATION.epRatingSlope * ((Number.isFinite(rating) ? rating : 1500) - 1500) / 1000)
  return 1 / (1 + Math.exp(-scale * cp))
}

/** Expected points from a white-perspective evaluation, for either player. */
export function expectedPoints(score: PlyEval, color: 'w' | 'b' = 'w', rating?: number) {
  // A terminal mate has mate=0 and a signed cp sentinel to retain the winner.
  const white = score.mate != null
    ? ((score.mate === 0 ? (score.cp ?? 0) : score.mate) > 0 ? 1 : 0)
    : ep(score.cp ?? 0, rating)
  return color === 'w' ? white : 1 - white
}

export interface ClassifyInput {
  loss: number
  played: string
  best: string
  legalMoves?: number
  ply?: number
  bookPlies?: number
  sacrifice?: boolean
  beforeEP?: number
  afterEP?: number
  secondGap?: number
  previousClass?: Classification
  previousEP?: number
}
export function classifyMove({ loss, played, best, legalMoves, ply = 0, bookPlies = 0, sacrifice = false, beforeEP = 0.5, afterEP = 0.5, secondGap = 0, previousClass, previousEP }: ClassifyInput): Classification {
  if (legalMoves === 1) return 'forced'
  if (ply < bookPlies) return 'book'
  if (loss <= 0.02 && sacrifice && beforeEP < 0.9 && afterEP >= 0.5) return 'brilliant'
  if (played === best && secondGap >= 0.15 && beforeEP < 0.9) return 'great'
  if (played === best || loss <= 0.001) return 'best'
  if (previousClass && ['mistake', 'blunder', 'inaccuracy'].includes(previousClass) && loss >= 0.05 && previousEP != null && afterEP < previousEP) return 'miss'
  if (loss <= 0.02) return 'excellent'
  if (loss <= 0.05) return 'good'
  if (loss <= 0.10) return 'inaccuracy'
  if (loss <= 0.20) return 'mistake'
  return 'blunder'
}

/** Arithmetic/harmonic mean of per-move Lichess accuracies, rounded to one decimal. */
export function accuracyOf(moves: (Pick<ReviewedMove, 'before' | 'after' | 'color' | 'cls'> & { rating?: number })[], rating?: number) {
  if (!moves.length) return 100
  const values = moves.map((m) => {
    if (m.cls === 'book' || m.cls === 'forced') return 100
    const playerRating = rating ?? m.rating
    const drop = 100 * (expectedPoints(m.before, m.color, playerRating) - expectedPoints(m.after, m.color, playerRating))
    return Math.max(0, Math.min(100, 103.1668 * Math.exp(-REVIEW_CALIBRATION.accuracyK * drop) - 3.1669))
  })
  const arithmetic = values.reduce((a, b) => a + b, 0) / values.length
  const harmonic = values.includes(0) ? 0 : values.length / values.reduce((a, b) => a + 1 / b, 0)
  const weight = REVIEW_CALIBRATION.arithmeticWeight
  return Math.round((weight * arithmetic + (1 - weight) * harmonic) * 10) / 10
}

/** null means too few moves; undefined means a validated model or player rating is unavailable. */
export function gameRatingOf(input: {
  accuracy: number; rating?: number; opponentRating?: number; opponentAccuracy: number; moveCount: number
}): number | null | undefined {
  if (input.moveCount < REVIEW_CALIBRATION.minimumMoves) return null
  const model = REVIEW_CALIBRATION.gameRating
  if (!model || model.features.some(feature => !Number.isFinite(input[feature]))) return undefined
  const value = model.coefficients[0] + model.features.reduce((sum, feature, i) => sum + model.coefficients[i + 1] * input[feature]!, 0)
  return Math.max(0, Math.round(value / 50) * 50)
}

/** Refresh derived summaries from cached evals without running Stockfish again. */
export function refreshReview(review: Review, ratings: PlayerRatings = review.ratings ?? {}): Review {
  const sides = { w: review.moves.filter(m => m.color === 'w'), b: review.moves.filter(m => m.color === 'b') }
  const accuracy = { w: accuracyOf(sides.w, ratings.w), b: accuracyOf(sides.b, ratings.b) }
  const rating = (color: 'w' | 'b') => {
    const opponent = color === 'w' ? 'b' : 'w'
    return gameRatingOf({ accuracy: accuracy[color], rating: ratings[color], opponentRating: ratings[opponent], opponentAccuracy: accuracy[opponent], moveCount: sides[color].length })
  }
  const w = rating('w'), b = rating('b')
  return { ...review, accuracy, ratings, calibrationVersion: REVIEW_CALIBRATION.classificationVersion,
    gameRating: w !== undefined && b !== undefined ? { w, b } : undefined }
}

/** Counts SAN tokens after the opening name's first numbered move in ECOUrl. */
export function bookPliesFromEcoUrl(url?: string): number {
  if (!url) return 0
  try {
    const slug = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '')
    const start = slug.search(/-\d+\.+/)
    if (start < 0) return 0
    const opening = slug.slice(start + 1)
    const token = /(?:^|-)(?:(\d+)(\.{1,3}))?((?:O-O(?:-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?)[+#]?)(?=-|$)/g
    let plies = 0
    let consumed = 0
    for (const match of opening.matchAll(token)) {
      if (match.index !== consumed) return 0
      plies++
      consumed = match.index + match[0].length
    }
    if (consumed !== opening.length) return 0
    return plies
  } catch { return 0 }
}

function toWhite(line: EngineLine, turn: 'w' | 'b'): PlyEval {
  const sign = turn === 'w' ? 1 : -1
  if (line.mate != null) return { mate: line.mate * sign }
  if (line.cp == null) throw new Error('The engine returned no evaluation. Please try again.')
  return { cp: line.cp * sign }
}
function uciMove(chess: Chess, uci: string) {
  return chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
}
function isSacrifice(beforeFen: string, afterFen: string, pv: string[], color: 'w' | 'b') {
  if (!pv.length) return false
  const chess = new Chess(afterFen)
  try {
    const reply = uciMove(chess, pv[0])
    if (!reply.captured || ({ p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }[reply.captured] < 3)) return false
    if (pv[1]) uciMove(chess, pv[1])
    const sign = color === 'w' ? 1 : -1
    return sign * (material(chess.fen()).diff - material(beforeFen).diff) <= -2
  } catch { return false }
}

// bookPlies is optional because opening metadata lives in the PGN, outside SAN/startFen.
export async function reviewGame(startFen: string, sans: string[], engine: Pick<Engine, 'search'>, onProgress: (done: number, total: number) => void, bookPlies = 0, ratings: PlayerRatings = {}): Promise<Review> {
  const { fens } = buildPositions(startFen, sans)
  const evals: PlyEval[] = []
  const searches: (SearchResult | null)[] = []
  onProgress(0, fens.length)
  for (const fen of fens) {
    const chess = new Chess(fen)
    if (chess.isCheckmate()) {
      evals.push({ mate: 0, cp: chess.turn() === 'w' ? -100000 : 100000 })
      searches.push(null)
    } else if (chess.isStalemate()) {
      evals.push({ cp: 0 })
      searches.push(null)
    } else {
      const result = await engine.search(fen, { depth: 14, multipv: 2 })
      if (!result?.lines[0]) throw new Error('Analysis stopped. Please try again.')
      evals.push(toWhite(result.lines[0], chess.turn()))
      searches.push(result)
    }
    onProgress(evals.length, fens.length)
  }
  const emptyCounts = () => Object.fromEntries(CLASSIFICATIONS.map((c) => [c, 0])) as Record<Classification, number>
  const counts = { w: emptyCounts(), b: emptyCounts() }
  const moves: ReviewedMove[] = []
  for (let i = 0; i < sans.length; i++) {
    const chess = new Chess(fens[i])
    const color = chess.turn()
    const legalMoves = chess.moves().length
    const played = chess.move(sans[i])
    const uci = played.from + played.to + (played.promotion ?? '')
    const lines = searches[i]?.lines ?? []
    const best = lines[0]?.move ?? uci
    let bestSan = ''
    try { bestSan = uciMove(new Chess(fens[i]), best).san } catch { /* no legal engine line */ }
    const beforeEP = expectedPoints(evals[i], color, ratings[color])
    const afterEP = expectedPoints(evals[i + 1], color, ratings[color])
    const loss = Math.max(0, beforeEP - afterEP)
    const cls = classifyMove({
      loss, played: uci, best, legalMoves, ply: i, bookPlies, beforeEP, afterEP,
      sacrifice: isSacrifice(fens[i], fens[i + 1], searches[i + 1]?.lines[0]?.pv ?? [], color),
      secondGap: lines[1] ? expectedPoints(toWhite(lines[0], color), color, ratings[color]) - expectedPoints(toWhite(lines[1], color), color, ratings[color]) : 0,
      previousClass: moves[i - 1]?.cls,
      previousEP: i > 0 ? expectedPoints(evals[i - 1], color, ratings[color]) : undefined,
    })
    moves.push({ san: sans[i], uci, color, cls, before: evals[i], after: evals[i + 1], best, bestSan, loss, bestLine: lines[0]?.pv.slice(0, 12) ?? [], refutation: searches[i + 1]?.lines[0]?.pv.slice(0, 12) ?? [] })
    counts[color][cls]++
  }
  return refreshReview({ moves, evals, counts, book: bookPlies, accuracy: { w: 100, b: 100 } }, ratings)
}

const PHRASES: Record<Classification, string[]> = {
  brilliant: ['A beautiful sacrifice!', 'You found an inspired way forward.', 'A bold idea that works.'],
  great: ['You found the move that makes the difference.', 'An important find in a critical position.'],
  best: ['The best move in this position.', 'Right on target.'],
  excellent: ['A strong move that keeps your position on track.', 'You keep the position under control.'],
  good: ['A reasonable way to continue.', 'A solid move, with room for improvement.'],
  book: ['This is a known opening move.', 'You are following opening theory.'],
  inaccuracy: ['There was a more precise way to play.', 'This gives your opponent a little breathing room.'],
  mistake: ['This lets your advantage slip.', 'Your opponent has a stronger reply now.'],
  miss: ['You missed a chance to take advantage.', 'An opportunity slipped away.'],
  blunder: ['A costly error.', 'This gives your opponent a major opportunity.'],
  forced: ['This was your only legal move.', 'There is only one move available here.'],
}
export function coachLine(m: ReviewedMove, ply = 0): { title: string; text: string } {
  const labels: Record<Classification, string> = {
    brilliant: 'brilliant', great: 'a great move', best: 'the best move', excellent: 'excellent', good: 'a good move',
    book: 'a book move', inaccuracy: 'an inaccuracy', mistake: 'a mistake', miss: 'a miss', blunder: 'a blunder', forced: 'forced',
  }
  let text = PHRASES[m.cls][ply % PHRASES[m.cls].length]
  if (BAD_MOVES.includes(m.cls) && m.bestSan) text += ` The best move was ${m.bestSan}.`
  return { title: `${m.san} is ${labels[m.cls]}`, text }
}
