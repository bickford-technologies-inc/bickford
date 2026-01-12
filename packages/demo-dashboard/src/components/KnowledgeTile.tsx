import { useMetrics } from '../state/metricsStore'
import { useUi } from '../state/uiStore'

export function KnowledgeTile() {
  const { bks, delta } = useMetrics()
  const { toggleLog } = useUi()

  return (
    <button type="button" className="knowledgeTile" title="View canon & metrics" onClick={toggleLog}>
      <div className="knowledgeScore">{typeof bks === 'number' ? bks.toFixed(1) : '—'}</div>
      <div className="knowledgeDelta">
        {typeof delta === 'number' ? `▲ ${delta.toFixed(1)}` : ' '}
      </div>
    </button>
  )
}
