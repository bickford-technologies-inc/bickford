import * as React from 'react'
import './App.css'

type DerekSummary = {
  ts: string
  knowledgeScore: number
  growth: {
    ledgerEvents: number
    lastEventTs: string | null
  }
  llm: {
    available: boolean
    model?: string
  }
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return null
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

function nowIso() {
  return new Date().toISOString()
}

export default function App() {
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')
  const [summary, setSummary] = React.useState<DerekSummary | null>(null)

  const [text, setText] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])

  const sessionIdRef = React.useRef(`sess_${Date.now()}`)

  async function refreshSummary() {
    try {
      const r = await fetch('/api/derek/summary')
      if (!r.ok) throw new Error(`summary ${r.status}`)
      const j = (await r.json()) as DerekSummary
      setSummary(j)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  React.useEffect(() => {
    refreshSummary()
    const t = window.setInterval(refreshSummary, 5000)
    return () => window.clearInterval(t)
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setText('')

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}_u`,
      role: 'user',
      content: trimmed,
      ts: nowIso(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const r = await fetch('/api/filing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          actorId: 'desktop',
          sessionId: sessionIdRef.current,
          mode: 'derek',
        }),
      })

      const j: unknown = await r.json().catch(() => null)
      const obj = asRecord(j)
      const reply = typeof obj?.reply === 'string' ? obj.reply : null
      const reason = typeof obj?.reason === 'string' ? obj.reason : null

      if (!r.ok) {
        throw new Error(reply || reason || `chat ${r.status}`)
      }

      if (reply) {
        const assistantMsg: ChatMessage = {
          id: `m_${Date.now()}_a`,
          role: 'assistant',
          content: reply,
          ts: nowIso(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      }
    } catch (err: unknown) {
      const assistantMsg: ChatMessage = {
        id: `m_${Date.now()}_a_err`,
        role: 'assistant',
        content: `Error: ${getErrorMessage(err)}`,
        ts: nowIso(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } finally {
      setSending(false)
      refreshSummary()
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">Bickford</div>
        <div className="topbarRight">
          <div className="pill">Mode: DEREK</div>
          <div className="pill">Knowledge: {summary ? summary.knowledgeScore : '—'}</div>
          <a className="link" href="/api/filing/ledger/recent" target="_blank" rel="noreferrer">
            Open log
          </a>
        </div>
      </header>

      <main className="main">
        <section className="layout">
          <div className="chatCard">
            <div className="chatHeader">
              <div className="sectionTitle">Chat</div>
              <div className={`status ${status}`}>{status}</div>
            </div>

            <div className="chatBody">
              {messages.length === 0 ? (
                <div className="empty">Ask a question to start.</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`msg ${m.role}`}>
                    <div className="msgRole">{m.role === 'user' ? 'You' : 'Bickford'}</div>
                    <div className="msgText">{m.content}</div>
                  </div>
                ))
              )}
            </div>

            <form className="chatRow" onSubmit={submit}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={sending ? 'Sending…' : 'Type a message'}
              />
              <button type="submit" disabled={sending}>
                Send
              </button>
            </form>
          </div>

          <div className="rightRail">
            <div className="growthCard">
              <div className="sectionTitle">Growth</div>
              <div className="growthValue">
                {summary ? summary.growth.ledgerEvents : '—'}
              </div>
              <div className="growthHint">ledger events</div>
              <div className="growthMeta">
                last: {summary?.growth.lastEventTs ? new Date(summary.growth.lastEventTs).toLocaleTimeString() : '—'}
              </div>
            </div>

            <div className="smallNote">
              {summary?.llm.available ? (
                <span>LLM: available{summary.llm.model ? ` (${summary.llm.model})` : ''}</span>
              ) : (
                <span>LLM: not configured</span>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
