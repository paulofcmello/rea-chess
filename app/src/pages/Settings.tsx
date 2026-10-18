import { useEffect, useId, useState, type ReactNode } from 'react'
import Board from '../components/Board'
import ConfirmDialog from '../components/ConfirmDialog'
import SettingsIcon from '../components/SettingsIcon'
import { defaultSettings, load, save, useSettings, useStored, type Settings as Preferences } from '../lib/storage'
import { boards, CDN, pieceSets, pieceUrl, soundThemes } from '../lib/theme'
import { play } from '../lib/sound'

const ICONS = 'https://assets-ds.chess.com/color-icons'
const sections = [
  { id: 'board', label: 'Board & Pieces', description: 'Customize the look and feel of your chess set.' },
  { id: 'gameplay', label: 'Gameplay', description: 'Customize your chess playing experience.' },
  { id: 'interface', label: 'Interface', description: 'Customize your REA Chess interface and game notation.' },
  { id: 'coach', label: 'Coach', description: 'Customize your coaching feedback and analysis tools.' },
  { id: 'accessibility', label: 'Accessibility', description: 'Make REA Chess more comfortable to use.' },
  { id: 'puzzles', label: 'Puzzles', description: 'Choose how you practice and track your puzzle progress.' },
  { id: 'data', label: 'Data', description: 'Manage your imports and the data saved on this device.' },
] as const
const PREFIX = 'rea-chess:'
const PREVIEW = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3'

type Section = typeof sections[number]['id']
type SettingRow = { key: string; label: string; description?: string; kind?: 'switch'; descriptionUnderControl?: boolean; control: (id: string) => ReactNode; after?: ReactNode; searchText?: string }
type SettingGroup = { key: string; title?: string; rows: SettingRow[] }
function currentSection(): Section {
  const id = location.hash.split('?')[0].split('/')[2]
  // Keep links to the original sections useful after regrouping.
  if (id === 'sound') return 'board'
  if (id === 'analysis') return 'coach'
  return sections.find((s) => s.id === id)?.id ?? 'board'
}
function Row({ row }: { row: SettingRow }) {
  const id = useId()
  return <div className={`cc-settings-row${row.kind === 'switch' ? ' cc-settings-toggle-row' : ''}`}>
    <div className="cc-settings-label"><label htmlFor={id}>{row.label}</label>{row.description && !row.descriptionUnderControl && <p id={`${id}-description`}>{row.description}</p>}</div>
    <div className="cc-settings-control">{row.control(id)}{row.descriptionUnderControl && <p id={`${id}-description`}>{row.description}</p>}</div>
    {row.after && <div className="cc-settings-row-detail">{row.after}</div>}
  </div>
}
function Radios({ name, label, value, options, disabled, onChange }: { name: string; label: string; value: string; options: Record<string, string>; disabled?: boolean; onChange: (value: string) => void }) {
  return <fieldset className="cc-settings-radios" disabled={disabled}><legend className="cc-settings-sr-only">{label}</legend>{Object.entries(options).map(([key, text]) => <label key={key}><input type="radio" name={name} value={key} checked={value === key} onChange={() => onChange(key)} /><span>{text}</span></label>)}</fieldset>
}
function ThemePicker({ settings, set }: { settings: Preferences; set: (patch: Partial<Preferences>) => void }) {
  const [tab, setTab] = useState<'board' | 'pieceSet'>('board')
  const id = useId()
  const options = tab === 'board' ? Object.fromEntries(Object.entries(boards).map(([key, b]) => [key, b.label])) : pieceSets
  return <div className="cc-settings-theme-picker">
    <div className="cc-settings-theme-tabs" role="tablist" aria-label="Chess set appearance">
      {(['board', 'pieceSet'] as const).map((key) => <button key={key} id={`${id}-${key}`} type="button" role="tab" aria-selected={tab === key} aria-controls={`${id}-themes`} tabIndex={tab === key ? 0 : -1} onClick={() => setTab(key)} onKeyDown={(e) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 'board' : e.key === 'End' ? 'pieceSet' : key === 'board' ? 'pieceSet' : 'board'; setTab(next); document.getElementById(`${id}-${next}`)?.focus() } }}>{key === 'board' ? 'Boards' : 'Pieces'}</button>)}
    </div>
    <div id={`${id}-themes`} className="cc-settings-theme-grid" role="tabpanel" aria-labelledby={`${id}-${tab}`}>
      {Object.entries(options).map(([key, label]) => <button key={`${tab}-${key}`} type="button" className={`cc-settings-theme-tile${settings[tab] === key ? ' selected' : ''}`} title={label} aria-label={label} aria-pressed={settings[tab] === key} onClick={() => set({ [tab]: key })}>
        <img src={`${CDN}/${tab === 'board' ? 'boards' : 'pieces'}/_previews_/square/${key}.png`} alt="" onError={(e) => { const fallback = tab === 'board' ? `${CDN}/boards/${key}/150.png` : pieceUrl('wn', key); if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback }} />
        {settings[tab] === key && <span className="cc-settings-theme-check" aria-hidden="true">✓</span>}
      </button>)}
    </div>
    <div className="cc-settings-preview" aria-label="Live board preview"><Board fen={PREVIEW} movable="both" lastMove={['b8', 'c6']} /></div>
  </div>
}
function MoveIllustration({ method }: { method: Preferences['moveMethod'] }) {
  const titles = { both: 'Drag Pieces + Click Squares', drag: 'Drag Pieces', click: 'Click Squares' }
  const descriptions = { both: 'Move pieces by dragging or by selecting starting and ending squares.', drag: 'Move pieces by dragging them to a new square.', click: 'Move pieces by selecting starting and ending squares.' }
  return <div className="cc-settings-move-preview">
    <div className="cc-settings-mini-board" aria-hidden="true">{['', '', '', '', '', '', '', '', 'wp', 'wp', 'wp', 'wp', 'wk', 'wb', 'wn', 'wr'].map((piece, i) => <span key={i} className={(i + Math.floor(i / 4)) % 2 ? 'dark' : 'light'}>{piece && <img src={pieceUrl(piece, 'neo')} alt="" />}</span>)}<svg className={`cc-settings-move-cursor ${method}`} viewBox="0 0 24 24"><path fill="white" stroke="#555" d="M5 2v17l4-4 4 7 3-2-4-7h6z" /></svg></div>
    <div><strong>{titles[method]}</strong><p>{descriptions[method]}</p></div>
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
      const choices: Record<string, string[]> = { pieceSet: Object.keys(pieceSets), board: Object.keys(boards), soundTheme: Object.keys(soundThemes), animation: ['none', 'slow', 'default', 'fast'], notation: ['figurine', 'letter'], moveMethod: ['both', 'drag', 'click'], botColor: ['w', 'b', 'random'], coordsPosition: ['inside', 'outside'] }
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
  const [query, setQuery] = useState('')
  const [username, setUsername] = useStored('ccUsername', '')
  const [message, setMessage] = useState('')
  const [animationSpeed, setAnimationSpeed] = useState<Preferences['animation']>(settings.animation === 'none' ? 'default' : settings.animation)
  const [pending, setPending] = useState<{ kind: 'reset' } | { kind: 'import'; data: Record<string, string> } | null>(null)
  useEffect(() => {
    const on = () => { setSection(currentSection()); setQuery('') }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const set = (patch: Partial<Preferences>) => setSettings({ ...settings, ...patch })
  const toggle = (key: keyof Preferences, label: string, description?: string, after?: ReactNode): SettingRow => ({ key, label, description, kind: 'switch', after, control: (id) => <button id={id} className="cc-switch" type="button" role="switch" aria-checked={!!settings[key]} aria-describedby={description ? `${id}-description` : undefined} onClick={() => set({ [key]: !settings[key] })}><span /></button> })
  const select = (key: keyof Preferences, label: string, options: Record<string, string>, description?: string, after?: ReactNode): SettingRow => ({ key, label, description, after, searchText: Object.values(options).join(' '), control: (id) => <select id={id} className="cc-select" value={String(settings[key])} aria-describedby={description ? `${id}-description` : undefined} onChange={(e) => set({ [key]: e.target.value })}>{Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select> })
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

  const groups: Record<Section, SettingGroup[]> = {
    board: [
      { key: 'appearance', rows: [
        { key: 'themes', label: 'Boards and Pieces', searchText: `${Object.values(boards).map((b) => b.label).join(' ')} ${Object.values(pieceSets).join(' ')}`, control: () => <ThemePicker settings={settings} set={set} /> },
        toggle('coords', 'Show Board Coordinates', 'Shows the a–h / 1–8 coordinate labels, placed on the perimeter squares of the board (inside) or in the margin around the board (outside).', <Radios name="coordinates" label="Coordinate position" value={settings.coordsPosition} options={{ inside: 'Inside', outside: 'Outside' }} disabled={!settings.coords} onChange={(value) => set({ coordsPosition: value as Preferences['coordsPosition'] })} />),
        toggle('highlightMoves', 'Highlight Last Move', 'See the most recent move with highlights on last square and current square.'),
      ] },
      { key: 'movement', title: 'Piece Movement', rows: [
        select('moveMethod', 'Move Method', { both: 'Drag or click', click: 'Click squares', drag: 'Drag pieces' }, undefined, <MoveIllustration method={settings.moveMethod} />),
        toggle('showLegal', 'Show Legal Moves', 'Show available squares when you select a piece.'),
      ] },
      { key: 'effects', title: 'Board Effects', rows: [
        toggle('boardMarks', 'Board Arrows & Marks', 'Draw arrows and mark squares with the right mouse button.'),
        { key: 'animation', label: 'Piece Animations', searchText: 'Slow Medium default Fast', kind: 'switch', control: (id) => <button id={id} className="cc-switch" type="button" role="switch" aria-checked={settings.animation !== 'none'} onClick={() => { if (settings.animation !== 'none') { setAnimationSpeed(settings.animation); set({ animation: 'none' }) } else set({ animation: animationSpeed }) }}><span /></button>, after: <Radios name="animation" label="Piece animation speed" value={settings.animation === 'none' ? animationSpeed : settings.animation} options={{ slow: 'Slow', default: 'Medium (default)', fast: 'Fast' }} disabled={settings.animation === 'none'} onChange={(value) => { setAnimationSpeed(value as Preferences['animation']); set({ animation: value as Preferences['animation'] }) }} /> },
      ] },
      { key: 'sounds', title: 'Sounds', rows: [
        toggle('sound', 'Play Sounds'),
        { key: 'soundTheme', label: 'Sound Theme', descriptionUnderControl: true, description: 'Selects the audio used for move, capture, and check sounds.', searchText: Object.values(soundThemes).join(' '), control: (id) => <div className="cc-settings-sound-theme"><select id={id} className="cc-select" value={settings.soundTheme} aria-describedby={`${id}-description`} onChange={(e) => { set({ soundTheme: e.target.value }); window.setTimeout(() => play('move-self'), 0) }}>{Object.entries(soundThemes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button className="cc-settings-sound-preview" type="button" aria-label="Preview sound" title="Play a move" onClick={() => play('move-self')}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 8h4l5-5v18l-5-5H3zm12-2v3a4 4 0 0 1 0 6v3a7 7 0 0 0 0-12zm3-3v3a8 8 0 0 1 0 12v3a11 11 0 0 0 0-18z" /></svg></button></div> },
        { key: 'volume', label: 'Volume', control: (id) => <div className="cc-settings-volume"><input id={id} type="range" min="0" max="100" value={Math.round(settings.volume * 100)} onChange={(e) => set({ volume: Number(e.target.value) / 100 })} /><output htmlFor={id}>{Math.round(settings.volume * 100)}%</output></div> },
      ] },
    ],
    gameplay: [{ key: 'gameplay', rows: [
      toggle('autoQueen', 'Always Promote to Queen', 'Hold Alt when promoting to choose another piece.'),
      toggle('premoves', 'Enable Premoves', 'Queue moves during your opponent’s turn in bot and friend games.'),
      toggle('confirmResignDraw', 'Confirm Resign or Draw', 'Ask for confirmation before resigning, offering or accepting a draw.'),
      select('botColor', 'Always Play As', { w: 'White', b: 'Black', random: 'Random' }, 'Default color when you open Play Bots.'),
    ] }],
    interface: [{ key: 'notation', rows: [
      { key: 'notation', label: 'Show Piece Icons in Game Notation', description: 'Use figurine icons in move lists. Turn this off to use letters.', kind: 'switch', control: (id) => <button id={id} className="cc-switch" type="button" role="switch" aria-checked={settings.notation === 'figurine'} aria-describedby={`${id}-description`} onClick={() => set({ notation: settings.notation === 'figurine' ? 'letter' : 'figurine' })}><span /></button> },
    ] }],
    coach: [
      { key: 'general', title: 'General', rows: [
        toggle('reviewCoach', 'Enable Coach', 'Show coaching feedback in Game Review. Retry instructions remain visible.'),
        toggle('reviewExplanations', 'Show Move Explanations', 'Coach explains the ideas behind each reviewed move.'),
      ] },
      { key: 'analysis', title: 'Analysis / Review', rows: [
        { key: 'engineDepth', label: 'Engine Depth', description: 'Maximum search depth on the Analysis board.', control: (id) => <select id={id} className="cc-select" value={settings.engineDepth} aria-describedby={`${id}-description`} onChange={(e) => set({ engineDepth: Number(e.target.value) })}>{[8, 12, 16, 20, 24].map((depth) => <option key={depth} value={depth}>{depth}{depth === 20 ? ' (default)' : ''}</option>)}</select> },
        toggle('showEvalBar', 'Show Evaluation Bar', 'Display the evaluation bar in Analysis and Game Review.'),
        toggle('bestMoveArrow', 'Show Best-Move Arrow', 'Show engine suggestions in Analysis and automatic arrows for mistakes in Review.'),
      ] },
    ],
    accessibility: [{ key: 'motion', rows: [toggle('reduceMotion', 'Reduce Motion', 'Turn off piece slides, tooltip transitions and other animations.')] }],
    puzzles: [{ key: 'puzzles', rows: [
      toggle('puzzleTimer', 'Show Timer', 'Show elapsed time in rated puzzles. Puzzle Rush keeps its game clock.'),
      toggle('puzzleAutoAdvance', 'Auto-advance', 'Go to the next rated or theme puzzle after solving one.'),
      toggle('puzzleRating', 'Show Puzzle Ratings', 'Show your puzzle rating and individual puzzle ratings.'),
    ] }],
    data: [{ key: 'data', rows: [
      { key: 'username', label: 'Chess.com Username', description: 'Used when importing games and viewing your stats.', control: (id) => <input id={id} className="cc-settings-username" value={username} onChange={(e) => setUsername(e.target.value.trim())} placeholder="Username" maxLength={25} autoCapitalize="none" spellCheck={false} /> },
      { key: 'export', label: 'Export All REA Data', description: 'Download your preferences, progress, records and imported data as JSON.', control: (id) => <button id={id} className="cc-button" type="button" onClick={exportData}>Export JSON</button> },
      { key: 'import', label: 'Import REA Data', description: 'Restore a JSON export. This replaces the REA data on this device.', control: (id) => <input id={id} className="cc-settings-file" type="file" accept=".json,application/json" onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; try { setPending({ kind: 'import', data: readBackup(await file.text()) }); setMessage('') } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not read this file.') } }} /> },
      { key: 'reset', label: 'Reset Progress', description: 'Clear ratings, puzzle history, game records and imported games. Keep settings and your import username.', control: (id) => <button id={id} className="cc-button danger" type="button" onClick={() => setPending({ kind: 'reset' })}>Reset progress</button> },
    ] }],
  }
  const search = query.trim().toLocaleLowerCase()
  const visibleSections = sections.filter((s) => search || s.id === section).map((s) => ({ ...s, groups: groups[s.id].map((group) => ({ ...group, rows: group.rows.filter((row) => !search || `${s.label} ${group.title ?? ''} ${row.label} ${row.description ?? ''} ${row.searchText ?? ''}`.toLocaleLowerCase().includes(search)) })).filter((group) => group.rows.length) })).filter((s) => s.groups.length)
  const resultCount = visibleSections.reduce((count, s) => count + s.groups.reduce((sum, group) => sum + group.rows.length, 0), 0)

  return <div className="cc-settings-page">
    <h1><img src={`${ICONS}/settings.svg`} alt="" />Settings</h1>
    <div className="cc-settings-layout">
      <aside className="cc-settings-sidebar">
        <div className="cc-settings-search"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.5 1a9.5 9.5 0 1 0 5.6 17.2l5.6 5.6 2.1-2.1-5.6-5.6A9.5 9.5 0 0 0 10.5 1m0 3a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13" /></svg><input type="search" aria-label="Search Settings" placeholder="Search Settings" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <nav className="cc-settings-nav" aria-label="Settings sections">
          {sections.map((s) => <a key={s.id} href={`#/settings/${s.id}`} aria-current={!search && section === s.id ? 'page' : undefined} className={!search && section === s.id ? 'active' : ''} onClick={() => { setSection(s.id); setQuery('') }}>{s.id === 'puzzles' ? <img src={`${ICONS}/puzzle-piece.svg`} alt="" /> : s.id === 'data' ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h18v18H3zm3 3v4h12V6zm0 7v2h7v-2zm0 4v2h7v-2zm10-4v6h2v-6z" /></svg> : <SettingsIcon name={s.id} />}<span>{s.label}</span></a>)}
        </nav>
      </aside>
      <section className="cc-settings-card" aria-labelledby="settings-section-title">
        {search && <header className="cc-settings-results-header"><h2 id="settings-section-title">Search Results</h2><p role="status">{resultCount ? `${resultCount} ${resultCount === 1 ? 'setting' : 'settings'} matching “${query.trim()}”` : `No settings found for “${query.trim()}”. Try another search.`}</p></header>}
        {visibleSections.map((s) => <div key={s.id} className="cc-settings-section">
          <header><h2 id={search ? `settings-${s.id}-title` : 'settings-section-title'}>{s.label}</h2><p>{s.description}</p></header>
          {s.groups.map((group) => <div key={group.key} className={`cc-settings-group${group.title ? ' cc-settings-titled-group' : ''}`}>
            {group.title && <h3>{group.title}</h3>}
            {group.rows.map((row) => row.key === 'themes' ? <div key={row.key} className="cc-settings-appearance">{row.control('settings-themes')}</div> : <Row key={row.key} row={row} />)}
          </div>)}
        </div>)}
        {message && <p className="cc-settings-message" role="status">{message}</p>}
      </section>
    </div>
    {pending && <ConfirmDialog title={pending.kind === 'reset' ? 'Reset all progress?' : 'Restore this backup?'} description={pending.kind === 'reset' ? 'Your ratings, puzzle history, bot records and imported games will be cleared. This cannot be undone. Export a backup first if you want to keep them.' : `Replace all REA data on this device with ${Object.keys(pending.data).length} saved entries? Export a backup first if you want to keep your current data.`} confirmLabel={pending.kind === 'reset' ? 'Reset progress' : 'Restore backup'} onCancel={() => setPending(null)} onConfirm={confirmData} />}
  </div>
}
