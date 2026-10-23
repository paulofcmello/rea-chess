import { load, save, updateStored } from './storage'

export type PuzzleSeen = Record<string, { n: number; last: number; solved: boolean }>

/** Loads shared attempt memory, seeding older rated history once when it is empty. */
export function loadPuzzleSeen(): PuzzleSeen {
  const seen = load<PuzzleSeen>('puzzleSeen', {})
  if (Object.keys(seen).length) return seen

  const history = load<{ id: string; solved: boolean; playedAt?: number }[]>('puzzleHistory', [])
  for (const item of history) {
    const previous = seen[item.id]
    const last = item.playedAt ?? 0
    const latest = !previous || last >= previous.last
    seen[item.id] = {
      n: (previous?.n ?? 0) + 1,
      last: latest ? last : previous.last,
      solved: latest ? item.solved : previous.solved,
    }
  }
  if (history.length) save('puzzleSeen', seen)
  return seen
}

export function markSeen(id: string, solved: boolean) {
  updateStored<PuzzleSeen>('puzzleSeen', loadPuzzleSeen(), (seen) => ({
    ...seen,
    [id]: { n: (seen[id]?.n ?? 0) + 1, last: Date.now(), solved },
  }))
}

export function seenWeight(id: string, seen: PuzzleSeen, now: number): number {
  const entry = seen[id]
  if (!entry) return 1
  const daysSinceLast = (now - entry.last) / 86400000
  if (daysSinceLast < 1) return 0.01
  const base = entry.solved ? 0.08 : 0.2
  return Math.max(0.02, base * Math.min(1, daysSinceLast / 30)) / entry.n
}
