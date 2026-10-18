import { useEffect, useRef, useState } from 'react'
import { pathLevel, PUZZLES_PER_LEVEL, usePuzzlePath } from '../lib/puzzlePath'
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

// Fixed isometric spacing in a 300px-wide scene. Move the camera with the
// pawn instead of shrinking the entire level to fit the viewport.
function position(index: number, current: number) {
  return {
    x: 180 + [0.5, 0, -0.5, -1, -1.5, -1, -0.5, 0][index % 8] * 75,
    y: `calc(52cqh + ${(current - index) * 10.667}cqw)`,
  }
}

// Props sit outside the matching bends, rather than alongside a fixed tile
// index that can put them on top of the path as the camera advances.
const props = [
  { art: 'L1', index: 8, left: '4%' },
  { art: 'R1', index: 4, left: '56%' },
  { art: 'L2', index: 16, left: '4%' },
  { art: 'R2', index: 12, left: '50%' },
]

const modes = [
  { label: 'Daily Puzzle', route: 'daily', icon: 'calendar-dailypuzzle' },
  { label: 'Puzzle Rush', route: 'rush', icon: 'puzzle-rush' },
  { label: 'Themes', route: 'themes', icon: 'book-open-knight' },
  { label: 'Endgames', route: 'endgames', icon: 'pawn-green' },
]

function LevelBadge({ level }: { level: number }) {
  return <span className="cc-path-badge" aria-label={`Level ${level}`}><img src={`${ASSETS}/color-icons/puzzle-tier-bronze.svg`} alt="" /><strong>{level}</strong></span>
}

export default function PuzzlePathCard({ onSolve, active = true, loading = false }: { onSolve: () => void; active?: boolean; loading?: boolean }) {
  const progress = usePuzzlePath()
  const streak = useStreak()
  const [display, setDisplay] = useState(progress)
  const [tip, setTip] = useState(0)
  const [showModes, setShowModes] = useState(false)
  const modesButton = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const { level, tile } = pathLevel(display.solved)
  const pawn = position(tile, tile)

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
    if (showModes) closeButton.current?.focus()
  }, [showModes])

  const closeModes = () => {
    setShowModes(false)
    modesButton.current?.focus()
  }

  return <section className="cc-path-card" aria-label="Puzzle Path" onKeyDown={(event) => {
    if (showModes && event.key === 'Escape') { event.preventDefault(); closeModes() }
  }}>
    <header className="cc-path-header"><LevelBadge level={level} /><h1>Puzzles</h1></header>
    <div className="cc-path-coach">
      <img src="https://assets-coaches.chess.com/image/coachdavid.png?v=41de5a5d" alt="Coach David" />
      <p>{tips[tip]}</p>
      <div className="cc-path-clouds" aria-hidden="true"><img className="cc-path-cloud cc-path-cloud-left" src={art('path-fog-L0')} alt="" />
      <img className="cc-path-cloud cc-path-cloud-right" src={art('path-fog-R1')} alt="" /></div>
    </div>
    <div className="cc-path-viewport" role="region" aria-label={`Puzzle path, level ${level}. ${tile} of 20 puzzles completed.`}>
      <div className="cc-path-scene" style={{ backgroundPosition: `center ${position(0, tile).y}` }}>
        <div className="cc-path-next-region" style={{ top: `calc(${position(19, tile).y} - 72cqw)` }} />
        <div className="cc-path-tile cc-path-next-tile" style={{ top: `calc(${position(19, tile).y} - 32cqw)` }} aria-label={`Level ${level + 1}, puzzle 1`}><img src={art('silver-level-light')} alt="" /><span>1</span></div>
        {props.map((prop) => <img key={prop.art} className="cc-path-prop" src={art(`bronze-art-${prop.art}`)} alt="" style={{ left: prop.left, top: position(prop.index, tile).y }} />)}
        <ol className="cc-path-tiles" aria-label="Puzzles in this level">
          {Array.from({ length: PUZZLES_PER_LEVEL }, (_, index) => {
            const point = position(index, tile)
            const completed = index < tile
            return <li key={index} className={`cc-path-tile ${completed ? 'completed' : ''}`} aria-current={index === tile ? 'step' : undefined} aria-label={`Puzzle ${index + 1}: ${completed ? 'completed' : index === tile ? 'current' : 'upcoming'}`} style={{ left: `${point.x / 3}%`, top: point.y }}>
              <img src={art(`bronze-level-${completed ? 'checked' : index % 2 ? 'light' : 'dark'}`)} alt="" />
              {!completed && <span>{index + 1}</span>}
            </li>
          })}
        </ol>
        <div className="cc-path-pawn" style={{ left: `${pawn.x / 3}%`, top: pawn.y }}>
          <div key={display.solved} className="cc-path-pawn-hop"><span className="cc-path-pawn-bubble" aria-hidden="true">♟</span><img src={art('bronze-level-pawn')} alt={`Your pawn, puzzle ${tile + 1}`} /></div>
        </div>
      </div>
    </div>
    <footer className="cc-path-footer">
      <div className="cc-path-stats" aria-live="polite"><strong aria-label={`${display.points} puzzle points`}>{display.points.toLocaleString()}</strong><span aria-label={`${streak.current} day streak`}><Glyph name="flame" size={19} />{streak.current}</span></div>
      <div className="cc-path-progress-row"><div className="cc-path-progress" role="progressbar" aria-label="Progress to next puzzle level" aria-valuenow={tile} aria-valuemin={0} aria-valuemax={20}><span style={{ width: `${tile / PUZZLES_PER_LEVEL * 100}%` }} /></div><LevelBadge level={level + 1} /></div>
      <div className="cc-path-actions"><button ref={modesButton} className="cc-button cc-secondary cc-path-modes" onClick={() => setShowModes(true)} aria-label="Expand Puzzles Menu" aria-expanded={showModes} aria-controls="puzzle-modes-menu" title="Puzzle modes"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M2 3h4v4H2zm7 0h13v4H9zM2 10h4v4H2zm7 0h13v4H9zM2 17h4v4H2zm7 0h13v4H9z" /></svg></button><button className="cc-button cc-primary cc-button-primary" onClick={onSolve} disabled={loading}>Solve Puzzles</button></div>
    </footer>
    {showModes && <>
      <div className="cc-path-menu-backdrop" onClick={closeModes} />
      <nav id="puzzle-modes-menu" className="cc-path-menu" aria-label="Puzzle modes">
        <button ref={closeButton} className="cc-path-menu-close" onClick={closeModes} aria-label="Back to Puzzle Path" title="Close">×</button>
        <button className="cc-button cc-primary" onClick={() => { setShowModes(false); onSolve() }} disabled={loading}>Solve Puzzles</button>
        {modes.map(({ label, route, icon }) => <a key={route} className="cc-button cc-secondary" href={`#/${route}`}><img src={`https://assets-ds.chess.com/color-icons/${icon}.svg`} alt="" />{label}</a>)}
      </nav>
    </>}
  </section>
}
