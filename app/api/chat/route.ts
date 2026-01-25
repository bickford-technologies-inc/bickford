import crypto from "node:crypto";

export const runtime = "nodejs";

import {
  saveMessage,
  getMessages,
  saveLedgerEntry,
  getLedgerEntries,
} from "@bickford/ledger/src/prismaLedger";
import type {
  Conversation,
  ConversationMessage,
  ConversationTraceSummary,
} from "@bickford/types";

import { appendDailyArchive } from "../../lib/archive";
import { ENVIRONMENT_AGENT } from "../../lib/agent";

type ChatRequest = {
  action?: "create";
  conversationId?: string;
  message?: {
    id?: string;
    role?: "user" | "agent";
    content?: string;
    timestamp?: number;
  };
  trace?: ConversationTraceSummary | null;
  origin?: string;
  sessionId?: string;
};

function buildTranscript(messages: ConversationMessage[]) {
  return messages
    .map((message) => {
      const roleLabel = message.role === "user" ? "User" : "Agent";
      return `${roleLabel}: ${message.content}`;
    })
    .join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  const timeline = await getLedgerEntries();
  let conversation: Conversation | null = null;

  if (conversationId) {
    conversation = await readConversation(conversationId);
  }

  if (!conversation && timeline.length > 0) {
    conversation = await readConversation(timeline[0].id);
  }

  return Response.json({
    conversation,
    timeline,
    transcript: conversation ? buildTranscript(conversation.messages) : "",
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ChatRequest;
  const now = new Date();
  const receivedAt = now.toISOString();

  if (payload.action === "create") {
    // Create a new conversation by saving a system message (or just return empty)
    const message = await saveMessage({ content: "Conversation started" });
    const messages = await getMessages();
    return Response.json({
      conversation: { id: message.id, messages: [message] },
      timeline: messages,
      transcript: "",
    });
  }

  if (!payload.message?.content?.trim()) {
    return Response.json(
      { error: "Message is required.", details: "Missing message content." },
      { status: 400 },
    );
  }

  // Save user message
  const userMessage = await saveMessage({
    userId: payload.message.role === "user" ? payload.message.id : undefined,
    content: payload.message.content.trim(),
  });

  // Optionally, save to ledger as well
  await saveLedgerEntry({
    eventType: "chat_message",
    payload: userMessage,
    previousHash: "", // Compute as needed
    currentHash: "", // Compute as needed
  });

  // Fetch all messages for the timeline
  const messages = await getMessages();
  const transcript = messages
    .map((m) => `${m.userId || "User"}: ${m.content}`)
    .join("\n");

  return Response.json({
    conversation: { id: userMessage.id, messages: [userMessage] },
    timeline: messages,
    transcript,
    memory: {
      matches: [], // Implement RAG/memory as needed
      context: "",
    },
  });
}
