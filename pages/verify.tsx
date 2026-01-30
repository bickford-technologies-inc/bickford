import React, { useState, useEffect, useRef } from "react";

function AnalyticsSummary({ result }: { result: any }) {
  if (!result || !result.intelligence) return null;
  const entries = result.intelligence.similarEntries || [];
  const eventTypes: Record<string, number> = {};
  let successCount = 0,
    failCount = 0;
  entries.forEach((e: any) => {
    eventTypes[e.eventType] = (eventTypes[e.eventType] || 0) + 1;
    if (e.payload?.success === true) successCount++;
    else if (e.payload?.success === false) failCount++;
  });
  const total = successCount + failCount;
  return (
    <div style={{ margin: "16px 0", background: "#f0f5ff", padding: 12, borderRadius: 8 }}>
      <b>Analytics Summary</b>
      <div style={{ marginTop: 8 }}>
        <span>Event Types: </span>
        {Object.entries(eventTypes).map(([type, count]) => (
          <span key={type} style={{ marginRight: 12 }}>
            {type}: <b>{count}</b>
          </span>
        ))}
      </div>
      <div style={{ marginTop: 4 }}>
        Success Rate: <b>{total ? ((successCount / total) * 100).toFixed(1) : "-"}%</b>
      </div>
    </div>
  );
}

function AnomalyBadge({ result }: { result: any }) {
  if (!result) return null;
  const hasAnomaly = (result.violations && result.violations.length > 0) || (result.compression && result.compression.ratio < 0.95);
  if (!hasAnomaly) return null;
  return (
    <span style={{ color: "#fff", background: "#fa541c", borderRadius: 4, padding: "2px 8px", marginLeft: 8, fontWeight: 600 }}>
      Anomalies Detected
    </span>
  );
}

export default function VerifyLedger() {
  const [ledger, setLedger] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [continuous, setContinuous] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function verifyLedger(currentLedger: string) {
    if (!currentLedger.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ledger: currentLedger }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
      setLastChecked(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Continuous polling effect
  useEffect(() => {
    if (!continuous || !ledger.trim()) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    verifyLedger(ledger);
    intervalRef.current = setInterval(() => {
      verifyLedger(ledger);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledger, continuous]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await verifyLedger(ledger);
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-verification-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: 24 }}>
      <h1>
        External Ledger/Hash Chain Verifier
        <AnomalyBadge result={result} />
      </h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={ledger}
          onChange={(e) => setLedger(e.target.value)}
          rows={10}
          style={{ width: "100%", fontFamily: "monospace" }}
          placeholder="Paste JSONL ledger or hash chain here..."
          required
        />
        <div style={{ marginTop: 8, display: "flex", alignItems: "center" }}>
          <label style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={continuous}
              onChange={() => setContinuous((v) => !v)}
              style={{ marginRight: 4 }}
            />
            Continuous verification
          </label>
          <button
            type="submit"
            disabled={loading || continuous}
            style={{ marginLeft: 12 }}
          >
            {loading ? "Verifying..." : "Manual Verify"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!result}
            style={{ marginLeft: 12 }}
          >
            Download Report
          </button>
        </div>
      </form>
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
      {lastChecked && (
        <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Verification Result</h2>
          <pre style={{ background: "#f5f5f5", padding: 12 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.valid ? (
            <div style={{ color: "green" }}>Ledger is valid and canonical</div>
          ) : (
            <div style={{ color: "red" }}>Ledger is NOT valid or canonical</div>
          )}
          <AnalyticsSummary result={result} />
          {result.intelligence && result.intelligence.similarEntries && (
            <div style={{ marginTop: 24 }}>
              <h3>Intelligence: Most Similar Past Entries</h3>
              <ul>
                {result.intelligence.similarEntries.map(
                  (entry: any, i: number) => (
                    <li key={i}>
                      <pre
                        style={{
                          background: "#fafafa",
                          padding: 8,
                          fontSize: 12,
                        }}
                      >
                        {JSON.stringify(entry, null, 2)}
                      </pre>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
