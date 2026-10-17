import { Chess } from 'chess.js'

export interface CcGame {
  url: string
  pgn: string
  time_control: string
  end_time: number
  rated: boolean
  time_class: 'bullet' | 'blitz' | 'rapid' | 'daily'
  rules: string
  initial_setup?: string
  white: { username: string; rating: number; result: string }
  black: { username: string; rating: number; result: string }
}

const START = new Chess().fen()
const archiveCache = new Map<string, Promise<string[]>>()
const monthCache = new Map<string, Promise<CcGame[]>>()

function cached<T>(cache: Map<string, Promise<T>>, key: string, load: () => Promise<T>) {
  const existing = cache.get(key)
  if (existing) return existing
  const request = load().catch((error) => {
    cache.delete(key)
    throw error
  })
  cache.set(key, request)
  return request
}

export function fetchArchives(username: string): Promise<string[]> {
  const normalized = username.trim().toLowerCase()
  const url = `https://api.chess.com/pub/player/${encodeURIComponent(normalized)}/games/archives`
  return cached(archiveCache, url, async () => {
    const response = await fetch(url)
    if (response.status === 404) throw new Error('User not found')
    if (!response.ok) throw new Error('Could not load games')
    const data = (await response.json()) as { archives?: string[] }
    return [...(data.archives ?? [])].reverse()
  })
}

export function fetchMonth(url: string): Promise<CcGame[]> {
  return cached(monthCache, url, async () => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Could not load games')
    const data = (await response.json()) as { games?: CcGame[] }
    return (data.games ?? []).filter((game) => game.rules === 'chess').reverse()
  })
}

export function gameToAnalysis(
  game: CcGame,
  me: string,
): { fen: string; sans: string[]; orientation: 'white' | 'black' } {
  let chess = new Chess()
  try {
    chess.loadPgn(game.pgn)
  } catch {
    chess = new Chess()
    chess.loadPgn(game.pgn.replace(/\{[^}]*\}/g, ''))
  }

  return {
    fen: chess.getHeaders().FEN ?? game.initial_setup ?? START,
    sans: chess.history(),
    orientation: game.black.username.toLowerCase() === me.trim().toLowerCase() ? 'black' : 'white',
  }
}

const DRAW_RESULTS = new Set(['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient'])

export function outcome(game: CcGame, me: string): 'win' | 'loss' | 'draw' {
  const normalized = me.trim().toLowerCase()
  const result = game.white.username.toLowerCase() === normalized ? game.white.result : game.black.result
  if (result === 'win') return 'win'
  if (DRAW_RESULTS.has(result)) return 'draw'
  return 'loss'
}
