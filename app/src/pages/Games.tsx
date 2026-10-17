import { useEffect, useState, type SyntheticEvent } from 'react'
import { fetchArchives, fetchMonth, formatTimeControl, outcome, type CcGame } from '../lib/ccGames'
import { useStored } from '../lib/storage'
import { openInReview } from './Review'
import { TimeClassIcon } from '../components/TimeClassIcon'
import { CcUsernameForm } from '../components/CcUsernameForm'

function monthLabel(url: string) {
  const match = url.match(/\/(\d{4})\/(\d{2})$/)
  if (!match) return url
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(
    new Date(Number(match[1]), Number(match[2]) - 1, 1),
  )
}

function GameRow({ game, username }: { game: CcGame; username: string }) {
  const result = outcome(game, username)
  const marker = result === 'win' ? '+' : result === 'loss' ? '−' : '='
  const normalized = username.trim().toLowerCase()
  const open = () => {
    openInReview(game, username)
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
        <TimeClassIcon timeClass={game.time_class} />
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
                setEditing(true)
              }}
            >
              Change
            </button>
          )}
        </div>

        {editing ? (
          <CcUsernameForm username={username} autoFocus onSubmit={(next) => {
            setUsername(next)
            setEditing(false)
            setError('')
          }} />
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
