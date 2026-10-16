import { Chess } from 'chess.js'
import type { Engine } from './engine'

export interface Bot {
  id: string
  name: string
  rating: number
  avatar: string
  color: string
  tier: 'New to Chess' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Master'
  bio: string
  greet: string
  onCheck: string[]
  onWin: string
  onLose: string
  style?: 'aggressive' | 'defensive'
}

export const bots: Bot[] = [
  { id: 'pip', name: 'Pip', rating: 250, avatar: '🐣', color: '#f6c445', tier: 'New to Chess', bio: 'Just hatched. Knows how the pieces move... mostly.', greet: 'Hi!! Is the horse the one that jumps?', onCheck: ['Uh oh!', 'Is that bad?'], onWin: 'I WON?! Wow!', onLose: 'Good game! You are really good!' },
  { id: 'milo', name: 'Milo', rating: 400, avatar: '🐶', color: '#c98b4a', tier: 'New to Chess', bio: 'Loves chasing pieces around the board.', greet: 'Woof! Let’s play!', onCheck: ['Bark bark!', 'Grrr...'], onWin: 'Good boy points for me!', onLose: 'Can we play fetch now?', style: 'aggressive' },
  { id: 'nora', name: 'Nora', rating: 550, avatar: '👩‍🎨', color: '#e2777a', tier: 'Beginner', bio: 'Paints by day, plays chess by night.', greet: 'Every game is a blank canvas.', onCheck: ['A bold stroke!', 'Hmm, careful now.'], onWin: 'A masterpiece, if I say so myself.', onLose: 'Beautiful play. I’ll paint it.' },
  { id: 'bob', name: 'Bishop Bob', rating: 700, avatar: '🧔', color: '#6c9bd2', tier: 'Beginner', bio: 'Thinks bishops are the best piece. Will argue about it.', greet: 'Diagonals are the way of the future.', onCheck: ['Check! Diagonally, ideally.', 'Ha!'], onWin: 'The bishops prevail once again.', onLose: 'Next time, more bishops.' },
  { id: 'ruth', name: 'Ruth', rating: 900, avatar: '👵', color: '#a77bca', tier: 'Beginner', bio: 'Has played every Sunday since 1968.', greet: 'Sit down dear, I’ll go easy on you.', onCheck: ['Oh my!', 'Watch your king, sweetie.'], onWin: 'Cookies are on the table, dear.', onLose: 'Well played. You remind me of my grandson.', style: 'defensive' },
  { id: 'fork', name: 'Captain Fork', rating: 1100, avatar: '🏴‍☠️', color: '#4d4d4d', tier: 'Intermediate', bio: 'Plunders loose pieces on the high seas.', greet: 'Arr! Hand over yer hanging pieces!', onCheck: ['Arr, check!', 'Walk the plank, king!'], onWin: 'The booty be mine!', onLose: 'Ye sank me ship...', style: 'aggressive' },
  { id: 'lena', name: 'Lena', rating: 1300, avatar: '👩‍💻', color: '#3fa796', tier: 'Intermediate', bio: 'Software engineer who treats openings like code reviews.', greet: 'Let’s see if your opening compiles.', onCheck: ['Exception thrown.', 'Interesting edge case.'], onWin: 'All tests passing on my side.', onLose: 'Okay, that was clean. Merged.' },
  { id: 'viktor', name: 'Viktor', rating: 1500, avatar: '🧑‍🏫', color: '#b5524a', tier: 'Intermediate', bio: 'Club champion. Very serious about the Sicilian.', greet: 'I hope you have prepared.', onCheck: ['Predictable.', 'Mm.'], onWin: 'As expected.', onLose: 'I must review this game.' },
  { id: 'pawnsky', name: 'Professor Pawnsky', rating: 1700, avatar: '🎓', color: '#5c6bc0', tier: 'Advanced', bio: 'Wrote three books on pawn structure. Nobody read them.', greet: 'Pawns are the soul of chess, you know.', onCheck: ['Hm! Ambitious.', 'An instructive moment.'], onWin: 'Chapter 4 explains your mistake.', onLose: 'Remarkable. I shall add a footnote.', style: 'defensive' },
  { id: 'sasha', name: 'Sasha', rating: 1900, avatar: '🦊', color: '#e8833a', tier: 'Advanced', bio: 'Sly, tricky, and loves a swindle.', greet: 'Don’t blink.', onCheck: ['Hehe.', 'Sneaky, sneaky.'], onWin: 'Outfoxed!', onLose: 'Okay, you got me fair and square.', style: 'aggressive' },
  { id: 'gus', name: 'Grandmaster Gus', rating: 2200, avatar: '👴', color: '#8d6e63', tier: 'Master', bio: 'Retired GM. Still remembers every game he ever lost.', greet: 'Show me what you’ve got, kid.', onCheck: ['Not bad.', 'I’ve seen this before.'], onWin: 'Experience wins again.', onLose: 'Impressive. Truly.' },
  { id: 'ivan', name: 'Iron Ivan', rating: 2500, avatar: '🤖', color: '#78909c', tier: 'Master', bio: 'A cold, calculating machine with a heart of steel.', greet: 'CALCULATING YOUR DEFEAT.', onCheck: ['IRRELEVANT.', 'THREAT LOGGED.'], onWin: 'RESULT: EXPECTED.', onLose: 'ERROR. ERROR. RECALIBRATING.' },
  { id: 'max', name: 'Max', rating: 3200, avatar: '🧠', color: '#d81b60', tier: 'Master', bio: 'Full-strength Stockfish. Good luck.', greet: '...', onCheck: ['...'], onWin: 'gg', onLose: 'How?!' },
]

export const tiers: Bot['tier'][] = ['New to Chess', 'Beginner', 'Intermediate', 'Advanced', 'Master']

const pieceValue: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

/**
 * Chooses a move for `bot`. Strong bots use Stockfish's built-in strength limiting (min 1320 Elo);
 * weaker bots sample from MultiPV lines with rating-dependent noise and occasional random moves,
 * which is how human-like low-rated play is usually approximated.
 */
export async function botMove(engine: Engine, bot: Bot, fen: string): Promise<string | null> {
  const chess = new Chess(fen)
  const legal = chess.moves({ verbose: true })
  if (!legal.length) return null
  const uci = (m: (typeof legal)[number]) => m.from + m.to + (m.promotion ?? '')

  if (bot.rating >= 3000) {
    const r = await engine.search(fen, { movetime: 1500, options: { UCI_LimitStrength: false, 'Skill Level': 20 } })
    return r?.bestmove ?? null
  }
  if (bot.rating >= 1350) {
    const r = await engine.search(fen, {
      movetime: 400 + Math.min(1200, bot.rating / 3),
      options: { UCI_LimitStrength: true, UCI_Elo: Math.min(3190, bot.rating), 'Skill Level': 20 },
    })
    return r?.bestmove ?? null
  }

  // Low-rated play.
  const t = (bot.rating - 250) / 1100 // 0 (weakest) .. ~1
  const randomChance = 0.45 * (1 - t) + 0.03
  if (Math.random() < randomChance) {
    let pool = legal
    if (bot.style === 'aggressive') {
      const captures = legal.filter((m) => m.captured)
      if (captures.length && Math.random() < 0.7) pool = captures
    }
    // Even beginners take a free queen or deliver mate-in-one most of the time.
    const mate = legal.find((m) => m.san.endsWith('#'))
    if (mate && Math.random() < 0.6 + 0.4 * t) return uci(mate)
    const best = [...pool].sort((a, b) => pieceValue[b.captured ?? 'k'] - pieceValue[a.captured ?? 'k'])[0]
    if (best.captured && pieceValue[best.captured] >= 5 && Math.random() < 0.5 + 0.5 * t) return uci(best)
    return uci(pool[Math.floor(Math.random() * pool.length)])
  }

  const r = await engine.search(fen, {
    depth: Math.round(3 + t * 7),
    multipv: Math.min(5, legal.length),
    options: { UCI_LimitStrength: false, 'Skill Level': Math.round(t * 8) },
  })
  if (!r) return null
  if (!r.lines.length) return r.bestmove
  const score = (l: (typeof r.lines)[number]) => (l.mate != null ? (l.mate > 0 ? 10000 - l.mate : -10000 - l.mate) : l.cp ?? 0)
  const top = score(r.lines[0])
  const temperature = 220 * (1 - t) + 40
  const weights = r.lines.map((l) => Math.exp(-Math.max(0, top - score(l)) / temperature))
  let x = Math.random() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < weights.length; i++) {
    x -= weights[i]
    if (x <= 0) return r.lines[i].move
  }
  return r.bestmove
}
