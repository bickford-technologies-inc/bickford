import crypto from "crypto";
import { Envelope } from "./envelope";

export interface MaxArtifact {
  hash: string;
  mode: "MAX";
  invariantsSatisfied: true;
  timestamp: number;
}

export function materializeMaxArtifact(): MaxArtifact {
  if (Envelope.mode !== "MAX") {
    throw new Error("MAX artifact requested outside MAX mode");
  }

  const payload = JSON.stringify({
    mode: Envelope.mode,
    since: Envelope.since,
  });

  return {
    hash: crypto.createHash("sha256").update(payload).digest("hex"),
    mode: "MAX",
    invariantsSatisfied: true,
    timestamp: Date.now(),
  };
}
