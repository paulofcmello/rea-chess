import { load, updateStored, useStored } from './storage'

export const PUZZLES_PER_LEVEL = 20
// Live /puzzles canvas geometry: 108 × 92 ground cells, 78px tile art.
// At a 300px card width this is 54px art on 37.5 × 32px steps.
export function pathGeometry(width: number) {
  const scale = width < 432 ? width / 432 : width < 700 ? 1 : 92 / 64
  return {
    rowWidth: Math.round(108 * scale),
    rowHeight: Math.round(92 * scale),
    tileSize: Math.round(78 * scale),
    pawnSize: Math.round(80 * scale),
    numberSize: Math.round(22 * scale),
  }
}

// Three steps separate the last bronze tile from the first silver tile.
export const NEXT_PATH_START = PUZZLES_PER_LEVEL + 2
export const PATH_STEPS = NEXT_PATH_START + PUZZLES_PER_LEVEL - 1

export function pathPosition(index: number, nextLevel = false) {
  const bend = [0.5, 0, -0.5, -1, -1.5, -1, -0.5, 0][index % 8]
  return {
    x: `calc(50% + ${bend + 0.5} * var(--path-row-width))`,
    y: `calc(52cqh + ${PATH_STEPS - index - (nextLevel ? NEXT_PATH_START : 0)} * var(--path-step-y))`,
  }
}

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
