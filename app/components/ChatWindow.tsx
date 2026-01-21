"use client";

import { useEffect, useState } from "react";
import styles from "./ChatWindow.module.css";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
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
const AGENT_NAME = "bickford";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return formatLocalDate(new Date());
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

function hydrateState(): ChatState {
  if (typeof window === "undefined") {
    return { currentDate: getTodayKey(), messages: [], archives: [] };
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { currentDate: getTodayKey(), messages: [], archives: [] };
  }

  try {
    const parsed = JSON.parse(stored) as ChatState;
    return reconcileDaily({
      currentDate: parsed.currentDate ?? getTodayKey(),
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      archives: Array.isArray(parsed.archives) ? parsed.archives : [],
    });
  } catch {
    return { currentDate: getTodayKey(), messages: [], archives: [] };
  }
}

function persistState(state: ChatState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const [value, setValue] = useState("");

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
    const timeoutId = window.setTimeout(() => {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        persistState(reconciled);
        return reconciled;
      });
    }, msUntilNextMidnight());

    return () => window.clearTimeout(timeoutId);
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

  function appendMessage(role: ChatMessage["role"], content: string) {
    const nextMessage: ChatMessage = {
      id: crypto.randomUUID(),
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

  function submit(event?: React.FormEvent) {
    if (event) {
      event.preventDefault();
    }
    const trimmed = value.trim();
    if (!trimmed) return;

    setValue("");
    appendMessage("user", trimmed);
    appendMessage(
      "agent",
      `Captured. ${AGENT_NAME} will archive this chat daily at local midnight.`,
    );
  }

  return (
    <section className={styles.container} aria-label="Chat window">
      <header className={styles.header}>
        <div>
          <span className={styles.title}>Chat</span>
          <span className={styles.agent}>Agent: {AGENT_NAME}</span>
        </div>
        <span className={styles.status}>Daily archive enabled</span>
      </header>
      <main className={styles.body}>
        {state.messages.length === 0 ? (
          <p className={styles.empty}>
            Start a conversation. Everything is archived daily.
          </p>
        ) : (
          state.messages.map((message) => (
            <div
              key={message.id}
              className={styles.message}
              data-role={message.role}
            >
              <span className={styles.role}>
                {message.role === "user" ? "You" : AGENT_NAME}
              </span>
              <p>{message.content}</p>
            </div>
          ))
        )}
      </main>
      <form className={styles.form} onSubmit={submit}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Share intent..."
        />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
