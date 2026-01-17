// Nitro example (adapter-side only)
import { execSync } from "child_process";
export function nitroSign(hash) {
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
