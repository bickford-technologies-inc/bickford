import { scorePath } from "@/lib/bickford/ui-data";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pathMs } = await req.json();
  return NextResponse.json({ score: scorePath(pathMs) });
}
