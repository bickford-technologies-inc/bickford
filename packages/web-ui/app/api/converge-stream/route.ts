export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { converge } from "@bickford/execution-convergence";
import { writeThread } from "@bickford/ledger";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await converge(body);
  await writeThread("converge", result);
  return NextResponse.json(result);
}
