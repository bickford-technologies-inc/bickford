// app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./chat.module.css";

type ChatRole = "user" | "agent";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

const AGENT_NAME = "bickford";
const STORAGE_KEY = "bickford.chat.web.v1";

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function persistMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [input, setInput] = useState("");

  useEffect(() => {
    persistMessages(messages);
  }, [messages]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const now = Date.now();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: now,
    };

    const agentMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "agent",
      content: "Acknowledged. Intent recorded.",
      timestamp: now + 1,
    };

    setMessages((prev) => [...prev, userMessage, agentMessage]);
    setInput("");
  }

  return (
    <section className={styles.page}>
      <div className={styles.centerColumn}>
        {messages.length === 0 ? (
          <p className={styles.empty}>What should we do next?</p>
        ) : (
          <div className={styles.thread}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.message} ${
                  m.role === "user" ? styles.user : styles.agent
                }`}
              >
                <div className={styles.role}>
                  {m.role === "user" ? "You" : AGENT_NAME}
                </div>
                <div className={styles.text}>{m.content}</div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={submit} className={styles.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask bickford"
            className={styles.input}
          />
        </form>
      </div>
    </section>
  );
}
