import { useEffect, useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { BoardPreview } from '../components/BoardPreview'
import { CcUsernameForm } from '../components/CcUsernameForm'
import { CcGlyph, type CcGlyphName } from '../components/glyphs'
import { TimeClassIcon } from '../components/TimeClassIcon'
import { fetchArchives, fetchAvatar, fetchMonth, fetchStats, formatTimeControl, outcome, type CcGame, type CcStats } from '../lib/ccGames'
import { dailyPuzzle, loadPuzzles, pickPuzzle, themeLabels, type Puzzle } from '../lib/puzzles'
import { loadReview, reviewKey } from '../lib/reviewCache'
import { dayKey, useStreak } from '../lib/streak'
import { useStored } from '../lib/storage'
import { pieceUrl } from '../lib/theme'
import { openInReview } from './Review'

const START = new Chess().fen()

function UserAvatar({ username, size = 32 }: { username: string; size?: number }) {
  const [avatar, setAvatar] = useState<{ username: string; src: string | null } | null>(null)
  useEffect(() => {
    if (!username) return
    let active = true
    fetchAvatar(username).then((src) => {
      if (active) setAvatar({ username, src })
    }).catch(() => { /* A pawn is the fallback when the profile is unavailable. */ })
    return () => { active = false }
  }, [username])
  const src = avatar?.username === username ? avatar.src : null
  return <img className="home-avatar" src={src || pieceUrl('wp')} alt="" width={size} height={size} loading="lazy" onError={() => {
    if (src) setAvatar({ username, src: null })
  }} />
}

function gamePosition(game: CcGame) {
  try {
    const chess = new Chess()
    chess.loadPgn(game.pgn)
    return { fen: chess.fen(), moves: Math.ceil(chess.history().length / 2) }
  } catch {
    return { fen: game.initial_setup || START, moves: 0 }
  }
}

function PuzzlePreview({ puzzle }: { puzzle: Puzzle | null }) {
  if (!puzzle) return <div className="home-preview-placeholder" role="status">Puzzle preview unavailable</div>
  const chess = new Chess(puzzle.fen)
  const move = puzzle.moves[0]
  try {
    chess.move({ from: move.slice(0, 2), to: move.slice(2, 4), promotion: move[4] })
  } catch { /* Keep the original puzzle position if a move is unavailable. */ }
  return <BoardPreview fen={chess.fen()} orientation={chess.turn() === 'w' ? 'white' : 'black'} />
}

function themeTitle(puzzle: Puzzle | null) {
  const theme = puzzle?.themes.find((key) => themeLabels[key])
  return theme ? themeLabels[theme] : 'Puzzle Themes'
}

function useHomeAccount(username: string, attempt: number) {
  const [archive, setArchive] = useState<{ username: string; attempt: number; games: CcGame[]; error: string } | null>(null)
  const [ratings, setRatings] = useState<{ username: string; attempt: number; stats: CcStats | null; error: string } | null>(null)
  useEffect(() => {
    if (!username) return
    let active = true
    const recent = async () => {
      try {
        const archives = await fetchArchives(username)
        const games: CcGame[] = []
        for (const url of archives) {
          if (!active) return
          games.push(...await fetchMonth(url))
          if (games.length >= 10) break
        }
        games.sort((a, b) => b.end_time - a.end_time)
        if (active) setArchive({ username, attempt, games: games.slice(0, 10), error: '' })
      } catch (reason) {
        if (active) setArchive({ username, attempt, games: [], error: reason instanceof Error ? reason.message : 'Could not load games' })
      }
    }
    void recent()
    fetchStats(username).then((stats) => {
      if (active) setRatings({ username, attempt, stats, error: '' })
    }).catch(() => {
      if (active) setRatings({ username, attempt, stats: null, error: 'Could not load chess.com ratings.' })
    })
    return () => { active = false }
  }, [username, attempt])
  const current = archive?.username === username && archive.attempt === attempt ? archive : null
  const currentRatings = ratings?.username === username && ratings.attempt === attempt ? ratings : null
  return { games: current?.games ?? [], error: current?.error ?? '', loading: !!username && !current, stats: currentRatings?.stats, statsError: currentRatings?.error }
}

function HistoryRow({ game, username }: { game: CcGame; username: string }) {
  const result = outcome(game, username)
  const scores = game.white.result === 'win' ? ['1', '0'] : game.black.result === 'win' ? ['0', '1'] : ['½', '½']
  const review = loadReview(reviewKey(game.pgn, game.url))
  const { moves } = gamePosition(game)
  const open = () => openInReview(game, username)
  return <tr tabIndex={0} aria-label={`${game.white.username} vs ${game.black.username}, ${result}; open Game Review`} onClick={open} onKeyDown={(event) => {
    if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return
    event.preventDefault()
    open()
  }}>
    <td><div className="home-history-time"><TimeClassIcon timeClass={game.time_class} /><span>{formatTimeControl(game.time_control)}</span></div></td>
    <td className="home-history-players">{(['white', 'black'] as const).map((color) => <div key={color}>
      <UserAvatar username={game[color].username} size={24} />
      <span className={`home-player-square ${color}`} aria-label={color} />
      <span className="home-player-name" title={game[color].username}>{game[color].username} <span className="home-player-rating">({game[color].rating})</span></span>
    </div>)}</td>
    <td><div className="home-history-result"><div className="home-stacked"><span>{scores[0]}</span><span>{scores[1]}</span></div>
      {result === 'draw' ? <span className="home-draw" aria-label="draw">=</span> : <CcGlyph name={result === 'win' ? 'square-fill-plus' : 'square-fill-minus'} size={16} />}
    </div></td>
    <td>{review ? <div className="home-stacked home-accuracy"><span>{review.accuracy.w.toFixed(1)}</span><span>{review.accuracy.b.toFixed(1)}</span></div> : <button className="cc-button cc-secondary home-review-button" onClick={(event) => { event.stopPropagation(); open() }}>Review</button>}</td>
    <td className="home-moves">{moves}</td>
    <td className="home-history-date">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(game.end_time * 1000))}</td>
  </tr>
}

function StatRow({ glyph, label, value }: { glyph: CcGlyphName; label: string; value: number | string }) {
  return <div className="home-stat-row"><CcGlyph name={glyph} /><span>{label}</span><strong>{value}</strong></div>
}

export default function Home() {
  const [storedUsername, setUsername] = useStored('ccUsername', '')
  const username = storedUsername.trim()
  const [rating] = useStored('puzzleRating', 800)
  const [history] = useStored<{ id: string; solved: boolean }[]>('puzzleHistory', [])
  const [daily] = useStored<Record<string, boolean>>('dailyLog', {})
  const [records] = useStored<Record<string, { w: number }>>('botRecords', {})
  const [solveLog] = useStored<Record<string, number>>('solveLog', Object.fromEntries(Object.entries(daily).filter(([, solved]) => solved).map(([date]) => [date, 1])))
  const streak = useStreak()
  const [all, setAll] = useState<Puzzle[]>([])
  const [puzzleError, setPuzzleError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const account = useHomeAccount(username, attempt)
  useEffect(() => {
    let active = true
    loadPuzzles().then((puzzles) => { if (active) setAll(puzzles) }).catch(() => {
      if (active) setPuzzleError('Puzzle previews could not be loaded. You can still open the puzzle pages.')
    })
    return () => { active = false }
  }, [])
  const previews = useMemo(() => {
    const exclude = new Set(history.filter((item) => item.solved).map((item) => item.id))
    const next = pickPuzzle(all, rating, exclude)
    const themed = pickPuzzle(all, rating, exclude, (p) => p.id !== next?.id && p.themes.some((theme) => !!themeLabels[theme]))
    return { next, themed, daily: all.length ? dailyPuzzle(all) ?? null : null }
  }, [all, rating, history])
  const latest = account.games[0]
  const lastPosition = useMemo(() => latest ? gamePosition(latest) : null, [latest])
  const opponent = latest ? (latest.white.username.toLowerCase() === username.toLowerCase() ? latest.black.username : latest.white.username) : ''
  const [days] = useState(() => Array.from({ length: 5 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - 4 + index)
    return { key: dayKey(date), label: date.toLocaleDateString('en-US', { weekday: 'narrow' }), date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) }
  }))

  return <div className="page home-page">
    <header className="home-header">
      <div className="home-profile"><UserAvatar username={username} /><h1>{username || 'Guest'}</h1></div>
      <div className="home-header-streak"><CcGlyph name="element-fire-blank" size={32} /><strong>{streak.current} {streak.current === 1 ? 'Day' : 'Days'}</strong></div>
    </header>
    <div className="home-dashboard">
      <section className="cc-section home-hero" aria-label="Recommended activities">
        <div className="home-play">
          <h2>Play</h2>
          <a className="cc-button cc-primary cc-button-primary" href="#/bots">Start Game</a>
          <div className="home-play-links">
            <a className="cc-button cc-secondary" href="#/bots"><CcGlyph name="board" />Play Bots</a>
            <a className="cc-button cc-secondary" href="#/friend"><CcGlyph name="hand-pawn" />Play a Friend</a>
            <a className="cc-button cc-secondary" href="#/rush"><CcGlyph name="game-type-puzzle" />Puzzle Rush</a>
          </div>
        </div>
        <article className="home-activity">
          <a href="#/puzzles" aria-label="Open rated puzzles"><PuzzlePreview puzzle={previews.next} /></a>
          <div className="home-activity-body">
            <div className="home-puzzle-stats"><CcGlyph name="game-type-puzzle" color="#FFA459" /><strong>{rating.toLocaleString()}</strong><span className="home-puzzle-streak"><CcGlyph name="element-fire-blank" size={16} />{streak.current}</span></div>
            <div className="home-puzzle-progress" role="progressbar" aria-label="Today's puzzle solves" aria-valuenow={Math.min(streak.today, 10)} aria-valuemin={0} aria-valuemax={10}><span style={{ width: `${Math.min(streak.today / 10, 1) * 100}%` }} /></div>
            <a className="cc-button cc-secondary" href="#/puzzles">Solve Puzzles</a>
          </div>
        </article>
        <article className="home-activity">
          <a href="#/themes" aria-label="Open puzzle themes"><PuzzlePreview puzzle={previews.themed} /></a>
          <div className="home-activity-body"><div className="home-activity-label"><CcGlyph name="game-lesson" color="#5DADCE" /><strong>{themeTitle(previews.themed)}</strong></div><a className="cc-button cc-secondary" href="#/themes">Practice Theme</a></div>
        </article>
        <article className="home-activity">
          {latest && lastPosition ? <>
            <button className="home-preview-button" aria-label={`Review last game vs ${opponent}`} onClick={() => openInReview(latest, username)}><BoardPreview fen={lastPosition.fen} orientation={latest.black.username.toLowerCase() === username.toLowerCase() ? 'black' : 'white'} /></button>
            <div className="home-activity-body"><div className="home-activity-label"><UserAvatar username={opponent} /><strong title={`vs ${opponent}`}>vs {opponent}</strong></div><button className="cc-button cc-secondary" onClick={() => openInReview(latest, username)}>Review Game</button></div>
          </> : <>
            <div className="home-last-empty"><CcGlyph name="board" size={56} /><strong>{account.loading ? 'Loading last game…' : account.error ? 'Games unavailable' : username ? 'No games yet' : 'Import your games'}</strong></div>
            <div className="home-activity-body"><p className="muted">{username ? 'Your latest chess.com game will appear here.' : 'Connect your chess.com username to get started.'}</p><a className="cc-button cc-secondary" href="#/games">{username ? 'My Games' : 'Import your games'}</a></div>
          </>}
        </article>
      </section>

      <section className="cc-section home-history" aria-labelledby="home-history-title">
        <header className="home-section-header"><h2 id="home-history-title">Game History</h2>{username && <a className="muted small" href="#/games">{username}</a>}</header>
        {!username ? <div className="home-history-empty"><p className="muted">Import your chess.com games to review your play.</p><CcUsernameForm onSubmit={setUsername} /></div> : account.loading ? <p className="games-message" role="status">Loading games…</p> : account.error ? <div className="home-history-empty"><p className="error" role="alert">{account.error}</p><CcUsernameForm key={username} username={username} onSubmit={(next) => { setUsername(next); setAttempt((n) => n + 1) }} /></div> : account.games.length ? <div className="home-history-scroll">
          <table className="home-history-table"><thead><tr><th aria-label="Time control" /><th>Players</th><th>Result</th><th>Accuracy</th><th>Moves</th><th>Date</th></tr></thead><tbody>{account.games.map((game) => <HistoryRow key={game.url} game={game} username={username} />)}</tbody></table>
        </div> : <p className="games-message">No chess.com games yet. Play a game, then check back here.</p>}
        <a className="home-history-footer" href="#/games">View All Games <CcGlyph name="arrow-chevron-right" size={12} /></a>
      </section>

      <aside className="home-rail">
        <section className="cc-section home-daily">
          <header className="home-section-header"><h2>Daily Puzzle</h2></header>
          <div className="home-daily-body"><a href="#/daily" aria-label="Open today's daily puzzle"><PuzzlePreview puzzle={previews.daily} /></a><strong className="home-daily-title">{themeTitle(previews.daily)}</strong><a className="cc-button cc-primary cc-button-primary" href="#/daily">{daily[dayKey()] ? 'Solved ✓' : 'Solve Daily Puzzle'}</a></div>
        </section>
        <section className="cc-section home-streak-card">
          <CcGlyph name="element-fire-blank" size={40} /><div><h2>{streak.current} Day Streak</h2><div className="home-week">{days.map((day) => <div key={day.key} title={`${day.date}: ${solveLog[day.key] ? 'solved' : 'no solves'}`} aria-label={`${day.date}: ${solveLog[day.key] ? 'solved' : 'no solves'}`}><span>{day.label}</span><span className={`home-day-check ${solveLog[day.key] ? 'solved' : ''}`}>{solveLog[day.key] ? '✓' : ''}</span></div>)}</div></div>
        </section>
        <section className="cc-section home-stats">
          <a className="home-section-header" href="#/stats"><h2>Stats</h2><CcGlyph name="arrow-chevron-right" size={16} /></a>
          <StatRow glyph="game-type-puzzle" label="Puzzles solved" value={history.filter((item) => item.solved).length.toLocaleString()} />
          <StatRow glyph="circle-fill-star" label="Puzzle rating" value={rating.toLocaleString()} />
          <StatRow glyph="board" label="Bots beaten" value={Object.values(records).filter((record) => record.w > 0).length} />
          {username && <>{(['rapid', 'blitz', 'bullet', 'daily'] as const).map((timeClass) => <StatRow key={timeClass} glyph={`game-time-${timeClass}`} label={timeClass[0].toUpperCase() + timeClass.slice(1)} value={account.stats?.[`chess_${timeClass}`]?.last?.rating?.toLocaleString() ?? '-'} />)}{account.statsError && <div className="home-stats-error"><p className="muted small" role="status">{account.statsError}</p><button className="cc-button cc-secondary home-review-button" onClick={() => setAttempt((n) => n + 1)}>Try again</button></div>}</>}
        </section>
      </aside>
    </div>
    {puzzleError && <p className="muted small" role="status">{puzzleError}</p>}
  </div>
}
