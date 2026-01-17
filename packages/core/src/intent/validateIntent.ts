import { ExecutionIntent } from "./Intent.schema";

export function validateIntent(intent: ExecutionIntent) {
  if (!intent?.developer || !intent?.user) {
    return {
      ok: false,
      reason: "Missing developer or user intent"
    };
  }

  if (!intent.user.goal || intent.user.goal.length < 3) {
    return {
      ok: false,
      reason: "User intent goal is invalid"
    };
  }

  return { ok: true };
}
