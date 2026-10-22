import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchArchives, fetchMonth, fetchStats, type CcGame, type CcStats } from '../lib/ccGames'
import { archiveInWindow, gameProfileSummary, PROFILE_PERIODS, profileGames, profileRating, profileWindow, puzzleProfileSummary, type ProfilePeriod, type ProfileWindow, type PuzzleAttempt } from '../lib/profileStats'
import { useStored } from '../lib/storage'

const ICONS = 'https://assets-ds.chess.com/color-icons'
const TYPES = ['All Stats', 'Rapid', 'Blitz', 'Bullet', 'Daily', 'Puzzles', 'Tournaments'] as const
type StatType = typeof TYPES[number]
const ROWS = [
  { type: 'Rapid', timeClass: 'rapid', icon: 'time-rapid' },
  { type: 'Blitz', timeClass: 'blitz', icon: 'time-blitz' },
  { type: 'Daily', timeClass: 'daily', icon: 'time-daily' },
  { type: 'Bullet', timeClass: 'bullet', icon: 'time-bullet' },
  { type: 'Puzzles', icon: 'puzzle-piece' },
  { type: 'Tournaments', icon: 'tournament-gold' },
] as const
const format = (value: number | null) => value == null ? '-' : value.toLocaleString()

function Chevron({ down = false }: { down?: boolean }) {
  return <svg className="profile-stats-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d={down ? 'm6 9 6 6 6-6' : 'm9 6 6 6-6 6'} /></svg>
}

function Dropdown<T extends string>({ label, value, icon, options, open, onToggle, onSelect, onClose }: { label: string; value: T; icon: string; options: readonly T[]; open: boolean; onToggle: () => void; onSelect: (value: T) => void; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
    const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) onClose() }
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose(); trigger.current?.focus() } }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [open, onClose])
  return <div className="profile-stats-dropdown" ref={root}>
    <button ref={trigger} className="profile-stats-dropdown-button stats-dropdown-button" aria-label={`${label}: ${value}`} aria-haspopup="menu" aria-expanded={open} onClick={onToggle}><img src={`${ICONS}/${icon}.svg`} width="32" height="32" alt="" /><span>{value}</span><Chevron down /></button>
    {open && <div className="profile-stats-menu" role="menu" aria-label={label} onKeyDown={e => {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault()
        const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button')]
        const index = items.indexOf(document.activeElement as HTMLButtonElement)
        items[e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
      } else if (e.key === 'Tab') onClose()
    }}>{options.map(option => <button key={option} role="menuitemradio" aria-checked={value === option} onClick={() => { onSelect(option); onClose(); trigger.current?.focus() }}>{option}</button>)}</div>}
  </div>
}

/** Load the window, then walk back only until each active class has a baseline. */
async function loadProfileGames(username: string, window: ProfileWindow): Promise<CcGame[]> {
  const [urls, stats] = await Promise.all([fetchArchives(username), fetchStats(username).catch(() => null)])
  const archives = urls.slice().sort().reverse()
  const month = (url: string) => fetchMonth(url, false, { importGames: false })
  if (window.start == null) return archives.length ? month(archives.at(-1)!) : []
  const current = archives.filter(url => archiveInWindow(url, window))
  const games = (await Promise.all(current.map(month))).flat()
  const active = new Set(profileGames(games, username).filter(g => g.end_time * 1000 >= window.start! && g.end_time * 1000 <= window.end).map(g => g.time_class))
  const needsBaseline = () => {
    const history = profileGames(games, username)
    return [...active].some(tc => {
      const own = history.filter(g => g.time_class === tc)
      const record = stats?.[`chess_${tc}`]?.record
      // Once every rated game is loaded, there cannot be an earlier baseline.
      return !own.some(g => g.end_time * 1000 < window.start!) && (!record || own.length < record.win + record.loss + record.draw)
    })
  }
  const earlier = archives.filter(url => !archiveInWindow(url, window) && archiveInWindow(url, { start: null, end: window.start! }))
  for (const url of earlier) {
    if (!needsBaseline()) break
    games.push(...await month(url))
  }
  return games
}

export default function ProfileStats({ username, onTimeClassChange }: { username: string; onTimeClassChange: (timeClass: CcGame['time_class'], scroll: boolean) => void }) {
  const [type, setType] = useState<StatType>('All Stats')
  const [period, setPeriod] = useState<ProfilePeriod>('90 days')
  const [more, setMore] = useState(false)
  const [menu, setMenu] = useState<'type' | 'period' | null>(null)
  const [now] = useState(() => Date.now())
  const [puzzleRating] = useStored('puzzleRating', 800)
  const [puzzleHistory] = useStored<PuzzleAttempt[]>('puzzleHistory', [])
  const [stats, setStats] = useState<{ username: string; data?: CcStats; error?: string } | null>(null)
  const [months, setMonths] = useState<{ key: string; games?: CcGame[]; error?: string } | null>(null)
  const normalized = username.trim().toLowerCase()
  const key = `${normalized}:${period}`
  const window = profileWindow(period, now)
  const closeMenu = useCallback(() => setMenu(null), [])

  useEffect(() => {
    if (!normalized) return
    let cancelled = false
    void fetchStats(normalized).then(data => { if (!cancelled) setStats({ username: normalized, data }) }, error => { if (!cancelled) setStats({ username: normalized, error: error instanceof Error ? error.message : 'Could not load ratings.' }) })
    return () => { cancelled = true }
  }, [normalized])
  useEffect(() => {
    if (!normalized) return
    let cancelled = false
    void loadProfileGames(normalized, profileWindow(period, now)).then(games => { if (!cancelled) setMonths({ key, games }) }, error => { if (!cancelled) setMonths({ key, error: error instanceof Error ? error.message : 'Could not load game archives.' }) })
    return () => { cancelled = true }
  }, [normalized, period, now, key])

  const ratings = stats?.username === normalized ? stats : null
  const history = months?.key === key ? months : null
  const errors = [ratings?.error, history?.error].filter(Boolean)
  const rows = ROWS.filter((row, index) => type === 'All Stats' ? more || index < 4 : row.type === type)
  return <section className="profile-stats" aria-label="Profile stats">
    <div className="profile-stats-filters">
      <Dropdown label="Stats type" value={type} icon="rating-stats" options={TYPES} open={menu === 'type'} onToggle={() => setMenu(menu === 'type' ? null : 'type')} onClose={closeMenu} onSelect={value => { setType(value); const row = ROWS.find(r => r.type === value); if (row && 'timeClass' in row) onTimeClassChange(row.timeClass, false) }} />
      <Dropdown label="Stats period" value={period} icon="calendar-month" options={PROFILE_PERIODS} open={menu === 'period'} onToggle={() => setMenu(menu === 'period' ? null : 'period')} onClose={closeMenu} onSelect={setPeriod} />
    </div>
    <div className="profile-stats-card">
      <h2>Stats</h2>
      {!normalized ? <p className="profile-stats-empty"><a href="#/games">Import your games in My Games ↗</a></p> : <>
        <table className="profile-stats-table" aria-label="Profile stats by type">
          <thead><tr><th scope="col">Type</th><th scope="col">Rating</th><th scope="col">Change</th><th scope="col">Games</th><th scope="col" className="profile-stats-percentile">Percentile</th><th scope="col"><span className="insights-sr-only">Details</span></th></tr></thead>
          <tbody>{rows.map(row => {
            const tc = 'timeClass' in row ? row.timeClass : null
            const puzzle = row.type === 'Puzzles'
            const tournament = row.type === 'Tournaments'
            const current = tc ? ratings?.data?.[`chess_${tc}`] : undefined
            const summary = tc ? gameProfileSummary(history?.games ?? [], normalized, tc, window, current) : puzzleProfileSummary(puzzleHistory, window)
            const loading = tc && (!history || (period === 'All time' && !ratings))
            const rating = tc ? !ratings ? '…' : profileRating(current) ?? '?' : puzzle ? format(puzzleRating) : ''
            const change = tc && (history?.error || (period === 'All time' && ratings?.error)) ? null : summary.change
            const games = tc && (history?.error || (period === 'All time' && ratings?.error)) ? null : summary.games
            const activate = () => { if (tc) onTimeClassChange(tc, true); else if (puzzle) location.hash = '/puzzles' }
            return <tr key={row.type} className={tournament ? '' : 'profile-stats-clickable'} onClick={tournament ? undefined : activate}>
              <td><div className="profile-stats-type"><img src={`${ICONS}/${row.icon}.svg`} width="32" height="32" alt="" />{tournament ? <span>Tournaments (Daily)</span> : <button onClick={e => { e.stopPropagation(); activate() }} aria-label={tc ? `View ${row.type} Insights` : 'Go to Puzzles'}>{row.type}</button>}</div></td>
              <td className="profile-stats-rating">{rating}</td>
              <td>{!tournament && (loading ? '…' : change ? <span className={`profile-stats-delta ${change > 0 ? 'delta-positive' : 'delta-negative'}`}>{change > 0 ? '↑' : '↓'} {format(Math.abs(change))}</span> : '-')}</td>
              <td>{!tournament && (loading || (tc && period === 'All time' && !ratings) ? '…' : format(games || null))}</td>
              <td className="profile-stats-percentile">{!tournament && '-'}</td>
              <td><Chevron /></td>
            </tr>
          })}</tbody>
        </table>
        {type === 'All Stats' && <button className="profile-stats-more" aria-expanded={more} onClick={() => setMore(value => !value)}>{more ? 'Show Less Stats' : 'Show More Stats'}</button>}
        {errors.length > 0 && <p className="profile-stats-error" role="alert">{[...new Set(errors)].join(' · ')}</p>}
      </>}
    </div>
  </section>
}
