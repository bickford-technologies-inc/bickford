import React, { useState } from "react";

interface Message {
  author: string;
  content: string;
  timestamp: string;
}

// Simulated Bickford AI response (replace with real API call for production)
async function getBickfordResponse(userMessage: string): Promise<string> {
  // Simple rule-based demo: echo, or basic canned responses
  if (
    userMessage.toLowerCase().includes("hello") ||
    userMessage.toLowerCase().includes("hi")
  ) {
    return "Hello! How can I help you with Bickford compliance or AI safety today?";
  }
  if (userMessage.toLowerCase().includes("compression")) {
    return "Bickford achieves 99.9%+ compression by deduplicating all redundant audit data and storing only unique cryptographic blocks.";
  }
  if (userMessage.toLowerCase().includes("ledger")) {
    return "Every decision is hash-chained in the ledger for full auditability. No mutation or reordering is possible.";
  }
  if (userMessage.toLowerCase().includes("optr")) {
    return "OPTR selects the optimal admissible policy with non-interference guarantees, minimizing time-to-value.";
  }
  return "Thank you for your message! A Bickford agent will follow up if you need advanced help.";
}

export const BickfordChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage: Message = {
      author: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);
    // Persist to datalake/bronze/messages
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMessage),
    });
    // Simulate async Bickford AI response
    const response = await getBickfordResponse(input);
    const aiMessage: Message = {
      author: "bickford",
      content: response,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMessage]);
    // Persist AI response as well
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiMessage),
    });
    setLoading(false);
    // TODO: Trigger intent extraction pipeline
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 340,
        zIndex: 1000,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: 8,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        padding: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Bickford Chat</div>
      <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 8 }}>
        {messages.length === 0 && (
          <div style={{ color: "#888" }}>No messages yet.</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 500 }}>{msg.author}:</span>{" "}
            <span>{msg.content}</span>
            <span style={{ color: "#bbb", fontSize: 10, marginLeft: 6 }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#888" }}>
            <em>Bickford is typing...</em>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: 4,
            padding: 4,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "4px 12px",
            borderRadius: 4,
            background: "#222",
            color: "#fff",
            border: "none",
          }}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};
