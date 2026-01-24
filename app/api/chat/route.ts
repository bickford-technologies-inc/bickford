import crypto from "node:crypto";

export const runtime = "nodejs";

import {
  appendConversationMessage,
  buildConversationMemoryContext,
  createConversation,
  listConversationSummaries,
  readConversation,
  searchConversationMemory,
  writeConversation,
} from "@bickford/ledger";
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

  const timeline = await listConversationSummaries();
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
    const conversation = await createConversation();
    const timeline = await listConversationSummaries();

    await appendDailyArchive("chat", {
      agent: ENVIRONMENT_AGENT,
      receivedAt,
      action: "create",
      conversationId: conversation.id,
    });

    return Response.json({
      conversation,
      timeline,
      transcript: "",
    });
  }

  if (!payload.message?.content?.trim()) {
    return Response.json(
      { error: "Message is required.", details: "Missing message content." },
      { status: 400 },
    );
  }

  const message: ConversationMessage = {
    id: payload.message.id ?? crypto.randomUUID(),
    role: payload.message.role ?? "user",
    content: payload.message.content.trim(),
    timestamp: payload.message.timestamp ?? Date.now(),
  };

  let conversation = payload.conversationId
    ? await readConversation(payload.conversationId)
    : null;

  if (!conversation) {
    conversation = await createConversation(message);
    if (payload.trace) {
      conversation = {
        ...conversation,
        trace: payload.trace,
      };
      await writeConversation(conversation);
    }
  } else {
    conversation = await appendConversationMessage(
      conversation.id,
      message,
      payload.trace ?? null,
    );
  }

  const timeline = await listConversationSummaries();
  const transcript = buildTranscript(conversation.messages);
  const memoryMatches =
    message.role === "user"
      ? await searchConversationMemory(message.content, {
          excludeConversationId: conversation.id,
          includeRoles: ["user", "agent"],
        })
      : [];
  const memoryContext = buildConversationMemoryContext(memoryMatches);

  await appendDailyArchive("chat", {
    agent: ENVIRONMENT_AGENT,
    receivedAt,
    payload: {
      conversationId: conversation.id,
      origin: payload.origin,
      sessionId: payload.sessionId,
      message,
      trace: payload.trace ?? null,
      transcript,
      memory: {
        matches: memoryMatches,
        context: memoryContext,
      },
    },
  });

  return Response.json({
    conversation,
    timeline,
    transcript,
    memory: {
      matches: memoryMatches,
      context: memoryContext,
    },
  });
}
