// Verify migration, numerical edge cases and the complete fitting path using synthetic data only.
// Run: cd app && node scripts/test-review-calibration.mjs
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ts from 'typescript'
import { Chess } from 'chess.js'
const require = createRequire(import.meta.url), run = promisify(execFile)
const app = fileURLToPath(new URL('../', import.meta.url)), temp = await mkdtemp(join(tmpdir(), 'rea-calibration-test-'))
try {
  for (const name of ['game', 'review', 'reviewCalibration', 'reviewCache', 'storage', 'insightsStore']) {
    const source = await readFile(join(app, 'src/lib', name + '.ts'), 'utf8')
    const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } })
    await writeFile(join(temp, name + '.mjs'), outputText.replace(/from '(chess\.js|react)'/g, (_, dependency) => `from ${JSON.stringify(pathToFileURL(require.resolve(dependency)).href)}`).replace(/from '(\.\/\w+)'/g, "from '$1.mjs'"))
  }
  const lib = await import(pathToFileURL(join(temp, 'review.mjs')).href)
  const { REVIEW_CALIBRATION: config } = await import(pathToFileURL(join(temp, 'reviewCalibration.mjs')).href)
  Object.assign(config, { epScale: 0.00368208, epRatingSlope: 0, accuracyK: 0.08, arithmeticWeight: 0.5, classificationVersion: 1 })
  const { loadReview } = await import(pathToFileURL(join(temp, 'reviewCache.mjs')).href)
  const { insightReview } = await import(pathToFileURL(join(temp, 'insightsStore.mjs')).href)
  const stored = new Map()
  globalThis.localStorage = { getItem: key => stored.get(key) ?? null }
  assert.equal(lib.expectedPoints({ mate: 0, cp: -100000 }, 'b'), 1, 'terminal mate retains the winner')
  assert.equal(lib.expectedPoints({ cp: 0 }, 'w', 700), 0.5)
  assert.equal(lib.accuracyOf([]), 100)
  const sample = [
    { before: { cp: 0 }, after: { cp: -10000 }, color: 'w', cls: 'book' },
    { before: { cp: 0 }, after: { cp: -10000 }, color: 'w', cls: 'forced' },
    { before: { cp: 0 }, after: { cp: -10000 }, color: 'w', cls: 'blunder' },
  ]
  assert.equal(lib.accuracyOf(sample), 33.3, 'zero accuracy has a finite harmonic mean; book and forced moves retain full credit')
  const input = { accuracy: 80, rating: 725, opponentRating: 800, opponentAccuracy: 75, moveCount: 9 }
  assert.equal(lib.gameRatingOf(input), null, 'short games are distinct from unavailable models')
  if (!config.gameRating) assert.equal(lib.gameRatingOf({ ...input, moveCount: 10 }), undefined)
  const originalModel = config.gameRating
  config.gameRating = { features: ['rating'], coefficients: [500, 1] }
  assert.equal(lib.gameRatingOf({ ...input, moveCount: 10 }), 1250, 'round to nearest 50')
  assert.equal(lib.gameRatingOf({ ...input, moveCount: 10, rating: undefined }), undefined, 'missing rating does not invent a value')
  config.gameRating = originalModel
  const oldReview = { moves: sample.map(m => ({ ...m, bestLine: [], refutation: [] })), evals: [], accuracy: { w: 99, b: 99 }, counts: {}, book: 0 }
  stored.set('rea-chess:review:test', JSON.stringify(oldReview))
  const refreshed = loadReview('review:test', { w: 700, b: 800 })
  assert.equal(refreshed.accuracy.w, 33.3, 'old summaries recompute from cached evals')
  assert.equal(refreshed.accuracy.b, 100)
  assert.equal(refreshed.ratings.w, 700)
  assert.deepEqual(refreshed.moves, oldReview.moves, 'cached PVs/classifications are preserved')
  stored.set('rea-chess:insights:review:test', JSON.stringify({ ...oldReview, calibrationVersion: config.classificationVersion }))
  assert.ok(insightReview('review:test'))
  config.classificationVersion++
  assert.equal(loadReview('review:test'), null, 'insufficient stored classification inputs invalidate old reviews')
  assert.equal(insightReview('review:test'), null, 'Insights does not mix classifications from an older curve')
  config.classificationVersion--

  // End-to-end synthetic corpus: exact known relationship Game Rating = PGN rating + 500.
  // Fake engine lines have zero evaluation, avoiding any assumption about chess.com's proprietary labels.
  const evidence = join(temp, 'synthetic-evidence'); await mkdir(join(evidence, 'evals'), { recursive: true })
  const chess = new Chess()
  for (const san of 'e4 e5 Nf3 Nc6 Bc4 Bc5 d3 d6 c3 Nf6 O-O O-O Re1 Re8 Bb3 Bb6 Nbd2 Be6 Nf1 Qd7'.split(' ')) chess.move(san)
  const pgn = chess.pgn(), sans = chess.history(), moves = chess.history({ verbose: true })
  const replay = new Chess(), fens = [replay.fen()]
  for (const san of sans) { replay.move(san); fens.push(replay.fen()) }
  const searches = fens.map((fen, i) => {
    const p = new Chess(fen), m = moves[i] ?? p.moves({ verbose: true })[0], uci = m.from + m.to + (m.promotion ?? '')
    return { bestmove: uci, lines: [{ move: uci, pv: [uci], cp: 0, depth: 14 }] }
  })
  const book = JSON.parse(await readFile(join(app, 'public/data/openings.json'), 'utf8'))
  const positions = new Set([...JSON.parse(await readFile(join(app, 'public/data/openings-prefixes.json'), 'utf8')), ...Object.keys(book)])
  let bookPlies = 0
  for (const fen of fens.slice(1)) { if (!positions.has(fen.split(' ').slice(0, 4).join(' '))) break; bookPlies++ }
  let i = 0
  const review = await lib.reviewGame(fens[0], sans, { search: async () => searches[i++] }, () => {}, bookPlies)
  const hash = s => createHash('sha256').update(s).digest('hex')
  const engineHash = hash(Buffer.concat(await Promise.all(['js', 'wasm'].map(extension => readFile(join(app, `public/engine/stockfish-19-lite-single.${extension}`))))))
  const fingerprint = hash(JSON.stringify({ pgn, depth: 14, multipv: 2, engineHash, hashMB: 16, resetPerGame: true }))
  for (let i = 0; i < 12; i++) {
    const id = String(900000 + i), ratings = { w: 400 + i * 100, b: 500 + i * 100 }
    const capture = { id, complete: true, pgn, ratings, white: { username: 'SyntheticWhite' }, black: { username: 'SyntheticBlack' },
      dom: { accuracy: review.accuracy, gameRating: { w: ratings.w + 500, b: ratings.b + 500 }, tallies: lib.CLASSIFICATIONS.filter(c => c !== 'forced').map(cls => ({ label: lib.CLASS_LABEL[cls], values: [review.counts.w[cls], review.counts.b[cls]] })) },
      network: [{ body: JSON.stringify(review.moves.map(m => ({ san: m.san, classification: m.cls }))) }] }
    await writeFile(join(evidence, id + '.json'), JSON.stringify(capture))
    await writeFile(join(evidence, 'evals', id + '.json'), JSON.stringify({ fingerprint, fens, searches, seconds: 0, engineHash, depth: 14, multipv: 2 }))
  }
  await run(process.execPath, [join(app, 'scripts/calibrate-review.mjs'), `--evidence-dir=${evidence}`, `--report=${join(temp, 'synthetic-report.md')}`, '--skip-depth18'], { timeout: 60000, maxBuffer: 1024 * 1024 })
  const fit = JSON.parse(await readFile(join(evidence, 'fit.json'), 'utf8'))
  assert.equal(fit.captured, 12)
  assert.equal(fit.split.holdout.length, 3)
  assert.equal(fit.split.training.length, 9)
  assert.ok(fit.split.holdout.every(id => !fit.split.training.includes(id)))
  assert.equal(fit.holdoutRatingMAE, 0)
  assert.equal(fit.baselineErrors.accuracy, 0)
  assert.equal(fit.baselineErrors.tally, 0)
  assert.equal(fit.baselineErrors.perMove, 0)
  assert.equal(fit.curveAccepted, false, 'a curve with no improvement is rejected')
  assert.equal(fit.accuracyAccepted, false, 'accuracy constants with no improvement are rejected')
  assert.equal(fit.ownRatingBaselineMAE, 500)
  assert.equal(fit.ratingNestedMAE, 0, 'held-out games recover the known synthetic rating relationship')
  assert.equal(fit.ratingAccepted, true)
  assert.deepEqual(fit.chosen.gameRating.features, ['rating'], 'select the simplest valid model')
  assert.ok(Math.abs(fit.chosen.gameRating.coefficients[0] - 500) < 1e-6)
  assert.ok(Math.abs(fit.chosen.gameRating.coefficients[1] - 1) < 1e-6)
  console.log('PASS: numerical edge cases, short/missing ratings, cache migration/invalidation, synthetic whole-game CV and model selection. Synthetic fixtures are removed; real evidence is untouched.')
} finally { delete globalThis.localStorage; await rm(temp, { recursive: true, force: true }) }
