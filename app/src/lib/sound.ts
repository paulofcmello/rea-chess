import { settings, soundUrl } from './theme'

export type SoundName =
  | 'move-self'
  | 'move-opponent'
  | 'capture'
  | 'move-check'
  | 'castle'
  | 'promote'
  | 'notify'
  | 'game-start'
  | 'game-end'
  | 'illegal'
  | 'correct'
  | 'incorrect'
  | 'puzzle-correct'

// Puzzle-specific sounds chess.com plays outside the board sound theme (from puzzles.js, via REA).
const PUZZLE_SOUNDS = {
  'puzzle-solved': 'https://assets-ds.chess.com/sounds/puzzles/puzzle-path/puzzle-solved-fee614d.mp3',
  'puzzle-incorrect': 'https://assets-ds.chess.com/sounds/puzzles/puzzle-path/fail-blip-hi-2b78df0.mp3',
  'rush-correct': 'https://assets-ds.chess.com/sounds/puzzles/correct-c1411f4.mp3',
  'rush-incorrect': 'https://assets-ds.chess.com/sounds/puzzles/incorrect-0443f30.mp3',
}
export type PuzzleSound = keyof typeof PUZZLE_SOUNDS

const cache = new Map<string, HTMLAudioElement>()

export function playPuzzle(name: PuzzleSound) {
  if (!settings().sound) return
  let audio = cache.get(name)
  if (!audio) {
    audio = new Audio(PUZZLE_SOUNDS[name])
    cache.set(name, audio)
  }
  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function play(name: SoundName) {
  const s = settings()
  if (!s.sound) return
  const key = `${s.soundTheme}/${name}`
  let audio = cache.get(key)
  if (!audio) {
    audio = new Audio(soundUrl(name, s.soundTheme))
    // Not every theme ships every sound; fall back to the default set.
    if (s.soundTheme !== 'default') audio.onerror = () => cache.set(key, new Audio(soundUrl(name, 'default')))
    cache.set(key, audio)
  }
  audio.currentTime = 0
  audio.play().catch(() => {})
}

/** Plays the chess.com sound for a move, chosen from its SAN like chess.com does. */
export function playMove(san: string, byOpponent = false) {
  if (san.includes('+') || san.includes('#')) play('move-check')
  else if (san.includes('=')) play('promote')
  else if (san.startsWith('O-O')) play('castle')
  else if (san.includes('x')) play('capture')
  else play(byOpponent ? 'move-opponent' : 'move-self')
}
