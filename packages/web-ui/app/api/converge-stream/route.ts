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
    event: {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };

  writeThread("converge", [entry]);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}
