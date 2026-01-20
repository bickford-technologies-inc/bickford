"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  author: "user" | "agent";
  text: string;
  timestamp: number;
};

type ChatArchive = {
  date: string;
  messages: ChatMessage[];
};

type ChatState = {
  currentDate: string;
  messages: ChatMessage[];
  archives: ChatArchive[];
};

const STORAGE_KEY = "bickford.unified.chat";
const AGENT_NAME = "Bickford Unified Agent";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function hydrateState(): ChatState {
  if (typeof window === "undefined") {
    return { currentDate: todayKey(), messages: [], archives: [] };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { currentDate: todayKey(), messages: [], archives: [] };
  }

  try {
    const parsed = JSON.parse(raw) as ChatState;
    return {
      currentDate: parsed?.currentDate ?? todayKey(),
      messages: Array.isArray(parsed?.messages) ? parsed.messages : [],
      archives: Array.isArray(parsed?.archives) ? parsed.archives : [],
    };
  } catch {
    return { currentDate: todayKey(), messages: [], archives: [] };
  }
}

function reconcileDay(state: ChatState): ChatState {
  const today = todayKey();
  if (state.currentDate === today) {
    return state;
  }

  const archives = [...state.archives];
  if (state.messages.length > 0) {
    archives.unshift({ date: state.currentDate, messages: state.messages });
  }

  return { currentDate: today, messages: [], archives };
}

function persist(state: ChatState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function ChatDock() {
  const [state, setState] = useState<ChatState>(() => hydrateState());
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setState((prev) => {
      const reconciled = reconcileDay(prev);
      persist(reconciled);
      return reconciled;
    });
  }, []);

  useEffect(() => {
    persist(state);
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const timer = window.setInterval(() => {
      setState((prev) => {
        const reconciled = reconcileDay(prev);
        if (reconciled !== prev) {
          persist(reconciled);
        }
        return reconciled;
      });
    }, 15 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  const archivedCount = useMemo(() => state.archives.length, [state.archives]);

  function appendMessage(author: ChatMessage["author"], text: string) {
    const nextMessage: ChatMessage = {
      id: crypto.randomUUID(),
      author,
      text,
      timestamp: Date.now(),
    };

    setState((prev) => {
      const reconciled = reconcileDay(prev);
      const nextState = {
        ...reconciled,
        messages: [...reconciled.messages, nextMessage],
      };
      persist(nextState);
      return nextState;
    });
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    setInput("");
    appendMessage("user", trimmed);
    appendMessage(
      "agent",
      "Acknowledged. I will keep a single timeline and archive it daily."
    );
  }

  return (
    <aside
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        width: 320,
        background: "#0b0b0b",
        color: "#f5f5f5",
        border: "1px solid #222",
        borderRadius: 12,
        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.4)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        zIndex: 1000,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 14px",
          borderBottom: "1px solid #1f1f1f",
        }}
      >
        <div>
          <div style={{ fontWeight: 600 }}>Unified Agent</div>
          <div style={{ fontSize: 12, color: "#a1a1a1" }}>
            {AGENT_NAME} • archives daily • {archivedCount} saved
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "#1f1f1f",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          {isOpen ? "Minimize" : "Chat"}
        </button>
      </header>

      {isOpen ? (
        <>
          <div
            style={{
              maxHeight: 280,
              overflowY: "auto",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {state.messages.length === 0 ? (
              <div style={{ fontSize: 13, color: "#a1a1a1" }}>
                Start a conversation to capture decisions for today.
              </div>
            ) : (
              state.messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    background:
                      message.author === "user" ? "#1d1d1d" : "#133",
                    border: "1px solid #222",
                    borderRadius: 10,
                    padding: "8px 10px",
                  }}
                >
                  <div style={{ fontSize: 11, color: "#9aa0a6" }}>
                    {message.author === "user" ? "You" : AGENT_NAME}
                  </div>
                  <div style={{ fontSize: 13 }}>{message.text}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <footer
            style={{
              borderTop: "1px solid #1f1f1f",
              padding: "10px 12px",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Share intent, decisions, or next steps..."
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                style={{
                  flex: 1,
                  background: "#101010",
                  border: "1px solid #2a2a2a",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </footer>
        </>
      ) : null}
    </aside>
  );
}
