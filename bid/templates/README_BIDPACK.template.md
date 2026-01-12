# Bid Package — {{customer}} {{solicitationId}}

Generated: {{generatedAt}}

This directory is a **generated, immutable bid artifact**:
- `MANIFEST.json`: file inventory + hashes
- `MANIFEST.sha256`: sha256 list for integrity checking
- `COMPLIANCE_MATRIX.md`: response matrix (fill program-specific answers)
- `SUBMISSION_CHECKLIST.md`: submission workflow (includes human attestations)
- `BIDPACK_README.md`: this file (generated)

## Integrity
Verify:
- `sha256sum -c MANIFEST.sha256`

## Notes
This package is generated from the source repository using `scripts/bid/prepare-bid-pack.ts`.
