export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// TEMP web-local history adapter.
// System history lives outside web; this is a read-only UI surface.

type HistoryEntry = {
  id: string;
  timestamp: string;
  type: string;
  payload: unknown;
};

const mockHistory: HistoryEntry[] = [
  {
    id: "init",
    timestamp: new Date().toISOString(),
    type: "SYSTEM",
    payload: { message: "Web history initialized" },
  },
];

export async function GET() {
  return Response.json({
    entries: mockHistory,
    note: "This is a web-surface history view. System enforcement lives outside the UI boundary.",
  });
}
