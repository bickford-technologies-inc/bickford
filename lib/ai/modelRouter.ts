// Canon-safe model router abstraction
// Usage: selectModel('chat')

export function selectModel(
  useCase: "chat" | "reasoning" | "tools" | "embeddings" | "images"
) {
  switch (useCase) {
    case "chat":
      return "gpt-4o-mini";
    case "reasoning":
      return "gpt-4o";
    case "tools":
      return "gpt-4o";
    case "embeddings":
      return "text-embedding-3-large";
    case "images":
      return "dall-e-3";
    default:
      throw new Error("Unknown AI use case");
  }
}
