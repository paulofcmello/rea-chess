// chess.com piece sets, boards and sounds, loaded at runtime from chess.com's public theme CDN
// (nothing is copied into this repo). Piece set names come from chess.com's own bundle (captured
// with REA's analyze-web-bundle); boards and sound themes were confirmed against the CDN.

import { load, defaultSettings, type Settings } from './storage'

export const CDN = 'https://images.chesscomfiles.com/chess-themes'

export const pieceSets: Record<string, string> = {
  neo: 'Neo',
  game_room: 'Game Room',
  wood: 'Wood',
  glass: 'Glass',
  gothic: 'Gothic',
  classic: 'Classic',
  metal: 'Metal',
  bases: 'Bases',
  neo_wood: 'Neo-Wood',
  icy_sea: 'Icy Sea',
  club: 'Club',
  ocean: 'Ocean',
  newspaper: 'Newspaper',
  space: 'Space',
  cases: 'Cases',
  condal: 'Condal',
  '3d_chesskid': '3D - ChessKid',
  '8_bit': '8-Bit',
  marble: 'Marble',
  book: 'Book',
  alpha: 'Alpha',
  bubblegum: 'Bubblegum',
  dash: 'Dash',
  graffiti: 'Graffiti',
  light: 'Light',
  lolz: 'Lolz',
  luca: 'Luca',
  maya: 'Maya',
  modern: 'Modern',
  nature: 'Nature',
  neon: 'Neon',
  sky: 'Sky',
  tigers: 'Tigers',
  tournament: 'Tournament',
  vintage: 'Vintage',
  '3d_wood': '3D - Wood',
  '3d_staunton': '3D - Staunton',
  '3d_plastic': '3D - Plastic',
  blindfold: 'Blindfold',
}

/** Board name → label, square colors and move-highlight color, from chess.com's own board table. */
export const boards: Record<string, { label: string; light: string; dark: string; highlight: string }> = {
  green: { label: 'Green', light: '#edeed1', dark: '#779952', highlight: '#ffff00' },
  dark_wood: { label: 'Dark Wood', light: '#e7cdb2', dark: '#8d675e', highlight: '#cc9122' },
  brown: { label: 'Brown', light: '#f0d9b5', dark: '#b58863', highlight: '#ffff00' },
  icy_sea: { label: 'Icy Sea', light: '#c5d5dc', dark: '#7a9db2', highlight: '#5ed7f1' },
  newspaper: { label: 'Newspaper', light: '#5a5956', dark: '#5a5956', highlight: '#99976e' },
  walnut: { label: 'Walnut', light: '#c0a684', dark: '#835f42', highlight: '#d1a52d' },
  sky: { label: 'Sky', light: '#efefef', dark: '#c2d7e2', highlight: '#65daf7' },
  light: { label: 'Light', light: '#dcdcdc', dark: '#aaaaaa', highlight: '#a4b8c4' },
  lolz: { label: 'Lolz', light: '#e0e9e9', dark: '#909898', highlight: '#a3becd' },
  stone: { label: 'Stone', light: '#c8c3bd', dark: '#666463', highlight: '#36525f' },
  bases: { label: 'Bases', light: '#efcca1', dark: '#c26b38', highlight: '#f5cc2a' },
  '8_bit': { label: '8-Bit', light: '#f3f3f4', dark: '#6a9b41', highlight: '#ffff00' },
  marble: { label: 'Marble', light: '#c7bdaa', dark: '#706b66', highlight: '#f0db86' },
  purple: { label: 'Purple', light: '#efefef', dark: '#8877b7', highlight: '#7dacc9' },
  translucent: { label: 'Translucent', light: '#282f3f', dark: '#667188', highlight: '#5b91b3' },
  metal: { label: 'Metal', light: '#c9c9c9', dark: '#6e6e6e', highlight: '#a3becd' },
  tan: { label: 'Tan', light: '#fce4b2', dark: '#d08b18', highlight: '#f7d84a' },
  orange: { label: 'Orange', light: '#fce4b2', dark: '#d08b18', highlight: '#ffff00' },
  bubblegum: { label: 'Bubblegum', light: '#fff3f3', dark: '#f9cdd3', highlight: '#de5d6f' },
  red: { label: 'Red', light: '#f0d8bf', dark: '#ba5546', highlight: '#f8f893' },
  glass: { label: 'Glass', light: '#667188', dark: '#282f3f', highlight: '#5b91b3' },
  neon: { label: 'Neon', light: '#b9b9b9', dark: '#636363', highlight: '#6d90a6' },
  graffiti: { label: 'Graffiti', light: '#aeaeae', dark: '#b96f18', highlight: '#f39011' },
  sand: { label: 'Sand', light: '#e5d3c4', dark: '#b8a590', highlight: '#e2bc87' },
  tournament: { label: 'Tournament', light: '#ebece8', dark: '#316549', highlight: '#a4c25b' },
  overlay: { label: 'Overlay', light: '#4878a0', dark: '#789ebd', highlight: '#0d9acf' },
  burled_wood: { label: 'Burled Wood', light: '#d9b088', dark: '#895132', highlight: '#ee9016' },
  blue: { label: 'Blue', light: '#ececd7', dark: '#4d6d92', highlight: '#00a5ff' },
  parchment: { label: 'Parchment', light: '#f0d9b5', dark: '#b58863', highlight: '#d8cc66' },
  dash: { label: 'Dash', light: '#bd9257', dark: '#6b3a27', highlight: '#eca722' },
  checkers: { label: 'Checkers', light: '#999999', dark: '#e3a6a9', highlight: '#fae18a' },
}

export const soundThemes: Record<string, string> = {
  default: 'Default',
  nature: 'Nature',
  beat: 'Beat',
  silly: 'Silly',
  lolz: 'Lolz',
  marble: 'Marble',
  newspaper: 'Newspaper',
  space: 'Space',
  metal: 'Metal',
}

export function settings(): Settings {
  return { ...defaultSettings, botColor: load<Settings['botColor']>('botColor', defaultSettings.botColor), ...load<Partial<Settings>>('settings', {}) }
}

/** `code` is color + piece type, e.g. "wp", "bk". */
export function pieceUrl(code: string, set = settings().pieceSet, size: 50 | 150 | 300 = 150) {
  return `${CDN}/pieces/${set in pieceSets ? set : 'neo'}/${size}/${code.toLowerCase()}.png`
}

export function boardUrl(board = settings().board, size: 50 | 150 = 150) {
  return `${CDN}/boards/${board in boards ? board : 'green'}/${size}.png`
}

export function soundUrl(name: string, theme = settings().soundTheme) {
  return `${CDN}/sounds/_MP3_/${theme in soundThemes ? theme : 'default'}/${name}.mp3`
}
