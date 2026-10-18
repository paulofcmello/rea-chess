import { lazy, Suspense, useEffect, useState } from 'react'
import Home from './pages/Home'
import Puzzles from './pages/Puzzles'
import Rush from './pages/Rush'
import Themes from './pages/Themes'
import Daily from './pages/Daily'
import Bots from './pages/Bots'
import Games from './pages/Games'
import Stats from './pages/Stats'
import Analysis from './pages/Analysis'
import Review from './pages/Review'
import Settings from './pages/Settings'
import Endgames from './pages/Endgames'
import { useSettings } from './lib/storage'
import { pieceUrl } from './lib/theme'

const Friend = lazy(() => import('./pages/Friend'))

const ICONS = 'https://assets-ds.chess.com/color-icons'
const routes = {
  '': { label: 'Home', icon: 'home', el: Home },
  bots: { label: 'Play Bots', icon: 'bots', el: Bots },
  friend: { label: 'Play a Friend', icon: 'friends', el: Friend },
  puzzles: { label: 'Puzzles', icon: 'puzzle-piece', el: Puzzles },
  rush: { label: 'Puzzle Rush', icon: 'puzzle-rush', el: Rush },
  daily: { label: 'Daily Puzzle', icon: 'pawn-green', el: Daily },
  themes: { label: 'Themes', icon: 'training', el: Themes },
  endgames: { label: 'Endgames', icon: 'game-endgames', el: Endgames },
  games: { label: 'My Games', icon: 'binoculars', el: Games },
  stats: { label: 'Stats', icon: 'binoculars', el: Stats },
  review: { label: 'Game Review', icon: 'magnifier-star', el: Review },
  settings: { label: 'Settings', icon: 'settings', el: Settings },
  analysis: { label: 'Analysis', icon: 'binoculars', el: Analysis },
} as const

type Route = keyof typeof routes

function currentRoute(): Route {
  const r = location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[0]
  return (r in routes ? r : '') as Route
}

export default function App() {
  const [route, setRoute] = useState<Route>(currentRoute)
  const [settings] = useSettings()
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion)
    return () => document.documentElement.classList.remove('reduce-motion')
  }, [settings.reduceMotion])

  useEffect(() => {
    const on = () => setRoute(currentRoute())
    const openSettings = () => { location.hash = '#/settings' }
    window.addEventListener('hashchange', on)
    window.addEventListener('open-settings', openSettings)
    return () => {
      window.removeEventListener('hashchange', on)
      window.removeEventListener('open-settings', openSettings)
    }
  }, [])

  const Page = routes[route].el

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
          .filter((r) => r !== '' && r !== 'review' && r !== 'settings')
          .map((r) => (
            <a key={r} href={`#/${r}`} className={`nav-item ${route === r ? 'active' : ''}`}>
              <img className="nav-icon" src={r === 'endgames' ? 'https://www.chess.com/bundles/web/images/color-icons/game-endgames.svg' : `${ICONS}/${routes[r].icon}.svg`} alt="" />
              <span className="nav-label">{routes[r].label}</span>
            </a>
          ))}
        <div className="nav-spacer" />
        <a className={`nav-item ${route === 'settings' ? 'active' : ''}`} href="#/settings">
          <img className="nav-icon" src={`${ICONS}/settings.svg`} alt="" />
          <span className="nav-label">Settings</span>
        </a>
      </nav>
      <main className="main">
        <Suspense fallback={<div className="page muted">Loading…</div>}><Page key={route} /></Suspense>
      </main>

    </div>
  )
}
