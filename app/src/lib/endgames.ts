import { Chess } from 'chess.js'

export const ENDGAMES_ICON = 'https://www.chess.com/bundles/web/images/color-icons/game-endgames.svg'

export interface EndgameDrill {
  id: string
  sortOrder: number
  fen: string
  alternativeFens: string[]
  goal: 'Win' | 'Draw'
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'
  moveLimit?: number
}
export interface EndgameTheme {
  id: string
  url: string
  name: string
  description: string
  drills: EndgameDrill[]
}
export interface EndgameCategory {
  id: string
  url: string
  name: string
  imageUrl: string
  themes: EndgameTheme[]
}
export interface EndgameProgress {
  drills: Record<string, { attempts: number; completed?: boolean; bestMoves?: number; bestMs?: number; assisted?: boolean }>
  challenges: Record<string, { bestMs: number; completed: number }>
}
export const emptyEndgameProgress: EndgameProgress = { drills: {}, challenges: {} }

export function endgameOutcome(game: Chess, side: 'w' | 'b', goal: EndgameDrill['goal'], moves: number, moveLimit?: number): 'success' | 'failed' | null {
  // Chess.com accepts a win when defending a Draw position, too.
  if (game.isCheckmate()) return game.turn() !== side ? 'success' : 'failed'
  if (game.isDraw()) return goal === 'Draw' ? 'success' : 'failed'
  // Allow the opponent's reply to the final allowed user move before checking the limit.
  if (moveLimit != null && moves >= moveLimit && game.turn() === side) return 'failed'
  return null
}

export function endgameCompletion(drills: EndgameDrill[], progress: EndgameProgress) {
  const done = drills.filter(d => progress.drills[d.id]?.completed).length
  return { done, total: drills.length, percent: drills.length ? Math.round(done / drills.length * 100) : 0 }
}

export function formatEndgameTime(ms: number) {
  const tenths = Math.floor(Math.max(0, ms) / 100)
  return `${Math.floor(tenths / 600)}:${String(Math.floor(tenths / 10) % 60).padStart(2, '0')}.${tenths % 10}`
}

let catalogue: Promise<EndgameCategory[]> | undefined
export function loadEndgames() {
  catalogue ??= fetch(`${import.meta.env.BASE_URL}data/endgames.json`).then(async r => {
    if (!r.ok) throw new Error('Endgames could not be loaded.')
    const data: { categories: EndgameCategory[] } = await r.json()
    return data.categories
  }).catch((error: unknown) => { catalogue = undefined; throw error })
  return catalogue
}
