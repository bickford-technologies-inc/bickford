export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { listThreads } from "@/lib/ledger/fs-ledger.node";

export async function GET() {
  const threads = await listThreads();
  return NextResponse.json({ threads });
}
