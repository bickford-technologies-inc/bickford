// apps/web/components/RepairPlanCard.tsx

import React from 'react';

export type CanonViolation = {
  code: string;
  message: string;
};

export type RepairProposal = {
  diff: string; // Unified diff or similar
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  doesNotRemoveGuards: boolean;
  introducesNoNewExecutionPaths: boolean;
  passesDanglingExecScan: boolean;
};

export type RepairPlanCardProps = {
  failure: {
    failureClass: string;
    surface: string;
    missingRef: string;
  };
  proposal: RepairProposal;
  admissible: boolean;
  violations?: CanonViolation[];
};

export const RepairPlanCard: React.FC<RepairPlanCardProps> = ({
  failure,
  proposal,
  admissible,
  violations = [],
}) => {
  return (
    <div style={{ border: '2px solid #0070f3', borderRadius: 8, padding: 24, background: '#f9fafe', margin: '24px 0' }}>
      <h2 style={{ marginTop: 0 }}>🛠️ Repair Plan Proposal</h2>
      <section>
        <strong>Failure Class:</strong> <code>{failure.failureClass}</code><br />
        <strong>Surface:</strong> <code>{failure.surface}</code><br />
        <strong>Missing Reference:</strong> <code>{failure.missingRef}</code>
      </section>
      <hr />
      <section>
        <strong>Proposed Fix:</strong>
        <pre style={{ background: '#eef', padding: 12, borderRadius: 4, overflowX: 'auto' }}>{proposal.diff}</pre>
        <div><strong>Summary:</strong> {proposal.summary}</div>
        <div><strong>Risk Level:</strong> <span style={{ color: proposal.riskLevel === 'high' ? 'red' : proposal.riskLevel === 'medium' ? 'orange' : 'green' }}>{proposal.riskLevel.toUpperCase()}</span></div>
      </section>
      <hr />
      <section>
        <strong>Canon Checks:</strong>
        <ul>
          <li>Does not remove guards: {proposal.doesNotRemoveGuards ? '✅' : '❌'}</li>
          <li>Introduces no new execution paths: {proposal.introducesNoNewExecutionPaths ? '✅' : '❌'}</li>
          <li>Passes dangling exec scan: {proposal.passesDanglingExecScan ? '✅' : '❌'}</li>
        </ul>
      </section>
      {!admissible && violations.length > 0 && (
        <section style={{ background: '#fff3f3', border: '1px solid #f00', borderRadius: 4, padding: 12, marginTop: 16 }}>
          <h3 style={{ color: '#d00' }}>Canon Violations</h3>
          <ul>
            {violations.map((v, i) => (
              <li key={i}><strong>{v.code}:</strong> {v.message}</li>
            ))}
          </ul>
        </section>
      )}
      {admissible && (
        <section style={{ background: '#e6ffe6', border: '1px solid #0a0', borderRadius: 4, padding: 12, marginTop: 16 }}>
          <strong>✅ This fix is admissible and can be approved for execution.</strong>
        </section>
      )}
    </div>
  );
};

export default RepairPlanCard;
