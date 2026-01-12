/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import type { LedgerEvent } from '../types'
import { byTsDesc } from '../types'
import { useUi } from './uiStore'

type CanonStatus = 'connecting' | 'live' | 'replay' | 'error'

type CanonStore = {
  events: LedgerEvent[]
  status: CanonStatus
}

const CanonContext = React.createContext<CanonStore | null>(null)

export function CanonProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<LedgerEvent[]>([])
  const [status, setStatus] = React.useState<CanonStatus>('connecting')
  const { replayAt } = useUi()

  React.useEffect(() => {
    let es: EventSource | null = null

    const at = replayAt || undefined

    ;(async () => {
      try {
        const qs = new URLSearchParams({ limit: '200' })
        if (at) qs.set('at', at)
        const res = await fetch(`/api/filing/state?${qs.toString()}`)
        if (res.ok) {
          const json = (await res.json()) as { events?: LedgerEvent[] }
          const initial = Array.isArray(json.events) ? json.events : []
          setEvents(initial.slice().sort(byTsDesc))
        }
      } catch {
        // ignore
      }

      if (at) {
        setStatus('replay')
        return
      }

      es = new EventSource('/api/filing/stream')
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
    })()

    return () => {
      if (es) es.close()
    }
  }, [replayAt])

  const value = React.useMemo<CanonStore>(() => ({ events, status }), [events, status])
  return <CanonContext.Provider value={value}>{children}</CanonContext.Provider>
}

export function useCanon() {
  const ctx = React.useContext(CanonContext)
  if (!ctx) throw new Error('useCanon must be used within CanonProvider')
  return ctx
}
