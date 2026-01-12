import { getLedger } from "@bickford/ledger";

export async function GET() {
  return Response.json(getLedger());
}
