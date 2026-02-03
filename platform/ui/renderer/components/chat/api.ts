// Type guard for TextBlock
function isTextBlock(block: any): block is { type: "text"; text: string } {
  return block && block.type === "text" && typeof block.text === "string";
}

export async function sendMessageToBickfordChat(
  message: string,
): Promise<{ reply: string }> {
  // Call the secure API route instead of Anthropic SDK directly
  const res = await fetch("/api/anthropic-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    return { reply: `[API error: ${res.status}]` };
  }
  const data = await res.json();
  return { reply: data.reply ?? "[No response]" };
}
