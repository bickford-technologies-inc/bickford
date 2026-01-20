import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

type ChatRole = 'user' | 'agent';

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

const STORAGE_KEY = 'bickford.chat.unified.v1';
const LEGACY_DAILY_KEY = 'bickford.chat.daily.v1';
const LEGACY_HISTORY_KEY = 'bickford.chat.history';
const LEGACY_HISTORY_DAY_KEY = 'bickford.chat.history.day';
const LEGACY_ARCHIVE_KEY = 'bickford.chat.archive';
const AGENT_NAME = 'bickford';
const ARCHIVE_NOTE =
  'single agent for the full environment • archives chat history daily at local midnight';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
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
        message.role === 'user' || message.author === 'user' ? 'user' : 'agent';
      return {
        id: message.id ?? crypto.randomUUID(),
        role: resolvedRole,
        content: message.content ?? message.text ?? '',
        timestamp:
          typeof message.timestamp === 'number'
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

function hydrateState(): ChatState {
  if (typeof window === 'undefined') {
    return { currentDate: todayKey(), messages: [], archives: [] };
  }

  const stored = parseStoredState(window.localStorage.getItem(STORAGE_KEY));
  if (stored) {
    return stored;
  }

  const legacyDaily = safeParse<ChatState>(
    window.localStorage.getItem(LEGACY_DAILY_KEY),
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
    window.localStorage.getItem(LEGACY_HISTORY_KEY),
  );
  const legacyArchives = safeParse<DailyArchive[]>(
    window.localStorage.getItem(LEGACY_ARCHIVE_KEY),
  );
  const legacyDay = window.localStorage.getItem(LEGACY_HISTORY_DAY_KEY);

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
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.localStorage.removeItem(LEGACY_DAILY_KEY);
  window.localStorage.removeItem(LEGACY_HISTORY_KEY);
  window.localStorage.removeItem(LEGACY_HISTORY_DAY_KEY);
  window.localStorage.removeItem(LEGACY_ARCHIVE_KEY);
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

export default function UnifiedChatDock() {
  const [state, setState] = React.useState<ChatState>(() => hydrateState());
  const [input, setInput] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(true);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      persistState(reconciled);
      return reconciled;
    });
  }, []);

  React.useEffect(() => {
    persistState(state);
  }, [state]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
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

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

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

    window.addEventListener('focus', handleResume);
    window.addEventListener('visibilitychange', handleResume);

    return () => {
      window.removeEventListener('focus', handleResume);
      window.removeEventListener('visibilitychange', handleResume);
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) {
        return;
      }
      if (event.key && event.key !== STORAGE_KEY) {
        return;
      }
      const nextState = parseStoredState(event.newValue) ?? hydrateState();
      setState(nextState);
    }

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      const nextState = {
        ...reconciled,
        messages: [...reconciled.messages, userMessage],
      };
      persistState(nextState);
      return nextState;
    });
    setInput('');
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: { xs: 'calc(100% - 32px)', sm: 320 },
        zIndex: 1200,
      }}
    >
      <Paper elevation={6} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {AGENT_NAME}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ARCHIVE_NOTE} • today {state.currentDate}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" onClick={() => setIsOpen((prev) => !prev)}>
            {isOpen ? 'Hide' : 'Chat'}
          </Button>
        </Box>
        {isOpen ? (
          <>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1,
                bgcolor: 'background.default',
                maxHeight: 240,
                overflowY: 'auto',
              }}
            >
              {state.messages.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No messages yet.
                </Typography>
              ) : (
                state.messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      mb: 1.5,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {message.role === 'user' ? 'You' : AGENT_NAME}
                    </Typography>
                    <Typography variant="body2">{message.content}</Typography>
                  </Box>
                ))
              )}
              <div ref={bottomRef} />
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                value={input}
                onChange={(event) => setInput(event.target.value)}
                size="small"
                placeholder="Ask a question with /plan"
                fullWidth
              />
              <Button type="submit" variant="contained">
                Send
              </Button>
            </Box>
          </>
        ) : null}
      </Paper>
    </Box>
  );
}
