// Puzzle data comes from the Lichess puzzle database (CC0), sampled into public/data/puzzles.json.
// Each puzzle's FEN is the position *before* the opponent's move; moves[0] is that move,
// and the solver plays moves[1], moves[3], ...

import { seenWeight, type PuzzleSeen } from './puzzleSeen'

export interface Puzzle {
  id: string
  fen: string
  moves: string[]
  rating: number
  themes: string[]
}

let cache: Promise<Puzzle[]> | null = null

export function loadPuzzles(): Promise<Puzzle[]> {
  cache ??= fetch(`${import.meta.env.BASE_URL}data/puzzles.json`)
    .then((r) => r.json())
    .then((rows: [string, string, string, number, string][]) =>
      rows.map(([id, fen, moves, rating, themes]) => ({
        id,
        fen,
        moves: moves.split(' '),
        rating,
        themes: themes.split(' '),
      })),
    )
  return cache
}

/** Favors unseen puzzles near `target`, with hard exclusions for the current session. */
export function pickPuzzle(
  all: Puzzle[],
  target: number,
  seen: PuzzleSeen,
  filter: (p: Puzzle) => boolean = () => true,
  avoid?: Set<string>,
): Puzzle | null {
  const now = Date.now()
  const weighted = (pool: Puzzle[]): Puzzle | null => {
    const weights = pool.map((p) => avoid?.has(p.id) ? 0 : seenWeight(p.id, seen, now))
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    if (!total) return null
    let roll = Math.random() * total
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i]
      if (roll < 0) return pool[i]
    }
    return null
  }

  for (const spread of [75, 150, 300, 600, 3000]) {
    const pool = all.filter((p) => Math.abs(p.rating - target) <= spread && filter(p))
    const unseen = pool.filter((p) => !seen[p.id] && !avoid?.has(p.id)).length
    if (unseen >= 15 || spread === 3000) {
      const puzzle = weighted(pool)
      if (puzzle) return puzzle
    }
  }
  return weighted(all.filter(filter))
}

/** Elo-style update. Returns the new rating. */
export function updateRating(rating: number, puzzleRating: number, solved: boolean, k = 24) {
  const expected = 1 / (1 + 10 ** ((puzzleRating - rating) / 400))
  return Math.max(100, Math.round(rating + k * ((solved ? 1 : 0) - expected)))
}

export function dailyPuzzle(all: Puzzle[], date = new Date()): Puzzle {
  const pool = all.filter((p) => p.rating >= 1200 && p.rating <= 1900)
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000)
  let h = day
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  h ^= h >>> 16
  return pool[Math.abs(h) % pool.length]
}

export const themeLabels: Record<string, string> = {
  mateIn1: 'Mate in 1',
  mateIn2: 'Mate in 2',
  mateIn3: 'Mate in 3',
  fork: 'Fork',
  pin: 'Pin',
  skewer: 'Skewer',
  discoveredAttack: 'Discovered Attack',
  doubleCheck: 'Double Check',
  sacrifice: 'Sacrifice',
  deflection: 'Deflection',
  attraction: 'Attraction',
  hangingPiece: 'Hanging Piece',
  trappedPiece: 'Trapped Piece',
  backRankMate: 'Back Rank Mate',
  kingsideAttack: 'Kingside Attack',
  defensiveMove: 'Defensive Move',
  quietMove: 'Quiet Move',
  promotion: 'Promotion',
  advancedPawn: 'Advanced Pawn',
  zugzwang: 'Zugzwang',
  intermezzo: 'Intermezzo',
  clearance: 'Clearance',
  opening: 'Opening',
  middlegame: 'Middlegame',
  endgame: 'Endgame',
  rookEndgame: 'Rook Endgame',
  pawnEndgame: 'Pawn Endgame',
  bishopEndgame: 'Bishop Endgame',
  knightEndgame: 'Knight Endgame',
  queenEndgame: 'Queen Endgame',
}
