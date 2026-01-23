import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'

type ChatRole = 'user' | 'agent'

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  timestamp: number
}

type ChatArchive = {
  date: string
  messages: ChatMessage[]
}

type ChatState = {
  currentDate: string
  messages: ChatMessage[]
  archives: ChatArchive[]
}

const STORAGE_KEY = 'bickford.chat.unified.v1'
const LEGACY_DAILY_KEY = 'bickford.chat.daily.v1'
const LEGACY_HISTORY_KEY = 'bickford.chat.history'
const LEGACY_HISTORY_DAY_KEY = 'bickford.chat.history.day'
const LEGACY_ARCHIVE_KEY = 'bickford.chat.archive'
const AGENT_NAME = 'bickford'
const ARCHIVE_NOTE =
  'single agent for the full environment • archives chat history daily at local midnight'

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function todayKey() {
  return formatLocalDate(new Date())
}

function utcKey(date: Date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function utcDateKeyToLocal(dateKey: string) {
  const parsed = new Date(`${dateKey}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) {
    return dateKey
  }
  return formatLocalDate(parsed)
}

function migrateUtcDates(state: ChatState): ChatState {
  const localToday = todayKey()
  const utcToday = utcKey()
  if (state.currentDate !== utcToday || state.currentDate === localToday) {
    return state
  }
  return {
    ...state,
    currentDate: utcDateKeyToLocal(state.currentDate),
    archives: state.archives.map((archive) => ({
      ...archive,
      date: utcDateKeyToLocal(archive.date),
    })),
  }
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function normalizeMessages(
  messages: Array<{
    id?: string
    role?: string
    content?: string
    text?: string
    author?: string
    timestamp?: number | string
  }>,
): ChatMessage[] {
  return messages
    .filter((message) => message)
    .map((message) => {
      const role = message.role ?? message.author ?? 'agent'
      const normalizedRole: ChatRole = role === 'user' ? 'user' : 'agent'
      return {
        id: message.id ?? crypto.randomUUID(),
        role: normalizedRole,
        content: message.content ?? message.text ?? '',
        timestamp:
          typeof message.timestamp === 'number'
            ? message.timestamp
            : Number.isFinite(Date.parse(String(message.timestamp)))
              ? Date.parse(String(message.timestamp))
              : Date.now(),
      }
    })
    .filter((message) => message.content.trim().length > 0)
}

function hydrateState(): ChatState {
  if (typeof window === 'undefined') {
    return { currentDate: todayKey(), messages: [], archives: [] }
  }

  const stored = safeParse<ChatState>(window.localStorage.getItem(STORAGE_KEY))
  if (stored) {
    return migrateUtcDates({
      currentDate: stored.currentDate ?? todayKey(),
      messages: Array.isArray(stored.messages) ? normalizeMessages(stored.messages) : [],
      archives: Array.isArray(stored.archives)
        ? stored.archives.map((archive) => ({
            date: archive.date,
            messages: normalizeMessages(archive.messages ?? []),
          }))
        : [],
    })
  }

  const legacyDaily = safeParse<ChatState>(window.localStorage.getItem(LEGACY_DAILY_KEY))
  if (legacyDaily) {
    return migrateUtcDates({
      currentDate: legacyDaily.currentDate ?? todayKey(),
      messages: Array.isArray(legacyDaily.messages) ? normalizeMessages(legacyDaily.messages) : [],
      archives: Array.isArray(legacyDaily.archives)
        ? legacyDaily.archives.map((archive) => ({
            date: archive.date,
            messages: normalizeMessages(archive.messages ?? []),
          }))
        : [],
    })
  }

  const legacyMessages = safeParse<ChatMessage[]>(window.localStorage.getItem(LEGACY_HISTORY_KEY))
  const legacyArchives = safeParse<ChatArchive[]>(window.localStorage.getItem(LEGACY_ARCHIVE_KEY))
  const legacyDay = window.localStorage.getItem(LEGACY_HISTORY_DAY_KEY)

  return migrateUtcDates({
    currentDate: legacyDay ?? todayKey(),
    messages: Array.isArray(legacyMessages) ? normalizeMessages(legacyMessages) : [],
    archives: Array.isArray(legacyArchives)
      ? legacyArchives.map((archive) => ({
          date: archive.date,
          messages: normalizeMessages(archive.messages ?? []),
        }))
      : [],
  })
}

function reconcileDaily(state: ChatState): ChatState {
  const today = todayKey()
  if (state.currentDate === today) {
    return state
  }

  const archives = [...state.archives]
  if (state.messages.length > 0) {
    archives.unshift({ date: state.currentDate, messages: state.messages })
  }

  return { currentDate: today, messages: [], archives }
}

function persistState(state: ChatState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.localStorage.removeItem(LEGACY_DAILY_KEY)
  window.localStorage.removeItem(LEGACY_HISTORY_KEY)
  window.localStorage.removeItem(LEGACY_HISTORY_DAY_KEY)
  window.localStorage.removeItem(LEGACY_ARCHIVE_KEY)
}

function msUntilNextMidnight(now: Date = new Date()) {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  )
  return next.getTime() - now.getTime()
}

export default function UnifiedChatDock() {
  const [state, setState] = useState<ChatState>(() => hydrateState())
  const [input, setInput] = useState('')
  const [view, setView] = useState<'chat' | 'history'>('chat')
  const [isOpen, setIsOpen] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setState((prev) => {
      const reconciled = reconcileDaily(prev)
      persistState(reconciled)
      return reconciled
    })
  }, [])

  useEffect(() => {
    persistState(state)
  }, [state])

  useEffect(() => {
    let intervalId: number | undefined
    const timeoutId = window.setTimeout(() => {
      setState((prev) => {
        const reconciled = reconcileDaily(prev)
        if (reconciled !== prev) {
          persistState(reconciled)
        }
        return reconciled
      })
      intervalId = window.setInterval(() => {
        setState((prev) => {
          const reconciled = reconcileDaily(prev)
          if (reconciled !== prev) {
            persistState(reconciled)
          }
          return reconciled
        })
      }, 24 * 60 * 60 * 1000)
    }, msUntilNextMidnight())

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages, view])

  const logs = useMemo(() => {
    const today = state.messages.length
      ? [{ date: state.currentDate, messages: state.messages }]
      : []
    return [...today, ...state.archives]
  }, [state.archives, state.currentDate, state.messages])

  function sendMessage(event?: FormEvent) {
    if (event) event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }

    const agentMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'agent',
      content: `Acknowledged. The single agent for the full environment (${AGENT_NAME}) will archive chat history daily at local midnight.`,
      timestamp: Date.now(),
    }

    setState((prev) => {
      const reconciled = reconcileDaily(prev)
      const nextState = {
        ...reconciled,
        messages: [...reconciled.messages, userMessage, agentMessage],
      }
      persistState(nextState)
      return nextState
    })
    setInput('')
  }

  return (
    <aside className={`chatDock ${isOpen ? 'open' : 'closed'}`}>
      <header className="chatDockHeader">
        <div>
          <div className="chatDockTitle">{AGENT_NAME}</div>
          <div className="chatDockSubtitle">
            {ARCHIVE_NOTE} • today {state.currentDate}
          </div>
        </div>
        <div className="chatDockActions">
          {isOpen ? (
            <>
              <button
                className={`chatDockToggle ${view === 'chat' ? 'active' : ''}`}
                onClick={() => setView('chat')}
                type="button"
              >
                Chat
              </button>
              <button
                className={`chatDockToggle ${view === 'history' ? 'active' : ''}`}
                onClick={() => setView('history')}
                type="button"
              >
                History
              </button>
            </>
          ) : null}
          <button className="chatDockToggle" onClick={() => setIsOpen((open) => !open)} type="button">
            {isOpen ? 'Minimize' : 'Open'}
          </button>
        </div>
      </header>

      {isOpen ? (
        <>
          <div className="chatDockBody">
            {view === 'history' ? (
              logs.length === 0 ? (
                <div className="chatDockEmpty">No archived days yet. Start chatting to build a daily log.</div>
              ) : (
                <div className="chatDockList">
                  {logs.map((archive) => (
                    <div key={archive.date} className="chatDockDay">
                      <div className="chatDockDayHeader">{archive.date}</div>
                      {archive.messages.map((message) => (
                        <div key={message.id} className={`chatDockBubble ${message.role}`}>
                          <div className="chatDockRole">{message.role === 'user' ? 'You' : AGENT_NAME}</div>
                          <div className="chatDockText">{message.content}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            ) : state.messages.length === 0 ? (
              <div className="chatDockEmpty">
                Start a thread. Your messages are saved and archived daily.
              </div>
            ) : (
              state.messages.map((message) => (
                <div key={message.id} className={`chatDockBubble ${message.role}`}>
                  <div className="chatDockRole">{message.role === 'user' ? 'You' : AGENT_NAME}</div>
                  <div className="chatDockText">{message.content}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chatDockFooter" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
              placeholder="Share a thought or decision..."
            />
            <button type="submit">Send</button>
          </form>
        </>
      ) : null}
    </aside>
  )
}
