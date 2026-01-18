"use client";

import { useEffect, useState } from "react";
import {
  loadThreads,
  saveThreads,
  newThread,
  Thread,
  Message
} from "../lib/threadStore";
import { ThreadSidebar } from "../components/ThreadSidebar";
import { AuthorityPanel } from "../components/AuthorityPanel";

export default function App() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = threads.find(t => t.id === activeId) || null;
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const t = loadThreads();
    if (t.length === 0) {
      const nt = newThread();
      setThreads([nt]);
      setActiveId(nt.id);
      saveThreads([nt]);
    } else {
      setThreads(t);
      setActiveId(t[0].id);
    }
  }, []);

  function persist(next: Thread[]) {
    setThreads(next);
    saveThreads(next);
  }

  async function send() {
    if (!active) return;

    const userMsg: Message = { role: "user", content: input };

    const updated: Thread = {
      ...active,
      messages: [...active.messages, userMsg],
      updatedAt: Date.now()
    };

    const nextThreads = threads.map(t =>
      t.id === active.id ? updated : t
    );
    persist(nextThreads);
    setInput("");

    const res = await fetch("/api/converge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: userMsg.content
    });

    const json = await res.json();
    setResult(json);

    const systemMsg: Message = {
      role: "system",
      content: JSON.stringify(json, null, 2)
    };

    const finalized: Thread = {
      ...updated,
      messages: [...updated.messages, systemMsg],
      updatedAt: Date.now(),
      title:
        updated.messages.length === 0
          ? userMsg.content.slice(0, 32)
          : updated.title
    };

    persist(
      threads.map(t => (t.id === active.id ? finalized : t))
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ThreadSidebar
        threads={threads}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={() => {
          const nt = newThread();
          persist([nt, ...threads]);
          setActiveId(nt.id);
        }}
      />

      <main style={{ flex: 1, padding: 16, overflow: "auto" }}>
        <h2>Bickford Chat</h2>

        <div>
          {active?.messages.map((m, i) => (
            <pre
              key={i}
              style={{
                background: m.role === "user" ? "#111" : "#020",
                padding: 12,
                marginBottom: 8,
                border: "1px solid #333"
              }}
            >
              {m.content}
            </pre>
          ))}
        </div>

        <textarea
          rows={6}
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ width: "100%", marginTop: 12 }}
        />

        <button
          onClick={send}
          style={{ marginTop: 8, padding: 8 }}
        >
          Send
        </button>

        <AuthorityPanel result={result} />
      </main>
    </div>
  );
}
