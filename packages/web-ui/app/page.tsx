"use client";

import { useEffect, useState } from "react";

type LedgerEntry = {
  id: string;
  timestamp: string;
  type: string;
  payload: any;
};

export default function Page() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    fetch("/api/ledger")
      .then(r => r.json())
      .then(setLedger);
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>Bickford</h1>

      <section style={{ marginTop: 24 }}>
        <h2>Execution Ledger</h2>
        {ledger.length === 0 && <div>No executions yet.</div>}
        {ledger.map(e => (
          <pre
            key={e.id}
            style={{
              marginTop: 12,
              padding: 12,
              background: "#111",
              color: "#0f0",
              overflowX: "auto"
            }}
          >
            {JSON.stringify(e, null, 2)}
          </pre>
        ))}
      </section>
    </main>
  );
}
