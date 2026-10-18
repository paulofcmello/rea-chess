import ConfirmDialog from '../components/ConfirmDialog'
// Play Bots, laid out like chess.com /play/computer (structure, sizes and roster captured with REA).
import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board, { type Arrow, type ResultBadge } from '../components/Board'
import { EvalBar, SanText, type Score } from '../components/ui'
import { Glyph } from '../components/glyphs'
import { CCButton, ICONS } from '../components/PuzzleSidebar'
import { botMove, chat as lines, loadBots, type Bot, type BotGroup } from '../lib/bots'
import { Engine } from '../lib/engine'
import { buildPositions, material } from '../lib/game'
import { play, playMove } from '../lib/sound'
import { useSettings, useStored } from '../lib/storage'
import { pieceUrl } from '../lib/theme'
import { openReview } from './Review'
import { BoardControls } from './puzzleUi'

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
  how: 'checkmate' | 'resign' | 'draw'
}

function gameOver(sans: string[]): GameResult | null {
  const c = new Chess()
  for (const s of sans) c.move(s)
  if (c.isCheckmate()) return { winner: c.turn() === 'w' ? 'b' : 'w', reason: 'by checkmate', how: 'checkmate' }
  if (c.isStalemate()) return { winner: null, reason: 'by stalemate', how: 'draw' }
  if (c.isInsufficientMaterial()) return { winner: null, reason: 'by insufficient material', how: 'draw' }
  if (c.isThreefoldRepetition()) return { winner: null, reason: 'by repetition', how: 'draw' }
  if (c.isDraw()) return { winner: null, reason: 'by 50-move rule', how: 'draw' }
  return null
}

function flag(cc: string) {
  if (!cc || cc.length !== 2 || cc[0].toLowerCase() === 'x') return '' // x* = chess.com custom regions
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)))
}

function kingSquare(fen: string, color: 'w' | 'b') {
  for (const row of new Chess(fen).board()) for (const p of row) if (p && p.type === 'k' && p.color === color) return p.square
  return 'e1'
}

export default function Bots() {
  const [settings] = useSettings()
  const [confirmResign, setConfirmResign] = useState(false)
  const [groups, setGroups] = useState<BotGroup[]>([])
  const [tip, setTip] = useState<{ bot: Bot; x: number; y: number; visible: boolean } | null>(null)
  const tipTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // chess.com cc-tooltip: mounts hidden, becomes visible after a 200ms delay, fades/slides out over 200ms.
  const showTip = (bot: Bot, x: number, y: number) => {
    clearTimeout(tipTimer.current)
    const instant = settings.reduceMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    setTip({ bot, x, y, visible: !!instant })
    if (!instant) tipTimer.current = setTimeout(() => setTip((t) => t && { ...t, visible: true }), 200)
  }
  const hideTip = (now = false) => {
    clearTimeout(tipTimer.current)
    if (now) return setTip(null)
    setTip((t) => t && { ...t, visible: false })
    tipTimer.current = setTimeout(() => setTip(null), 200)
  }
  const [botId, setBotId] = useStored('botId', '')
  const [openGroup, setOpenGroup] = useStored('botGroup', 'The Cryptids')
  const [colorChoice, setColorChoice] = useState<ColorChoice>(settings.botColor)
  const [assist, setAssist] = useStored('botAssist', { hints: true, takebacks: true, evalBar: false })
  const [records, setRecords] = useStored<Record<string, Record3>>('botRecords', {})
  const [showOptions, setShowOptions] = useState(false)

  const [phase, setPhase] = useState<'select' | 'playing'>('select')
  const [userColor, setUserColor] = useState<'w' | 'b'>('w')
  const [sans, setSans] = useState<string[]>([])
  const [ply, setPly] = useState(0)
  const [result, setResult] = useState<GameResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [speech, setSpeech] = useState('')
  const [hintArrow, setHintArrow] = useState<Arrow[]>([])
  const [premoves, setPremoves] = useState<[string, string][]>([])
  const [evalScore, setEvalScore] = useState<Score | null>(null)
  const [thinking, setThinking] = useState(false)
  const [orientationFlip, setOrientationFlip] = useState(false)

  const botEngine = useRef<Engine | null>(null)
  const helperEngine = useRef<Engine | null>(null)
  const gameId = useRef(0)

  useEffect(() => {
    loadBots().then(setGroups)
    botEngine.current = new Engine()
    helperEngine.current = new Engine()
    return () => {
      botEngine.current?.destroy()
      helperEngine.current?.destroy()
    }
  }, [])

  const allBots = useMemo(() => groups.flatMap((g) => g.bots), [groups])
  const bot: Bot | undefined = allBots.find((b) => b.id === botId) ?? allBots[0]

  useEffect(() => {
    if (phase === 'select' && bot) setSpeech(lines.greet())
  }, [bot?.id, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const { fens, moves } = useMemo(() => buildPositions(START, sans), [sans])
  const liveFen = fens[fens.length - 1]
  const viewFen = fens[ply]
  const atLive = ply === sans.length
  const turn = new Chess(liveFen).turn()
  const botColor = userColor === 'w' ? 'b' : 'w'

  const finish = (r: GameResult) => {
    if (!bot) return
    setPremoves([])
    setResult(r)
    setShowResult(true)
    play('game-end')
    const outcome = r.winner == null ? 'd' : r.winner === userColor ? 'w' : 'l'
    setRecords((rec) => {
      const cur = rec[bot.id] ?? { w: 0, l: 0, d: 0 }
      return { ...rec, [bot.id]: { ...cur, [outcome]: cur[outcome] + 1 } }
    })
    setSpeech(r.winner == null ? lines.draw() : r.winner === botColor ? lines.botWon() : lines.botLost())
  }

  const pushMove = (san: string) => {
    const next = [...sans, san]
    setSans(next)
    setPly(next.length)
    setHintArrow([])
    const r = gameOver(next)
    if (r) finish(r)
    return next
  }

  // Bot's turn.
  useEffect(() => {
    if (phase !== 'playing' || result || turn !== botColor || !botEngine.current || !bot) return
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
        if (c.inCheck() && !c.isCheckmate() && Math.random() < 0.4) setSpeech(lines.check())
        pushMove(m.san)
      }, delay)
    })
  }, [liveFen, phase, result]) // eslint-disable-line react-hooks/exhaustive-deps

  // Queued premoves play 200ms after the bot moves (chess.com premoveDelay); an illegal one drops the queue.
  useEffect(() => {
    if (!settings.premoves || phase !== 'playing' || result || turn !== userColor || !premoves.length) return
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
  }, [liveFen, premoves, phase, result, settings.premoves]) // eslint-disable-line react-hooks/exhaustive-deps

  // Optional eval bar.
  useEffect(() => {
    if (phase !== 'playing' || !assist.evalBar || !helperEngine.current) {
      setEvalScore(null)
      return
    }
    const c = new Chess(viewFen)
    const sign = c.turn() === 'w' ? 1 : -1
    if (c.isCheckmate()) {
      setEvalScore({ mate: 0, cp: c.turn() === 'w' ? -100000 : 100000 })
      return
    }
    helperEngine.current.search(viewFen, {
      depth: 14,
      options: { UCI_LimitStrength: false, 'Skill Level': 20 },
      onInfo: (ls) => {
        const l = ls[0]
        if (l) setEvalScore(l.mate != null ? { mate: l.mate * sign } : { cp: (l.cp ?? 0) * sign })
      },
    })
  }, [viewFen, phase, assist.evalBar])

  const start = () => {
    if (!bot) return
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
    setShowOptions(false)
    setSpeech(lines.greet())
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
    if (r?.bestmove) setHintArrow([{ from: r.bestmove.slice(0, 2), to: r.bestmove.slice(2, 4), color: 'rgba(159, 207, 63, 0.8)' }])
  }

  const takeback = () => {
    if (!sans.length || result) return
    gameId.current++
    botEngine.current?.stop()
    setThinking(false)
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
    finish({ winner: botColor, reason: 'by resignation', how: 'resign' })
  }

  const downloadPgn = () => {
    const c = new Chess()
    c.setHeader('White', userColor === 'w' ? 'You' : bot?.name ?? 'Bot')
    c.setHeader('Black', userColor === 'b' ? 'You' : bot?.name ?? 'Bot')
    for (const s of sans) c.move(s)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([c.pgn()], { type: 'application/x-chess-pgn' }))
    a.download = `rea-chess-vs-${bot?.name ?? 'bot'}.pgn`
    a.click()
  }

  const review = () => {
    if (!bot) return
    const c = new Chess()
    for (const san of sans) c.move(san)
    c.setHeader('White', userColor === 'w' ? 'You' : bot.name)
    c.setHeader('Black', userColor === 'b' ? 'You' : bot.name)
    c.setHeader('Result', !result ? '*' : result.winner == null ? '1/2-1/2' : result.winner === 'w' ? '1-0' : '0-1')
    c.setHeader('Date', new Date().toISOString().slice(0, 10).replaceAll('-', '.'))
    const user = { username: 'You' }
    const opponent = { username: bot.name, rating: bot.rating, avatar: bot.image }
    openReview({ pgn: c.pgn(), white: userColor === 'w' ? user : opponent, black: userColor === 'b' ? user : opponent, me: 'You' })
  }

  if (!bot) return <div className="page muted">Loading bots…</div>

  const orientation: 'white' | 'black' = (userColor === 'w') !== orientationFlip ? 'white' : 'black'
  const playing = phase === 'playing'
  const mat = material(playing ? viewFen : START)
  const topColor = orientation === 'white' ? 'b' : 'w'
  const botOnTop = !playing ? true : topColor === botColor

  const botBar = (
    <PlayerBar
      name={bot.name}
      rating={bot.rating}
      country={bot.country}
      image={bot.image}
      thinking={playing && thinking}
      captured={playing ? mat.capturedBy[botColor] : []}
      capturedColor={userColor}
      diff={playing ? (botColor === 'w' ? mat.diff : -mat.diff) : 0}
    />
  )
  const youBar = (
    <PlayerBar
      name="You"
      captured={playing ? mat.capturedBy[userColor] : []}
      capturedColor={botColor}
      diff={playing ? (userColor === 'w' ? mat.diff : -mat.diff) : 0}
    />
  )

  // Result badges on the kings, like chess.com.
  const results: ResultBadge[] = []
  if (result && atLive) {
    if (result.winner) {
      const loser = result.winner === 'w' ? 'b' : 'w'
      results.push({ square: kingSquare(liveFen, result.winner), type: 'winner' })
      results.push({ square: kingSquare(liveFen, loser), type: result.how === 'resign' ? 'resign' : 'checkmated' })
    } else {
      results.push({ square: kingSquare(liveFen, 'w'), type: 'draw' }, { square: kingSquare(liveFen, 'b'), type: 'draw' })
    }
  }

  const record = records[bot.id]

  return (
    <div className="cc-layout">
      <div className={`cc-board-area with-players ${playing && assist.evalBar ? 'with-eval' : ''}`}>
        {botOnTop ? botBar : youBar}
        <div className="cc-board-row">
          {playing && assist.evalBar && <EvalBar score={evalScore} flip={orientation === 'black'} />}
          <div className="cc-board-wrap">
            <Board
              fen={playing ? viewFen : START}
              orientation={playing ? orientation : colorChoice === 'b' ? 'black' : 'white'}
              movable={playing && atLive && !result ? userColor : 'none'}
              onMove={onUserMove}
              lastMove={playing && ply > 0 ? moves[ply - 1] : null}
              arrows={playing && atLive ? hintArrow : []}
              results={results}
              premoves={settings.premoves && playing && atLive ? premoves : []}
              premoveColor={settings.premoves && playing && atLive && !result ? userColor : undefined}
              onPremove={(from, to) => setPremoves((p) => [...p, [from, to]])}
              onClearPremoves={() => setPremoves([])}
            />
            {showResult && result && (
              <div className="board-modal-backdrop" onClick={() => setShowResult(false)}>
                <div className="board-modal" onClick={(e) => e.stopPropagation()}>
                  <button className="board-modal-close" onClick={() => setShowResult(false)} aria-label="Close">
                    ×
                  </button>
                  <div className="board-modal-header">
                    <div className="board-modal-title">{result.winner == null ? 'Draw' : result.winner === userColor ? 'You Won!' : `${bot.name} Won`}</div>
                    <div className="board-modal-subtitle">{result.reason}</div>
                  </div>
                  <div className="board-modal-body">
                    <div className="board-modal-players">
                      <div className={`board-modal-player ${result.winner === userColor ? 'won' : ''}`}>
                        <div className="avatar-you">
                          <img src={pieceUrl(userColor + 'p', 'neo', 150)} alt="" />
                        </div>
                        <span>You</span>
                      </div>
                      <span className="board-modal-vs">vs</span>
                      <div className={`board-modal-player ${result.winner === botColor ? 'won' : ''}`}>
                        <img src={bot.image} alt="" />
                        <span>{bot.name}</span>
                      </div>
                    </div>
                    <button className="cc-button cc-primary board-modal-main" onClick={review}>
                      Game Review
                    </button>
                    <div className="cc-buttons">
                      <CCButton label="New Bot" onClick={() => setPhase('select')} grow />
                      <CCButton label="Rematch" onClick={start} grow />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {botOnTop ? youBar : botBar}
      </div>
      <BoardControls onFlip={playing ? () => setOrientationFlip((f) => !f) : undefined} />

      <section className="cc-sidebar">
        <header className="cc-sidebar-header secondary">
          <img src={`${ICONS}/bots.svg`} width={24} height={24} alt="" />
          <h1 className="cc-sidebar-header-title small">Play Bots</h1>
        </header>

        {!playing ? (
          <>
            <div className="cc-sidebar-body bots-select">
              <div className="bot-speech">
                <img className="bot-speech-avatar" src={bot.image} alt="" />
                <div className="bot-speech-bubble">
                  <svg className="coach-bubble-tip" width="15" height="22" viewBox="0 0 15 22" aria-hidden="true">
                    <path d="M0 14C8.4 14 12.8333 4.66667 15 0V22C15 22 3.5 22 0 14Z" />
                  </svg>
                  {speech}
                </div>
              </div>
              <div className="bot-selected-name">
                {bot.name} <span className="bot-selected-rating">{bot.rating}</span> <span className="bot-flag">{flag(bot.country)}</span>
                {record?.w ? (
                  <span className="bot-beaten" title={`Record ${record.w}W ${record.l}L ${record.d}D`}>
                    ✓
                  </span>
                ) : null}
              </div>
              <div className="bot-groups" onScroll={() => hideTip(true)}>
                {groups.map((g) =>
                  g.name === openGroup ? (
                    <div key={g.name} className="bot-group open">
                      <button className="bot-group-head" onClick={() => setOpenGroup('')}>
                        <span className="bot-group-name">{g.name}</span>
                        <span className="bot-group-count">{g.bots.length} bots</span>
                      </button>
                      <div className="bot-tiles">
                        {g.bots.map((b) => (
                          <button key={b.id} className={`bot-tile ${b.id === bot.id ? 'selected' : ''}`} onClick={() => setBotId(b.id)}
                            onMouseEnter={(e) => {
                              const r = e.currentTarget.getBoundingClientRect()
                              showTip(b, r.left + r.width / 2, r.top)
                            }}
                            onMouseLeave={() => hideTip()}
                          >
                            <img src={b.image} alt={b.name} loading="lazy" />
                            {records[b.id]?.w ? <span className="bot-tile-check">✓</span> : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button key={g.name} className="bot-group closed" onClick={() => setOpenGroup(g.name)}>
                      <img className="bot-group-avatar" src={g.avatar} alt="" loading="lazy" />
                      <span className="bot-group-name">{g.name}</span>
                      <span className="bot-group-count">{g.bots.length} bots</span>
                    </button>
                  ),
                )}
              </div>
            </div>
            {tip && (
              <div className={`bot-tooltip ${tip.visible ? 'visible' : ''}`} style={{ left: tip.x, top: tip.y }}>
                {tip.bot.name} <span className="bot-tooltip-rating">({tip.bot.rating})</span> {flag(tip.bot.country)}
              </div>
            )}
            <div className="cc-sidebar-footer bots-footer">
              {showOptions && (
                <div className="bots-options-panel">
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
              )}
              <div className="bots-options-row">
                <button className={`bots-options-btn ${showOptions ? 'open' : ''}`} onClick={() => setShowOptions((s) => !s)}>
                  <Glyph name="cog" size={20} />
                  <span>Options</span>
                  <span className="chevron">▾</span>
                </button>
                <div className="bots-colors">
                  {(['w', 'random', 'b'] as ColorChoice[]).map((c) => (
                    <button key={c} className={`bots-color ${colorChoice === c ? 'selected' : ''}`} onClick={() => setColorChoice(c)} title={c === 'w' ? 'White' : c === 'b' ? 'Black' : 'Random'}>
                      {c === 'random' ? <span className="bots-color-random">?</span> : <img src={pieceUrl(c + 'k', 'neo', 150)} alt="" />}
                    </button>
                  ))}
                </div>
              </div>
              <button className="cc-button cc-primary bots-play" onClick={start}>
                Play
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cc-sidebar-body bots-game">
              <div className="bot-speech">
                <img className="bot-speech-avatar" src={bot.image} alt="" />
                {speech && (
                  <div className="bot-speech-bubble" key={speech}>
                    <svg className="coach-bubble-tip" width="15" height="22" viewBox="0 0 15 22" aria-hidden="true">
                      <path d="M0 14C8.4 14 12.8333 4.66667 15 0V22C15 22 3.5 22 0 14Z" />
                    </svg>
                    {speech}
                  </div>
                )}
              </div>
              <div className="cc-move-list">
                <div className="cc-move-list-head">
                  <span>{result ? `${result.winner == null ? '½-½' : result.winner === 'w' ? '1-0' : '0-1'} ${result.reason}` : `vs ${bot.name} (${bot.rating})`}</span>
                </div>
                <MoveRows sans={sans} ply={ply} onSelect={setPly} result={result} />
              </div>
            </div>
            <div className="cc-sidebar-footer bots-game-footer">
              {!result ? (
                <div className="cc-buttons">
                  <CCButton icon="resign" title="Resign" onClick={() => settings.confirmResignDraw ? setConfirmResign(true) : resign()} grow />
                  {assist.takebacks && <CCButton icon="undo" title="Takeback" onClick={takeback} grow disabled={!sans.length} />}
                  {assist.hints && <CCButton icon="bulb" title="Hint" onClick={hint} grow disabled={turn !== userColor} />}
                </div>
              ) : (
                <div className="bots-after">
                  <button className="cc-button cc-primary" onClick={review}>
                    Game Review
                  </button>
                  <div className="cc-buttons">
                    <CCButton label="New Bot" onClick={() => setPhase('select')} grow />
                    <CCButton label="Rematch" onClick={start} grow />
                  </div>
                </div>
              )}
              <div className="bots-tray">
                <button title="Download PGN" onClick={downloadPgn}>
                  <Glyph name="download" size={20} />
                </button>
                <button title="Settings" onClick={() => window.dispatchEvent(new Event('open-settings'))}>
                  <Glyph name="cog" size={20} />
                </button>
                <span className="grow" />
                <button title="Previous move (←)" onClick={() => setPly(Math.max(0, ply - 1))} disabled={ply === 0}>
                  <Glyph name="chevronLeft" size={20} />
                </button>
                <button title="Next move (→)" onClick={() => setPly(Math.min(sans.length, ply + 1))} disabled={atLive}>
                  <Glyph name="chevronRight" size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      {confirmResign && <ConfirmDialog title="Resign this game?" description="Your opponent will win by resignation." confirmLabel="Resign" onCancel={() => setConfirmResign(false)} onConfirm={() => { setConfirmResign(false); resign() }} />}
    </div>
  )
}

function MoveRows({ sans, ply, onSelect, result }: { sans: string[]; ply: number; onSelect: (p: number) => void; result: GameResult | null }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelector('.selected')?.scrollIntoView({ block: 'nearest' })
  }, [ply, sans.length])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onSelect(Math.max(0, ply - 1))
      else if (e.key === 'ArrowRight') onSelect(Math.min(sans.length, ply + 1))
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ply, sans.length, onSelect])
  const rows = []
  for (let i = 0; i < sans.length; i += 2) {
    rows.push(
      <div className="cc-move-row" key={i}>
        <span className="cc-move-num">{i / 2 + 1}.</span>
        <button className={`cc-move ${ply === i + 1 ? 'selected' : ''}`} onClick={() => onSelect(i + 1)}>
          <SanText san={sans[i]} color="w" />
        </button>
        {sans[i + 1] && (
          <button className={`cc-move ${ply === i + 2 ? 'selected' : ''}`} onClick={() => onSelect(i + 2)}>
            <SanText san={sans[i + 1]} color="b" />
          </button>
        )}
      </div>,
    )
  }
  return (
    <div className="cc-move-rows" ref={ref}>
      {rows}
      {result && <div className="cc-move-result">{result.winner == null ? '½-½' : result.winner === 'w' ? '1-0' : '0-1'}</div>}
    </div>
  )
}

function PlayerBar({
  name,
  rating,
  country,
  image,
  thinking,
  captured = [],
  capturedColor = 'b',
  diff = 0,
}: {
  name: string
  rating?: number
  country?: string
  image?: string
  thinking?: boolean
  captured?: string[]
  capturedColor?: 'w' | 'b'
  diff?: number
}) {
  return (
    <div className="cc-player">
      {image ? (
        <img className="cc-player-avatar" src={image} alt="" />
      ) : (
        <div className="cc-player-avatar you">
          <img src={pieceUrl('wp', 'neo', 150)} alt="" />
        </div>
      )}
      <div className="cc-player-info">
        <div className="cc-player-top">
          <span className="cc-player-name">{name}</span>
          {rating != null && <span className="cc-player-rating">({rating})</span>}
          {country && <span className="cc-player-flag">{flag(country)}</span>}
          {thinking && (
            <span className="thinking">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        <div className="cc-player-captured">
          {captured.map((t, i) => (
            <img key={i} src={pieceUrl(capturedColor + t, undefined, 50)} alt="" />
          ))}
          {diff > 0 && <span>+{diff}</span>}
        </div>
      </div>
    </div>
  )
}
