import { useSettings } from '../lib/storage'
import { useEffect, useRef, type ReactNode } from 'react'

export interface Score {
  cp?: number
  mate?: number
}

const FIGURINES = {
  w: { K: 'Ā', Q: 'Į', R: 'Ľ', B: 'Ă', N: 'Ç' },
  b: { K: 'Ą', Q: 'Ķ', R: 'Ļ', B: 'Ä', N: 'Ė' },
}

export function SanText({ san, color }: { san: string; color: 'w' | 'b' }) {
  const [settings] = useSettings()
  if (settings.notation === 'letter') return <>{san}</>
  return <>{san.split(/(^[KQRBN]|=[QRBN])/).map((part, i) => {
    const piece = part.startsWith('=') ? part.slice(1) : part
    if (piece in FIGURINES[color]) return <span key={i}>{part.startsWith('=') && '='}<span className="figurine">{FIGURINES[color][piece as keyof typeof FIGURINES.w]}</span></span>
    return part
  })}</>
}

/** Formats a white-perspective score like chess.com: "+1.4", "M3", "-M2". */
export function formatScore(s: Score | null) {
  if (!s) return '0.0'
  if (s.mate != null) return s.mate === 0 ? '#' : `${s.mate < 0 ? '-' : ''}M${Math.abs(s.mate)}`
  const v = (s.cp ?? 0) / 100
  return `${v > 0 ? '+' : ''}${v.toFixed(1)}`
}

export function EvalBar({ score, flip }: { score: Score | null; flip?: boolean }) {
  let white = 50
  if (score?.mate) white = score.mate > 0 ? 100 : 0
  else if (score?.cp != null) white = 50 + 50 * (2 / (1 + Math.exp(-0.004 * score.cp)) - 1)
  const whiteWinning = white >= 50
  return (
    <div className={`evalbar ${flip ? 'flip' : ''}`}>
      <div className="evalbar-white" style={{ height: `${white}%` }} />
      <span className={`evalbar-label ${whiteWinning ? 'bottom' : 'top'}`}>{formatScore(score).replace('+', '')}</span>
    </div>
  )
}

export function MoveList({ sans, ply, onSelect, startFen }: { sans: string[]; ply: number; onSelect?: (ply: number) => void; startFen?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelector('.active')?.scrollIntoView({ block: 'nearest' })
  }, [ply, sans.length])
  const fields = startFen?.split(' ') ?? []
  const blackFirst = fields[1] === 'b'
  const firstNo = Number(fields[5]) || 1
  // Pad with an empty white slot when black moves first, so rows stay aligned as "N. white black".
  const cells: (number | null)[] = [...(blackFirst ? [null] : []), ...sans.map((_, i) => i)]
  const rows = []
  for (let i = 0; i < cells.length; i += 2) {
    const cell = (c: number | null | undefined) =>
      c == null ? (
        <span className="mv muted">{c === null ? '…' : ''}</span>
      ) : (
        <button className={`mv ${ply === c + 1 ? 'active' : ''}`} onClick={() => onSelect?.(c + 1)}>
          <SanText san={sans[c]} color={(c + Number(blackFirst)) % 2 === 0 ? 'w' : 'b'} />
        </button>
      )
    rows.push(
      <div className="mrow" key={i}>
        <span className="mnum">{firstNo + i / 2}.</span>
        {cell(cells[i])}
        {i + 1 < cells.length && cell(cells[i + 1])}
      </div>,
    )
  }
  return (
    <div className="movelist" ref={ref}>
      {rows.length ? rows : <div className="muted small">No moves yet</div>}
    </div>
  )
}

export function NavButtons({ ply, max, onSelect }: { ply: number; max: number; onSelect: (p: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') onSelect(Math.max(0, ply - 1))
      else if (e.key === 'ArrowRight') onSelect(Math.min(max, ply + 1))
      else if (e.key === 'ArrowUp') onSelect(0)
      else if (e.key === 'ArrowDown') onSelect(max)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ply, max, onSelect])
  return (
    <div className="nav-buttons">
      <button className="btn icon" onClick={() => onSelect(0)} disabled={ply === 0} title="First">⏮</button>
      <button className="btn icon" onClick={() => onSelect(Math.max(0, ply - 1))} disabled={ply === 0} title="Previous (←)">◀</button>
      <button className="btn icon" onClick={() => onSelect(Math.min(max, ply + 1))} disabled={ply >= max} title="Next (→)">▶</button>
      <button className="btn icon" onClick={() => onSelect(max)} disabled={ply >= max} title="Last">⏭</button>
    </div>
  )
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

export function Avatar({ emoji, color, size = 40 }: { emoji: string; color: string; size?: number }) {
  return (
    <div className="avatar" style={{ background: color, width: size, height: size, fontSize: size * 0.6 }}>
      {emoji}
    </div>
  )
}
