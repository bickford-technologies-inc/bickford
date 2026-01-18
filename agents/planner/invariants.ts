import { Plan } from "./types";

export function assertPlan(plan: Plan) {
  if (!plan.steps.length) {
    throw new Error("Plan must contain at least one step");
  }
}
