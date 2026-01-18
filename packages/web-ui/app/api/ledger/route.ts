import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const LEDGER_DIR = path.join(process.cwd(), ".bickford", "ledger");

export async function GET() {
  if (!fs.existsSync(LEDGER_DIR)) {
    return NextResponse.json([]);
  }

  const files = fs.readdirSync(LEDGER_DIR).sort();
  const entries = files.flatMap(f =>
    fs
      .readFileSync(path.join(LEDGER_DIR, f), "utf8")
      .trim()
      .split("\n")
      .map(l => JSON.parse(l))
  );

  return NextResponse.json(entries.reverse());
}
