import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Chess } from 'chess.js'
import Board, { type Arrow } from '../components/Board'
import { Avatar, EvalBar, Modal, MoveList, NavButtons, type Score } from '../components/ui'
import { bots, botMove, tiers } from '../lib/bots'
import { Engine } from '../lib/engine'
import { buildPositions, material } from '../lib/game'
import { play, playMove } from '../lib/sound'
import { useStored } from '../lib/storage'
import { pieceUrl } from '../lib/theme'
import { openInAnalysis } from './Analysis'

const START = new Chess().fen()

type ColorChoice = 'w' | 'random' | 'b'
interface Record3 {
  w: number
  l: number
  d: number
}
interface GameResult {
  winner: 'w' | 'b' | null
  reason: string
}

function gameOver(startFen: string, sans: string[]): GameResult | null {
  const c = new Chess(startFen)
  for (const s of sans) c.move(s)
  if (c.isCheckmate()) return { winner: c.turn() === 'w' ? 'b' : 'w', reason: 'by checkmate' }
  if (c.isStalemate()) return { winner: null, reason: 'by stalemate' }
  if (c.isInsufficientMaterial()) return { winner: null, reason: 'by insufficient material' }
  if (c.isThreefoldRepetition()) return { winner: null, reason: 'by repetition' }
  if (c.isDraw()) return { winner: null, reason: 'by 50-move rule' }
  return null
}

export default function Bots() {
  const [botId, setBotId] = useStored('botId', 'nora')
  const [colorChoice, setColorChoice] = useStored<ColorChoice>('botColor', 'w')
  const [assist, setAssist] = useStored('botAssist', { hints: true, takebacks: true, evalBar: false })
  const [records, setRecords] = useStored<Record<string, Record3>>('botRecords', {})
  const bot = bots.find((b) => b.id === botId) ?? bots[2]

  const [phase, setPhase] = useState<'select' | 'playing'>('select')
  const [userColor, setUserColor] = useState<'w' | 'b'>('w')
  const [sans, setSans] = useState<string[]>([])
  const [ply, setPly] = useState(0)
  const [result, setResult] = useState<GameResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [chat, setChat] = useState('')
  const [hintArrow, setHintArrow] = useState<Arrow[]>([])
  const [premoves, setPremoves] = useState<[string, string][]>([])
  const [evalScore, setEvalScore] = useState<Score | null>(null)
  const [thinking, setThinking] = useState(false)
  const [orientationFlip, setOrientationFlip] = useState(false)

  const botEngine = useRef<Engine | null>(null)
  const helperEngine = useRef<Engine | null>(null)
  const gameId = useRef(0)

  useEffect(() => {
    botEngine.current = new Engine()
    helperEngine.current = new Engine()
    return () => {
      botEngine.current?.destroy()
      helperEngine.current?.destroy()
    }
  }, [])

  const { fens, moves } = useMemo(() => buildPositions(START, sans), [sans])
  const liveFen = fens[fens.length - 1]
  const viewFen = fens[ply]
  const atLive = ply === sans.length
  const turn = new Chess(liveFen).turn()
  const botColor = userColor === 'w' ? 'b' : 'w'

  const finish = (r: GameResult) => {
    setPremoves([])
    setResult(r)
    setShowResult(true)
    play('game-end')
    const outcome = r.winner == null ? 'd' : r.winner === userColor ? 'w' : 'l'
    setRecords((rec) => {
      const cur = rec[bot.id] ?? { w: 0, l: 0, d: 0 }
      return { ...rec, [bot.id]: { ...cur, [outcome]: cur[outcome] + 1 } }
    })
    setChat(r.winner == null ? 'A draw! Well fought.' : r.winner === botColor ? bot.onWin : bot.onLose)
  }

  const pushMove = (san: string) => {
    const next = [...sans, san]
    setSans(next)
    setPly(next.length)
    setHintArrow([])
    const r = gameOver(START, next)
    if (r) finish(r)
    return next
  }

  // Bot's turn.
  useEffect(() => {
    if (phase !== 'playing' || result || turn !== botColor || !botEngine.current) return
    const id = gameId.current
    const fen = liveFen
    setThinking(true)
    const started = Date.now()
    botMove(botEngine.current, bot, fen).then((uci) => {
      if (!uci || id !== gameId.current) return
      const delay = Math.max(0, 350 + Math.random() * 500 - (Date.now() - started))
      window.setTimeout(() => {
        if (id !== gameId.current) return
        const c = new Chess(fen)
        const m = c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] })
        playMove(m.san, true)
        setThinking(false)
        if (c.inCheck() && !c.isCheckmate() && Math.random() < 0.5) setChat(pick(bot.onCheck))
        pushMove(m.san)
      }, delay)
    })
  }, [liveFen, phase, result]) // eslint-disable-line react-hooks/exhaustive-deps

  // Play the next queued premove once it's our turn (chess.com premoveDelay: 200ms).
  // If it's no longer legal, the whole queue is dropped, like chess.com.
  useEffect(() => {
    if (phase !== 'playing' || result || turn !== userColor || !premoves.length) return
    const id = gameId.current
    const fen = liveFen
    const t = window.setTimeout(() => {
      if (id !== gameId.current) return
      const [[from, to], ...rest] = premoves
      const c = new Chess(fen)
      try {
        const m = c.move({ from, to, promotion: 'q' })
        playMove(m.san)
        setPremoves(rest)
        pushMove(m.san)
      } catch {
        setPremoves([])
      }
    }, 200)
    return () => clearTimeout(t)
  }, [liveFen, premoves, phase, result]) // eslint-disable-line react-hooks/exhaustive-deps

  // Optional eval bar.
  useEffect(() => {
    if (phase !== 'playing' || !assist.evalBar || !helperEngine.current) {
      setEvalScore(null)
      return
    }
    const fen = viewFen
    const sign = new Chess(fen).turn() === 'w' ? 1 : -1
    const c = new Chess(fen)
    if (c.isCheckmate()) {
      setEvalScore({ mate: 0, cp: c.turn() === 'w' ? -100000 : 100000 })
      return
    }
    helperEngine.current.search(fen, {
      depth: 14,
      options: { UCI_LimitStrength: false, 'Skill Level': 20 },
      onInfo: (ls) => {
        const l = ls[0]
        if (l) setEvalScore(l.mate != null ? { mate: l.mate * sign } : { cp: (l.cp ?? 0) * sign })
      },
    })
  }, [viewFen, phase, assist.evalBar])

  const start = () => {
    gameId.current++
    botEngine.current?.stop()
    botEngine.current?.newGame()
    const color = colorChoice === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : colorChoice
    setUserColor(color)
    setSans([])
    setPly(0)
    setResult(null)
    setShowResult(false)
    setHintArrow([])
    setPremoves([])
    setThinking(false)
    setOrientationFlip(false)
    setChat(bot.greet)
    setPhase('playing')
    play('game-start')
  }

  const onUserMove = (from: string, to: string, promotion?: string) => {
    if (!atLive || result || turn !== userColor) return
    const c = new Chess(liveFen)
    try {
      const m = c.move({ from, to, promotion })
      playMove(m.san)
      pushMove(m.san)
    } catch {
      /* illegal */
    }
  }

  const hint = async () => {
    if (!helperEngine.current || turn !== userColor || result) return
    setPly(sans.length)
    const r = await helperEngine.current.search(liveFen, { depth: 14, options: { UCI_LimitStrength: false, 'Skill Level': 20 } })
    if (r?.bestmove) setHintArrow([{ from: r.bestmove.slice(0, 2), to: r.bestmove.slice(2, 4), color: 'rgba(129,182,76,0.9)' }])
  }

  const takeback = () => {
    if (!sans.length || result) return
    gameId.current++
    botEngine.current?.stop()
    setThinking(false)
    // Undo back to the most recent position where it's the user's turn.
    let n = sans.length - 1
    if (n > 0 && new Chess(fens[n]).turn() !== userColor) n--
    if (new Chess(fens[n]).turn() !== userColor) return
    setSans(sans.slice(0, n))
    setPly(n)
    setHintArrow([])
    setPremoves([])
  }

  const resign = () => {
    if (result) return
    gameId.current++
    botEngine.current?.stop()
    setThinking(false)
    finish({ winner: botColor, reason: 'by resignation' })
  }

  const orientation: 'white' | 'black' = (userColor === 'w') !== orientationFlip ? 'white' : 'black'

  if (phase === 'select') {
    return (
      <div className="layout">
        <div className="board-col">
          <PlayerBar name={bot.name} rating={bot.rating} avatar={<Avatar emoji={bot.avatar} color={bot.color} size={36} />} />
          <Board fen={START} orientation={colorChoice === 'b' ? 'black' : 'white'} />
          <PlayerBar name="You" avatar={<div className="avatar you">🙂</div>} />
        </div>
        <aside className="panel">
          <div className="panel-header">
            <span className="panel-icon">🤖</span> Play Bots
          </div>
          <div className="panel-body">
            <div className="bot-hero">
              <Avatar emoji={bot.avatar} color={bot.color} size={72} />
              <div className="bubble">{bot.greet}</div>
            </div>
            <div className="bot-hero-name">
              {bot.name} <span className="muted">{bot.rating}</span>
              {records[bot.id]?.w ? <span className="beaten" title="You beat this bot">✓ Beaten</span> : null}
            </div>
            <div className="muted small bot-bio">{bot.bio}</div>
            {records[bot.id] && (
              <div className="muted small">
                Record: {records[bot.id].w}W · {records[bot.id].l}L · {records[bot.id].d}D
              </div>
            )}

            {tiers.map((tier) => (
              <div key={tier} className="tier">
                <div className="tier-title">
                  {tier}
                  <span className="muted small">{bots.filter((b) => b.tier === tier).length} bots</span>
                </div>
                <div className="bot-grid">
                  {bots
                    .filter((b) => b.tier === tier)
                    .map((b) => (
                      <button key={b.id} className={`bot-tile ${b.id === bot.id ? 'active' : ''}`} onClick={() => setBotId(b.id)} title={`${b.name} (${b.rating})`}>
                        <Avatar emoji={b.avatar} color={b.color} size={52} />
                        {records[b.id]?.w ? <span className="tile-check">✓</span> : null}
                        <span className="tile-rating">{b.rating}</span>
                      </button>
                    ))}
                </div>
              </div>
            ))}

            <div className="options">
              <div className="muted small">I play as</div>
              <div className="color-pick">
                {(['w', 'random', 'b'] as ColorChoice[]).map((c) => (
                  <button key={c} className={`color-btn ${colorChoice === c ? 'active' : ''}`} onClick={() => setColorChoice(c)} title={c === 'w' ? 'White' : c === 'b' ? 'Black' : 'Random'}>
                    {c === 'random' ? <span className="half-king" /> : <img src={pieceUrl(c + 'k')} alt="" />}
                  </button>
                ))}
              </div>
              <label className="check-row">
                <input type="checkbox" checked={assist.hints} onChange={(e) => setAssist({ ...assist, hints: e.target.checked })} /> Hints
              </label>
              <label className="check-row">
                <input type="checkbox" checked={assist.takebacks} onChange={(e) => setAssist({ ...assist, takebacks: e.target.checked })} /> Takebacks
              </label>
              <label className="check-row">
                <input type="checkbox" checked={assist.evalBar} onChange={(e) => setAssist({ ...assist, evalBar: e.target.checked })} /> Evaluation bar
              </label>
            </div>
          </div>
          <div className="panel-footer">
            <button className="btn primary big grow" onClick={start}>Play</button>
          </div>
        </aside>
      </div>
    )
  }

  const mat = material(viewFen)
  const botMat = { pieces: mat.capturedBy[botColor], diff: botColor === 'w' ? mat.diff : -mat.diff }
  const userMat = { pieces: mat.capturedBy[userColor], diff: userColor === 'w' ? mat.diff : -mat.diff }
  const topIsBot = orientation !== (botColor === 'w' ? 'white' : 'black')

  const botBar = (
    <PlayerBar
      name={bot.name}
      rating={bot.rating}
      avatar={<Avatar emoji={bot.avatar} color={bot.color} size={36} />}
      captured={botMat.pieces}
      capturedColor={userColor}
      diff={botMat.diff}
      chat={chat}
      thinking={thinking}
    />
  )
  const userBar = <PlayerBar name="You" avatar={<div className="avatar you">🙂</div>} captured={userMat.pieces} capturedColor={botColor} diff={userMat.diff} />

  return (
    <div className="layout">
      <div className={`board-col ${assist.evalBar ? 'with-eval' : ''}`}>
        {topIsBot ? botBar : userBar}
        <div className="board-row">
          {assist.evalBar && <EvalBar score={evalScore} flip={orientation === 'black'} />}
          <Board
            fen={viewFen}
            orientation={orientation}
            movable={atLive && !result ? userColor : 'none'}
            onMove={onUserMove}
            lastMove={ply > 0 ? moves[ply - 1] : null}
            arrows={atLive ? hintArrow : []}
            premoves={atLive ? premoves : []}
            premoveColor={atLive && !result ? userColor : undefined}
            onPremove={(from, to) => setPremoves((p) => [...p, [from, to]])}
            onClearPremoves={() => setPremoves([])}
          />
        </div>
        {topIsBot ? userBar : botBar}
      </div>
      <aside className="panel">
        <div className="panel-header">
          <Avatar emoji={bot.avatar} color={bot.color} size={28} /> {bot.name}
          <span className="muted">({bot.rating})</span>
        </div>
        <div className="panel-body">
          <MoveList sans={sans} ply={ply} onSelect={setPly} />
          {result && (
            <div className="result-line">
              {result.winner == null ? '½–½' : result.winner === 'w' ? '1–0' : '0–1'} · {result.winner == null ? 'Draw' : result.winner === userColor ? 'You won' : `${bot.name} won`} {result.reason}
            </div>
          )}
        </div>
        <div className="panel-footer">
          <div className="btn-row">
            <NavButtons ply={ply} max={sans.length} onSelect={setPly} />
            <button className="btn icon" title="Flip board" onClick={() => setOrientationFlip((f) => !f)}>⇅</button>
          </div>
          {!result ? (
            <div className="btn-row">
              {assist.hints && <button className="btn secondary grow" onClick={hint} disabled={turn !== userColor}>💡 Hint</button>}
              {assist.takebacks && <button className="btn secondary grow" onClick={takeback} disabled={!sans.length}>↶ Takeback</button>}
              <button className="btn secondary grow" onClick={resign}>⚑ Resign</button>
            </div>
          ) : (
            <div className="btn-row">
              <button className="btn secondary grow" onClick={() => setPhase('select')}>New Bot</button>
              <button className="btn secondary grow" onClick={() => openInAnalysis(START, sans, userColor === 'w' ? 'white' : 'black')}>Analyze</button>
              <button className="btn primary grow" onClick={start}>Rematch</button>
            </div>
          )}
        </div>
      </aside>

      {showResult && result && (
        <Modal onClose={() => setShowResult(false)}>
          <div className="result-modal">
            <div className="result-title">
              {result.winner == null ? 'Draw' : result.winner === userColor ? 'You Won!' : `${bot.name} Won`}
            </div>
            <div className="muted">{result.reason}</div>
            <div className="result-faces">
              <div className="avatar you big">🙂</div>
              <span className="vs">vs</span>
              <Avatar emoji={bot.avatar} color={bot.color} size={64} />
            </div>
            <div className="bubble center">{chat}</div>
            <div className="btn-col">
              <button className="btn primary big" onClick={start}>Rematch</button>
              <div className="btn-row">
                <button className="btn secondary grow" onClick={() => openInAnalysis(START, sans, userColor === 'w' ? 'white' : 'black')}>Game Review</button>
                <button className="btn secondary grow" onClick={() => { setShowResult(false); setPhase('select') }}>New Bot</button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function pick<T>(xs: T[]) {
  return xs[Math.floor(Math.random() * xs.length)]
}

function PlayerBar({
  name,
  rating,
  avatar,
  captured = [],
  capturedColor = 'b',
  diff = 0,
  chat,
  thinking,
}: {
  name: string
  rating?: number
  avatar: ReactNode
  captured?: string[]
  capturedColor?: 'w' | 'b'
  diff?: number
  chat?: string
  thinking?: boolean
}) {
  return (
    <div className="player-bar">
      {avatar}
      <div className="player-info">
        <div className="player-name">
          {name} {rating != null && <span className="muted">({rating})</span>}
          {thinking && <span className="thinking"><i /><i /><i /></span>}
        </div>
        <div className="captured">
          {captured.map((t, i) => (
            <img key={i} src={pieceUrl(capturedColor + t, undefined, 50)} alt="" />
          ))}
          {diff > 0 && <span className="muted small">+{diff}</span>}
        </div>
      </div>
      {chat && <div className="bubble side">{chat}</div>}
    </div>
  )
}

