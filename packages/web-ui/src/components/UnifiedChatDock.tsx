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
const AGENT_NAME = "Unified Environment Agent";

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

export default function UnifiedChatDock() {
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
    <aside className={`chatDockFloating ${isOpen ? "" : "closed"}`}>
      <header className="chatDockHeader">
        <div>
          <div className="chatDockTitle">Environment Chat</div>
          <div className="chatDockSubtitle">
            {AGENT_NAME} • single timeline • archives daily • {archivedCount}{" "}
            saved
          </div>
        </div>
        <button className="dockToggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Minimize" : "Chat"}
        </button>
      </header>

      {isOpen ? (
        <>
          <div className="chatDockBody">
            {state.messages.length === 0 ? (
              <div className="chatDockEmpty">
                Start a conversation to capture decisions for today.
              </div>
            ) : (
              state.messages.map((message) => (
                <div
                  key={message.id}
                  className={`chatDockBubble ${message.author}`}
                >
                  <div className="chatDockRole">
                    {message.author === "user" ? "You" : AGENT_NAME}
                  </div>
                  <div className="chatDockText">{message.text}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          <footer className="dockFooter">
            <div className="chatDockInputRow">
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
              />
              <button type="button" onClick={handleSend}>
                Send
              </button>
            </div>
          </footer>
        </>
      ) : null}
    </aside>
  );
}
