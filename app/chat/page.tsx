"use client";

import { useEffect, useState } from "react";
import styles from "./chat.module.css";
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
} from "../components/chatState";

export default function ChatPage() {
  const [state, setState] = useState<ChatState>(() => hydrateChatState());
  const [input, setInput] = useState("");

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
    const timeoutId = window.setTimeout(() => {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        persistChatState(reconciled);
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
      persistChatState(nextState);
      return nextState;
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setInput("");
    appendMessage("user", trimmed);
    appendMessage(
      "agent",
      `Acknowledged. ${AGENT_NAME} is the single agent for the full environment — ${ARCHIVE_NOTE}.`,
    );
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
