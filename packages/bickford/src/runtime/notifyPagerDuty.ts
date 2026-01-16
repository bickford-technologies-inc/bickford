import fetch from "node-fetch"

export async function notifyPagerDuty(
  integrationKey: string,
  event: {
    severity: string
    summary: string
    source: string
    custom_details?: Record<string, unknown>
  }
) {
  await fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      routing_key: integrationKey,
      event_action: "trigger",
      payload: event
    })
  })
}
