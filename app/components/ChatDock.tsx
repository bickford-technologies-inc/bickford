"use client";

import { useEffect, useState } from "react";
import styles from "./ChatDock.module.css";
import {
  AGENT_NAME,
  ARCHIVE_NOTE,
  ChatMessage,
  ChatState,
  CHAT_STORAGE_KEY,
  hydrateChatState,
  msUntilNextMidnight,
  parseChatState,
  persistChatState,
  reconcileDaily,
} from "./chatState";

export default function ChatDock() {
  const [state, setState] = useState<ChatState>(() => hydrateChatState());
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      persistChatState(reconciled);
      return reconciled;
    });
  }, []);

  useEffect(() => {
    persistChatState(state);
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        persistChatState(reconciled);
        return reconciled;
      });
      intervalId = window.setInterval(
        () => {
          setState((prev) => {
            const reconciled = reconcileDaily(prev);
            persistChatState(reconciled);
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
    if (typeof window === "undefined") return;

    function handleResume() {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        if (reconciled === prev) {
          return prev;
        }
        persistChatState(reconciled);
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
    if (typeof window === "undefined") return;

    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) {
        return;
      }
      if (event.key && event.key !== CHAT_STORAGE_KEY) {
        return;
      }
      const nextState = parseChatState(event.newValue) ?? hydrateChatState();
      setState(nextState);
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  async function submitIntent() {
    const trimmed = text.trim();
    if (!trimmed) return;

    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      const nextState = {
        ...reconciled,
        messages: [
          ...reconciled.messages,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmed,
            timestamp: Date.now(),
          },
        ],
      };
      persistChatState(nextState);
      return nextState;
    });

    setText("");
    setOpen(false);

    await fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "COMMAND",
        content: trimmed,
        source: "dock",
        timestamp: Date.now(),
      }),
    });
  }

  const recent = state.messages.slice(-4);

  return (
    <>
      {!open && (
        <button
          className={styles.fab}
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          bickford
        </button>
      )}

      {open && (
        <section className={styles.panel}>
          <header className={styles.header}>
            <div className={styles.titleBlock}>
              <span className={styles.agentName}>{AGENT_NAME}</span>
              <span className={styles.note}>
                {ARCHIVE_NOTE} • today {state.currentDate}
              </span>
            </div>
            <button
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </header>

          <div className={styles.messages}>
            <div className={styles.helper}>
              Chat is a support surface. Intents remain primary.
            </div>
            {recent.length === 0 ? (
              <div className={styles.empty}>
                No entries yet. Create an intent to start today&apos;s archive.
              </div>
            ) : (
              recent.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? styles.userBubble
                      : styles.agentBubble
                  }
                >
                  <div className={styles.roleLabel}>
                    {message.role === "user" ? "You" : AGENT_NAME}
                  </div>
                  <div>{message.content}</div>
                </div>
              ))
            )}
          </div>

          <div className={styles.inputRow}>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitIntent();
                }
              }}
              placeholder="Create intent…"
            />
            <button type="button" onClick={submitIntent}>
              Send
            </button>
          </div>
        </section>
      )}
    </>
  );
}
