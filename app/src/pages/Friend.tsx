import ConfirmDialog from '../components/ConfirmDialog'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Chess } from 'chess.js'
import Board, { type ResultBadge } from '../components/Board'
import { MoveList, NavButtons } from '../components/ui'
import { ICONS } from '../components/PuzzleSidebar'
import { BoardControls } from './puzzleUi'
import { fetchAvatar } from '../lib/ccGames'
import { buildPositions, material } from '../lib/game'
import { currentClocks, opposite, type Color } from '../lib/friendGame'
import { FriendSession, type FriendView } from '../lib/friendPeer'
import { play, playMove } from '../lib/sound'
import { useSettings, useStored } from '../lib/storage'
import { pieceUrl } from '../lib/theme'
import { openReview } from './Review'

const START = new Chess().fen()
const TIMES = [
  { label: '1 min', base: 60000, inc: 0 },
  { label: '3 | 2', base: 180000, inc: 2000 },
  { label: '5 min', base: 300000, inc: 0 },
  { label: '10 min', base: 600000, inc: 0 },
  { label: '30 min', base: 1800000, inc: 0 },
  { label: 'No timer', base: 0, inc: 0 },
]
function PlayerAvatar({ name, color }: { name: string; color: Color }) {
  const [avatar, setAvatar] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    if (name !== 'Guest' && name !== 'Friend') void fetchAvatar(name).then((src) => { if (active) setAvatar(src) }).catch(() => {})
    return () => { active = false }
  }, [name])
  const fallback = pieceUrl(color + 'p', 'neo', 150)
  return <img src={avatar || fallback} alt={`${name}'s avatar`} onError={(e) => { if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback }} />
}
function clockText(ms: number) {
  if (ms < 20000) return `${Math.floor(ms / 1000)}.${Math.floor(ms % 1000 / 100)}`
  const seconds = Math.ceil(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
function PlayerBar({ name, color, clock, active, captured, diff }: { name: string; color: Color; clock: number | null; active: boolean; captured: string[]; diff: number }) {
  return <div className="cc-player">
    <div className="cc-player-avatar you"><PlayerAvatar key={name} name={name} color={color} /></div>
    <div className="cc-player-info"><div className="cc-player-top"><span className="cc-player-name">{name}</span></div>
      <div className="cc-player-captured">{captured.map((piece, i) => <img key={i} src={pieceUrl(opposite(color) + piece, 'neo', 150)} alt="" />)}{diff > 0 && <span>+{diff}</span>}</div>
    </div>
    {clock != null && <div className={`review-clock ${color === 'w' ? 'white' : 'black'} ${active ? 'active' : ''} ${clock < 20000 ? 'low' : ''}`} aria-label={`${name}'s clock`}>{clockText(clock)}</div>}
  </div>
}
function Chat({ session, view }: { session: FriendSession; view: FriendView }) {
  const [text, setText] = useState('')
  const log = useRef<HTMLDivElement>(null)
  useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight }, [view.chat])
  return <div className="friend-chat">
    <div className="friend-chat-log" role="log" aria-label="Game chat" ref={log}>
      {view.chat.length ? view.chat.map((line, i) => <div key={i}><strong>{line.own ? 'You' : line.name}:</strong> {line.text}</div>) : <span className="muted small">Say hello to your friend.</span>}
    </div>
    <form className="friend-input-row" onSubmit={(e) => { e.preventDefault(); session.chat(text); setText('') }}>
      <input aria-label="Chat message" placeholder="Send a message…" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} disabled={!view.connected} />
      <button className="cc-button" disabled={!view.connected || !text.trim()}>Send</button>
    </form>
  </div>
}
function FriendGameView({ session, view }: { session: FriendSession; view: FriendView }) {
  const [settings] = useSettings()
  const [confirmAction, setConfirmAction] = useState<'resign' | 'draw-offer' | 'draw-accept' | null>(null)
  const action = (kind: 'resign' | 'draw-offer' | 'draw-accept') => {
    if (settings.confirmResignDraw) setConfirmAction(kind)
    else session.action(kind)
  }
  const game = view.game!
  const [selectedPly, setSelectedPly] = useState<number | null>(null)
  const [premoves, setPremoves] = useState<[string, string][]>([])
  const [flipped, setFlipped] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const previous = useRef(game)
  useEffect(() => {
    if (game.sans.length > previous.current.sans.length) playMove(game.sans.at(-1)!, (game.sans.length % 2 === 1 ? 'w' : 'b') !== session.color())
    if (game.result && !previous.current.result) play('game-end')
    previous.current = game
  }, [game, session])
  const { fens, moves } = useMemo(() => buildPositions(START, game.sans), [game.sans])
  const ply = selectedPly == null ? game.sans.length : Math.min(selectedPly, game.sans.length)
  const atLive = ply === game.sans.length
  const liveFen = fens.at(-1)!
  const fen = fens[ply]
  const myColor = session.color()
  const turn = game.sans.length % 2 === 0 ? 'w' : 'b'
  const orientation = (myColor === 'w') !== flipped ? 'white' : 'black'
  const topColor = orientation === 'white' ? 'b' : 'w'
  const clocks = currentClocks(game, view.settings, view.now)
  const mat = material(fen)
  const name = (color: Color) => color === myColor ? view.name : view.opponentName
  const result = game.result
  useEffect(() => {
    if (!settings.premoves || !atLive || result || !view.connected || turn !== myColor || !premoves.length) return
    const t = window.setTimeout(() => {
      const [[from, to], ...rest] = premoves
      setPremoves(session.move(from, to, 'q') ? rest : [])
    }, 200)
    return () => clearTimeout(t)
  }, [liveFen, premoves, atLive, result, view.connected, turn, myColor, session, settings.premoves])
  const review = () => {
    const chess = new Chess()
    for (const san of game.sans) chess.move(san)
    chess.setHeader('White', name('w'))
    chess.setHeader('Black', name('b'))
    chess.setHeader('Result', result?.winner === 'w' ? '1-0' : result?.winner === 'b' ? '0-1' : result?.reason === 'aborted' ? '*' : '1/2-1/2')
    chess.setHeader('Date', new Date().toISOString().slice(0, 10).replaceAll('-', '.'))
    chess.setHeader('TimeControl', view.settings.base ? `${view.settings.base / 1000}+${view.settings.inc / 1000}` : '-')
    openReview({ pgn: chess.pgn(), white: { username: name('w') }, black: { username: name('b') }, me: view.name })
  }
  const rematch = () => session.action(view.rematch === 'incoming' ? 'rematch-accept' : 'rematch-offer')
  const rematchButton = <button className="cc-button" disabled={!view.connected || view.rematch === 'outgoing'} onClick={rematch}>{view.rematch === 'incoming' ? 'Accept Rematch' : view.rematch === 'outgoing' ? 'Rematch offered…' : 'Rematch'}</button>
  const results: ResultBadge[] = []
  if (result && atLive && result.reason !== 'aborted') {
    const chess = new Chess(liveFen)
    for (const row of chess.board()) for (const piece of row) if (piece?.type === 'k') results.push({ square: piece.square, type: !result.winner ? 'draw' : piece.color === result.winner ? 'winner' : result.reason === 'timeout' ? 'timeout' : result.reason === 'resignation' ? 'resign' : 'checkmated' })
  }
  const bar = (color: Color) => <PlayerBar name={name(color)} color={color} clock={view.settings.base ? clocks[color] : null} active={!result && turn === color} captured={mat.capturedBy[color]} diff={color === 'w' ? mat.diff : -mat.diff} />
  return <div className="cc-layout friend-layout">
    <div className="cc-board-area with-players">
      {bar(topColor)}
      <div className="cc-board-row"><div className="cc-board-wrap">
        <Board fen={fen} orientation={orientation} movable={atLive && !result && view.connected ? myColor : 'none'} onMove={(from, to, promotion) => session.move(from, to, promotion)} lastMove={ply ? moves[ply - 1] : null} results={results}
          premoves={settings.premoves && atLive && !result ? premoves : []} premoveColor={settings.premoves && atLive && !result && view.connected ? myColor : undefined} onPremove={(from, to) => setPremoves((p) => [...p, [from, to]])} onClearPremoves={() => setPremoves([])} />
        {result && showResult && <div className="board-modal-backdrop" onClick={() => setShowResult(false)}>
          <div className="board-modal" role="dialog" aria-modal="true" aria-label="Game result" onClick={(e) => e.stopPropagation()}>
            <button className="board-modal-close" aria-label="Close" onClick={() => setShowResult(false)}>×</button>
            <div className="board-modal-header"><div className="board-modal-title">{result.reason === 'aborted' ? 'Game Aborted' : result.winner == null ? 'Draw' : result.winner === myColor ? 'You Won!' : `${view.opponentName} Won`}</div><div className="board-modal-subtitle">{result.reason === 'aborted' ? 'Before both players moved' : `by ${result.reason}`}</div></div>
            <div className="board-modal-body">
              <div className="board-modal-players">{([myColor, opposite(myColor)] as Color[]).map((color) => <div className={`board-modal-player ${result.winner === color ? 'won' : ''}`} key={color}><PlayerAvatar name={name(color)} color={color} /><span>{name(color)}</span></div>)}</div>
              <button className="cc-button cc-primary board-modal-main" onClick={review}>Game Review</button>
              {rematchButton}<button className="cc-button" onClick={session.newInvite}>New Invite</button>
            </div>
          </div>
        </div>}
      </div></div>
      {bar(opposite(topColor))}
    </div>
    <BoardControls onFlip={() => setFlipped((v) => !v)} />
    <section className="cc-sidebar">
      <Header />
      {!view.connected && <div className="friend-banner" role="status">Opponent disconnected — waiting…</div>}
      {view.error && <div className="friend-banner">{view.error} <button className="cc-button" onClick={session.retry}>Retry</button></div>}
      <div className="cc-sidebar-body friend-game-body"><MoveList sans={game.sans} ply={ply} onSelect={setSelectedPly} /><NavButtons ply={ply} max={game.sans.length} onSelect={(n) => setSelectedPly(n === game.sans.length ? null : n)} />
        {selectedPly != null && <button className="cc-button" onClick={() => { setSelectedPly(null); setPremoves([]) }}>Back to live game</button>}
      </div>
      <div className="cc-sidebar-footer bots-game-footer">
        {result ? <div className="bots-after"><strong>{result.reason === 'aborted' ? 'Game aborted' : `Game over: ${result.reason}`}</strong>{rematchButton}<button className="cc-button cc-primary" onClick={review}>Game Review</button><button className="cc-button" onClick={session.newInvite}>New Invite</button></div> : <>
          {view.draw === 'incoming' ? <div className="friend-draw"><span>Your friend offers a draw.</span><div className="cc-buttons"><button className="cc-button cc-primary" disabled={!view.connected} onClick={() => action('draw-accept')}>Accept</button><button className="cc-button" disabled={!view.connected} onClick={() => session.action('draw-decline')}>Decline</button></div></div> : <div className="friend-actions"><button className="cc-button" disabled={!view.connected || view.draw === 'outgoing'} onClick={() => action('draw-offer')}>½ {view.draw === 'outgoing' ? 'Draw offered…' : 'Offer Draw'}</button><button className="cc-button" disabled={!view.connected} onClick={() => action('resign')}>⚑ Resign</button>{game.sans.length < 2 && <button className="cc-button" disabled={!view.connected} onClick={() => session.action('abort')}>Abort</button>}</div>}
        </>}
        <Chat session={session} view={view} />
      </div>
    </section>
    {confirmAction && <ConfirmDialog title={confirmAction === 'resign' ? 'Resign this game?' : confirmAction === 'draw-offer' ? 'Offer a draw?' : 'Accept this draw?'} description={confirmAction === 'resign' ? 'Your opponent will win by resignation.' : confirmAction === 'draw-offer' ? 'Send a draw offer to your opponent.' : 'This game will end in a draw.'} onCancel={() => setConfirmAction(null)} onConfirm={() => { session.action(confirmAction); setConfirmAction(null) }} />}
  </div>
}
function Header() {
  return <header className="cc-sidebar-header secondary"><img src={`${ICONS}/friends.svg`} width={24} height={24} alt="" /><h1 className="cc-sidebar-header-title small">Play a Friend</h1></header>
}
export default function Friend() {
  const [session] = useState(() => new FriendSession())
  const view = useSyncExternalStore(session.subscribe, session.getSnapshot)
  const [time, setTime] = useStored('friendTime', 3)
  const [choice, setChoice] = useStored<'w' | 'random' | 'b'>('friendColor', 'random')
  const [copyStatus, setCopyStatus] = useState('')
  const lastRound = useRef<number | null>(null)
  useEffect(() => { session.start(); return session.stop }, [session])
  useEffect(() => {
    if (view.game && lastRound.current !== view.game.round) { play('game-start'); lastRound.current = view.game.round }
  }, [view.game])
  if (view.game) return <FriendGameView key={view.game.round} session={session} view={view} />
  const waiting = view.phase !== 'lobby'
  const invite = `${location.origin}${location.pathname}#/friend?join=${view.peerId}`
  return <div className="cc-layout friend-layout">
    <div className="cc-board-area with-players"><PlayerBar name="Friend" color={choice === 'b' ? 'w' : 'b'} clock={null} active={false} captured={[]} diff={0} /><div className="cc-board-wrap"><Board fen={START} orientation={choice === 'b' ? 'black' : 'white'} movable="none" /></div><PlayerBar name={view.name} color={choice === 'b' ? 'b' : 'w'} clock={null} active={false} captured={[]} diff={0} /></div>
    <BoardControls />
    <section className="cc-sidebar"><Header /><div className="cc-sidebar-body friend-lobby">
      {waiting ? <>
        {view.role === 'host' && view.phase === 'waiting' && <><label htmlFor="friend-invite">Invite link</label><div className="friend-input-row"><input id="friend-invite" readOnly value={invite} onFocus={(e) => e.target.select()} /><button className="cc-button" onClick={async () => { try { await navigator.clipboard.writeText(invite); setCopyStatus('Copied!') } catch { setCopyStatus('Select the link and copy it manually.') } }}>Copy</button></div>{copyStatus && <span className="small" role="status">{copyStatus}</span>}</>}
        <div className="friend-waiting" role="status"><span className="friend-spinner" />{view.role === 'guest' ? 'Connecting to your friend…' : view.phase === 'waiting' ? 'Waiting for your friend…' : 'Creating invite…'}</div>
        {view.error && <div className="friend-banner" role="alert">{view.error}<button className="cc-button" onClick={session.retry}>Retry</button></div>}
        <button className="cc-button" onClick={() => { setCopyStatus(''); session.newInvite() }}>New Invite</button>
      </> : <>
        <p>Challenge a friend to a live game. Choose your settings, then share your invite link.</p>
        <h2 className="small">Time control</h2><div className="friend-times">{TIMES.map((tc, i) => <button key={tc.label} className={`cc-button ${time === i ? 'selected' : ''}`} aria-pressed={time === i} onClick={() => setTime(i)}>{tc.label}</button>)}</div>
        <h2 className="small">Play as</h2><div className="bots-colors">{(['w', 'random', 'b'] as const).map((color) => <button className={`bots-color ${choice === color ? 'selected' : ''}`} key={color} aria-pressed={choice === color} title={color === 'w' ? 'White' : color === 'b' ? 'Black' : 'Random'} onClick={() => setChoice(color)}>{color === 'random' ? <span className="bots-color-random">◐</span> : <img src={pieceUrl(color + 'k', 'neo', 150)} alt={color === 'w' ? 'White' : 'Black'} />}</button>)}</div>
        <button className="cc-button cc-primary bots-play" onClick={() => { setCopyStatus(''); session.create({ ...(TIMES[time] ?? TIMES[3]), hostColor: choice === 'random' ? Math.random() < 0.5 ? 'w' : 'b' : choice }) }}>Create Invite Link</button>
      </>}
    </div></section>
  </div>
}
