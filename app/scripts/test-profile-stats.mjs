// Run: cd app && node scripts/test-profile-stats.mjs (Node 22.18+, no dependencies).
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { archiveInWindow, gameProfileSummary, profileGames, profileRating, profileWindow, puzzleProfileSummary } from '../src/lib/profileStats.ts'

const now = Date.UTC(2026, 9, 22, 12)
const window = profileWindow('90 days', now)
assert.equal(window.start, now - 90 * 86400000)
assert.equal(profileWindow('All time', now).start, null)
for (const [period, days] of [['7 days', 7], ['30 days', 30], ['1 year', 365]]) assert.equal(profileWindow(period, now).start, now - days * 86400000)
assert.equal(archiveInWindow('https://api.chess.com/pub/player/me/games/2026/07', window), true)
assert.equal(archiveInWindow('https://api.chess.com/pub/player/me/games/2026/06', window), false)
assert.equal(archiveInWindow('https://api.chess.com/pub/player/me/games/2026/11', window), false)
assert.equal(archiveInWindow('https://api.chess.com/pub/player/me/games/2026/06', { start: Date.UTC(2026, 6, 1), end: now }), false)
assert.equal(profileRating({ last: { rating: 1000, rd: 300 } }), null)
assert.equal(profileRating({ last: { rating: 1000, rd: 299 } }), 1000)
assert.equal(profileRating(), null)

const game = (url, date, rating, extra = {}) => ({ url, end_time: date / 1000, time_class: 'rapid', rated: true, rules: 'chess', white: { username: 'Me', rating }, black: { username: 'Opponent', rating: 2000 }, ...extra })
const before = game('before', window.start - 1000, 700)
const first = game('first', window.start, 760)
const last = game('last', now, 840, { white: { username: 'Opponent', rating: 2000 }, black: { username: 'ME', rating: 840 } })
const excluded = [game('unrated', now, 3000, { rated: false }), game('variant', now, 3000, { rules: 'chess960' }), game('future', now + 1000, 3000), game('other-user', now, 3000, { white: { username: 'Other', rating: 3000 } })]
assert.equal(profileGames([before, first, last, last, ...excluded], ' me ').length, 4) // Future games are excluded by the window, not normalization.
assert.deepEqual(gameProfileSummary([last, first, before, last, ...excluded], ' me ', 'rapid', window), { games: 2, change: 140 })
assert.deepEqual(gameProfileSummary([last, first], 'me', 'rapid', window), { games: 2, change: 80 })
assert.deepEqual(gameProfileSummary([before], 'me', 'rapid', window), { games: 0, change: null })
assert.deepEqual(gameProfileSummary([before, first], 'me', 'bullet', window), { games: 0, change: null })
assert.deepEqual(gameProfileSummary([before, first], 'me', 'rapid', profileWindow('All time', now), { last: { rating: 847 }, record: { win: 20, loss: 10, draw: 2 } }), { games: 32, change: 147 })
assert.deepEqual(gameProfileSummary([], 'me', 'rapid', profileWindow('All time', now)), { games: null, change: null })
assert.equal(gameProfileSummary([before, first], 'me', 'rapid', window).change, 60)
assert.equal(gameProfileSummary([before, game('loss', now, 675)], 'me', 'rapid', window).change, -25)

const puzzles = [{ delta: 9 }, { playedAt: window.start - 1, delta: 7 }, { playedAt: window.start, delta: 3 }, { playedAt: now, delta: -2 }, { playedAt: now + 1, delta: 100 }]
assert.deepEqual(puzzleProfileSummary(puzzles, window), { games: 2, change: 1 })
assert.deepEqual(puzzleProfileSummary(puzzles, profileWindow('All time', now)), { games: 4, change: 17 })
assert.deepEqual(puzzleProfileSummary([], window), { games: 0, change: 0 })
console.log('Profile stats checks passed: periods, archives, provisional ratings, rated standard games, baselines, all time, and puzzle history.')

// Exercise the shared month cache with a mocked network and import store.
const require = createRequire(import.meta.url)
const source = (await readFile(new URL('../src/lib/ccGames.ts', import.meta.url), 'utf8'))
  .replace("from 'chess.js'", `from ${JSON.stringify(pathToFileURL(require.resolve('chess.js')).href)}`)
  .replace("import { load, save } from './storage'", 'const load = () => undefined; const save = () => {}')
  .replace("import { rememberImportedGames } from './insightsStore'", 'const rememberImportedGames = (...args) => globalThis.__reaProfileTestImport(...args)')
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } })
const { fetchMonth } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const originalFetch = globalThis.fetch
let requests = 0
const imports = []
globalThis.__reaProfileTestImport = (...args) => imports.push(args)
try {
  globalThis.fetch = async () => { requests++; return Response.json({ games: [first, ...excluded.filter(g => g.rules !== 'chess')] }) }
  const url = 'https://api.chess.com/pub/player/me/games/2026/10'
  assert.deepEqual(await fetchMonth(url, false, { importGames: false }), [first])
  assert.equal(imports.length, 0, 'Profile requests do not import games into Insights')
  await fetchMonth(url)
  assert.equal(requests, 1, 'A later import reuses the cached network response')
  assert.deepEqual(imports, [['me', [first]]], 'Cached profile games can still be imported explicitly')
  await fetchMonth(url, true)
  assert.equal(requests, 2, 'Explicit refresh still fetches again')
  globalThis.fetch = async () => { requests++; return new Response('', { status: 503 }) }
  await assert.rejects(fetchMonth(`${url}/failed`, false, { importGames: false }), /Could not load games/)
  globalThis.fetch = async () => { requests++; return Response.json({ games: [] }) }
  assert.deepEqual(await fetchMonth(`${url}/failed`, false, { importGames: false }), [], 'Failed requests are evicted and can be retried')
  assert.equal(requests, 4)
} finally {
  globalThis.fetch = originalFetch
  delete globalThis.__reaProfileTestImport
}
console.log('Month cache checks passed: read-only profile requests, explicit imports, refresh, and fetch failure recovery.')
