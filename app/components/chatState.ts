export type ChatRole = "user" | "agent";

export type TraceSummary = {
  decision: string;
  canonId: string;
  ledgerId: string;
  ledgerHash: string;
  durationMs: number;
  peakDurationMs: number;
  knowledgeId: string;
  rationale: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

export type TimelineEntry = {
  id: string;
  label: string;
  summary: string;
  timestamp: number;
  trace: TraceSummary | null;
};

export const AGENT_NAME = "bickford";
export const ARCHIVE_NOTE =
  "single agent for the full environment • archives chat history daily at local midnight";

export const CHAT_CONVERSATION_KEY = "bickford.chat.active.v1";

export function loadConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CHAT_CONVERSATION_KEY);
}

export function persistConversationId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(CHAT_CONVERSATION_KEY, id);
  } else {
    localStorage.removeItem(CHAT_CONVERSATION_KEY);
  }
}

export function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const CHAT_STORAGE_KEY = "bickford.chat.unified.v1";

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

function createConversationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `conversation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function migrateUtcDates(state: ChatState): ChatState {
  const localToday = todayKey();
  return {
    currentDate: utcDateKeyToLocal(state.currentDate),
    conversationId: state.conversationId ?? createConversationId(),
    messages: Array.isArray(state.messages)
      ? normalizeMessages(state.messages)
      : [],
    archives: Array.isArray(state.archives)
      ? state.archives.map((archive) => ({
          id:
            typeof archive.id === "string"
              ? archive.id
              : `${archive.date}-${createConversationId()}`,
          date: archive.date,
          conversationId:
            typeof archive.conversationId === "string"
              ? archive.conversationId
              : createConversationId(),
          messages: normalizeMessages(archive.messages ?? []),
        }))
      : [],
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

function parseStoredState(raw: string | null): ChatState | null {
  const stored = safeParse<ChatState>(raw);
  if (!stored) {
    return null;
  }
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

export function hydrateChatState(): ChatState {
  if (typeof window === "undefined") {
    return {
      currentDate: todayKey(),
      conversationId: createConversationId(),
      messages: [],
      archives: [],
    };
  }

  const stored = parseStoredState(localStorage.getItem(CHAT_STORAGE_KEY));
  if (stored) {
    return stored;
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
          id:
            typeof archive.id === "string"
              ? archive.id
              : `${archive.date}-${createConversationId()}`,
          date: archive.date,
          conversationId:
            typeof archive.conversationId === "string"
              ? archive.conversationId
              : createConversationId(),
          messages: normalizeMessages(archive.messages ?? []),
        }))
      : [],
  });
}

export function reconcileDaily(state: ChatState): ChatState {
  const today = todayKey();
  if (state.currentDate === today) {
    return state;
  }

  const archives = [...state.archives];
  if (state.messages.length > 0) {
    archives.unshift({
      id: `${state.currentDate}-${state.conversationId}`,
      date: state.currentDate,
      conversationId: state.conversationId,
      messages: state.messages,
    });
  }

  return {
    currentDate: today,
    conversationId: createConversationId(),
    messages: [],
    archives,
  };
}

export function startNewConversation(state: ChatState): ChatState {
  const archives = [...state.archives];
  if (state.messages.length > 0) {
    archives.unshift({
      id: `${state.currentDate}-${state.conversationId}`,
      date: state.currentDate,
      conversationId: state.conversationId,
      messages: state.messages,
    });
  }

  return {
    ...state,
    conversationId: createConversationId(),
    messages: [],
    archives,
  };
}

export function persistChatState(state: ChatState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
  localStorage.removeItem(LEGACY_DAILY_KEY);
  localStorage.removeItem(LEGACY_HISTORY_KEY);
  localStorage.removeItem(LEGACY_HISTORY_DAY_KEY);
  localStorage.removeItem(LEGACY_ARCHIVE_KEY);
}

export function parseChatState(raw: string | null): ChatState | null {
  return parseStoredState(raw);
}

export function msUntilNextMidnight(now: Date = new Date()) {
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
