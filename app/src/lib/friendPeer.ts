import Peer, { type DataConnection } from 'peerjs'
import { load } from './storage'
import { applyFriendMove, currentClocks, makeFriendMove, newFriendGame, opposite, position, reconcileGame, validGame, validSettings, type Color, type FriendGame, type FriendSettings, type Msg } from './friendGame'

const KEY = 'rea-chess:friend'
const peerId = () => 'rea-chess-' + Array.from(crypto.getRandomValues(new Uint8Array(8)), (n) => (n % 36).toString(36)).join('')
const validId = (id: string) => /^rea-chess-[a-z0-9]{8}$/.test(id)
const joinId = () => new URLSearchParams(location.hash.split('?')[1] ?? '').get('join') ?? ''
interface Saved {
  peerId: string
  role: 'host' | 'guest'
  hostId: string
  opponentId: string
  name: string
  opponentName: string
  settings: FriendSettings
  game: FriendGame | null
}
interface ChatLine { name: string; text: string; own: boolean }
export interface FriendView extends Saved {
  phase: 'lobby' | 'connecting' | 'waiting' | 'playing'
  connected: boolean
  error: string
  draw: 'incoming' | 'outgoing' | null
  rematch: 'incoming' | 'outgoing' | null
  chat: ChatLine[]
  now: number
}

/** Owns one Peer and one opponent; React only subscribes to immutable UI snapshots. */
export class FriendSession {
  private view: FriendView
  private listeners = new Set<() => void>()
  private peer: Peer | null = null
  private conn: DataConnection | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private lastPong = 0
  private lastPing = 0
  private lastConnect = 0
  private mounted = false
  private join = joinId()

  constructor() {
    const name = load('ccUsername', '').trim() || 'Guest'
    this.view = { peerId: '', role: 'host', hostId: '', opponentId: '', name, opponentName: 'Friend', settings: { hostColor: 'w', base: 600000, inc: 0 }, game: null, phase: 'lobby', connected: false, error: '', draw: null, rematch: null, chat: [], now: Date.now() }
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Saved | null
      if (saved && validId(saved.peerId) && validSettings(saved.settings) && (!saved.game || validGame(saved.game)) && (saved.role === 'host' || saved.role === 'guest') && typeof saved.name === 'string' && typeof saved.opponentName === 'string' && (!this.join || (saved.role === 'guest' && saved.hostId === this.join))) {
        this.view = { ...this.view, ...saved, phase: saved.game ? 'playing' : saved.role === 'host' ? 'waiting' : 'connecting' }
      } else if (this.join) this.prepareGuest()
    } catch { if (this.join) this.prepareGuest() }
  }
  getSnapshot = () => this.view
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private update(patch: Partial<FriendView>, persist = true) {
    this.view = { ...this.view, ...patch }
    if (persist && this.view.peerId) {
      const { peerId, role, hostId, opponentId, name, opponentName, settings, game } = this.view
      try { sessionStorage.setItem(KEY, JSON.stringify({ peerId, role, hostId, opponentId, name, opponentName, settings, game })) } catch { /* storage unavailable */ }
    }
    this.listeners.forEach((listener) => listener())
  }
  private prepareGuest() {
    this.view = { ...this.view, role: 'guest', peerId: peerId(), hostId: this.join, opponentId: this.join, phase: 'connecting', error: validId(this.join) ? '' : 'This invite link is invalid.' }
  }
  start = () => {
    this.mounted = true
    this.update({ connected: false }, false)
    if (this.view.peerId && !this.view.error) this.openPeer()
    this.timer = setInterval(() => this.tick(), 100)
    window.addEventListener('hashchange', this.onHash)
  }
  stop = () => {
    this.mounted = false
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    window.removeEventListener('hashchange', this.onHash)
    this.closePeer()
  }
  private closePeer() {
    const peer = this.peer
    this.peer = null
    this.conn?.close()
    this.conn = null
    peer?.destroy()
  }
  private onHash = () => {
    if (location.hash.split('?')[0] !== '#/friend') return
    const next = joinId()
    if (next === this.join) return
    this.resetSession()
    this.join = next
    if (next) {
      this.prepareGuest()
      this.update({})
      if (validId(next)) this.openPeer()
    }
  }
  create = (settings: FriendSettings) => {
    this.closePeer()
    const id = peerId()
    this.update({ peerId: id, hostId: id, role: 'host', opponentId: '', settings, game: null, phase: 'connecting', error: '', connected: false, chat: [], draw: null, rematch: null })
    this.openPeer()
  }
  private resetSession() {
    this.closePeer()
    sessionStorage.removeItem(KEY)
    this.join = ''
    this.update({ peerId: '', hostId: '', opponentId: '', role: 'host', game: null, phase: 'lobby', error: '', connected: false, draw: null, rematch: null, chat: [] }, false)
  }
  newInvite = () => {
    this.resetSession()
    history.replaceState(null, '', `${location.pathname}${location.search}#/friend`)
  }
  retry = () => {
    this.closePeer()
    this.update({ error: '', connected: false })
    this.openPeer()
  }
  private openPeer() {
    if (!this.mounted || this.peer || !this.view.peerId) return
    const peer = new Peer(this.view.peerId)
    this.peer = peer
    peer.on('open', () => {
      if (this.peer !== peer) return
      this.update({ error: '', phase: this.view.game ? 'playing' : this.view.role === 'host' ? 'waiting' : 'connecting' })
      if (this.view.role === 'guest') this.connectGuest()
    })
    peer.on('connection', (conn) => {
      if (this.peer !== peer || this.view.role !== 'host' || (this.view.opponentId && conn.peer !== this.view.opponentId) || this.conn?.open) { conn.close(); return }
      this.attach(conn)
    })
    peer.on('disconnected', () => {
      if (this.peer !== peer) return
      // Signaling can reconnect without interrupting an already open data channel.
      try { peer.reconnect() } catch { this.update({ error: 'Signaling disconnected. Retrying…' }) }
    })
    peer.on('error', (error) => {
      if (this.peer !== peer) return
      const unavailable = error.type === 'peer-unavailable'
      this.update({ error: unavailable ? 'Friend is unavailable. Retrying…' : `Could not connect (${error.type}). Retry the connection.` })
      if (unavailable) { this.conn?.close(); this.conn = null }
    })
  }
  private connectGuest() {
    if (!this.peer?.open || this.view.role !== 'guest' || this.conn?.open || (this.conn && Date.now() - this.lastConnect < 15000)) return
    this.conn?.close()
    this.lastConnect = Date.now()
    this.attach(this.peer.connect(this.view.hostId, { reliable: true, serialization: 'json' }))
  }
  private attach(conn: DataConnection) {
    this.conn?.close()
    this.conn = conn
    conn.on('open', () => {
      if (this.conn !== conn) return
      this.lastPong = Date.now()
      if (this.view.role === 'guest') this.send({ t: 'hello', name: this.view.name, state: this.snapshot() })
    })
    conn.on('data', (data) => { if (this.conn === conn) this.receive(data) })
    conn.on('close', () => { if (this.conn === conn) { this.conn = null; this.update({ connected: false }) } })
    conn.on('error', () => { if (this.conn === conn) { this.conn = null; conn.close(); this.update({ connected: false }) } })
  }
  private send(msg: Msg): boolean {
    if (!this.conn?.open) return false
    try { this.conn.send(msg); return true } catch { this.update({ connected: false }); return false }
  }
  private snapshot(): FriendGame | undefined {
    const { game, settings } = this.view
    return game ? { ...game, clocks: currentClocks(game, settings, Date.now()), turnStartedAt: Date.now() } : undefined
  }
  private receive(data: unknown) {
    if (!data || typeof data !== 'object' || !('t' in data)) return
    const msg = data as Msg
    const now = Date.now()
    if (msg.t === 'ping' && Number.isFinite(msg.at)) { this.send({ t: 'pong', at: msg.at }); return }
    if (msg.t === 'pong' && Number.isFinite(msg.at)) { this.lastPong = now; if (!this.view.connected && this.view.game) this.update({ connected: true, error: '' }); return }
    if (msg.t === 'hello' && this.view.role === 'host' && typeof msg.name === 'string') {
      let settings = this.view.settings
      let game = this.view.game ?? newFriendGame(settings, now)
      // A rematch acceptance may be the last packet before a refresh.
      if (validGame(msg.state) && game.result && msg.state.round === game.round + 1) {
        settings = { ...settings, hostColor: opposite(settings.hostColor) }
        game = { ...msg.state, turnStartedAt: now }
      }
      if (validGame(msg.state)) game = reconcileGame(game, { ...msg.state, turnStartedAt: now })
      this.lastPong = now
      this.update({ settings, game, opponentId: this.conn!.peer, opponentName: msg.name.slice(0, 50) || 'Guest', phase: 'playing', connected: true, error: '' })
      this.send({ t: 'start', ...this.view.settings, name: this.view.name, state: this.snapshot() })
      return
    }
    if (msg.t === 'start' && this.view.role === 'guest' && validSettings(msg) && typeof msg.name === 'string' && validGame(msg.state)) {
      this.lastPong = now
      this.update({ settings: { hostColor: msg.hostColor, base: msg.base, inc: msg.inc }, game: { ...msg.state, turnStartedAt: now }, opponentName: msg.name.slice(0, 50) || 'Guest', phase: 'playing', connected: true, error: '' })
      return
    }
    const { game, settings } = this.view
    if (!game || this.view.phase !== 'playing') return
    const myColor = this.color()
    const opponent = opposite(myColor)
    switch (msg.t) {
      case 'move': {
        if ((game.sans.length % 2 === 0 ? 'w' : 'b') !== opponent) return
        const next = applyFriendMove(game, msg, now)
        if (next !== game) this.update({ game: next, draw: null })
        break
      }
      case 'resign': if (!game.result) this.finish(opponent, 'resignation'); break
      case 'flag': if (!game.result && settings.base && (game.sans.length % 2 === 0 ? 'w' : 'b') === opponent) this.finish(opponent, 'timeout'); break
      case 'abort': if (!game.result && game.sans.length < 2) this.finish(null, 'aborted'); break
      case 'draw-offer': if (!game.result) this.update({ draw: 'incoming' }); break
      case 'draw-accept': if (!game.result && this.view.draw === 'outgoing') this.finish(null, 'agreement'); break
      case 'draw-decline': this.update({ draw: null }); break
      case 'rematch-offer': if (game.result) this.update({ rematch: 'incoming' }); break
      case 'rematch-accept': if (game.result && this.view.rematch === 'outgoing') this.rematch(); break
      case 'chat': if (typeof msg.text === 'string' && msg.text.trim()) this.addChat(msg.text, false); break
    }
  }
  color = (): Color => this.view.role === 'host' ? this.view.settings.hostColor : opposite(this.view.settings.hostColor)
  private tick() {
    const now = Date.now()
    const { game, settings } = this.view
    if (game && !game.result && settings.base && (game.sans.length % 2 === 0 ? 'w' : 'b') === this.color() && currentClocks(game, settings, now)[this.color()] <= 0) {
      this.send({ t: 'flag' })
      this.finish(this.color(), 'timeout')
    }
    if (this.conn?.open && now - this.lastPing >= 3000) {
      this.lastPing = now
      this.send({ t: 'ping', at: now })
    }
    if (this.view.connected && now - this.lastPong > 10000) {
      this.update({ connected: false })
      this.conn?.close()
      this.conn = null
    }
    if (this.view.role === 'guest' && !this.conn?.open && now - this.lastConnect >= 3000) this.connectGuest()
    if (this.peer?.disconnected && !this.peer.destroyed && now - this.lastPing >= 3000) {
      this.lastPing = now
      try { this.peer.reconnect() } catch { /* retry next heartbeat */ }
    }
    if (game && !game.result) this.update({ now }, false)
  }
  move = (from: string, to: string, promotion = 'q'): boolean => {
    const { game, settings, connected } = this.view
    if (!game || !connected) return false
    const next = makeFriendMove(game, settings, this.color(), from + to + (/^[18]$/.test(to[1]) && positionIsPawn(game, from) ? promotion : ''), Date.now())
    if (!next || !this.send(next.message)) return false
    this.update({ game: next.game, draw: null })
    return true
  }
  private finish(loser: Color | null, reason: NonNullable<FriendGame['result']>['reason']) {
    const { game, settings } = this.view
    if (!game || game.result) return
    this.update({ game: { ...game, clocks: currentClocks(game, settings, Date.now()), result: { winner: loser ? opposite(loser) : null, reason } }, draw: null })
  }
  action = (t: 'resign' | 'abort' | 'draw-offer' | 'draw-accept' | 'draw-decline' | 'rematch-offer' | 'rematch-accept') => {
    if (!this.view.connected || !this.send({ t })) return
    if (t === 'resign') this.finish(this.color(), 'resignation')
    if (t === 'abort' && this.view.game && this.view.game.sans.length < 2) this.finish(null, 'aborted')
    if (t === 'draw-offer') this.update({ draw: 'outgoing' })
    if (t === 'draw-accept' && this.view.draw === 'incoming') this.finish(null, 'agreement')
    if (t === 'draw-decline') this.update({ draw: null })
    if (t === 'rematch-offer') this.update({ rematch: 'outgoing' })
    if (t === 'rematch-accept' && this.view.rematch === 'incoming') this.rematch()
  }
  private rematch() {
    const settings = { ...this.view.settings, hostColor: opposite(this.view.settings.hostColor) }
    this.update({ settings, game: newFriendGame(settings, Date.now(), (this.view.game?.round ?? 0) + 1), draw: null, rematch: null })
  }
  private addChat(text: string, own: boolean) {
    this.update({ chat: [...this.view.chat, { name: own ? this.view.name : this.view.opponentName, text: text.trim().slice(0, 500), own }].slice(-50) }, false)
  }
  chat = (text: string) => {
    if (text.trim() && this.send({ t: 'chat', text: text.trim().slice(0, 500) })) this.addChat(text, true)
  }
}

function positionIsPawn(game: FriendGame, from: string) {
  return position(game.sans).board().flat().some((piece) => piece?.square === from && piece.type === 'p')
}
