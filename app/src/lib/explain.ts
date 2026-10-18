import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js'
import { BAD_MOVES, coachLine, type ReviewedMove } from './review'

export type ExplanationTag = 'hanging-piece' | 'allows-mate' | 'missed-mate' | 'winning-material' | 'fork' | 'pin' | 'skewer' | 'discovered-attack' | 'trapped-piece' | 'back-rank' | 'promotion-threat' | 'losing-exchange' | 'stalemate' | 'development' | 'castling' | 'centre-control' | 'book' | 'trade-when-ahead' | 'passed-pawn' | 'king-safety' | 'weakens-king'
export interface ExplanationArrow { from: string; to: string; color: string; opacity: number }
export interface LinePosition { fen: string; san: string; from: string; to: string; color: Color }
export interface Explanation {
  tags: ExplanationTag[]
  short: string
  details: string[]
  bestText: string
  threats: ExplanationArrow[]
  bestLine: LinePosition[]
  refutation: LinePosition[]
}
interface Finding { tag: ExplanationTag; text: string }
const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 }
const NAME: Record<PieceSymbol, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
const CENTRE: Square[] = ['d4', 'e4', 'd5', 'e5']
const GREEN = '#81b64c'
const RED = '#fa412d'
const other = (color: Color): Color => color === 'w' ? 'b' : 'w'
const pieces = (chess: Chess) => chess.board().flatMap(row => row.flatMap(p => p ? [p] : []))
const file = (s: string) => s.charCodeAt(0) - 97
const rank = (s: string) => Number(s[1])
const square = (f: number, r: number) => f >= 0 && f < 8 && r >= 1 && r <= 8 ? `${'abcdefgh'[f]}${r}` as Square : null
const balance = (chess: Chess, color: Color) => pieces(chess).reduce((sum, p) => sum + (p.color === color ? 1 : -1) * (p.type === 'k' ? 0 : VALUE[p.type]), 0)

/** Validate every ply: older/cancelled engine output must never create an illegal board. */
export function linePositions(fen: string, uci: string[] = []): LinePosition[] {
  const chess = new Chess(fen)
  const result: LinePosition[] = []
  for (const token of uci.slice(0, 12)) {
    try {
      const m = chess.move({ from: token.slice(0, 2), to: token.slice(2, 4), promotion: token[4] })
      result.push({ fen: chess.fen(), san: m.san, from: m.from, to: m.to, color: m.color })
    } catch { break }
  }
  return result
}

function vulnerable(chess: Chess, color: Color) {
  return pieces(chess).filter(p => {
    if (p.color !== color || p.type === 'k') return false
    const attackers = chess.attackers(p.square, other(color))
    const defenders = chess.attackers(p.square, color)
    return attackers.length > 0 && (attackers.length > defenders.length || attackers.some(s => VALUE[chess.get(s)!.type] < VALUE[p.type]))
  }).sort((a, b) => VALUE[b.type] - VALUE[a.type])
}

function passed(chess: Chess, sq: Square, color: Color) {
  return !pieces(chess).some(p => p.type === 'p' && p.color !== color && Math.abs(file(p.square) - file(sq)) <= 1 && (color === 'w' ? rank(p.square) > rank(sq) : rank(p.square) < rank(sq)))
}

/** Geometric motifs newly created by a line's move, including attacks uncovered by a blocker. */
function motifs(before: Chess, after: Chess, movedFrom: string, movedTo: string, color: Color): Finding[] {
  const result: Finding[] = []
  const own = pieces(after).filter(p => p.color === color)
  const enemies = pieces(after).filter(p => p.color !== color)
  const mover = after.get(movedTo as Square)
  if (mover) {
    const targets = enemies.filter(p => (p.type === 'k' || VALUE[p.type] > VALUE[mover.type]) && after.attackers(p.square, color).includes(movedTo as Square))
    if (targets.length >= 2) result.push({ tag: 'fork', text: `${NAME[mover.type]} on ${movedTo} forks the ${NAME[targets[0].type]} on ${targets[0].square} and the ${NAME[targets[1].type]} on ${targets[1].square}` })
  }
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  for (const p of own.filter(p => ['b', 'r', 'q'].includes(p.type))) {
    for (const [df, dr] of directions) {
      if (p.type === 'b' && (!df || !dr) || p.type === 'r' && df && dr) continue
      const hits: typeof enemies = []
      for (let n = 1; n < 8; n++) {
        const sq = square(file(p.square) + df * n, rank(p.square) + dr * n)
        if (!sq) break
        const hit = after.get(sq)
        if (!hit) continue
        if (hit.color === color) break
        hits.push({ ...hit, square: sq })
        if (hits.length === 2) break
      }
      if (hits.length < 2) continue
      const [front, back] = hits
      // Ignore a motif already present before this move.
      if (p.square !== movedTo && before.attackers(front.square, color).includes(p.square)) continue
      if (back.type === 'k' || VALUE[back.type] > VALUE[front.type]) result.push({ tag: 'pin', text: `${NAME[p.type]} on ${p.square} pins the ${NAME[front.type]} on ${front.square} to the ${NAME[back.type]} on ${back.square}` })
      else if (front.type === 'k' || VALUE[front.type] > VALUE[back.type]) result.push({ tag: 'skewer', text: `${NAME[p.type]} on ${p.square} skewers the ${NAME[front.type]} on ${front.square}, exposing the ${NAME[back.type]} on ${back.square}` })
    }
    if (p.square === movedTo || p.square === movedFrom) continue
    const target = enemies.find(e => (e.type === 'k' || VALUE[e.type] >= 3) && after.attackers(e.square, color).includes(p.square) && !before.attackers(e.square, color).includes(p.square))
    if (target) result.push({ tag: 'discovered-attack', text: `moving out of the way uncovers the ${NAME[p.type]}'s attack on the ${NAME[target.type]} on ${target.square}` })
  }
  return result
}

function lineFindings(fen: string, line: LinePosition[], color: Color) {
  let previous = new Chess(fen)
  const result: Finding[] = []
  for (const step of line.slice(0, 4)) {
    const next = new Chess(step.fen)
    if (step.color === color) result.push(...motifs(previous, next, step.from, step.to, color))
    previous = next
  }
  return result
}
function materialChange(fen: string, line: LinePosition[], color: Color) {
  const last = line[Math.min(4, line.length) - 1]
  return last ? balance(new Chess(last.fen), color) - balance(new Chess(fen), color) : 0
}
function mateFor(score: ReviewedMove['after'], color: Color) {
  if (score.mate == null) return false
  return (score.mate === 0 ? (score.cp ?? 0) : score.mate) * (color === 'w' ? 1 : -1) > 0
}
function kingDanger(chess: Chess, color: Color) {
  const king = pieces(chess).find(p => p.type === 'k' && p.color === color)!
  let danger = 0
  for (let df = -1; df <= 1; df++) for (let dr = -1; dr <= 1; dr++) {
    const sq = square(file(king.square) + df, rank(king.square) + dr)
    if (sq && chess.isAttacked(sq, other(color))) danger++
  }
  return danger
}

const cache = new WeakMap<ReviewedMove, Map<string, Explanation>>()
/** Pure board analysis, performed only for a viewed move; immutable review moves key the cache. */
export function explainMove(beforeFen: string, move: ReviewedMove): Explanation {
  const hit = cache.get(move)?.get(beforeFen)
  if (hit) return hit
  const before = new Chess(beforeFen)
  const after = new Chess(beforeFen)
  const played = after.move({ from: move.uci.slice(0, 2), to: move.uci.slice(2, 4), promotion: move.uci[4] })
  const color = played.color
  const opponent = other(color)
  const bad = BAD_MOVES.includes(move.cls)
  const findings: Finding[] = []
  const add = (tag: ExplanationTag, text: string) => { if (!findings.some(f => f.tag === tag)) findings.push({ tag, text }) }
  const bestLine = linePositions(beforeFen, move.bestLine ?? (move.best ? [move.best] : []))
  const refutation = linePositions(after.fen(), move.refutation)
  const bestMotifs = lineFindings(beforeFen, bestLine, color)
  const replyMotifs = lineFindings(after.fen(), refutation, opponent)
  const threats: ExplanationArrow[] = []
  const losingMate = move.after.mate != null && !mateFor(move.after, color)
  if (losingMate) {
    const n = Math.abs(move.after.mate!)
    add('allows-mate', n === 0 ? 'This allows checkmate.' : `This allows your opponent to force checkmate in ${n}.`)
  }
  if (mateFor(move.before, color) && !mateFor(move.after, color)) add('missed-mate', 'You missed a chance to force checkmate. Look for checks that keep the attack going.')
  const loss = materialChange(after.fen(), refutation, color)
  const gain = materialChange(beforeFen, bestLine, color)
  const replyCaptures = refutation.slice(0, 4).map((s, i) => {
    const c = new Chess(i ? refutation[i - 1].fen : after.fen())
    return c.move({ from: s.from, to: s.to, promotion: s.san.includes('=') ? s.san.split('=')[1][0].toLowerCase() : undefined })
  })
  if (bad && loss <= -2 && replyCaptures.some(m => m.color === opponent && m.captured === 'r') && replyCaptures.some(m => m.color === color && (m.captured === 'b' || m.captured === 'n'))) add('losing-exchange', 'This loses the exchange: a rook is worth more than a bishop or knight.')
  if (bad && gain >= 1) add('winning-material', `You missed a chance to win material. The best continuation gains ${gain} ${gain === 1 ? 'point' : 'points'} of material in its first few moves.`)
  if (bad) for (const f of replyMotifs) add(f.tag, `This allows a tactic: the ${f.text}.`)
  if (bad && move.uci !== move.best) for (const f of bestMotifs) add(f.tag, `You missed a tactic: the ${f.text}.`)
  const hanging = vulnerable(after, color)
  if (bad && !after.isGameOver()) for (const p of hanging.slice(0, 2)) {
    const attackers = after.attackers(p.square, opponent)
    // A legal capture is required: pinned attackers do not establish a threat.
    const attacker = attackers.find(from => after.moves({ verbose: true }).some(m => m.from === from && m.to === p.square))
    if (!attacker) continue
    add('hanging-piece', `This leaves your ${NAME[p.type]} on ${p.square} vulnerable. Your opponent can capture it with the ${NAME[after.get(attacker)!.type]} on ${attacker}.`)
    threats.push({ from: attacker, to: p.square, color: RED, opacity: 0.85 })
    if (p.type !== 'p') {
      const fields = after.fen().split(' '); fields[1] = color; fields[3] = '-'
      const escape = new Chess(fields.join(' '))
      const safe = escape.moves({ square: p.square, verbose: true }).some(m => {
        const next = new Chess(escape.fen()); next.move(m)
        return !next.isAttacked(m.to, opponent)
      })
      if (!safe) add('trapped-piece', `Your ${NAME[p.type]} on ${p.square} has no safe escape square. Look for a way to defend it or create an exit.`)
    }
  }
  if (bad && refutation[0]) threats.push({ from: refutation[0].from, to: refutation[0].to, color: RED, opacity: 0.85 })
  const king = pieces(after).find(p => p.color === color && p.type === 'k')!
  if (losingMate && rank(king.square) === (color === 'w' ? 1 : 8) && [-1, 0, 1].filter(df => {
    const sq = square(file(king.square) + df, rank(king.square) + (color === 'w' ? 1 : -1))
    return sq && after.get(sq)?.color === color && after.get(sq)?.type === 'p'
  }).length >= 2) add('back-rank', 'Your king is boxed in on the back rank. A flight square or an extra defender can prevent a back-rank mate.')
  const promotion = refutation.find(s => s.color === opponent && s.san.includes('='))
  const pawnThreat = pieces(after).find(p => p.color === opponent && p.type === 'p' && rank(p.square) === (opponent === 'w' ? 7 : 2) && passed(after, p.square, opponent))
  if (promotion || pawnThreat) add('promotion-threat', promotion ? `Watch the passed pawn: your opponent can promote with ${promotion.san} in the engine's line.` : `Your opponent's passed pawn on ${pawnThreat!.square} is one step from promotion.`)
  const stale = after.isStalemate() || refutation.slice(0, 4).some(s => new Chess(s.fen).isStalemate())
  const savingStalemate = bad && bestLine.slice(0, 4).some(s => new Chess(s.fen).isStalemate())
  if (stale || savingStalemate) add('stalemate', savingStalemate && !stale ? 'You missed a stalemate resource. The best line reaches a position with no legal moves and no check, saving a draw.' : 'Watch out for stalemate! With no legal moves and no check, the game is drawn, even with extra material.')
  if (move.cls === 'book') add('book', 'This is a book move. You are following established opening theory.')
  if (!bad) {
    const playedLine = [{ fen: after.fen(), san: played.san, from: played.from, to: played.to, color }, ...refutation]
    const materialGain = materialChange(beforeFen, playedLine, color)
    if (materialGain >= 1) add('winning-material', `This wins material. The continuation gains ${materialGain} ${materialGain === 1 ? 'point' : 'points'} of material in its first few moves.`)
    for (const f of motifs(before, after, played.from, played.to, color)) add(f.tag, `A useful tactic: the ${f.text}.`)
    if (played.isKingsideCastle() || played.isQueensideCastle()) {
      add('castling', 'Castling gets your king to safety and brings your rook into the game.')
      add('king-safety', 'Your king moves away from the centre while your rooks become connected more easily.')
    }
    if (['n', 'b'].includes(played.piece) && rank(played.from) === (color === 'w' ? 1 : 8) && rank(played.to) !== rank(played.from)) add('development', `You develop your ${NAME[played.piece]} to ${played.to}, getting it off the back rank and into the game.`)
    const control = (c: Chess) => CENTRE.reduce((sum, sq) => sum + c.attackers(sq, color).length, 0)
    if (control(after) > control(before)) add('centre-control', 'This increases your control of the centre, giving your pieces more room to work.')
    if (played.captured && balance(before, color) >= 2 && balance(after, color) >= 2) add('trade-when-ahead', 'Trading pieces when you are ahead in material makes the position easier to convert. Keep your remaining pieces active.')
    if (played.piece === 'p' && passed(after, played.to, color)) add('passed-pawn', `You push a passed pawn to ${played.to}. No enemy pawn on its file or a neighbouring file stands ahead of it.`)
    if (played.piece === 'k' && !findings.some(f => f.tag === 'castling') && kingDanger(after, color) < kingDanger(before, color)) add('king-safety', 'This improves king safety by reducing the attacks around your king.')
  }
  if (played.piece === 'p' && ['g', 'h', 'a', 'b', 'c'].includes(king.square[0]) && rank(king.square) === (color === 'w' ? 1 : 8) && Math.abs(file(played.from) - file(king.square)) <= 1 && rank(played.from) === (color === 'w' ? 2 : 7)) add('weakens-king', `Moving the pawn from ${played.from} loosens the pawn shield in front of your king. Keep an eye on the squares it leaves behind.`)
  const bestMotif = bestMotifs[0]
  let bestReason = bestMotif ? `creates a ${bestMotif.tag.replaceAll('-', ' ')}: the ${bestMotif.text}` : ''
  const bestStep = bestLine[0]
  if (!bestReason && bestStep) {
    const c = new Chess(beforeFen)
    const m = c.move({ from: bestStep.from, to: bestStep.to, promotion: move.best[4] })
    bestReason = mateFor(move.before, color) ? 'keeps a forced checkmate available' : m.isKingsideCastle() || m.isQueensideCastle() ? 'improves king safety and activates the rook' : m.captured ? `captures the ${NAME[m.captured]} on ${m.to}` : m.piece === 'n' || m.piece === 'b' ? `activates the ${NAME[m.piece]} on ${m.to}` : 'preserves the strongest engine evaluation'
  }
  const bestText = move.bestSan ? `${bad ? 'Best was' : 'The engine recommends'} ${move.bestSan}, which ${bestReason || 'keeps your position on track'}.` : ''
  // Immediate consequences come before an opportunity in the alternative line.
  const priority: Partial<Record<ExplanationTag, number>> = { 'allows-mate': 0, 'missed-mate': 1, 'stalemate': 2, 'losing-exchange': 3, 'hanging-piece': 4, 'trapped-piece': 5, 'back-rank': 6, 'promotion-threat': 7 }
  findings.sort((a, b) => (priority[a.tag] ?? 10) - (priority[b.tag] ?? 10))
  const fallback = coachLine(move).text
  const explanation: Explanation = {
    tags: findings.map(f => f.tag), short: findings[0]?.text ?? fallback,
    details: findings.length ? findings.slice(0, 4).map(f => f.text) : [fallback, 'Compare the engine continuation with the game to see how the position develops.'],
    bestText, threats: threats.filter((a, i) => threats.findIndex(b => a.from === b.from && a.to === b.to) === i), bestLine, refutation,
  }
  const entry = cache.get(move) ?? new Map<string, Explanation>()
  entry.set(beforeFen, explanation); cache.set(move, entry)
  return explanation
}

export function bestMoveArrow(move: ReviewedMove): ExplanationArrow[] {
  return move.best ? [{ from: move.best.slice(0, 2), to: move.best.slice(2, 4), color: GREEN, opacity: 0.85 }] : []
}
