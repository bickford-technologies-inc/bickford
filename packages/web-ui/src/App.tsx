import { useState } from "react";
import { sendChat } from "./api/chat";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  async function submit() {
    const res = await sendChat(input);
    setMessages(m => [...m, res.reply]);
    setInput("");
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Bickford Chat</h1>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a message"
      />

      <button onClick={submit}>Send</button>

      <pre>{messages.join("\n")}</pre>
    </div>
  );
}
