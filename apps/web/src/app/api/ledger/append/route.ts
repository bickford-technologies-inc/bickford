import { persist } from "@/lib/bickford/ui-data";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  persist(await req.json());
  return NextResponse.json({ ok: true });
}
