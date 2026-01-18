"use client";

import { useState } from "react";
import { useChatPersistence } from "./hooks/useChatPersistence";
import { appendLedger } from "./ledger/ledger";

export default function App() {
  const {
    threads,
    activeThread,
    setActiveThreadId,
    newThread,
    addMessage
  } = useChatPersistence();

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  async function send() {
    if (!input.trim()) return;

    addMessage("user", input);
    appendLedger({ type: "USER_INPUT", payload: input });
    setStreaming(true);

    const res = await fetch("/api/converge/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input
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
        if (e.includes("event: result")) {
          const data = JSON.parse(e.split("data: ")[1]);
          addMessage("system", JSON.stringify(data, null, 2));
          appendLedger({ type: "RESULT", payload: data });
        }
      }
    }

    setStreaming(false);
    setInput("");
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui" }}>
      <aside style={{ width: 260, borderRight: "1px solid #ddd", padding: 12 }}>
        <button onClick={newThread}>+ New</button>
        <ul>
          {threads.map(t => (
            <li
              key={t.id}
              onClick={() => setActiveThreadId(t.id)}
              style={{
                cursor: "pointer",
                fontWeight: t.id === activeThread?.id ? "bold" : "normal"
              }}
            >
              {t.title}
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {activeThread?.messages.map(m => (
            <div key={m.id} style={{ marginBottom: 12 }}>
              <strong>{m.role === "user" ? "You" : "Bickford"}:</strong>
              <pre style={{ whiteSpace: "pre-wrap" }}>{m.content}</pre>
            </div>
          ))}
          {streaming && <em>Streaming…</em>}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <textarea
            rows={3}
            style={{ flex: 1 }}
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button onClick={send}>Send</button>
        </div>
      </main>
    </div>
  );
}
