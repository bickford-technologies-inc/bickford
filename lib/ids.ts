import { createIdGenerator } from "ai";

// For ephemeral UI/runtime events only. Never for trace/execution/audit identity.
export const generateUIMessageId = createIdGenerator({
  prefix: "ui",
  separator: "_",
});

export const generateToolCallId = createIdGenerator({
  prefix: "tool",
  separator: "_",
});

export const generateStepId = createIdGenerator({
  prefix: "step",
  separator: "_",
});
