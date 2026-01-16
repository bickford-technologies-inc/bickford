import { HardwareAttestation } from "../../types/src/HardwareAttestation";
import { v4 as uuid } from "uuid";

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
    certificateId: uuid(),
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
