// Test Anthropic API with Bun
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": Bun.env.ANTHROPIC_API_KEY!,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 100,
    messages: [{ role: "user", content: "Say hello from Bun!" }],
  }),
});

const data = await response.json();
console.log("Response:", data.content?.[0]?.text || data);
