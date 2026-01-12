import * as React from 'react'
import { useMode } from '../state/modeStore'
import { getStableSessionId } from './session'

export function ChatInput({ placeholder }: { placeholder: string }) {
  const { mode } = useMode()
  const [text, setText] = React.useState('')
  const [sending, setSending] = React.useState(false)

  const sessionId = React.useMemo(() => getStableSessionId(mode), [mode])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setText('')
    setSending(true)
    try {
      await fetch('/api/filing/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bickford-view': mode,
        },
        body: JSON.stringify({ text: trimmed, actorId: 'desktop', sessionId }),
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="chatRow" onSubmit={submit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
      <button type="submit" disabled={sending}>
        {sending ? '…' : 'Send'}
      </button>
    </form>
  )
}
