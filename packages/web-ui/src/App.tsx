"use client";

import { useState } from "react";

type Msg = { role: string; content: any };

export default function App() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setMsgs(m => [...m, { role: "user", content: input }]);

    const res = await fetch("/api/converge-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const parts = buf.split("\n\n");
      buf = parts.pop()!;

      for (const p of parts) {
        if (!p.trim()) continue;
        const [, evt, data] = p.match(/event:\s*(\w+)\ndata:\s*(.*)/)!;

        const payload = JSON.parse(data);

        if (evt === "agent") {
          setMsgs(m => [
            ...m,
            { role: payload.agentId, content: payload.content }
          ]);
        }

        if (evt === "final") {
          setMsgs(m => [...m, { role: payload.status, content: payload }]);
        }
      }
    }

    setRunning(false);
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1>bickford</h1>

      <textarea
        rows={10}
        style={{ width: "100%", padding: 12 }}
        placeholder="Paste ConvergenceInput JSON"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button
        onClick={run}
        disabled={running}
        style={{
          marginTop: 12,
          padding: "10px 18px",
          background: "#111827",
          color: "white",
          borderRadius: 6
        }}
      >
        {running ? "Converging…" : "Converge"}
      </button>

      <div style={{ marginTop: 24 }}>
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              padding: 12,
              borderLeft: "4px solid #111827",
              background: "#f9fafb"
            }}
          >
            <strong>{m.role}</strong>
            <pre>{JSON.stringify(m.content, null, 2)}</pre>
          </div>
        ))}
      </div>
    </main>
  );
}
