import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { pathLevel, PUZZLES_PER_LEVEL, usePuzzlePath } from '../lib/puzzlePath'
import { useSettings } from '../lib/storage'
import { useStreak } from '../lib/streak'
import { Glyph } from './glyphs'

const ASSETS = 'https://www.chess.com/bundles/web/images'
const art = (name: string) => `${ASSETS}/puzzles/${name}.svg`
// Captured from the live puzzles.js coach-tip list.
const tips = [
  'Doing Puzzles every day helps you choose safe moves in your own games.',
  'Doing Puzzles every day makes it easier to see your opponents mistakes.',
  'Puzzles help you play your openings more safely, your middlegames more confidently, and your endgames more accurately.',
  'When you get a Puzzle wrong, you should always retry it and review the solution to see what you missed.',
  'In every Puzzle position, only one move works... Can you find it?',
]

// chess.com's eight-step zigzag, scaled to a 300px wide scene.
function position(index: number) {
  return { x: 180 + [0.5, 0, -0.5, -1, -1.5, -1, -0.5, 0][index % 8] * 75, y: 1010 - index * 32 }
}

function LevelBadge({ level }: { level: number }) {
  return <span className="cc-path-badge" aria-label={`Level ${level}`}><img src={`${ASSETS}/color-icons/puzzle-tier-bronze.svg`} alt="" /><strong>{level}</strong></span>
}

export default function PuzzlePathCard({ onSolve, active = true, loading = false }: { onSolve: () => void; active?: boolean; loading?: boolean }) {
  const progress = usePuzzlePath()
  const streak = useStreak()
  const [settings] = useSettings()
  const [display, setDisplay] = useState(progress)
  const [tip, setTip] = useState(0)
  const viewport = useRef<HTMLDivElement>(null)
  const { level, tile } = pathLevel(display.solved)
  const pawn = position(tile)

  useEffect(() => {
    if (!active) return
    // Keep the previous position while solving, then animate when the hub returns.
    const timer = window.setTimeout(() => setDisplay(progress), 40)
    return () => window.clearTimeout(timer)
  }, [progress, active])

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setTip((index) => (index + 1) % tips.length), 12000)
    return () => window.clearInterval(timer)
  }, [active])

  useEffect(() => {
    if (!active || !viewport.current) return
    const height = viewport.current.clientHeight
    viewport.current.scrollTo({ top: pawn.y - height * 0.6, behavior: settings.reduceMotion ? 'instant' : 'smooth' })
  }, [pawn.y, active, settings.reduceMotion])

  return <section className="cc-path-card" aria-label="Puzzle Path">
    <header className="cc-path-header"><LevelBadge level={level} /><h1>Puzzles</h1></header>
    <div className="cc-path-coach"><img src="https://assets-coaches.chess.com/image/coachdavid.png?v=41de5a5d" alt="Coach David" /><p>{tips[tip]}</p></div>
    <div className="cc-path-viewport" ref={viewport} tabIndex={0} role="region" aria-label={`Puzzle path, level ${level}. ${tile} of 20 puzzles completed. Scroll to explore.`}>
      <div className="cc-path-scene">
        <div className="cc-path-next-region" />
        <img className="cc-path-cloud cc-path-cloud-left" src={art('path-fog-L0')} alt="" />
        <img className="cc-path-cloud cc-path-cloud-right" src={art('path-fog-R1')} alt="" />
        {(['R1', 'L1', 'R2', 'L2'] as const).map((side, index) => <img key={side} className="cc-path-prop" src={art(`bronze-art-${side}`)} alt="" style={{ left: side[0] === 'L' ? '6%' : '50%', top: `${820 - index * 165}px` }} />)}
        <ol className="cc-path-tiles" aria-label="Puzzles in this level">
          {Array.from({ length: PUZZLES_PER_LEVEL }, (_, index) => {
            const point = position(index)
            const completed = index < tile
            return <li key={index} className={`cc-path-tile ${completed ? 'completed' : ''}`} aria-current={index === tile ? 'step' : undefined} aria-label={`Puzzle ${index + 1}: ${completed ? 'completed' : index === tile ? 'current' : 'upcoming'}`} style={{ left: `${point.x / 3}%`, top: point.y }}>
              <img src={art(`bronze-level-${completed ? 'checked' : index % 2 ? 'light' : 'dark'}`)} alt="" />
              {!completed && <span>{index + 1}</span>}
            </li>
          })}
        </ol>
        <div className="cc-path-pawn" style={{ left: `${pawn.x / 3}%`, top: pawn.y } as CSSProperties}>
          <div key={display.solved} className="cc-path-pawn-hop"><span className="cc-path-pawn-bubble" aria-hidden="true">♟</span><img src={art('bronze-level-pawn')} alt={`Your pawn, puzzle ${tile + 1}`} /></div>
        </div>
      </div>
    </div>
    <footer className="cc-path-footer">
      <div className="cc-path-stats" aria-live="polite"><strong aria-label={`${display.points} puzzle points`}>{display.points.toLocaleString()}</strong><span aria-label={`${streak.current} day streak`}><Glyph name="flame" size={19} />{streak.current}</span></div>
      <div className="cc-path-progress-row"><div className="cc-path-progress" role="progressbar" aria-label="Progress to next puzzle level" aria-valuenow={tile} aria-valuemin={0} aria-valuemax={20}><span style={{ width: `${tile / PUZZLES_PER_LEVEL * 100}%` }} /></div><LevelBadge level={level + 1} /></div>
      <div className="cc-path-actions"><a className="cc-button cc-secondary cc-path-modes" href="#/themes" aria-label="Puzzle modes and themes" title="Puzzle modes and themes"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M2 3h4v4H2zm7 0h13v4H9zM2 10h4v4H2zm7 0h13v4H9zM2 17h4v4H2zm7 0h13v4H9z" /></svg></a><button className="cc-button cc-primary cc-button-primary" onClick={onSolve} disabled={loading}>Solve Puzzles</button></div>
    </footer>
  </section>
}
