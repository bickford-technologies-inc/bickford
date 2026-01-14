import { admissible } from "@/lib/bickford/nonInterference";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { rule, deltaTTV, otherDeltas } = await req.json();

  // UI surface only: stub promotion
  if (deltaTTV < 0 && admissible(otherDeltas)) {
    return NextResponse.json({ promoted: true });
  }

  return NextResponse.json({ promoted: false });
}
