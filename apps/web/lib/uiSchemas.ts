import { z } from "zod";

export const decisionTraceSchema = z.object({
  hash: z.string().length(64),
  intent: z.string(),
  admissible: z.boolean(),
  policiesEvaluated: z.array(z.string()),
  violations: z.array(z.string()).optional(),
  proposedActions: z.array(z.string()),
  createdAt: z.string().datetime(),
});
