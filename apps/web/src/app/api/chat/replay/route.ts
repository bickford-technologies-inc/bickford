/**
 * Chat Replay API Route
 *
 * Deterministic, side-effect-free replay of chat threads.
 *
 * INVARIANTS:
 * - Replay mode MUST NOT execute
 * - No rule mutation
 * - No intent mutation
 * - Only allowed write: lastReplayedAt
 *
 * Features:
 * - Read-only thread replay
 * - Rule linkage preservation
 * - Intent derivation replay
 * - Execution state visibility (non-executing)
 *
 * TIMESTAMP: 2026-02-08T00:00:00Z
 */

export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getPrisma } from "@bickford/db";

export async function GET(req: NextRequest) {
  const prisma = getPrisma();
  const searchParams = req.nextUrl.searchParams;
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return Response.json(
      { error: "threadId query parameter is required" },
      { status: 400 }
    );
  }

  // 🔍 Read-only fetch (includes rule linkage, no execution)
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      messages: {
        include: {
          intent: {
            include: {
              execution: true, // visibility only
            },
          },
          ruleEntry: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!thread) {
    return Response.json({ error: "Thread not found" }, { status: 404 });
  }

  // ⏱️ Allowed replay telemetry write
  const now = new Date();
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastReplayedAt: now },
  });

  // 📦 Deterministic replay payload
  return Response.json({
    mode: "replay",
    thread: {
      id: thread.id,
      createdAt: thread.createdAt,
      lastReplayedAt: now.toISOString(),
      messages: thread.messages.map((msg: any) => ({
        id: msg.id,
        createdAt: msg.createdAt,
        author: msg.author,
        text: msg.text,
        resolution: msg.resolution,
        intent: msg.intent
          ? {
              id: msg.intent.id,
              intentType: msg.intent.intentType,
              goal: msg.intent.goal,
              admissibility: msg.intent.admissibility,
              denialReason: msg.intent.denialReason,
              execution: msg.intent.execution
                ? {
                    id: msg.intent.execution.id,
                    status: msg.intent.execution.status,
                    artifacts: msg.intent.execution.artifacts,
                  }
                : null,
            }
          : null,
        ruleEntry: msg.ruleEntry
          ? {
              id: msg.ruleEntry.id,
              kind: msg.ruleEntry.kind,
              title: msg.ruleEntry.title,
              content: msg.ruleEntry.content,
            }
          : null,
      })),
    },
  });
}
