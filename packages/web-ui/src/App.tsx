"use client";

import { useState } from "react";

type Message = {
  role: "user" | "authority" | "auditor" | "system";
  content: any;
};

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [result, setResult] = useState<any>(null);

  async function run() {
    const userMsg: Message = { role: "user", content: input };
    setMessages(m => [...m, userMsg]);

    const res = await fetch("/api/converge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input
    });

    const json = await res.json();
    setResult(json);

    if (json.status === "LOCKED") {
      setMessages(m => [
        ...m,
        {
          role: "authority",
          content: json.artifact
        }
      ]);
    } else {
      setMessages(m => [
        ...m,
        {
          role: "system",
          content: json.refusalReason
        }
      ]);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>Bickford</h1>

      <div style={{ border: "1px solid #ddd", padding: 16, minHeight: 400 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 16,
              padding: 12,
              borderLeft:
                m.role === "authority"
                  ? "4px solid #16a34a"
                  : m.role === "system"
                  ? "4px solid #dc2626"
                  : "4px solid transparent",
              background:
                m.role === "authority"
                  ? "#f0fdf4"
                  : m.role === "system"
                  ? "#fef2f2"
                  : "#fafafa"
            }}
          >
            <strong>
              {m.role === "authority"
                ? "EXECUTION AUTHORITY"
                : m.role === "system"
                ? "REFUSAL"
                : "USER"}
            </strong>
            <pre style={{ marginTop: 8 }}>
              {JSON.stringify(m.content, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      <textarea
        rows={10}
        style={{ width: "100%", marginTop: 16 }}
        placeholder="Paste ConvergenceInput JSON here"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button onClick={run} style={{ marginTop: 12 }}>
        Converge
      </button>
    </main>
  );
}
