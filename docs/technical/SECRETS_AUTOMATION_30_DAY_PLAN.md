# 30-Day Validation Plan: Automated API Key Creation & Lifecycle Management

## Purpose
Validate that Bickford can autonomously identify, provision, place, rotate, and revoke API keys across providers while preserving security boundaries and explicit human bootstrap steps. The plan prioritizes **deterministic execution**, **ledgered evidence**, **zero manual copy/paste** after initial identity bootstrap, and **continuous OPTR/TTV optimization** (shortest path to verified credential readiness).

## Success Criteria (Day 30)
- **Discovery**: A registry enumerates all required credentials for target services with status `MISSING`, `BOOTSTRAP_REQUIRED`, or `ACTIVE`.
- **Provisioning**: At least **two providers** support end-to-end key creation and placement without human intervention (post-bootstrap).
- **Placement**: Keys are injected into **GitHub Secrets** and **Vercel Environment Variables** with verification checks.
- **Rotation**: At least one provider demonstrates scheduled rotation (generate → place → cutover → revoke old key).
- **Auditability**: Every action writes a ledger event with timestamp, intent, and proof hash.
- **OPTR/TTV**: Median time from `SECRET_NEEDED` → `ACTIVE` is reduced week-over-week with evidence in the ledger.
- **Compounding**: Each OPTR cycle reuses prior decisions (policy, ranking, provider capabilities) and records a higher Decision Continuity Rate (DCR) week-over-week.

## Scope (30 Days)
**Included**
- Provider capability matrix (automatable vs. bootstrap vs. blocked).
- Secret discovery registry (missing/required keys per context).
- Automated provisioning for **GitHub** and **Vercel** placement targets.
- Automated provisioning for **one cloud provider** (Azure or AWS) as a proof point.
- Rotation automation for one provider.
- OPTR loop that prioritizes the highest-impact missing credential first.
- DCR tracking to verify compounding decision reuse across cycles.

**Excluded (Explicitly Out of Scope)**
- CAPTCHA or payment flow automation.
- Human identity verification steps (manual bootstrap only).
- UI polish beyond a minimal status view.

## Benchmark: Best-in-Class Capability & Performance
The plan benchmarks Bickford against established automation platforms to identify gaps and confirm minimum parity for secrets lifecycle management.

**Capability Benchmarks (Minimum Parity)**
- **Discovery**: Enumerate missing secrets across environments with deterministic diffs.
- **Placement**: Push secrets to GitHub Actions and Vercel with verification.
- **Rotation**: Policy-based rotation with overlap window and revocation.
- **Auditability**: Append-only ledger entries with timestamps and proof hashes.
- **Access Control**: Least-privilege scopes and immutable audit trails.

**Performance Benchmarks (Targets)**
- **Provisioning TTV**: < 15 minutes for a missing secret once bootstrap is complete.
- **Placement TTV**: < 2 minutes for GitHub/Vercel placement verification.
- **Rotation TTV**: < 30 minutes end-to-end with zero downtime.
- **Recovery TTV**: < 10 minutes from detection to verified recovery.

## Gap Identification & Remediation
The benchmark results drive concrete gap remediation tasks.

**Known Gaps to Validate in 30 Days**
- **Provider parity**: confirm which providers support automated key creation vs. placement-only.
- **Rotation safety**: verify overlap window behavior and revocation timing.
- **Drift detection accuracy**: reduce false positives in registry vs. deployed env comparisons.
- **Decision reuse**: verify DCR improvements and identify manual decision hotspots.

**Gap Closure Mechanism**
- Each gap is logged as a ledger entry with `GAP_FOUND` and `GAP_CLOSED` events.
- Gaps are prioritized via OPTR to minimize time-to-verified readiness.

## Day-by-Day Validation Plan

### Days 1–3: Requirements Lock + Inventory
**Goals**
- Define the canonical list of credentials by context (e.g., deploy, storage, audio, analytics).
- Establish the initial capability matrix per provider.
- Define the OPTR objective function for secrets (minimize time-to-verified readiness).
- Define DCR tracking fields for reuse vs. net-new decisions.

**Deliverables**
- `secrets/registry.json` (authoritative list of required keys + status).
- `secrets/providers.json` (capabilities: create/place/rotate/revoke).
- Ledger schema for secret events (e.g., `SECRET_NEEDED`, `SECRET_PROVISIONED`).
- `secrets/optr-policy.json` (ranking policy for the next best secret to provision).
- `secrets/dcr-metrics.json` (decision reuse baseline and tracking fields).

**Validation**
- Registry includes at least 10 keys with explicit owners and target environments.
- OPTR policy produces a stable ranking given identical inputs.
- DCR baseline is established with a repeatable calculation method.

### Days 4–7: Discovery Engine (MVP)
**Goals**
- Automatically detect missing secrets for the target context.
- Emit OPTR-ranked backlog for provisioning.
- Emit DCR snapshot for the cycle.

**Deliverables**
- `scripts/secret-discovery` runner that outputs missing/active/blocked keys.
- Ledger entries for discovery events.
- OPTR backlog output (`secrets/optr-backlog.json`).
- DCR snapshot for the discovery cycle (`secrets/dcr-snapshot.json`).

**Validation**
- Running discovery produces a stable diff with zero false positives across two runs.
- Backlog is sorted deterministically by OPTR priority.
- DCR snapshot aligns with decision logs in the ledger.

### Days 8–12: Placement Automation (GitHub + Vercel)
**Goals**
- Implement push of existing secrets into GitHub and Vercel.
- Verify time-to-availability once placement succeeds.
- Record OPTR cycle timing for placement decisions.

**Deliverables**
- `scripts/secret-place` that updates GitHub Actions secrets.
- `scripts/secret-place` that updates Vercel env vars.
- Verification step: fetch and confirm secret presence by name.
- Ledger entries for placement duration (start → verified).
- DCR attribution for placement-related decisions.

**Validation**
- Round-trip check succeeds in both GitHub and Vercel without manual edits.
- Placement duration is recorded for OPTR/TTV analysis.
- DCR attribution is consistent with ledger event counts.

### Days 13–18: Provider Provisioning (Azure or AWS)
**Goals**
- Programmatically create credentials for one provider once bootstrap is complete.
- Measure end-to-end time to readiness for OPTR baseline.
- Reuse provider capability decisions where possible.

**Deliverables**
- `providers/azure` or `providers/aws` agent.
- Documented bootstrap steps (one-time human identity).
- Automatic creation + placement flow.
- Ledger entries capturing total provisioning time.
- DCR attribution for provisioning decisions.

**Validation**
- End-to-end: create key → store → inject into GitHub & Vercel → verify.
- TTV baseline is established for future optimization.
- DCR indicates reuse of provider capability decisions.

### Days 19–23: Rotation Automation
**Goals**
- Implement scheduled key rotation for one provider.
- Maintain availability during rotation (no downtime).
- Reuse prior rotation policies where applicable.

**Deliverables**
- Rotation policy definition (TTL, overlap window, cutoff).
- Rotation runner (generate new, place, cutover, revoke old).
- Ledger events for rotation lifecycle.
- OPTR adjustment to deprioritize low-risk rotations.
- DCR attribution for rotation decisions.

**Validation**
- Rotation completes without downtime; old key is revoked.
- Rotation time is measured and recorded.
- DCR indicates reuse of rotation policy decisions.

### Days 24–27: Failure Recovery + Drift Detection
**Goals**
- Detect and resolve missing or revoked secrets automatically.
- Use OPTR to prioritize recovery that unblocks highest-value contexts.
- Prefer reuse of prior recovery playbooks.

**Deliverables**
- Drift detection: compare registry vs. deployed env.
- Recovery flow: re-provision or re-place as required.
- Ledger entries for recovery timing and outcomes.
- DCR attribution for recovery decisions.

**Validation**
- Simulated revocation triggers auto-recovery and ledger evidence.
- Recovery uses OPTR ranking to choose the next action.
- DCR indicates reuse of recovery playbooks when applicable.

### Days 28–30: Final Audit + Hand-off
**Goals**
- Validate outcomes against success criteria and capture evidence.
- Demonstrate OPTR improvements against baseline.
- Demonstrate DCR improvement vs. baseline.

**Deliverables**
- `docs/technical/SECRETS_AUTOMATION_30_DAY_REPORT.md` with results.
- Checklist of achieved items and remaining gaps.
- OPTR/TTV metrics summary (baseline vs. day 30).
- DCR metrics summary (baseline vs. day 30).

**Validation**
- Sign-off that key creation/placement/rotation has executed at least once in CI.
- Evidence that TTV improved from baseline.
- Evidence that DCR improved from baseline.

## Governance & Safety Requirements
- **No secret values in logs** (redaction enforced).
- **Ledger is append-only** with hash chaining.
- **Least-privilege scopes** for provider APIs.
- **Human bootstrap** steps are explicitly tracked as `BOOTSTRAP_REQUIRED`.
- **OPTR non-interference**: secret provisioning must not increase other contexts' TTV.
- **Compounding**: OPTR policy updates are appended, never overwritten, and remain explainable.

## KPIs
- Mean time to provision a missing secret.
- Rotation completion time.
- % of secrets fully automated.
- Number of manual touches per month (target: 0 after bootstrap).
- OPTR delta: median TTV improvement week-over-week.
- DCR delta: decision reuse rate improvement week-over-week.

## Immediate Next Step
Choose one provider for automated provisioning (Azure or AWS) and run the discovery engine to finalize the registry baseline.
