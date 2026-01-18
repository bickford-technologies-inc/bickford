import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";



const uid = () => crypto.randomUUID();










export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function converge() {
    if (!input.trim()) return;

    const userMsg: Message = { id: uid(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const res = await fetch("/api/converge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: input
    });

    const result = await res.json();

    const assistantMsg: Message = {
      id: uid(),
      role: "assistant",
      content: "```json\n" + JSON.stringify(result, null, 2) + "\n```"
    };

    setMessages(prev => [...prev, assistantMsg]);
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateRows: "64px 1fr 96px",
      height: "100vh",
      background: "#0b0f14",
      color: "#e5e7eb",
      fontFamily: "ui-sans-serif, system-ui"
    }}>
      <header style={{
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #1f2937"
      }}>
        <strong>Bickford Chat</strong>
      </header>

      <main style={{
        padding: 24,
        overflowY: "auto"
      }}>
        {messages.map(m => (
          <div key={m.id} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 16
          }}>
            <div style={{
              maxWidth: 760,
              padding: 16,
              borderRadius: 14,
              background: m.role === "user"
                ? "linear-gradient(180deg,#0ea5e9,#0284c7)"
                : "#121823",
              whiteSpace: "pre-wrap"
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      <footer style={{
        padding: 16,
        borderTop: "1px solid #1f2937",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12
      }}>
        <textarea
          placeholder="Paste ConvergenceInput JSON here…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              converge();
            }
          }}
          style={{
            resize: "none",
            height: 64,
            padding: 12,
            background: "#020617",
            color: "#e5e7eb",
            border: "1px solid #1f2937",
            borderRadius: 10
          }}
        />
        <button
          onClick={converge}
          style={{
            padding: "0 20px",
            borderRadius: 10,
            border: "none",
            fontWeight: 600,
            background: "linear-gradient(180deg,#0ea5e9,#0284c7)",
            color: "white",
            cursor: "pointer"
          }}
        >
          Converge
        </button>
      </footer>
    </div>
  );
}
