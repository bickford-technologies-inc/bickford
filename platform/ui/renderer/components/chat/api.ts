import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Type guard for TextBlock
function isTextBlock(block: any): block is { type: "text"; text: string } {
  return block && block.type === "text" && typeof block.text === "string";
}

export async function sendMessageToBickfordChat(
  message: string,
): Promise<{ reply: string }> {
  // Call Anthropic Claude API for real response
  const completion = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229", // You may update to latest available model
    max_tokens: 256,
    messages: [{ role: "user", content: message }],
  });
  // Use type guard to find the first text block
  const textBlock = Array.isArray(completion.content)
    ? completion.content.find(isTextBlock)
    : null;
  const reply = textBlock
    ? (textBlock as { text: string }).text
    : "[No response]";
  return { reply };
}
