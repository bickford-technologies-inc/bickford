import { appendDailyArchive } from "../../lib/archive";
import { ENVIRONMENT_AGENT } from "../../lib/agent";

export async function POST(request: Request) {
  const payload = await request.json();
  const now = new Date();
  const entry = {
    agent: ENVIRONMENT_AGENT,
    receivedAt: now.toISOString(),
    ...payload,
  };

  await appendDailyArchive("chat", entry);

  return Response.json({ status: "ok" });
}
