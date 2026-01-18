import { readAll } from "@bickford/ledger";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(readAll());
}
