"use client";

import { useState } from "react";
import { LedgerViewer } from "./LedgerViewer";

type Message = {
  role: "user" | "authority" | "system";
  content: any;
};

type LedgerEntry = {
  status: "LOCKED" | "REFUSED";
  artifact?: any;
  refusalReason?: { code: string; message: string };
  ts: number;
};

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  async function run() {
    setMessages(m => [...m, { role: "user", content: input }]);

    const res = await fetch("/api/converge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input
    });

    const json = await res.json();
    const entry: LedgerEntry = {
      status: json.status,
      artifact: json.artifact,
      refusalReason: json.refusalReason,
      ts: Date.now()
    };

    setLedger(l => [entry, ...l]);

    if (json.status === "LOCKED") {
      setMessages(m => [...m, { role: "authority", content: json.artifact }]);
    } else {
      setMessages(m => [...m, { role: "system", content: json.refusalReason }]);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1>Bickford</h1>

      <textarea
        rows={10}
        style={{ width: "100%", padding: 12 }}
        placeholder="Paste ConvergenceInput JSON here"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button
        onClick={run}
        style={{
          marginTop: 12,
          padding: "10px 18px",
          background: "#111827",
          color: "white",
          borderRadius: 6
        }}
      >
        Converge
      </button>

      <LedgerViewer entries={ledger} />
    </main>
  );
}
