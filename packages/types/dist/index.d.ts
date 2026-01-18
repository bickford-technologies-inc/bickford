import "./optr";
import "./canon";
export * from "./optr";
export * from "./canon";
export * from "./HardwareAttestation";
export type DeniedDecisionPayload = {
    denied: true;
    ts: string;
    actionId: string;
    tenantId: string;
    reasonCodes: string[];
    message: string;
};
export {};
export * from "./ExecutionAdapter";
export * from "./ExecutionResult";
export type LedgerEntry = {
    id: string;
    threadId: string;
    payload: unknown;
    ts: number;
};
export type EdgeContext = {
    runtime: "edge" | "node";
};
