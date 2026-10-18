import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_POSITION } from 'chess.js'
import Board from '../components/Board'
import PuzzlePathCard from '../components/PuzzlePathCard'
import { loadPuzzles, pickPuzzle, updateRating, themeLabels, type Puzzle } from '../lib/puzzles'
import { usePuzzle } from '../lib/usePuzzle'
import { useSettings, useStored } from '../lib/storage'
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
  const [settings] = useSettings()
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
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
    }).catch(() => setError('Puzzles could not be loaded. Please try again.'))
  }, [])

  const p = usePuzzle(puzzle, {
    onNext: () => next(),
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
    if (!playing || finished || !settings.puzzleTimer) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [playing, finished, startedAt, settings.puzzleTimer])
  const secs = Math.max(0, Math.floor((now - startedAt) / 1000))
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`

  const analyze = () => puzzle && openInAnalysis(puzzle.fen, p.history(), p.orientation)
  const orientation = flipped ? (p.orientation === 'white' ? 'black' : 'white') : p.orientation

  const start = () => {
    if (!all.length) return
    next()
    setPlaying(true)
  }

  return (
    <>
    <div className="cc-layout cc-puzzle-hub" hidden={playing}>
      <div className="cc-board-area"><Board fen={DEFAULT_POSITION} movable="none" /></div>
      <BoardControls />
      <div className="cc-sidebar cc-puzzle-hub-sidebar">
        <PuzzlePathCard onSolve={start} active={!playing} loading={!all.length} />
        {error && <div className="cc-puzzle-hub-error" role="alert">{error} <button className="cc-button cc-secondary" onClick={() => location.reload()}>Try again</button></div>}
      </div>
    </div>
    {playing && <div className="cc-layout">
      <div className="cc-board-area">
        <Board {...p.boardProps} orientation={orientation} />
      </div>
      <BoardControls onFlip={() => setFlipped((f) => !f)} />
      <SidebarShell
        title="Puzzles"
        onBack={() => { setPlaying(false); setPuzzle(null) }}
        footer={<PuzzleFooter status={p.status} onHint={p.hint} onRetry={p.status === 'wrong' ? p.retry : p.restart} onSolution={p.showSolution} onAnalysis={analyze} onNext={() => next()} />}
      >
        <PuzzleCoach status={p.status} color={p.solverColor} usedHint={p.usedHint} />
        <div className="rated-box">
          {settings.puzzleRating && <div className="rated-box-item">
            <span className="rated-box-label">Rating</span>
            <span className="rated-box-value">
              {rating}
              {delta != null && <span className={`rated-delta ${delta >= 0 ? 'up' : 'down'}`}>{delta >= 0 ? `+${delta}` : delta}</span>}
            </span>
          </div>}
          {settings.puzzleTimer && <div className="rated-box-item">
            <span className="rated-box-label">Time</span>
            <span className="rated-box-value clock">{clock}</span>
          </div>}
        </div>
        <RatedStreakInfo />
        <StreakRow />
        {puzzle && finished && (
          <div className="puzzle-info">
            {settings.puzzleRating && <div>
              Puzzle rating <b>{puzzle.rating}</b>
            </div>}
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
            <span key={i} className={h.solved ? 'ok' : 'bad'} title={settings.puzzleRating ? `${h.rating} (${h.delta >= 0 ? '+' : ''}${h.delta})` : h.solved ? 'Solved' : 'Missed'} />
          ))}
        </div>
      </SidebarShell>
    </div>}
    </>
  )
}
