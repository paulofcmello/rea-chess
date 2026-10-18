import { useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import { Engine } from './engine'
import { endgameOutcome, type EndgameDrill } from './endgames'
import { playMove, playPuzzle } from './sound'
import type { Arrow } from '../components/Board'

export function useEndgame(drill: EndgameDrill, onResult: (success: boolean, moves: number, ms: number, assisted: boolean) => void) {
  const [game] = useState(() => new Chess(drill.fen))
  const [side] = useState(() => game.turn())
  const [revision, setRevision] = useState(0)
  const [status, setStatus] = useState<'playing' | 'success' | 'failed'>('playing')
  const [hinting, setHinting] = useState(false)
  const [arrow, setArrow] = useState<Arrow[]>([])
  const [error, setError] = useState('')
  const engine = useRef<Engine | null>(null)
  const hintEngine = useRef<Engine | null>(null)
  const generation = useRef(0)
  const assisted = useRef(false)
  const reported = useRef(false)
  const [started] = useState(() => Date.now())
  const result = useRef(onResult)
  function invalidateHints() { generation.current++ }
  useEffect(() => { result.current = onResult })

  useEffect(() => {
    const opponent = new Engine()
    const hints = new Engine()
    engine.current = opponent
    hintEngine.current = hints
    return () => { invalidateHints(); opponent.stop(); hints.stop(); opponent.destroy(); hints.destroy() }
  }, [])

  const thinking = status === 'playing' && game.turn() !== side && !error

  function countMoves() { return game.history({ verbose: true }).filter(m => m.color === side).length }
  function changed() {
    const outcome = endgameOutcome(game, side, drill.goal, countMoves(), drill.moveLimit)
    if (outcome) {
      setStatus(outcome)
      playPuzzle(outcome === 'success' ? 'puzzle-solved' : 'puzzle-incorrect')
      if (!reported.current) {
        reported.current = true
        result.current(outcome === 'success', countMoves(), Date.now() - started, assisted.current)
      }
    }
    setRevision(v => v + 1)
  }

  useEffect(() => {
    if (status !== 'playing' || game.turn() === side) return
    let cancelled = false
    engine.current?.search(game.fen(), { depth: 20, options: { UCI_LimitStrength: false, 'Skill Level': 20 } }).then(search => {
      if (cancelled) return
      if (!search || !search.bestmove || search.bestmove === '(none)') {
        setError('The engine could not find a move. Try again.')
        return
      }
      try {
        const move = game.move(search.bestmove)
        playMove(move.san, true)
        changed()
      } catch { setError('The engine could not play this position. Try again.') }
    }).catch(() => { if (!cancelled) { setError('The engine could not be loaded. Try again.') } })
    return () => { cancelled = true; engine.current?.stop() }
    // The game is mutable; revision changes after every move or takeback.
  }, [revision, status, game, side]) // eslint-disable-line react-hooks/exhaustive-deps

  function move(from: string, to: string, promotion?: string) {
    if (status !== 'playing' || game.turn() !== side || thinking || hinting) return
    try {
      const played = game.move({ from, to, promotion: promotion ?? 'q' })
      generation.current++
      hintEngine.current?.stop()
      setArrow([])
      setError('')
      playMove(played.san)
      changed()
    } catch { /* The board already filters illegal moves. */ }
  }

  async function hint() {
    if (status !== 'playing' || game.turn() !== side || thinking || hinting) return
    assisted.current = true
    setError('')
    setHinting(true)
    const token = ++generation.current
    try {
      const search = await hintEngine.current?.search(game.fen(), { depth: 20 })
      if (token !== generation.current) return
      if (search?.bestmove && search.bestmove !== '(none)') setArrow([{ from: search.bestmove.slice(0, 2), to: search.bestmove.slice(2, 4), color: '#81b64c' }])
      else setError('A hint is unavailable. Try again.')
    } catch { if (token === generation.current) setError('A hint is unavailable. Try again.') }
    finally { if (token === generation.current) setHinting(false) }
  }

  function takeback() {
    if (!game.history().length) return
    assisted.current = true
    generation.current++
    engine.current?.stop()
    hintEngine.current?.stop()
    game.undo()
    if (game.turn() !== side && game.history().length) game.undo()
    setHinting(false)
    setStatus('playing')
    reported.current = false
    setArrow([])
    setError('')
    setRevision(v => v + 1)
  }

  const history = game.history({ verbose: true })
  const last = history.at(-1)
  return {
    side, status, thinking, hinting, error, history, moves: countMoves(),
    move, hint, takeback, retryEngine: () => { setError(''); setRevision(v => v + 1) },
    boardProps: {
      fen: game.fen(), orientation: side === 'w' ? 'white' as const : 'black' as const,
      movable: status === 'playing' && game.turn() === side && !hinting ? side : 'none' as const,
      onMove: move, arrows: arrow,
      lastMove: last ? [last.from, last.to] as [string, string] : null,
      effects: last && status !== 'playing' ? [{ square: last.to, type: status === 'success' ? 'correct' as const : 'incorrect' as const }] : [],
    },
  }
}
