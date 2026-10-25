// Node 22+. cd app && node scripts/calibrate-review.mjs [--apply] [--skip-depth18]
// Uses shipped WASM, shared app logic, reproducible eval caches, and whole-game CV folds.
import { mkdtemp, readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import ts from 'typescript'
import { Chess } from 'chess.js'
const require = createRequire(import.meta.url)
const app = fileURLToPath(new URL('../', import.meta.url)), root = dirname(app.slice(0, -1))
const argument = name => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3)
// Overrides let verification use explicitly synthetic fixtures outside the real evidence directory.
const directory = argument('evidence-dir') ?? join(root, '.rea/review/calibration')
const reportPath = argument('report') ?? join(root, 'docs/review-calibration.md')
const temporary = await mkdtemp(join(tmpdir(), 'rea-calibrate-'))
const baseline = { epScale: 0.00368208, epRatingSlope: 0, accuracyK: 0.08, arithmeticWeight: 0.5, minimumMoves: 10, gameRating: null, classificationVersion: 1 }
const mean = a => a.length ? a.reduce((s, n) => s + n, 0) / a.length : null
const hash = s => createHash('sha256').update(s).digest('hex')
const roundRating = n => Math.max(0, Math.round(n / 50) * 50)
const aliases = { greatfind: 'great', bestmove: 'best', brilliant: 'brilliant', great: 'great', best: 'best', excellent: 'excellent', good: 'good', book: 'book', inaccuracy: 'inaccuracy', mistake: 'mistake', miss: 'miss', blunder: 'blunder', forced: 'forced' }
const normalize = value => aliases[String(value).toLowerCase().replace(/[^a-z]/g, '')]
let engine
try {
  await mkdir(join(directory, 'evals'), { recursive: true })
  for (const name of ['game', 'review', 'reviewCalibration']) {
    let source = await readFile(join(app, 'src/lib', `${name}.ts`), 'utf8')
    if (name === 'review') source += '\nexport { isSacrifice, toWhite, uciMove }\n'
    const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } })
    await writeFile(join(temporary, `${name}.mjs`), outputText.replaceAll("'chess.js'", JSON.stringify(pathToFileURL(require.resolve('chess.js')).href)).replace(/from '(\.\/\w+)'/g, "from '$1.mjs'"))
  }
  const lib = await import(pathToFileURL(join(temporary, 'review.mjs')).href)
  const { REVIEW_CALIBRATION: config } = await import(pathToFileURL(join(temporary, 'reviewCalibration.mjs')).href)
  const wasm = await readFile(join(app, 'public/engine/stockfish-19-lite-single.wasm'))
  const wrapper = await readFile(join(app, 'public/engine/stockfish-19-lite-single.js'))
  const engineHash = hash(Buffer.concat([wrapper, wasm]))
  // The shipped wrapper is CommonJS in Node; copy to .cjs outside the ESM app.
  await writeFile(join(temporary, 'stockfish.cjs'), wrapper)
  await copyFile(join(app, 'public/engine/stockfish-19-lite-single.wasm'), join(temporary, 'stockfish.wasm'))
  function startEngine() {
    const child = spawn(process.execPath, [join(temporary, 'stockfish.cjs')], { stdio: ['pipe', 'pipe', 'pipe'] })
    const readers = new Set(), stderr = []
    createInterface({ input: child.stdout }).on('line', line => { for (const reader of readers) reader(line) })
    child.stderr.on('data', b => stderr.push(String(b)))
    const send = cmd => child.stdin.write(cmd + '\n')
    let failure
    const fail = error => { failure = error; for (const reader of readers) reader(null, error) }
    child.on('error', fail)
    child.on('exit', code => fail(new Error(`Stockfish exited (${code}): ${stderr.join('').slice(-1500)}`)))
    const wait = (command, done, onLine = () => {}, timeout = 120000) => new Promise((resolve, reject) => {
      if (failure) { reject(failure); return }
      const finish = error => { clearTimeout(timer); readers.delete(listener); if (error) reject(error); else resolve() }
      const listener = (line, error) => { if (error) finish(error); else { onLine(line); if (done(line)) finish() } }
      const timer = setTimeout(() => { finish(new Error(`Stockfish timeout: ${command}`)); child.kill() }, timeout)
      readers.add(listener); send(command)
    })
    const ready = wait('uci', line => line === 'uciok').then(() => wait('isready', line => line === 'readyok'))
    return {
      async reset() { await ready; send('ucinewgame'); await wait('isready', l => l === 'readyok') },
      async search(fen, { depth, multipv }) {
        await ready
        const lines = []; let bestmove
        send(`setoption name MultiPV value ${multipv}`); send(`position fen ${fen}`)
        await wait(`go depth ${depth}`, l => l.startsWith('bestmove'), line => {
          const t = line.split(' '), get = k => t[t.indexOf(k) + 1]
          if (line.startsWith('info') && t.includes('pv')) {
            const pv = t.slice(t.indexOf('pv') + 1), entry = { move: pv[0], pv, depth: Number(get('depth')) }
            if (t.includes('cp')) entry.cp = Number(get('cp'))
            if (t.includes('mate')) entry.mate = Number(get('mate'))
            lines[t.includes('multipv') ? Number(get('multipv')) - 1 : 0] = entry
          } else if (line.startsWith('bestmove')) bestmove = get('bestmove')
        })
        return { bestmove, lines: lines.filter(Boolean) }
      },
      close() { child.kill() },
    }
  }
  const book = JSON.parse(await readFile(join(app, 'public/data/openings.json'), 'utf8'))
  const prefixes = new Set([...JSON.parse(await readFile(join(app, 'public/data/openings-prefixes.json'), 'utf8')), ...Object.keys(book)])
  const files = (await readdir(directory)).filter(f => /^\d+\.json$/.test(f)).sort()
  let archiveAccuracyEvidence
  try { archiveAccuracyEvidence = JSON.parse(await readFile(join(directory, 'archive-accuracies.json'), 'utf8')) } catch { /* synthetic or older corpus */ }
  const captures = await Promise.all(files.map(async f => JSON.parse(await readFile(join(directory, f), 'utf8'))))
  const complete = captures.filter(g => g.complete && ['w', 'b'].every(c => Number.isFinite(g.dom?.accuracy?.[c])) && g.dom.tallies.length === 10)
  // Even a blocked capture contains an authorized PGN: use one for the requested depth/runtime experiment, never as labeled training data.
  const reviewedWork = captures.filter(g => g.complete || ['w', 'b'].every(c => Number.isFinite(g.apiAccuracy?.[c])))
  const work = reviewedWork.length ? reviewedWork : captures.slice(0, 1)
  async function analyze(game, depth) {
    const chess = new Chess(); chess.loadPgn(game.pgn)
    const headers = chess.getHeaders(), sans = chess.history(), start = headers.FEN ?? new Chess().fen()
    const replay = new Chess(start), fens = [start]
    let bookPlies = 0, inBook = true
    for (const san of sans) { replay.move(san); fens.push(replay.fen()); inBook &&= prefixes.has(replay.fen().split(' ').slice(0, 4).join(' ')); if (inBook) bookPlies++ }
    bookPlies = Math.max(bookPlies, lib.bookPliesFromEcoUrl(headers.ECOUrl))
    const fingerprint = hash(JSON.stringify({ pgn: game.pgn, depth, multipv: 2, engineHash, hashMB: 16, resetPerGame: true }))
    const cachePath = join(directory, 'evals', `${game.id}${depth === 14 ? '' : `-depth${depth}`}.json`)
    let cached
    try { cached = JSON.parse(await readFile(cachePath, 'utf8')); if (cached.fingerprint !== fingerprint) cached = undefined } catch { /* compute */ }
    if (!cached) {
      engine ??= startEngine(); await engine.reset()
      const searches = [], startTime = performance.now()
      for (let i = 0; i < fens.length; i++) {
        const position = new Chess(fens[i])
        searches.push(position.isCheckmate() || position.isStalemate() ? null : await engine.search(fens[i], { depth, multipv: 2 }))
        if (i % 10 === 0 || i === fens.length - 1) console.log(`${game.id} depth ${depth}: ${i + 1}/${fens.length} positions`)
      }
      cached = { fingerprint, engineHash, depth, multipv: 2, seconds: (performance.now() - startTime) / 1000, fens, searches }
      await writeFile(cachePath, JSON.stringify(cached, null, 2))
    }
    Object.assign(config, baseline)
    let index = 0
    const review = await lib.reviewGame(start, sans, { search: async () => cached.searches[index++] }, () => {}, bookPlies, game.ratings)
    // reviewGame skips searches at terminal boards, so only one (last) cached null is possible in a legal PGN.
    const inputs = review.moves.map((move, ply) => {
      const position = new Chess(fens[ply]), lines = cached.searches[ply]?.lines ?? []
      return { played: move.uci, best: move.best, legalMoves: position.moves().length, ply, bookPlies,
        sacrifice: lib.isSacrifice(fens[ply], fens[ply + 1], cached.searches[ply + 1]?.lines[0]?.pv ?? [], move.color),
        secondScore: lines[1] ? lib.toWhite(lines[1], move.color) : undefined }
    })
    const targets = Object.fromEntries(game.dom?.tallies?.map(t => [normalize(t.label), t.values]) ?? [])
    const perMoveCandidates = []
    function walk(value) {
      if (!value || typeof value !== 'object') return
      if (Array.isArray(value) && value.length === sans.length && value.every((m, i) => m && (m.san === sans[i] || m.move === sans[i]) && normalize(m.classification ?? m.moveClassification))) perMoveCandidates.push(value.map(m => normalize(m.classification ?? m.moveClassification)))
      for (const child of Object.values(value)) if (child && typeof child === 'object') walk(child)
    }
    for (const n of game.network ?? []) { try { walk(JSON.parse(n.body)) } catch { /* opaque payload retained in capture */ } }
    return { game, review, inputs, targets, perMove: perMoveCandidates[0], seconds: cached.seconds, depth }
  }
  const data = []
  for (const game of work) data.push(await analyze(game, 14))
  if (process.argv.includes('--eval-only')) { console.log(`Cached depth-14 evals for ${data.length} games.`) } else {
  const allLabeled = data.filter(d => d.game.complete)
  // Freeze a reproducible quarter of whole games before fitting or model selection.
  const ordered = [...allLabeled].sort((a, b) => hash(a.game.id).localeCompare(hash(b.game.id)))
  const holdout = ordered.slice(0, Math.ceil(ordered.length / 4))
  const holdoutIds = new Set(holdout.map(d => d.game.id))
  const labeled = allLabeled.filter(d => !holdoutIds.has(d.game.id))
  const predictionCache = new WeakMap()

  function predict(d, params) {
    const key = JSON.stringify([params.epScale, params.epRatingSlope, params.accuracyK, params.arithmeticWeight])
    let cache = predictionCache.get(d)
    if (!cache) { cache = new Map(); predictionCache.set(d, cache) }
    if (cache.has(key)) return cache.get(key)
    Object.assign(config, baseline, params)
    const moves = [], counts = { w: Object.fromEntries(lib.CLASSIFICATIONS.map(c => [c, 0])), b: Object.fromEntries(lib.CLASSIFICATIONS.map(c => [c, 0])) }
    for (let i = 0; i < d.review.moves.length; i++) {
      const move = d.review.moves[i], rating = d.game.ratings[move.color]
      const beforeEP = lib.expectedPoints(move.before, move.color, rating), afterEP = lib.expectedPoints(move.after, move.color, rating)
      const second = d.inputs[i].secondScore
      const cls = lib.classifyMove({ ...d.inputs[i], beforeEP, afterEP, loss: Math.max(0, beforeEP - afterEP), previousClass: moves[i - 1]?.cls,
        previousEP: i > 0 ? lib.expectedPoints(d.review.evals[i - 1], move.color, rating) : undefined,
        secondGap: second ? beforeEP - lib.expectedPoints(second, move.color, rating) : 0 })
      moves.push({ ...move, cls }); counts[move.color][cls]++
    }
    const result = { accuracy: { w: lib.accuracyOf(moves.filter(m => m.color === 'w'), d.game.ratings.w), b: lib.accuracyOf(moves.filter(m => m.color === 'b'), d.game.ratings.b) }, counts, moves }
    cache.set(key, result)
    return result
  }
  const errorCache = new WeakMap()
  function errors(d, prediction) {
    if (errorCache.has(prediction)) return errorCache.get(prediction)
    const accuracy = mean(['w', 'b'].map(c => Math.abs(prediction.accuracy[c] - d.game.dom.accuracy[c])))
    const tally = mean(['w', 'b'].map((c, i) => Object.entries(d.targets).reduce((sum, [cls, values]) => sum + Math.abs((prediction.counts[c][cls] ?? 0) - values[i]), 0)))
    const perMove = d.perMove ? mean(prediction.moves.map((m, i) => Number(m.cls !== d.perMove[i]))) : null
    const result = { accuracy, tally, perMove, objective: accuracy + tally * 0.5 + (perMove ?? 0) * 10 }
    errorCache.set(prediction, result)
    return result
  }
  const score = (training, params, metric) => mean(training.map(d => errors(d, predict(d, params))[metric]))
  const fit = (training, candidates, metric) => candidates.reduce((best, p) => score(training, p, metric) < score(training, best, metric) - 1e-9 ? p : best, candidates[0])
  const summarize = rows => ({ accuracy: mean(rows.map(r => r.accuracy)), tally: mean(rows.map(r => r.tally)), perMove: mean(rows.map(r => r.perMove).filter(v => v != null)) })
  const canFit = labeled.length >= 6
  const curveGrid = [baseline, ...[0.75, 1, 1.25].flatMap(scale => [-0.75, -0.5, -0.25, 0.25, 0.5, 0.75].map(slope => ({ ...baseline, epScale: baseline.epScale * scale, epRatingSlope: slope })))]
  const accuracyGrid = curve => [curve, ...[0.03, 0.04354, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.12].flatMap(k => [0, 0.25, 0.5, 0.75, 1].map(weight => ({ ...curve, accuracyK: k, arithmeticWeight: weight })))]
  const baselineErrors = labeled.map(d => errors(d, predict(d, baseline)))
  let chosen = { ...baseline }, curveCV = [], accuracyCV = [], curveAccepted = false, accuracyAccepted = false
  const curveGain = (before, after) => before.accuracy - after.accuracy >= 0.5 && after.tally < before.tally && after.accuracy <= before.accuracy * 0.95
  if (canFit) {
    curveCV = labeled.map((test, i) => errors(test, predict(test, fit(labeled.filter((_, j) => i !== j), curveGrid, 'objective'))))
    curveAccepted = curveGain(summarize(baselineErrors), summarize(curveCV))
    if (curveAccepted) chosen = { ...fit(labeled, curveGrid, 'objective') }
    // Refits both stages inside each held-out fold; the held-out game never tunes its own curve/constants.
    accuracyCV = labeled.map((test, i) => {
      const train = labeled.filter((_, j) => i !== j)
      const curve = curveAccepted ? fit(train, curveGrid, 'objective') : baseline
      return errors(test, predict(test, fit(train, accuracyGrid(curve), 'accuracy')))
    })
    const comparison = summarize(curveAccepted ? curveCV : baselineErrors), after = summarize(accuracyCV)
    accuracyAccepted = comparison.accuracy - after.accuracy >= 0.25 && after.accuracy <= comparison.accuracy * 0.95
    if (accuracyAccepted) chosen = { ...fit(labeled, accuracyGrid(chosen), 'accuracy') }
  }
  const selectedCV = accuracyAccepted ? accuracyCV : curveAccepted ? curveCV : baselineErrors
  const predictions = new Map(labeled.map(d => [d.game.id, predict(d, chosen)]))
  // Rating fits have intercept plus at most three feature coefficients. All candidate feature sets are evaluated.
  const featureSets = [[], ['rating'], ['accuracy'], ['rating', 'accuracy'], ['rating', 'accuracy', 'opponentAccuracy'], ['rating', 'accuracy', 'opponentRating'], ['rating', 'accuracy', 'moveCount']]
  function ratingRows(d, prediction) {
    return ['w', 'b'].map(color => {
      const other = color === 'w' ? 'b' : 'w', target = d.game.dom.gameRating?.[color]
      return { id: d.game.id, color, target, rating: d.game.ratings[color], accuracy: prediction.accuracy[color], opponentRating: d.game.ratings[other], opponentAccuracy: prediction.accuracy[other], moveCount: prediction.moves.filter(m => m.color === color).length }
    }).filter(row => Number.isFinite(row.target) && row.target > 0)
  }
  function regress(rows, features) {
    if (rows.length < features.length + 2 || rows.some(row => features.some(f => !Number.isFinite(row[f])))) return null
    const n = features.length + 1, matrix = Array.from({ length: n }, () => Array(n + 1).fill(0))
    const scales = features.map(f => f.includes('ating') ? 1000 : f === 'moveCount' ? 50 : 100)
    for (const row of rows) {
      const x = [1, ...features.map((f, i) => row[f] / scales[i])]
      for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) matrix[i][j] += x[i] * x[j]; matrix[i][n] += x[i] * row.target }
    }
    for (let i = 0; i < n; i++) {
      const pivot = matrix.slice(i).reduce((best, row, k) => Math.abs(row[i]) > Math.abs(matrix[best][i]) ? i + k : best, i)
      ;[matrix[i], matrix[pivot]] = [matrix[pivot], matrix[i]]
      if (Math.abs(matrix[i][i]) < 1e-8) return null
      const div = matrix[i][i]; for (let j = i; j <= n; j++) matrix[i][j] /= div
      for (let k = 0; k < n; k++) if (k !== i) { const v = matrix[k][i]; for (let j = i; j <= n; j++) matrix[k][j] -= v * matrix[i][j] }
    }
    return { features, coefficients: matrix.map((row, i) => row[n] / (i ? scales[i - 1] : 1)) }
  }
  const ratingPrediction = (row, model) => roundRating(model.coefficients[0] + model.features.reduce((s, f, i) => s + model.coefficients[i + 1] * row[f], 0))
  // Out-of-fold accuracy is used as an input for each held-out rating game.
  const foldCache = new Map()
  function foldParams(train) {
    const key = train.map(d => d.game.id).join(',')
    if (foldCache.has(key)) return foldCache.get(key)
    const curve = curveAccepted ? fit(train, curveGrid, 'objective') : baseline
    const params = accuracyAccepted ? fit(train, accuracyGrid(curve), 'accuracy') : curve
    foldCache.set(key, params)
    return params
  }
  function ratingCV(games, features) {
    const results = []
    for (let i = 0; i < games.length; i++) {
      const train = games.filter((_, j) => i !== j), params = foldParams(train)
      const trainingRows = train.flatMap(d => ratingRows(d, predict(d, params)))
      const model = regress(trainingRows, features)
      if (!model) return null
      for (const row of ratingRows(games[i], predict(games[i], params))) results.push({ id: row.id, color: row.color, target: row.target, prediction: ratingPrediction(row, model), error: Math.abs(ratingPrediction(row, model) - row.target) })
    }
    return results.length ? { mae: mean(results.map(r => r.error)), results } : null
  }
  const ratingCandidates = canFit ? featureSets.map(features => ({ features, cv: ratingCV(labeled, features) })).filter(c => c.cv) : []
  // Pick the first (simplest) within 25 Elo of the best CV result.
  const bestRatingError = ratingCandidates.length ? Math.min(...ratingCandidates.map(c => c.cv.mae)) : null
  const ratingChoice = ratingCandidates.find(c => c.cv.mae <= bestRatingError + 25)
  const ownRatingErrors = labeled.flatMap(d => ratingRows(d, predictions.get(d.game.id))).filter(r => Number.isFinite(r.rating)).map(r => Math.abs(roundRating(r.rating) - r.target))
  let ratingNested = null
  if (canFit && labeled.length >= 8 && ratingChoice) {
    // Nested selection reports model-family selection honestly, beyond the individual candidates' LOO scores.
    const outer = []
    for (let i = 0; i < labeled.length; i++) {
      const train = labeled.filter((_, j) => i !== j), params = foldParams(train)
      const candidates = featureSets.map(features => ({ features, cv: ratingCV(train, features) })).filter(c => c.cv)
      const best = Math.min(...candidates.map(c => c.cv.mae)), selected = candidates.find(c => c.cv.mae <= best + 25)
      if (!selected) continue
      const model = regress(train.flatMap(d => ratingRows(d, predict(d, params))), selected.features)
      if (model) for (const row of ratingRows(labeled[i], predict(labeled[i], params))) outer.push(Math.abs(ratingPrediction(row, model) - row.target))
    }
    ratingNested = mean(outer)
  }
  const ratingAccepted = ratingChoice && ratingNested != null && ratingNested < mean(ownRatingErrors) * 0.95
  if (ratingAccepted) chosen.gameRating = regress(labeled.flatMap(d => ratingRows(d, predictions.get(d.game.id))), ratingChoice.features)
  const nullExamples = labeled.flatMap(d => ['w', 'b'].map(color => ({ rating: d.game.dom.gameRating?.[color], moves: d.review.moves.filter(m => m.color === color).length }))).filter(r => r.rating === null || r.rating === 0)
  const ratedMoves = labeled.flatMap(d => ratingRows(d, predictions.get(d.game.id)).map(r => r.moveCount))
  // Only infer an exact boundary with observations on both adjacent move counts.
  if (nullExamples.length && ratedMoves.length) { const maxUnrated = Math.max(...nullExamples.map(r => r.moves)), minRated = Math.min(...ratedMoves); if (minRated === maxUnrated + 1) chosen.minimumMoves = minRated }
  if (curveAccepted) chosen.classificationVersion = baseline.classificationVersion + 1
  const apiOnly = data.filter(d => !d.game.complete && ['w', 'b'].every(c => Number.isFinite(d.game.apiAccuracy?.[c])))
  const apiOnlyError = params => mean(apiOnly.flatMap(d => { const prediction = predict(d, params); return ['w', 'b'].map(c => Math.abs(prediction.accuracy[c] - d.game.apiAccuracy[c])) }))
  const holdoutBefore = summarize(holdout.map(d => errors(d, predict(d, baseline))))
  const holdoutAfter = summarize(holdout.map(d => errors(d, predict(d, chosen))))
  const holdoutRatingRows = holdout.flatMap(d => ratingRows(d, predict(d, chosen)))
  const holdoutRatingMAE = chosen.gameRating ? mean(holdoutRatingRows.map(r => Math.abs(ratingPrediction(r, chosen.gameRating) - r.target))) : null
  const holdoutRatingBaselineMAE = mean(holdoutRatingRows.map(r => Math.abs(roundRating(r.rating) - r.target)))
  const depthResults = []
  if (!process.argv.includes('--skip-depth18')) for (const game of [...labeled].sort((a, b) => a.review.moves.length - b.review.moves.length).slice(Math.floor(labeled.length / 2), Math.floor(labeled.length / 2) + 1).map(d => d.game)) {
    const deep = await analyze(game, 18), shallow = data.find(d => d.game.id === game.id)
    depthResults.push({ id: game.id, depth14Seconds: shallow.seconds, depth18Seconds: deep.seconds,
      before: game.complete ? errors(shallow, predict(shallow, chosen)) : null, after: game.complete ? errors(deep, predict(deep, chosen)) : null })
  }
  const tallyComparison = lib.CLASSIFICATIONS.filter(cls => cls !== 'forced').map(cls => {
    const values = (params, color) => holdout.map(d => predict(d, params).counts[color][cls])
    return { classification: cls, target: mean(holdout.flatMap(d => d.targets[cls] ?? [])), before: mean(['w', 'b'].flatMap(c => values(baseline, c))), after: mean(['w', 'b'].flatMap(c => values(chosen, c))) }
  })
  const result = { tallyComparison, depth14Runtime: { medianSeconds: [...data.map(d => d.seconds)].sort((a, b) => a - b)[Math.floor(data.length / 2)] ?? null, meanSeconds: mean(data.map(d => d.seconds)) }, apiOnlyAccuracy: { games: apiOnly.length, before: apiOnlyError(baseline), after: apiOnlyError(chosen) }, apiAccuracyGames: archiveAccuracyEvidence?.games?.length ?? 0, archiveCount: archiveAccuracyEvidence?.archiveCount ?? 0, apiDomAccuracyMAE: mean(allLabeled.flatMap(d => ['w', 'b'].map((color, i) => { const api = d.game.apiAccuracy?.[color] ?? archiveAccuracyEvidence?.games?.find(g => g.url.endsWith('/' + d.game.id))?.accuracies?.[i ? 'black' : 'white']; return Number.isFinite(api) ? Math.abs(api - d.game.dom.accuracy[color]) : null })).filter(n => n != null)), split: { training: labeled.map(d => d.game.id), holdout: holdout.map(d => d.game.id), method: 'SHA-256(game ID) sorted, first ceil(N/4) held out before fitting' }, holdoutBefore, holdoutAfter, holdoutRatingBaselineMAE, holdoutRatingMAE, captured: complete.length, attempted: captures.length, canFit, baseline, chosen,
    baselineErrors: summarize(baselineErrors), curveCV: summarize(curveCV), accuracyCV: summarize(accuracyCV), selectedCV: summarize(selectedCV), curveAccepted, accuracyAccepted,
    classificationsChanged: curveAccepted, perMoveGames: labeled.filter(d => d.perMove).length,
    ratingCandidates, ratingNestedMAE: ratingNested, ownRatingBaselineMAE: mean(ownRatingErrors), ratingAccepted: !!ratingAccepted,
    ratingRoundingVerified: labeled.some(d => ratingRows(d, predictions.get(d.game.id)).length) && labeled.every(d => ratingRows(d, predictions.get(d.game.id)).every(r => r.target % 50 === 0)),
    nullExamples, minimumMovesInferred: chosen.minimumMoves !== 10, depthResults,
    perGame: labeled.map((d, i) => ({ id: d.game.id, white: d.game.white.username, black: d.game.black.username, ratings: d.game.ratings, targetAccuracy: d.game.dom.accuracy, before: predict(d, baseline).accuracy, after: predictions.get(d.game.id).accuracy, beforeErrors: baselineErrors[i], afterCVErrors: selectedCV[i], targetRating: d.game.dom.gameRating })) }
  await writeFile(join(directory, 'fit.json'), JSON.stringify(result, null, 2))
  const fmt = (n, digits = 2) => n == null ? 'N/A' : n.toFixed(digits)
  const report = `# Game Review calibration\n\nReport generated: ${new Date().toISOString()}. ${complete.length} complete games; ${captures.length} attempted.\n\n${complete.length ? 'Games used: ' + complete.map(g => g.id).join(', ') : 'Chess.com displayed **DAILY LIMIT REACHED** on the first game. Capture stopped immediately, without using trial or purchase controls. There are no labeled games to fit or validate. The saved PGN is used only for the engine runtime experiment.'}\n\n## Evidence\n\n${result.apiAccuracyGames} already-reviewed standard live games found across ${result.archiveCount} public monthly archives. Their PGNs and API accuracy labels are preserved in archive-accuracies.json. The newest 40 games with at least ten moves per side are eligible for browser capture; no unreviewed game is opened by the re-run. ${captures.length - complete.length} saved captures lack complete summaries (including the original blocked attempt). Only complete summaries enter fitting.\n\nDOM/API accuracy MAE on captured games: ${fmt(result.apiDomAccuracyMAE)} points. The sources disagree on some games; fit targets use the current rendered summary, with API values retained as additional reference ground truth. ${apiOnly.length} selected games whose summary did not reopen are evaluated separately using API accuracy only, without entering training/model selection: MAE ${fmt(result.apiOnlyAccuracy.before)} → ${fmt(result.apiOnlyAccuracy.after)} points. The remaining archive-only games have no Stockfish evals in this run and are not included in the fitted/test metrics.\n\n## Before / after\n\n| Metric | Before | After (out of sample) |\n| --- | ---: | ---: |\n| Accuracy MAE, percentage points | ${fmt(holdoutBefore.accuracy)} | ${fmt(holdoutAfter.accuracy)} |\n| Tally L1 difference per side | ${fmt(holdoutBefore.tally)} | ${fmt(holdoutAfter.tally)} |\n| Per-move classification mismatch | ${fmt(holdoutBefore.perMove)} | ${fmt(holdoutAfter.perMove)} |\n| Game Rating MAE, Elo (own-PGN-rating baseline vs fitted model) | ${fmt(holdoutRatingBaselineMAE)} | ${fmt(holdoutRatingMAE)} |\n\n${labeled.length} training games, ${holdout.length} untouched test games. Test IDs: ${holdout.map(d => d.game.id).join(', ')}. Deterministic split: SHA-256(game ID), first ceil(N/4). Training LOO accuracy: ${fmt(result.baselineErrors.accuracy)} → ${fmt(result.selectedCV.accuracy)}; tally: ${fmt(result.baselineErrors.tally)} → ${fmt(result.selectedCV.tally)}. Nested training Game Rating MAE: ${fmt(ratingNested)} Elo.\n\nN/A means unmeasurable, not zero error. App Game Rating had no previous estimator. PGN rating is a comparison baseline only.\n\n## Parameters and decisions\n\n- Expected-points logistic scale: ${chosen.epScale}; rating slope: ${chosen.epRatingSlope}. Rating is centered at 1500 and scaled by 1000. Curve accepted: ${curveAccepted}.\n- Accuracy K: ${chosen.accuracyK}; arithmetic weight: ${chosen.arithmeticWeight}, harmonic weight: ${1 - chosen.arithmeticWeight}. Accuracy change accepted: ${accuracyAccepted}.\n- Classification thresholds remain 0.001 / 0.02 / 0.05 / 0.10 / 0.20; miss rule unchanged. ${result.perMoveGames} games have unambiguously aligned per-move labels. No unsupported threshold changes.\n- Game Rating model: ${chosen.gameRating ? JSON.stringify(chosen.gameRating) : '**unavailable**; no validated coefficients. The app displays an unavailable value, rather than a fabricated estimate.'}\n- Short-game cutoff: fewer than ${chosen.minimumMoves} moves by that side. ${nullExamples.length ? 'Unrated examples are recorded in fit.json; infer a boundary only with adjacent observations.' : 'No captured short-game example; the plan’s < 10 fallback applies.'}\n- Ratings are rounded to nearest 50 (with a nonnegative floor). Captured values verify rounding: ${result.ratingRoundingVerified}.\n- App search depth remains 14, MultiPV 2.\n\n## Held-out tally means per side\n\n| Classification | Chess.com | Before | After |\n| --- | ---: | ---: | ---: |\n${tallyComparison.map(r => `| ${r.classification} | ${fmt(r.target)} | ${fmt(r.before)} | ${fmt(r.after)} |`).join('\n')}\n\n## Depth experiment\n\n| Game | Depth 14 seconds | Depth 18 seconds | Accuracy MAE change | Tally difference change |\n| --- | ---: | ---: | ---: | ---: |\n${depthResults.map(r => `| ${r.id} | ${fmt(r.depth14Seconds)} | ${fmt(r.depth18Seconds)} | ${fmt(r.after && r.before ? r.after.accuracy - r.before.accuracy : null)} | ${fmt(r.after && r.before ? r.after.tally - r.before.tally : null)} |`).join('\n') || '| Not run | N/A | N/A | N/A | N/A |'}\n\nThe exact shipped Stockfish 19 Lite single-threaded WASM runs in Node via a temporary CommonJS wrapper. Hash 16 MB, MultiPV 2, depth 14/18, fresh game hash per game. Depth-14 mean / median full-game runtime across ${data.length} evaluated games: ${fmt(result.depth14Runtime.meanSeconds)} / ${fmt(result.depth14Runtime.medianSeconds)} seconds. Runtime is full-game engine time, excluding cache reads; cache fingerprint includes PGN, engine bytes and settings. ${complete.length ? 'Depth comparison uses one median-length training game; it does not tune on the held-out quarter.' : 'The blocked game has no summary, so the depth error change cannot be measured.'}\n\n## Validation and caveats\n\nAt least six training games are required to fit curves/accuracy; at least eight for nested Game Rating validation. Whole games, including both sides, stay together in every leave-one-game-out fold. Curve and accuracy stages refit on the training games. Rating candidate features (at most three plus intercept) cover own accuracy/rating, opponent accuracy/rating and move count. The simplest candidate within 25 Elo of the best LOO error is selected; nested whole-game CV reports selection error. Curve adoption requires at least 0.5 percentage-point / 5% accuracy improvement and lower tally error; accuracy fitting requires at least 0.25 point / 5%. Game Rating adoption requires nested CV to beat the own-rating baseline by 5%. Selection gates still use this small corpus, so all estimates need confirmation on an independent larger sample.\n\n${canFit ? 'See fit.json for all candidate scores and folds.' : 'No fit was attempted, no coefficients were learned, and no out-of-sample improvement is claimed. Existing reference HTML/screenshots have not been assumed to match the new PGN.'}\n\nHeld-out tally L1 changed from ${fmt(holdoutBefore.tally)} to ${fmt(holdoutAfter.tally)} despite the small training-CV tally gain; classification parity has not been achieved. No aligned per-move labels were captured, so thresholds and the miss rule remain unchanged. The sample comes from one user’s reviewed games, with low/sub-1000 PGN ratings; extrapolation to stronger players is unvalidated.\n\nStored reviews refresh accuracy and available Game Ratings from before/after evals. A classification-version mismatch invalidates cached interactive reviews and Insights when a chosen curve changes classifications. Insights recomputes accuracy from stored evals with each player’s rating, including mixed-game move groups.\n\n## Reproduce\n\nFrom app/: \`node scripts/capture-reviews.mjs\`, then \`node scripts/calibrate-review.mjs\`. Evidence is in \`.rea/review/calibration/<id>.json\`; evals in \`evals/<id>.json\` and \`evals/<id>-depth18.json\`; all model metrics and parameters in \`fit.json\`. \`--skip-depth18\` skips the expensive experiment for fitting iterations; \`--apply\` applies only validated models. No app dependencies are added.\n\n## Per-game accuracy\n\n| ID | White / Black | PGN ratings | Target accuracy W / B | Before W / B | Fitted W / B |\n| --- | --- | --- | --- | --- | --- |\n${result.perGame.map(g => `| ${g.id} | ${g.white} / ${g.black} | ${g.ratings.w} / ${g.ratings.b} | ${g.targetAccuracy.w} / ${g.targetAccuracy.b} | ${g.before.w} / ${g.before.b} | ${g.after.w} / ${g.after.b} |`).join('\n') || '| No complete games | — | — | N/A | N/A | N/A |'}\n\nThe per-game table contains training games; its fitted column is in-sample. Aggregate before/after errors above use only the untouched test quarter. Model adoption uses training cross-validation only, regardless of test results.\n`
  await writeFile(reportPath, report)
  if (process.argv.includes('--apply')) {
    if (!canFit || !(curveAccepted || accuracyAccepted || ratingAccepted)) throw new Error('No validated calibration changes to apply; report and app baseline retained.')
    const path = join(app, 'src/lib/reviewCalibration.ts'), source = await readFile(path, 'utf8')
    await writeFile(path, source.replace(/= \{\n[\s\S]*?\n\}\s*$/, '= ' + JSON.stringify(chosen, null, 2) + '\n'))
  }
  console.log(JSON.stringify({ holdoutBefore, holdoutAfter, holdoutRatingMAE, captured: result.captured, parameters: chosen, before: result.baselineErrors, afterCV: canFit ? result.selectedCV : null, ratingNestedMAE: ratingNested, depthResults }, null, 2))
  }
} finally { engine?.close(); await rm(temporary, { recursive: true, force: true }) }
