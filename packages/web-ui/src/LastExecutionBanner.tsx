export type LastExecution = {
  intent: string
  decision: 'ALLOW' | 'DENY' | 'ERROR' | 'ACKNOWLEDGED'
  ts: string
}

export default function LastExecutionBanner({
  execution,
  onViewLedger,
}: {
  execution: LastExecution
  onViewLedger: () => void
}) {
  const decision = execution.decision

  return (
    <div className="lastExecWrap" role="region" aria-label="Last execution">
      <div className="lastExecBanner">
        <div className="lastExecLabel">Last execution</div>

        <div className="lastExecIntent" title={execution.intent}>
          {execution.intent}
        </div>

        <div className={`lastExecDecision ${decision.toLowerCase()}`}>{decision}</div>

        <div className="lastExecTime">{new Date(execution.ts).toLocaleTimeString()}</div>

        <button type="button" className="lastExecLink" onClick={onViewLedger}>
          View in ledger →
        </button>
      </div>
    </div>
  )
}
