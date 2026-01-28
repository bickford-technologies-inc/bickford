import { readProofLedger } from "@bickford/superconductor-ledger";

type DecisionTraceViewerProps = {
  searchParams?: { intent?: string };
};

function formatSummary(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const json = JSON.stringify(payload);
    return json.length > 160 ? `${json.slice(0, 157)}...` : json;
  }
  return String(payload ?? "No payload");
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toISOString().replace("T", " ").replace("Z", "Z");
}

export default function DecisionTraceViewerPage({
  searchParams,
}: DecisionTraceViewerProps) {
  const intentId = searchParams?.intent;
  const traceLog = intentId ? readProofLedger(intentId) : [];
  const exportHref = intentId
    ? `/api/tracer/export?intent=${encodeURIComponent(intentId)}`
    : null;

  return (
    <main className="traceShell">
      <header className="traceHeader">
        <div className="traceHeaderLeft">bickford</div>
        <div className="traceHeaderRight">Decision Trace Viewer</div>
      </header>
      <section className="traceBody">
        <div className="traceSubheader">
          <div>
            {intentId ? (
              <>
                <div className="traceIntentLabel">Intent</div>
                <div className="traceIntentValue">{intentId}</div>
              </>
            ) : (
              <div className="traceIntentValue">
                Provide an intent id using <code>?intent=...</code> to load
                decision traces.
              </div>
            )}
          </div>
          {exportHref ? (
            <a className="traceExportLink" href={exportHref}>
              Export JSON
            </a>
          ) : null}
        </div>
        {traceLog.length === 0 ? (
          <div className="traceEmpty" role="status">
            No decision traces found for this intent.
          </div>
        ) : (
          <div className="traceLog" role="log" aria-label="Execution log">
            {traceLog.map((entry) => (
              <div key={entry.hash} className="traceLogItem">
                <div className="traceLogMeta">
                  <span className="traceLogId">{entry.hash.slice(0, 12)}</span>
                  <span className="traceLogStatus">{entry.kind}</span>
                  <span className="traceLogTime">
                    {formatTimestamp(entry.createdAt)}
                  </span>
                  <span className="traceLogAuthority">{entry.authority}</span>
                </div>
                <div className="traceLogSummary">
                  {formatSummary(entry.payload)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
