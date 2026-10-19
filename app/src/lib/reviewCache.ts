import { load, save } from './storage'
import { rememberInsightReview } from './insightsStore'
import type { Review } from './review'

export function reviewKey(pgn: string, url?: string) {
  if (url) return `review:${url}`
  let hash = 2166136261
  for (let i = 0; i < pgn.length; i++) hash = Math.imul(hash ^ pgn.charCodeAt(i), 16777619)
  return `review:${(hash >>> 0).toString(16)}`
}
export function loadReview(key: string) {
  const review = load<Review | null>(key, null)
  // Older reviews discarded PVs; recompute once so follow-up never silently disappears.
  return review?.moves.every(move => Array.isArray(move.bestLine) && Array.isArray(move.refutation)) ? review : null
}
export function saveReview(key: string, review: Review) {
  rememberInsightReview(key, review)
  const keys = [key, ...load<string[]>('review:index', []).filter((k) => k !== key)]
  save(key, review)
  save('review:index', keys.slice(0, 30))
  try {
    for (const expired of keys.slice(30)) localStorage.removeItem(`rea-chess:${expired}`)
  } catch { /* storage unavailable */ }
}
