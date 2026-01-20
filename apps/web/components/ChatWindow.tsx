"use client";

import { useEffect, useMemo, useState } from "react";

type ChatRole = "user" | "agent";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
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

const STORAGE_KEY = "bickford.chat.daily.v1";
const AGENT_NAME = "Bickford Unified Agent";

function getTodayKey() {
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
    .filter((message) => message)
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
    return { currentDate: getTodayKey(), messages: [], archives: [] };
  }

  const stored = safeParse<ChatState>(window.localStorage.getItem(STORAGE_KEY));
  if (stored) {
    return {
      currentDate: stored.currentDate ?? getTodayKey(),
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

  const legacyDaily = safeParse<ChatState>(
    window.localStorage.getItem(LEGACY_DAILY_KEY),
  );
  if (legacyDaily) {
    return {
      currentDate: legacyDaily.currentDate ?? getTodayKey(),
      messages: Array.isArray(legacyDaily.messages)
        ? normalizeMessages(legacyDaily.messages)
        : [],
      archives: Array.isArray(legacyDaily.archives)
        ? legacyDaily.archives.map((archive) => ({
            date: archive.date,
            messages: normalizeMessages(archive.messages ?? []),
          }))
        : [],
    };
  }

  const legacyMessages = safeParse<ChatMessage[]>(
    window.localStorage.getItem(LEGACY_HISTORY_KEY),
  );
  const legacyArchives = safeParse<ChatArchive[]>(
    window.localStorage.getItem(LEGACY_ARCHIVE_KEY),
  );
  const legacyDay = window.localStorage.getItem(LEGACY_HISTORY_DAY_KEY);

  return {
    currentDate: legacyDay ?? getTodayKey(),
    messages: Array.isArray(legacyMessages) ? normalizeMessages(legacyMessages) : [],
    archives: Array.isArray(legacyArchives)
      ? legacyArchives.map((archive) => ({
          date: archive.date,
          messages: normalizeMessages(archive.messages ?? []),
        }))
      : [],
  };
}

function reconcileDaily(state: ChatState): ChatState {
  const today = getTodayKey();
  if (state.currentDate === today) {
    return state;
  }

  const archives = [...state.archives];
  if (state.messages.length > 0) {
    archives.unshift({ date: state.currentDate, messages: state.messages });
  }

  return { currentDate: today, messages: [], archives };
}

function persistState(state: ChatState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.localStorage.removeItem(LEGACY_DAILY_KEY);
  window.localStorage.removeItem(LEGACY_HISTORY_KEY);
  window.localStorage.removeItem(LEGACY_HISTORY_DAY_KEY);
  window.localStorage.removeItem(LEGACY_ARCHIVE_KEY);
}

export default function ChatWindow() {
  const [state, setState] = useState<ChatState>(() => hydrateState());
  const [input, setInput] = useState("");

  useEffect(() => {
    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      persistState(reconciled);
      return reconciled;
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        if (reconciled !== prev) {
          persistState(reconciled);
        }
        return reconciled;
      });
    }, 10 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  const archivedDays = useMemo(() => state.archives.length, [state.archives]);

  function appendMessage(role: ChatRole, content: string) {
    const nextMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role,
      content,
      timestamp: Date.now(),
    };

    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      const nextState = {
        ...reconciled,
        messages: [...reconciled.messages, nextMessage],
      };
      persistState(nextState);
      return nextState;
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setInput("");
    appendMessage("user", trimmed);
    appendMessage(
      "agent",
      "Captured. I will include this in today's log and archive it daily."
    );
  }

  return (
    <aside
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 320,
        maxHeight: 420,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        borderRadius: 16,
        background: "rgba(20, 20, 24, 0.92)",
        color: "#f4f4f5",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 14, letterSpacing: 0.4, opacity: 0.8 }}>
          Unified Agent • Environment-wide
        </span>
        <strong style={{ fontSize: 18 }}>{AGENT_NAME}</strong>
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          Daily archives: {archivedDays}
        </span>
      </header>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflowY: "auto",
          paddingRight: 4,
          flex: 1,
        }}
      >
        {state.messages.length === 0 ? (
          <p style={{ fontSize: 13, opacity: 0.7 }}>
            Start a thread. Your messages are saved and archived daily.
          </p>
        ) : (
          state.messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                gap: 4,
                maxWidth: "85%",
              }}
            >
              <span
                style={{
                  fontSize: 12,
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
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Share a thought or decision..."
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
          type="submit"
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
      </form>
    </aside>
  );
}
