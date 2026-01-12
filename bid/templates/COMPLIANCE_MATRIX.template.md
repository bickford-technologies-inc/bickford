# Compliance Matrix — {{customer}} {{solicitationId}}

Generated: {{generatedAt}}

This is a **bid-response aid**. It does **not** assert compliance by default.
Fill the "Response" column with your verified, program-specific answers.

| Requirement Area | Requirement (RFP section) | Response (fill) | Evidence (file/link) |
|---|---|---|---|
| Execution authority | Describe the execution choke point and how side effects are gated |  | docs/technical/ARCHITECTURE.md |
| Auditability | Explain audit trails, replay, and denial traces |  | docs/technical/ARCHITECTURE.md |
| Formal methods | Describe formal invariants / model checking approach |  | PROOF_TLA_OUTPUT.txt |
| Supply chain | Provide artifact integrity (hashes), SBOM if required |  | MANIFEST.sha256 |
| Deployment | Describe on-prem / air-gapped deployment options |  | DEPLOY_AUTOMATION.md |
| Security posture | AuthN/Z, logging, retention, secrets handling |  | docs/technical/ARCHITECTURE.md |
| Testing | Evidence of test strategy / outputs |  | PROOF_TEST_OUTPUT.txt |
