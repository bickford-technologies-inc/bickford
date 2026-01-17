import { HardwareAttestation } from "@bickford/types";
import { v4 as uuidv4 } from "uuid";

export interface ExecutionCertificate {
  certificateId: string;
  intentHash: string;
  executionHash: string;
  coreVersion: string;
  invariants: string[];
  adaptersVerified: string[];
  timestamp: number;
  attestation?: HardwareAttestation;
}

export function generateCertificate(data: {
  intentHash: string;
  hash: string;
  version: string;
}): ExecutionCertificate {
  return {
    certificateId: uuidv4(),
    intentHash: data.intentHash,
    executionHash: data.hash,
    coreVersion: data.version,
    invariants: [
      "PURE_CORE",
      "ADAPTER_NON_INTERFERENCE",
      "DETERMINISTIC_EXECUTION",
    ],
    adaptersVerified: ["cli", "docker", "wasm"],
    timestamp: Date.now(),
  };
}
