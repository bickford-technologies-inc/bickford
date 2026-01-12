# Submission Checklist — DoD REPLACE_ME

Program: REPLACE_ME
POC: REPLACE_ME
Generated: 2025-12-31T04:50:42.266Z

## Pre-Submit (Automatable)
- [ ] Generate bid pack (`npm run bid:prep -- --config bid/bid.config.json`)
- [ ] Review `COMPLIANCE_MATRIX.md` for completeness
- [ ] Review `MANIFEST.json` and `MANIFEST.sha256` (integrity)
- [ ] Confirm `PROOF_TLA_OUTPUT.txt` and any test outputs are present
- [ ] Confirm no secrets are included (scan results)

## Submit (Human-in-the-loop)
- [ ] Login to the submission portal (often requires CAC/PKI/MFA)
- [ ] Upload the generated zip/tarball
- [ ] Complete reps/certs / attestations (legal responsibility)
- [ ] Final review and submit

## Post-Submit (Automatable)
- [ ] Archive the exact submitted artifact + hashes
- [ ] Record submission confirmation # in `bid_out/SUBMISSION_RECEIPT.txt`
