"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatRole = "user" | "agent";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

type DailyArchive = {
  date: string;
  messages: ChatMessage[];
};

type ChatState = {
  currentDate: string;
  messages: ChatMessage[];
  archives: DailyArchive[];
};

const STORAGE_KEY = "bickford.chat.unified.v1";
const AGENT_NAME = "Bickford Unified Agent";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeMessages(
  messages: Array<{
    id?: string;
    role?: string;
    content?: string;
    text?: string;
    author?: string;
    timestamp?: number | string;
  }>,
): ChatMessage[] {
  return messages
    .filter(Boolean)
    .map((message) => {
      const role = message.role ?? message.author ?? "agent";
      return {
        id: message.id ?? crypto.randomUUID(),
        role: role === "user" ? "user" : "agent",
        content: message.content ?? message.text ?? "",
        timestamp:
          typeof message.timestamp === "number"
            ? message.timestamp
            : Number.isFinite(Date.parse(String(message.timestamp)))
              ? Date.parse(String(message.timestamp))
              : Date.now(),
      };
    })
    .filter((message) => message.content.trim().length > 0);
}

function hydrateState(): ChatState {
  if (typeof window === "undefined") {
    return { currentDate: todayKey(), messages: [], archives: [] };
  }

  const stored = safeParse<ChatState>(localStorage.getItem(STORAGE_KEY));
  if (!stored) {
    return { currentDate: todayKey(), messages: [], archives: [] };
  }

  return {
    currentDate: stored.currentDate ?? todayKey(),
    messages: Array.isArray(stored.messages)
      ? normalizeMessages(stored.messages)
      : [],
    archives: Array.isArray(stored.archives)
      ? stored.archives.map((archive) => ({
          date: archive.date,
          messages: normalizeMessages(archive.messages ?? []),
        }))
      : [],
  };
}

function reconcileDaily(state: ChatState): ChatState {
  const today = todayKey();
  if (state.currentDate === today) {
    return state;
  }

  const archives = [...state.archives];
  if (state.messages.length > 0) {
    archives.unshift({ date: state.currentDate, messages: state.messages });
  }

  return {
    currentDate: today,
    messages: [],
    archives,
  };
}

function persistState(state: ChatState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function ChatWindow() {
  const [state, setState] = useState<ChatState>(() => hydrateState());
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      persistState(reconciled);
      return reconciled;
    });
  }, []);

  useEffect(() => {
    persistState(state);
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const timer = window.setInterval(() => {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        persistState(reconciled);
        return reconciled;
      });
    }, 15 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages, isOpen]);

  const placeholder = useMemo(
    () => "Capture a thought, decision, or next step...",
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
      role: "agent",
      content:
        "Captured. I will keep this in today’s log and archive the chat daily.",
      timestamp: Date.now(),
    };

    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      const nextState = {
        ...reconciled,
        messages: [...reconciled.messages, userMessage, agentMessage],
      };
      persistState(nextState);
      return nextState;
    });

    setInput("");
  }

  return (
    <aside
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width: 320,
        maxHeight: 440,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        borderRadius: 16,
        background: "rgba(20, 20, 24, 0.92)",
        color: "#f4f4f5",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.28)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>
            Single agent • environment-wide
          </span>
          <strong style={{ fontSize: 18 }}>{AGENT_NAME}</strong>
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            Archives daily • {state.archives.length} saved days
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            height: 32,
            padding: "0 12px",
            borderRadius: 999,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.08)",
            color: "#f4f4f5",
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
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflowY: "auto",
              paddingRight: 4,
              flex: 1,
            }}
          >
            {state.messages.length === 0 ? (
              <p style={{ fontSize: 13, opacity: 0.7 }}>
                Start a conversation. The single agent archives history daily.
              </p>
            ) : (
              state.messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignSelf:
                      message.role === "user" ? "flex-end" : "flex-start",
                    gap: 4,
                    maxWidth: "85%",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      opacity: 0.6,
                    }}
                  >
                    {message.role === "user" ? "You" : AGENT_NAME}
                  </span>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 12,
                      background:
                        message.role === "user"
                          ? "rgba(59, 130, 246, 0.9)"
                          : "rgba(39, 39, 42, 0.9)",
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1.4 }}>
                      {message.content}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <footer style={{ display: "flex", gap: 8 }}>
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
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                background: "rgba(8, 8, 12, 0.8)",
                color: "#f4f4f5",
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: "#22c55e",
                color: "#0f172a",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </footer>
        </>
      ) : null}
    </aside>
  );
}
