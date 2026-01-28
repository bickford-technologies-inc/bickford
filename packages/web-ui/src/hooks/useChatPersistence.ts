"use client";

import { useEffect, useState } from "react";

import type { ChatThread, ChatMessage } from "@bickford/chat";
import {
  toCanonicalThread,
  fromCanonicalThread,
} from "../bickford-chat-adapter";

const STORAGE_KEY = "bickford.chat.threads";

export function useChatPersistence() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Convert legacy threads if needed
      const canonicalThreads = parsed.map((t: any) =>
        t.messages && typeof t.messages[0]?.createdAt === "string"
          ? t // already canonical
          : toCanonicalThread(t),
      );
      setThreads(canonicalThreads);
      setActiveThreadId(canonicalThreads[0]?.id ?? null);
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setThreads((t) => [thread, ...t]);
    setActiveThreadId(id);
  }

  function addMessage(
    role: "user" | "assistant" | "system" | "tool",
    content: string,
  ) {
    setThreads((ts) =>
      ts.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              messages: [
                ...t.messages,
                {
                  id: crypto.randomUUID(),
                  role,
                  content,
                  createdAt: new Date().toISOString(),
                } as ChatMessage,
              ],
              updatedAt: new Date().toISOString(),
              title:
                t.title === "New Thread" && role === "user"
                  ? content.slice(0, 40)
                  : t.title,
            }
          : t,
      ),
    );
  }

  return {
    threads,
    activeThread: threads.find((t) => t.id === activeThreadId) ?? null,
    setActiveThreadId,
    newThread,
    addMessage,
  };
}
