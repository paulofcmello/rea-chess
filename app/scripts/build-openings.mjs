// Lichess chess-openings (CC0): https://github.com/lichess-org/chess-openings
// Run from app/: node scripts/build-openings.mjs
import { Chess } from 'chess.js'
import { mkdir, writeFile } from 'node:fs/promises'

const named = {}, prefixes = new Set()
const epd = chess => chess.fen().split(' ').slice(0, 4).join(' ')
const sources = await Promise.all(['a', 'b', 'c', 'd', 'e'].map(async letter => {
  const response = await fetch(`https://raw.githubusercontent.com/lichess-org/chess-openings/master/${letter}.tsv`)
  if (!response.ok) throw new Error(`Opening download failed: ${response.status}`)
  return response.text()
}))
let lines = 0
for (const source of sources) for (const row of source.trim().split('\n').slice(1)) {
  const [eco, name, pgn] = row.trimEnd().split('\t')
  const line = new Chess()
  line.loadPgn(pgn)
  const chess = new Chess()
  for (const san of line.history()) { chess.move(san); prefixes.add(epd(chess)) }
  named[epd(chess)] = [eco, name]
  lines++
}
const output = new URL('../public/data/', import.meta.url)
await mkdir(output, { recursive: true })
await writeFile(new URL('openings.json', output), JSON.stringify(named, null, 2) + '\n')
// Separate membership set: a prefix need not itself have a named opening.
await writeFile(new URL('openings-prefixes.json', output), JSON.stringify([...prefixes].sort(), null, 2) + '\n')
console.log(`${lines} opening lines; ${Object.keys(named).length} named EPDs; ${prefixes.size} book EPDs.`)
