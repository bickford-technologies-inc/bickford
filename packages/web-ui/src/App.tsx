import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { id: string; role: "user" | "assistant"; content: string };
type Thread = { id: string; title: string; messages: Msg[] };
const uid = () => crypto.randomUUID();

export default function App() {
  const [threads, setThreads] = useState<Thread[]>([
    { id: uid(), title: "Asset Health Overview", messages: [] },
  ]);
  const [active, setActive] = useState(threads[0].id);
  const [input, setInput] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(
    () => bottom.current?.scrollIntoView({ behavior: "smooth" }),
    [threads],
  );
  const t = threads.find((x) => x.id === active)!;

  function send() {
    if (!input.trim()) return;
    const u = { id: uid(), role: "user" as const, content: input };
    const a = {
      id: uid(),
      role: "assistant" as const,
      content:
        "📊 **Asset 360 Demo Output**\n\n• Real-time asset health\n• Predictive maintenance alerts\n• Unified operational view\n\n_This response is streamed + structured like the Asset 360 Demo Generator._",
    };
    t.messages.push(u, a);
    setThreads([...threads]);
    setInput("");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Demos</h2>
        {threads.map((x) => (
          <div
            key={x.id}
            className={`thread ${x.id === active ? "active" : ""}`}
            onClick={() => setActive(x.id)}
          >
            {x.title}
          </div>
        ))}
        <button
          onClick={() => {
            const n = { id: uid(), title: "New Demo", messages: [] };
            setThreads([n, ...threads]);
            setActive(n.id);
          }}
        >
          + New Demo
        </button>
      </aside>

      <main className="chat">
        <header>
          <img src="/bickford-logo.png" />
          <span>Asset 360 Demo Generator • Execution View</span>
        </header>

        <section className="scroll">
          {t.messages.map((m) => (
            <div key={m.id} className={`row ${m.role}`}>
              <div className="bubble">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </section>

        <footer>
          <textarea
            placeholder="Describe the customer intent (e.g., monitor asset health)…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button onClick={send}>Generate Demo</button>
          <button className="secondary">Export</button>
        </footer>
      </main>
    </div>
  );
}
