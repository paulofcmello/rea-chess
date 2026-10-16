// A chessboard modelled on chess.com's board renderer (reverse-engineered with REA from their
// `chessboard` chunk and puzzles.css): pieces keep identity across positions so moves slide and
// captures fade, drag shows a hover-square outline, right-click marks squares / draws arrows with
// chess.com's arrow geometry (including L-shaped knight arrows), and effects render as square badges.
import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import { Chess, type Square } from 'chess.js'
import { useSettings } from '../lib/storage'
import { boards, boardUrl, pieceUrl } from '../lib/theme'

export interface Arrow {
  from: string
  to: string
  color?: string
  opacity?: number
}
export interface Highlight {
  square: string
  color: string
  opacity?: number
}
export type EffectType = 'correct' | 'incorrect'
/** Game-result badges chess.com puts on the kings (captured from /play/computer). */
export type ResultType = 'winner' | 'resign' | 'checkmated' | 'draw' | 'timeout'
export interface ResultBadge {
  square: string
  type: ResultType
}
export interface Effect {
  square: string
  type: EffectType
}

interface Props {
  fen: string
  orientation?: 'white' | 'black'
  movable?: 'w' | 'b' | 'both' | 'none'
  onMove?: (from: string, to: string, promotion?: string) => void
  lastMove?: [string, string] | null
  /** Overrides the board's highlight colour for the last move (e.g. green/red in puzzles). */
  lastMoveColor?: string
  highlights?: Highlight[]
  effects?: Effect[]
  results?: ResultBadge[]
  arrows?: Arrow[]
  /** Queued premoves (shown on the board in chess.com's premove red) and who may premove. */
  premoves?: [string, string][]
  premoveColor?: 'w' | 'b'
  onPremove?: (from: string, to: string) => void
  onClearPremoves?: () => void
}

const PREMOVE_COLOR = '#f42a32' // chess.com premoveHighlightColor, opacity .5

/** Applies queued premoves to the piece placement only (no legality), for display. */
function applyPremoves(fen: string, premoves: [string, string][]) {
  if (!premoves.length) return fen
  const map = new Map<string, string>()
  for (const row of new Chess(fen).board()) for (const p of row) if (p) map.set(p.square, p.color + p.type)
  for (const [from, to] of premoves) {
    const code = map.get(from)
    if (!code) continue
    map.delete(from)
    map.set(to, code[1] === 'p' && (to[1] === '8' || to[1] === '1') ? code[0] + 'q' : code)
    // Castling premove: bring the rook along.
    if (code[1] === 'k' && from[0] === 'e' && (to[0] === 'g' || to[0] === 'c')) {
      const rf = (to[0] === 'g' ? 'h' : 'a') + from[1]
      const rt = (to[0] === 'g' ? 'f' : 'd') + from[1]
      const rook = map.get(rf)
      if (rook) {
        map.delete(rf)
        map.set(rt, rook)
      }
    }
  }
  const rows: string[] = []
  for (let r = 8; r >= 1; r--) {
    let row = ''
    let empty = 0
    for (const f of FILES) {
      const code = map.get(f + r)
      if (!code) {
        empty++
        continue
      }
      if (empty) row += empty
      empty = 0
      row += code[0] === 'w' ? code[1].toUpperCase() : code[1]
    }
    rows.push(row + (empty || ''))
  }
  // Placement only; side/castling/ep are irrelevant for display. Disable castling/ep so chess.js accepts it.
  const [, side] = fen.split(' ')
  return `${rows.join('/')} ${side} - - 0 1`
}

/** Squares a piece could premove to: its movement pattern, ignoring blockers (like chess.com/chessground). */
function premoveDests(fen: string, sq: string) {
  const piece = (() => {
    for (const row of new Chess(fen).board()) for (const p of row) if (p && p.square === sq) return p
    return null
  })()
  const out = new Set<string>()
  if (!piece) return out
  const f = FILES.indexOf(sq[0])
  const r = Number(sq[1])
  const add = (df: number, dr: number) => {
    const nf = f + df
    const nr = r + dr
    if (nf >= 0 && nf < 8 && nr >= 1 && nr <= 8) out.add(FILES[nf] + nr)
  }
  const ray = (df: number, dr: number) => {
    for (let i = 1; i < 8; i++) add(df * i, dr * i)
  }
  switch (piece.type) {
    case 'p': {
      const d = piece.color === 'w' ? 1 : -1
      add(0, d)
      if (r === (piece.color === 'w' ? 2 : 7)) add(0, 2 * d)
      add(-1, d)
      add(1, d)
      break
    }
    case 'n':
      for (const [a, b] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) add(a, b)
      break
    case 'b':
      for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) ray(a, b)
      break
    case 'r':
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) ray(a, b)
      break
    case 'q':
      for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]) ray(a, b)
      break
    case 'k':
      for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]]) add(a, b)
      if (sq === (piece.color === 'w' ? 'e1' : 'e8')) {
        add(2, 0)
        add(-2, 0)
      }
      break
  }
  // Can't premove onto your own piece's current (displayed) square.
  for (const row of new Chess(fen).board()) for (const p of row) if (p && p.color === piece.color) out.delete(p.square)
  return out
}

const FILES = 'abcdefgh'
// chess.com defaults: HighlightedArrowColors / HighlightColors keyed by modifier.
const ARROW_COLORS = { none: 'rgba(255, 170, 0, 0.8)', shift: 'rgba(159, 207, 63, 0.8)', ctrl: 'rgba(248, 85, 63, 0.8)', alt: 'rgba(72, 193, 249, 0.8)' }
const MARK_COLORS = { none: '#eb6150', shift: '#acce59', ctrl: '#ffaa00', alt: '#52b0dc' }
const MARK_OPACITY = 0.8
const SPEEDS = { none: 0, slow: 500, default: 180, fast: 100 }

interface PieceItem {
  id: number
  square: string
  code: string // e.g. "wp"
}

let nextId = 1

/** Carries piece identities from the previous position to the new one (closest same-type piece). */
function diffPieces(prev: PieceItem[], fen: string) {
  const board = new Chess(fen).board()
  const now: { square: string; code: string }[] = []
  for (const row of board) for (const p of row) if (p) now.push({ square: p.square, code: p.color + p.type })
  const unused = new Map(prev.map((p) => [p.id, p]))
  const result: PieceItem[] = []
  const pending: { square: string; code: string }[] = []
  for (const n of now) {
    const same = prev.find((p) => p.square === n.square && p.code === n.code && unused.has(p.id))
    if (same) {
      unused.delete(same.id)
      result.push(same)
    } else pending.push(n)
  }
  const dist = (a: string, b: string) => Math.hypot(FILES.indexOf(a[0]) - FILES.indexOf(b[0]), Number(a[1]) - Number(b[1]))
  for (const n of pending) {
    let best: PieceItem | null = null
    for (const p of unused.values()) if (p.code === n.code && (!best || dist(p.square, n.square) < dist(best.square, n.square))) best = p
    if (best) {
      unused.delete(best.id)
      result.push({ ...best, square: n.square })
    } else result.push({ id: nextId++, ...n })
  }
  return { pieces: result, removed: [...unused.values()] }
}

function modifier(e: { shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }): keyof typeof ARROW_COLORS {
  if (e.altKey) return 'alt'
  if (e.ctrlKey || e.metaKey) return 'ctrl'
  if (e.shiftKey) return 'shift'
  return 'none'
}

/** chess.com arrow polygon (viewBox 0..100, squares 12.5). Straight arrows point along +y then rotate. */
const A = { half: 1.375, head: 4.5, headHalf: 3.25, tail: 4.5 }
function straightArrowPoints(len: number) {
  const shaft = len - A.head - A.tail
  const l = A.tail
  const u = l + shaft
  const f = u + A.head
  return [[-A.half, l], [-A.half, u], [-A.headHalf, u], [0, f], [A.headHalf, u], [A.half, u], [A.half, l]]
}
/** Knight arrow: two squares along the long leg, then one along the short leg (local frame). */
function knightArrowPoints() {
  const sq = 12.5
  const u = A.tail
  const d = sq * 2
  const f = d + A.half
  const m = A.half + A.head + (sq - A.half - A.head)
  const h = m - A.head
  return [[-A.half, u], [-A.half, f], [h, f], [h, d + A.headHalf], [m, d], [h, d - A.headHalf], [h, d - A.half], [A.half, d - A.half], [A.half, u]]
}

const EFFECT_SVG: Record<EffectType, string> = {
  correct:
    '<svg viewBox="0 0 18 19" width="100%" height="100%"><path opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"/><path fill="#81b64c" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"/><path opacity="0.2" d="M15.11,6.81,9.45,12.47,7.79,14.13a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.78a.39.39,0,0,1-.11-.28.39.39,0,0,1,.11-.27L4.28,7.85a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09l2.69,2.68,5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.81Z"/><path fill="#fff" d="M15.11,6.31,9.45,12,7.79,13.63a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.28A.39.39,0,0,1,2.78,9a.39.39,0,0,1,.11-.27L4.28,7.35a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09L7.52,10l5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.31Z"/></svg>',
  incorrect:
    '<svg viewBox="0 0 18 19" width="100%" height="100%"><path opacity="0.3" d="M9,.5C4.03,.5,0,4.53,0,9.5s4.03,9,9,9,9-4.03,9-9S13.97,.5,9,.5Z"/><path fill="#FF7769" d="M9,0C4.03,0,0,4.03,0,9s4.03,9,9,9,9-4.03,9-9S13.97,0,9,0Z"/><path opacity="0.2" d="M13.99,12.51s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-1.37,1.37s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-3.06-3.06-3.06,3.06s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-1.37-1.37c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l3.06-3.06-3.06-3.06c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l1.37-1.37c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l3.06,3.06,3.06-3.06c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l1.37,1.37s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-3.06,3.06,3.06,3.06Z"/><path fill="#f1f2f2" d="M13.99,12.01s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-1.37,1.37s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-3.06-3.06-3.06,3.06s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-1.37-1.37c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l3.06-3.06-3.06-3.06c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l1.37-1.37c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l3.06,3.06,3.06-3.06c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l1.37,1.37s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-3.06,3.06,3.06,3.06Z"/></svg>',
}

const RESULT_SVG: Record<ResultType, string> = {
  winner:
    '<svg viewBox="0 0 18 19" width="70%" height="70%"><path fill="#fff" transform="matrix(0.25173118,0,0,0.25173118,2.8497971,2.8741344)" d="m 24.4334,39.6517 c 15.9034,0 22.8584,-4.7017 22.8584,-4.7017 l 0.975,-23.6167 c 0,-2.16663 -1.495,-2.79497 -3.25,-1.4083 L 34.1834,17.53 26.6868,2.66667 C 26.0151,0.911667 25.1484,0.5 24.5201,0.5 23.8918,0.5 22.9384,0.955 22.3534,2.66667 L 14.6834,17.53 3.85008,9.925 C 2.09508,8.53833 0.513416,9.16667 0.600083,11.3333 L 1.57508,34.95 c 0,0 6.955,4.55 22.85832,4.7017 z"/></svg>',
  resign:
    '<svg viewBox="0 0 18 19" width="70%" height="70%"><path fill="#fff" d="M4.12 5.46a.57.57 0 0 0-1.1.29l2.33 8.69a.57.57 0 1 0 1.1-.3z"/><path fill="#fff" d="M14.47 6.74c-.13-.59-.31-1.14-.47-1.74L13.46 3c-.45.49-1.04.84-1.7.99-.55.13-1.1.18-1.66.16-.55 0-1.1-.04-1.64-.05-.56-.01-1.12.05-1.67.17-.65.14-1.25.48-1.7.97l.54 2 .47 1.74.45 1.68.09.32c.46-.49 1.06-.83 1.71-.98a6.5 6.5 0 0 1 1.66-.16c.55 0 1.09.05 1.63.05.56.02 1.12-.03 1.67-.16.65-.15 1.24-.49 1.69-.98-.21-.77-.37-1.41-.53-2.01z"/></svg>',
  checkmated:
    '<svg viewBox="0 0 18 19" width="70%" height="70%"><text x="9" y="14" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="Chess Sans, sans-serif">#</text></svg>',
  timeout:
    '<svg viewBox="0 0 24 24" width="62%" height="62%"><circle cx="12" cy="13" r="8" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M12 9v4l3 2" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
  draw: '<svg viewBox="0 0 18 19" width="70%" height="70%"><text x="9" y="14" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="Chess Sans, sans-serif">½</text></svg>',
}

export default function Board({
  fen,
  orientation = 'white',
  movable = 'none',
  onMove,
  lastMove,
  lastMoveColor,
  highlights = [],
  effects = [],
  results = [],
  arrows = [],
  premoves = [],
  premoveColor,
  onPremove,
  onClearPremoves,
}: Props) {
  const [settings] = useSettings()
  const theme = boards[settings.board] ?? boards.green
  const moveMs = SPEEDS[settings.animation]
  const ref = useRef<HTMLDivElement>(null)
  const noAnimId = useRef<number | null>(null)
  const flip = orientation === 'black'

  const [selected, setSelected] = useState<string | null>(null)
  const [drag, setDrag] = useState<{ sq: string; x: number; y: number; moved: boolean; wasSelected: boolean } | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null)
  const [marks, setMarks] = useState<{ square: string; color: string }[]>([])
  const [userArrows, setUserArrows] = useState<Arrow[]>([])
  const [rightDrag, setRightDragState] = useState<{ from: string; to: string; color: string } | null>(null)
  const rightDragRef = useRef<{ from: string; to: string; color: string } | null>(null)
  const setRightDrag = (v: { from: string; to: string; color: string } | null) => {
    rightDragRef.current = v
    setRightDragState(v)
  }

  const chess = useMemo(() => {
    try {
      return new Chess(fen)
    } catch {
      return new Chess()
    }
  }, [fen])
  const turn = chess.turn()
  const premoveMode = !!premoveColor && turn !== premoveColor
  const displayFen = useMemo(() => applyPremoves(fen, premoves), [fen, premoves])
  const display = useMemo(() => (displayFen === fen ? chess : new Chess(displayFen)), [displayFen, fen, chess])

  // Piece identity tracking (committed after render so StrictMode double-render stays pure).
  const prevPieces = useRef<PieceItem[]>([])
  const { pieces, removed, instantId } = useMemo(() => {
    const d = diffPieces(prevPieces.current, displayFen)
    // A piece dropped by hand lands instantly and its capture vanishes (chess.com: animate=false).
    const instant = noAnimId.current
    return { pieces: d.pieces, removed: instant == null ? d.removed : [], instantId: instant }
  }, [displayFen]) // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    prevPieces.current = pieces
    noAnimId.current = null
  }, [pieces])

  useLayoutEffect(() => {
    setSelected(null)
    setPromo(null)
    setMarks([])
    setUserArrows([])
  }, [fen])

  const canMove = (color: string) =>
    movable === 'both' || (movable === color && turn === color) || (premoveMode && color === premoveColor)

  const dests = useMemo(() => {
    const m = new Map<string, boolean>()
    if (!selected) return m
    if (premoveMode) {
      for (const to of premoveDests(displayFen, selected)) m.set(to, false)
      return m
    }
    for (const mv of chess.moves({ square: selected as Square, verbose: true })) m.set(mv.to, !!mv.captured)
    return m
  }, [chess, selected, premoveMode, displayFen])

  const checkSq = useMemo(() => {
    if (!chess.inCheck()) return null
    for (const row of chess.board()) for (const p of row) if (p && p.type === 'k' && p.color === turn) return p.square
    return null
  }, [chess, turn])

  /** Square → [x, y] grid position (0..7, top-left origin) for the current orientation. */
  const toXY = (sq: string) => {
    const f = FILES.indexOf(sq[0])
    const r = Number(sq[1]) - 1
    return flip ? [7 - f, r] : [f, 7 - r]
  }
  const center = (sq: string) => {
    const [x, y] = toXY(sq)
    return { x: x * 12.5 + 6.25, y: y * 12.5 + 6.25 }
  }
  const pos = (sq: string) => {
    const [x, y] = toXY(sq)
    return `translate(${x * 100}%, ${y * 100}%)`
  }

  const sqFromEvent = (e: { clientX: number; clientY: number }) => {
    const rect = ref.current!.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * 8)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * 8)
    if (x < 0 || x > 7 || y < 0 || y > 7) return null
    return flip ? FILES[7 - x] + (y + 1) : FILES[x] + (8 - y)
  }

  const tryMove = (from: string, to: string, byDrag: boolean) => {
    if (premoveMode) {
      if (!premoveDests(displayFen, from).has(to)) return false
      if (byDrag) noAnimId.current = pieces.find((p) => p.square === from)?.id ?? null
      setSelected(null)
      onPremove?.(from, to)
      return true
    }
    const legal = chess.moves({ square: from as Square, verbose: true }).filter((m) => m.to === to)
    if (!legal.length) return false
    if (legal.some((m) => m.promotion)) {
      setPromo({ from, to })
      return true
    }
    if (byDrag) noAnimId.current = pieces.find((p) => p.square === from)?.id ?? null
    setSelected(null)
    onMove?.(from, to)
    return true
  }

  const onPointerDown = (e: PointerEvent) => {
    if (promo) return
    const sq = sqFromEvent(e)
    if (e.button === 2) {
      // Right-click cancels queued premoves (chess.com behaviour) instead of marking.
      if (premoves.length) {
        onClearPremoves?.()
        setSelected(null)
        return
      }
      if (sq) setRightDrag({ from: sq, to: sq, color: ARROW_COLORS[modifier(e)] })
      return
    }
    if (e.button !== 0) return
    // Left click clears user markings, like chess.com.
    if (marks.length || userArrows.length) {
      setMarks([])
      setUserArrows([])
    }
    if (!sq) return
    if (selected && selected !== sq && dests.has(sq)) {
      tryMove(selected, sq, false)
      return
    }
    const piece = display.get(sq as Square)
    if (premoves.length && !(piece && piece.color === premoveColor)) {
      // Clicking anywhere that isn't one of your pieces cancels premoves.
      onClearPremoves?.()
      setSelected(null)
      return
    }
    if (piece && canMove(piece.color)) {
      const rect = ref.current!.getBoundingClientRect()
      ref.current!.setPointerCapture(e.pointerId)
      setDrag({ sq, x: e.clientX - rect.left, y: e.clientY - rect.top, moved: false, wasSelected: selected === sq })
      setSelected(sq)
    } else {
      setSelected(null)
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    const rd = rightDragRef.current
    if (rd) {
      const to = sqFromEvent(e)
      if (to && to !== rd.to) setRightDrag({ ...rd, to })
      return
    }
    if (!drag) return
    const rect = ref.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const moved = drag.moved || Math.hypot(x - drag.x, y - drag.y) > 3
    setDrag({ ...drag, x, y, moved })
    if (moved) setHover(sqFromEvent(e))
  }

  const onPointerUp = (e: PointerEvent) => {
    const rd = rightDragRef.current
    if (e.button === 2 && rd) {
      const { from } = rd
      const to = sqFromEvent(e) ?? rd.to
      const mod = modifier(e)
      setRightDrag(null)
      if (from === to) {
        setMarks((m) => (m.some((x) => x.square === from) ? m.filter((x) => x.square !== from) : [...m, { square: from, color: MARK_COLORS[mod] }]))
      } else {
        setUserArrows((a) =>
          a.some((x) => x.from === from && x.to === to)
            ? a.filter((x) => !(x.from === from && x.to === to))
            : [...a, { from, to, color: ARROW_COLORS[mod], opacity: MARK_OPACITY }],
        )
      }
      return
    }
    if (!drag) return
    const to = sqFromEvent(e)
    setDrag(null)
    setHover(null)
    if (drag.moved) {
      if (to && to !== drag.sq) tryMove(drag.sq, to, true)
    } else if (drag.wasSelected) {
      // Clicking an already-selected piece deselects it.
      setSelected(null)
    }
  }

  const arrowEl = (ar: Arrow, key: string) => {
    const a = center(ar.from)
    const b = center(ar.to)
    const dx = b.x - a.x
    const dy = b.y - a.y
    const style = { fill: ar.color ?? ARROW_COLORS.none, opacity: ar.opacity ?? MARK_OPACITY }
    const fdx = Math.round(dx / 12.5)
    const fdy = Math.round(dy / 12.5)
    if ((Math.abs(fdx) === 1 && Math.abs(fdy) === 2) || (Math.abs(fdx) === 2 && Math.abs(fdy) === 1)) {
      // Long leg first: map local (x = short leg, y = long leg) onto board axes.
      const long = Math.abs(fdy) === 2 ? { x: 0, y: Math.sign(fdy) } : { x: Math.sign(fdx), y: 0 }
      const short = Math.abs(fdy) === 2 ? { x: Math.sign(fdx), y: 0 } : { x: 0, y: Math.sign(fdy) }
      const pts = knightArrowPoints()
        .map(([lx, ly]) => `${a.x + lx * short.x + ly * long.x} ${a.y + lx * short.y + ly * long.y}`)
        .join(', ')
      return <polygon key={key} className="arrow" points={pts} style={style} />
    }
    const len = Math.hypot(dx, dy)
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI - 90
    const pts = straightArrowPoints(len)
      .map(([x, y]) => `${a.x + x} ${a.y + y}`)
      .join(', ')
    return <polygon key={key} className="arrow" points={pts} transform={`rotate(${angle} ${a.x} ${a.y})`} style={style} />
  }

  const allHighlights: Highlight[] = []
  if (lastMove && settings.highlightMoves)
    for (const sq of lastMove) allHighlights.push({ square: sq, color: lastMoveColor ?? theme.highlight, opacity: 0.5 })
  if (selected && selected !== lastMove?.[0] && selected !== lastMove?.[1])
    allHighlights.push({ square: selected, color: theme.highlight, opacity: 0.5 })
  allHighlights.push(...highlights)
  for (const [from, to] of premoves) {
    allHighlights.push({ square: from, color: PREMOVE_COLOR, opacity: 0.5 })
    allHighlights.push({ square: to, color: PREMOVE_COLOR, opacity: 0.5 })
  }
  for (const m of marks) allHighlights.push({ square: m.square, color: m.color, opacity: MARK_OPACITY })

  const promoColor = promo ? chess.get(promo.from as Square)?.color ?? 'w' : 'w'
  const allArrows = [...arrows, ...userArrows, ...(rightDrag && rightDrag.from !== rightDrag.to ? [{ from: rightDrag.from, to: rightDrag.to, color: rightDrag.color }] : [])]

  return (
    <div
      ref={ref}
      className={`board ${drag?.moved ? 'is-dragging' : ''}`}
      data-fen={fen}
      style={{
        backgroundImage: `url(${boardUrl(settings.board)})`,
        ['--move-ms' as string]: `${moveMs}ms`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {settings.coords && (
        <svg viewBox="0 0 100 100" className="coordinates" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <text key={'r' + i} x="0.75" y={3.5 + i * 12.5} fontSize="2.8" fill={i % 2 === 0 ? theme.dark : theme.light}>
              {flip ? i + 1 : 8 - i}
            </text>
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <text key={'f' + i} x={10 + i * 12.5} y="99" fontSize="2.8" fill={i % 2 === 0 ? theme.light : theme.dark}>
              {flip ? FILES[7 - i] : FILES[i]}
            </text>
          ))}
        </svg>
      )}

      {allHighlights.map((h, i) => (
        <div key={'h' + i + h.square} className="highlight" style={{ transform: pos(h.square), backgroundColor: h.color, opacity: h.opacity ?? 0.5 }} />
      ))}
      {checkSq && <div className="check-square" style={{ transform: pos(checkSq) }} />}

      {settings.showLegal &&
        [...dests.entries()].map(([sq, cap]) => (
          <div key={'d' + sq} className={cap ? 'capture-hint' : 'hint'} style={{ transform: pos(sq) }} />
        ))}

      {hover && drag?.moved && (
        <div className="hover-square" style={{ transform: pos(hover) }}>
          <svg viewBox="0 0 100 100">
            <rect x="0" y="0" width="100" height="100" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="10" fill="none" />
          </svg>
        </div>
      )}

      {moveMs > 0 && removed.map((p) => (
        <div
          key={'x' + p.id + fen}
          className="piece fade-out"
          style={{ transform: pos(p.square), backgroundImage: `url(${pieceUrl(p.code, settings.pieceSet, 300)})` }}
        />
      ))}
      {pieces.map((p) => {
        const dragging = drag?.moved && drag.sq === p.square
        const rect = ref.current?.getBoundingClientRect()
        const size = rect ? rect.width / 8 : 0
        const transform = dragging ? `translate(${drag!.x - size / 2}px, ${drag!.y - size / 2}px)` : pos(p.square)
        const instant = dragging || instantId === p.id || !moveMs
        return (
          <div
            key={p.id}
            className={`piece ${dragging ? 'dragging' : ''}`}
            style={{
              transform,
              transition: instant ? 'none' : undefined,
              backgroundImage: `url(${pieceUrl(p.code, settings.pieceSet, 300)})`,
            }}
          />
        )
      })}

      {effects.map((ef) => {
        const [x, y] = toXY(ef.square)
        return (
          <div
            key={'e' + ef.square + ef.type}
            className={`effect ${y === 0 ? 'tuck-top' : ''} ${x === 7 ? 'tuck-right' : ''}`}
            style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}
            dangerouslySetInnerHTML={{ __html: EFFECT_SVG[ef.type] }}
          />
        )
      })}

      {results.map((r) => {
        const [x, y] = toXY(r.square)
        return (
          <div
            key={'r' + r.square}
            className={`result-badge ${r.type} ${y === 0 ? 'tuck-top' : ''} ${x === 7 ? 'tuck-right' : ''}`}
            style={{ transform: `translate(${x * 100}%, ${y * 100}%)` }}
          >
            <span className="result-badge-icon" dangerouslySetInnerHTML={{ __html: RESULT_SVG[r.type] }} />
          </div>
        )
      })}

      {allArrows.length > 0 && (
        <svg viewBox="0 0 100 100" className="arrows">
          {allArrows.map((a, i) => arrowEl(a, `${a.from}${a.to}${i}`))}
        </svg>
      )}

      {promo && (
        <div className="promotion-overlay" onPointerDown={(e) => { e.stopPropagation(); setPromo(null) }}>
          <div
            className={`promotion-window ${toXY(promo.to)[1] === 0 ? 'top' : 'bottom'}`}
            style={{ left: `${toXY(promo.to)[0] * 12.5}%` }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {['q', 'n', 'r', 'b'].map((t) => (
              <div
                key={t}
                className="promotion-piece"
                style={{ backgroundImage: `url(${pieceUrl(promoColor + t, settings.pieceSet, 300)})` }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  const p = promo
                  setPromo(null)
                  onMove?.(p.from, p.to, t)
                }}
              />
            ))}
            <button className="promotion-close" onPointerDown={(e) => { e.stopPropagation(); setPromo(null) }} aria-label="Close">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
