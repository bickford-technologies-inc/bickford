"use client";

import { useState } from "react";

type Message = {
  role: "user" | "authority" | "system";
  content: any;
};

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  async function run() {
    const userMsg: Message = { role: "user", content: input };
    setMessages(m => [...m, userMsg]);

    const res = await fetch("/api/converge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input
    });

    const json = await res.json();

    if (json.status === "LOCKED") {
      setMessages(m => [
        ...m,
        { role: "authority", content: json.artifact }
      ]);
    } else {
      setMessages(m => [
        ...m,
        { role: "system", content: json.refusalReason }
      ]);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1>Bickford</h1>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: 16,
          minHeight: 420,
          background: "#ffffff"
        }}
      >
        {messages.map((m, i) => {
          if (m.role === "system") {
            return (
              <div
                key={i}
                style={{
                  marginBottom: 20,
                  padding: 16,
                  border: "1px solid #dc2626",
                  borderLeft: "6px solid #dc2626",
                  background: "#fef2f2",
                  borderRadius: 6
                }}
              >
                <div style={{ fontWeight: 700, color: "#991b1b" }}>
                  ❌ EXECUTION REFUSED
                </div>

                <div style={{ marginTop: 8 }}>
                  <div>
                    <strong>Code:</strong>{" "}
                    <span style={{ color: "#7f1d1d" }}>
                      {m.content?.code}
                    </span>
                  </div>

                  <div style={{ marginTop: 6 }}>
                    <strong>Reason:</strong>{" "}
                    <span>{m.content?.message}</span>
                  </div>
                </div>
              </div>
            );
          }

          if (m.role === "authority") {
            return (
              <div
                key={i}
                style={{
                  marginBottom: 20,
                  padding: 16,
                  border: "1px solid #16a34a",
                  borderLeft: "6px solid #16a34a",
                  background: "#f0fdf4",
                  borderRadius: 6
                }}
              >
                <div style={{ fontWeight: 700, color: "#065f46" }}>
                  ✅ EXECUTION LOCKED
                </div>
                <pre style={{ marginTop: 10 }}>
                  {JSON.stringify(m.content, null, 2)}
                </pre>
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                marginBottom: 12,
                padding: 10,
                background: "#f9fafb",
                borderRadius: 4
              }}
            >
              <strong>USER</strong>
              <pre style={{ marginTop: 6 }}>{m.content}</pre>
            </div>
          );
        })}
      </div>

      <textarea
        rows={10}
        style={{
          width: "100%",
          marginTop: 16,
          border: "1px solid #d1d5db",
          borderRadius: 6,
          padding: 12
        }}
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
    </main>
  );
}
