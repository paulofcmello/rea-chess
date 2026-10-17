import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from '../components/Board'
import { CoachAvatar, type CoachEmotion } from '../components/Coach'
import { EvalBar, NavButtons, formatScore } from '../components/ui'
import { Engine } from '../lib/engine'
import { buildPositions } from '../lib/game'
import type { CcGame } from '../lib/ccGames'
import { pieceUrl } from '../lib/theme'
import { BAD_MOVES, CLASS_COLOR, CLASS_LABEL, CLASSIFICATIONS, MARKED_MOVES, bookPliesFromEcoUrl, coachLine, expectedPoints, reviewGame, type Review as GameReview } from '../lib/review'
import { ClassIcon } from '../lib/reviewIcons'
import { loadReview, reviewKey, saveReview } from '../lib/reviewCache'
import { openInAnalysis } from './Analysis'

interface ReviewInput {
  pgn: string
  url?: string
  white: { username: string; rating: number }
  black: { username: string; rating: number }
  me: string
}
// Required route handoff API, matching openInAnalysis.
// eslint-disable-next-line react/only-export-components
export function openInReview(game: CcGame, me: string) {
  sessionStorage.setItem('rea-chess:review', JSON.stringify({ pgn: game.pgn, url: game.url, white: game.white, black: game.black, me }))
  location.hash = '#/review'
}
function readInput() {
  try {
    const raw = sessionStorage.getItem('rea-chess:review')
    if (!raw) return null
    const input = JSON.parse(raw) as ReviewInput
    if (!input.pgn || !input.white?.username || !input.black?.username || typeof input.me !== 'string') return null
    const chess = new Chess()
    chess.loadPgn(input.pgn)
    const headers = chess.getHeaders()
    const sans = chess.history()
    const startFen = headers.FEN ?? new Chess().fen()
    return { input, sans, startFen, headers, ...buildPositions(startFen, sans) }
  } catch { return null }
}

function ReviewGraph({ review, ply, onSelect }: { review: GameReview; ply: number; onSelect: (p: number) => void }) {
  const max = Math.max(1, review.evals.length - 1)
  const x = (i: number) => i / max * 1000
  const y = (i: number) => 98 - expectedPoints(review.evals[i]) * 96
  const path = review.evals.map((_, i) => `${x(i)},${y(i)}`).join(' ')
  return (
    <svg className="review-graph" viewBox="0 0 1000 100" preserveAspectRatio="none" role="slider" aria-label="Game evaluation; use arrow keys to navigate" aria-valuemin={0} aria-valuemax={review.moves.length} aria-valuenow={ply} tabIndex={0}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        onSelect(Math.max(0, Math.min(review.moves.length, Math.round((e.clientX - rect.left) / rect.width * max))))
      }}>
      <polygon points={`0,100 ${path} ${x(review.evals.length - 1)},100`} fill="#fff" />
      <line x1="0" x2="1000" y1="50" y2="50" stroke="#aaa" strokeWidth="1" />
      {review.moves.map((m, i) => MARKED_MOVES.includes(m.cls) && <ellipse key={i} cx={x(i + 1)} cy={y(i + 1)} rx="7" ry="3.5" fill={CLASS_COLOR[m.cls]} />)}
      <line x1={x(ply)} x2={x(ply)} y1="0" y2="100" stroke="#81b64c" strokeWidth="3" />
    </svg>
  )
}

function ReviewMoves({ review, startFen, ply, onSelect }: { review: GameReview; startFen: string; ply: number; onSelect: (p: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.querySelector('.active')?.scrollIntoView({ block: 'nearest' }) }, [ply])
  const fields = startFen.split(' ')
  const firstNo = Number(fields[5]) || 1
  const cells: (number | null)[] = [...(fields[1] === 'b' ? [null] : []), ...review.moves.map((_, i) => i)]
  return <div className="movelist review-moves" ref={ref}>
    {Array.from({ length: Math.ceil(cells.length / 2) }, (_, row) => <div className="mrow" key={row}>
      <span className="mnum">{firstNo + row}.</span>
      {[cells[row * 2], cells[row * 2 + 1]].map((i, col) => {
        if (i == null) return <span className="mv muted" key={col}>{col === 0 ? '…' : ''}</span>
        const m = review.moves[i]
        const marked = MARKED_MOVES.includes(m.cls)
        return <button key={col} className={`mv ${ply === i + 1 ? 'active' : ''}`} style={marked ? { color: CLASS_COLOR[m.cls] } : undefined} onClick={() => onSelect(i + 1)} title={`${m.san}: ${CLASS_LABEL[m.cls]}`}>
          {marked && <ClassIcon c={m.cls} size={16} />}{m.san}
        </button>
      })}
    </div>)}
    {!review.moves.length && <div className="muted small">No moves in this game</div>}
  </div>
}

function PlayerBar({ player, color }: { player: ReviewInput['white']; color: 'w' | 'b' }) {
  return <div className="cc-player">
    <div className="cc-player-avatar you"><img src={pieceUrl(`${color}p`, 'neo', 150)} alt="" /></div>
    <div className="cc-player-info"><div className="cc-player-top"><span className="cc-player-name">{player.username}</span><span className="cc-player-rating">({player.rating})</span></div></div>
  </div>
}

export default function Review() {
  const data = useMemo(() => readInput(), [])
  const key = data ? reviewKey(data.input.pgn, data.input.url) : ''
  const [review, setReview] = useState<GameReview | null>(() => key ? loadReview(key) : null)
  const [progress, setProgress] = useState({ done: 0, total: data?.fens.length ?? 1 })
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [started, setStarted] = useState(false)
  const [ply, setPly] = useState(0)
  const [arrowOverride, setArrowOverride] = useState<{ ply: number; show: boolean } | null>(null)

  useEffect(() => {
    if (!data || review) return
    let active = true
    const engine = new Engine()
    const run = async () => {
      await Promise.resolve()
      if (!active) return
      setError('')
      try {
        const result = await reviewGame(data.startFen, data.sans, engine, (done, total) => {
          if (active) setProgress({ done, total })
        }, bookPliesFromEcoUrl(data.headers.ECOUrl))
        if (active) {
          saveReview(key, result)
          setReview(result)
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not analyze this game.')
      }
    }
    void run()
    return () => { active = false; engine.stop(); engine.destroy() }
  }, [data, key, review, attempt])

  if (!data) return <div className="page"><h1>Game Review</h1><p>Choose a game from <a href="#/games">My Games</a> to start a review.</p></div>
  const { input, fens, moves, sans, startFen, headers } = data
  const orientation = input.black.username.toLowerCase() === input.me.trim().toLowerCase() ? 'black' : 'white'
  const topColor = orientation === 'white' ? 'b' : 'w'
  const bottomColor = topColor === 'w' ? 'b' : 'w'
  const players = { w: input.white, b: input.black }
  const move = started && ply > 0 ? review?.moves[ply - 1] : undefined
  const feedback = move ? coachLine(move, ply - 1) : null
  const myColor = orientation === 'white' ? 'w' : 'b'
  const result = headers.Result
  const draw = result === '1/2-1/2'
  const win = result === (myColor === 'w' ? '1-0' : '0-1')
  const finished = draw || result === '1-0' || result === '0-1'
  const greeting = draw ? "A hard-fought draw. Let's review it together." : win ? "Nice win! Let's review it together." : finished ? "Tough loss — let's review it together." : "Let's review this game together."
  const emotion: CoachEmotion = !review ? 'thinking' : move ? BAD_MOVES.includes(move.cls) ? 'concerned' : ['brilliant', 'great'].includes(move.cls) ? 'impressed' : 'idle' : win ? 'happy' : finished && !draw ? 'concerned' : 'idle'
  const autoArrow = !!move && BAD_MOVES.includes(move.cls)
  const showArrow = arrowOverride?.ply === ply ? arrowOverride.show : autoArrow
  const arrows = move && showArrow && move.best ? [{ from: move.best.slice(0, 2), to: move.best.slice(2, 4), color: '#81b64c', opacity: 0.85 }] : []
  const jump = (p: number) => { setStarted(true); setPly(p); setArrowOverride(null) }
  const graph = review && <ReviewGraph review={review} ply={ply} onSelect={jump} />

  return <div className="cc-layout review-layout">
    <div className="cc-board-area with-players with-eval">
      <PlayerBar player={players[topColor]} color={topColor} />
      <div className="cc-board-row">
        <EvalBar score={review?.evals[ply] ?? null} flip={orientation === 'black'} />
        <div className="cc-board-wrap"><Board fen={fens[ply]} orientation={orientation}
          lastMove={move ? null : ply > 0 ? moves[ply - 1] : null}
          highlights={move ? [move.uci.slice(0, 2), move.uci.slice(2, 4)].map((square) => ({ square, color: CLASS_COLOR[move.cls], opacity: 0.5 })) : []}
          effects={move ? [{ square: move.uci.slice(2, 4), type: move.cls }] : []} arrows={arrows} /></div>
      </div>
      <PlayerBar player={players[bottomColor]} color={bottomColor} />
    </div>
    <section className="cc-sidebar review-sidebar">
      <header className="cc-sidebar-header secondary review-header">
        {started && <button className="review-back" aria-label="Back to summary" onClick={() => { setStarted(false); setPly(0); setArrowOverride(null) }}>←</button>}
        <h1 className="cc-sidebar-header-title small"><img src="https://assets-ds.chess.com/color-icons/magnifier-star.svg" alt="" />Game Review</h1>
        <button className="review-analysis" title="Open in Analysis" aria-label="Open in Analysis" onClick={() => openInAnalysis(startFen, sans, orientation)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24a1 1 0 0 1-1.42 1.42l-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm0 2a1 1 0 0 1 1 1v1.5H13a1 1 0 1 1 0 2h-1.5V13a1 1 0 1 1-2 0v-1.5H8a1 1 0 1 1 0-2h1.5V8a1 1 0 0 1 1-1Z" /></svg>
        </button>
      </header>
      <div className={`review-body ${started ? 'review-playing' : ''}`}>
        <div className="review-coach"><div className="review-coach-avatar"><CoachAvatar emotion={emotion} /></div>
          <div className="review-bubble" aria-live="polite">
            {!review ? <strong>{error ? 'Analysis paused' : 'Analyzing your game…'}</strong> : feedback && move ? <><div className="review-feedback-title"><ClassIcon c={move.cls} /><strong>{feedback.title}</strong><span className="review-eval-chip">{formatScore(move.after)}</span></div><p>{feedback.text}</p></> : <strong>{started ? 'Start at the first move to see your coach’s feedback.' : greeting}</strong>}
          </div>
        </div>
        {!review ? <div className="review-loading">
          {error ? <><p className="error" role="alert">{error}</p><button className="cc-button cc-primary" onClick={() => setAttempt((n) => n + 1)}>Try again</button></> : <><progress value={progress.done} max={progress.total} aria-label="Positions analyzed" /><p>{Math.round(progress.done / progress.total * 100)}% · {progress.done} / {progress.total} positions</p></>}
        </div> : !started ? <>
          {graph}
          <div className="review-players">
            <span /><strong>{input.white.username}</strong><strong>{input.black.username}</strong>
            <strong>Players</strong>
            {(['w', 'b'] as const).map((color) => <div key={color} className={`review-avatar ${color === myColor ? 'review-me' : ''}`}><img src={pieceUrl(`${color}p`, 'neo', 150)} alt={`${players[color].username}'s avatar`} /></div>)}
            <strong>Accuracy</strong><div className="review-accuracy white">{review.accuracy.w.toFixed(1)}</div><div className="review-accuracy black">{review.accuracy.b.toFixed(1)}</div>
          </div>
          <div className="review-tallies" aria-label="Move classifications">{CLASSIFICATIONS.filter((c) => c !== 'forced').map((c) => <div className="review-tally" key={c}>
            <span>{CLASS_LABEL[c]}</span><strong style={{ color: CLASS_COLOR[c] }}>{review.counts.w[c]}</strong><ClassIcon c={c} size={22} /><strong style={{ color: CLASS_COLOR[c] }}>{review.counts.b[c]}</strong>
          </div>)}</div>
        </> : <>
          <div className="review-flow"><button className="cc-button cc-secondary" disabled={!move} aria-pressed={showArrow} onClick={() => setArrowOverride({ ply, show: !showArrow })}>★ Best</button><button className="cc-button cc-primary" disabled={ply >= sans.length} onClick={() => jump(Math.min(sans.length, ply + 1))}>➜ Next</button></div>
          <ReviewMoves review={review} startFen={startFen} ply={ply} onSelect={jump} />
          {graph}
          <NavButtons ply={ply} max={sans.length} onSelect={jump} />
        </>}
      </div>
      {review && !started && (
        <div className="cc-sidebar-footer review-footer">
          <button className="cc-button cc-primary review-start" onClick={() => jump(Math.min(1, sans.length))}>Start Review</button>
        </div>
      )}
    </section>
  </div>
}
