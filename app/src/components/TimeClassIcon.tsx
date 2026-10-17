import type { CcGame } from '../lib/ccGames'
import { CcGlyph } from './glyphs'

export function TimeClassIcon({ timeClass }: { timeClass: CcGame['time_class'] }) {
  return <span className={`games-time-glyph ${timeClass}`} role="img" aria-label={timeClass}><CcGlyph name={`game-time-${timeClass}`} /></span>
}
