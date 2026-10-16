import { useStored } from '../lib/storage'
import { pieceUrl } from '../lib/theme'
import { useStreak } from '../lib/streak'
import { PuzzleStreakIcon } from '../components/PuzzleSidebar'
import { bots } from '../lib/bots'
import { Avatar } from '../components/ui'
import { dailyStreak, todayKey } from './Daily'

export default function Home() {
  const [rating] = useStored('puzzleRating', 800)
  const [history] = useStored<{ solved: boolean }[]>('puzzleHistory', [])
  const [rush] = useStored<Record<string, number>>('rushBest', { '3min': 0, '5min': 0, survival: 0 })
  const [daily] = useStored<Record<string, boolean>>('dailyLog', {})
  const [records] = useStored<Record<string, { w: number }>>('botRecords', {})
  const beaten = bots.filter((b) => records[b.id]?.w).length
  const nextBot = bots.find((b) => !records[b.id]?.w) ?? bots[bots.length - 1]
  const doneToday = todayKey() in daily
  const streak = useStreak()

  return (
    <div className="page home">
      <h1>
        <img src={pieceUrl('wn')} alt="" className="home-logo" /> Welcome back
      </h1>
      <div className="home-grid">
        <a className="home-card hero" href="#/puzzles">
          <div className="card-icon">🧩</div>
          <div>
            <div className="card-title">Solve Puzzles</div>
            <div className="muted">Rating {rating} · {history.filter((h) => h.solved).length} solved</div>
            <div className={`home-streak ${streak.activeToday ? 'active' : ''}`}>
              <PuzzleStreakIcon streak={streak.current} size={20} daily />
              {!streak.activeToday && streak.current > 0 && <span className="muted"> · solve one today to keep it</span>}
            </div>
          </div>
        </a>
        <a className="home-card hero" href="#/bots">
          <Avatar emoji={nextBot.avatar} color={nextBot.color} size={56} />
          <div>
            <div className="card-title">Play Bots</div>
            <div className="muted">
              {beaten}/{bots.length} beaten · next up: {nextBot.name} ({nextBot.rating})
            </div>
          </div>
        </a>
        <a className="home-card" href="#/daily">
          <div className="card-icon">📅</div>
          <div>
            <div className="card-title">Daily Puzzle</div>
            <div className="muted">{doneToday ? 'Done for today ✓' : 'A new puzzle is waiting'} · 🔥 {dailyStreak(daily)}</div>
          </div>
        </a>
        <a className="home-card" href="#/rush">
          <div className="card-icon">⚡</div>
          <div>
            <div className="card-title">Puzzle Rush</div>
            <div className="muted">
              Best: 3m {rush['3min']} · 5m {rush['5min']} · Survival {rush.survival}
            </div>
          </div>
        </a>
        <a className="home-card" href="#/themes">
          <div className="card-icon">🎯</div>
          <div>
            <div className="card-title">Puzzle Themes</div>
            <div className="muted">Drill forks, pins, mates and more</div>
          </div>
        </a>
        <a className="home-card" href="#/analysis">
          <div className="card-icon">🔍</div>
          <div>
            <div className="card-title">Analysis Board</div>
            <div className="muted">Explore any position with Stockfish 19</div>
          </div>
        </a>
      </div>
    </div>
  )
}
