// scripts/anthropic-bun-demo.ts
// Minimal Bun script to call Anthropic API and print response

const apiKey = Bun.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("Missing ANTHROPIC_API_KEY in environment");
  process.exit(1);
}

const body = {
  model: "claude-3-opus-20240229",
  max_tokens: 32,
  messages: [{ role: "user", content: "Say hello from Bun!" }],
};

const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
  body: JSON.stringify(body),
});

if (!response.ok) {
  console.error("Anthropic API error:", response.status, await response.text());
  process.exit(1);
}

const data = await response.json();
console.log("Anthropic response:", data);
