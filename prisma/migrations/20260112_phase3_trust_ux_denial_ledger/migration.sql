-- Phase 3: Trust UX - Denial Ledger
-- Migration: 20260112_phase3_trust_ux_denial_ledger
-- 
-- Implements:
-- - DenialReasonCode enum for stable taxonomy
-- - DeniedDecision model for denial persistence
-- - Indexes for efficient WhyNot queries
--
-- Guarantees after migration:
-- - No silent denials (all denials ledgered)
-- - Replayable WhyNot explanations
-- - Queryable denial history

-- Create DenialReasonCode enum
CREATE TYPE "DenialReasonCode" AS ENUM (
    'MISSING_CANON_PREREQS',
    'INVARIANT_VIOLATION',
    'NON_INTERFERENCE_VIOLATION',
    'AUTHORITY_BOUNDARY_FAIL',
    'RISK_BOUND_EXCEEDED',
    'COST_BOUND_EXCEEDED',
    'SUCCESS_PROB_TOO_LOW'
);

-- Create DeniedDecision table
CREATE TABLE "DeniedDecision" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ts" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "actionName" TEXT,
    "tenantId" TEXT NOT NULL,
    "goal" TEXT,
    "reasonCodes" "DenialReasonCode"[],
    "missingCanonIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "violatedInvariantIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredCanonRefs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "message" TEXT NOT NULL,
    "context" JSONB,
    "optrRunId" TEXT,

    CONSTRAINT "DeniedDecision_pkey" PRIMARY KEY ("id")
);

-- Create indexes for efficient queries
CREATE INDEX "DeniedDecision_actionId_idx" ON "DeniedDecision"("actionId");
CREATE INDEX "DeniedDecision_tenantId_idx" ON "DeniedDecision"("tenantId");
CREATE INDEX "DeniedDecision_createdAt_idx" ON "DeniedDecision"("createdAt");

-- Comments for documentation
COMMENT ON TABLE "DeniedDecision" IS 'Phase 3: Trust UX denial ledger. Every denial is persisted for replayable WhyNot explanations.';
COMMENT ON COLUMN "DeniedDecision"."reasonCodes" IS 'Stable taxonomy of denial reasons. Never add/remove codes without promotion gate.';
COMMENT ON COLUMN "DeniedDecision"."ts" IS 'ISO8601 timestamp from denial trace (may differ from createdAt for replays).';
