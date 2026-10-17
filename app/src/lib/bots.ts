import { Chess } from 'chess.js'
import type { Engine } from './engine'

// Roster captured from chess.com's BotGroupService/ListBotGroups (via REA network capture).
export interface Bot {
  id: string
  name: string
  rating: number
  country: string
  image: string
  style?: 'aggressive' | 'defensive' | null
  adapt?: boolean
  group: string
}

export interface BotGroup {
  name: string
  avatar: string
  bots: Bot[]
}

let roster: Promise<BotGroup[]> | null = null
export function loadBots(): Promise<BotGroup[]> {
  roster ??= fetch(`${import.meta.env.BASE_URL}data/bots.json`)
    .then((r) => r.json())
    .then((groups: Omit<BotGroup, 'bots'> & { bots: Omit<Bot, 'group'>[] }[]) =>
      (groups as unknown as { name: string; avatar: string; bots: Omit<Bot, 'group'>[] }[]).map((g) => ({
        ...g,
        // chess.com falls back to a group bot's image when the API avatar is empty
        avatar: g.avatar || g.bots[0]?.image || '',
        bots: g.bots.map((b) => ({ ...b, group: g.name })),
      })),
    )
  return roster
}

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]

/** Generic chat lines (the roster has no phrases for logged-out users). */
export const chat = {
  greet: () => pick(['Hi! Let\u2019s play!', 'Good luck, have fun!', 'Ready when you are.', 'Let\u2019s have a great game!']),
  check: () => pick(['Check!', 'Watch your king!', 'Careful now.', 'Hmm, interesting.']),
  botWon: () => pick(['Good game! Want to play again?', 'That was fun! Rematch?', 'Great game, thanks for playing!']),
  botLost: () => pick(['Well played! You got me.', 'Wow, nice game!', 'Congratulations, great win!']),
  draw: () => pick(['A draw! Well fought.', 'Evenly matched today!']),
}

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
  const t = Math.max(0, (bot.rating - 250) / 1100) // 0 (weakest) .. ~1
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
