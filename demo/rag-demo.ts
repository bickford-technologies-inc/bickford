#!/usr/bin/env bun

/**
 * RAG Demo: Compliance + Intelligence in Action
 *
 * Demonstrates:
 * 1. First query: No history (baseline performance)
 * 2. Second query: Uses history from first (improved)
 * 3. Third query: Synthesizes multiple past interactions (compound)
 */

import { MemoryLedger } from './memory-ledger';
import { RAGAnthropicClient } from './rag-anthropic-client';

console.log('═══════════════════════════════════════════════════════════');
console.log('  RAG Demo: Memory-Augmented AI');
console.log('  Watch AI improve through institutional memory');
console.log('═══════════════════════════════════════════════════════════\n');

// Initialize
const memoryLedger = new MemoryLedger('./demo-memory.db');
const client = new RAGAnthropicClient({
  apiKey: Bun.env.ANTHROPIC_API_KEY || 'test-key',
  canon: {
    allowedModels: ['claude-sonnet-4-5-20250929'],
    maxTokensPerRequest: 2048,
    constitutionalConstraints: {
      noHarmfulContent: true,
      noPersonalData: true,
    },
  },
  memoryLedger,
  rag: {
    enabled: true,
    maxHistoryItems: 5,
    minSimilarity: 0.7,
  },
});

async function demo() {
  console.log('Demo Configuration:');
  console.log('  Database: ./demo-memory.db');
  console.log('  RAG: Enabled');
  console.log('  Max History: 5 items');
  console.log('  Min Similarity: 0.7');
  console.log('\n');

  // Query 1: Baseline (no history)
  console.log('─────────────────────────────────────────────────────────');
  console.log('Query 1: What is Constitutional AI?');
  console.log('Expected: No RAG context (first query)\n');

  try {
    const result1 = await client.complete({
      messages: [
        { role: 'user', content: 'What is Constitutional AI?' },
      ],
      maxTokens: 500,
    });

    console.log('✓ Success');
    console.log(`  RAG Context: ${result1.ragContext?.length || 0} matches`);
    console.log(`  Response: ${result1.content[0]?.text.slice(0, 150)}...`);
    console.log('');
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Query 2: Related (should find Query 1)
  console.log('─────────────────────────────────────────────────────────');
  console.log('Query 2: How does Constitutional AI improve safety?');
  console.log('Expected: 1 RAG match (Query 1 about Constitutional AI)\n');

  try {
    const result2 = await client.complete({
      messages: [
        { role: 'user', content: 'How does Constitutional AI improve safety?' },
      ],
      maxTokens: 500,
    });

    console.log('✓ Success');
    console.log(`  RAG Context: ${result2.ragContext?.length || 0} matches`);
    if (result2.ragContext && result2.ragContext.length > 0) {
      console.log(`  Retrieved: "${result2.ragContext[0].payload.query}"`);
    }
    console.log(`  Response: ${result2.content[0]?.text.slice(0, 150)}...`);
    console.log('');
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Query 3: Synthesis (should find Queries 1 & 2)
  console.log('─────────────────────────────────────────────────────────');
  console.log('Query 3: What are enterprise use cases for Constitutional AI?');
  console.log('Expected: 2+ RAG matches (previous Constitutional AI queries)\n');

  try {
    const result3 = await client.complete({
      messages: [
        { role: 'user', content: 'What are enterprise use cases for Constitutional AI?' },
      ],
      maxTokens: 500,
    });

    console.log('✓ Success');
    console.log(`  RAG Context: ${result3.ragContext?.length || 0} matches`);
    if (result3.ragContext && result3.ragContext.length > 0) {
      result3.ragContext.forEach((ctx, i) => {
        console.log(`  Match ${i + 1}: "${ctx.payload.query.slice(0, 50)}..."`);
      });
    }
    console.log(`  Response: ${result3.content[0]?.text.slice(0, 150)}...`);
    console.log('');
  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
  }

  // Show analytics
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Memory Ledger Analytics');
  console.log('═══════════════════════════════════════════════════════════\n');

  const analytics = client.getAnalytics();
  console.log(`Total Entries: ${analytics.totalEntries}`);
  console.log(`Success Rate: ${(analytics.successRate * 100).toFixed(1)}%`);
  console.log(`Avg Quality: ${analytics.avgQualityScore.toFixed(2)}`);
  console.log('');

  console.log('Top Categories:');
  analytics.topCategories.forEach(cat => {
    console.log(`  ${cat.category}: ${cat.count} entries`);
  });
  console.log('');

  console.log('Topic Coverage:');
  analytics.topicCoverage.forEach(topic => {
    console.log(`  ${topic.topic}: ${topic.count} interactions (quality: ${topic.avgQuality.toFixed(2)})`);
  });
  console.log('');

  // Recall metrics
  const recallMetrics = client.getRecallMetrics();
  console.log('Recall Improvement:');
  console.log(`  Total Interactions: ${recallMetrics.totalInteractions}`);
  console.log(`  Estimated Improvement: ${recallMetrics.estimatedImprovement}`);
  console.log('');

  // Ledger integrity
  console.log('Ledger Integrity:');
  const integrity = memoryLedger.verifyIntegrity();
  console.log(`  Hash Chain: ${integrity.valid ? '✓ Valid' : '❌ Broken'}`);
  console.log(`  Compliance Proof: ${integrity.valid ? 'Cryptographically verified' : 'Tampered'}`);
  console.log('');

  // Fine-tuning export
  console.log('Fine-Tuning Dataset:');
  const dataset = client.exportForFineTuning({ minQualityScore: 0.7 });
  console.log(`  High-Quality Entries: ${dataset.length}`);
  console.log('  Ready for: Anthropic fine-tuning');
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Key Takeaways');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('✓ Compliance: Hash-chained ledger provides tamper-evident audit trail');
  console.log('✓ Intelligence: RAG retrieval improves responses with institutional memory');
  console.log('✓ Compound: Quality improves over time as knowledge accumulates');
  console.log('✓ Verifiable: Cryptographic proof of both governance AND learning');
  console.log('');

  console.log('Next Steps:');
  console.log('  1. Run with real Anthropic API key (export ANTHROPIC_API_KEY)');
  console.log('  2. Test with 50+ queries to see measurable improvement');
  console.log('  3. Compare performance with/without RAG');
  console.log('  4. Export dataset and fine-tune custom model');
  console.log('');
}

// Run demo
demo()
  .catch(console.error)
  .finally(() => {
    memoryLedger.close();
    console.log('Demo complete!\n');
  });
