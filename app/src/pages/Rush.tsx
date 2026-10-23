import { useEffect, useRef, useState } from 'react'
import Board from '../components/Board'
import { loadPuzzles, pickPuzzle, type Puzzle } from '../lib/puzzles'
import { usePuzzle } from '../lib/usePuzzle'
import { useSettings, useStored } from '../lib/storage'
import { play } from '../lib/sound'
import { BoardControls } from './puzzleUi'
import { CCButton, SidebarShell } from '../components/PuzzleSidebar'
import { loadPuzzleSeen, markSeen } from '../lib/puzzleSeen'

type Mode = '3min' | '5min' | 'survival'
const modes: { id: Mode; label: string; desc: string; seconds: number | null }[] = [
  { id: '3min', label: '3 Minutes', desc: 'Solve as many as you can in 3 minutes. 3 strikes and you’re out.', seconds: 180 },
  { id: '5min', label: '5 Minutes', desc: 'Same idea, a little more breathing room.', seconds: 300 },
  { id: 'survival', label: 'Survival', desc: 'No clock. Keep going until 3 strikes.', seconds: null },
]

interface Result {
  puzzle: Puzzle
  solved: boolean
}

export default function Rush() {
  const [all, setAll] = useState<Puzzle[]>([])
  const [best, setBest] = useStored<Record<Mode, number>>('rushBest', { '3min': 0, '5min': 0, survival: 0 })
  const [mode, setMode] = useState<Mode>('3min')
  const [phase, setPhase] = useState<'menu' | 'countdown' | 'playing' | 'over'>('menu')
  const [count, setCount] = useState(3)
  const [timeLeft, setTimeLeft] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [newBest, setNewBest] = useState(false)
  const seen = useRef(new Set<string>())

  useEffect(() => {
    loadPuzzles().then(setAll)
  }, [])

  const score = results.filter((r) => r.solved).length
  const strikes = results.filter((r) => !r.solved).length

  const nextPuzzle = (n: number) => {
    // Difficulty ramps from ~400 up, chess.com-style.
    const target = 400 + n * 55 + Math.max(0, n - 20) * 30
    const pz = pickPuzzle(all, target, loadPuzzleSeen(), undefined, seen.current)
    if (pz) seen.current.add(pz.id)
    setPuzzle(pz)
  }

  const finish = (finalScore: number) => {
    setPhase('over')
    play('game-end')
    if (finalScore > best[mode]) {
      setNewBest(true)
      setBest({ ...best, [mode]: finalScore })
    }
  }

  const p = usePuzzle(phase === 'playing' ? puzzle : null, {
    firstMoveDelay: 250,
    mode: 'rush',
    onResult: (solved, pz) => {
      markSeen(pz.id, solved)
      const nr = [...results, { puzzle: pz, solved }]
      setResults(nr)
      const s = nr.filter((r) => r.solved).length
      if (!solved) {
        if (nr.length - s >= 3) {
          window.setTimeout(() => finish(s), 500)
          return
        }
        window.setTimeout(() => nextPuzzle(nr.length), 500)
      } else {
        window.setTimeout(() => nextPuzzle(nr.length), 300)
      }
    },
  })

  const start = () => {
    seen.current = new Set()
    setResults([])
    setNewBest(false)
    setCount(3)
    setPhase('countdown')
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count === 0) {
      setTimeLeft(modes.find((m) => m.id === mode)!.seconds ?? 0)
      setPhase('playing')
      nextPuzzle(0)
      return
    }
    const t = window.setTimeout(() => setCount((c) => c - 1), 700)
    return () => clearTimeout(t)
  }, [phase, count]) // eslint-disable-line react-hooks/exhaustive-deps

  const seconds = modes.find((m) => m.id === mode)!.seconds
  useEffect(() => {
    if (phase !== 'playing' || seconds == null) return
    const t = window.setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'playing' && seconds != null && timeLeft === 0) finish(score)
  }, [timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  const mmss = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`

  const idle = phase !== 'playing'
  return (
    <div className="cc-layout">
      <div className="cc-board-area">
        {idle ? <Board fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" /> : <Board {...p.boardProps} />}
        {phase === 'countdown' && <div className="countdown">{count || 'Go!'}</div>}
      </div>
      <BoardControls />
      <SidebarShell
        title="Puzzle Rush"
        icon="puzzle-rush"
        footer={
          phase === 'menu' ? (
            <div className="cc-buttons">
              <CCButton kind="primary" label="Start" onClick={start} grow disabled={!all.length} />
            </div>
          ) : phase === 'over' ? (
            <div className="cc-buttons">
              <CCButton label="Modes" onClick={() => setPhase('menu')} grow />
              <CCButton kind="primary" label="Play Again" onClick={start} grow />
            </div>
          ) : (
            <div className="cc-buttons">
              <CCButton label="End Run" onClick={() => finish(score)} grow />
            </div>
          )
        }
      >
        {phase === 'menu' && (
          <div className="mode-list">
            {modes.map((m) => (
              <button key={m.id} className={`mode-card ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
                <div className="mode-title">
                  {m.label}
                  <span className="mode-best">Best {best[m.id]}</span>
                </div>
                <div className="mode-desc">{m.desc}</div>
              </button>
            ))}
          </div>
        )}

        {(phase === 'playing' || phase === 'countdown') && (
          <>
            <div className="rush-top">
              <div className="rush-score">{score}</div>
              {seconds != null && <div className={`rush-clock ${timeLeft <= 10 ? 'low' : ''}`}>{mmss}</div>}
            </div>
            <div className="strikes">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`strike ${i < strikes ? 'on' : ''}`}>✕</span>
              ))}
            </div>
            <div className="rush-turn">
              <span className={`coach-feedback-color ${p.solverColor === 'w' ? 'white' : 'black'}`} />
              {p.solverColor === 'w' ? 'White' : 'Black'} to move
            </div>
            <ResultsGrid results={results} />
          </>
        )}

        {phase === 'over' && (
          <div className="rush-over">
            <div className="rush-over-label">{modes.find((m) => m.id === mode)!.label}</div>
            <div className="rush-final">{score}</div>
            {newBest ? <div className="badge-new">New personal best!</div> : <div className="rush-over-label">Best {best[mode]}</div>}
            <ResultsGrid results={results} />
          </div>
        )}
      </SidebarShell>
    </div>
  )
}

function ResultsGrid({ results }: { results: Result[] }) {
  const [settings] = useSettings()
  return (
    <div className="rush-results">
      {results.map((r, i) => (
        <div key={i} className={`rush-cell ${r.solved ? 'ok' : 'bad'}`} title={settings.puzzleRating ? `#${i + 1} · ${r.puzzle.rating}` : `#${i + 1}`}>
          <span className="rush-cell-icon">{r.solved ? '✓' : '✕'}</span>
          {settings.puzzleRating && <span>{r.puzzle.rating}</span>}
        </div>
      ))}
    </div>
  )
}
