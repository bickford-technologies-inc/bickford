-- Intent Diff Attestation Migration
-- Migration: 20260308_intent_diff_attestation
-- Timestamp: 2026-03-08T00:00:00Z
-- 
-- Adds Merkle diff attestation fields to Intent.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Intent' AND column_name = 'diff_merkle_root'
    ) THEN
        ALTER TABLE "Intent" ADD COLUMN "diff_merkle_root" TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Intent' AND column_name = 'diff_algorithm'
    ) THEN
        ALTER TABLE "Intent" ADD COLUMN "diff_algorithm" TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Intent' AND column_name = 'authority_signature'
    ) THEN
        ALTER TABLE "Intent" ADD COLUMN "authority_signature" TEXT;
    END IF;
END $$;
