import { scoreTTV } from "@/lib/bickford/optr";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pathMs } = await req.json();
  return NextResponse.json({ score: scoreTTV(pathMs) });
}
