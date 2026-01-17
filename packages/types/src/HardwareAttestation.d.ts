export interface HardwareAttestation {
    hash: string;
    signature: string;
    keyId: string;
    hardware: "TPM" | "NITRO" | "HSM";
    measuredBoot?: string;
}
export declare function nitroSign(hash: string): HardwareAttestation;
