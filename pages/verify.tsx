import React, { useState } from "react";

export default function VerifyLedger() {
  const [ledger, setLedger] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/verify-ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ledger }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "2rem auto", padding: 24 }}>
      <h1>External Ledger/Hash Chain Verifier</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={ledger}
          onChange={e => setLedger(e.target.value)}
          rows={10}
          style={{ width: "100%", fontFamily: "monospace" }}
          placeholder="Paste JSONL ledger or hash chain here..."
          required
        />
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Verification Result</h2>
          <pre style={{ background: "#f5f5f5", padding: 12 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.valid ? (
            <div style={{ color: "green" }}>
 Ledger is valid and canonical</div>
          ) : (
            <div style={{ color: "red" }}>
 Ledger is NOT valid or canonical</div>
          )}
          {result.intelligence && result.intelligence.similarEntries && (
            <div style={{ marginTop: 24 }}>
              <h3>Intelligence: Most Similar Past Entries</h3>
              <ul>
                {result.intelligence.similarEntries.map((entry: any, i: number) => (
                  <li key={i}>
                    <pre style={{ background: "#fafafa", padding: 8, fontSize: 12 }}>
                      {JSON.stringify(entry, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
