#!/usr/bin/env bun
/**
 * Bickford + Anthropic Integration Demo
 * Shows governance layer design with mock data
 */

import crypto from 'crypto';

// Mock Anthropic API response (based on actual API structure)
const MOCK_ANTHROPIC_RESPONSE = {
  data: [
    {
      id: 'apikey_01234abcd',
      created_at: '2025-01-15T10:30:00Z',
      created_by: {
        id: 'user_xyz789',
        type: 'user',
      },
      name: 'Production API Key - Healthcare App',
      partial_key_hint: 'sk-ant-...xyz123',
      status: 'active',
      type: 'api_key',
      workspace_id: 'workspace_healthcare',
    },
    {
      id: 'apikey_56789efgh',
      created_at: '2025-01-20T14:15:00Z',
      created_by: {
        id: 'user_abc456',
        type: 'user',
      },
      name: 'Development API Key - Internal Tools',
      partial_key_hint: 'sk-ant-...abc789',
      status: 'active',
      type: 'api_key',
      workspace_id: 'workspace_internal',
    },
    {
      id: 'apikey_11111deprecated',
      created_at: '2024-12-01T08:00:00Z',
      created_by: {
        id: 'user_xyz789',
        type: 'user',
      },
      name: 'Old Integration Key',
      partial_key_hint: 'sk-ant-...old999',
      status: 'archived',
      type: 'api_key',
      workspace_id: 'workspace_healthcare',
    },
  ],
  first_id: 'apikey_01234abcd',
  has_more: false,
  last_id: 'apikey_11111deprecated',
};

interface LedgerEntry {
  timestamp: string;
  event_type: 'created' | 'used' | 'violated' | 'archived';
  previous_hash: string;
  current_hash: string;
  event_data: {
    actor_id?: string;
    operation?: string;
    violation_details?: string;
    api_request_hash?: string;
  };
}

interface BickfordAPIKeyCanon {
  anthropic_key_id: string;
  workspace_id: string;
  allowed_models: string[];
  max_tokens_per_request: number;
  allowed_ips?: string[];
  constitutional_constraints: {
    no_harmful_content: boolean;
    no_personal_data: boolean;
    require_audit_trail: boolean;
    custom_rules?: string[];
  };
  canon_hash: string;
  created_by_canon: string;
  immutable: boolean;
  ledger_entries: LedgerEntry[];
}

function hashCanon(constraints: any): string {
  const canonString = JSON.stringify(constraints, Object.keys(constraints).sort());
  return crypto.createHash('sha256').update(canonString).digest('hex');
}

function createLedgerEntry(
  eventType: LedgerEntry['event_type'],
  eventData: LedgerEntry['event_data'],
  previousHash: string = '0'.repeat(64)
): LedgerEntry {
  const entryData = {
    timestamp: new Date().toISOString(),
    event_type: eventType,
    event_data: eventData,
  };

  const currentHash = crypto
    .createHash('sha256')
    .update(previousHash + JSON.stringify(entryData))
    .digest('hex');

  return {
    timestamp: entryData.timestamp,
    event_type: eventType,
    previous_hash: previousHash,
    current_hash: currentHash,
    event_data: eventData,
  };
}

function generateCanonForKey(key: typeof MOCK_ANTHROPIC_RESPONSE.data[0]): BickfordAPIKeyCanon {
  // Different governance policies based on workspace
  const isHealthcare = key.workspace_id === 'workspace_healthcare';
  const isProduction = key.status === 'active' && key.name.includes('Production');

  const constraints = {
    allowed_models: isProduction 
      ? ['claude-opus-4-5']  // Production uses best model
      : ['claude-sonnet-4-5', 'claude-haiku-4-5'],  // Dev can use cheaper models
    max_tokens_per_request: isHealthcare ? 2048 : 4096,  // Healthcare has stricter limits
    allowed_ips: isHealthcare ? ['10.0.0.0/8'] : undefined,  // Healthcare requires VPN
    constitutional_constraints: {
      no_harmful_content: true,
      no_personal_data: isHealthcare,  // HIPAA compliance for healthcare
      require_audit_trail: isProduction,  // Production requires full audit
      custom_rules: isHealthcare 
        ? ['HIPAA_COMPLIANT', 'PHI_SCRUBBING_REQUIRED']
        : undefined,
    },
    immutable: isProduction,  // Production keys cannot change constraints
  };

  const canonHash = hashCanon(constraints);
  
  // Create ledger with multiple entries to show usage
  const ledgerEntries: LedgerEntry[] = [];
  
  // Entry 1: Key created
  const entry1 = createLedgerEntry('created', {
    actor_id: key.created_by.id,
    operation: 'key_provisioned',
  });
  ledgerEntries.push(entry1);

  // Entry 2: Key used (if active)
  if (key.status === 'active') {
    const entry2 = createLedgerEntry(
      'used',
      {
        actor_id: 'system',
        operation: 'claude_api_call',
        api_request_hash: crypto.randomBytes(32).toString('hex'),
      },
      entry1.current_hash
    );
    ledgerEntries.push(entry2);
  }

  // Entry 3: Violation detected (healthcare key only, for demo)
  if (isHealthcare && key.status === 'active') {
    const entry3 = createLedgerEntry(
      'violated',
      {
        actor_id: key.created_by.id,
        operation: 'attempted_phi_access_without_scrubbing',
        violation_details: 'Request attempted to process PHI without required scrubbing - BLOCKED',
      },
      ledgerEntries[ledgerEntries.length - 1].current_hash
    );
    ledgerEntries.push(entry3);
  }

  // Entry 4: Archived (if archived)
  if (key.status === 'archived') {
    const entry4 = createLedgerEntry(
      'archived',
      {
        actor_id: key.created_by.id,
        operation: 'key_deactivated',
      },
      ledgerEntries.length > 0 
        ? ledgerEntries[ledgerEntries.length - 1].current_hash 
        : '0'.repeat(64)
    );
    ledgerEntries.push(entry4);
  }

  return {
    anthropic_key_id: key.id,
    workspace_id: key.workspace_id,
    ...constraints,
    canon_hash: canonHash,
    created_by_canon: canonHash,
    ledger_entries: ledgerEntries,
  };
}

function verifyLedgerIntegrity(ledger: LedgerEntry[]): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  for (let i = 1; i < ledger.length; i++) {
    const prev = ledger[i - 1];
    const curr = ledger[i];

    if (curr.previous_hash !== prev.current_hash) {
      violations.push(
        `Entry ${i}: Invalid chain - expected ${prev.current_hash.substring(0, 8)}..., got ${curr.previous_hash.substring(0, 8)}...`
      );
    }

    const entryData = {
      timestamp: curr.timestamp,
      event_type: curr.event_type,
      event_data: curr.event_data,
    };
    const expectedHash = crypto
      .createHash('sha256')
      .update(curr.previous_hash + JSON.stringify(entryData))
      .digest('hex');

    if (curr.current_hash !== expectedHash) {
      violations.push(
        `Entry ${i}: Invalid hash - tampering detected`
      );
    }
  }

  return { valid: violations.length === 0, violations };
}

// ============================================================================
// DEMO EXECUTION
// ============================================================================
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Bickford + Anthropic Admin API Integration Demo');
console.log('═══════════════════════════════════════════════════════════════\n');

// Simulate Anthropic API call
console.log('Step 1: Calling Anthropic Admin API');
console.log('  GET /v1/organizations/api_keys\n');

console.log('Response from Anthropic:');
console.log(`  Total keys: ${MOCK_ANTHROPIC_RESPONSE.data.length}`);
console.log(`  Active: ${MOCK_ANTHROPIC_RESPONSE.data.filter(k => k.status === 'active').length}`);
console.log(`  Archived: ${MOCK_ANTHROPIC_RESPONSE.data.filter(k => k.status === 'archived').length}\n`);

MOCK_ANTHROPIC_RESPONSE.data.forEach((key, i) => {
  console.log(`  ${i + 1}. ${key.name}`);
  console.log(`     ID: ${key.id}`);
  console.log(`     Status: ${key.status}`);
  console.log(`     Workspace: ${key.workspace_id}\n`);
});

console.log('─────────────────────────────────────────────────────────────\n');

// Add Bickford governance layer
console.log('Step 2: Adding Bickford Governance Layer\n');

const bickfordCanons = MOCK_ANTHROPIC_RESPONSE.data.map(generateCanonForKey);

console.log('Generated Constitutional API Key Canons:\n');

bickfordCanons.forEach((canon, i) => {
  const key = MOCK_ANTHROPIC_RESPONSE.data[i];
  console.log(`  ${i + 1}. ${key.name}`);
  console.log(`     Canon Hash: ${canon.canon_hash.substring(0, 16)}...`);
  console.log(`     Allowed Models: ${canon.allowed_models.join(', ')}`);
  console.log(`     Max Tokens: ${canon.max_tokens_per_request}`);
  console.log(`     HIPAA Required: ${canon.constitutional_constraints.no_personal_data ? 'YES' : 'NO'}`);
  console.log(`     Immutable: ${canon.immutable ? 'YES (production)' : 'NO (dev)'}`);
  console.log(`     Ledger Entries: ${canon.ledger_entries.length}\n`);
});

console.log('─────────────────────────────────────────────────────────────\n');

// Verify ledger integrity
console.log('Step 3: Cryptographic Ledger Verification\n');

bickfordCanons.forEach((canon, i) => {
  const key = MOCK_ANTHROPIC_RESPONSE.data[i];
  const verification = verifyLedgerIntegrity(canon.ledger_entries);
  
  console.log(`  ${i + 1}. ${key.name}`);
  console.log(`     Ledger Status: ${verification.valid ? '✓ VALID' : '✗ INVALID'}`);
  
  if (!verification.valid) {
    verification.violations.forEach(v => console.log(`       - ${v}`));
  }
  
  // Show ledger chain
  console.log(`     Ledger Chain:`);
  canon.ledger_entries.forEach((entry, j) => {
    const hashPreview = entry.current_hash.substring(0, 8);
    const prevPreview = entry.previous_hash.substring(0, 8);
    console.log(`       ${j + 1}. ${entry.event_type.toUpperCase()}`);
    console.log(`          Hash: ${hashPreview}... ← ${prevPreview}...`);
    if (entry.event_data.violation_details) {
      console.log(`          ⚠️  ${entry.event_data.violation_details}`);
    }
  });
  console.log('');
});

console.log('─────────────────────────────────────────────────────────────\n');

// Generate compliance certificate
console.log('Step 4: Compliance Certificate Generation\n');

const certificateData = {
  generated_at: new Date().toISOString(),
  organization: 'Demo Healthcare Organization',
  total_api_keys: MOCK_ANTHROPIC_RESPONSE.data.length,
  active_keys: MOCK_ANTHROPIC_RESPONSE.data.filter(k => k.status === 'active').length,
  all_keys_governed: true,
  ledger_integrity: bickfordCanons.every(c => verifyLedgerIntegrity(c.ledger_entries).valid),
  hipaa_compliant_keys: bickfordCanons.filter(c => c.constitutional_constraints.no_personal_data).length,
  violations_detected: bickfordCanons.reduce((sum, c) => 
    sum + c.ledger_entries.filter(e => e.event_type === 'violated').length, 0
  ),
  violations_blocked: bickfordCanons.reduce((sum, c) => 
    sum + c.ledger_entries.filter(e => e.event_type === 'violated').length, 0
  ),
};

const certificateHash = crypto
  .createHash('sha256')
  .update(JSON.stringify(certificateData))
  .digest('hex');

console.log('Compliance Certificate:');
console.log(`  Generated: ${certificateData.generated_at}`);
console.log(`  Organization: ${certificateData.organization}`);
console.log(`  Total API Keys: ${certificateData.total_api_keys}`);
console.log(`  Active Keys: ${certificateData.active_keys}`);
console.log(`  All Keys Governed: ${certificateData.all_keys_governed ? 'YES ✓' : 'NO ✗'}`);
console.log(`  Ledger Integrity: ${certificateData.ledger_integrity ? 'VERIFIED ✓' : 'FAILED ✗'}`);
console.log(`  HIPAA-Compliant Keys: ${certificateData.hipaa_compliant_keys}`);
console.log(`  Violations Detected: ${certificateData.violations_detected}`);
console.log(`  Violations Blocked: ${certificateData.violations_blocked} (100% enforcement)`);
console.log(`  Certificate Hash: ${certificateHash}\n`);

console.log('─────────────────────────────────────────────────────────────\n');

// Write compliance certificate to file for audit
import { writeFileSync } from 'fs';
const certificatePath = 'artifacts/anthropic-compliance-certificate.json';
writeFileSync(certificatePath, JSON.stringify(certificateData, null, 2));
console.log(`Compliance certificate written to: ${certificatePath}`);

// Exit with error if ledger integrity fails
if (!certificateData.ledger_integrity) {
  console.error('ERROR: Ledger integrity failed.');
  process.exit(1);
}
