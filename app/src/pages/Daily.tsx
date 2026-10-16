import { useEffect, useState } from 'react'
import Board from '../components/Board'
import { dailyPuzzle, loadPuzzles, type Puzzle } from '../lib/puzzles'
import { usePuzzle } from '../lib/usePuzzle'
import { useStored } from '../lib/storage'
import { openInAnalysis } from './Analysis'
import { BoardControls, PuzzleCoach, PuzzleFooter } from './puzzleUi'
import { SidebarShell, StreakRow } from '../components/PuzzleSidebar'

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Consecutive days (ending today or yesterday) with a solved daily puzzle. */
export function dailyStreak(log: Record<string, boolean>) {
  const d = new Date()
  if (!log[todayKey(d)]) d.setDate(d.getDate() - 1)
  let n = 0
  while (log[todayKey(d)]) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export default function Daily() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [log, setLog] = useStored<Record<string, boolean>>('dailyLog', {})
  const key = todayKey()

  useEffect(() => {
    loadPuzzles().then((all) => setPuzzle(dailyPuzzle(all)))
  }, [])

  const p = usePuzzle(puzzle, {
    onResult: (solved) => setLog((l) => (key in l ? l : { ...l, [key]: solved })),
  })

  const date = new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="cc-layout">
      <div className="cc-board-area">
        <Board {...p.boardProps} />
      </div>
      <BoardControls />
      <SidebarShell
        title="Daily Puzzle"
        icon="pawn-green"
        footer={
          <PuzzleFooter
            status={p.status}
            onHint={p.hint}
            onRetry={p.status === 'wrong' ? p.retry : p.restart}
            onSolution={p.showSolution}
            onAnalysis={() => puzzle && openInAnalysis(puzzle.fen, p.history(), p.orientation)}
            onNext={p.status === 'solved' || p.status === 'revealed' ? () => (location.hash = '#/puzzles') : undefined}
          />
        }
      >
        <PuzzleCoach status={p.status} color={p.solverColor} usedHint={p.usedHint} />
        <div className="rated-box">
          <div className="rated-box-item">
            <span className="rated-box-label">Daily puzzles in a row · {date}</span>
            <span className="rated-box-value">{dailyStreak(log)} days</span>
          </div>
        </div>
        <StreakRow />
        {key in log && p.status === 'playing' && (
          <div className="puzzle-info">You already played today ({log[key] ? 'solved' : 'missed'}). Replays don’t change your streak.</div>
        )}
      </SidebarShell>
    </div>
  )
}
