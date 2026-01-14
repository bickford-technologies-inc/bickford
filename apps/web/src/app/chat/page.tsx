"use client";

import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    setOutput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ input }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          setOutput((o) => o + line.replace("data: ", ""));
        }
      }
    }

    setLoading(false);
    setInput("");
  }

  return (
    <main style={{ padding: 48 }}>
      <h1>Tell Bickford what you want</h1>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          minHeight: 200,
          border: "1px solid #ddd",
          padding: 16,
          marginBottom: 16,
        }}
      >
        {output || (loading ? "Claude is reasoning…" : "")}
      </pre>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Declare intent…"
        style={{ width: 420, padding: 8 }}
      />
      <button onClick={send} disabled={loading} style={{ marginLeft: 8 }}>
        Execute
      </button>
    </main>
  );
}
