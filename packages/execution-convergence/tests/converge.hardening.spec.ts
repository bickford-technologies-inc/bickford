// @ts-nocheck
import { converge } from '../src/converge';
import { RefusalError } from '../src/errors';
import { ConvergenceInput, ExecutableStep } from '../src/types';

describe('converge hardenings', () => {
  function baseAgent(id, role) {
    return { id, role, provider: 'test' };
  }

  const baseInput = {
    metadata: {
      timestamp: new Date().toISOString(),
      initiatedBy: 'human',
    },
  };

  const validStep = { id: 'step1', action: 'do' };

  it('REFUSED if not EXECUTION mode', () => {
    const result = converge({
      ...baseInput,
      mode: 'EXPLORATION',
      agents: [baseAgent('a1', 'EXECUTION_AUTHORITY')],
      outputs: [],
    });
    expect(result.status).toBe('REFUSED');
    expect(result.refusalReason?.code).toBe('INVALID_MODE');
  });

  it('REFUSED if no auditor', () => {
    const result = converge({
      ...baseInput,
      mode: 'EXECUTION',
      agents: [baseAgent('a1', 'EXECUTION_AUTHORITY')],
      outputs: [],
    });
    expect(result.status).toBe('REFUSED');
    expect(result.refusalReason?.code).toBe('NO_AUDITOR');
  });

  it('REFUSED if plan is not array', () => {
    const result = converge({
      ...baseInput,
      mode: 'EXECUTION',
      agents: [baseAgent('a1', 'EXECUTION_AUTHORITY'), baseAgent('a2', 'CONSTRAINT_AUDITOR')],
      outputs: [{ agentId: 'a1', content: null }],
    });
    expect(result.status).toBe('REFUSED');
    expect(result.refusalReason?.code).toBe('REFUSAL');
    expect(result.refusalReason?.message).toMatch(/non-empty array/);
  });

  it('REFUSED if plan step is malformed', () => {
    const result = converge({
      ...baseInput,
      mode: 'EXECUTION',
      agents: [baseAgent('a1', 'EXECUTION_AUTHORITY'), baseAgent('a2', 'CONSTRAINT_AUDITOR')],
      outputs: [{ agentId: 'a1', content: [{}] }],
    });
    expect(result.status).toBe('REFUSED');
    expect(result.refusalReason?.code).toBe('REFUSAL');
    expect(result.refusalReason?.message).toMatch(/invalid step structure/);
  });

  it('LOCKED if all invariants satisfied', () => {
    const result = converge({
      ...baseInput,
      mode: 'EXECUTION',
      agents: [baseAgent('a1', 'EXECUTION_AUTHORITY'), baseAgent('a2', 'CONSTRAINT_AUDITOR')],
      outputs: [{ agentId: 'a1', content: [validStep] }],
    });
    expect(result.status).toBe('LOCKED');
    expect(result.artifact?.executablePlan).toHaveLength(1);
  });
});
