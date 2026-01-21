export type ChatRole = "user" | "agent";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

export type DailyArchive = {
  date: string;
  messages: ChatMessage[];
};

export type ChatState = {
  currentDate: string;
  messages: ChatMessage[];
  archives: DailyArchive[];
};

export const AGENT_NAME = "bickford";
export const ARCHIVE_NOTE =
  "single agent for the full environment • archives chat history daily at local midnight";

export const CHAT_STORAGE_KEY = "bickford.chat.unified.v1";
const LEGACY_DAILY_KEY = "bickford.chat.daily.v1";
const LEGACY_HISTORY_KEY = "bickford.chat.history";
const LEGACY_HISTORY_DAY_KEY = "bickford.chat.history.day";
const LEGACY_ARCHIVE_KEY = "bickford.chat.archive";

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
    return { currentDate: todayKey(), messages: [], archives: [] };
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
          date: archive.date,
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
    archives.unshift({ date: state.currentDate, messages: state.messages });
  }

  return {
    currentDate: today,
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
