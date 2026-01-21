"use client";

import { useMemo, useState } from "react";
import { ENVIRONMENT_AGENT } from "../lib/agent";
import styles from "./ChatWindow.module.css";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
};

export default function ChatWindow() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const agentLabel = useMemo(
    () => ENVIRONMENT_AGENT.charAt(0).toUpperCase() + ENVIRONMENT_AGENT.slice(1),
    []
  );

  async function archiveMessage(message: ChatMessage) {
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
      }),
    });
  }

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: now,
    };

    setMessages((current) => [...current, userMessage]);
    setValue("");
    await archiveMessage(userMessage);

    const responseMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "agent",
      content: `Archived for ${agentLabel}.`,
      timestamp: Date.now(),
    };

    setMessages((current) => [...current, responseMessage]);
    await archiveMessage(responseMessage);
  }

  return (
    <section className={styles.window} aria-label="Chat window">
      <header className={styles.header}>
        <div>
          <span className={styles.title}>Chat</span>
          <span className={styles.agent}>Agent: {agentLabel}</span>
        </div>
        <span className={styles.status}>Daily archive enabled</span>
      </header>
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.empty}>Start a conversation. Everything is archived daily.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={styles.message} data-role={message.role}>
              <span className={styles.role}>{message.role}</span>
              <p>{message.content}</p>
            </div>
          ))
        )}
      </div>
      <div className={styles.inputRow}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && submit()}
          placeholder="Share intent..."
        />
        <button type="button" onClick={submit}>
          Send
        </button>
      </div>
    </section>
  );
}
