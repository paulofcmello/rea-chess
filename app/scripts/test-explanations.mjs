// Run: cd app && node scripts/test-explanations.mjs (no added dependencies).
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { Chess } from 'chess.js'
const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const temp = await mkdtemp(join(tmpdir(), 'rea-explanations-'))
try {
  for (const name of ['game', 'review', 'explain']) {
    const source = await readFile(join(root, 'src/lib', `${name}.ts`), 'utf8')
    const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext } })
    await writeFile(join(temp, `${name}.mjs`), outputText.replaceAll("'chess.js'", JSON.stringify(pathToFileURL(require.resolve('chess.js')).href)).replace(/from '(\.\/\w+)'/g, "from '$1.mjs'"))
  }
  const { explainMove, linePositions } = await import(pathToFileURL(join(temp, 'explain.mjs')).href)
  const start = new Chess().fen()
  const cases = [
    { name: 'hanging queen', fen: '4k3/8/6p1/8/8/8/8/3QK3 w - - 0 1', san: 'Qh5', tag: 'hanging-piece', best: 'd1d3', refutation: ['g6h5'] },
    { name: 'allows mate in one', fen: 'rnbqkbnr/pppp1ppp/8/4p3/8/5P2/PPPPP1PP/RNBQKBNR w KQkq - 0 2', san: 'g4', tag: 'allows-mate', best: 'e2e4', after: { mate: -1 }, refutation: ['d8h4'] },
    { name: 'missed knight fork', fen: '2r1k3/8/8/5N2/8/8/8/4K3 w - - 0 1', san: 'Ne3', tag: 'fork', best: 'f5d6', bestLine: ['f5d6', 'e8f8', 'd6c8'] },
    { name: 'missed mate', fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1', san: 'Qf5', tag: 'missed-mate', best: 'g6g7', bestLine: ['g6g7'], before: { mate: 1 }, after: { cp: 900 } },
    { name: 'developing knight', fen: start, san: 'Nf3', tag: 'development', cls: 'best' },
    { name: 'castling', fen: '4k3/8/8/8/8/8/8/4K2R w K - 0 1', san: 'O-O', tag: 'castling', cls: 'best' },
    { name: 'losing the exchange', fen: '4k3/8/8/8/8/2b5/R1N5/7K w - - 0 1', san: 'Ra1', tag: 'losing-exchange', best: 'a2a3', refutation: ['c3a1', 'c2a1'] },
    { name: 'book opening', fen: start, san: 'e4', tag: 'book', cls: 'book' },
    { name: 'black development', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1', san: 'Nf6', tag: 'development', cls: 'best' },
    { name: 'passed pawn push', fen: '7k/8/8/3P4/8/8/8/K7 w - - 0 1', san: 'd6', tag: 'passed-pawn', cls: 'best' },
    { name: 'stalemate trap', fen: '7k/5K2/8/6Q1/8/8/8/8 w - - 0 1', san: 'Qg6', tag: 'stalemate' },
    { name: 'skewer', fen: '8/8/8/6r1/5k2/8/1B6/7K w - - 0 1', san: 'Bc1', tag: 'skewer', cls: 'best' },
    { name: 'discovered attack', fen: 'q6k/8/8/8/8/8/B7/R5K1 w - - 0 1', san: 'Bb3', tag: 'discovered-attack', cls: 'best' },
    { name: 'trapped knight', fen: '7k/8/8/8/8/1P1p4/1bN5/7K w - - 0 1', san: 'Na1', tag: 'trapped-piece', best: 'h1g1', refutation: ['b2a1'] },
    { name: 'back rank mate', fen: '4r1k1/8/8/8/8/8/5PPP/R5K1 w - - 0 1', san: 'Ra2', tag: 'back-rank', best: 'a1e1', after: { mate: -1 }, refutation: ['e8e1'] },
    { name: 'promotion threat', fen: '7k/8/8/8/8/8/6p1/K7 w - - 0 1', san: 'Ka2', tag: 'promotion-threat', refutation: ['g2g1q'] },
    { name: 'king shield', fen: '6k1/8/8/8/8/8/5PPP/6K1 w - - 0 1', san: 'g4', tag: 'weakens-king', cls: 'good' },
    { name: 'trade while ahead', fen: '4k3/8/8/8/8/8/r7/R3K2Q w Q - 0 1', san: 'Rxa2', tag: 'trade-when-ahead', cls: 'best' },
    { name: 'centre control', fen: start, san: 'e4', tag: 'centre-control', cls: 'best' },
    { name: 'missed pin', fen: '4k3/4n3/8/8/8/8/8/R6K w - - 0 1', san: 'Ra4', tag: 'pin', best: 'a1e1', bestLine: ['a1e1'] },
  ]
  for (const fixture of cases) {
    const c = new Chess(fixture.fen), played = c.move(fixture.san)
    const uci = played.from + played.to + (played.promotion ?? ''), best = fixture.best ?? uci
    const bestSan = new Chess(fixture.fen).move({ from: best.slice(0, 2), to: best.slice(2, 4), promotion: best[4] }).san
    const move = { san: played.san, uci, color: played.color, cls: fixture.cls ?? 'blunder', before: fixture.before ?? { cp: 0 }, after: fixture.after ?? { cp: -500 }, loss: 0.3, best, bestSan, bestLine: fixture.bestLine ?? [best], refutation: fixture.refutation ?? [] }
    const result = explainMove(fixture.fen, move)
    assert.ok(result.tags.includes(fixture.tag), `${fixture.name}: expected ${fixture.tag}, received ${result.tags}`)
    assert.strictEqual(explainMove(fixture.fen, move), result, 'viewed explanation is cached')
    for (const a of result.threats) assert.ok(new Chess(c.fen()).get(a.from), 'threat starts at an existing piece')
    console.log(`PASS ${fixture.name}: ${fixture.tag}`)
  }
  assert.equal(linePositions(start, ['e2e4', 'a1a8', 'e7e5']).length, 1, 'illegal engine suffix is discarded')
  const safe = { san: 'Qh5', uci: 'd1h5', color: 'w', cls: 'brilliant', before: { cp: 500 }, after: { cp: 500 }, best: 'd1h5', bestSan: 'Qh5', loss: 0, bestLine: ['d1h5'], refutation: [] }
  assert.ok(!explainMove(cases[0].fen, safe).tags.includes('hanging-piece'), 'sound sacrifices are not called hanging blunders')
  console.log(`${cases.length} detector cases and cache/legal-line/sacrifice checks passed.`)
} finally { await rm(temp, { recursive: true, force: true }) }
