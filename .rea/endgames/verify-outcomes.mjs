// Run from the repository root: node docs/evidence/endgames/verify-outcomes.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { endgameOutcome, endgameCompletion } from '../../../app/src/lib/endgames.ts'
const { Chess } = createRequire(new URL('../../../app/package.json', import.meta.url))('chess.js')
const data = JSON.parse(fs.readFileSync(new URL('../../../app/public/data/endgames.json', import.meta.url)))
const drills = data.categories.flatMap(c => c.themes.flatMap(t => t.drills))
assert.equal(data.categories.length, 6)
assert.equal(drills.length, 145)
assert.equal(new Set(drills.map(d => d.id)).size, 145)
let positions = 0
for (const d of drills) for (const fen of [d.fen, ...d.alternativeFens]) { new Chess(fen); positions++ }
const mate = new Chess('7k/6Q1/5K2/8/8/8/8/8 b - - 0 1')
assert.equal(endgameOutcome(mate, 'w', 'Win', 1), 'success')
assert.equal(endgameOutcome(mate, 'b', 'Win', 1), 'failed')
assert.equal(endgameOutcome(mate, 'w', 'Draw', 1), 'success')
assert.equal(endgameOutcome(mate, 'b', 'Draw', 1), 'failed')
const stalemate = new Chess('7k/5K2/8/5Q2/8/8/8/8 b - - 0 1')
assert(stalemate.isStalemate())
assert.equal(endgameOutcome(stalemate, 'w', 'Win', 1), 'failed')
assert.equal(endgameOutcome(stalemate, 'w', 'Draw', 1), 'success')
const insufficient = new Chess('7k/8/8/8/8/8/K7/8 b - - 0 1')
assert.equal(endgameOutcome(insufficient, 'w', 'Draw', 1), 'success')
const fifty = new Chess('7k/8/8/8/8/8/R7/K7 w - - 100 51')
assert.equal(endgameOutcome(fifty, 'w', 'Draw', 1), 'success')
const repetition = new Chess()
for (const m of ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8']) repetition.move(m)
assert.equal(endgameOutcome(repetition, 'w', 'Draw', 4), 'success')
const ongoing = new Chess()
assert.equal(endgameOutcome(ongoing, 'w', 'Win', 0), null)
assert.equal(endgameOutcome(ongoing, 'w', 'Win', 10, 10), 'failed')
ongoing.move('e4')
assert.equal(endgameOutcome(ongoing, 'w', 'Win', 10, 10), null)
assert.deepEqual(endgameCompletion(drills.slice(0, 5), { drills: { [drills[0].id]: { completed: true, attempts: 1 } }, challenges: {} }), { done: 1, total: 5, percent: 20 })
console.log(`PASS: ${positions} valid FENs; catalogue IDs; mate, stalemate, repetition, insufficient material, 50-move rule, move limits, and progress.`)
