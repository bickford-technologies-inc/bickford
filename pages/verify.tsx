import React, { useState, useEffect, useRef } from "react";

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
    // Clear any previous interval
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Immediately verify once
    verifyLedger(ledger);
    // Set up interval
    intervalRef.current = setInterval(() => {
      verifyLedger(ledger);
    }, 5000); // 5 seconds
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledger, continuous]);

  // Manual submit fallback
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await verifyLedger(ledger);
  }

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: 24 }}>
      <h1>External Ledger/Hash Chain Verifier</h1>
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
