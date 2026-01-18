import { NextResponse } from "next/server";
import { listThreads } from "@/lib/ledger/fs-ledger";

export async function GET() {
  return NextResponse.json(listThreads());
}
