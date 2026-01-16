import React from 'react'

// --- Type Definitions (authoritative) ---
export type RepairProposal = {
  summary: string
  diff: string
  filesTouched: string[]
  riskLevel: 'none' | 'low' | 'medium' | 'high'
}

export type CanonViolation = {
  code: string
  description: string
}

export type RepairPlanCardProps = {
  failure: {
    failureClass: string
    surface: string
    missingRef: string
  }
  proposal?: RepairProposal
  admissible: boolean
  violations?: CanonViolation[]
  autoApproved?: boolean
}

// --- Main Component ---
export function RepairPlanCard({
  failure,
  proposal,
  admissible,
  violations = [],
  autoApproved = false,
}: RepairPlanCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-sm text-neutral-100 shadow">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-50">
            Execution Repair Plan
          </h3>
          <p className="text-xs text-neutral-400">
            Rendered by AI · Enforced by Canon
          </p>
        </div>
        <StatusBadge admissible={admissible} autoApproved={autoApproved} />
      </div>

      {/* Failure Context */}
      <Section title="Failure Context">
        <KeyValue label="Class" value={failure.failureClass} />
        <KeyValue label="Surface" value={failure.surface} />
        <KeyValue label="Missing Reference" value={failure.missingRef} />
      </Section>

      {/* Proposal */}
      {proposal && (
        <Section title="Proposed Repair">
          <KeyValue label="Summary" value={proposal.summary} />
          <KeyValue
            label="Risk Level"
            value={proposal.riskLevel.toUpperCase()}
            highlight={proposal.riskLevel !== 'none'}
          />
          <KeyValue
            label="Files Touched"
            value={proposal.filesTouched.join(', ')}
          />
          <div className="mt-3">
            <label className="mb-1 block text-xs text-neutral-400">
              Unified Diff
            </label>
            <pre className="max-h-64 overflow-auto rounded-lg bg-black p-3 text-xs text-neutral-200">
              {proposal.diff}
            </pre>
          </div>
        </Section>
      )}

      {/* Canon Validation */}
      <Section title="Canonical Validation">
        {admissible ? (
          <p className="text-xs text-emerald-400">
            ✓ Proposal satisfies all execution authority invariants.
          </p>
        ) : (
          <>
            <p className="mb-2 text-xs text-red-400">
              ✕ Proposal violates canonical execution rules.
            </p>
            <ul className="space-y-1 text-xs text-red-300">
              {violations.map(v => (
                <li key={v.code}>
                  <strong>{v.code}</strong>: {v.description}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>

      {/* Footer */}
      <div className="mt-4 border-t border-neutral-800 pt-3 text-xs text-neutral-500">
        Execution will not proceed unless this plan is admissible.
        {autoApproved && (
          <span className="ml-1 text-emerald-400">
            Auto-approved by OPTR.
          </span>
        )}
      </div>
    </div>
  )
}

// --- Supporting UI Primitives ---
function StatusBadge({
  admissible,
  autoApproved,
}: {
  admissible: boolean
  autoApproved: boolean
}) {
  if (!admissible) {
    return (
      <span className="rounded-full bg-red-900/40 px-3 py-1 text-xs text-red-300">
        REFUSED
      </span>
    )
  }
  if (autoApproved) {
    return (
      <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-xs text-emerald-300">
        AUTO-APPROVED
      </span>
    )
  }
  return (
    <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-xs text-yellow-300">
      AWAITING APPROVAL
    </span>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function KeyValue({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className={highlight ? 'text-yellow-300' : 'text-neutral-200'}>
        {value}
      </span>
    </div>
  )
}
