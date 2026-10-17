import { load, save } from './storage'
import type { Review } from './review'

export function reviewKey(pgn: string, url?: string) {
  if (url) return `review:${url}`
  let hash = 2166136261
  for (let i = 0; i < pgn.length; i++) hash = Math.imul(hash ^ pgn.charCodeAt(i), 16777619)
  return `review:${(hash >>> 0).toString(16)}`
}
export function loadReview(key: string) { return load<Review | null>(key, null) }
export function saveReview(key: string, review: Review) {
  const keys = [key, ...load<string[]>('review:index', []).filter((k) => k !== key)]
  save(key, review)
  save('review:index', keys.slice(0, 30))
  try {
    for (const expired of keys.slice(30)) localStorage.removeItem(`rea-chess:${expired}`)
  } catch { /* storage unavailable */ }
}
