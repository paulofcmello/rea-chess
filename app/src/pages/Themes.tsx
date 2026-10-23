import { useEffect, useMemo, useState } from 'react'
import Board from '../components/Board'
import { loadPuzzles, pickPuzzle, themeLabels, type Puzzle } from '../lib/puzzles'
import { usePuzzle } from '../lib/usePuzzle'
import { useSettings, useStored } from '../lib/storage'
import { openInAnalysis } from './Analysis'
import { BoardControls, PuzzleCoach, PuzzleFooter } from './puzzleUi'
import { SidebarShell, StreakRow } from '../components/PuzzleSidebar'
import { loadPuzzleSeen, markSeen } from '../lib/puzzleSeen'

const levels = [
  { id: 'easiest', label: 'Easiest', offset: -600 },
  { id: 'easier', label: 'Easier', offset: -300 },
  { id: 'normal', label: 'Normal', offset: 0 },
  { id: 'harder', label: 'Harder', offset: 300 },
  { id: 'hardest', label: 'Hardest', offset: 600 },
]

export default function Themes() {
  const [settings] = useSettings()
  const [all, setAll] = useState<Puzzle[]>([])
  const [rating] = useStored('puzzleRating', 800)
  const [theme, setTheme] = useStored<string | null>('practiceTheme', null)
  const [level, setLevel] = useStored('practiceLevel', 'normal')
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [stats, setStats] = useState({ solved: 0, total: 0 })
  const [seen] = useState(() => new Set<string>())

  useEffect(() => {
    loadPuzzles().then(setAll)
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const p of all) for (const t of p.themes) c[t] = (c[t] ?? 0) + 1
    return c
  }, [all])

  const next = (t = theme) => {
    if (!t) return
    const offset = levels.find((l) => l.id === level)!.offset
    const pz = pickPuzzle(all, rating + offset, loadPuzzleSeen(), (p) => p.themes.includes(t), seen)
    if (pz) seen.add(pz.id)
    setPuzzle(pz)
  }

  const p = usePuzzle(puzzle, {
    onNext: () => next(),
    onResult: (solved, pz) => {
      markSeen(pz.id, solved)
      setStats((s) => ({ solved: s.solved + (solved ? 1 : 0), total: s.total + 1 }))
    },
  })

  if (!puzzle) {
    return (
      <div className="page">
        <h1>Puzzle Themes</h1>
        <p className="muted">Practice a specific tactic. These puzzles are unrated.</p>
        <div className="level-row">
          {levels.map((l) => (
            <button key={l.id} className={`pill ${level === l.id ? 'active' : ''}`} onClick={() => setLevel(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="theme-grid">
          {Object.entries(themeLabels)
            .filter(([k]) => counts[k])
            .map(([k, label]) => (
              <button
                key={k}
                className="theme-card"
                onClick={() => {
                  setTheme(k)
                  setStats({ solved: 0, total: 0 })
                  next(k)
                }}
              >
                <span className="theme-name">{label}</span>
                <span className="muted small">{counts[k]} puzzles</span>
              </button>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="cc-layout">
      <div className="cc-board-area">
        <Board {...p.boardProps} />
      </div>
      <BoardControls />
      <SidebarShell
        title={themeLabels[theme!]}
        icon="training"
        onBack={() => setPuzzle(null)}
        footer={
          <PuzzleFooter
            status={p.status}
            onHint={p.hint}
            onRetry={p.status === 'wrong' ? p.retry : p.restart}
            onSolution={p.showSolution}
            onAnalysis={() => openInAnalysis(puzzle.fen, p.history(), p.orientation)}
            onNext={() => next()}
          />
        }
      >
        <PuzzleCoach status={p.status} color={p.solverColor} usedHint={p.usedHint} />
        <div className="rated-box">
          <div className="rated-box-item">
            <span className="rated-box-label">{levels.find((l) => l.id === level)!.label}</span>
            <span className="rated-box-value">
              {stats.solved}/{stats.total}
            </span>
          </div>
          {settings.puzzleRating && <div className="rated-box-item">
            <span className="rated-box-label">Puzzle</span>
            <span className="rated-box-value">{p.status === 'playing' || p.status === 'loading' ? '?' : puzzle.rating}</span>
          </div>}
        </div>
        <StreakRow />
      </SidebarShell>
    </div>
  )
}
