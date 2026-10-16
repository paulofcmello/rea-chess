import { useMemo } from 'react'
import type { PuzzleStatus } from '../lib/usePuzzle'
import type { CoachEmotion } from '../components/Coach'
import { CCButton, CoachSpeech } from '../components/PuzzleSidebar'
import { Glyph } from '../components/glyphs'

const SOLVED_LINES = [
  'Yes, indeed! You got it!',
  'Excellent! That’s the move.',
  'Great job! Keep it going.',
  'Nicely done. That’s the idea!',
  'You found it! Well played.',
  'Perfect. On to the next one!',
]

/** Coach bubble content for each puzzle state, following chess.com's rated puzzle sidebar. */
export function PuzzleCoach({ status, color, usedHint }: { status: PuzzleStatus; color: 'w' | 'b'; usedHint?: boolean }) {
  const solvedLine = useMemo(() => SOLVED_LINES[Math.floor(Math.random() * SOLVED_LINES.length)], [status === 'solved'])  // eslint-disable-line react-hooks/exhaustive-deps
  const solvedEmotion = useMemo<CoachEmotion>(() => (['impressed', 'happy', 'surprised'] as const)[Math.floor(Math.random() * 3)], [status === 'solved'])  // eslint-disable-line react-hooks/exhaustive-deps
  const side = color === 'w' ? 'White' : 'Black'
  if (status === 'solved') return <CoachSpeech kind="correct" title="Solved" text={usedHint ? 'Solved with a hint. Try the next one on your own!' : solvedLine} emotion={solvedEmotion} />
  if (status === 'wrong') return <CoachSpeech kind="incorrect" title="Incorrect" emotion="thinking" />
  if (status === 'revealed') return <CoachSpeech kind={color === 'w' ? 'white' : 'black'} title="Solution" text="Here’s how it goes. Study it and try the next one." emotion="concerned" />
  return (
    <CoachSpeech
      kind={color === 'w' ? 'white' : 'black'}
      title={`${side} to move`}
      text={usedHint ? 'Look at the highlighted piece. What can it do?' : `Find the best move for ${side.toLowerCase()}.`}
      emotion={usedHint ? 'thinking' : 'greeting'}
    />
  )
}

/** Footer buttons per state, matching chess.com: Hint / Retry·Solution·Analysis·Next / Retry·Analysis·Next. */
export function PuzzleFooter({
  status,
  onHint,
  onRetry,
  onSolution,
  onAnalysis,
  onNext,
  nextLabel,
}: {
  status: PuzzleStatus
  onHint: () => void
  onRetry: () => void
  onSolution: () => void
  onAnalysis: () => void
  onNext?: () => void
  nextLabel?: string
}) {
  if (status === 'wrong')
    return (
      <div className="cc-buttons">
        <CCButton kind="danger" icon="retry" title="Retry" onClick={onRetry} grow />
        <CCButton icon="solution" title="Show Solution" onClick={onSolution} grow />
        <CCButton icon="analysis" title="Analysis" onClick={onAnalysis} grow />
        {onNext && <CCButton icon="chevronRight" title="Next Puzzle" onClick={onNext} grow />}
      </div>
    )
  if (status === 'solved' || status === 'revealed')
    return (
      <div className="cc-buttons">
        <CCButton icon="retry" title="Retry" onClick={onRetry} grow />
        <CCButton icon="analysis" title="Analysis" onClick={onAnalysis} grow />
        {onNext && (
          <span className="cc-half">
            <CCButton kind="primary" icon="chevronRight" label={nextLabel} title="Next Puzzle" onClick={onNext} grow />
          </span>
        )}
      </div>
    )
  return (
    <div className="cc-buttons">
      <CCButton icon="bulb" label="Hint" onClick={onHint} grow disabled={status !== 'playing'} />
    </div>
  )
}

/** The narrow icon column chess.com puts between board and sidebar. */
export function BoardControls({ onFlip }: { onFlip?: () => void }) {
  return (
    <div className="cc-board-controls">
      <button title="Settings" onClick={() => window.dispatchEvent(new Event('open-settings'))}>
        <Glyph name="cog" size={20} />
      </button>
      {onFlip && (
        <button title="Flip board" onClick={onFlip}>
          <Glyph name="flip" size={20} />
        </button>
      )}
    </div>
  )
}
