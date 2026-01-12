import * as React from 'react'
import { useCanon } from '../state/canonStore'
import { useMetrics } from '../state/metricsStore'
import { useUi } from '../state/uiStore'
import { getPayloadString } from '../types'

type FilingAnchorState = {
  anchor?: {
    sha256?: string | null
    [key: string]: unknown
  }
  [key: string]: unknown
}

export function KnowledgePanel() {
  const { events } = useCanon()
  const { bks, delta, dcr, avgOptr } = useMetrics()
  const { logOpen, closeLog, replayAt, setReplayAt } = useUi()

  const [anchor, setAnchor] = React.useState<FilingAnchorState | null>(null)
  const [replayInput, setReplayInput] = React.useState<string>('')

  React.useEffect(() => {
    if (!logOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLog()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [logOpen, closeLog])

  if (!logOpen) return null

  return (
    <div className="logOverlay" onMouseDown={closeLog}>
      <div className="logPanel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="logHeader">
          <div className="logTitle">Canon / Metrics</div>
          <button type="button" className="logClose" onClick={closeLog}>
            Close
          </button>
        </div>

        <div className="logMetrics">
          <div className="logMetricRow">
            <span>Knowledge</span>
            <strong>{typeof bks === 'number' ? bks.toFixed(2) : '—'}</strong>
            <span className="logDelta">{typeof delta === 'number' ? `Δ ${delta.toFixed(3)}` : ''}</span>
          </div>
          <div className="logMetricSub">
            DCR {typeof dcr === 'number' ? `${(dcr * 100).toFixed(1)}%` : '—'} · Avg OPTR{' '}
            {typeof avgOptr === 'number' ? avgOptr.toFixed(2) : '—'}
          </div>
        </div>

        <div className="logTools">
          <div className="logToolRow">
            <span className="logToolLabel">Time travel</span>
            <input
              className="logToolInput"
              value={replayInput}
              onChange={(e) => setReplayInput(e.target.value)}
              placeholder="ISO timestamp (e.g. 2026-01-01T12:00:00.000Z)"
            />
            <button
              type="button"
              className="logToolBtn"
              onClick={() => setReplayAt(replayInput.trim() ? replayInput.trim() : null)}
            >
              replay
            </button>
            <button type="button" className="logToolBtn" onClick={() => setReplayAt(null)}>
              live
            </button>
          </div>
          <div className="logToolSub">Current: {replayAt ? replayAt : 'live'}</div>

          <div className="logToolRow">
            <span className="logToolLabel">Anchor</span>
            <button
              type="button"
              className="logToolBtn"
              onClick={async () => {
                try {
                  const r = await fetch('/api/filing/anchor')
                  if (r.ok) setAnchor((await r.json()) as FilingAnchorState)
                } catch {
                  // ignore
                }
              }}
            >
              fetch
            </button>
            <span className="logToolMono">
              {anchor?.anchor?.sha256 ? String(anchor.anchor.sha256).slice(0, 12) + '…' : '—'}
            </span>
          </div>

          <div className="logToolRow">
            <span className="logToolLabel">Promotion</span>
            <button
              type="button"
              className="logToolBtn"
              onClick={async () => {
                await fetch('/api/filing/chat', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-bickford-role': 'promoter',
                    'x-bickford-view': 'BUILD',
                  },
                  body: JSON.stringify({ text: 'bickford promote last', actorId: 'desktop' }),
                })
              }}
            >
              promote last
            </button>
          </div>
        </div>

        <div className="logList" aria-label="canon log">
          {events.slice(0, 50).map((e) => {
            const label =
              getPayloadString(e.payload, 'summary') ||
              getPayloadString(e.payload, 'text') ||
              getPayloadString(e.payload, 'activeTopic') ||
              ''

            return (
              <div key={e.id} className="logRow" title={new Date(e.ts).toLocaleString()}>
                <span className="logKind">{e.kind}</span>
                <span className="logBody">{label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
