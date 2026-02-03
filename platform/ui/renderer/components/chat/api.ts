// Stub for future chat API integration
export async function sendMessageToBickfordChat(
  message: string,
): Promise<{ reply: string }> {
  // Echo the user's message as a minimal working implementation
  await new Promise((r) => setTimeout(r, 400));
  return { reply: `Echo: ${message}` };
}
