import React from 'react'

// --- Authoritative Types ---
export type ExecutionApprovalCardProps = {
  decisionId: string
  admissible: boolean
  approvalMode: 'human' | 'optr' | 'blocked'
  approved: boolean
  approver?: string
  timestamp: string
  nextAction:
    | 'AWAITING_APPROVAL'
    | 'AUTO_EXECUTION_QUEUED'
    | 'EXECUTION_BLOCKED'
}

// --- Main Component ---
export function ExecutionApprovalCard({
  decisionId,
  admissible,
  approvalMode,
  approved,
  approver,
  timestamp,
  nextAction,
}: ExecutionApprovalCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-sm text-neutral-100 shadow">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-50">
            Execution Approval
          </h3>
          <p className="text-xs text-neutral-400">
            Authority checkpoint · No execution yet
          </p>
        </div>
        <ApprovalBadge admissible={admissible} approved={approved} mode={approvalMode} />
      </div>

      {/* Decision Metadata */}
      <Section title="Decision Record">
        <KeyValue label="Decision ID" value={decisionId} mono />
        <KeyValue label="Timestamp" value={timestamp} />
        <KeyValue label="Approval Mode" value={approvalMode.toUpperCase()} />
        {approver && <KeyValue label="Approver" value={approver} />}
      </Section>

      {/* Approval State */}
      <Section title="Approval State">
        {approved ? (
          <p className="text-xs text-emerald-400">
            ✓ Execution has been explicitly approved.
          </p>
        ) : admissible ? (
          <p className="text-xs text-yellow-400">
            ⏳ Awaiting approval before execution may proceed.
          </p>
        ) : (
          <p className="text-xs text-red-400">
            ✕ Execution is blocked by canonical refusal.
          </p>
        )}
      </Section>

      {/* Next Action */}
      <Section title="Next Action">
        <NextActionBadge action={nextAction} />
      </Section>

      {/* Footer */}
      <div className="mt-4 border-t border-neutral-800 pt-3 text-xs text-neutral-500">
        No execution may occur unless this approval is recorded
        and persisted to the Decision Ledger.
      </div>
    </div>
  )
}

// --- Supporting Primitives ---
function ApprovalBadge({
  admissible,
  approved,
  mode,
}: {
  admissible: boolean
  approved: boolean
  mode: 'human' | 'optr' | 'blocked'
}) {
  if (!admissible || mode === 'blocked') {
    return (
      <span className="rounded-full bg-red-900/40 px-3 py-1 text-xs text-red-300">
        BLOCKED
      </span>
    )
  }
  if (approved) {
    return (
      <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-xs text-emerald-300">
        APPROVED
      </span>
    )
  }
  return (
    <span className="rounded-full bg-yellow-900/40 px-3 py-1 text-xs text-yellow-300">
      PENDING
    </span>
  )
}

function NextActionBadge({
  action,
}: {
  action:
    | 'AWAITING_APPROVAL'
    | 'AUTO_EXECUTION_QUEUED'
    | 'EXECUTION_BLOCKED'
}) {
  const map: Record<string, string> = {
    AWAITING_APPROVAL: 'Awaiting approval',
    AUTO_EXECUTION_QUEUED: 'Auto-execution queued',
    EXECUTION_BLOCKED: 'Execution blocked',
  }
  const color =
    action === 'AUTO_EXECUTION_QUEUED'
      ? 'emerald'
      : action === 'AWAITING_APPROVAL'
      ? 'yellow'
      : 'red'
  return (
    <span
      className={`rounded-full bg-${color}-900/40 px-3 py-1 text-xs text-${color}-300`}
    >
      {map[action]}
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
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-neutral-400">{label}</span>
      <span className={mono ? 'font-mono text-neutral-200' : 'text-neutral-200'}>
        {value}
      </span>
    </div>
  )
}
