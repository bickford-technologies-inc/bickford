import React, { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages (ChatGPT behavior)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(m => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage.content }),
        }
      );

      const data = await res.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply ?? "(no response)",
      };

      setMessages(m => [...m, assistantMessage]);
    } catch (e) {
      setMessages(m => [
        ...m,
        { role: "assistant", content: "⚠️ Error contacting backend." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-root">
      <header className="chat-header">
        <img src="/bickford-logo.png" alt="bickford" />
      </header>

      <main className="chat-scroll">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className="bubble">{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="msg assistant">
            <div className="bubble typing">Bickford is thinking…</div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="chat-input">
        <textarea
          placeholder="Message Bickford…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </footer>
    </div>
  );
}
