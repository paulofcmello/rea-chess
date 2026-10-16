// chess.com puzzle sidebar (header, coach speech bubble, footer buttons). Structure, sizes and
// colours mirror the live /puzzles/rated DOM captured with REA.
import type { ReactNode } from 'react'
import { CoachAvatar, type CoachEmotion } from './Coach'
import { Glyph, type GlyphName } from './glyphs'
import { streakColor, useRatedRun, useStreak } from '../lib/streak'

export const ICONS = 'https://assets-ds.chess.com/color-icons'

const CORRECT_ICON = (
  <svg width="24" height="24" viewBox="0 0 18 19" aria-hidden="true">
    <path opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z" />
    <path fill="#81b64c" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z" />
    <path fill="#fff" d="M15.11,6.31,9.45,12,7.79,13.63a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.28A.39.39,0,0,1,2.78,9a.39.39,0,0,1,.11-.27L4.28,7.35a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09L7.52,10l5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.31Z" />
  </svg>
)
const INCORRECT_ICON = (
  <svg width="24" height="24" viewBox="0 0 18 19" aria-hidden="true">
    <path opacity="0.3" d="M9,.5C4.03,.5,0,4.53,0,9.5s4.03,9,9,9,9-4.03,9-9S13.97,.5,9,.5Z" />
    <path fill="#FF7769" d="M9,0C4.03,0,0,4.03,0,9s4.03,9,9,9,9-4.03,9-9S13.97,0,9,0Z" />
    <path fill="#f1f2f2" d="M13.99,12.01s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-1.37,1.37s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-3.06-3.06-3.06,3.06s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-1.37-1.37c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l3.06-3.06-3.06-3.06c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l1.37-1.37c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l3.06,3.06,3.06-3.06c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l1.37,1.37s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-3.06,3.06,3.06,3.06Z" />
  </svg>
)

export function SidebarShell({
  title,
  icon = 'puzzle-piece',
  onBack,
  children,
  footer,
}: {
  title: string
  icon?: string
  onBack?: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <section className="cc-sidebar">
      <header className="cc-sidebar-header">
        <button className="cc-sidebar-header-icon-start" aria-label="Back" onClick={onBack ?? (() => (location.hash = '#/'))}>
          <Glyph name="back" size={20} />
        </button>
        <div className="cc-sidebar-header-center">
          <img src={`${ICONS}/${icon}.svg`} width={40} height={40} alt="" />
          <h1 className="cc-sidebar-header-title">{title}</h1>
        </div>
        <span className="cc-sidebar-header-icon-end">
          <Glyph name="speaker" size={20} />
        </span>
      </header>
      <div className="cc-sidebar-body">{children}</div>
      {footer && <div className="cc-sidebar-footer">{footer}</div>}
    </section>
  )
}

/** chess.com puzzle-streak-icon: flame glyph coloured by streak length, number, and "N days". */
export function PuzzleStreakIcon({ streak, size = 24, daily }: { streak: number; size?: number; daily?: boolean }) {
  const heading = size <= 24 ? 'xx-small' : size <= 40 ? 'small' : 'medium'
  return (
    <div className="puzzle-streak-icon" style={{ color: streakColor(streak) }}>
      <span className="puzzle-streak-icon-icon" key={streak}>
        <Glyph name="flame" size={size} />
      </span>
      <span className={`puzzle-streak-icon-text heading-${heading}`}>
        <span>{streak}</span>
        {daily && <span>{streak === 1 ? 'day' : 'days'}</span>}
      </span>
    </div>
  )
}

/** Day streak shown in the puzzle sidebars. */
export function StreakRow() {
  const { current, activeToday } = useStreak()
  return (
    <div className={`day-streak ${activeToday ? '' : 'inactive'}`} title={activeToday ? 'Puzzle streak extended today' : 'Solve a puzzle today to keep your streak'}>
      <PuzzleStreakIcon streak={current} daily />
    </div>
  )
}

/** chess.com rated-streak-info: "N in a row!" with an encouragement line, shown from 2 solves in a row. */
export function RatedStreakInfo() {
  const run = useRatedRun()
  if (!run) return null
  return (
    <div className="rated-streak-info">
      <div className="rated-streak-info-icon" style={{ color: run.color }}>
        <Glyph name="flame" size={40} />
      </div>
      <div>
        <div className="rated-streak-info-current" style={{ color: run.color }}>
          {run.phrase}
        </div>
        <div className="rated-streak-info-remaining">{run.encouragement}</div>
      </div>
    </div>
  )
}

export type FeedbackKind = 'white' | 'black' | 'correct' | 'incorrect'

export function CoachSpeech({
  kind,
  title,
  text,
  emotion,
  muted,
}: {
  kind: FeedbackKind
  title: string
  text?: string
  emotion: CoachEmotion
  muted?: boolean
}) {
  return (
    <div className="coach">
      <div className="coach-avatar">
        <CoachAvatar emotion={emotion} />
      </div>
      <div className={`coach-bubble ${muted ? 'muted' : ''}`}>
        <svg className="coach-bubble-tip" width="15" height="22" viewBox="0 0 15 22" aria-hidden="true">
          <path d="M0 14C8.4 14 12.8333 4.66667 15 0V22C15 22 3.5 22 0 14Z" />
        </svg>
        <div className="coach-feedback">
          {kind === 'correct' ? (
            CORRECT_ICON
          ) : kind === 'incorrect' ? (
            INCORRECT_ICON
          ) : (
            <span className={`coach-feedback-color ${kind}`} />
          )}
          <span className="coach-feedback-title">{title}</span>
        </div>
        {text && <div className="coach-speech">{text}</div>}
      </div>
    </div>
  )
}

export function CCButton({
  kind = 'secondary',
  icon,
  label,
  title,
  onClick,
  grow,
  disabled,
}: {
  kind?: 'primary' | 'secondary' | 'danger'
  icon?: GlyphName
  label?: string
  title?: string
  onClick?: () => void
  grow?: boolean
  disabled?: boolean
}) {
  return (
    <button className={`cc-button cc-${kind} ${grow ? 'grow' : ''}`} onClick={onClick} aria-label={title ?? label} title={title} disabled={disabled}>
      {icon && <Glyph name={icon} />}
      {label && <span>{label}</span>}
    </button>
  )
}
