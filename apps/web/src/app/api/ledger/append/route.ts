import { append } from "@/lib/bickford/ledger";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  append(await req.json());
  return NextResponse.json({ ok: true });
}
