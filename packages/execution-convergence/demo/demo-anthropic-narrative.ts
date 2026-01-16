// Anthropic diligence demo: "Execution Is Impossible Unless Authority, Constraints, and Structure Agree."
import { convergeWithLedger } from '../src/converge';
import { InMemoryLedger } from '../src/ledger';

const ledger = new InMemoryLedger();

function baseAgent(id: string, role: string) {
  return { id, role, provider: 'demo' };
}

const baseInput = {
  metadata: {
    timestamp: new Date().toISOString(),
    initiatedBy: 'human',
  },
};

const validStep = { id: 'step1', action: 'do' };

async function runDemo() {
  console.log('--- Anthropic Diligence Demo ---');

  // 1. Missing auditor → REFUSED
  let result = await convergeWithLedger({
    ...baseInput,
    mode: 'EXECUTION',
    agents: [baseAgent('a1', 'EXECUTION_AUTHORITY')],
    outputs: [{ agentId: 'a1', content: [validStep] }],
  }, ledger);
  console.log('No auditor:', result.status, result.refusalReason);

  // 2. Malformed plan → REFUSED
  result = await convergeWithLedger({
    ...baseInput,
    mode: 'EXECUTION',
    agents: [baseAgent('a1', 'EXECUTION_AUTHORITY'), baseAgent('a2', 'CONSTRAINT_AUDITOR')],
    outputs: [{ agentId: 'a1', content: [{}] }],
  }, ledger);
  console.log('Malformed plan:', result.status, result.refusalReason);

  // 3. Valid plan + auditor → LOCKED
  result = await convergeWithLedger({
    ...baseInput,
    mode: 'EXECUTION',
    agents: [baseAgent('a1', 'EXECUTION_AUTHORITY'), baseAgent('a2', 'CONSTRAINT_AUDITOR')],
    outputs: [{ agentId: 'a1', content: [validStep] }],
  }, ledger);
  console.log('Valid plan + auditor:', result.status, result.artifact);

  // Show ledger contents
  console.log('\n--- Ledger Contents ---');
  for (const entry of ledger.getAll()) {
    console.log(JSON.stringify(entry, null, 2));
  }
}

runDemo();
