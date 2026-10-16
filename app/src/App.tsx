import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Puzzles from './pages/Puzzles'
import Rush from './pages/Rush'
import Themes from './pages/Themes'
import Daily from './pages/Daily'
import Bots from './pages/Bots'
import Analysis from './pages/Analysis'
import { Modal } from './components/ui'
import Board from './components/Board'
import { useSettings, type Settings } from './lib/storage'
import { boards, pieceSets, pieceUrl, soundThemes } from './lib/theme'
import { play } from './lib/sound'

const ICONS = 'https://assets-ds.chess.com/color-icons'
const routes = {
  '': { label: 'Home', icon: 'home', el: Home },
  bots: { label: 'Play Bots', icon: 'bots', el: Bots },
  puzzles: { label: 'Puzzles', icon: 'puzzle-piece', el: Puzzles },
  rush: { label: 'Puzzle Rush', icon: 'puzzle-rush', el: Rush },
  daily: { label: 'Daily Puzzle', icon: 'pawn-green', el: Daily },
  themes: { label: 'Themes', icon: 'training', el: Themes },
  analysis: { label: 'Analysis', icon: 'binoculars', el: Analysis },
} as const

type Route = keyof typeof routes

function currentRoute(): Route {
  const r = location.hash.replace(/^#\/?/, '').split('?')[0]
  return (r in routes ? r : '') as Route
}

export default function App() {
  const [route, setRoute] = useState<Route>(currentRoute)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useSettings()

  useEffect(() => {
    const on = () => setRoute(currentRoute())
    const openSettings = () => setShowSettings(true)
    window.addEventListener('hashchange', on)
    window.addEventListener('open-settings', openSettings)
    return () => {
      window.removeEventListener('hashchange', on)
      window.removeEventListener('open-settings', openSettings)
    }
  }, [])

  const Page = routes[route].el
  const set = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch })

  return (
    <div className="app">
      <nav className="sidebar">
        <a className="logo" href="#/">
          <img src={pieceUrl('wp', 'neo')} alt="" />
          <span>
            REA<b>Chess</b>
          </span>
        </a>
        {(Object.keys(routes) as Route[])
          .filter((r) => r !== '')
          .map((r) => (
            <a key={r} href={`#/${r}`} className={`nav-item ${route === r ? 'active' : ''}`}>
              <img className="nav-icon" src={`${ICONS}/${routes[r].icon}.svg`} alt="" />
              <span className="nav-label">{routes[r].label}</span>
            </a>
          ))}
        <div className="nav-spacer" />
        <button className="nav-item" onClick={() => setShowSettings(true)}>
          <img className="nav-icon" src={`${ICONS}/settings.svg`} alt="" />
          <span className="nav-label">Settings</span>
        </button>
      </nav>
      <main className="main">
        <Page key={route} />
      </main>

      {showSettings && (
        <Modal onClose={() => setShowSettings(false)}>
          <h2>Board & Pieces</h2>
          <div className="settings">
            <div className="settings-preview">
              <Board fen="r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3" lastMove={['b8', 'c6']} />
            </div>
            <div className="settings-grid">
              <label>
                <span className="muted small">Pieces</span>
                <select value={settings.pieceSet} onChange={(e) => set({ pieceSet: e.target.value })}>
                  {Object.entries(pieceSets).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="muted small">Board</span>
                <select value={settings.board} onChange={(e) => set({ board: e.target.value })}>
                  {Object.entries(boards).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="muted small">Sound theme</span>
                <select
                  value={settings.soundTheme}
                  onChange={(e) => {
                    set({ soundTheme: e.target.value })
                    window.setTimeout(() => play('move-self'), 0)
                  }}
                >
                  {Object.entries(soundThemes).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="muted small">Piece animation</span>
                <select value={settings.animation} onChange={(e) => set({ animation: e.target.value as Settings['animation'] })}>
                  <option value="none">None</option>
                  <option value="slow">Slow</option>
                  <option value="default">Default</option>
                  <option value="fast">Fast</option>
                </select>
              </label>
            </div>
            <div className="settings-checks">
              <label className="check-row">
                <input type="checkbox" checked={settings.sound} onChange={(e) => set({ sound: e.target.checked })} /> Play sounds
              </label>
              <label className="check-row">
                <input type="checkbox" checked={settings.showLegal} onChange={(e) => set({ showLegal: e.target.checked })} /> Show legal moves
              </label>
              <label className="check-row">
                <input type="checkbox" checked={settings.highlightMoves} onChange={(e) => set({ highlightMoves: e.target.checked })} /> Highlight moves
              </label>
              <label className="check-row">
                <input type="checkbox" checked={settings.coords} onChange={(e) => set({ coords: e.target.checked })} /> Show coordinates
              </label>
            </div>
            <button
              className="btn secondary danger"
              onClick={() => {
                if (!confirm('Reset puzzle rating, history, rush scores and bot records?')) return
                for (const k of Object.keys(localStorage)) if (k.startsWith('rea-chess:') && k !== 'rea-chess:settings') localStorage.removeItem(k)
                location.reload()
              }}
            >
              Reset all progress
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
