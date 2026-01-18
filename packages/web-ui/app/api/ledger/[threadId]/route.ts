import { NextResponse } from "next/server";
import { readThread, writeThread } from "@/lib/ledger/fs-ledger";

export async function GET(
  _req: Request,
  { params }: { params: { threadId: string } }
) {
  const data = readThread(params.threadId);
  return NextResponse.json(data ?? {});
}

export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  const body = await req.json();
  writeThread(params.threadId, body);
  return NextResponse.json({ ok: true });
}
