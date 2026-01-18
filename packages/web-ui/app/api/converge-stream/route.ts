export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { converge } from "@bickford/execution-convergence";
import { writeThread } from "@bickford/ledger";
import { LedgerEntry } from "@bickford/types";
import crypto from "node:crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await converge(body);

  const entry: LedgerEntry = {
    id: crypto.randomUUID(),
    threadId: "converge",
    role: "system",
    content: JSON.stringify(result),
    ts: Date.now(),
    intent: undefined,
    decision: undefined,
  };

  writeThread("converge", [entry]);
  return NextResponse.json(result);
}
