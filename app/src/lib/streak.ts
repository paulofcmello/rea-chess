// Puzzle streak like chess.com's: consecutive days with at least one solved puzzle (any mode).
// Stored per browser as { "YYYY-MM-DD": solvesThatDay }.
import { load, updateStored, useStored } from './storage'

const KEY = 'solveLog'
type SolveLog = Record<string, number>

export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shift(d: Date, days: number) {
  const n = new Date(d)
  n.setDate(n.getDate() + days)
  return n
}

export function recordSolve() {
  updateStored<SolveLog>(KEY, initialLog(), (log) => ({ ...log, [dayKey()]: (log[dayKey()] ?? 0) + 1 }))
}

/** Seeds the log from the existing daily-puzzle log so earlier solved days still count. */
function initialLog(): SolveLog {
  const daily = load<Record<string, boolean>>('dailyLog', {})
  return Object.fromEntries(Object.entries(daily).filter(([, ok]) => ok).map(([d]) => [d, 1]))
}

export function computeStreak(log: SolveLog) {
  // Today without a solve yet doesn't break the streak; it ends only after a full missed day.
  let d = new Date()
  if (!log[dayKey(d)]) d = shift(d, -1)
  let current = 0
  while (log[dayKey(d)]) {
    current++
    d = shift(d, -1)
  }
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const k of Object.keys(log).filter((k) => log[k] > 0).sort()) {
    const [y, m, day] = k.split('-').map(Number)
    const date = new Date(y, m - 1, day)
    run = prev && dayKey(shift(prev, 1)) === k ? run + 1 : 1
    best = Math.max(best, run)
    prev = date
  }
  return { current, best: Math.max(best, current), today: log[dayKey()] ?? 0, activeToday: !!log[dayKey()] }
}

export function useStreak() {
  const [log] = useStored<SolveLog>(KEY, initialLog())
  return computeStreak(log)
}

/** chess.com streak colour (puzzles.js mQ): <2 green, 2+ gold, 4+ orange, 6+ deep orange. */
export function streakColor(n: number) {
  if (n >= 6) return '#FA742C'
  if (n >= 4) return '#FFA459'
  if (n >= 2) return '#FAD541'
  return '#81B64C'
}

// "N in a row!" — consecutive rated puzzles solved (chess.com rated-streak-info).
interface Run {
  current: number
  best: number
  isNewBest: boolean
}
const RUN_KEY = 'ratedRun'

export function recordRatedResult(solved: boolean) {
  updateStored<Run>(RUN_KEY, { current: 0, best: 0, isNewBest: false }, (r) => {
    if (!solved) return { ...r, current: 0, isNewBest: false }
    const current = r.current + 1
    return current > r.best ? { current, best: current, isNewBest: true } : { ...r, current }
  })
}

/** chess.com's encouragement line (puzzles.js jtt). */
function encouragement({ current: e, best: t, isNewBest: n }: Run) {
  if (e === t - 1) return '2 more to beat your record!'
  if (e === t && n) return 'A new personal best!!!'
  if (e === t) return '1 more to beat your record!'
  const lines: Record<number, string> = {
    2: 'Good start!',
    3: 'Doing great!',
    4: 'Keep going!',
    5: 'Excellent streak!',
    6: 'Fantastic!',
    7: 'Amazing job!',
    8: 'Incredible!',
    9: "You're unstoppable!",
  }
  return lines[e] ?? 'Brilliant solving!'
}

export function useRatedRun() {
  const [run] = useStored<Run>(RUN_KEY, { current: 0, best: 0, isNewBest: false })
  if (run.current < 2) return null
  return { color: streakColor(run.current), phrase: `${run.current} in a row!`, encouragement: encouragement(run) }
}
