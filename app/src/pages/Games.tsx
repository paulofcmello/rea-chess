import { useEffect, useState, type SyntheticEvent } from 'react'
import { fetchArchives, fetchMonth, gameToAnalysis, outcome, type CcGame } from '../lib/ccGames'
import { useStored } from '../lib/storage'
import { openInAnalysis } from './Analysis'

const TIME_ICONS = 'https://assets-ds.chess.com/color-icons'

function monthLabel(url: string) {
  const match = url.match(/\/(\d{4})\/(\d{2})$/)
  if (!match) return url
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
    new Date(Number(match[1]), Number(match[2]) - 1, 1),
  )
}

function formatTimeControl(value: string) {
  if (value.includes('/')) {
    const [moves, seconds] = value.split('/').map(Number)
    if (moves === 1 && Number.isFinite(seconds)) {
      const days = seconds / 86_400
      return `${days} ${days === 1 ? 'day' : 'days'}`
    }
  }
  if (value.includes('+')) {
    const [seconds, increment] = value.split('+')
    return `${Number(seconds) / 60} | ${increment}`
  }
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return `${seconds / 60} min`
  return value
}

function TimeClass({ game }: { game: CcGame }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="games-time-fallback">{game.time_class}</span>
  return (
    <img
      className="games-time-icon"
      src={`${TIME_ICONS}/${game.time_class}.svg`}
      alt={game.time_class}
      onError={() => setFailed(true)}
    />
  )
}

function GameRow({ game, username }: { game: CcGame; username: string }) {
  const result = outcome(game, username)
  const marker = result === 'win' ? '+' : result === 'loss' ? '−' : '='
  const normalized = username.trim().toLowerCase()
  const open = () => {
    const analysis = gameToAnalysis(game, username)
    openInAnalysis(analysis.fen, analysis.sans, analysis.orientation)
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    open()
  }
  const stop = (event: SyntheticEvent) => event.stopPropagation()

  return (
    <div className="games-row" role="button" tabIndex={0} onClick={open} onKeyDown={onKeyDown}>
      <span className={`games-result ${result}`} aria-label={result}>{marker}</span>
      <span className="games-time">
        <TimeClass game={game} />
        <span>{formatTimeControl(game.time_control)}</span>
      </span>
      <span className="games-players">
        <span className={game.white.username.toLowerCase() === normalized ? 'games-me' : ''}>
          {game.white.username} <span className="games-rating">({game.white.rating})</span>
        </span>
        <span className="games-vs">vs</span>
        <span className={game.black.username.toLowerCase() === normalized ? 'games-me' : ''}>
          {game.black.username} <span className="games-rating">({game.black.rating})</span>
        </span>
      </span>
      <span className="games-date">
        {new Intl.DateTimeFormat(undefined, { dateStyle: 'short' }).format(new Date(game.end_time * 1000))}
      </span>
      <a className="games-external" href={game.url} target="_blank" rel="noreferrer" onClick={stop} onKeyDown={stop}>
        chess.com ↗
      </a>
    </div>
  )
}

export default function Games() {
  const [username, setUsername] = useStored('ccUsername', '')
  const [draft, setDraft] = useState(username)
  const [editing, setEditing] = useState(!username)
  const [archives, setArchives] = useState<string[]>([])
  const [month, setMonth] = useState('')
  const [games, setGames] = useState<CcGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!username || editing) return
    let current = true
    const load = async () => {
      await Promise.resolve()
      if (!current) return
      setLoading(true)
      setError('')
      setArchives([])
      setMonth('')
      setGames([])
      try {
        const next = await fetchArchives(username.trim().toLowerCase())
        if (!current) return
        setArchives(next)
        setMonth(next[0] ?? '')
        if (!next.length) setLoading(false)
      } catch (reason) {
        if (!current) return
        setError(reason instanceof Error ? reason.message : 'Could not load games')
        setEditing(true)
        setLoading(false)
      }
    }
    void load()
    return () => {
      current = false
    }
  }, [username, editing])

  useEffect(() => {
    if (!month || editing) return
    let current = true
    const load = async () => {
      await Promise.resolve()
      if (!current) return
      setLoading(true)
      setError('')
      setGames([])
      try {
        const next = await fetchMonth(month)
        if (current) setGames(next)
      } catch (reason) {
        if (!current) return
        setError(reason instanceof Error ? reason.message : 'Could not load games')
        setEditing(true)
      } finally {
        if (current) setLoading(false)
      }
    }
    void load()
    return () => {
      current = false
    }
  }, [month, editing])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next = draft.trim()
    if (!next) return
    setUsername(next)
    setEditing(false)
    setError('')
  }

  return (
    <div className="page games-page">
      <div className="games-panel">
        <div className="games-header">
          <div>
            <h1>My Games</h1>
            {!editing && <div className="games-username">{username}</div>}
          </div>
          {!editing && (
            <button
              className="btn secondary"
              onClick={() => {
                setDraft(username)
                setEditing(true)
              }}
            >
              Change
            </button>
          )}
        </div>

        {editing ? (
          <form className="games-form" onSubmit={submit}>
            <label htmlFor="games-username">Chess.com username</label>
            <div className="games-form-row">
              <input
                id="games-username"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
              />
              <button className="btn primary" type="submit" disabled={!draft.trim()}>Load games</button>
            </div>
          </form>
        ) : (
          archives.length > 0 && (
            <label className="games-month">
              <span>Month</span>
              <select value={month} onChange={(event) => setMonth(event.target.value)}>
                {archives.map((archive) => <option key={archive} value={archive}>{monthLabel(archive)}</option>)}
              </select>
            </label>
          )
        )}

        {error && <div className="games-message error">{error}</div>}
        {loading && <div className="games-message">Loading games…</div>}
        {!editing && !loading && !error && games.length === 0 && (
          <div className="games-message">No games this month</div>
        )}
        {!editing && !loading && games.length > 0 && (
          <div className="games-list">
            {games.map((game) => <GameRow key={game.url} game={game} username={username} />)}
          </div>
        )}
      </div>
    </div>
  )
}
