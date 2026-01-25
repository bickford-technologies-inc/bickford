import crypto from "node:crypto";

export const runtime = "nodejs";

import {
  saveMessage,
  getMessages,
  saveLedgerEntry,
  getLedgerEntries,
} from "../../../packages/ledger/src/prismaLedger";
import {
  searchConversationMemory,
  buildConversationMemoryContext,
} from "../../../packages/ledger/src/prismaConversationMemory";
// Node.js: Do not import from @bickford/ledger/conversationStore or Bun-native modules
// import { readConversation } from "@bickford/ledger/conversationStore";
import type {
  Conversation,
  ConversationMessage,
  ConversationTraceSummary,
} from "@bickford/types";
// import { compressAndLogIfNeeded } from "@bickford/ledger/src/conversationCompressionHandler";
import Anthropic from "@anthropic-ai/sdk";

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

  const timeline: { id: string }[] = await getLedgerEntries();
  let conversation: Conversation | null = null;

  // Node.js stub: no conversation loading
  // if (conversationId) {
  //   conversation = await readConversation(conversationId);
  // }

  // if (!conversation && timeline.length > 0) {
  //   conversation = await readConversation(timeline[0].id);
  // }

  // Always return null for conversation in stub
  conversation = null;

  return Response.json({
    conversation,
    timeline,
    transcript: "", // Always empty in Node.js stub
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
  const messages: { userId?: string; content: string }[] = await getMessages();

  // --- Conversation Compression Integration ---
  // Convert messages to ConversationMessage[] if needed
  const conversationMessages = messages.map((m) => ({
    role: m.userId ? "user" : "agent",
    content: m.content,
    // Add other fields as needed
  }));
  // const compressedMessages = await compressAndLogIfNeeded(conversationMessages);

  // --- RAG/Memory Integration ---
  const ragMatches = await searchConversationMemory(
    payload.message?.content || "",
    { limit: 5 },
  );
  const ragContext = buildConversationMemoryContext(ragMatches);
  // --- End RAG/Memory Integration ---

  // --- Claude/Anthropic API Call ---
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
  const claudeMessages = [
    ragContext ? { role: "system", content: ragContext } : null,
    ...conversationMessages,
  ].filter(Boolean);
  const claudeResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: claudeMessages
      .filter((m): m is { role: string; content: string } => m !== null)
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
  });
  // Find the first text block
  const firstTextBlock = Array.isArray(claudeResponse.content)
    ? claudeResponse.content.find(
        (block) =>
          typeof block === "object" &&
          block !== null &&
          "type" in block &&
          (block as any).type === "text" &&
          typeof (block as any).text === "string",
      )
    : undefined;
  const assistantReply =
    firstTextBlock && typeof (firstTextBlock as any).text === "string"
      ? (firstTextBlock as any).text
      : "[No response]";
  // --- End Claude/Anthropic API Call ---

  const transcript = conversationMessages
    .map(
      (m: { role: string; content: string }) =>
        `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
    )
    .join("\n");

  return Response.json({
    conversation: { id: userMessage.id, messages: [userMessage] },
    timeline: messages,
    transcript,
    assistantReply,
    memory: {
      matches: ragMatches,
      context: ragContext,
    },
  });
}
