const traceLog = [
  {
    id: "TRACE-0941",
    status: "COMMITTED",
    summary: "Intent validated against execution ledger.",
    timestamp: "2024-04-18 09:14:12",
  },
  {
    id: "TRACE-0942",
    status: "SIGNED",
    summary: "Authority proof generated with KMS-backed signature.",
    timestamp: "2024-04-18 09:14:49",
  },
  {
    id: "TRACE-0943",
    status: "REPLAYABLE",
    summary: "Decision trace stored for deterministic replay.",
    timestamp: "2024-04-18 09:15:03",
  },
  {
    id: "TRACE-0944",
    status: "HASHED",
    summary: "UI token hash recorded to compliance ledger.",
    timestamp: "2024-04-18 09:15:25",
  },
];

export default function DecisionTraceViewerPage() {
  return (
    <main className="traceShell">
      <header className="traceHeader">
        <div className="traceHeaderLeft">bickford</div>
        <div className="traceHeaderRight">Decision Trace Viewer</div>
      </header>
      <section className="traceBody">
        <div className="traceLog" role="log" aria-label="Execution log">
          {traceLog.map((entry) => (
            <div key={entry.id} className="traceLogItem">
              <div className="traceLogMeta">
                <span className="traceLogId">{entry.id}</span>
                <span className="traceLogStatus">{entry.status}</span>
                <span className="traceLogTime">{entry.timestamp}</span>
              </div>
              <div className="traceLogSummary">{entry.summary}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
