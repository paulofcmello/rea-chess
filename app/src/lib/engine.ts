// Thin UCI wrapper around the Stockfish 19 lite single-threaded WASM build.

export interface EngineLine {
  move: string
  pv: string[]
  cp?: number // centipawns from side-to-move's perspective
  mate?: number
  depth: number
}

export interface SearchResult {
  bestmove: string
  lines: EngineLine[]
}

export interface SearchOptions {
  depth?: number
  movetime?: number
  multipv?: number
  options?: Record<string, string | number | boolean>
  onInfo?: (lines: EngineLine[]) => void
}

interface Job {
  fen: string
  opts: SearchOptions
  resolve: (r: SearchResult | null) => void
}

export class Engine {
  private worker: Worker
  private ready: Promise<void>
  private current: Job | null = null
  private pending: Job | null = null
  private lines: EngineLine[] = []
  private listeners: ((line: string) => void)[] = []

  constructor() {
    this.worker = new Worker(`${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`)
    this.worker.onmessage = (e) => this.onLine(String(e.data))
    this.ready = new Promise((resolve) => {
      const wait = (line: string) => {
        if (line === 'uciok') {
          this.listeners = this.listeners.filter((l) => l !== wait)
          resolve()
        }
      }
      this.listeners.push(wait)
    })
    this.send('uci')
  }

  private send(cmd: string) {
    this.worker.postMessage(cmd)
  }

  private onLine(line: string) {
    for (const l of this.listeners) l(line)
    const job = this.current
    if (!job) return
    if (line.startsWith('info') && line.includes(' pv ')) {
      const t = line.split(' ')
      const get = (k: string) => t[t.indexOf(k) + 1]
      const idx = t.includes('multipv') ? Number(get('multipv')) - 1 : 0
      const pv = t.slice(t.indexOf('pv') + 1)
      const entry: EngineLine = { move: pv[0], pv, depth: Number(get('depth')) }
      if (t.includes('cp')) entry.cp = Number(get('cp'))
      if (t.includes('mate')) entry.mate = Number(get('mate'))
      this.lines[idx] = entry
      job.opts.onInfo?.(this.lines.filter(Boolean))
    } else if (line.startsWith('bestmove')) {
      const bestmove = line.split(' ')[1]
      this.current = null
      job.resolve({ bestmove, lines: this.lines.filter(Boolean) })
      this.startNext()
    }
  }

  private startNext() {
    const job = this.pending
    if (!job) return
    this.pending = null
    this.current = job
    this.lines = []
    const { opts } = job
    for (const [k, v] of Object.entries(opts.options ?? {})) this.send(`setoption name ${k} value ${v}`)
    this.send(`setoption name MultiPV value ${opts.multipv ?? 1}`)
    this.send(`position fen ${job.fen}`)
    if (opts.depth) this.send(`go depth ${opts.depth}`)
    else if (opts.movetime) this.send(`go movetime ${opts.movetime}`)
    else this.send('go infinite')
  }

  /** Starts a search, cancelling any in-flight one (whose promise resolves to null). */
  async search(fen: string, opts: SearchOptions = {}): Promise<SearchResult | null> {
    await this.ready
    return new Promise((resolve) => {
      this.pending?.resolve(null)
      this.pending = { fen, opts, resolve }
      if (this.current) {
        this.current.resolve(null)
        this.current.resolve = () => {}
        this.current.opts = { ...this.current.opts, onInfo: undefined }
        this.send('stop')
      } else {
        this.startNext()
      }
    })
  }

  stop() {
    this.pending?.resolve(null)
    this.pending = null
    if (this.current) {
      this.current.resolve(null)
      this.current.resolve = () => {}
      this.current.opts = { ...this.current.opts, onInfo: undefined }
      this.send('stop')
    }
  }

  newGame() {
    this.send('ucinewgame')
  }

  destroy() {
    this.worker.terminate()
  }
}
