import React, { useState } from "react";
import styles from "./BickfordChat.module.css";
import { sendMessageToBickfordChat } from "./api";

function ChatWidget() {
  const [messages, setMessages] = useState<
    Array<{ role: string; text: string }>
  >([{ role: "system", text: "Welcome to Bickford Chat!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", text: input }]);
    setLoading(true);
    const res = await sendMessageToBickfordChat(input);
    setMessages((msgs) => [...msgs, { role: "assistant", text: res.reply }]);
    setInput("");
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          minHeight: 120,
          maxHeight: 220,
          overflowY: "auto",
          background: "#222",
          borderRadius: 8,
          padding: 8,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              color:
                msg.role === "user"
                  ? "#f59e0b"
                  : msg.role === "assistant"
                    ? "#22c55e"
                    : "#fff",
              marginBottom: 4,
            }}
          >
            <strong>
              {msg.role === "user"
                ? "You"
                : msg.role === "assistant"
                  ? "Bickford"
                  : "System"}
              :
            </strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 4,
            border: "1px solid #444",
            background: "#111",
            color: "#fff",
          }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{
            padding: "8px 16px",
            borderRadius: 4,
            background: "#f59e0b",
            color: "#fff",
            border: "none",
            fontWeight: 600,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function BickfordChat() {
  return (
    <div className={styles["bickford-chat-container"]}>
      <div className={styles["bickford-chat-header"]}>Bickford Chat</div>
      <div className={styles["bickford-chat-body"]}>
        <ChatWidget />
      </div>
    </div>
  );
}
