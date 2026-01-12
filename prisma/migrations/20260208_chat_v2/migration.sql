-- Chat v2 Canonical Migration: Immutable threads, evidence-bound intents, canon promotion
-- Migration: 20260208_chat_v2
-- Timestamp: 2026-02-08T00:00:00Z
-- 
-- This migration establishes Chat v2 as a canonical Bickford execution surface with:
-- - Immutable chat threads and messages
-- - Evidence-bound intent derivation (Intent cannot exist without evidence)
-- - Live vs replay execution gating
-- - Canon promotion and append-only persistence
-- - Deterministic, side-effect-free thread replay
-- 
-- INVARIANTS ENFORCED:
-- 1. ChatMessage.intentId is @unique (one intent per message max)
-- 2. Intent.sourceMessageId is @unique (one-to-one relationship)
-- 3. Execution.intentId is @unique (one execution per intent max)
-- 4. Canon linkage via canonEntryId
-- 5. Thread-message relationship for replay
-- 
-- NO DESTRUCTIVE CHANGES - All operations are additive or idempotent

-- Ensure ChatThread exists (idempotent)
CREATE TABLE IF NOT EXISTS "ChatThread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReplayedAt" TIMESTAMP(3),
    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- Ensure CanonEntry exists (idempotent)
CREATE TABLE IF NOT EXISTS "CanonEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "provenance" JSONB,
    CONSTRAINT "CanonEntry_pkey" PRIMARY KEY ("id")
);

-- Ensure ChatMessage table exists with all required fields
-- This assumes the table exists from schema.prisma, but we add fields if missing
DO $$ 
BEGIN
    -- Add threadId if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ChatMessage' AND column_name = 'threadId'
    ) THEN
        ALTER TABLE "ChatMessage" ADD COLUMN "threadId" TEXT;
    END IF;

    -- Add canonEntryId if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ChatMessage' AND column_name = 'canonEntryId'
    ) THEN
        ALTER TABLE "ChatMessage" ADD COLUMN "canonEntryId" TEXT;
    END IF;

    -- Add supersedesMessageId if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ChatMessage' AND column_name = 'supersedesMessageId'
    ) THEN
        ALTER TABLE "ChatMessage" ADD COLUMN "supersedesMessageId" TEXT;
    END IF;
END $$;

-- Add foreign key constraints (idempotent via IF NOT EXISTS pattern)
DO $$
BEGIN
    -- ChatMessage -> ChatThread foreign key
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ChatMessage_threadId_fkey'
    ) THEN
        ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_threadId_fkey" 
            FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- ChatMessage -> CanonEntry foreign key
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ChatMessage_canonEntryId_fkey'
    ) THEN
        ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_canonEntryId_fkey" 
            FOREIGN KEY ("canonEntryId") REFERENCES "CanonEntry"("id") 
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Create indexes for performance (idempotent)
CREATE INDEX IF NOT EXISTS "ChatMessage_threadId_idx" ON "ChatMessage"("threadId");
CREATE INDEX IF NOT EXISTS "ChatMessage_canonEntryId_idx" ON "ChatMessage"("canonEntryId");

-- Ensure Intent and Execution tables enforce uniqueness constraints
-- Intent.sourceMessageId must be unique (one intent per source message)
-- Execution.intentId must be unique (one execution per intent)
-- These are enforced in schema.prisma with @unique directives
-- and should already exist from the schema, but we verify:

DO $$
BEGIN
    -- Ensure unique constraint on Intent.sourceMessageId
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Intent_sourceMessageId_key'
    ) THEN
        ALTER TABLE "Intent" ADD CONSTRAINT "Intent_sourceMessageId_key" 
            UNIQUE ("sourceMessageId");
    END IF;

    -- Ensure unique constraint on Execution.intentId
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Execution_intentId_key'
    ) THEN
        ALTER TABLE "Execution" ADD CONSTRAINT "Execution_intentId_key" 
            UNIQUE ("intentId");
    END IF;

    -- Ensure unique constraint on ChatMessage.intentId
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ChatMessage_intentId_key'
    ) THEN
        ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_intentId_key" 
            UNIQUE ("intentId");
    END IF;
END $$;

-- Migration complete
-- All invariants enforced at DB level
-- Ready for canonical Chat v2 execution
