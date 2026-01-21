"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ChatWindow.module.css";

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

const STORAGE_KEY = "bickford.chat.unified.v1";
const LEGACY_DAILY_KEY = "bickford.chat.daily.v1";
const LEGACY_HISTORY_KEY = "bickford.chat.history";
const LEGACY_HISTORY_DAY_KEY = "bickford.chat.history.day";
const LEGACY_ARCHIVE_KEY = "bickford.chat.archive";
const AGENT_NAME = "bickford";
const ARCHIVE_NOTE =
  "single agent for the full environment • archives chat history daily at local midnight";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return formatLocalDate(new Date());
}

function utcKey(date: Date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function utcDateKeyToLocal(dateKey: string) {
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return dateKey;
  }
  return formatLocalDate(parsed);
}

function migrateUtcDates(state: ChatState): ChatState {
  const localToday = getTodayKey();
  const utcToday = utcKey();
  if (state.currentDate !== utcToday || state.currentDate === localToday) {
    return state;
  }
  return {
    ...state,
    currentDate: utcDateKeyToLocal(state.currentDate),
    archives: state.archives.map((archive) => ({
      ...archive,
      date: utcDateKeyToLocal(archive.date),
    })),
  };
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

function parseStoredState(raw: string | null): ChatState | null {
  const stored = safeParse<ChatState>(raw);
  if (!stored) {
    return null;
  }
  return migrateUtcDates({
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
  });
}

function hydrateState(): ChatState {
  if (typeof window === "undefined") {
    return { currentDate: getTodayKey(), messages: [], archives: [] };
  }

  const stored = parseStoredState(window.localStorage.getItem(STORAGE_KEY));
  if (stored) {
    return stored;
  }

  const legacyDaily = safeParse<ChatState>(
    window.localStorage.getItem(LEGACY_DAILY_KEY),
  );
  if (legacyDaily) {
    return migrateUtcDates({
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
    });
  }

  const legacyMessages = safeParse<ChatMessage[]>(
    window.localStorage.getItem(LEGACY_HISTORY_KEY),
  );
  const legacyArchives = safeParse<ChatArchive[]>(
    window.localStorage.getItem(LEGACY_ARCHIVE_KEY),
  );
  const legacyDay = window.localStorage.getItem(LEGACY_HISTORY_DAY_KEY);

  return migrateUtcDates({
    currentDate: legacyDay ?? getTodayKey(),
    messages: Array.isArray(legacyMessages)
      ? normalizeMessages(legacyMessages)
      : [],
    archives: Array.isArray(legacyArchives)
      ? legacyArchives.map((archive) => ({
          date: archive.date,
          messages: normalizeMessages(archive.messages ?? []),
        }))
      : [],
  });
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

function msUntilNextMidnight(now: Date = new Date()) {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return next.getTime() - now.getTime();
}

export default function ChatWindow() {
  const [state, setState] = useState<ChatState>(() => hydrateState());
  const [input, setInput] = useState("");
  const [view, setView] = useState<"chat" | "history">("chat");
  const [isOpen, setIsOpen] = useState(true);

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
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        persistState(reconciled);
        return reconciled;
      });
      intervalId = window.setInterval(
        () => {
          setState((prev) => {
            const reconciled = reconcileDaily(prev);
            persistState(reconciled);
            return reconciled;
          });
        },
        24 * 60 * 60 * 1000,
      );
    }, msUntilNextMidnight());

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    function handleResume() {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        if (reconciled === prev) {
          return prev;
        }
        persistState(reconciled);
        return reconciled;
      });
    }

    window.addEventListener("focus", handleResume);
    window.addEventListener("visibilitychange", handleResume);

    return () => {
      window.removeEventListener("focus", handleResume);
      window.removeEventListener("visibilitychange", handleResume);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) {
        return;
      }
      if (event.key && event.key !== STORAGE_KEY) {
        return;
      }
      const nextState = parseStoredState(event.newValue) ?? hydrateState();
      setState(nextState);
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

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
      `Acknowledged. The single agent for the full environment (${AGENT_NAME}) will archive chat history daily at local midnight.`,
    );
  }

  const history = useMemo(() => {
    const today = state.messages.length
      ? [{ date: state.currentDate, messages: state.messages }]
      : [];
    return [...today, ...state.archives];
  }, [state.archives, state.currentDate, state.messages]);

  return (
    <aside className={`${styles.window} ${isOpen ? "" : styles.closed}`}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.title}>{AGENT_NAME}</div>
          <div className={styles.subtitle}>
            {ARCHIVE_NOTE} • today {state.currentDate}
          </div>
        </div>
        <div className={styles.actions}>
          {isOpen ? (
            <>
              <button
                type="button"
                onClick={() => setView("chat")}
                className={`${styles.actionButton} ${
                  view === "chat" ? styles.active : ""
                }`}
              >
                Chat
              </button>
              <button
                type="button"
                onClick={() => setView("history")}
                className={`${styles.actionButton} ${
                  view === "history" ? styles.active : ""
                }`}
              >
                History
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className={styles.actionButton}
          >
            {isOpen ? "Minimize" : "Open"}
          </button>
        </div>
      </header>

      {isOpen ? (
        <>
          <div className={styles.body}>
            {view === "history" ? (
              history.length === 0 ? (
                <p className={styles.empty}>No archived days yet.</p>
              ) : (
                <div className={styles.historyList}>
                  {history.map((archive) => (
                    <div key={archive.date} className={styles.historyDay}>
                      <div className={styles.historyDate}>{archive.date}</div>
                      {archive.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`${styles.message} ${
                            message.role === "user"
                              ? styles.userMessage
                              : styles.agentMessage
                          }`}
                        >
                          <div className={styles.messageRole}>
                            {message.role === "user" ? "You" : AGENT_NAME}
                          </div>
                          <div className={styles.messageText}>
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            ) : state.messages.length === 0 ? (
              <p className={styles.empty}>
                Start a thread. Messages are saved and archived daily.
              </p>
            ) : (
              <div className={styles.chatList}>
                {state.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${
                      message.role === "user"
                        ? styles.userMessage
                        : styles.agentMessage
                    }`}
                  >
                    <div className={styles.messageRole}>
                      {message.role === "user" ? "You" : AGENT_NAME}
                    </div>
                    <div className={styles.messageText}>{message.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {view === "history" ? null : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Share a thought or decision..."
                className={styles.input}
              />
              <button type="submit" className={styles.submit}>
                Send
              </button>
            </form>
          )}
        </>
      ) : null}
    </aside>
  );
}
