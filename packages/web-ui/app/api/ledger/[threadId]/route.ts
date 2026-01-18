export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { writeThread } from "@bickford/ledger";

export async function POST(
  _req: Request,
  { params }: { params: { threadId: string } },
) {
  await writeThread(params.threadId, {});
  return NextResponse.json({ ok: true });
}
