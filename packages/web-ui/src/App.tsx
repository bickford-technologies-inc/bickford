useEffect(() => {
  fetch("/api/ledger")
    .then(r => r.json())
    .then(idx => {
      const last = Object.keys(idx).pop();
      if (last) setActiveThread(last);
    });
}, []);

import { useAgentStream } from "../lib/useAgentStream";
const [streamInput, setStreamInput] = useState("");
const { events } = useAgentStream(streamInput);

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
{events.map((e, i) => (
  <pre key={i} style={{ background:"#020", padding:12 }}>
    {e.type === "agent" ? `[${e.agent}] ${e.token}` : JSON.stringify(e.data, null, 2)}
  </pre>
))}
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = threads.find(t => t.id === activeId) || null;
  const [input, setInput] = useState("");

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
    setStreamInput(input);
    setInput("");
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

{events.map((e, i) => (
  <pre key={i} style={{ background:"#020", padding:12 }}>
    {e.type === "agent" ? `[${e.agent}] ${e.token}` : JSON.stringify(e.data, null, 2)}
  </pre>
))}
}
