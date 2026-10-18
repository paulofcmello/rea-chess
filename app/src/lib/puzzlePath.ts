import { load, updateStored, useStored } from './storage'

export const PUZZLES_PER_LEVEL = 20
export interface PuzzlePathProgress {
  solved: number
  points: number
}
const KEY = 'puzzlePath'

/** Preserve earlier solves when upgrading from the history/streak-only version. */
function initialProgress(): PuzzlePathProgress {
  const history = load<{ solved: boolean }[]>('puzzleHistory', [])
  const clean = history.filter((item) => item.solved).length
  const daily = load<Record<string, boolean>>('dailyLog', {})
  const log = load<Record<string, number>>('solveLog', {})
  const logged = Object.values(log).reduce((sum, count) => sum + Math.max(0, count), 0)
  const solved = Math.max(clean, logged, Object.values(daily).filter(Boolean).length)
  // Historical retries were not recorded separately; use the normal base award.
  return { solved, points: solved * 30 }
}

/** Base easy-puzzle awards from chess.com's prestige-level-point-system-config/1. */
export function recordPathSolve(firstTry: boolean) {
  updateStored<PuzzlePathProgress>(KEY, initialProgress(), (progress) => ({
    solved: progress.solved + 1,
    points: progress.points + (firstTry ? 30 : 5),
  }))
}

export function usePuzzlePath() {
  const [progress] = useStored<PuzzlePathProgress>(KEY, initialProgress())
  return progress
}

export function pathLevel(solved: number) {
  return { level: Math.floor(solved / PUZZLES_PER_LEVEL) + 1, tile: solved % PUZZLES_PER_LEVEL }
}
