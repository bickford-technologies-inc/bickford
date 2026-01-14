/**
 * OPTR shared types
 * Authority: @bickford/types
 */
export interface AgentContext {
    agentId: string;
    tenantId: string;
    intentId: string;
    capabilities?: string[];
}
export interface InterferenceResult {
    allowed: boolean;
    reason?: string;
    displacedAgents?: string[];
}
