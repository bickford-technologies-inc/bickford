import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function sendMessageToBickfordChat(
  message: string,
): Promise<{ reply: string }> {
  // Call Anthropic Claude API for real response
  const completion = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229", // You may update to latest available model
    max_tokens: 256,
    messages: [{ role: "user", content: message }],
  });
  // Find the first content block of type 'text' and extract its text
  const textBlock = Array.isArray(completion.content)
    ? completion.content.find((block: any) => block.type === "text" && typeof block.text === "string")
    : null;
  const reply = textBlock?.text || "[No response]";
  return { reply };
}
