import { NextRequest } from "next/server";
import { validateIntent } from "@bickford/core/intent/validateIntent";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = validateIntent(body);

  if (!result.ok) {
    return new Response(
      JSON.stringify({
        status: "refused",
        reason: result.reason,
      }),
      { status: 400 },
    );
  }

  return new Response(
    JSON.stringify({
      status: "accepted",
      message: "Execution intent validated",
    }),
    { status: 200 },
  );
}
