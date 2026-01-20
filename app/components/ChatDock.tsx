"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type DailyArchive = {
  date: string;
  messages: ChatMessage[];
};

const STORAGE_KEY = "bickford.chat.history";
const STORAGE_DAY_KEY = "bickford.chat.history.day";
const ARCHIVE_KEY = "bickford.chat.archive";
const AGENT_NAME = "Bickford Unified Agent";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function ChatDock() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedMessages = localStorage.getItem(STORAGE_KEY);
    const storedDay = localStorage.getItem(STORAGE_DAY_KEY);
    const parsed: ChatMessage[] = storedMessages ? JSON.parse(storedMessages) : [];
    const today = todayKey();

    if (storedDay && storedDay !== today && parsed.length > 0) {
      const archiveRaw = localStorage.getItem(ARCHIVE_KEY);
      const archive = archiveRaw ? (JSON.parse(archiveRaw) as DailyArchive[]) : [];
      archive.unshift({ date: storedDay, messages: parsed });
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      setMessages([]);
    } else {
      setMessages(parsed);
    }

    localStorage.setItem(STORAGE_DAY_KEY, today);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const timer = window.setInterval(() => {
      const currentDay = localStorage.getItem(STORAGE_DAY_KEY);
      const today = todayKey();
      if (currentDay && currentDay !== today) {
        const archiveRaw = localStorage.getItem(ARCHIVE_KEY);
        const archive = archiveRaw ? (JSON.parse(archiveRaw) as DailyArchive[]) : [];
        const storedMessages = localStorage.getItem(STORAGE_KEY);
        const parsed: ChatMessage[] = storedMessages ? JSON.parse(storedMessages) : [];

        if (parsed.length > 0) {
          archive.unshift({ date: currentDay, messages: parsed });
          localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        localStorage.setItem(STORAGE_DAY_KEY, today);
        setMessages([]);
      }
    }, 15 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const placeholder = useMemo(
    () => "Ask the unified agent to coordinate the environment...",
    [],
  );

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const agentMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Acknowledged. ${AGENT_NAME} is tracking this and will archive today’s history automatically.`,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, agentMessage]);
    setInput("");
  }

  return (
    <section className={`chatDock ${isOpen ? "open" : "closed"}`}>
      <header className="chatDockHeader">
        <div>
          <div className="chatDockTitle">Unified Chat</div>
          <div className="chatDockSubtitle">{AGENT_NAME} • archives daily</div>
        </div>
        <button className="chatDockToggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Minimize" : "Chat"}
        </button>
      </header>

      {isOpen ? (
        <>
          <div className="chatDockBody">
            {messages.length === 0 ? (
              <div className="chatDockEmpty">
                Start a conversation. Daily history will be archived automatically.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`chatDockBubble ${message.role}`}
                >
                  <div className="chatDockRole">
                    {message.role === "user" ? "You" : AGENT_NAME}
                  </div>
                  <div className="chatDockText">{message.content}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <footer className="chatDockFooter">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={placeholder}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </footer>
        </>
      ) : null}
    </section>
  );
}
