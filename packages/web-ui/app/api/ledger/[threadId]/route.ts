export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { writeThread } from "@bickford/ledger";
import { LedgerEntry } from "@bickford/types";
import crypto from "node:crypto";

export async function POST(
  _req: Request,
  { params }: { params: { threadId: string } },
) {
  const entry: LedgerEntry = {
    id: crypto.randomUUID(),
    event: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };
  writeThread(params.threadId, [entry]);
  return NextResponse.json({ ok: true });
}
