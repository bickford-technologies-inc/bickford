# Bickford Canon — Healthcare AI Governance

STATUS: PROPOSED
AUTHORITY: CANON WORKING GROUP
VERSION: 0.1.0

rules:
  - id: PHI_ACCESS_MINIMUM_NECESSARY
    confidence: 0.95
    status: enforced
    invariants:
      - "No patient data access without active_treatment context"
      - "No bulk export of patient records"
      - "All PHI access logged to append-only ledger"

  - id: DECISION_AUTHORITY_CLINICAL_ONLY
    confidence: 0.90
    status: enforced
    invariants:
      - "AI cannot diagnose without human review"
      - "Treatment recommendations require physician approval"
      - "Scope boundary: clinical_decision_support only"
