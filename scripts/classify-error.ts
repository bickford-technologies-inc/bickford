import { hasFix } from "./apply-fix";

export function classifyError(error) {
  // ...existing classification logic...
  const classification = error.classification;
  if (!hasFix(classification)) {
    throw new Error(
      `❌ New failure class "${classification}" detected with no registered fix.\nPromotion is blocked by canon.`
    );
  }
  return classification;
}
