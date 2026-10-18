import { useSettings } from '../lib/storage'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import Board from '../components/Board'
import { EvalBar, MoveList, NavButtons, formatScore, type Score } from '../components/ui'
import { Engine, type EngineLine } from '../lib/engine'
import { playMove } from '../lib/sound'
import { buildPositions } from '../lib/game'

const START = new Chess().fen()

/** Opens the analysis board with a start position and a list of SAN moves. */
export function openInAnalysis(fen: string, sans: string[] = [], orientation?: 'white' | 'black') {
  sessionStorage.setItem('rea-chess:analysis', JSON.stringify({ fen, sans, orientation }))
  location.hash = '#/analysis'
}

function pvToSan(fen: string, pv: string[], max = 10) {
  const c = new Chess(fen)
  const out: string[] = []
  for (const uci of pv.slice(0, max)) {
    try {
      out.push(c.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }).san)
    } catch {
      break
    }
  }
  return out
}

export default function Analysis() {
  const [settings] = useSettings()
  const init = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('rea-chess:analysis')
      if (raw) return JSON.parse(raw) as { fen: string; sans: string[]; orientation?: 'white' | 'black' }
    } catch {
      /* ignore */
    }
    return { fen: START, sans: [] as string[] }
  }, [])

  const [startFen, setStartFen] = useState(init.fen)
  const [sans, setSans] = useState<string[]>(init.sans)
  const [ply, setPly] = useState(init.sans.length)
  const [orientation, setOrientation] = useState<'white' | 'black'>(
    init.orientation ?? (new Chess(init.fen).turn() === 'w' ? 'white' : 'black'),
  )
  const [engineOn, setEngineOn] = useState(true)
  const [lines, setLines] = useState<EngineLine[]>([])
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const engine = useRef<Engine | null>(null)

  const { fens, moves } = useMemo(() => buildPositions(startFen, sans), [startFen, sans])
  const fen = fens[ply]
  const turn = new Chess(fen).turn()

  useEffect(() => {
    sessionStorage.setItem('rea-chess:analysis', JSON.stringify({ fen: startFen, sans, orientation }))
  }, [startFen, sans, orientation])

  useEffect(() => {
    engine.current = new Engine()
    return () => engine.current?.destroy()
  }, [])

  useEffect(() => {
    setLines([])
    if (!engineOn || !engine.current) return
    const c = new Chess(fen)
    if (c.isGameOver()) {
      engine.current.stop()
      return
    }
    engine.current.search(fen, { depth: settings.engineDepth, multipv: 3, onInfo: setLines, options: { UCI_LimitStrength: false, 'Skill Level': 20 } })
    return () => engine.current?.stop()
  }, [fen, engineOn, settings.engineDepth])

  const toWhite = (l?: EngineLine): Score | null => {
    if (!l) return null
    const sign = turn === 'w' ? 1 : -1
    return l.mate != null ? { mate: l.mate * sign } : { cp: (l.cp ?? 0) * sign }
  }

  const checkmateScore = (): Score | null => {
    const c = new Chess(fen)
    if (!c.isCheckmate()) return null
    return { mate: 0, cp: c.turn() === 'w' ? -100000 : 100000 }
  }

  const onMove = (from: string, to: string, promotion?: string) => {
    const c = new Chess(fen)
    let m
    try {
      m = c.move({ from, to, promotion })
    } catch {
      return
    }
    playMove(m.san)
    if (sans[ply] === m.san) {
      setPly(ply + 1)
      return
    }
    setSans([...sans.slice(0, ply), m.san])
    setPly(ply + 1)
  }

  const playUci = (uci: string) => onMove(uci.slice(0, 2), uci.slice(2, 4), uci[4])
  const jump = (p: number) => {
    if (p === ply + 1) playMove(sans[p - 1])
    setPly(p)
  }

  const doImport = () => {
    const text = importText.trim()
    if (!text) return
    try {
      const c = new Chess()
      if (/^\s*([rnbqkpRNBQKP1-8]+\/){7}/.test(text)) {
        c.load(text)
        setStartFen(c.fen())
        setSans([])
        setPly(0)
      } else {
        c.loadPgn(text)
        const hist = c.history()
        const header = c.getHeaders()
        const sf = header.FEN ?? START
        setStartFen(sf)
        setSans(hist)
        setPly(hist.length)
      }
      setImportText('')
      setImportError('')
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Could not read that FEN/PGN')
    }
  }

  const pgn = useMemo(() => {
    const c = new Chess(startFen)
    if (startFen !== START) {
      c.setHeader('SetUp', '1')
      c.setHeader('FEN', startFen)
    }
    for (const s of sans) c.move(s)
    return c.pgn()
  }, [startFen, sans])

  const bestArrow = settings.bestMoveArrow && engineOn && lines[0] ? [{ from: lines[0].move.slice(0, 2), to: lines[0].move.slice(2, 4), color: 'rgba(80,140,220,0.85)' }] : []
  const score = checkmateScore() ?? toWhite(lines[0])

  return (
    <div className="layout">
      <div className={`board-col ${engineOn && settings.showEvalBar ? 'with-eval' : ''}`}>
        {engineOn && settings.showEvalBar && <EvalBar score={score} flip={orientation === 'black'} />}
        <Board
          fen={fen}
          orientation={orientation}
          movable="both"
          onMove={onMove}
          lastMove={ply > 0 ? moves[ply - 1] : null}
          arrows={bestArrow}
        />
      </div>
      <aside className="panel">
        <div className="panel-header">
          <span className="panel-icon">🔍</span> Analysis
          <label className="toggle" title="Engine on/off">
            <input type="checkbox" checked={engineOn} onChange={(e) => setEngineOn(e.target.checked)} />
            <span />
          </label>
        </div>
        <div className="panel-body">
          {engineOn && (
            <div className="engine-lines">
              <div className="muted small">Stockfish 19 · depth {lines[0]?.depth ?? 0}</div>
              {lines.map((l, i) => (
                <button key={i} className="engine-line" onClick={() => playUci(l.move)}>
                  <span className={`eval-chip ${(toWhite(l)?.cp ?? (toWhite(l)?.mate ?? 0) * 1000) >= 0 ? 'white' : 'black'}`}>
                    {formatScore(toWhite(l))}
                  </span>
                  <span className="pv">{pvToSan(fen, l.pv).join(' ')}</span>
                </button>
              ))}
              {!lines.length && <div className="muted small">{new Chess(fen).isGameOver() ? 'Game over' : 'Thinking…'}</div>}
            </div>
          )}
          <MoveList sans={sans} ply={ply} onSelect={jump} startFen={startFen} />
          <details className="import">
            <summary>Load FEN / PGN · Copy PGN</summary>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste a FEN or PGN" rows={4} />
            {importError && <div className="error small">{importError}</div>}
            <div className="btn-row">
              <button className="btn secondary grow" onClick={doImport}>Load</button>
              <button className="btn secondary grow" onClick={() => navigator.clipboard?.writeText(pgn)}>Copy PGN</button>
              <button className="btn secondary grow" onClick={() => navigator.clipboard?.writeText(fen)}>Copy FEN</button>
            </div>
          </details>
        </div>
        <div className="panel-footer">
          <div className="btn-row">
            <NavButtons ply={ply} max={sans.length} onSelect={jump} />
            <button className="btn icon" title="Flip board" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>⇅</button>
            <button
              className="btn icon"
              title="Reset to starting position"
              onClick={() => {
                setStartFen(START)
                setSans([])
                setPly(0)
              }}
            >
              ↺
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
