-- Chat v2: Add thread replay and canon linkage
-- Migration: 20260112_add_chat_v2_replay

-- Create ChatThread table
CREATE TABLE "ChatThread" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReplayedAt" TIMESTAMP(3),
    CONSTRAINT "ChatThread_pkey" PRIMARY KEY ("id")
);

-- Create CanonEntry table
CREATE TABLE "CanonEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "provenance" JSONB,
    CONSTRAINT "CanonEntry_pkey" PRIMARY KEY ("id")
);

-- Add new fields to ChatMessage
ALTER TABLE "ChatMessage" ADD COLUMN "threadId" TEXT;
ALTER TABLE "ChatMessage" ADD COLUMN "canonEntryId" TEXT;

-- Add foreign key constraints
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_threadId_fkey" 
    FOREIGN KEY ("threadId") REFERENCES "ChatThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_canonEntryId_fkey" 
    FOREIGN KEY ("canonEntryId") REFERENCES "CanonEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "ChatMessage_threadId_idx" ON "ChatMessage"("threadId");
CREATE INDEX "ChatMessage_canonEntryId_idx" ON "ChatMessage"("canonEntryId");
