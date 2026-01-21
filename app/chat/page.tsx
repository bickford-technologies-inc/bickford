"use client";

import { useEffect, useState } from "react";
import styles from "./chat.module.css";

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

const AGENT_NAME = "bickford";
const STORAGE_KEY = "bickford.chat.web.v1";

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
  if (typeof window === "undefined") return;
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

export default function ChatPage() {
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setInput("");
    appendMessage("user", trimmed);
    appendMessage("agent", "Acknowledged. Intent recorded.");
  }

  return (
    <section className={styles.page}>
      <div className={styles.centerColumn}>
        {state.messages.length === 0 ? (
          <p className={styles.empty}>What should we do next?</p>
        ) : (
          <div className={styles.thread}>
            {state.messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.role === "user" ? styles.user : styles.agent
                }`}
              >
                <div className={styles.role}>
                  {message.role === "user" ? "You" : AGENT_NAME}
                </div>
                <div className={styles.text}>{message.content}</div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={submit} className={styles.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask bickford"
            className={styles.input}
          />
        </form>
      </div>
    </section>
  );
}
