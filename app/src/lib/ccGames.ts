import { Chess } from 'chess.js'
import { load, save } from './storage'
import { rememberImportedGames } from './insightsStore'

export const TIME_CLASSES = ['bullet', 'blitz', 'rapid', 'daily'] as const

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

export interface TimeClassStats {
  last?: { rating: number }
  best?: { rating: number }
  record?: { win: number; loss: number; draw: number }
}
export type CcStats = Partial<Record<`chess_${CcGame['time_class']}`, TimeClassStats>>

const START = new Chess().fen()
const archiveCache = new Map<string, Promise<string[]>>()
const monthCache = new Map<string, Promise<CcGame[]>>()
const avatarCache = new Map<string, Promise<string | null>>()
const statsCache = new Map<string, Promise<CcStats>>()

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

export function fetchAvatar(username: string): Promise<string | null> {
  const normalized = username.trim().toLowerCase()
  return cached(avatarCache, normalized, async () => {
    const stored = load<string | null | undefined>(`avatar:${normalized}`, undefined)
    if (stored !== undefined) return stored
    const response = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(normalized)}`)
    if (!response.ok && response.status !== 404) throw new Error('Could not load avatar')
    const data = response.status === 404 ? {} : await response.json() as { avatar?: string }
    const avatar = data.avatar ?? null
    save(`avatar:${normalized}`, avatar)
    return avatar
  })
}

export function fetchStats(username: string): Promise<CcStats> {
  const normalized = username.trim().toLowerCase()
  return cached(statsCache, normalized, async () => {
    const response = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(normalized)}/stats`)
    if (response.status === 404) throw new Error('User not found')
    if (!response.ok) throw new Error('Could not load stats')
    return await response.json() as CcStats
  })
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

export function fetchMonth(url: string, refresh = false): Promise<CcGame[]> {
  if (refresh) monthCache.delete(url)
  return cached(monthCache, url, async () => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Could not load games')
    const data = (await response.json()) as { games?: CcGame[] }
    const games = (data.games ?? []).filter((game) => game.rules === 'chess').reverse()
    const username = url.match(/\/player\/([^/]+)\/games\//)?.[1]
    if (username) rememberImportedGames(decodeURIComponent(username), games)
    return games
  })
}

export function gameToAnalysis(
  game: CcGame,
  me: string,
): { fen: string; sans: string[]; clocks: string[]; orientation: 'white' | 'black' } {
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
    clocks: clocksFromGame(chess),
    orientation: game.black.username.toLowerCase() === me.trim().toLowerCase() ? 'black' : 'white',
  }
}

function clocksFromGame(chess: Chess): string[] {
  const comments = new Map(chess.getComments().map(({ fen, comment }) => [fen, comment]))
  const clocks = chess.history({ verbose: true }).map((move) => {
    const match = comments.get(move.after)?.match(/\[%clk\s+(\d+):(\d{2}):(\d{2})(?:\.\d+)?\]/)
    if (!match) return ''
    const hours = Number(match[1])
    return hours ? `${hours}:${match[2]}:${match[3]}` : `${Number(match[2])}:${match[3]}`
  })
  return clocks.some(Boolean) ? clocks : []
}

export function parseClocks(pgn: string): string[] {
  const chess = new Chess()
  chess.loadPgn(pgn)
  return clocksFromGame(chess)
}

const DRAW_RESULTS = new Set(['agreed', 'repetition', 'stalemate', 'insufficient', '50move', 'timevsinsufficient'])

export function outcome(game: CcGame, me: string): 'win' | 'loss' | 'draw' {
  const normalized = me.trim().toLowerCase()
  const result = game.white.username.toLowerCase() === normalized ? game.white.result : game.black.result
  if (result === 'win') return 'win'
  if (DRAW_RESULTS.has(result)) return 'draw'
  return 'loss'
}

export function formatTimeControl(value: string) {
  if (value.includes('/')) {
    const [moves, seconds] = value.split('/').map(Number)
    if (moves === 1 && Number.isFinite(seconds)) {
      const days = seconds / 86_400
      return `${days} ${days === 1 ? 'day' : 'days'}`
    }
  }
  if (value.includes('+')) {
    const [seconds, increment] = value.split('+')
    return `${Number(seconds) / 60} | ${increment}`
  }
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return `${seconds / 60} min`
  return value
}
