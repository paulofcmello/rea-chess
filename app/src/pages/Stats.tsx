import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BarChart, LineChart, ResultBar, ResultDonut, type ChartPoint } from '../components/InsightCharts'
import { TIME_CLASSES, fetchArchives, fetchMonth, type CcGame } from '../lib/ccGames'
import { Engine } from '../lib/engine'
import { PHASES, PIECES, analyzedMoves, average, dateKey, filterGames, gameAccuracy, groups, importedGame, moveAccuracy, prepareGames, record, terminationLabel, withReviews, type AnalyzedMove, type ReviewedGame } from '../lib/insights'
import { type InsightFilters } from '../lib/insights'
import { RESULT_COLORS, type InsightGame } from '../lib/insightsStore'
import { CLASSIFICATIONS, CLASS_COLOR, CLASS_LABEL, bookPliesFromEcoUrl, reviewGame } from '../lib/review'
import { saveReview } from '../lib/reviewCache'
import { useStored } from '../lib/storage'
import { openReview } from './Review'

const TABS = ['Overview', 'Results', 'Accuracy', 'Moves', 'Openings', 'Pieces', 'Time Management'] as const
const TIME_COLORS = { bullet: '#e5ae38', blitz: '#81b64c', rapid: '#5d9be6', daily: '#b792d6', untimed: '#a7a6a2' }
const fmt = (value: number | null, suffix = '') => value == null ? '—' : `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}${suffix}`
const accuracy = (games: ReviewedGame[]) => average(games.flatMap(g => gameAccuracy(g) == null ? [] : [gameAccuracy(g)!]))
const labelColor = (color: string) => color === 'w' ? 'White' : 'Black'
const resultPoints = (buckets: [string, ReviewedGame[]][]): ChartPoint[] => buckets.filter(([, games]) => games.length).map(([label, games]) => ({ label, value: games.length ? record(games).win / games.length * 100 : 0, detail: `${games.length} games · ${record(games).win} W / ${record(games).draw} D / ${record(games).loss} L` }))
const accuracyPoints = (buckets: [string, AnalyzedMove[]][]): ChartPoint[] => buckets.filter(([, moves]) => moves.length).map(([label, moves]) => ({ label, value: moveAccuracy(moves)!, detail: `${moves.length} reviewed moves` }))

function Card({ title, note, children, wide = false }: { title: string; note?: string; children: ReactNode; wide?: boolean }) {
  return <section className={`insights-card ${wide ? 'insights-wide' : ''}`}><h2>{title}</h2>{note && <p className="insights-caption">{note}</p>}{children}</section>
}
function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="insights-metric"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
}
function ReviewEmpty() { return <p className="insights-no-data">Analyze your games to see this insight. Completed reviews appear automatically.</p> }
function openGame(game: ReviewedGame) {
  const me = { username: game.me, rating: game.rating }
  const opponent = { username: game.opponent, rating: game.opponentRating }
  openReview({ pgn: game.pgn, url: game.id, me: game.me, white: game.color === 'w' ? me : opponent, black: game.color === 'b' ? me : opponent })
}
function MoveBreakdown({ moves }: { moves: AnalyzedMove[] }) {
  const classes = CLASSIFICATIONS.filter(cls => moves.some(m => m.evaluation.cls === cls) || cls !== 'forced')
  return moves.length ? <BarChart unit="%" points={classes.map(cls => { const count = moves.filter(m => m.evaluation.cls === cls).length; return { label: CLASS_LABEL[cls], value: count / moves.length * 100, color: CLASS_COLOR[cls], detail: `${count} of ${moves.length} moves` } })} /> : <ReviewEmpty />
}

export default function Stats() {
  const [username] = useStored('ccUsername', '')
  const [imports] = useStored<CcGame[]>(`games:${username.trim().toLowerCase()}`, [])
  const [localGames] = useStored<InsightGame[]>('insights:localGames', [])
  const [reviewVersion] = useStored('insights:reviewVersion', 0)
  const [puzzleHistory] = useStored<{ solved: boolean; playedAt?: number; delta: number }[]>('puzzleHistory', [])
  const [puzzleRating] = useStored('puzzleRating', 800)
  const [solveLog] = useStored<Record<string, number>>('solveLog', {})
  const [botRecords] = useStored<Record<string, { w: number; d: number; l: number }>>('botRecords', {})
  const [tab, setTab] = useState<typeof TABS[number]>('Overview')
  const [filters, setFilters] = useState<InsightFilters>({ timeClass: 'all', color: 'all', days: 'all', source: 'all' })
  const [now] = useState(() => Date.now())
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [batchSize, setBatchSize] = useState('5')
  const [progress, setProgress] = useState<{ done: number; total: number; fraction: number; message: string; running: boolean } | null>(null)
  const jobRef = useRef<{ cancelled: boolean; engine: Engine } | null>(null)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (jobRef.current) {
        jobRef.current.cancelled = true
        jobRef.current.engine.stop()
        jobRef.current.engine.destroy()
      }
    }
  }, [])

  const prepared = useMemo(() => prepareGames([...imports.flatMap(g => { const next = importedGame(g, username); return next ? [next] : [] }), ...localGames]), [imports, localGames, username])
  const selected = useMemo(() => filterGames(prepared, filters, now), [prepared, filters, now])
  // The store revision also covers reviews completed from the Game Review page.
  const games = useMemo(() => withReviews(selected), [selected, reviewVersion]) // eslint-disable-line react-hooks/exhaustive-deps
  const moves = useMemo(() => analyzedMoves(games), [games])
  const reviewed = games.filter(g => g.review && g.sans.length)
  const pending = games.filter(g => !g.review && g.sans.length)
  const dailyAccuracy = groups(reviewed, g => dateKey(g.playedAt)).map(([label, bucket]) => ({ label, value: accuracy(bucket)!, detail: `${bucket.length} reviewed games` }))
  const dailyGames = groups(games, g => dateKey(g.playedAt)).map(([label, bucket]) => ({ label, value: bucket.length }))
  const bestWin = games.filter(g => g.result === 'win' && g.opponentRating != null).sort((a, b) => b.opponentRating! - a.opponentRating!)[0]
  const totalRecord = record(games)
  const datedPuzzles = puzzleHistory.filter(p => p.playedAt != null && (filters.days === 'all' || p.playedAt >= now - Number(filters.days) * 86400000))
  const shownPuzzles = filters.days === 'all' ? puzzleHistory : datedPuzzles
  const puzzleDays = Object.entries(solveLog).filter(([date]) => filters.days === 'all' || new Date(`${date}T12:00:00`).getTime() >= now - Number(filters.days) * 86400000).sort(([a], [b]) => a.localeCompare(b))
  const oldBotTotal = Object.values(botRecords).reduce((n, r) => n + r.w + r.d + r.l, 0)
  const timeMoves = games.flatMap(g => g.plies.flatMap((p, index) => p.color === g.color && p.seconds != null ? [{ ...p, cls: g.review?.moves[index]?.cls }] : []))
  const endClocks = games.flatMap(g => { const last = g.plies.filter(p => p.color === g.color).at(-1); return last?.clock != null ? [last.clock] : [] })

  const importLatest = async () => {
    setImporting(true)
    setImportError('')
    try {
      const archives = await fetchArchives(username)
      if (archives[0]) await fetchMonth(archives[0], true)
      else if (mounted.current) setImportError('No public games found. Choose another username in My Games.')
    } catch (e) { if (mounted.current) setImportError(e instanceof Error ? e.message : 'Could not import games.') }
    finally { if (mounted.current) setImporting(false) }
  }
  const analyze = async () => {
    if (jobRef.current || !pending.length) return
    const queue = pending.slice(0, batchSize === 'all' ? pending.length : Number(batchSize))
    const job = { cancelled: false, engine: new Engine() }
    jobRef.current = job
    let done = 0
    let failed = 0
    let lastError = ''
    setProgress({ done, total: queue.length, fraction: 0, running: true, message: 'Starting Stockfish…' })
    try {
      for (const game of queue) {
        if (job.cancelled) break
        try {
          job.engine.newGame()
          const review = await reviewGame(game.startFen, game.sans, {
            search: async (fen, options) => {
              if (job.cancelled) throw new Error('Cancelled')
              const result = await job.engine.search(fen, options)
              if (job.cancelled) throw new Error('Cancelled')
              return result
            },
          }, (ply, total) => {
            if (!job.cancelled && mounted.current) setProgress({ done, total: queue.length, fraction: (done + failed + ply / total) / queue.length, running: true, message: `Game ${done + failed + 1} of ${queue.length} · vs ${game.opponent} · position ${ply}/${total}` })
          }, bookPliesFromEcoUrl(game.headers.ECOUrl))
          if (job.cancelled) break
          saveReview(game.key, review)
          done++
        } catch (e) {
          if (job.cancelled) break
          failed++
          lastError = e instanceof Error ? e.message : 'Analysis failed.'
        }
      }
    } finally {
      job.engine.stop()
      job.engine.destroy()
      jobRef.current = null
      if (mounted.current) setProgress({ done, total: queue.length, fraction: job.cancelled ? (done + failed) / queue.length : 1, running: false, message: `${job.cancelled ? 'Cancelled' : 'Finished'} · ${done} games reviewed${failed ? ` · ${failed} failed: ${lastError}` : ''}. Completed reviews are saved.` })
    }
  }
  const cancel = () => {
    const job = jobRef.current
    if (!job) return
    job.cancelled = true
    job.engine.stop()
    setProgress(p => p && { ...p, message: 'Cancelling…' })
  }

  return <div className="page insights-page">
    <header className="insights-header"><div><span className="insights-eyebrow">YOUR CHESS, IN FOCUS</span><h1><span aria-hidden="true">💡</span> Insights</h1><p>Discover the patterns behind your play.</p></div><a className="cc-button cc-secondary" href="#/games">My Games ↗</a></header>
    <div className="insights-filters" aria-label="Game filters">
      <label>Time class<select value={filters.timeClass} onChange={e => setFilters(f => ({ ...f, timeClass: e.target.value as InsightFilters['timeClass'] }))}><option value="all">All time classes</option>{[...TIME_CLASSES, 'untimed'].map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}</select></label>
      <label>Colour<select value={filters.color} onChange={e => setFilters(f => ({ ...f, color: e.target.value as InsightFilters['color'] }))}><option value="all">Both colours</option><option value="w">White</option><option value="b">Black</option></select></label>
      <label>Date range<select value={filters.days} onChange={e => setFilters(f => ({ ...f, days: e.target.value as InsightFilters['days'] }))}>{[['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 365 days'], ['all', 'All time']].map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
      <label>Source<select value={filters.source} onChange={e => setFilters(f => ({ ...f, source: e.target.value as InsightFilters['source'] }))}><option value="all">All sources</option><option value="chess.com">chess.com</option><option value="REA">REA</option></select></label>
    </div>
    <div className="insights-data-note"><span>{games.length.toLocaleString()} games · {reviewed.length} reviewed{username && ` · ${username}`}</span>{username && <button className="insights-link" disabled={importing} onClick={() => void importLatest()}>{importing ? 'Importing…' : 'Import latest month'}</button>}<a href="#/games">Import other months ↗</a></div>
    <p className="insights-caption">Based on imported games and saved REA games. All time covers the games saved in this browser. Dates and hours use your device’s time zone.</p>
    {importError && <p className="error" role="alert">{importError}</p>}
    {prepared.length < imports.length + localGames.length && <p className="error" role="status">Some games have invalid or unsupported PGN and were skipped.</p>}
    {(pending.length > 0 || progress) && <div className="insights-review-banner">
      <div><strong>{pending.length} games not reviewed yet</strong><p>Analyze to unlock accuracy, move quality, and piece insights. You can explore every tab while it runs.</p></div>
      {!progress?.running ? <div className="insights-batch-actions"><label className="insights-sr-only" htmlFor="insights-batch-size">Games to analyze</label><select id="insights-batch-size" value={batchSize} onChange={e => setBatchSize(e.target.value)}><option value="5">Next 5 games</option><option value="20">Next 20 games</option><option value="all">All unreviewed</option></select><button className="cc-button cc-primary" disabled={!pending.length} onClick={() => void analyze()}>Analyze</button></div> : <button className="cc-button cc-secondary" onClick={cancel}>Cancel analysis</button>}
      {progress && <div className="insights-progress"><progress max="1" value={progress.fraction} aria-label="Batch review progress" /><span role="status">{progress.message}</span></div>}
    </div>}
    <div className="insights-tabs" role="tablist" aria-label="Insights sections">{TABS.map(t => <button key={t} id={`insights-tab-${t.replaceAll(' ', '-')}`} role="tab" aria-selected={tab === t} aria-controls="insights-panel" tabIndex={tab === t ? 0 : -1} onClick={() => setTab(t)} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const index = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : (TABS.indexOf(t) + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length; setTab(TABS[index]); document.getElementById(`insights-tab-${TABS[index].replaceAll(' ', '-')}`)?.focus() } }}>{t}</button>)}</div>
    <div id="insights-panel" role="tabpanel" aria-labelledby={`insights-tab-${tab.replaceAll(' ', '-')}`} className="insights-panel">
      <div className="insights-section-heading"><h2>{tab}</h2><span>{tab === 'Overview' ? 'How is your chess evolving?' : tab === 'Results' ? 'Where do you win your games?' : tab === 'Time Management' ? 'Make every second count.' : 'Find your strengths and your next step.'}</span></div>
      {!games.length ? <div className="insights-empty"><span aria-hidden="true">♟</span><h2>{prepared.length ? 'No games match these filters' : 'Your next insight starts with a game'}</h2><p>{prepared.length ? 'Try a wider date range, another colour, or a different source.' : 'Import your games to explore results, accuracy, openings, and more. Completed bot and friend games will appear here too.'}</p><a className="cc-button cc-primary" href="#/games">Import your games</a></div> : <div className="insights-grid">
        {tab === 'Overview' && <>
          <Card title="Games played"><ResultDonut {...totalRecord} /></Card>
          <Card title="Your performance" note={`${reviewed.length} of ${games.length} games reviewed`}><div className="insights-metrics"><Metric label="Average accuracy" value={fmt(accuracy(reviewed), '%')} note="Reviewed games only" /><Metric label="Win rate" value={fmt(totalRecord.win / games.length * 100, '%')} /><Metric label="Best win" value={bestWin ? fmt(bestWin.opponentRating!) : '—'} note={bestWin ? `${bestWin.opponent} · ${bestWin.timeClass}` : 'No rated opponent wins yet'} /><Metric label="Games" value={fmt(games.length)} note={`${games.filter(g => g.source === 'REA').length} from REA`} /></div>{bestWin && <button className="insights-link" onClick={() => openGame(bestWin)}>Review your best win ↗</button>}</Card>
          <Card title="Rating over time" note="Daily closing rating for each time class · imported rated games only" wide><LineChart series={TIME_CLASSES.map(t => ({ label: t, color: TIME_COLORS[t], points: groups(games.filter(g => g.timeClass === t && g.source === 'chess.com' && g.rated && g.rating != null), g => dateKey(g.playedAt)).map(([label, bucket]) => ({ label, value: bucket.at(-1)!.rating!, detail: `${bucket.length} games` })) })).filter(s => s.points.length)} /></Card>
          <Card title="Games over time"><LineChart zero series={[{ label: 'Games played', color: '#008cd1', points: dailyGames }]} /></Card>
          <Card title="Average accuracy over time">{reviewed.length ? <LineChart percent unit="%" series={[{ label: 'Accuracy', color: '#81b64c', points: dailyAccuracy }]} /> : <ReviewEmpty />}</Card>
          <Card title="Recent games" wide><div className="insights-recent">{games.slice(-8).reverse().map(g => <button key={g.id} onClick={() => openGame(g)}><span className="insights-result-chip" style={{ background: RESULT_COLORS[g.result] }}>{g.result === 'win' ? 'W' : g.result === 'draw' ? 'D' : 'L'}</span><span><strong>{g.opponent}</strong><small>{g.timeClass} · {new Date(g.playedAt).toLocaleDateString()}</small></span><b>{fmt(gameAccuracy(g), '%')}</b></button>)}</div></Card>
        </>}
        {tab === 'Results' && <>
          <Card title="Win rate by colour"><BarChart unit="%" max={100} points={resultPoints((['w', 'b'] as const).map(c => [labelColor(c), games.filter(g => g.color === c)]))} /></Card>
          <Card title="Win rate by time class"><BarChart unit="%" max={100} points={resultPoints([...TIME_CLASSES, 'untimed'].map(t => [t, games.filter(g => g.timeClass === t)]).filter(([, gs]) => gs.length) as [string, ReviewedGame[]][])} /></Card>
          <Card title="Win rate by day of week"><BarChart unit="%" max={100} points={resultPoints(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => [day, games.filter(g => new Date(g.playedAt).getDay() === i)]).filter(([, gs]) => gs.length) as [string, ReviewedGame[]][])} /></Card>
          <Card title="Win rate by hour of day" note="Local time · hours with games"><BarChart unit="%" max={100} points={resultPoints(groups(games, g => `${String(new Date(g.playedAt).getHours()).padStart(2, '0')}:00`).sort(([a], [b]) => a.localeCompare(b)))} /></Card>
          {(['win', 'draw', 'loss'] as const).map(result => <Card key={result} title={`Games you ${result === 'win' ? 'won' : result === 'draw' ? 'drew' : 'lost'} by…`}><BarChart unit="%" max={100} points={groups(games.filter(g => g.result === result), g => terminationLabel(g.termination)).map(([label, bucket]) => ({ label, value: bucket.length / totalRecord[result] * 100, color: RESULT_COLORS[result], detail: `${bucket.length} games` }))} /></Card>)}
        </>}
        {tab === 'Accuracy' && <>
          <Card title="Accuracy over time" note={`${reviewed.length} reviewed games · daily averages`} wide>{reviewed.length ? <LineChart percent unit="%" series={[{ label: 'Accuracy', color: '#81b64c', points: dailyAccuracy }]} /> : <ReviewEmpty />}</Card>
          <Card title="Accuracy by game phase"><BarChart unit="%" max={100} points={accuracyPoints(PHASES.map(phase => [phase, moves.filter(m => m.phase === phase)]))} /><p className="insights-caption">Opening: first 10 moves. Endgame: reduced material or after move 40. Remaining moves: middlegame.</p></Card>
          <Card title="Accuracy by opponent rating"><BarChart unit="%" max={100} points={groups(reviewed.filter(g => g.opponentRating != null), g => `${Math.floor(g.opponentRating! / 400) * 400}–${Math.floor(g.opponentRating! / 400) * 400 + 399}`).sort(([, a], [, b]) => a[0].opponentRating! - b[0].opponentRating!).map(([label, bucket]) => ({ label, value: accuracy(bucket)!, detail: `${bucket.length} reviewed games` }))} /></Card>
        </>}
        {tab === 'Moves' && <>
          <Card title="Move quality" note={`${moves.length.toLocaleString()} reviewed moves · your moves only`}><MoveBreakdown moves={moves} /></Card>
          <Card title="By game phase">{PHASES.map(phase => <div className="insights-subsection" key={phase}><h3>{phase}</h3><MoveBreakdown moves={moves.filter(m => m.phase === phase)} /></div>)}</Card>
          <Card title="Compare colours" wide><div className="insights-colour-grid">{(['w', 'b'] as const).map(c => <div key={c}><h3>{labelColor(c)}</h3><MoveBreakdown moves={moves.filter(m => m.game.color === c)} /></div>)}</div></Card>
          <Card title="Move quality per game" wide>{reviewed.length ? <div className="insights-quality-games">{reviewed.slice().reverse().map(g => { const own = g.review!.moves.filter(m => m.color === g.color); return <div key={g.id}><button className="insights-link" onClick={() => openGame(g)}>{new Date(g.playedAt).toLocaleDateString()} · {g.opponent}</button><svg className="insights-quality-bar" viewBox="0 0 1000 18" preserveAspectRatio="none" role="img" aria-label={`Move quality vs ${g.opponent}`}>{CLASSIFICATIONS.map((cls, i) => { const n = own.filter(m => m.cls === cls).length; const before = own.filter(m => CLASSIFICATIONS.indexOf(m.cls) < i).length; return n > 0 && <rect key={cls} x={before / own.length * 1000} y="0" width={n / own.length * 1000} height="18" fill={CLASS_COLOR[cls]}><title>{CLASS_LABEL[cls]}: {n} ({fmt(n / own.length * 100, '%')})</title></rect> })}</svg><small>{own.length} moves · {fmt(gameAccuracy(g), '%')}</small></div> })}</div> : <ReviewEmpty />}</Card>
        </>}
        {tab === 'Openings' && (['w', 'b'] as const).map(color => <Card key={color} title={`When playing ${labelColor(color)}`} note="Accuracy covers your reviewed opening-phase moves." wide>
          {games.some(g => g.color === color) ? <table className="insights-openings"><thead><tr><th>Opening</th><th>Games</th><th>W / D / L</th><th>Accuracy</th></tr></thead><tbody>{groups(games.filter(g => g.color === color), g => `${g.eco}|${g.opening}`).sort(([, a], [, b]) => b.length - a.length).map(([name, bucket]) => { const ids = new Set(bucket.map(g => g.id)); const r = record(bucket); return <tr key={name}><td><small>{bucket[0].eco}</small><strong>{bucket[0].opening}</strong></td><td>{bucket.length}</td><td><ResultBar {...r} /><small>{r.win} / {r.draw} / {r.loss}</small></td><td>{fmt(moveAccuracy(moves.filter(m => ids.has(m.game.id) && m.phase === 'Opening')), '%')}</td></tr> })}</tbody></table> : <p className="insights-no-data">No games as {labelColor(color).toLowerCase()} in this selection.</p>}
        </Card>)}
        {tab === 'Pieces' && <>
          <Card title="Accuracy per piece"><BarChart unit="%" max={100} points={accuracyPoints(Object.entries(PIECES).map(([piece, label]) => [label, moves.filter(m => m.piece === piece)]))} /></Card>
          <Card title="Blunder rate per piece"><BarChart unit="%" max={100} points={Object.entries(PIECES).flatMap(([piece, label]) => { const bucket = moves.filter(m => m.piece === piece); const n = bucket.filter(m => m.evaluation.cls === 'blunder').length; return bucket.length ? [{ label, value: n / bucket.length * 100, color: CLASS_COLOR.blunder, detail: `${n} blunders / ${bucket.length} moves` }] : [] })} /></Card>
          <Card title="Moves per piece" note="All your moves, including unreviewed games" wide><BarChart points={Object.entries(PIECES).map(([piece, label]) => ({ label, value: games.reduce((n, g) => n + g.plies.filter(m => m.color === g.color && m.piece === piece).length, 0) }))} /></Card>
        </>}
        {tab === 'Time Management' && <>
          <Card title="Your clock" note="Only games with PGN clock annotations contribute." wide><div className="insights-metrics"><Metric label="Average time per move" value={fmt(average(timeMoves.map(m => m.seconds!)), 's')} note={`${timeMoves.length} timed moves`} /><Metric label="Time left at last move" value={fmt(average(endClocks), 's')} note={`${endClocks.length} games with final clocks`} /><Metric label="Games lost on time" value={fmt(games.filter(g => g.result === 'loss' && g.termination === 'timeout').length)} /></div>{!timeMoves.length && <p className="insights-no-data">No move-clock data in this selection. Import games with PGN [%clk] annotations to explore your time management.</p>}</Card>
          <Card title="Time per move by phase"><BarChart unit="s" points={PHASES.flatMap(phase => { const bucket = timeMoves.filter(m => m.phase === phase); return bucket.length ? [{ label: phase, value: average(bucket.map(m => m.seconds!))!, detail: `${bucket.length} timed moves` }] : [] })} /></Card>
          <Card title="Move time vs blunder rate" note="Reviewed timed moves only · increment included"><BarChart unit="%" max={100} points={[[0, 2], [2, 5], [5, 10], [10, 30], [30, Infinity]].flatMap(([low, high]) => { const bucket = timeMoves.filter(m => m.cls && m.seconds! >= low && m.seconds! < high); return bucket.length ? [{ label: high === Infinity ? '30s+' : `${low}–${high}s`, value: bucket.filter(m => m.cls === 'blunder').length / bucket.length * 100, color: CLASS_COLOR.blunder, detail: `${bucket.length} reviewed timed moves` }] : [] })} /></Card>
        </>}
      </div>}
      {tab === 'Overview' && <div className="insights-grid insights-puzzles"><Card title="Puzzle practice" note="Local puzzle history · date range applies; independent of game colour, source, and time class."><div className="insights-metrics"><Metric label="Current rating" value={fmt(puzzleRating)} /><Metric label="Attempts" value={fmt(shownPuzzles.length)} /><Metric label="Solved" value={fmt(shownPuzzles.filter(p => p.solved).length)} /><Metric label="Success rate" value={fmt(shownPuzzles.length ? shownPuzzles.filter(p => p.solved).length / shownPuzzles.length * 100 : null, '%')} /></div>{puzzleHistory.some(p => p.playedAt == null) && <p className="insights-caption">Older attempts have no dates and only appear under All time.</p>}<a className="insights-link" href="#/puzzles">Keep practicing ↗</a></Card><Card title="Puzzles solved by day" note="Most recent 14 active days"><BarChart points={puzzleDays.slice(-14).map(([label, value]) => ({ label, value, color: '#e5ae38' }))} /></Card></div>}
    </div>
    <p className="insights-caption insights-footer">Accuracy uses REA’s local review engine. {oldBotTotal > 0 && `${oldBotTotal} recorded bot results include older games without move history; only saved games appear in these charts. `}Bot and friend game histories are saved from now on. Clock metrics require PGN clock data.</p>
  </div>
}
