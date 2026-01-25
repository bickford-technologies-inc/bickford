// packages/execution-convergence/src/anthropic.test.ts
import { AnthropicAdapter } from "./anthropic";

test("AnthropicAdapter returns error for missing API key", async () => {
  const adapter = new AnthropicAdapter();
  const input = { prompt: "Hello, world!" };
  // Unset env for test
  const oldKey = Bun.env.ANTHROPIC_API_KEY;
  // @ts-ignore
  Bun.env.ANTHROPIC_API_KEY = undefined;
  await expect(adapter.execute(input)).rejects.toThrow(
    "Missing ANTHROPIC_API_KEY",
  );
  // Restore
  // @ts-ignore
  Bun.env.ANTHROPIC_API_KEY = oldKey;
});

test("AnthropicAdapter returns error for bad model", async () => {
  const adapter = new AnthropicAdapter();
  const input = { prompt: "Hello, world!", model: "claude-3-opus-20240229" };
  if (!Bun.env.ANTHROPIC_API_KEY) {
    console.warn("Skipping: ANTHROPIC_API_KEY not set");
    return;
  }
  await expect(adapter.execute(input)).rejects.toThrow(/Anthropic API error/);
});
