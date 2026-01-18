import * as React from 'react'
import './App.css'
import LastExecutionBanner, { type LastExecution } from './LastExecutionBanner'

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

type EventPayload = {
  summary?: string
  [key: string]: unknown
}

type LedgerEvent = {
  id?: string
  ts?: string
  kind?: string
  payload?: EventPayload
  meta?: unknown
}

const FALLBACK_REPLY = 'Response received'
const DEFAULT_AUTO_INTENT = "I'm using Bickford on Bickford in Bickford"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object') return value as Record<string, unknown>
  return null
}

function extractReply(obj: Record<string, unknown> | null): string | null {
  // Try reply field first (primary response from backend)
  if (typeof obj?.reply === 'string') {
    return obj.reply
  }
  // Fallback: extract summary from events array for backward compatibility
  if (Array.isArray(obj?.events) && obj.events.length > 0) {
    const lastEvent = obj.events[obj.events.length - 1] as LedgerEvent
    if (lastEvent?.payload?.summary) {
      return lastEvent.payload.summary
    }
    return FALLBACK_REPLY
  }
  return null
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

function nowIso() {
  return new Date().toISOString()
}

function fmtTime(iso: string | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString()
}

function ledgerLine(ev: LedgerEvent): string {
  const kind = ev.kind ? String(ev.kind) : 'EVENT'
  const payload = ev.payload ?? {}

  if (typeof payload.summary === 'string' && payload.summary.trim()) return payload.summary
  if (typeof payload.text === 'string' && payload.text.trim()) return payload.text

  const asAny = payload as Record<string, unknown>
  const decision = typeof asAny.decision === 'string' ? asAny.decision : null
  if (decision) return `${kind}: ${decision}`

  return kind
}

type ChatPostResult = {
  ok: boolean
  reply?: string
  content?: string
  message?: { role?: string; content?: string }
  requestId?: string
  sessionId?: string
  events?: LedgerEvent[]
  reason?: string
}

// Helper: normalize API chat responses (supports fallback shapes).
function normalizeChatReply(data: unknown): string {
  const obj = asRecord(data)
  const reply = obj && typeof obj.reply === 'string' ? obj.reply : null
  const content = obj && typeof obj.content === 'string' ? obj.content : null

  const msg = obj ? asRecord(obj.message) : null
  const msgContent = msg && typeof msg.content === 'string' ? msg.content : null

  const text = obj && typeof obj.text === 'string' ? obj.text : null

  const out = reply ?? content ?? msgContent ?? text
  return out ? out : JSON.stringify(data)
}

export default function App() {
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')
  const [summary, setSummary] = React.useState<DerekSummary | null>(null)

  const [intentText, setIntentText] = React.useState('')
  const [executing, setExecuting] = React.useState(false)
  const [lastExecution, setLastExecution] = React.useState<LastExecution | null>(null)
  const [lastAuthority, setLastAuthority] = React.useState<{
    ts: string
    decision?: string
    summary?: string
    requestId?: string
    sessionId?: string
  } | null>(null)

  const [chatText, setChatText] = React.useState('')
  const [sending, setSending] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])

  const [chatOpen, setChatOpen] = React.useState(true)

  const [ledgerEvents, setLedgerEvents] = React.useState<LedgerEvent[]>([])
  const [ledgerStatus, setLedgerStatus] = React.useState<'connecting' | 'live' | 'polling' | 'error'>('connecting')
  const [ledgerBootstrapped, setLedgerBootstrapped] = React.useState(false)

  const ledgerStatusRef = React.useRef(ledgerStatus)
  React.useEffect(() => {
    ledgerStatusRef.current = ledgerStatus
  }, [ledgerStatus])

  const sessionIdRef = React.useRef(`sess_${Date.now()}`)
  const didAutoRunRef = React.useRef(false)

  async function runIntent(text: string) {
    const trimmed = text.trim()
    if (!trimmed || executing) return

    setExecuting(true)
    setLastAuthority({
      ts: nowIso(),
      decision: 'ACKNOWLEDGED',
      summary: 'Intent received. Writing to ledger and deciding…',
    })

    try {
      const result = await postChat(trimmed, 'derek')
      const authority = Array.isArray(result.events)
        ? result.events.find((ev) => ev.kind === 'DECISION_ALLOWED' || ev.kind === 'DECISION_DENIED')
        : undefined

      const payload = authority?.payload && asRecord(authority.payload)
      const decision = payload && typeof payload.decision === 'string' ? payload.decision : undefined
      const summaryText = payload && typeof payload.summary === 'string' ? payload.summary : result.reply

      const inferredDecision: LastExecution['decision'] =
        decision === 'ALLOW' || decision === 'DENY'
          ? decision
          : authority?.kind === 'DECISION_DENIED'
            ? 'DENY'
            : authority?.kind === 'DECISION_ALLOWED'
              ? 'ALLOW'
              : 'ALLOW'

      setLastExecution({
        intent: trimmed,
        decision: inferredDecision,
        ts: nowIso(),
      })

      setLastAuthority({
        ts: nowIso(),
        decision,
        summary: summaryText,
        requestId: result.requestId,
        sessionId: result.sessionId,
      })
      setIntentText('')
    } catch (err: unknown) {
      setLastExecution({
        intent: trimmed,
        decision: 'ERROR',
        ts: nowIso(),
      })
      setLastAuthority({
        ts: nowIso(),
        decision: 'ERROR',
        summary: getErrorMessage(err),
      })
    } finally {
      setExecuting(false)
      refreshSummary()
    }
  }

  async function postChat(text: string, mode: string): Promise<ChatPostResult> {
    const r = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: text,
        actorId: 'desktop',
        sessionId: sessionIdRef.current,
        mode,
      }),
    })

    const j: unknown = await r.json().catch(() => null)
    const obj = asRecord(j)
    const reply = extractReply(obj)
    const reason = typeof obj?.reason === 'string' ? obj.reason : null

    if (!r.ok) {
      throw new Error(reply || reason || `chat ${r.status}`)
    }

    const normalized = normalizeChatReply(j)
    const out = (obj ?? {}) as ChatPostResult
    return {
      ...out,
      ok: true,
      reply: normalized,
      content: normalized,
    }
  }

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

  React.useEffect(() => {
    let cancelled = false

    async function loadRecent() {
      try {
        const r = await fetch('/api/filing/ledger/recent?limit=80')
        if (!r.ok) throw new Error(`ledger ${r.status}`)
        const j = (await r.json()) as { events?: LedgerEvent[] }
        if (!cancelled) {
          setLedgerEvents(Array.isArray(j.events) ? j.events : [])
          setLedgerBootstrapped(true)
        }
      } catch {
        if (!cancelled) {
          setLedgerStatus('error')
          setLedgerBootstrapped(true)
        }
      }
    }

    loadRecent()

    let es: EventSource | null = null
    try {
      es = new EventSource('/api/filing/stream')
      setLedgerStatus('connecting')
      es.onopen = () => {
        if (!cancelled) setLedgerStatus('live')
      }
      es.addEventListener('ledger', (evt) => {
        try {
          const data = (evt as MessageEvent).data
          const parsed = JSON.parse(String(data)) as LedgerEvent
          if (!cancelled) {
            setLedgerEvents((prev) => {
              const next = [...prev, parsed]
              return next.slice(-120)
            })
          }
        } catch {
          // ignore
        }
      })
      es.onerror = () => {
        if (!cancelled) setLedgerStatus('polling')
      }
    } catch {
      setLedgerStatus('polling')
    }

    const poll = window.setInterval(() => {
      if (ledgerStatusRef.current === 'polling') loadRecent()
    }, 1500)

    return () => {
      cancelled = true
      window.clearInterval(poll)
      try {
        es?.close()
      } catch {
        // ignore
      }
    }
  }, [])

  React.useEffect(() => {
    // Auto-run exactly once per page load, after we know whether this is a fresh ledger.
    // This makes the demo self-running without user interaction.
    if (!ledgerBootstrapped) return
    if (didAutoRunRef.current) return
    if (ledgerEvents.length > 0) return

    didAutoRunRef.current = true

    // Allow disabling from the URL for dev.
    const params = new URLSearchParams(window.location.search)
    const noAuto = params.get('noauto')
    if (noAuto === '1' || noAuto === 'true') return

    const intentOverride = params.get('intent')
    const text = intentOverride && intentOverride.trim() ? intentOverride : DEFAULT_AUTO_INTENT
    void runIntent(text)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerBootstrapped, ledgerEvents.length])

  async function executeIntent(e: React.FormEvent) {
    e.preventDefault()
    await runIntent(intentText)
  }

  async function submitChat(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = chatText.trim()
    if (!trimmed || sending) return

    setSending(true)
    setChatText('')

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}_u`,
      role: 'user',
      content: trimmed,
      ts: nowIso(),
    }
    setMessages((prev) => [...prev, userMsg])

    try {
      const result = await postChat(trimmed, 'derek')
      const replyText = result.reply ?? FALLBACK_REPLY

      const assistantMsg: ChatMessage = {
        id: `m_${Date.now()}_a`,
        role: 'assistant',
        content: replyText,
        ts: nowIso(),
      }
      setMessages((prev) => [...prev, assistantMsg])
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
        <section className="layout layoutAuthority">
          <div className="executionCard">
            <div className="cardHeader">
              <div className="sectionTitle">Authority</div>
              <div className="headerMeta">
                <span className="chip">Session: {sessionIdRef.current}</span>
              </div>
            </div>

            <form className="executeRow" onSubmit={executeIntent}>
              <input
                value={intentText}
                onChange={(e) => setIntentText(e.target.value)}
                placeholder={executing ? 'Executing…' : 'State intent. Bickford decides & logs.'}
              />
              <button type="submit" disabled={executing}>
                Execute
              </button>
              <button
                type="button"
                className="secondaryButton"
                disabled={executing}
                onClick={() => {
                  setIntentText(DEFAULT_AUTO_INTENT)
                  void runIntent(DEFAULT_AUTO_INTENT)
                }}
              >
                Auto
              </button>
            </form>

            <div className={`authorityBanner ${lastAuthority?.decision ? lastAuthority.decision.toLowerCase() : ''}`}>
              <div className="authorityTop">
                <div className="authorityTitle">{lastAuthority?.decision ? lastAuthority.decision : 'READY'}</div>
                <div className="authorityTs">
                  {lastAuthority?.ts ? fmtTime(lastAuthority.ts) : fmtTime(nowIso())}
                </div>
              </div>
              <div className="authoritySummary">
                {lastAuthority?.summary
                  ? lastAuthority.summary
                  : 'Execution is the point: submit intent, get a decision, and observe the ledger.'}
              </div>
              {(lastAuthority?.requestId || lastAuthority?.sessionId) && (
                <div className="authorityMeta">
                  {lastAuthority.requestId ? <span>requestId: {lastAuthority.requestId}</span> : null}
                  {lastAuthority.sessionId ? <span>sessionId: {lastAuthority.sessionId}</span> : null}
                </div>
              )}
            </div>

            <div className="executionFooter">
              <div className="smallNote">
                {summary?.llm.available ? (
                  <span>LLM: available{summary.llm.model ? ` (${summary.llm.model})` : ''}</span>
                ) : (
                  <span>LLM: not configured</span>
                )}
              </div>
            </div>
          </div>

          <div className="ledgerCard">
            <div className="cardHeader">
              <div className="sectionTitle">Ledger</div>
              <div className="headerMeta">
                <span className={`status ${ledgerStatus === 'live' ? 'ready' : ledgerStatus === 'error' ? 'error' : ''}`}>
                  {ledgerStatus}
                </span>
                <a className="link" href="/api/filing/ledger/recent" target="_blank" rel="noreferrer">
                  Open log
                </a>
              </div>
            </div>

            <div id="ledger" className="ledgerBody">
              {ledgerEvents.length === 0 ? (
                <div className="empty">No events yet. Execute an intent to generate authority.</div>
              ) : (
                ledgerEvents
                  .slice()
                  .reverse()
                  .map((ev, idx) => (
                    <div key={`${ev.id ?? idx}_${idx}`} className="ledgerItem">
                      <div className="ledgerTop">
                        <div className="ledgerKind">{ev.kind || 'EVENT'}</div>
                        <div className="ledgerTs">
                          {fmtTime(ev.ts)}
                        </div>
                      </div>
                      <div className="ledgerSummary">{ledgerLine(ev)}</div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </section>

        <aside className={`chatDock chatDockFloating ${chatOpen ? 'open' : 'closed'}`}>
          <div className="cardHeader">
            <div className="sectionTitle">Chat (utility)</div>
            <div className="headerMeta">
              <button className="dockToggle" type="button" onClick={() => setChatOpen((v) => !v)}>
                {chatOpen ? 'Hide' : 'Show'}
              </button>
              <div className={`status ${status}`}>{status}</div>
            </div>
          </div>

          {chatOpen ? (
            <>
              <div className="chatBody">
                {messages.length === 0 ? (
                  <div className="empty">Ask for clarification, but execute above.</div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`msg ${m.role}`}>
                      <div className="msgRole">{m.role === 'user' ? 'You' : 'Bickford'}</div>
                      <div className="msgText">{m.content}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="dockFooter">
                <form className="chatRow" onSubmit={submitChat}>
                  <input
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder={sending ? 'Sending…' : 'Ask (won’t dominate)'}
                  />
                  <button type="submit" disabled={sending}>
                    Send
                  </button>
                </form>

                <div className="growthMini">
                  <div className="growthMiniValue">{summary ? summary.growth.ledgerEvents : '—'}</div>
                  <div className="growthMiniLabel">
                    ledger events · last:{' '}
                    {summary?.growth.lastEventTs ? new Date(summary.growth.lastEventTs).toLocaleTimeString() : '—'}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </aside>

        {lastExecution ? (
          <LastExecutionBanner
            execution={lastExecution}
            onViewLedger={() => {
              const el = document.getElementById('ledger')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          />
        ) : null}
      </main>
    </div>
  )
}
