"use client";

import { useEffect, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "system";
  content: string;
  timestamp: number;
}

export interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const STORAGE_KEY = "bickford.chat.threads";

export function useChatPersistence() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      setThreads(parsed);
      setActiveThreadId(parsed[0]?.id ?? null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  function newThread() {
    const id = crypto.randomUUID();
    const thread: ChatThread = {
      id,
      title: "New Thread",
      messages: [],
      updatedAt: Date.now()
    };
    setThreads(t => [thread, ...t]);
    setActiveThreadId(id);
  }

  function addMessage(role: "user" | "system", content: string) {
    setThreads(ts =>
      ts.map(t =>
        t.id === activeThreadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id: crypto.randomUUID(),
                  role,
                  content,
                  timestamp: Date.now()
                }
              ],
              updatedAt: Date.now(),
              title:
                t.title === "New Thread" && role === "user"
                  ? content.slice(0, 40)
                  : t.title
            }
          : t
      )
    );
  }

  return {
    threads,
    activeThread: threads.find(t => t.id === activeThreadId) ?? null,
    setActiveThreadId,
    newThread,
    addMessage
  };
}
