export type Message = {
  role: "user" | "system";
  content: string;
};

export type Thread = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

const KEY = "bickford:threads";

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  localStorage.setItem(KEY, JSON.stringify(threads));
}

export function newThread(): Thread {
  return {
    id: crypto.randomUUID(),
    title: "New Conversation",
    messages: [],
    updatedAt: Date.now()
  };
}
