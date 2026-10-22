import type { CcGame, TimeClassStats } from './ccGames'

export const PROFILE_PERIODS = ['7 days', '30 days', '90 days', '1 year', 'All time'] as const
export type ProfilePeriod = typeof PROFILE_PERIODS[number]
export interface ProfileWindow { start: number | null; end: number }
export interface PuzzleAttempt { playedAt?: number; delta: number }

export function profileWindow(period: ProfilePeriod, now = Date.now()): ProfileWindow {
  const days = { '7 days': 7, '30 days': 30, '90 days': 90, '1 year': 365, 'All time': null }[period]
  return { start: days == null ? null : now - days * 86400000, end: now }
}

export function inProfileWindow(playedAt: number, window: ProfileWindow) {
  return playedAt <= window.end && (window.start == null || playedAt >= window.start)
}

export function archiveInWindow(url: string, window: ProfileWindow) {
  const match = url.match(/\/(\d{4})\/(\d{2})\/?$/)
  if (!match) return false
  const year = Number(match[1]), month = Number(match[2]) - 1
  return Date.UTC(year, month) <= window.end && (window.start == null || Date.UTC(year, month + 1) > window.start)
}

/** Standard, rated games belonging to this user, in chronological order. */
export function profileGames(games: CcGame[], username: string) {
  const me = username.trim().toLowerCase()
  const unique = new Map(games.filter(g => g.rated && g.rules === 'chess' &&
    [g.white.username, g.black.username].some(name => name.toLowerCase() === me)).map(g => [g.url, g]))
  return [...unique.values()].sort((a, b) => a.end_time - b.end_time || a.url.localeCompare(b.url))
}

export function profileRating(stats?: TimeClassStats): number | null {
  return stats?.last && (stats.last.rd ?? 0) < 300 ? stats.last.rating : null
}

export function gameProfileSummary(games: CcGame[], username: string, timeClass: CcGame['time_class'], window: ProfileWindow, stats?: TimeClassStats) {
  const history = profileGames(games, username).filter(g => g.time_class === timeClass && g.end_time * 1000 <= window.end)
  const rating = (g: CcGame) => g.white.username.toLowerCase() === username.trim().toLowerCase() ? g.white.rating : g.black.rating
  if (window.start == null) {
    const r = stats?.record
    return { games: r ? r.win + r.loss + r.draw : null, change: stats?.last && history.length ? stats.last.rating - rating(history[0]) : null }
  }
  const inWindow = history.filter(g => inProfileWindow(g.end_time * 1000, window))
  const before = history.filter(g => g.end_time * 1000 < window.start!)
  return { games: inWindow.length, change: inWindow.length ? rating(inWindow.at(-1)!) - rating(before.at(-1) ?? inWindow[0]) : null }
}

export function puzzleProfileSummary(history: PuzzleAttempt[], window: ProfileWindow) {
  const attempts = history.filter(p => p.playedAt == null ? window.start == null : inProfileWindow(p.playedAt, window))
  return { games: attempts.length, change: attempts.reduce((sum, p) => sum + p.delta, 0) }
}
