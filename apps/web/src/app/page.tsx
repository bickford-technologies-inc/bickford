"use client";

import { useState } from "react";

export default function ChatPage() {
  const [text, setText] = useState("");

  async function send() {
    const msg = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ text }),
    }).then((r) => r.json());

    await fetch("/api/intent", {
      method: "POST",
      body: JSON.stringify({ chatMessageId: msg.id }),
    });

    setText("");
  }

  return (
    <main className="flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto">{/* messages stream */}</div>
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tell bickford what you want…"
        />
        <button onClick={send}>Send</button>
      </div>
    </main>
  );
}
