import { useEffect, useId, useRef } from 'react'

/** Native modal gives keyboard focus containment, Escape, and focus restoration. */
export default function ConfirmDialog({ title, description, confirmLabel = 'Confirm', onConfirm, onCancel }: {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    return () => dialog.close()
  }, [])
  return <dialog ref={ref} className="cc-confirm-dialog" aria-labelledby={id} aria-describedby={`${id}-description`} onCancel={onCancel}>
    <h2 id={id}>{title}</h2>
    <p id={`${id}-description`}>{description}</p>
    <div className="cc-buttons">
      <button className="cc-button" autoFocus onClick={onCancel}>Cancel</button>
      <button className="cc-button cc-primary" onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </dialog>
}
