import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return Response.json(
      { error: "threadId query parameter is required" },
      { status: 400 }
    );
  }

  // Fetch thread with messages, including canon linkage
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      messages: {
        include: {
          intent: true,
          canonEntry: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!thread) {
    return Response.json({ error: "Thread not found" }, { status: 404 });
  }

  // Update lastReplayedAt timestamp
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastReplayedAt: new Date() },
  });

  // Return thread with canon linkage (side-effect free replay)
  return Response.json({
    thread: {
      id: thread.id,
      createdAt: thread.createdAt,
      lastReplayedAt: new Date().toISOString(),
      messages: thread.messages.map((msg) => ({
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
            }
          : null,
        canonEntry: msg.canonEntry
          ? {
              id: msg.canonEntry.id,
              kind: msg.canonEntry.kind,
              title: msg.canonEntry.title,
            }
          : null,
      })),
    },
  });
}
