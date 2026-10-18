import { useEffect, useState } from 'react'
import { DEFAULT_POSITION } from 'chess.js'
import Board from '../components/Board'
import { BoardPreview } from '../components/BoardPreview'
import { CCButton, CoachSpeech } from '../components/PuzzleSidebar'
import { BoardControls } from './puzzleUi'
import { ENDGAMES_ICON, emptyEndgameProgress, endgameCompletion, formatEndgameTime, loadEndgames, type EndgameCategory, type EndgameDrill, type EndgameProgress, type EndgameTheme } from '../lib/endgames'
import { useStored } from '../lib/storage'
import { useEndgame } from '../lib/useEndgame'
import { pieceUrl } from '../lib/theme'

type Mode = 'practice' | 'challenge'
interface Session { index: number; serial: number; started: number; mode: Mode }

function Progress({ drills, progress }: { drills: EndgameDrill[]; progress: EndgameProgress }) {
  const { done, total, percent } = endgameCompletion(drills, progress)
  return <div className="cc-endgames-progress"><span>{done === total ? '✓ Completed' : `${done}/${total} completed`} <b>{percent}%</b></span><progress value={done} max={total} aria-label={`${percent}% completed`} /></div>
}

function Player({ opponent }: { opponent?: boolean }) {
  return <div className="cc-endgames-player"><img src={pieceUrl(opponent ? 'bk' : 'wk', 'neo')} alt="" /><strong>{opponent ? 'Maximum' : 'You'} <span className="muted">{opponent ? '(3200)' : ''}</span></strong></div>
}

function DrillRun({ theme, session, onBack, onRetry, onNext, onResult }: {
  theme: EndgameTheme; session: Session; onBack: () => void; onRetry: () => void; onNext: () => void
  onResult: (success: boolean, moves: number, ms: number, assisted: boolean) => void
}) {
  const drill = theme.drills[session.index]
  const p = useEndgame(drill, onResult)
  const [flipped, setFlipped] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (p.status !== 'playing') return
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [p.status])
  const practice = session.mode === 'practice'
  const success = p.status === 'success'
  const failed = p.status === 'failed'
  const finished = success || failed
  const lastChallenge = !practice && session.index === theme.drills.length - 1
  const orientation = flipped ? (p.side === 'w' ? 'black' : 'white') : p.boardProps.orientation
  return <div className="cc-layout cc-endgames-layout">
    <div className="cc-board-area cc-endgames-board"><Player opponent /><Board {...p.boardProps} orientation={orientation} /><Player /></div>
    <BoardControls onFlip={() => setFlipped(f => !f)} />
    <section className="cc-sidebar cc-endgames-sidebar">
      <header className="cc-endgames-secondary"><button onClick={onBack} aria-label="Back to theme">←</button><strong>{theme.name}</strong><img src={ENDGAMES_ICON} alt="" /></header>
      <div className="cc-sidebar-body">
        <div className="cc-endgames-run-meta"><span>{practice ? 'Practice' : 'Challenge'} · {session.index + 1}/{theme.drills.length}</span><span className="clock">{formatEndgameTime(now - session.started)}</span></div>
        <div role="status" aria-live="polite"><CoachSpeech kind={success ? 'correct' : failed ? 'incorrect' : p.side === 'w' ? 'white' : 'black'}
          title={success ? lastChallenge ? 'Challenge complete!' : 'Well done!' : failed ? 'Try again' : p.thinking ? 'Maximum is thinking…' : `${p.side === 'w' ? 'White' : 'Black'} to move`}
          text={success ? lastChallenge ? 'You completed every position. Your record is saved.' : 'You achieved the goal. Your progress is saved.' : failed ? 'The goal was not reached. Give it another try.' : p.hinting ? 'Finding the best move…' : drill.goal === 'Win' ? 'Checkmate your opponent. Bring your king into the action!' : 'Hold the position and reach a draw.'}
          emotion={success ? 'happy' : failed ? 'thinking' : 'greeting'} /></div>
        <dl className="cc-endgames-details"><div><dt>Goal</dt><dd>{drill.goal}</dd></div><div><dt>Difficulty</dt><dd>{drill.skillLevel}</dd></div><div><dt>Moves</dt><dd>{p.moves}{drill.moveLimit ? ` / ${drill.moveLimit}` : ''}</dd></div></dl>
        {p.error && <p role="alert">{p.error} <button className="cc-endgames-link" onClick={p.retryEngine}>Try again</button></p>}
        <ol className="cc-endgames-moves" aria-label="Moves">{p.history.filter((_, i) => i % 2 === 0).map((move, i) => <li key={i}><span>{i + 1}.</span><b>{move.san}</b><b>{p.history[i * 2 + 1]?.san}</b></li>)}</ol>
      </div>
      <footer className="cc-sidebar-footer cc-endgames-actions">
        {practice && <div className="cc-buttons"><CCButton icon="bulb" label={p.hinting ? 'Thinking…' : 'Hint'} onClick={p.hint} disabled={finished || p.thinking || p.hinting} grow /><CCButton label="Takeback" onClick={p.takeback} disabled={!p.history.length} grow /></div>}
        <div className="cc-buttons"><CCButton icon="retry" label="Retry" onClick={onRetry} grow />{(practice || success) && <CCButton kind="primary" label={lastChallenge && success ? 'Done' : 'Next'} icon="chevronRight" onClick={onNext} grow />}</div>
      </footer>
    </section>
  </div>
}

export default function Endgames() {
  const [categories, setCategories] = useState<EndgameCategory[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<EndgameCategory | null>(null)
  const [theme, setTheme] = useState<EndgameTheme | null>(null)
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<Mode>('practice')
  const [session, setSession] = useState<Session | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [progress, setProgress] = useStored<EndgameProgress>('endgames', emptyEndgameProgress)

  function fetchCatalogue() {
    setError(''); setLoading(true)
    loadEndgames().then(setCategories).catch(() => setError('Endgames could not be loaded. Please try again.')).finally(() => setLoading(false))
  }
  useEffect(() => {
    let cancelled = false
    loadEndgames().then(data => { if (!cancelled) setCategories(data) }).catch(() => { if (!cancelled) setError('Endgames could not be loaded. Please try again.') }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function start(nextIndex = index, nextMode = mode, started = Date.now()) {
    if (!theme) return
    const drill = theme.drills[nextIndex]
    setProgress(p => ({ ...p, drills: { ...p.drills, [drill.id]: { ...p.drills[drill.id], attempts: (p.drills[drill.id]?.attempts ?? 0) + 1 } } }))
    setSession(s => ({ index: nextIndex, mode: nextMode, started, serial: (s?.serial ?? 0) + 1 }))
  }

  if (session && theme) {
    const drill = theme.drills[session.index]
    return <DrillRun key={`${session.serial}-${drill.id}`} theme={theme} session={session} onBack={() => { setIndex(session.index); setSession(null) }}
      onRetry={() => start(session.mode === 'challenge' ? 0 : session.index, session.mode)}
      onNext={() => {
        if (session.mode === 'challenge' && session.index === theme.drills.length - 1) setSession(null)
        else start((session.index + 1) % theme.drills.length, session.mode, session.mode === 'challenge' ? session.started : Date.now())
      }}
      onResult={(success, moves, ms, assisted) => {
        if (!success) return
        const challengeMs = Date.now() - session.started
        setProgress(p => {
          const old = p.drills[drill.id]
          const challenge = session.mode === 'challenge' && session.index === theme.drills.length - 1
          const best = p.challenges[theme.id]
          return { drills: { ...p.drills, [drill.id]: { ...old, attempts: old?.attempts ?? 1, completed: true, bestMoves: Math.min(old?.bestMoves ?? Infinity, moves), bestMs: Math.min(old?.bestMs ?? Infinity, ms), assisted: (old?.assisted ?? true) && assisted } },
            challenges: challenge ? { ...p.challenges, [theme.id]: { bestMs: Math.min(best?.bestMs ?? Infinity, challengeMs), completed: (best?.completed ?? 0) + 1 } } : p.challenges }
        })
      }} />
  }

  const drill = theme?.drills[index]
  const previewFen = drill?.fen ?? category?.themes[0]?.drills[0]?.fen ?? DEFAULT_POSITION
  const previewSide = previewFen.split(' ')[1] === 'b' ? 'black' : 'white'
  const currentDrills = theme?.drills ?? category?.themes.flatMap(t => t.drills) ?? categories.flatMap(c => c.themes.flatMap(t => t.drills))
  const completion = endgameCompletion(currentDrills, progress)

  return <div className="cc-layout cc-endgames-layout">
    <div className="cc-board-area cc-endgames-board"><Player opponent /><Board fen={previewFen} orientation={flipped ? (previewSide === 'white' ? 'black' : 'white') : previewSide} movable="none" /><Player /></div>
    <BoardControls onFlip={() => setFlipped(f => !f)} />
    <section className="cc-sidebar cc-endgames-sidebar">
      {category ? <header className="cc-endgames-secondary"><button aria-label="Back" onClick={() => { if (theme) setTheme(null); else setCategory(null) }}>←</button><strong>{category.name}</strong><img src={category.imageUrl} alt="" /></header> : <header className="cc-endgames-heading"><h1>Endgames</h1><img src={ENDGAMES_ICON} alt="" /></header>}
      {theme ? <>
        <div className="cc-endgames-theme-heading"><h1>{theme.name}</h1><p className="muted">{theme.description}</p></div>
        <div className="cc-endgames-tabs" role="group" aria-label="Training mode">{(['challenge', 'practice'] as const).map(m => <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>{m === 'practice' ? 'Practice' : 'Challenge'}</button>)}</div>
        <div className="cc-sidebar-body">
          <Progress drills={theme.drills} progress={progress} />
          {mode === 'practice' && drill ? <>
            <h2 className="cc-endgames-label">Positions</h2>
            <div className="cc-endgames-positions">{theme.drills.map((d, i) => <button key={d.id} className={`${index === i ? 'selected' : ''} ${progress.drills[d.id]?.completed ? 'completed' : ''}`} aria-label={`Position ${i + 1}${progress.drills[d.id]?.completed ? ', completed' : ''}`} aria-pressed={index === i} onClick={() => setIndex(i)}>{progress.drills[d.id]?.completed ? '✓' : i + 1}</button>)}</div>
            <div className="cc-endgames-preview"><BoardPreview fen={drill.fen} orientation={previewSide} /></div>
            <dl className="cc-endgames-details"><div><dt>Goal</dt><dd>{drill.goal}</dd></div><div><dt>Difficulty</dt><dd>{drill.skillLevel}</dd></div>{progress.drills[drill.id] && <><div><dt>Attempts</dt><dd>{progress.drills[drill.id].attempts}</dd></div>{progress.drills[drill.id].completed && <div><dt>Personal best</dt><dd>{progress.drills[drill.id].bestMoves} moves · {formatEndgameTime(progress.drills[drill.id].bestMs ?? 0)}</dd></div>}</>}</dl>
          </> : <div className="cc-endgames-challenge"><img src={ENDGAMES_ICON} alt="" /><h2>Beat your best time</h2><p>Complete all {theme.drills.length} positions against Maximum. Each position must reach its goal.</p><p className="muted">Hints and takebacks are available in Practice.</p><span className="cc-endgames-label">Your best</span><strong className="clock">{progress.challenges[theme.id] ? formatEndgameTime(progress.challenges[theme.id].bestMs) : '—'}</strong></div>}
        </div>
        <footer className="cc-sidebar-footer cc-endgames-actions"><CCButton kind="primary" label={mode === 'practice' ? 'Practice' : 'Start Challenge'} onClick={() => start(mode === 'challenge' ? 0 : index)} grow /></footer>
      </> : <>
        <div className="cc-endgames-tabs"><span>Themes</span><span className="muted">{completion.percent}% complete</span></div>
        <div className="cc-sidebar-body cc-endgames-catalogue">
          {loading && <p role="status">Loading endgames…</p>}
          {error && <div role="alert"><p>{error}</p><CCButton label="Try again" onClick={fetchCatalogue} /></div>}
          {category ? category.themes.map(t => <button className="cc-endgames-card" key={t.id} onClick={() => { setTheme(t); setIndex(0) }}><strong>{t.name}</strong><span className="muted small">{t.description}</span><Progress drills={t.drills} progress={progress} /></button>) : categories.map(c => <button className="cc-endgames-card cc-endgames-category" key={c.id} onClick={() => setCategory(c)}><img src={c.imageUrl} alt="" /><div><strong>{c.name}</strong><Progress drills={c.themes.flatMap(t => t.drills)} progress={progress} /></div></button>)}
        </div>
      </>}
    </section>
  </div>
}
