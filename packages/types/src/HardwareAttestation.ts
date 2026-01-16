export interface HardwareAttestation {
  hash: string;
  signature: string;
  keyId: string;
  hardware: "TPM" | "NITRO" | "HSM";
  measuredBoot?: string;
}

// Nitro example (adapter-side only)
import { execSync } from "child_process";

export function nitroSign(hash: string): HardwareAttestation {
  const signature = execSync(`nitro-cli sign --message ${hash}`)
    .toString()
    .trim();

  return {
    hash,
    signature,
    keyId: "nitro-enclave-key",
    hardware: "NITRO",
  };
}
