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
const LEGACY_DAILY_KEY = "bickford.chat.daily.v1";
const LEGACY_HISTORY_KEY = "bickford.chat.history";
const LEGACY_HISTORY_DAY_KEY = "bickford.chat.history.day";
const LEGACY_ARCHIVE_KEY = "bickford.chat.archive";
const AGENT_NAME = "bickford";
const ARCHIVE_NOTE =
  "single agent for the full environment • archives daily at local midnight";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
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
  const localToday = todayKey();
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
      const resolvedRole: ChatRole =
        message.role === "user" || message.author === "user" ? "user" : "agent";
      return {
        id: message.id ?? crypto.randomUUID(),
        role: resolvedRole,
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
  if (stored) {
    return migrateUtcDates({
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
    });
  }

  const legacyDaily = safeParse<ChatState>(
    localStorage.getItem(LEGACY_DAILY_KEY),
  );
  if (legacyDaily) {
    return migrateUtcDates({
      currentDate: legacyDaily.currentDate ?? todayKey(),
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
    localStorage.getItem(LEGACY_HISTORY_KEY),
  );
  const legacyArchives = safeParse<DailyArchive[]>(
    localStorage.getItem(LEGACY_ARCHIVE_KEY),
  );
  const legacyDay = localStorage.getItem(LEGACY_HISTORY_DAY_KEY);

  return migrateUtcDates({
    currentDate: legacyDay ?? todayKey(),
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
  localStorage.removeItem(LEGACY_DAILY_KEY);
  localStorage.removeItem(LEGACY_HISTORY_KEY);
  localStorage.removeItem(LEGACY_HISTORY_DAY_KEY);
  localStorage.removeItem(LEGACY_ARCHIVE_KEY);
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

export default function ChatDock() {
  const [state, setState] = useState<ChatState>(() => hydrateState());
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [view, setView] = useState<"chat" | "logs" | "decisions">("chat");
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
    if (typeof window === "undefined") return;

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
    if (typeof window === "undefined") return;

    function handleStorage(event: StorageEvent) {
      if (event.key && event.key !== STORAGE_KEY) {
        return;
      }
      setState(hydrateState());
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  const placeholder = useMemo(() => "Ask a question with /plan", []);
  const decisions = useMemo(() => {
    const normalized = state.messages
      .filter((message) => message.role === "user")
      .map((message) => ({
        id: message.id,
        content: message.content,
        key: message.content.trim().toLowerCase(),
      }));
    const counts = normalized.reduce<Record<string, number>>((acc, item) => {
      acc[item.key] = (acc[item.key] ?? 0) + 1;
      return acc;
    }, {});
    return normalized.map((item) => ({
      id: item.id,
      content: item.content,
      conflict: counts[item.key] > 1,
    }));
  }, [state.messages]);
  const logs = useMemo(() => {
    const entries: DailyArchive[] = [];
    if (state.messages.length > 0) {
      entries.push({ date: state.currentDate, messages: state.messages });
    }
    return entries.concat(state.archives);
  }, [state]);

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
      content: `Acknowledged. The single agent for the full environment (${AGENT_NAME}) will archive today’s history at local midnight.`,
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
    <section className={`chatDock ${isOpen ? "open" : "closed"}`}>
      <header className="chatDockHeader">
        <div>
          <div className="chatDockTitle">{AGENT_NAME}</div>
          <div className="chatDockSubtitle">
            {ARCHIVE_NOTE} • today {state.currentDate}
          </div>
        </div>
        <div className="chatDockActions">
          <button
            className={`chatDockToggle ${view === "chat" ? "active" : ""}`}
            onClick={() => setView("chat")}
          >
            Chat
          </button>
          <button
            className={`chatDockToggle ${view === "logs" ? "active" : ""}`}
            onClick={() => setView("logs")}
          >
            Logs
          </button>
          <button
            className={`chatDockToggle ${view === "decisions" ? "active" : ""}`}
            onClick={() => setView("decisions")}
          >
            Decisions
          </button>
          <button className="chatDockToggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "Minimize" : "Open"}
          </button>
        </div>
      </header>

      {isOpen ? (
        <>
          <div className="chatDockBody">
            {view === "decisions" ? (
              decisions.length === 0 ? (
                <div className="chatDockEmpty">No decisions captured yet.</div>
              ) : (
                <div className="chatDockList">
                  {decisions.map((decision) => (
                    <div key={decision.id} className="chatDockDecision">
                      <div className="chatDockDecisionTitle">Decision</div>
                      <div className="chatDockText">{decision.content}</div>
                      <div className="chatDockDecisionMeta">
                        {decision.conflict
                          ? "Conflict: overlaps with an existing decision"
                          : "Conflict: none"}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : view === "logs" ? (
              logs.length === 0 ? (
                <div className="chatDockEmpty">
                  No archived days yet. Start chatting to build a daily log.
                </div>
              ) : (
                <div className="chatDockList">
                  {logs.map((archive) => (
                    <div key={archive.date} className="chatDockDay">
                      <div className="chatDockDayHeader">{archive.date}</div>
                      {archive.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`chatDockBubble ${message.role}`}
                        >
                          <div className="chatDockRole">
                            {message.role === "user" ? "You" : AGENT_NAME}
                          </div>
                          <div className="chatDockText">{message.content}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            ) : state.messages.length === 0 ? (
              <div className="chatDockEmpty">
                Start a conversation. Your messages are saved and archived
                daily.
              </div>
            ) : (
              state.messages.map((message) => (
                <div
                  key={message.id}
                  className={`chatDockBubble ${message.role}`}
                >
                  <div className="chatDockRole">
                    {message.role === "user" ? "You" : AGENT_NAME}
                  </div>
                  <div className="chatDockText">{message.content}</div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {view === "decisions" ? null : (
            <footer className="chatDockFooter">
              <div className="chatDockComposer">
                <button
                  className="chatDockIconButton"
                  type="button"
                  aria-label="Add context"
                >
                  +
                </button>
                <select
                  className="chatDockSelect"
                  aria-label="Intent"
                  defaultValue="intent-question"
                >
                  <option value="intent-question">Intent: Question</option>
                  <option value="intent-decision">Intent: Decision</option>
                  <option value="intent-plan">Intent: Plan</option>
                </select>
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
                />
                <button
                  className="chatDockIconButton"
                  type="button"
                  aria-label="Record voice note"
                >
                  🎤
                </button>
                <button
                  className="chatDockIconButton primary"
                  type="button"
                  onClick={sendMessage}
                  aria-label="Send message"
                >
                  ➤
                </button>
              </div>
            </footer>
          )}
        </>
      ) : null}
    </section>
  );
}
