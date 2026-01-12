export type ViewMode = 'DEREK' | 'DEMO' | 'BUILD'

export type LedgerEvent = {
  id: string
  ts: string
  kind: string
  payload: unknown
  meta?: {
    view?: ViewMode
    sessionId?: string
    actor?: { type: string; id?: string }
    requestId?: string
  }
}

export type KnowledgeResponse = {
  knowledge?: { bks: number; dcr: number; avgOptr: number }
  delta?: number
}

export function byTsDesc(a: LedgerEvent, b: LedgerEvent) {
  return String(b.ts).localeCompare(String(a.ts))
}

export function getPayloadString(payload: unknown, key: string): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const v = (payload as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : undefined
}
