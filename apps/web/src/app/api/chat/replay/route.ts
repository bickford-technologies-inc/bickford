/**
 * Chat Replay API Route
 *
 * Deterministic, side-effect-free replay of chat threads.
 * CANONICAL INVARIANT: Replay mode cannot execute.
 *
 * Features:
 * - Read-only thread replay
 * - Canon linkage preservation
 * - Intent derivation replay
 * - No mutation of canon or execution state
 *
 * TIMESTAMP: 2026-02-08T00:00:00Z
 */

import { getPrisma } from "@bickford/db";
import { NextRequest } from "next/server";

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

  // Fetch thread with messages, including canon linkage
  // This is read-only and does NOT trigger execution
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      messages: {
        include: {
          intent: {
            include: {
              execution: true,
            },
          },
          canonEntry: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!thread) {
    return Response.json({ error: "Thread not found" }, { status: 404 });
  }

  // Update lastReplayedAt timestamp (only DB write allowed in replay)
  const now = new Date();
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastReplayedAt: now },
  });

  // Return thread with full canon linkage (side-effect free replay)
  // Execution state is returned but NOT executed
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
        canonEntry: msg.canonEntry
          ? {
              id: msg.canonEntry.id,
              kind: msg.canonEntry.kind,
              title: msg.canonEntry.title,
              content: msg.canonEntry.content,
            }
          : null,
      })),
    },
  });
}
