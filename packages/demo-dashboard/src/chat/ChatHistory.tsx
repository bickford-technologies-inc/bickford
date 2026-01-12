import { useCanon } from '../state/canonStore'
import { getPayloadString } from '../types'
import { useMode } from '../state/modeStore'
import { getStableSessionId } from './session'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

function toChatMessages(events: ReturnType<typeof useCanon>['events']): ChatMessage[] {
  const out: ChatMessage[] = []

  for (const e of events) {
    if (e.kind === 'INTENT') {
      const t = getPayloadString(e.payload, 'text')
      if (t) out.push({ id: e.id, role: 'user', text: t })
    }

    // Keep the chat calm: do not render generic authority events as chat output.
    // Those belong in the log panel (KnowledgeTile), not in the main conversation.

    if (e.kind === 'OBSERVATION') {
      const t = getPayloadString(e.payload, 'text')
      if (t) out.push({ id: e.id, role: 'assistant', text: t })
    }

    if (e.kind === 'ASK') {
      const t = getPayloadString(e.payload, 'question') || getPayloadString(e.payload, 'text')
      if (t) out.push({ id: e.id, role: 'user', text: t })
    }

    if (e.kind === 'ASK_RESULT') {
      const t = getPayloadString(e.payload, 'answer') || getPayloadString(e.payload, 'text')
      if (t) out.push({ id: e.id, role: 'assistant', text: t })
    }
  }

  return out.slice(-50)
}

export function ChatHistory() {
  const { events } = useCanon()
  const { mode } = useMode()
  const sessionId = getStableSessionId(mode)

  const scoped = events
    .filter((e) => e.meta?.sessionId === sessionId)
    .slice()
    // CanonStore keeps events sorted newest-first; chat should read oldest-first.
    .reverse()

  const messages = toChatMessages(scoped)

  if (messages.length === 0) {
    return <div className="chatEmpty">No messages yet.</div>
  }

  return (
    <div className="chatHistory" aria-label="chat history">
      {messages.map((m) => (
        <div key={m.id} className={`chatMsg ${m.role}`}>
          {m.text}
        </div>
      ))}
    </div>
  )
}
