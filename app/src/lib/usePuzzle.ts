import { useSettings } from './storage'
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
  const reported = useRef(false)
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
    later(() => {
      applyOpponent(puzzle.moves[0])
      setStep(1)
      setStatus('playing')
    }, opts.firstMoveDelay ?? 500)
    return clearTimers
  }, [puzzle, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    reported.current = false
  }, [puzzle])

  const userMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      if (!puzzle || status !== 'playing') return
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
          recordSolve()
          playPuzzle(rush ? 'rush-correct' : 'puzzle-solved')
          report(hintLevel === 0)
        } else {
          setStep(next + 1)
          setHintLevel(0)
          later(() => applyOpponent(puzzle.moves[next]), 500)
        }
      } else {
        setLastMoveColor(INCORRECT_COLOR)
        setEffects([{ square: m.to, type: 'incorrect' }])
        setStatus('wrong')
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
    report(false)
    if (status === 'wrong') chess.current.undo()
    clearTimers()
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
    report(false)
    setHighlights([{ square: from, color: HINT_COLOR, opacity: 0.5 }])
    if (hintLevel >= 1) setArrows([{ from, to }])
    setHintLevel((h) => h + 1)
  }, [puzzle, status, step, hintLevel]) // eslint-disable-line react-hooks/exhaustive-deps

  const solverColor: 'w' | 'b' = puzzle ? (new Chess(puzzle.fen).turn() === 'w' ? 'b' : 'w') : 'w'
  const orientation = (solverColor === 'w' ? 'white' : 'black') as 'white' | 'black'

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
      fen,
      orientation,
      movable: (status === 'playing' ? solverColor : 'none') as 'w' | 'b' | 'none',
      onMove: userMove,
      lastMove,
      lastMoveColor,
      effects,
      highlights,
      arrows,
    },
  }
}
