import { Chess, DEFAULT_POSITION } from 'chess.js'

type OpeningBook = Record<string, [string, string]>
let named: OpeningBook = {}
let positions = new Set<string>()
let pending: Promise<void> | undefined
export const epd = (fen: string) => fen.split(' ').slice(0, 4).join(' ')
const START = epd(DEFAULT_POSITION)

/** Lazy, shared load; failures can be retried without caching an empty book. */
export function loadOpenings(): Promise<void> {
  return pending ??= Promise.all(['openings.json', 'openings-prefixes.json'].map(async file => {
    const response = await fetch(`${import.meta.env.BASE_URL}data/${file}`)
    if (!response.ok) throw new Error('Could not load the opening book. Please try again.')
    return response.json()
  })).then(([book, prefixes]) => {
    named = book as OpeningBook
    positions = new Set([...(prefixes as string[]), ...Object.keys(named)])
  }).catch(error => { pending = undefined; throw error })
}

/** Number of leading book half-moves, only from the standard starting position. */
export function bookPlies(startFen: string, sans: string[]): number {
  if (epd(startFen) !== START) return 0
  const chess = new Chess(startFen)
  let count = 0
  for (const san of sans) {
    try { chess.move(san) } catch { break }
    if (!positions.has(epd(chess.fen()))) break
    count++
  }
  return count
}

/** ply is the number of played half-moves (0 is the starting board). */
export function openingName(startFen: string, sans: string[], ply: number): string | undefined {
  if (epd(startFen) !== START) return undefined
  const chess = new Chess(startFen)
  let name: string | undefined
  for (const san of sans.slice(0, Math.max(0, ply))) {
    try { chess.move(san) } catch { break }
    const opening = named[epd(chess.fen())]
    if (opening) name = opening[1]
  }
  return name
}
