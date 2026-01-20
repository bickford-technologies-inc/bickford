import * as React from 'react'
import './App.css'
import UnifiedChatDock from './UnifiedChatDock'

type LedgerEvent = {
  id: string
  ts: string
  kind: string
  payload: unknown
  meta?: {
    sessionId?: string
    actor?: { type: string; id?: string }
    requestId?: string
  }
}

function byTsDesc(a: LedgerEvent, b: LedgerEvent) {
  return String(b.ts).localeCompare(String(a.ts))
}

function getPayloadString(payload: unknown, key: string): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const v = (payload as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : undefined
}

export default function App() {
  const [text, setText] = React.useState('')
  const [events, setEvents] = React.useState<LedgerEvent[]>([])
  const [status, setStatus] = React.useState<'connecting' | 'live' | 'error'>('connecting')

  React.useEffect(() => {
    const es = new EventSource('/api/filing/stream')

    es.addEventListener('open', () => setStatus('live'))
    es.addEventListener('error', () => setStatus('error'))
    es.addEventListener('ledger', (msg) => {
      try {
        const evt = JSON.parse((msg as MessageEvent).data) as LedgerEvent
        setEvents((prev) => {
          if (prev.some((p) => p.id === evt.id)) return prev
          return [evt, ...prev].sort(byTsDesc)
        })
      } catch {
        // ignore
      }
    })

    return () => {
      es.close()
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    setText('')
    await fetch('/api/filing/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed, actorId: 'desktop' }),
    })
  }

  const authority = events.filter((e) => e.kind === 'DECISION_ALLOWED' || e.kind === 'DECISION_DENIED')
  const ledger = events

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">Filing</div>
        <div className={`status ${status}`}>{status}</div>
      </header>

      <main className="main">
        <section className="chat">
          <div className="sectionTitle">Chat → Decision</div>
          <form className="chatRow" onSubmit={submit}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type an intent (demo)"
            />
            <button type="submit">Submit</button>
          </form>
          <div className="hint">
            Submitting emits an INTENT then a DECISION_ALLOWED event, both persisted to an append-only ledger.
          </div>
        </section>

        <section className="grid">
          <div className="col">
            <div className="sectionTitle">Authority Boxes</div>
            <div className="stack">
              {authority.length === 0 ? (
                <div className="empty">No authority events yet.</div>
              ) : (
                authority.slice(0, 8).map((e) => (
                  <div key={e.id} className={`card ${e.kind === 'DECISION_DENIED' ? 'deny' : 'allow'}`}>
                    <div className="cardTop">
                      <div className="pill">{e.kind}</div>
                      <div className="ts">{new Date(e.ts).toLocaleString()}</div>
                    </div>
                    <div className="cardBody">
                      {getPayloadString(e.payload, 'summary') || JSON.stringify(e.payload)}
                    </div>
                    {e.meta?.sessionId ? <div className="meta">session: {e.meta.sessionId}</div> : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="col">
            <div className="sectionTitle">Ledger (Live)</div>
            <div className="stack">
              {ledger.length === 0 ? (
                <div className="empty">Waiting for events…</div>
              ) : (
                ledger.slice(0, 30).map((e) => (
                  <div key={e.id} className="row">
                    <div className="rowLeft">
                      <div className="pill">{e.kind}</div>
                      <div className="ts">{new Date(e.ts).toLocaleTimeString()}</div>
                    </div>
                    <div className="rowBody">
                      {getPayloadString(e.payload, 'text') ||
                        getPayloadString(e.payload, 'summary') ||
                        JSON.stringify(e.payload)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <UnifiedChatDock />
    </div>
  )
}
