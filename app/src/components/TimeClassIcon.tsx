import type { CcGame } from '../lib/ccGames'

const GLYPHS = { bullet: '\u1f1d', blitz: '\u1f1c', rapid: '\u1f1b', daily: '\u1f1a' }

export function TimeClassIcon({ timeClass }: { timeClass: CcGame['time_class'] }) {
  return <span className={`figurine games-time-glyph ${timeClass}`} role="img" aria-label={timeClass}>{GLYPHS[timeClass]}</span>
}
