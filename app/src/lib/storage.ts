import { useEffect, useState } from 'react'

const PREFIX = 'rea-chess:'

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

const EVENT = 'rea-chess-store'

/** Updates a stored value from outside React and notifies every useStored hook on that key. */
export function updateStored<T>(key: string, fallback: T, fn: (v: T) => T) {
  save(key, fn(load(key, fallback)))
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

/** localStorage-backed state, kept in sync across every component using the same key. */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback))
  useEffect(() => {
    const on = (e: Event) => {
      if ((e as CustomEvent).detail === key) setValue(load(key, fallback))
    }
    window.addEventListener(EVENT, on)
    return () => window.removeEventListener(EVENT, on)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (JSON.stringify(load(key, fallback)) === JSON.stringify(value)) return
    save(key, value)
    window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
  }, [key, value]) // eslint-disable-line react-hooks/exhaustive-deps
  return [value, setValue] as const
}

export interface Settings {
  pieceSet: string
  board: string
  soundTheme: string
  sound: boolean
  showLegal: boolean
  highlightMoves: boolean
  coords: boolean
  animation: 'none' | 'slow' | 'default' | 'fast'
}

export const defaultSettings: Settings = {
  pieceSet: 'neo',
  board: 'green',
  soundTheme: 'default',
  sound: true,
  showLegal: true,
  highlightMoves: true,
  coords: true,
  animation: 'default',
}

/** Settings merged over defaults, so older saved settings pick up new fields. */
export function useSettings() {
  const [stored, setStored] = useStored<Partial<Settings>>('settings', defaultSettings)
  return [{ ...defaultSettings, ...stored } as Settings, setStored as (s: Settings) => void] as const
}
