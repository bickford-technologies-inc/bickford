import { useState } from "react";

export function ConstitutionalAPIDemo() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setLoading(true);
    const response = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        messages: [{ role: "user", content }],
        maxTokens: 1024,
      }),
    });
    if (response.status === 403) {
      const error = await response.json();
      alert(`Canon Violation: ${error.details}`);
    } else {
      const data = await response.json();
      setMessages([
        ...messages,
        {
          role: "assistant",
          content: data.content[0].text,
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="demo">
      <h1>Constitutional API Keys Demo</h1>
      <p>Try requesting forbidden actions to see governance in action!</p>
      <div className="chat">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        placeholder="Ask Claude anything..."
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            sendMessage((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = "";
          }
        }}
        disabled={loading}
      />
    </div>
  );
}
