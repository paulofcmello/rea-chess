import { useEffect, useId, useState, type ReactNode } from 'react'
import Board from '../components/Board'
import ConfirmDialog from '../components/ConfirmDialog'
import { defaultSettings, load, save, useSettings, useStored, type Settings as Preferences } from '../lib/storage'
import { boards, pieceSets, soundThemes } from '../lib/theme'
import { play } from '../lib/sound'

const ICONS = 'https://assets-ds.chess.com/color-icons'
const sections = [
  { id: 'board', label: 'Board & Pieces', icon: 'play-white' },
  { id: 'gameplay', label: 'Gameplay', icon: 'play-white' },
  { id: 'sound', label: 'Sound', icon: 'settings' },
  { id: 'puzzles', label: 'Puzzles', icon: 'puzzle-piece' },
  { id: 'analysis', label: 'Analysis / Review', icon: 'binoculars' },
  { id: 'interface', label: 'Interface', icon: 'settings' },
  { id: 'data', label: 'Data', icon: 'training' },
] as const
const PREFIX = 'rea-chess:'
const PREVIEW = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3'

type Section = typeof sections[number]['id']
function currentSection(): Section {
  const id = location.hash.split('?')[0].split('/')[2]
  return sections.find((s) => s.id === id)?.id ?? 'board'
}
function Row({ label, description, children }: { label: string; description?: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return <div className="cc-settings-row">
    <div className="cc-settings-label"><label htmlFor={id}>{label}</label>{description && <p id={`${id}-description`}>{description}</p>}</div>
    <div className="cc-settings-control">{children(id)}</div>
  </div>
}

/** Raw strings preserve every namespaced localStorage value, including unknown future keys. */
function allData(): Record<string, string> {
  return Object.fromEntries(Object.keys(localStorage).filter((key) => key.startsWith(PREFIX)).map((key) => [key, localStorage.getItem(key)!]))
}
function readBackup(text: string): Record<string, string> {
  const parsed = JSON.parse(text)
  if (parsed?.format !== 'rea-chess' || parsed.version !== 1 || !parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) throw new Error('Choose a REA Chess JSON export.')
  const entries = Object.entries(parsed.data)
  if (!entries.length) throw new Error('This backup is empty.')
  for (const [key, raw] of entries) {
    if (!key.startsWith(PREFIX) || typeof raw !== 'string') throw new Error('The backup contains invalid data.')
    const value = JSON.parse(raw)
    if (key === PREFIX + 'settings') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid settings in backup.')
      const choices: Record<string, string[]> = { pieceSet: Object.keys(pieceSets), board: Object.keys(boards), soundTheme: Object.keys(soundThemes), animation: ['none', 'slow', 'default', 'fast'], notation: ['figurine', 'letter'], moveMethod: ['both', 'drag', 'click'], botColor: ['w', 'b', 'random'] }
      for (const [field, setting] of Object.entries(value)) {
        if (!(field in defaultSettings)) continue
        if (typeof setting !== typeof defaultSettings[field as keyof Preferences] || (choices[field] && !choices[field].includes(setting as string)) || (field === 'volume' && !(Number(setting) >= 0 && Number(setting) <= 1)) || (field === 'engineDepth' && !(Number.isInteger(setting) && Number(setting) >= 8 && Number(setting) <= 24))) throw new Error(`Invalid ${field} in backup.`)
      }
    }
  }
  return parsed.data
}

export default function Settings() {
  const [settings, setSettings] = useSettings()
  const [section, setSection] = useState<Section>(currentSection)
  const [username, setUsername] = useStored('ccUsername', '')
  const [draft, setDraft] = useState(username)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState<{ kind: 'reset' } | { kind: 'import'; data: Record<string, string> } | null>(null)
  useEffect(() => {
    const on = () => setSection(currentSection())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const set = (patch: Partial<Preferences>) => setSettings({ ...settings, ...patch })
  const toggle = (key: keyof Preferences, label: string, description?: string) => <Row key={key} label={label} description={description}>{(id) => <button id={id} className="cc-switch" role="switch" aria-checked={!!settings[key]} aria-describedby={description ? `${id}-description` : undefined} onClick={() => set({ [key]: !settings[key] })}><span /></button>}</Row>
  const select = <K extends keyof Preferences,>(key: K, label: string, options: Record<string, string>, description?: string) => <Row label={label} description={description}>{(id) => <select id={id} className="cc-select" value={String(settings[key])} aria-describedby={description ? `${id}-description` : undefined} onChange={(e) => set({ [key]: e.target.value })}>{Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select>}</Row>
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ format: 'rea-chess', version: 1, exportedAt: new Date().toISOString(), data: allData() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rea-chess-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Backup downloaded.')
  }
  const confirmData = () => {
    if (!pending) return
    const before = allData()
    try {
      if (pending.kind === 'import') {
        for (const key of Object.keys(before)) localStorage.removeItem(key)
        for (const [key, raw] of Object.entries(pending.data)) {
          save(key.slice(PREFIX.length), JSON.parse(raw))
          if (JSON.stringify(load(key.slice(PREFIX.length), null)) !== JSON.stringify(JSON.parse(raw))) throw new Error('Storage is full or unavailable.')
        }
      } else {
        for (const key of Object.keys(before)) if (key !== PREFIX + 'settings' && key !== PREFIX + 'ccUsername') localStorage.removeItem(key)
      }
      location.reload()
    } catch {
      for (const key of Object.keys(allData())) localStorage.removeItem(key)
      for (const [key, raw] of Object.entries(before)) localStorage.setItem(key, raw)
      setPending(null)
      setMessage('Could not restore data. Your previous data has been kept.')
    }
  }

  return <div className="cc-settings-page">
    <h1>Settings</h1>
    <div className="cc-settings-layout">
      <nav className="cc-settings-nav" aria-label="Settings sections">
        {sections.map((s) => <a key={s.id} href={`#/settings/${s.id}`} aria-current={section === s.id ? 'page' : undefined} className={section === s.id ? 'active' : ''}><img src={`${ICONS}/${s.icon}.svg`} alt="" /><span>{s.label}</span><span className="cc-settings-chevron" aria-hidden="true">›</span></a>)}
      </nav>
      <section className="cc-settings-card" aria-labelledby="settings-section-title">
        <header><h2 id="settings-section-title">{sections.find((s) => s.id === section)!.label}</h2><p>Changes are saved automatically on this device.</p></header>
        {section === 'board' && <>
          <div className="cc-settings-preview"><Board fen={PREVIEW} lastMove={['b8', 'c6']} /><span>Board preview</span></div>
          {select('pieceSet', 'Pieces', pieceSets)}
          {select('board', 'Board theme', Object.fromEntries(Object.entries(boards).map(([key, b]) => [key, b.label])))}
          {toggle('coords', 'Show Board Coordinates', 'Show a–h and 1–8 labels inside the board.')}
          {toggle('highlightMoves', 'Highlight Last Move', 'Highlight the starting and ending squares of the last move.')}
          {toggle('showLegal', 'Show Legal Moves', 'Show available squares when you select a piece.')}
          {select('animation', 'Piece Animations', { none: 'None', slow: 'Slow', default: 'Medium (default)', fast: 'Fast' })}
          {select('notation', 'Piece Notation', { figurine: 'Figurine icons', letter: 'Letters' }, 'Choose how pieces appear in move lists.')}
          {toggle('boardMarks', 'Board Arrows & Marks', 'Draw arrows and mark squares with the right mouse button.')}
        </>}
        {section === 'gameplay' && <>
          {toggle('autoQueen', 'Always Promote to Queen', 'Hold Alt when promoting to choose another piece.')}
          {toggle('premoves', 'Enable Premoves', 'Queue moves during your opponent’s turn in bot and friend games.')}
          {toggle('confirmResignDraw', 'Confirm Resign or Draw', 'Ask for confirmation before resigning, offering or accepting a draw.')}
          {select('botColor', 'Always Play As', { w: 'White', b: 'Black', random: 'Random' }, 'Default color when you open Play Bots.')}
          {select('moveMethod', 'Move Method', { both: 'Drag or click', drag: 'Drag pieces', click: 'Click squares' })}
        </>}
        {section === 'sound' && <>
          {toggle('sound', 'Play Sounds')}
          <Row label="Sound Theme">{(id) => <select id={id} className="cc-select" value={settings.soundTheme} onChange={(e) => { set({ soundTheme: e.target.value }); window.setTimeout(() => play('move-self'), 0) }}>{Object.entries(soundThemes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>}</Row>
          <Row label="Volume">{(id) => <div className="cc-settings-volume"><input id={id} type="range" min="0" max="100" value={Math.round(settings.volume * 100)} onChange={(e) => set({ volume: Number(e.target.value) / 100 })} /><output htmlFor={id}>{Math.round(settings.volume * 100)}%</output></div>}</Row>
          <Row label="Preview Sound">{(id) => <button id={id} className="cc-button" onClick={() => play('move-self')}>Play a move</button>}</Row>
        </>}
        {section === 'puzzles' && <>
          {toggle('puzzleTimer', 'Show Timer', 'Show elapsed time in rated puzzles. Puzzle Rush keeps its game clock.')}
          {toggle('puzzleAutoAdvance', 'Auto-advance', 'Go to the next rated or theme puzzle after solving one.')}
          {toggle('puzzleRating', 'Show Puzzle Ratings', 'Show your puzzle rating and individual puzzle ratings.')}
        </>}
        {section === 'analysis' && <>
          <Row label="Engine Depth" description="Maximum search depth on the Analysis board.">{(id) => <select id={id} className="cc-select" value={settings.engineDepth} onChange={(e) => set({ engineDepth: Number(e.target.value) })}>{[8, 12, 16, 20, 24].map((depth) => <option key={depth} value={depth}>{depth}{depth === 20 ? ' (default)' : ''}</option>)}</select>}</Row>
          {toggle('showEvalBar', 'Show Evaluation Bar', 'Display the evaluation bar in Analysis and Game Review.')}
          {toggle('bestMoveArrow', 'Show Best-Move Arrow', 'Show engine suggestions in Analysis and automatic arrows for mistakes in Review.')}
          {toggle('reviewCoach', 'Show Coach', 'Show coaching feedback in Game Review. Retry instructions remain visible.')}
        </>}
        {section === 'interface' && <>
          {toggle('reduceMotion', 'Reduce Motion', 'Turn off piece slides, tooltip transitions and other animations.')}
        </>}
        {section === 'data' && <>
          <Row label="Chess.com Username" description="Used when importing games and viewing your stats.">{(id) => <form className="cc-settings-username" onSubmit={(e) => { e.preventDefault(); setUsername(draft.trim()); setMessage('Import username saved.') }}><input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Username" maxLength={25} /><button className="cc-button" type="submit">Save</button></form>}</Row>
          <Row label="Export All REA Data" description="Download your preferences, progress, records and imported data as JSON.">{(id) => <button id={id} className="cc-button" onClick={exportData}>Export JSON</button>}</Row>
          <Row label="Import REA Data" description="Restore a JSON export. This replaces the REA data on this device.">{(id) => <input id={id} className="cc-settings-file" type="file" accept=".json,application/json" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; try { setPending({ kind: 'import', data: readBackup(await file.text()) }); setMessage('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not read this file.') } }} />}</Row>
          <Row label="Reset Progress" description="Clear ratings, puzzle history, game records and imported games. Keep settings and your import username.">{(id) => <button id={id} className="cc-button danger" onClick={() => setPending({ kind: 'reset' })}>Reset progress</button>}</Row>
          {message && <p className="cc-settings-message" role="status">{message}</p>}
        </>}
      </section>
    </div>
    {pending && <ConfirmDialog title={pending.kind === 'reset' ? 'Reset all progress?' : 'Restore this backup?'} description={pending.kind === 'reset' ? 'Your ratings, puzzle history, bot records and imported games will be cleared. This cannot be undone. Export a backup first if you want to keep them.' : `Replace all REA data on this device with ${Object.keys(pending.data).length} saved entries? Export a backup first if you want to keep your current data.`} confirmLabel={pending.kind === 'reset' ? 'Reset progress' : 'Restore backup'} onCancel={() => setPending(null)} onConfirm={confirmData} />}
  </div>
}
