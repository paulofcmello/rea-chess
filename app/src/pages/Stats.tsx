import { useEffect, useState } from 'react'
import { TimeClassIcon } from '../components/TimeClassIcon'
import { TIME_CLASSES, fetchArchives, fetchMonth, fetchStats, outcome, type CcGame, type CcStats, type TimeClassStats } from '../lib/ccGames'
import { useStored } from '../lib/storage'
import { openInReview } from './Review'

function StatsCard({ timeClass, stats }: { timeClass: CcGame['time_class']; stats?: TimeClassStats }) {
  const { win = 0, loss = 0, draw = 0 } = stats?.record ?? {}
  const total = win + loss + draw
  return <section className="stats-card">
    <h2><TimeClassIcon timeClass={timeClass} />{timeClass}</h2>
    <div className="stats-rating">{stats?.last?.rating ?? '—'}</div>
    <p className="muted">Best <strong>{stats?.best?.rating ?? '—'}</strong></p>
    <div className="stats-record"><span className="win">{win} W</span><span className="draw">{draw} D</span><span className="loss">{loss} L</span></div>
    <div className="stats-record-bar" role="img" aria-label={`${win} wins, ${draw} draws, ${loss} losses`}>
      {total > 0 && <><span className="win" style={{ width: `${win / total * 100}%` }} /><span className="draw" style={{ width: `${draw / total * 100}%` }} /><span className="loss" style={{ width: `${loss / total * 100}%` }} /></>}
    </div>
    {!stats && <p className="muted small">No games played</p>}
  </section>
}

function RatingGraph({ games, username }: { games: CcGame[]; username: string }) {
  if (!games.length) return <p className="games-message">No games for this time class in the last six archives.</p>
  const ratings = games.map((game) => game.white.username.toLowerCase() === username.trim().toLowerCase() ? game.white.rating : game.black.rating)
  const min = Math.min(...ratings)
  const max = Math.max(...ratings)
  const low = min === max ? min - 1 : min
  const high = min === max ? max + 1 : max
  const x = (i: number) => games.length === 1 ? 395 : 60 + i / (games.length - 1) * 670
  const y = (rating: number) => 210 - (rating - low) / (high - low) * 180
  return <svg className="stats-graph" viewBox="0 0 760 260" role="img" aria-label={`Rating history over ${games.length} games, from ${ratings[0]} to ${ratings.at(-1)}; lowest ${min}, highest ${max}`}>
    {[low, Math.round((low + high) / 2), high].map((rating, i) => <g key={i}>
      <line x1="60" x2="730" y1={y(rating)} y2={y(rating)} />
      <text x="48" y={y(rating) + 5} textAnchor="end">{rating}</text>
    </g>)}
    <polyline points={ratings.map((rating, i) => `${x(i)},${y(rating)}`).join(' ')} />
    {ratings.map((rating, i) => <circle key={games[i].url} cx={x(i)} cy={y(rating)} r="3"><title>{new Date(games[i].end_time * 1000).toLocaleDateString()}: {rating}</title></circle>)}
    <text x={x(0)} y="238" textAnchor="middle">1</text>
    {games.length > 1 && <text x={x(games.length - 1)} y="238" textAnchor="middle">{games.length}</text>}
    <text x="395" y="255" textAnchor="middle">Game</text>
  </svg>
}

export default function Stats() {
  const [username] = useStored('ccUsername', '')
  const [stats, setStats] = useState<CcStats | null>(null)
  const [games, setGames] = useState<CcGame[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingGames, setLoadingGames] = useState(true)
  const [statsError, setStatsError] = useState('')
  const [gamesError, setGamesError] = useState('')
  const [timeClass, setTimeClass] = useState<CcGame['time_class']>('blitz')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!username.trim()) return
    let active = true
    const run = async () => {
      await Promise.resolve()
      if (!active) return
      setStats(null)
      setGames([])
      setStatsError('')
      setGamesError('')
      setLoadingStats(true)
      setLoadingGames(true)
      await Promise.allSettled([
        (async () => {
          try {
            const next = await fetchStats(username)
            if (active) setStats(next)
          } catch (reason) {
            if (active) setStatsError(reason instanceof Error ? reason.message : 'Could not load stats')
          } finally { if (active) setLoadingStats(false) }
        })(),
        (async () => {
          try {
            const archives = await fetchArchives(username)
            const months = await Promise.all(archives.slice(0, 6).map(fetchMonth))
            if (active) setGames(months.flat().sort((a, b) => a.end_time - b.end_time))
          } catch (reason) {
            if (active) setGamesError(reason instanceof Error ? reason.message : 'Could not load rating history')
          } finally { if (active) setLoadingGames(false) }
        })(),
      ])
    }
    void run()
    return () => { active = false }
  }, [username, attempt])

  if (!username.trim()) return <div className="page games-page"><div className="games-panel"><h1>Stats</h1><p>Set your chess.com username in <a href="#/games">My Games</a> to see your stats.</p></div></div>
  const selectedGames = games.filter((game) => game.time_class === timeClass)
  return <div className="page games-page stats-page">
    <header className="games-header"><h1>Stats</h1><a className="games-username" href="#/games">{username}</a></header>
    {loadingStats ? <p className="games-message" role="status">Loading stats…</p> : statsError ? <p className="error" role="alert">{statsError}</p> : <div className="stats-cards">{TIME_CLASSES.map((value) => <StatsCard key={value} timeClass={value} stats={stats?.[`chess_${value}`]} />)}</div>}
    <section className="games-panel stats-history">
      <h2>Rating history</h2><p className="muted small">Last six monthly archives</p>
      <div className="stats-tabs" role="tablist" aria-label="Time class">{TIME_CLASSES.map((value) => <button id={`stats-tab-${value}`} key={value} role="tab" aria-selected={timeClass === value} aria-controls="stats-rating-panel" className={`cc-button cc-secondary ${timeClass === value ? 'active' : ''}`} onClick={() => setTimeClass(value)}><TimeClassIcon timeClass={value} />{value}</button>)}</div>
      <div id="stats-rating-panel" role="tabpanel" aria-labelledby={`stats-tab-${timeClass}`}>
        {loadingGames ? <p className="games-message" role="status">Loading rating history…</p> : gamesError ? <p className="error" role="alert">{gamesError}</p> : <RatingGraph games={selectedGames} username={username} />}
      </div>
    </section>
    {!loadingGames && !gamesError && <section className="games-panel"><h2>Recent results</h2>
      {games.length ? <div className="stats-recent">{games.slice(-10).reverse().map((game) => {
        const result = outcome(game, username)
        const opponent = game.white.username.toLowerCase() === username.trim().toLowerCase() ? game.black.username : game.white.username
        const label = `${result} vs ${opponent} · ${game.time_class} · ${new Date(game.end_time * 1000).toLocaleDateString()}`
        return <button key={game.url} className={`stats-result ${result}`} title={label} aria-label={`${label}; open Game Review`} onClick={() => openInReview(game, username)}>{result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D'}</button>
      })}</div> : <p className="muted">No recent games</p>}
    </section>}
    {(statsError || gamesError) && <button className="cc-button cc-secondary" onClick={() => setAttempt((n) => n + 1)}>Try again</button>}
  </div>
}
