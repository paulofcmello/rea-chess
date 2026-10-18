import { useSettings } from '../lib/storage'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from '../components/Board'
import { CoachAvatar, type CoachEmotion } from '../components/Coach'
import { EvalBar, NavButtons, SanText, formatScore } from '../components/ui'
import { Engine } from '../lib/engine'
import { buildPositions } from '../lib/game'
import { fetchAvatar, parseClocks, type CcGame } from '../lib/ccGames'
import { pieceUrl } from '../lib/theme'
import { BAD_MOVES, CLASS_COLOR, CLASS_LABEL, CLASSIFICATIONS, MARKED_MOVES, bookPliesFromEcoUrl, coachLine, expectedPoints, reviewGame, type Review as GameReview } from '../lib/review'
import { ClassIcon } from '../lib/reviewIcons'
import { loadReview, reviewKey, saveReview } from '../lib/reviewCache'
import { openInAnalysis } from './Analysis'
import { playMove } from '../lib/sound'

interface RetryState {
  status: 'ready' | 'checking' | 'correct' | 'incorrect'
  fen?: string
  san?: string
  square?: string
}

export interface ReviewInput {
  pgn: string
  url?: string
  white: { username: string; rating?: number; avatar?: string }
  black: { username: string; rating?: number; avatar?: string }
  me: string
}
// Required route handoff API, matching openInAnalysis.
// eslint-disable-next-line react/only-export-components
export function openInReview(game: CcGame, me: string) {
  openReview({ pgn: game.pgn, url: game.url, white: game.white, black: game.black, me })
}
// eslint-disable-next-line react/only-export-components
export function openReview(input: ReviewInput) {
  sessionStorage.setItem('rea-chess:review', JSON.stringify(input))
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
    return { input, sans, clocks: parseClocks(input.pgn), startFen, headers, ...buildPositions(startFen, sans) }
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
          {marked && <ClassIcon c={m.cls} size={16} />}<span><SanText san={m.san} color={col === 0 ? 'w' : 'b'} /></span>
        </button>
      })}
    </div>)}
    {!review.moves.length && <div className="muted small">No moves in this game</div>}
  </div>
}

function PlayerAvatar({ player, color }: { player: ReviewInput['white']; color: 'w' | 'b' }) {
  const [avatar, setAvatar] = useState<{ username: string; src: string | null } | null>(null)
  useEffect(() => {
    if (player.avatar) return
    let active = true
    void fetchAvatar(player.username).then((src) => {
      if (active) setAvatar({ username: player.username, src })
    }).catch(() => { /* keep the pawn fallback */ })
    return () => { active = false }
  }, [player.username, player.avatar])
  const fallback = pieceUrl(`${color}p`, 'neo', 150)
  return <img src={player.avatar || (avatar?.username === player.username ? avatar.src : null) || fallback} alt={`${player.username}'s avatar`} onError={(e) => {
    if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
  }} />
}

function PlayerBar({ player, color, clock, active }: { player: ReviewInput['white']; color: 'w' | 'b'; clock?: string; active: boolean }) {
  return <div className="cc-player">
    <div className="cc-player-avatar you"><PlayerAvatar player={player} color={color} /></div>
    <div className="cc-player-info"><div className="cc-player-top"><span className="cc-player-name">{player.username}</span>{player.rating != null && <span className="cc-player-rating">({player.rating})</span>}</div></div>
    {clock != null && <div className={`review-clock ${color === 'w' ? 'white' : 'black'} ${active ? 'active' : ''}`} aria-label={`${player.username}'s clock`}>{clock}</div>}
  </div>
}

export default function Review() {
  const [settings] = useSettings()
  const data = useMemo(() => readInput(), [])
  const key = data ? reviewKey(data.input.pgn, data.input.url) : ''
  const [review, setReview] = useState<GameReview | null>(() => key ? loadReview(key) : null)
  const [progress, setProgress] = useState({ done: 0, total: data?.fens.length ?? 1 })
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [started, setStarted] = useState(false)
  const [ply, setPly] = useState(0)
  const [arrowOverride, setArrowOverride] = useState<{ ply: number; show: boolean } | null>(null)
  const [retry, setRetry] = useState<RetryState | null>(null)
  const engineRef = useRef<Engine | null>(null)
  const engineBusy = useRef(false)
  const retryRequest = useRef(0)

  useEffect(() => {
    const engine = new Engine()
    engineRef.current = engine
    return () => { engine.stop(); engine.destroy(); engineRef.current = null }
  }, [])

  const exitRetry = useCallback(() => {
    retryRequest.current++
    if (engineBusy.current) engineRef.current?.stop()
    setRetry(null)
  }, [])

  useEffect(() => {
    if (!retry) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); exitRetry() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [retry, exitRetry])

  useEffect(() => {
    if (retry?.status !== 'incorrect' || !retry.fen) return
    const timer = window.setTimeout(() => setRetry((current) => current === retry ? { ...current, fen: undefined } : current), 600)
    return () => window.clearTimeout(timer)
  }, [retry])

  useEffect(() => {
    if (!data || review) return
    let active = true
    const engine = engineRef.current!
    const run = async () => {
      await Promise.resolve()
      if (!active) return
      setError('')
      engineBusy.current = true
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
      } finally { engineBusy.current = false }
    }
    void run()
    return () => { active = false; engine.stop() }
  }, [data, key, review, attempt])

  if (!data) return <div className="page"><h1>Game Review</h1><p>Choose a game from <a href="#/games">My Games</a> to start a review.</p></div>
  const { input, fens, moves, sans, clocks, startFen, headers } = data
  const orientation = input.black.username.toLowerCase() === input.me.trim().toLowerCase() ? 'black' : 'white'
  const topColor = orientation === 'white' ? 'b' : 'w'
  const bottomColor = topColor === 'w' ? 'b' : 'w'
  const players = { w: input.white, b: input.black }
  const boardFen = retry ? retry.fen ?? fens[ply - 1] : fens[ply]
  const turn = new Chess(boardFen).turn()
  const clockFor = (color: 'w' | 'b') => {
    if (!clocks.length) return undefined
    const blackFirst = startFen.split(' ')[1] === 'b'
    for (let i = ply - 1; i >= 0; i--) {
      if (((i + Number(blackFirst)) % 2 === 0 ? 'w' : 'b') === color && clocks[i]) return clocks[i]
    }
    const seconds = Number(headers.TimeControl?.match(/^(\d+)(?:\+|$)/)?.[1])
    if (!Number.isFinite(seconds)) return '—'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor(seconds / 60) % 60
    const rest = String(seconds % 60).padStart(2, '0')
    return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`
  }
  const move = started && ply > 0 ? review?.moves[ply - 1] : undefined
  const feedback = move ? coachLine(move, ply - 1) : null
  const myColor = orientation === 'white' ? 'w' : 'b'
  const result = headers.Result
  const draw = result === '1/2-1/2'
  const win = result === (myColor === 'w' ? '1-0' : '0-1')
  const finished = draw || result === '1-0' || result === '0-1'
  const greeting = draw ? "A hard-fought draw. Let's review it together." : win ? "Nice win! Let's review it together." : finished ? "Tough loss — let's review it together." : "Let's review this game together."
  const emotion: CoachEmotion = retry ? retry.status === 'correct' ? 'impressed' : retry.status === 'incorrect' ? 'concerned' : 'thinking' : !review ? 'thinking' : move ? BAD_MOVES.includes(move.cls) ? 'concerned' : ['brilliant', 'great'].includes(move.cls) ? 'impressed' : 'idle' : win ? 'happy' : finished && !draw ? 'concerned' : 'idle'
  const autoArrow = settings.bestMoveArrow && !!move && BAD_MOVES.includes(move.cls)
  const showArrow = !retry && (arrowOverride?.ply === ply ? arrowOverride.show : autoArrow)
  const arrows = move && showArrow && move.best ? [{ from: move.best.slice(0, 2), to: move.best.slice(2, 4), color: '#81b64c', opacity: 0.85 }] : []
  const jump = (p: number) => {
    if (p === ply + 1) playMove(sans[p - 1])
    exitRetry()
    setStarted(true); setPly(p); setArrowOverride(null)
  }
  const canRetry = !!move && BAD_MOVES.includes(move.cls) && players[move.color].username.toLowerCase() === input.me.trim().toLowerCase()
  const startRetry = () => { exitRetry(); setRetry({ status: 'ready' }); setArrowOverride(null) }
  const onRetryMove = async (from: string, to: string, promotion?: string) => {
    if (!move || !retry || retry.fen || retry.status === 'correct' || retry.status === 'checking') return
    const chess = new Chess(fens[ply - 1])
    let played
    try { played = chess.move({ from, to, promotion }) } catch { return }
    const request = ++retryRequest.current
    const candidate = { fen: chess.fen(), san: played.san, square: to }
    let correct = from + to + (played.promotion ?? '') === move.best
    if (!correct && engineRef.current && !engineBusy.current) {
      setRetry({ ...candidate, status: 'checking' })
      engineBusy.current = true
      try {
        let score
        if (chess.isCheckmate()) score = { mate: 0, cp: chess.turn() === 'w' ? -100000 : 100000 }
        else if (chess.isDraw()) score = { cp: 0 }
        else {
          const result = await engineRef.current.search(chess.fen(), { depth: 12 })
          const line = result?.lines[0]
          const sign = chess.turn() === 'w' ? 1 : -1
          if (line && line.depth >= 12) score = line.mate != null ? { mate: line.mate * sign } : line.cp != null ? { cp: line.cp * sign } : undefined
        }
        if (score) correct = expectedPoints(move.before, move.color) - expectedPoints(score, move.color) <= 0.02
      } catch { /* If evaluation fails, only the exact best move is accepted. */ }
      finally { engineBusy.current = false }
    }
    if (request !== retryRequest.current || !engineRef.current) return
    setRetry({ ...candidate, status: correct ? 'correct' : 'incorrect' })
    if (correct) playMove(played.san)
  }
  const graph = review && <ReviewGraph review={review} ply={ply} onSelect={jump} />

  return <div className="cc-layout review-layout">
    <div className={`cc-board-area with-players ${settings.showEvalBar ? 'with-eval' : ''}`}>
      <PlayerBar player={players[topColor]} color={topColor} clock={clockFor(topColor)} active={turn === topColor} />
      <div className="cc-board-row">
        {settings.showEvalBar && <EvalBar score={review?.evals[ply] ?? null} flip={orientation === 'black'} />}
        <div className="cc-board-wrap"><Board fen={boardFen} orientation={orientation}
          movable={retry && !retry.fen && retry.status !== 'correct' && retry.status !== 'checking' ? myColor : 'none'} onMove={onRetryMove}
          lastMove={retry || move ? null : ply > 0 ? moves[ply - 1] : null}
          highlights={!retry && move ? [move.uci.slice(0, 2), move.uci.slice(2, 4)].map((square) => ({ square, color: CLASS_COLOR[move.cls], opacity: 0.5 })) : []}
          effects={retry ? retry.square && (retry.status === 'correct' || retry.status === 'incorrect') ? [{ square: retry.square, type: retry.status }] : [] : move ? [{ square: move.uci.slice(2, 4), type: move.cls }] : []} arrows={arrows} /></div>
      </div>
      <PlayerBar player={players[bottomColor]} color={bottomColor} clock={clockFor(bottomColor)} active={turn === bottomColor} />
    </div>
    <section className="cc-sidebar review-sidebar">
      <header className="cc-sidebar-header secondary review-header">
        {started && <button className="review-back" aria-label="Back to summary" onClick={() => { exitRetry(); setStarted(false); setPly(0); setArrowOverride(null) }}>←</button>}
        <h1 className="cc-sidebar-header-title small"><img src="https://assets-ds.chess.com/color-icons/magnifier-star.svg" alt="" />Game Review</h1>
        <button className="review-analysis" title="Open in Analysis" aria-label="Open in Analysis" onClick={() => openInAnalysis(startFen, sans, orientation)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24a1 1 0 0 1-1.42 1.42l-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm0 2a1 1 0 0 1 1 1v1.5H13a1 1 0 1 1 0 2h-1.5V13a1 1 0 1 1-2 0v-1.5H8a1 1 0 1 1 0-2h1.5V8a1 1 0 0 1 1-1Z" /></svg>
        </button>
      </header>
      <div className={`review-body ${started ? 'review-playing' : ''}`}>
        {(settings.reviewCoach || retry) && <div className="review-coach"><div className="review-coach-avatar"><CoachAvatar emotion={emotion} /></div>
          <div className="review-bubble" aria-live="polite">
            {retry ? <strong>{retry.status === 'correct' ? `Great find! ${retry.san} is the best move.` : retry.status === 'incorrect' ? `${retry.san} isn't best. Try again.` : 'Find a better move'}</strong> : !review ? <strong>{error ? 'Analysis paused' : 'Analyzing your game…'}</strong> : feedback && move ? <><div className="review-feedback-title"><ClassIcon c={move.cls} /><strong><SanText san={move.san} color={new Chess(fens[ply - 1]).turn()} />{feedback.title.slice(move.san.length)}</strong><span className="review-eval-chip">{formatScore(move.after)}</span></div>{settings.reviewExplanations && <p>{feedback.text}</p>}</> : <strong>{started ? 'Start at the first move to see your coach’s feedback.' : greeting}</strong>}
          </div>
        </div>}
        {!review ? <div className="review-loading">
          {error ? <><p className="error" role="alert">{error}</p><button className="cc-button cc-primary" onClick={() => setAttempt((n) => n + 1)}>Try again</button></> : <><progress value={progress.done} max={progress.total} aria-label="Positions analyzed" /><p>{Math.round(progress.done / progress.total * 100)}% · {progress.done} / {progress.total} positions</p></>}
        </div> : !started ? <>
          {graph}
          <div className="review-players">
            <span /><strong>{input.white.username}</strong><strong>{input.black.username}</strong>
            <strong>Players</strong>
            {(['w', 'b'] as const).map((color) => <div key={color} className={`review-avatar ${color === myColor ? 'review-me' : ''}`}><PlayerAvatar player={players[color]} color={color} /></div>)}
            <strong>Accuracy</strong><div className="review-accuracy white">{review.accuracy.w.toFixed(1)}</div><div className="review-accuracy black">{review.accuracy.b.toFixed(1)}</div>
          </div>
          <div className="review-tallies" aria-label="Move classifications">{CLASSIFICATIONS.filter((c) => c !== 'forced').map((c) => <div className="review-tally" key={c}>
            <span>{CLASS_LABEL[c]}</span><strong style={{ color: CLASS_COLOR[c] }}>{review.counts.w[c]}</strong><ClassIcon c={c} size={22} /><strong style={{ color: CLASS_COLOR[c] }}>{review.counts.b[c]}</strong>
          </div>)}</div>
        </> : <>
          <div className="review-flow">
            {retry?.status === 'correct' ? <button className="cc-button cc-primary" onClick={exitRetry}>Continue</button> : <>
              {canRetry && <button className="cc-button cc-secondary" disabled={retry?.status === 'checking'} onClick={startRetry}>↻ Retry</button>}
              <button className="cc-button cc-secondary" disabled={!move} aria-pressed={showArrow} onClick={() => { exitRetry(); setArrowOverride({ ply, show: retry ? true : !showArrow }) }}>{retry ? '★ Show Best' : '★ Best'}</button>
            </>}
            <button className="cc-button cc-primary" disabled={ply >= sans.length} onClick={() => jump(Math.min(sans.length, ply + 1))}>➜ Next</button>
          </div>
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
