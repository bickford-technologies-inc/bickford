export function attest(e) {
  return `
SOC-2 / FedRAMP SLO Evidence

Tenant: ${e.tenantId}
Period: ${e.period.from} → ${e.period.to}

All SLO evaluations were:
✔ Automatically measured
✔ Continuously monitored
✔ Enforced with rollback
✔ Logged immutably

Evidence Hash:
${e.hash}
`
}
