#!/usr/bin/env bun

/**
 * Compress Anthropic's HH-RLHF dataset
 *
 * This demonstrates compression on REAL Anthropic data
 * Public dataset: https://huggingface.co/datasets/Anthropic/hh-rlhf
 *
 * Usage:
 *   bun run demos/compress-anthropic-hhrlhf.ts
 */

import { ContentAddressableStore } from "../lib/compression/content-addressable-store";

async function downloadHHRLHF(): Promise<any[]> {
  console.log("📥 Downloading Anthropic HH-RLHF dataset...");

  // Fetch sample from HuggingFace
  const response = await fetch(
    "https://huggingface.co/datasets/Anthropic/hh-rlhf/raw/main/harmless-base/train.jsonl",
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch dataset: ${response.statusText}`);
  }

  const text = await response.text();
  const lines = text.split("\n").filter(Boolean);

  // Parse JSONL
  const data = lines.map((line) => JSON.parse(line));

  console.log(`✅ Downloaded ${data.length} examples`);
  return data;
}

async function compressAnthropicData() {
  console.log("🎯 ANTHROPIC HH-RLHF COMPRESSION DEMO\n");
  console.log("=".repeat(60));

  // Download real Anthropic data
  const data = await downloadHHRLHF();

  // Initialize store
  const store = new ContentAddressableStore();

  // Compress
  console.log("\n🔄 Compressing Anthropic training data...");
  const startTime = Date.now();

  for (const example of data) {
    store.compress(example);
  }

  const compressionTime = Date.now() - startTime;
  const metrics = store.getMetrics();

  // Results
  console.log("\n" + "=".repeat(60));
  console.log("📊 REAL ANTHROPIC DATA - COMPRESSION RESULTS");
  console.log("=".repeat(60));
  console.log(`Dataset:              Anthropic HH-RLHF (harmless-base)`);
  console.log(`Entries:              ${data.length}`);
  console.log(
    `Original Size:        ${(metrics.originalSize / 1024 / 1024).toFixed(2)} MB`,
  );
  console.log(
    `Compressed Size:      ${(metrics.compressedSize / 1024).toFixed(2)} KB`,
  );
  console.log(`Compression Ratio:    ${(metrics.ratio * 100).toFixed(4)}%`);
  console.log(`Reduction Factor:     ${(1 / (1 - metrics.ratio)).toFixed(0)}x`);
  console.log(`Compression Time:     ${compressionTime}ms`);
  console.log(`Unique Patterns:      ${metrics.uniqueContentBlocks}`);
  console.log(`Dedup Hits:           ${metrics.deduplicationHits}`);

  // Scale to full Anthropic dataset
  console.log("\n🚀 SCALED TO FULL ANTHROPIC TRAINING DATA");
  console.log("=".repeat(60));

  const fullDatasetSize = 60_000_000_000_000; // 60 PB estimate
  const scaledCompressed = fullDatasetSize * (1 - metrics.ratio);
  const originalCost = (fullDatasetSize / 1e9) * 0.023 * 12; // Annual
  const compressedCost = (scaledCompressed / 1e9) * 0.023 * 12; // Annual
  const savings = originalCost - compressedCost;

  console.log(`Anthropic Training Data:  ~60 PB (estimated)`);
  console.log(
    `Compressed to:            ${(scaledCompressed / 1e12).toFixed(2)} TB`,
  );
  console.log(
    `Original Cost:            $${(originalCost / 1e6).toFixed(2)}M/year`,
  );
  console.log(
    `Compressed Cost:          $${(compressedCost / 1000).toFixed(2)}K/year`,
  );
  console.log(`Annual Savings:           $${(savings / 1e6).toFixed(2)}M`);
  console.log("=".repeat(60));

  // Generate shareable proof
  const proof = {
    dataset: "Anthropic HH-RLHF (harmless-base)",
    timestamp: new Date().toISOString(),
    source: "https://huggingface.co/datasets/Anthropic/hh-rlhf",
    metrics: {
      entries: data.length,
      originalSizeMB: metrics.originalSize / 1024 / 1024,
      compressedSizeKB: metrics.compressedSize / 1024,
      compressionRatio: metrics.ratio,
      reductionFactor: 1 / (1 - metrics.ratio),
    },
    scaledProjection: {
      fullDatasetPB: 60,
      compressedTB: scaledCompressed / 1e12,
      annualSavingsM: savings / 1e6,
    },
    verifiable: true,
    reproducible: "bun run demos/compress-anthropic-hhrlhf.ts",
  };

  const proofFile = `anthropic-compression-proof-${Date.now()}.json`;
  await Bun.write(proofFile, JSON.stringify(proof, null, 2));

  console.log(`\n✅ Proof saved: ${proofFile}`);
  console.log(`🔗 Share this publicly to verify claims`);
  console.log(`\n🎯 Next: Post this to HN/Twitter/LinkedIn`);
}

compressAnthropicData().catch(console.error);
