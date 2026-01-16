import { createIdGenerator } from "ai";

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
