"use client";

import { useEffect, useRef, useState } from "react";

interface StreamEvent {
  type: string;
  [key: string]: any;
}

export default function BickfordChat() {
  const [input, setInput] = useState("");
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [events]);

  async function run() {
    setEvents([]);

    const res = await fetch("/api/converge/stream", {
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
      const chunks = buf.split("\n\n");
      buf = chunks.pop() || "";

      for (const chunk of chunks) {
        if (!chunk.startsWith("data:")) continue;
        const json = JSON.parse(chunk.replace("data:", "").trim());
        setEvents(e => [...e, json]);
      }
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Bickford Chat</h1>

      <textarea
        rows={10}
        style={{ width: "100%" }}
        placeholder="Paste ConvergenceInput JSON"
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <button onClick={run} style={{ marginTop: 12 }}>
        Converge (Streaming)
      </button>

      <div
        ref={logRef}
        style={{
          marginTop: 24,
          height: 400,
          overflowY: "auto",
          background: "#0b0b0b",
          color: "#d0d0d0",
          padding: 12,
          fontFamily: "monospace",
          fontSize: 13
        }}
      >
        {events.map((e, i) => (
          <div key={i}>
            {e.type === "agent" && (
              <>🧠 [{e.role}] {e.agentId} active</>
            )}
            {e.type === "final" && (
              <>
                <pre>{JSON.stringify(e.result, null, 2)}</pre>
              </>
            )}
            {e.type === "meta" && <>— {e.status} —</>}
          </div>
        ))}
      </div>
    </main>
  );
}
