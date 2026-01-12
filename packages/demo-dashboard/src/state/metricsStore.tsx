/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import type { KnowledgeResponse } from '../types'
import { useMode } from './modeStore'
import { useCanon } from './canonStore'

type MetricsStore = {
  bks: number | null
  delta: number | null
  dcr: number | null
  avgOptr: number | null
}

const MetricsContext = React.createContext<MetricsStore | null>(null)

export function MetricsProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useMode()
  const { events } = useCanon()

  const [resp, setResp] = React.useState<KnowledgeResponse | null>(null)

  React.useEffect(() => {
    ;(async () => {
      try {
        const kres = await fetch('/api/filing/knowledge', {
          headers: { 'x-bickford-view': mode },
        })
        if (kres.ok) setResp((await kres.json()) as KnowledgeResponse)
      } catch {
        // ignore
      }
    })()
  }, [mode, events.length])

  const value = React.useMemo<MetricsStore>(() => {
    const bks = typeof resp?.knowledge?.bks === 'number' ? resp.knowledge.bks : null
    const dcr = typeof resp?.knowledge?.dcr === 'number' ? resp.knowledge.dcr : null
    const avgOptr = typeof resp?.knowledge?.avgOptr === 'number' ? resp.knowledge.avgOptr : null
    const delta = typeof resp?.delta === 'number' ? resp.delta : null
    return { bks, delta, dcr, avgOptr }
  }, [resp])

  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>
}

export function useMetrics() {
  const ctx = React.useContext(MetricsContext)
  if (!ctx) throw new Error('useMetrics must be used within MetricsProvider')
  return ctx
}
