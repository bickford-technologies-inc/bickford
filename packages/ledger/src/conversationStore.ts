import { promises as fs } from "fs";
import * as crypto from "node:crypto";
// Bun supports most of node:path, but we can use Bun's path if needed
import * as path from "node:path";

// Bun-native file APIs
const {
  file: BunFile,
  write: BunWrite,
  readableStreamToText: BunReadableStreamToText,
} = Bun;

import type {
  Conversation,
  ConversationMessage,
  ConversationSummary,
  ConversationTraceSummary,
} from "@bickford/types";

const CONVERSATION_PREFIX = "conversation-";
const DEFAULT_TITLE = "Untitled conversation";

async function ensureConversationDir() {
  const override = process.env.BICKFORD_TRACE_DIR;
  const preferred =
    override ??
    (process.env.VERCEL
      ? path.join("/tmp", "trace")
      : path.join(process.cwd(), "trace"));
  const target = path.join(preferred, "conversations");
  try {
    await BunWrite(target + "/.bunkeep", ""); // ensure dir exists by writing a dummy file
    return target;
  } catch (error) {
    const fallbackBase = path.join("/tmp", "trace");
    const fallback = path.join(fallbackBase, "conversations");
    if (target !== fallback) {
      await BunWrite(fallback + "/.bunkeep", "");
      return fallback;
    }
    throw error;
  }
}

function conversationPath(baseDir: string, id: string) {
  return path.join(baseDir, `${CONVERSATION_PREFIX}${id}.json`);
}

function deriveTitle(message: ConversationMessage | null) {
  if (!message) {
    return DEFAULT_TITLE;
  }
  const trimmed = message.content.trim();
  if (!trimmed) {
    return DEFAULT_TITLE;
  }
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;
}

function previewMessage(messages: ConversationMessage[]) {
  const firstUser = messages.find((message) => message.role === "user");
  if (firstUser?.content) {
    return firstUser.content.slice(0, 72);
  }
  return messages[0]?.content?.slice(0, 72) ?? "";
}

export async function writeConversation(conversation: Conversation) {
  const dir = await ensureConversationDir();
  const filePath = conversationPath(dir, conversation.id);
  await BunWrite(filePath, JSON.stringify(conversation, null, 2));
}

export async function createConversation(
  initialMessage: ConversationMessage | null = null,
): Promise<Conversation> {
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: crypto.randomUUID(),
    title: deriveTitle(initialMessage),
    createdAt: now,
    updatedAt: now,
    messages: initialMessage ? [initialMessage] : [],
    trace: null,
  };

  await writeConversation(conversation);
  return conversation;
}

export async function readConversation(
  conversationId: string,
): Promise<Conversation | null> {
  const dir = await ensureConversationDir();
  const filePath = conversationPath(dir, conversationId);
  try {
    const bunFile = BunFile(filePath);
    if (!(await bunFile.exists())) {
      return null;
    }
    const raw = await bunFile.text();
    return JSON.parse(raw) as Conversation;
  } catch {
    return null;
  }
}

export async function appendConversationMessage(
  conversationId: string,
  message: ConversationMessage,
  trace?: ConversationTraceSummary | null,
): Promise<Conversation> {
  const existing = await readConversation(conversationId);
  const now = new Date().toISOString();
  const conversation: Conversation = existing ?? {
    id: conversationId,
    title: deriveTitle(message),
    createdAt: now,
    updatedAt: now,
    messages: [],
    trace: null,
  };

  const nextMessages = [...conversation.messages, message];
  const nextTitle =
    conversation.title === DEFAULT_TITLE && message.role === "user"
      ? deriveTitle(message)
      : conversation.title;

  const updated: Conversation = {
    ...conversation,
    title: nextTitle,
    updatedAt: now,
    messages: nextMessages,
    trace: trace ?? conversation.trace ?? null,
  };

  await writeConversation(updated);
  return updated;
}

export async function listConversationSummaries(): Promise<
  ConversationSummary[]
> {
  const dir = await ensureConversationDir();
  const files = await fs.readdir(dir);
  const conversations = await Promise.all(
    files
      .filter((file: string) => file.startsWith(CONVERSATION_PREFIX))
      .map(async (file: string) => {
        const raw = await Bun.file(path.join(dir, file)).text();
        try {
          return JSON.parse(raw) as Conversation;
        } catch {
          return null;
        }
      }),
  );

  return conversations
    .filter((conversation: Conversation | null): conversation is Conversation =>
      Boolean(conversation),
    )
    .map((conversation: Conversation) => {
      const lastMessage = conversation.messages.at(-1);
      return {
        id: conversation.id,
        title: conversation.title,
        preview: previewMessage(conversation.messages),
        updatedAt: conversation.updatedAt,
        lastMessageAt: lastMessage?.timestamp,
        messageCount: conversation.messages.length,
        trace: conversation.trace ?? null,
      };
    })
    .sort(
      (a: ConversationSummary, b: ConversationSummary) =>
        Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
}
