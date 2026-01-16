import fetch from "node-fetch";

export async function notifySlack(
  webhook: string,
  channel: string,
  text: string
) {
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel,
      text,
    }),
  });
}
