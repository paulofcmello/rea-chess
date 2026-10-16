import { Chess } from 'chess.js'

/** Replays SAN moves from a start FEN, returning the FEN after each ply and each move's squares. */
export function buildPositions(startFen: string, sans: string[]) {
  const c = new Chess(startFen)
  const fens = [c.fen()]
  const moves: [string, string][] = []
  for (const san of sans) {
    const m = c.move(san)
    fens.push(c.fen())
    moves.push([m.from, m.to])
  }
  return { fens, moves }
}

const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 }

/** Pieces each side has captured (relative to a full set) and the material balance from white's view. */
export function material(fen: string) {
  const counts: Record<string, number> = {}
  for (const ch of fen.split(' ')[0]) if (/[pnbrqPNBRQ]/.test(ch)) counts[ch] = (counts[ch] ?? 0) + 1
  const full: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 }
  const capturedBy = { w: [] as string[], b: [] as string[] }
  let diff = 0
  for (const t of ['q', 'r', 'b', 'n', 'p']) {
    const white = counts[t.toUpperCase()] ?? 0
    const black = counts[t] ?? 0
    diff += (white - black) * values[t]
    for (let i = 0; i < Math.max(0, full[t] - black); i++) capturedBy.w.push(t)
    for (let i = 0; i < Math.max(0, full[t] - white); i++) capturedBy.b.push(t)
  }
  return { capturedBy, diff }
}
