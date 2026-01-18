export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { listThreads } from "@bickford/ledger";

export async function GET() {
  const threads = await listThreads();
  return NextResponse.json({ threads });
}
