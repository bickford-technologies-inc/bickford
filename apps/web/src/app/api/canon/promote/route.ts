import { promote } from "@/lib/bickford/canon";
import { admissible } from "@/lib/bickford/nonInterference";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { rule, deltaTTV, otherDeltas } = await req.json();

  if (deltaTTV < 0 && admissible(otherDeltas)) {
    promote(rule);
    return NextResponse.json({ promoted: true });
  }

  return NextResponse.json({ promoted: false });
}
