# DoD Bid Review + Submission Automation (Bid Pack Workflow)

**TIMESTAMP**: 2025-12-31T00:00:00-05:00

This repo includes an automated **bid-pack generator** that produces an immutable, integrity-verifiable submission artifact.

It is designed to get you as close to **"100% automation"** as is realistic for DoD/defense procurement.

---

## Reality Check: What Can and Cannot Be 100% Automated

### Fully automatable (end-to-end)
- Assemble a submission-ready artifact directory (`bid_out/`) from a curated allowlist
- Generate review scaffolding:
  - compliance matrix (fillable)
  - submission checklist (fillable)
  - bid pack README
- Generate integrity artifacts:
  - full manifest (`MANIFEST.json`)
  - reproducible hash list (`MANIFEST.sha256`)
- Verify integrity (`sha256sum -c ...`)
- Archive the exact artifact set (tarball + hash)

### Usually **not** fully automatable (by design)
- Portal login and final submission steps that require CAC/PKI/MFA
- Human attestations / reps & certs (legal responsibility)
- CAPTCHAs / human verification on some portals

**Practical definition of “100% automation” in DoD contexts:**
> Automate everything up to the point where a human must authenticate/attest, and then automatically capture evidence of what was submitted.

---

## Bid Pack Inputs

### 1) Config
Edit [bid/bid.config.json](../../bid/bid.config.json):
- `solicitationId`: set to the RFP/solicitation identifier
- `programName`: set to the program name
- `pointOfContact`: who owns submission

The `include` and `exclude` lists define exactly what is allowed into the bid pack.

### 2) Templates
Templates live in:
- [bid/templates](../../bid/templates)

They generate:
- `bid_out/COMPLIANCE_MATRIX.md`
- `bid_out/SUBMISSION_CHECKLIST.md`
- `bid_out/BIDPACK_README.md`

---

## One-Command Generation (Automated)

From repo root:

- Generate `bid_out/`:
  - `npm run bid:prep:out`

- Verify integrity:
  - `make bid-verify`

This yields a complete, reviewable directory with hashes.

---

## SAM.gov Connection (API)

This repo supports pulling solicitation/notice metadata from SAM.gov using the **Public API Key**.

- Set your key (do not commit it):
  - `export SAMGOV_API_KEY=...`

- Search opportunities (prints JSON):
  - `npm run sam:search -- --q "execution governance" --limit 5`

- Fetch a notice by noticeId (writes JSON):
  - `npm run sam:fetch:notice -- --noticeId <ID> --out bid_out/samgov/notice.json`

- Recommended (keeps integrity artifacts consistent): enrich `bid_out/` and update manifest/hashes:
  - `npm run bid:enrich:samgov -- --noticeId <ID> --out bid_out`

Notes:
- SAM.gov APIs can change; scripts keep `baseUrl` configurable via `--baseUrl` if needed.
- Final portal submission still requires CAC/PKI/MFA and human attestations.

---

## Recommended Review Workflow (Automated + Human)

### Step A — Generate + Verify (Automated)
- `npm run bid:prep:out`
- `make bid-verify`

### Step B — Bid Review (Human, but guided)
- Fill `bid_out/COMPLIANCE_MATRIX.md` with program-specific responses
- Confirm `bid_out/MANIFEST.json` matches what you intend to disclose

### Step C — Create Immutable Archive (Automated)
Create an immutable submission artifact (recommended):
- `tar -czf bid_pack.tar.gz -C bid_out .`
- `sha256sum bid_pack.tar.gz > bid_pack.tar.gz.sha256`

### Step D — Portal Submission (Human-in-the-loop)
- Login with CAC/PKI/MFA as required
- Upload `bid_pack.tar.gz` (or portal-specific format)
- Complete attestations / reps & certs
- Submit

### Step E — Evidence Capture (Automatable)
- Save confirmation details (submission ID, timestamp, portal receipt)
- Create `bid_out/SUBMISSION_RECEIPT.txt` with:
  - confirmation number
  - portal name
  - who submitted
  - time
  - hash of uploaded artifact

---

## Optional: Portal Automation Adapter (Last Mile)

If you want to minimize human time further, implement a **portal-specific adapter** that:
- pre-fills portal forms
- prepares upload metadata
- pauses at CAC/MFA/attestation
- resumes after human auth
- records confirmation into `bid_out/SUBMISSION_RECEIPT.txt`

This is intentionally not included by default because portals differ and the auth step is usually non-automatable.

---

## Operational Controls (Recommended)

- **No secrets policy**: never include `.env` or credentials in bid packs
- **Allowlist-only**: prefer `include` over broad globbing
- **Integrity checks**: always run `make bid-verify` before submission
- **Immutable artifacts**: archive the exact submitted tarball + sha for auditability

---

## Commands Summary

- Build everything (optional): `make build-all`
- Generate bid pack: `npm run bid:prep:out`
- Verify hashes: `make bid-verify`
- Archive: `tar -czf bid_pack.tar.gz -C bid_out . && sha256sum bid_pack.tar.gz > bid_pack.tar.gz.sha256`
