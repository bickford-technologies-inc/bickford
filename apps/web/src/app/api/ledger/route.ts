export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// TEMP web-local ledger adapter.
// Canonical ledger lives outside web; this is a read-only UI surface.

type LedgerEntry = {
  id: string;
  timestamp: string;
  type: string;
  payload: unknown;
};

const mockLedger: LedgerEntry[] = [
  {
    id: "init",
    timestamp: new Date().toISOString(),
    type: "SYSTEM",
    payload: { message: "Web ledger initialized" },
  },
];

export async function GET() {
  return Response.json({
    entries: mockLedger,
    note: "This is a web-surface ledger view. Canonical ledger enforcement lives outside the UI boundary.",
  });
}
