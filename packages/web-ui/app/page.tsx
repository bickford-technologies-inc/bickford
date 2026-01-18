"use client";

import { useState, useRef } from "react";

type Message = {
  agentId: string;
  role: string;
  text: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function run() {
    setMessages([]);

    const res = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agents: [
          {
            id: "authority",
            role: "EXECUTION_AUTHORITY",
            message: "Plan validated execution path and lock artifact."
          },
          {
            id: "auditor",
            role: "CONSTRAINT_AUDITOR",
            message: "No hard constraints detected proceed safely."
          }
        ]
      })
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const e of events) {
        if (!e.startsWith("data:")) continue;
        const payload = JSON.parse(e.slice(5));

        if (payload.type === "agent-start") {
          setMessages(m => [
            ...m,
            { agentId: payload.agentId, role: payload.role, text: "" }
          ]);
        }

        if (payload.type === "token") {
          setMessages(m =>
            m.map(msg =>
              msg.agentId === payload.agentId
                ? { ...msg, text: msg.text + payload.value }
                : msg
            )
          );
        }
      }
    }
  }

  return (
    <main style={{ padding: 32, fontFamily: "system-ui" }}>
      <h1>Bickford</h1>

      <div style={{ marginTop: 24 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <strong>{m.role}</strong>
            <div>{m.text}</div>
          </div>
        ))}
      </div>

      <button
        onClick={run}
        style={{
          marginTop: 24,
          padding: "10px 16px",
          fontSize: 16
        }}
      >
        Run
      </button>
    </main>
  );
}
