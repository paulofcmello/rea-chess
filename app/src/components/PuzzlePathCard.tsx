import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { pathGeometry, pathLevel, pathPosition, PATH_STEPS, PUZZLES_PER_LEVEL, usePuzzlePath } from '../lib/puzzlePath'
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
  const viewport = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const { level, tile } = pathLevel(display.solved)
  const pawn = pathPosition(tile)

  useLayoutEffect(() => {
    const view = viewport.current
    const world = scene.current
    if (!view || !world || !active) return
    let offset = 0
    let maximum = 0
    let pending = 0
    let frame = 0
    let momentum = 0
    let velocity = 0
    let pointer: number | null = null
    let lastY = 0
    let lastTime = 0

    const move = (delta: number) => {
      const previous = offset
      offset = Math.max(0, Math.min(maximum, offset + delta))
      world.style.transform = `translate3d(0, ${-offset}px, 0)`
      return previous !== offset
    }
    const stop = () => {
      cancelAnimationFrame(momentum)
      momentum = 0
      velocity = 0
    }
    // Like the reference, coalesce wheel/drag deltas into one paint per frame.
    const queue = (delta: number) => {
      pending += delta
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0
        move(pending)
        pending = 0
      })
    }
    const resize = () => {
      if (!view.clientWidth || !view.clientHeight) return
      stop()
      cancelAnimationFrame(frame)
      frame = 0
      pending = 0
      const geometry = pathGeometry(view.clientWidth)
      view.style.setProperty('--path-row-width', `${geometry.rowWidth}px`)
      view.style.setProperty('--path-row-height', `${geometry.rowHeight}px`)
      view.style.setProperty('--path-step-y', `${geometry.rowHeight / 2}px`)
      view.style.setProperty('--path-tile-size', `${geometry.tileSize}px`)
      view.style.setProperty('--path-pawn-size', `${geometry.pawnSize}px`)
      view.style.setProperty('--path-number-size', `${geometry.numberSize}px`)
      const previousMaximum = maximum
      maximum = PATH_STEPS * geometry.rowHeight / 2
      // Coach text and responsive layout can resize the viewport while exploring.
      // Preserve the camera until the current tile changes or the hub reopens.
      offset = previousMaximum ? offset / previousMaximum * maximum : (PATH_STEPS - tile) * geometry.rowHeight / 2
      move(0)
    }
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      stop()
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.clientHeight : 1
      queue(event.deltaY * unit)
    }
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      stop()
      pointer = event.pointerId
      lastY = event.clientY
      lastTime = performance.now()
      view.setPointerCapture(pointer)
      view.classList.add('is-dragging')
    }
    const drag = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return
      const now = performance.now()
      const delta = lastY - event.clientY
      if (now > lastTime) velocity = delta / (now - lastTime) * 16
      lastY = event.clientY
      lastTime = now
      queue(delta)
    }
    const up = (event: PointerEvent) => {
      if (pointer !== event.pointerId) return
      pointer = null
      view.classList.remove('is-dragging')
      if (view.hasPointerCapture(event.pointerId)) view.releasePointerCapture(event.pointerId)
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || view.closest('.reduce-motion')
      if (event.type === 'pointercancel' || reduced) { stop(); return }
      const coast = () => {
        velocity *= 0.95
        if (Math.abs(velocity) < 0.5 || !move(velocity)) { stop(); return }
        momentum = requestAnimationFrame(coast)
      }
      momentum = requestAnimationFrame(coast)
    }
    const key = (event: KeyboardEvent) => {
      const delta = { ArrowDown: 32, ArrowUp: -32, PageDown: view.clientHeight * 0.8, PageUp: -view.clientHeight * 0.8, Home: -maximum, End: maximum }[event.key]
      if (delta === undefined) return
      event.preventDefault()
      stop()
      queue(delta)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(view)
    view.addEventListener('wheel', wheel, { passive: false })
    view.addEventListener('pointerdown', down)
    view.addEventListener('pointermove', drag)
    view.addEventListener('pointerup', up)
    view.addEventListener('pointercancel', up)
    view.addEventListener('lostpointercapture', up)
    view.addEventListener('keydown', key)
    return () => {
      stop()
      cancelAnimationFrame(frame)
      observer.disconnect()
      view.classList.remove('is-dragging')
      if (pointer !== null && view.hasPointerCapture(pointer)) view.releasePointerCapture(pointer)
      view.removeEventListener('wheel', wheel)
      view.removeEventListener('pointerdown', down)
      view.removeEventListener('pointermove', drag)
      view.removeEventListener('pointerup', up)
      view.removeEventListener('pointercancel', up)
      view.removeEventListener('lostpointercapture', up)
      view.removeEventListener('keydown', key)
    }
  }, [active, tile, level])

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
    <div ref={viewport} className="cc-path-viewport" role="region" tabIndex={0} aria-label={`Puzzle path, level ${level}. ${tile} of 20 puzzles completed. Scroll or drag to explore.`}>
      <div ref={scene} className="cc-path-scene" style={{ height: `calc(100cqh + ${PATH_STEPS} * var(--path-step-y))`, backgroundPosition: `center ${pathPosition(0).y}` }}>
        <div className="cc-path-next-region" style={{ height: `calc(${pathPosition(19).y} + var(--path-row-height))` }} />
        <ol className="cc-path-tiles cc-path-next-tiles" aria-label={`Upcoming level ${level + 1}`}>
          {Array.from({ length: PUZZLES_PER_LEVEL }, (_, index) => {
            const point = pathPosition(index, true)
            return <li key={index} className="cc-path-tile" style={{ left: point.x, top: point.y }} aria-label={`Level ${level + 1}, puzzle ${index + 1}`}><img src={art(`silver-level-${index % 2 ? 'dark' : 'light'}`)} alt="" /><span>{index + 1}</span></li>
          })}
        </ol>
        {props.map((prop) => <img key={prop.art} className="cc-path-prop" src={art(`bronze-art-${prop.art}`)} alt="" style={{ left: prop.left, top: pathPosition(prop.index).y }} />)}
        <ol className="cc-path-tiles" aria-label="Puzzles in this level">
          {Array.from({ length: PUZZLES_PER_LEVEL }, (_, index) => {
            const point = pathPosition(index)
            const completed = index < tile
            return <li key={index} className={`cc-path-tile ${completed ? 'completed' : ''}`} aria-current={index === tile ? 'step' : undefined} aria-label={`Puzzle ${index + 1}: ${completed ? 'completed' : index === tile ? 'current' : 'upcoming'}`} style={{ left: point.x, top: point.y }}>
              <img src={art(`bronze-level-${completed ? 'checked' : index % 2 ? 'dark' : 'light'}`)} alt="" />
              {!completed && <span>{index + 1}</span>}
            </li>
          })}
        </ol>
        <div className="cc-path-pawn" style={{ left: pawn.x, top: pawn.y }}>
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
