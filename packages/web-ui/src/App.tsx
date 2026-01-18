"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  role: "agent" | "system";
  agentId?: string;
  text: string;
};

export default function App() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ledger")
      .then(r => r.json())
      .then(idx => {
        const last = Object.keys(idx).pop();
        if (last) {
          setActiveThread(last);
          fetch(`/api/ledger/${last}`)
            .then(r => r.json())
            .then(data => {
              if (data?.partial) {
                setMessages(
                  data.partial.map((p: any) => ({
                    role: "agent",
                    agentId: p.agentId,
                    text: p.content
                  }))
                );
              }
            });
        }
      });
  }, []);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [messages]);

  async function run() {
    setMessages([]);
    const res = await fetch("/api/converge-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value);
      const events = buf.split("\n\n");
      buf = events.pop() || "";

      for (const e of events) {
        const [, type] = e.match(/^event: (.+)$/m) || [];
        const [, data] = e.match(/^data: (.+)$/m) || [];
        if (!type || !data) continue;

        const payload = JSON.parse(data);

        if (type === "agent:token") {
          setMessages(m => [
            ...m,
            {
              role: "agent",
              agentId: payload.agentId,
              text: payload.token
            }
          ]);
        }

        if (type === "final") {
          setMessages(m => [
            ...m,
            { role: "system", text: JSON.stringify(payload, null, 2) }
          ]);
        }
      }
    }
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>Bickford Chat</h1>

      <div
        ref={ref}
        style={{
          height: "60vh",
          overflowY: "auto",
          border: "1px solid #333",
          padding: 12,
          marginBottom: 12
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <strong>{m.agentId ?? m.role}:</strong> {m.text}
          </div>
        ))}
      </div>

      <textarea
        rows={6}
        style={{ width: "100%" }}
        placeholder="Paste ConvergenceInput JSON"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button onClick={run} style={{ marginTop: 8 }}>
        Converge (Stream)
      </button>
    </main>
  );
}
