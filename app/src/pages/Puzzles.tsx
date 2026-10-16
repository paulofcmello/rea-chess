import { useCallback, useEffect, useState } from 'react'
import Board from '../components/Board'
import { loadPuzzles, pickPuzzle, updateRating, themeLabels, type Puzzle } from '../lib/puzzles'
import { usePuzzle } from '../lib/usePuzzle'
import { useStored } from '../lib/storage'
import { openInAnalysis } from './Analysis'
import { BoardControls, PuzzleCoach, PuzzleFooter } from './puzzleUi'
import { RatedStreakInfo, SidebarShell, StreakRow } from '../components/PuzzleSidebar'
import { recordRatedResult } from '../lib/streak'

interface HistoryItem {
  id: string
  rating: number
  solved: boolean
  delta: number
}

export default function Puzzles() {
  const [all, setAll] = useState<Puzzle[]>([])
  const [rating, setRating] = useStored('puzzleRating', 800)
  const [history, setHistory] = useStored<HistoryItem[]>('puzzleHistory', [])
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [delta, setDelta] = useState<number | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [startedAt, setStartedAt] = useState(Date.now())
  const [now, setNow] = useState(Date.now())

  const next = useCallback(
    (list = all, r = rating) => {
      const seen = new Set(history.slice(-300).map((h) => h.id))
      setPuzzle(pickPuzzle(list, r, seen))
      setDelta(null)
      setFlipped(false)
      setStartedAt(Date.now())
    },
    [all, rating, history],
  )

  useEffect(() => {
    loadPuzzles().then((list) => {
      setAll(list)
      next(list)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const p = usePuzzle(puzzle, {
    onResult: (solved, pz) => {
      recordRatedResult(solved)
      const nr = updateRating(rating, pz.rating, solved)
      setDelta(nr - rating)
      setRating(nr)
      setHistory((h) => [...h.slice(-499), { id: pz.id, rating: pz.rating, solved, delta: nr - rating }])
    },
  })

  const finished = p.status === 'solved' || p.status === 'revealed' || p.status === 'wrong'
  useEffect(() => {
    if (finished) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [finished, startedAt])
  const secs = Math.max(0, Math.floor((now - startedAt) / 1000))
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

  const analyze = () => puzzle && openInAnalysis(puzzle.fen, p.history(), p.orientation)
  const orientation = flipped ? (p.orientation === 'white' ? 'black' : 'white') : p.orientation

  return (
    <div className="cc-layout">
      <div className="cc-board-area">
        <Board {...p.boardProps} orientation={orientation} />
      </div>
      <BoardControls onFlip={() => setFlipped((f) => !f)} />
      <SidebarShell
        title="Puzzles"
        footer={<PuzzleFooter status={p.status} onHint={p.hint} onRetry={p.status === 'wrong' ? p.retry : p.restart} onSolution={p.showSolution} onAnalysis={analyze} onNext={() => next()} />}
      >
        <PuzzleCoach status={p.status} color={p.solverColor} usedHint={p.usedHint} />
        <div className="rated-box">
          <div className="rated-box-item">
            <span className="rated-box-label">Rating</span>
            <span className="rated-box-value">
              {rating}
              {delta != null && <span className={`rated-delta ${delta >= 0 ? 'up' : 'down'}`}>{delta >= 0 ? `+${delta}` : delta}</span>}
            </span>
          </div>
          <div className="rated-box-item">
            <span className="rated-box-label">Time</span>
            <span className="rated-box-value clock">{clock}</span>
          </div>
        </div>
        <RatedStreakInfo />
        <StreakRow />
        {puzzle && finished && (
          <div className="puzzle-info">
            <div>
              Puzzle rating <b>{puzzle.rating}</b>
            </div>
            <div className="puzzle-themes">
              {puzzle.themes
                .filter((t) => themeLabels[t])
                .map((t) => (
                  <span key={t}>{themeLabels[t]}</span>
                ))}
            </div>
          </div>
        )}
        <div className="recent-results">
          {history.slice(-24).map((h, i) => (
            <span key={i} className={h.solved ? 'ok' : 'bad'} title={`${h.rating} (${h.delta >= 0 ? '+' : ''}${h.delta})`} />
          ))}
        </div>
      </SidebarShell>
    </div>
  )
}
