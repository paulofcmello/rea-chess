// Run from app/: node scripts/capture-reviews.mjs [--count=40]. Requires Node 22+ and logged-in Chrome CDP.
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Chess } from 'chess.js'
const output = fileURLToPath(new URL('../../.rea/review/calibration/', import.meta.url))
export async function connect(options = {}) {
  const tabs = await (await fetch('http://localhost:9222/json/list')).json()
  const tab = options.webSocketDebuggerUrl ? options : tabs.find(t => t.type === 'page' && new URL(t.url).hostname === 'www.chess.com')
  if (!tab) throw new Error('Open a logged-in chess.com tab in debug Chrome on port 9222.')
  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  let id = 0
  const pending = new Map(), listeners = new Set()
  ws.onmessage = event => {
    const m = JSON.parse(event.data)
    if (m.id) { const p = pending.get(m.id); if (!p) return; clearTimeout(p.timer); pending.delete(m.id); if (m.error) p.reject(new Error(m.error.message)); else p.resolve(m.result) }
    else for (const listener of listeners) listener(m.method, m.params)
  }
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const request = ++id
    const timer = setTimeout(() => { pending.delete(request); reject(new Error(`CDP timeout: ${method}`)) }, 45000)
    pending.set(request, { resolve, reject, timer }); ws.send(JSON.stringify({ id: request, method, params }))
  })
  const evaluate = async expression => {
    const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ': ' + r.result.description)
    return r.result.value
  }
  return { call, evaluate, listeners, close: () => ws.close() }
}
const pause = ms => new Promise(r => setTimeout(r, ms))
async function main() {
  await mkdir(output, { recursive: true })
  const c = await connect()
  try {
    await c.call('Page.enable'); await c.call('Network.enable', { maxTotalBufferSize: 100000000, maxResourceBufferSize: 20000000 })
    const get = url => c.evaluate(`fetch(${JSON.stringify(url)}).then(async r => { if (!r.ok) throw new Error('HTTP '+r.status); return r.json() })`)
    const { archives } = await get('https://api.chess.com/pub/player/paulom18/games/archives')
    const count = Math.min(40, Number(process.argv.find(a => a.startsWith('--count='))?.split('=')[1] ?? 40))
    const reviewed = []
    for (const archive of process.argv.includes('--cached-archives') ? [] : archives.toReversed()) {
      const data = await get(archive)
      for (const g of data.games.toReversed()) {
        if (!g.accuracies || g.rules !== 'chess' || !g.url.includes('/live/')) continue
        reviewed.push(g)
      }
    }
    if (process.argv.includes('--cached-archives')) reviewed.push(...JSON.parse(await readFile(`${output}/archive-accuracies.json`, 'utf8')).games)
    reviewed.sort((a, b) => b.end_time - a.end_time)
    if (!process.argv.includes('--cached-archives')) await writeFile(`${output}/archive-accuracies.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), archiveCount: archives.length, games: reviewed }, null, 2))
    const games = reviewed.filter(g => {
      const chess = new Chess(); try { chess.loadPgn(g.pgn) } catch { return false }
      const history = chess.history({ verbose: true })
      return ['w', 'b'].every(color => history.filter(m => m.color === color).length >= 10)
    }).slice(0, count)
    console.log(`${reviewed.length} already-reviewed standard live games across ${archives.length} archives; capturing ${games.length}.`)
    let captured = 0
    for (const game of games) {
      const id = game.url.split('/').pop(), url = `https://www.chess.com/analysis/game/live/${id}?tab=review`
      try { const existing = JSON.parse(await readFile(`${output}/${id}.json`, 'utf8')); if (existing.complete || (process.argv.includes('--resume') && existing.apiAccuracy)) { if (existing.complete) captured++; console.log(`Cached ${id}${existing.complete ? '' : ' (summary unavailable)'}`); continue } } catch { /* capture */ }
      const network = [], requests = new Map(), tasks = new Set(), errors = []
      const relevant = /effectiveElo|gameRatingV2|accuracy|classification|CAPS|tallies/i
      const listener = (method, p) => {
        if (method === 'Network.responseReceived' && ['XHR', 'Fetch'].includes(p.type)) requests.set(p.requestId, p.response.url)
        if (method === 'Network.loadingFinished' && requests.has(p.requestId)) {
          const requestUrl = requests.get(p.requestId)
          const task = c.call('Network.getResponseBody', { requestId: p.requestId }).then(r => {
            const body = r.base64Encoded ? Buffer.from(r.body, 'base64').toString() : r.body
            if (relevant.test(body) || /\/callback\/analysis\/game\//.test(requestUrl)) network.push({ kind: 'response', url: requestUrl, body })
          }).catch(e => errors.push({ url: requestUrl, error: e.message })).finally(() => tasks.delete(task))
          tasks.add(task)
        }
        if (['Network.webSocketFrameReceived', 'Network.webSocketFrameSent'].includes(method) && relevant.test(p.response.payloadData)) network.push({ kind: method, body: p.response.payloadData })
      }
      c.listeners.add(listener)
      await c.call('Page.bringToFront')
      await c.call('Page.navigate', { url })
      await pause(15000)
      let dom, stopReason, expanded = false
      const deadline = Date.now() + 5000
      while (Date.now() < deadline) {
        await pause(1500)
        dom = await c.evaluate(`(() => {
          const text = document.body?.innerText ?? '';
          const rows = [...document.querySelectorAll('.game-overview-row')];
          const values = row => [...(row?.querySelectorAll('.review-rating-component') ?? [])].map(e => ({ text: e.innerText.trim(), title: e.getAttribute('title'), html: e.outerHTML }));
          const accuracy = values(rows.find(r => /Accuracy/.test(r.innerText)));
          const ratings = values(rows.find(r => /Game Rating/.test(r.innerText)));
          const pair = v => ({ w: v[0] && /^\\d/.test(v[0].text) ? Number(v[0].text) : null, b: v[1] && /^\\d/.test(v[1].text) ? Number(v[1].text) : null });
          const fromText = label => { const m = text.match(new RegExp(label + '\\s+(\\d+(?:\\.\\d+)?)\\s+(\\d+(?:\\.\\d+)?)')); return m ? { w: Number(m[1]), b: Number(m[2]) } : undefined };
          return { gameId: window.chesscom?.analysis?.gameId, accuracy: fromText('Accuracy') ?? pair(accuracy), gameRating: fromText('Game Rating') ?? (ratings.length === 2 ? pair(ratings) : undefined), ratingElements: ratings,
            tallies: [...document.querySelectorAll('.tally-row-row')].map(r => ({ label: r.querySelector('.tally-row-rowTitle')?.innerText.trim(), values: [...r.querySelectorAll('.tally-row-value')].map(e => Number(e.textContent.trim())) })).filter(r => /^(Brilliant|Great|Book|Best|Excellent|Good|Inaccuracy|Mistake|Miss|Blunder)$/.test(r.label)),
            notEnoughMoves: /There were not enough moves to rate this game/.test(document.body.innerHTML),
            paywall: /(?:daily limit reached|daily (?:game )?review limit|out of (?:free )?(?:game )?reviews|used (?:up )?your (?:free |daily )?(?:game )?review|upgrade to (?:get|unlock|continue) (?:unlimited |your |game )?reviews)/i.test(text), text: text.slice(-16000) };
        })()`)
        if (dom.paywall && dom.accuracy.w == null) { stopReason = 'Review limit/paywall'; break }
        if (dom.accuracy.w != null && dom.accuracy.b != null && dom.gameRating && dom.tallies.length) {
          await c.call('Page.bringToFront')
          const clicked = !expanded && await c.evaluate(`(() => { const b = document.querySelector('.tallies-collapse button[aria-label="Expand"]'); if (b) { b.click(); return true } return false })()`)
          expanded = true
          if (clicked) continue
          break
        }
      }
      await Promise.allSettled([...tasks]); c.listeners.delete(listener)
      const headers = new Chess(); headers.loadPgn(game.pgn)
      const h = headers.getHeaders()
      const complete = dom?.gameId === id && dom?.accuracy.w != null && dom?.accuracy.b != null && dom?.gameRating && dom?.tallies.length === 10
      if (!complete && !stopReason) stopReason = 'Summary incomplete or review unavailable (see DOM evidence)'
      await writeFile(`${output}/${id}.json`, JSON.stringify({ id, url, pgn: game.pgn, white: game.white, black: game.black, apiAccuracy: { w: game.accuracies.white, b: game.accuracies.black }, ratings: { w: Number(h.WhiteElo) || null, b: Number(h.BlackElo) || null }, capturedAt: new Date().toISOString(), complete: !!complete, stopReason, dom, network, networkErrors: errors }, null, 2))
      if (complete) { captured++; console.log(`Captured ${id}: ${dom.accuracy.w}/${dom.accuracy.b}; Game Rating ${dom.gameRating.w}/${dom.gameRating.b}; ${network.length} payloads`) }
      if (stopReason) { console.log(`${stopReason}; captured ${captured} games.`); if (dom?.paywall) break }
    }
    console.log(`Capture complete: ${captured} games.`)
  } finally { c.close() }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
