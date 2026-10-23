import { useSettings } from './storage'
import type { Premove } from '../components/Board'
// Puzzle flow modelled on chess.com's puzzles.js (via REA):
// - correct move: from/to highlighted #acce59 @ .5 + "correct" badge on the target square
// - wrong move: the move stays on the board, highlighted #ff7769 @ .5 + "incorrect" badge,
//   PUZZLE_INCORRECT sound; Retry takes it back
// - hint: 1st press highlights the piece's square #1baca6 @ .5, 2nd press adds the arrow
// - solved: PUZZLE_SOLVED sound (rush mode uses the rush correct/incorrect sounds instead)
import { useCallback, useEffect, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import type { Puzzle } from './puzzles'
import { playMove, playPuzzle } from './sound'
import { recordSolve } from './streak'
import { recordPathSolve } from './puzzlePath'
import type { Arrow, Effect, Highlight } from '../components/Board'

export type PuzzleStatus = 'loading' | 'playing' | 'wrong' | 'solved' | 'revealed'

export const CORRECT_COLOR = '#acce59'
export const INCORRECT_COLOR = '#ff7769'
export const HINT_COLOR = '#1baca6'

interface Options {
  /** Called once per puzzle with whether it was solved cleanly (no mistakes, no hints). */
  onResult?: (solved: boolean, puzzle: Puzzle) => void
  onNext?: () => void
  firstMoveDelay?: number
  mode?: 'rated' | 'rush'
}

function uciToMove(uci: string) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }
}

export function usePuzzle(puzzle: Puzzle | null, opts: Options = {}) {
  const [settings] = useSettings()
  const solverColor: 'w' | 'b' = puzzle ? (new Chess(puzzle.fen).turn() === 'w' ? 'b' : 'w') : 'w'
  const orientation = (solverColor === 'w' ? 'white' : 'black') as 'white' | 'black'
  const chess = useRef(new Chess())
  const [fen, setFen] = useState(chess.current.fen())
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<PuzzleStatus>('loading')
  const [lastMove, setLastMove] = useState<[string, string] | null>(null)
  const [lastMoveColor, setLastMoveColor] = useState<string | undefined>()
  const [effects, setEffects] = useState<Effect[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [hintLevel, setHintLevel] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [premoves, setPremoves] = useState<Premove[]>([])
  /** Ply being viewed with the arrow keys (null = live). Never before the opponent's first move. */
  const [viewPly, setViewPly] = useState<number | null>(null)
  const reported = useRef(false)
  const completed = useRef(false)
  const firstTry = useRef(true)
  const timers = useRef<number[]>([])
  const optsRef = useRef(opts)
  optsRef.current = opts
  const rush = opts.mode === 'rush'

  const hasNext = !!opts.onNext
  useEffect(() => {
    if (status !== 'solved' || !settings.puzzleAutoAdvance || !hasNext) return
    const timer = window.setTimeout(() => optsRef.current.onNext?.(), 1200)
    return () => window.clearTimeout(timer)
  }, [status, settings.puzzleAutoAdvance, hasNext, puzzle])

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const clearMarkings = () => {
    setEffects([])
    setHighlights([])
    setArrows([])
    setLastMoveColor(undefined)
  }

  const applyOpponent = (uci: string) => {
    const m = chess.current.move(uciToMove(uci))
    setFen(chess.current.fen())
    setLastMove([m.from, m.to])
    clearMarkings()
    playMove(m.san, true)
  }

  const report = (solved: boolean) => {
    if (reported.current || !puzzle) return
    reported.current = true
    optsRef.current.onResult?.(solved, puzzle)
  }

  useEffect(() => {
    clearTimers()
    if (!puzzle) return
    chess.current = new Chess(puzzle.fen)
    setFen(puzzle.fen)
    setStep(0)
    setStatus('loading')
    setLastMove(null)
    clearMarkings()
    setHintLevel(0)
    setPremoves([])
    setViewPly(null)
    later(() => {
      applyOpponent(puzzle.moves[0])
      setStep(1)
      setStatus('playing')
    }, opts.firstMoveDelay ?? 500)
    return clearTimers
  }, [puzzle, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setViewPly(null), [fen])

  useEffect(() => {
    reported.current = false
    completed.current = false
    firstTry.current = true
  }, [puzzle])

  const userMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      if (!puzzle || status !== 'playing' || chess.current.turn() !== solverColor) return
      const expected = puzzle.moves[step]
      let m
      try {
        m = chess.current.move({ from, to, promotion: promotion ?? 'q' })
      } catch {
        return
      }
      const uci = m.from + m.to + (m.promotion ?? '')
      setFen(chess.current.fen())
      setLastMove([m.from, m.to])
      setHighlights([])
      setArrows([])
      playMove(m.san)
      const isMate = chess.current.isCheckmate()
      if (uci === expected || isMate) {
        setLastMoveColor(CORRECT_COLOR)
        setEffects([{ square: m.to, type: 'correct' }])
        const next = step + 1
        if (next >= puzzle.moves.length || isMate) {
          setStep(puzzle.moves.length)
          setStatus('solved')
          if (!completed.current) {
            recordPathSolve(firstTry.current)
            recordSolve()
            completed.current = true
          }
          playPuzzle(rush ? 'rush-correct' : 'puzzle-solved')
          report(hintLevel === 0)
        } else {
          setStep(next + 1)
          setHintLevel(0)
          later(() => applyOpponent(puzzle.moves[next]), 500)
        }
      } else {
        firstTry.current = false
        setLastMoveColor(INCORRECT_COLOR)
        setEffects([{ square: m.to, type: 'incorrect' }])
        setStatus('wrong')
        setPremoves([])
        playPuzzle(rush ? 'rush-incorrect' : 'puzzle-incorrect')
        report(false)
      }
    },
    [puzzle, status, step, hintLevel], // eslint-disable-line react-hooks/exhaustive-deps
  )

  /** After a wrong move: take it back and keep solving. */
  const retry = useCallback(() => {
    if (status !== 'wrong') return
    chess.current.undo()
    const h = chess.current.history({ verbose: true })
    const last = h[h.length - 1]
    setFen(chess.current.fen())
    setLastMove(last ? [last.from, last.to] : null)
    clearMarkings()
    setStatus('playing')
  }, [status])

  /** Replays the puzzle from the start (after it's finished). */
  const restart = useCallback(() => setAttempt((a) => a + 1), [])

  const showSolution = useCallback(() => {
    if (!puzzle || status === 'solved' || status === 'revealed' || status === 'loading') return
    firstTry.current = false
    report(false)
    if (status === 'wrong') chess.current.undo()
    clearTimers()
    setPremoves([])
    setStatus('revealed')
    clearMarkings()
    puzzle.moves.slice(step).forEach((uci, i) => {
      const solverMove = (step + i) % 2 === 1
      later(() => {
        const m = chess.current.move(uciToMove(uci))
        setFen(chess.current.fen())
        setLastMove([m.from, m.to])
        setHighlights([])
        setArrows([])
        setLastMoveColor(solverMove ? CORRECT_COLOR : undefined)
        setEffects(solverMove ? [{ square: m.to, type: 'correct' }] : [])
        playMove(m.san, !solverMove)
      }, 300 + i * 800)
    })
  }, [puzzle, status, step]) // eslint-disable-line react-hooks/exhaustive-deps

  const hint = useCallback(() => {
    if (!puzzle || status !== 'playing') return
    const { from, to } = uciToMove(puzzle.moves[step])
    firstTry.current = false
    report(false)
    setHighlights([{ square: from, color: HINT_COLOR, opacity: 0.5 }])
    if (hintLevel >= 1) setArrows([{ from, to }])
    setHintLevel((h) => h + 1)
  }, [puzzle, status, step, hintLevel]) // eslint-disable-line react-hooks/exhaustive-deps

  // Queued premoves play 200ms after the opponent replies (chess.com premoveDelay); an illegal one drops the queue.
  useEffect(() => {
    if (!settings.premoves || status !== 'playing' || !premoves.length || chess.current.turn() !== solverColor) return
    const t = window.setTimeout(() => {
      const [[from, to, promotion], ...rest] = premoves
      const legal = chess.current.moves({ verbose: true }).some((m) => m.from === from && m.to === to)
      if (!legal) return setPremoves([])
      setPremoves(rest)
      userMove(from, to, promotion)
    }, 200)
    return () => clearTimeout(t)
  }, [fen, premoves, status, settings.premoves, userMove]) // eslint-disable-line react-hooks/exhaustive-deps

  // ←/→ step through the moves played since the puzzle started (↑/↓ jump to first/last).
  const liveHistory = chess.current.history({ verbose: true })
  const livePly = liveHistory.length
  useEffect(() => {
    if (!puzzle || livePly < 1) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -Infinity, ArrowDown: Infinity }[e.key]
      if (delta == null) return
      e.preventDefault()
      setViewPly((v) => {
        const target = Math.max(1, Math.min(livePly, (v ?? livePly) + delta))
        return target === livePly ? null : target
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [puzzle, livePly])

  const viewing = viewPly != null && puzzle != null
  const viewFen = viewing ? liveHistory[viewPly - 1].after : fen
  const viewMove = viewing ? liveHistory[viewPly - 1] : null
  const premoveOn = settings.premoves && status === 'playing' && !viewing

  return {
    status,
    solverColor,
    orientation,
    retry,
    restart,
    showSolution,
    hint,
    usedHint: hintLevel > 0,
    history: () => chess.current.history(),
    boardProps: {
      fen: viewFen,
      orientation,
      movable: (status === 'playing' && !viewing ? solverColor : 'none') as 'w' | 'b' | 'none',
      onMove: userMove,
      lastMove: viewMove ? ([viewMove.from, viewMove.to] as [string, string]) : lastMove,
      lastMoveColor: viewing ? undefined : lastMoveColor,
      effects: viewing ? [] : effects,
      highlights: viewing ? [] : highlights,
      arrows: viewing ? [] : arrows,
      premoves: premoveOn ? premoves : [],
      premoveColor: premoveOn ? solverColor : undefined,
      onPremove: (from: string, to: string, promotion?: string) => setPremoves((p) => [...p, [from, to, promotion]]),
      onClearPremoves: () => setPremoves([]),
    },
  }
}
