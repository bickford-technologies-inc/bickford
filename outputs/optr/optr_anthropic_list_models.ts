const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY || "YOUR_ANTHROPIC_API_KEY";

async function listModels() {
  const response = await fetch("https://api.anthropic.com/v1/models", {
    method: "GET",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `Anthropic API error: ${response.status}\nBody: ${errorBody}`,
    );
    throw new Error(`Anthropic API error: ${response.status}`);
  }
  const data = await response.json();
  console.log("Available Anthropic models:", data);
}

(async () => {
  await listModels();
})();
