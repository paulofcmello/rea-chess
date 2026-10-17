import { useId, useState } from 'react'

export function CcUsernameForm({ username = '', autoFocus = false, onSubmit }: { username?: string; autoFocus?: boolean; onSubmit: (username: string) => void }) {
  const [draft, setDraft] = useState(username)
  const id = useId()
  return <form className="games-form" onSubmit={(event) => {
    event.preventDefault()
    if (draft.trim()) onSubmit(draft.trim())
  }}>
    <label htmlFor={id}>Chess.com username</label>
    <div className="games-form-row">
      <input id={id} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Username" autoCapitalize="none" autoCorrect="off" autoFocus={autoFocus} />
      <button className="btn primary" type="submit" disabled={!draft.trim()}>Load games</button>
    </div>
  </form>
}
