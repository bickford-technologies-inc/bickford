import { readAll } from "@bickford/ledger";
import { NextResponse } from "next/server";

export async function GET() {
  return new Response(JSON.stringify(readAll()), {
    headers: { "Content-Type": "application/json" },
  });
}
