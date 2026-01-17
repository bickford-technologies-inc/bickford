export type ExecutionMode = "MAX" | "REDUCED";

export interface EnvelopeState {
  mode: ExecutionMode;
  since: number;
  reason?: string;
}

export const Envelope: EnvelopeState = {
  mode: "MAX",
  since: Date.now(),
};
