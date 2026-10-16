// chess.com's animated puzzle coach ("David"), rendered with the official Rive runtime.
// File, state machine and expression triggers were found with REA; emotions follow puzzles.js:
// wrong move / hint → thinking, correct move → impressed, solved → impressed|happy|surprised.
import { useEffect, useRef } from 'react'

const RIVE_RUNTIME = 'https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.44.2/rive.js'
const COACH_RIV = 'https://assets-coaches.chess.com/image/coach_david.riv?v=6ae35776'

export type CoachEmotion = 'idle' | 'greeting' | 'thinking' | 'impressed' | 'happy' | 'surprised' | 'disappointed' | 'concerned'

interface RiveInstance {
  viewModelInstance?: { trigger(name: string): { trigger(): void } | null } | null
  resizeDrawingSurfaceToCanvas(): void
  cleanup(): void
}
type RiveCtor = new (opts: Record<string, unknown>) => RiveInstance

let runtime: Promise<RiveCtor> | null = null
function loadRuntime() {
  runtime ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = RIVE_RUNTIME
    s.onload = () => resolve((window as unknown as { rive: { Rive: RiveCtor } }).rive.Rive)
    s.onerror = reject
    document.head.appendChild(s)
  })
  return runtime
}

export function CoachAvatar({ emotion }: { emotion: CoachEmotion }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const inst = useRef<RiveInstance | null>(null)
  const ready = useRef(false)
  const pending = useRef<CoachEmotion>(emotion)

  useEffect(() => {
    let cancelled = false
    loadRuntime()
      .then((Rive) => {
        if (cancelled || !canvas.current) return
        const r = new Rive({
          src: COACH_RIV,
          canvas: canvas.current,
          autoplay: true,
          autoBind: true,
          stateMachines: 'sm-main',
          onLoad: () => {
            r.resizeDrawingSurfaceToCanvas()
            ready.current = true
            fire(pending.current)
          },
        })
        inst.current = r
      })
      .catch(() => {})
    return () => {
      cancelled = true
      inst.current?.cleanup()
      inst.current = null
      ready.current = false
    }
  }, [])

  const fire = (e: CoachEmotion) => {
    try {
      inst.current?.viewModelInstance?.trigger(e)?.trigger()
    } catch {
      /* older runtime / missing trigger */
    }
  }

  useEffect(() => {
    pending.current = emotion
    if (ready.current) fire(emotion)
  }, [emotion])

  return <canvas ref={canvas} className="coach-canvas" width={128} height={128} />
}
