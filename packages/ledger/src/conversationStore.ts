import crypto from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

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

  await mkdir(target, { recursive: true });
  return target;
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
  await writeFile(filePath, JSON.stringify(conversation, null, 2));
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
  if (!existsSync(filePath)) {
    return null;
  }
  const raw = await readFile(filePath, "utf8");
  try {
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
  const files = await readdir(dir);
  const conversations = await Promise.all(
    files
      .filter((file) => file.startsWith(CONVERSATION_PREFIX))
      .map(async (file) => {
        const raw = await readFile(path.join(dir, file), "utf8");
        try {
          return JSON.parse(raw) as Conversation;
        } catch {
          return null;
        }
      }),
  );

  return conversations
    .filter((conversation): conversation is Conversation =>
      Boolean(conversation),
    )
    .map((conversation) => {
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
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}
