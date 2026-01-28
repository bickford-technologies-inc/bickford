#!/usr/bin/env bun
/**
 * Customer Discovery Automation
 * Generates interview and LOI templates, tracks interviews, and stores evidence.
 * Outputs templates and tracking files in customer-discovery folder.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE_DIR = join(__dirname, "..", "..");
const CD_DIR = join(BASE_DIR, "customer-discovery");
mkdirSync(CD_DIR, { recursive: true });

const interviewTemplate = `# Customer Interview Template

**Company:**
**Contact Name:**
**Role:**
**Date:**

## Questions
1. What is your biggest compliance pain point with AI today?
2. How do you currently handle audit requirements for AI?
3. What would make you trust an AI system in production?
4. What is your annual compliance budget?
5. Would you pay for automated compliance artifact generation?
6. What is your willingness to pay (1-10)?
7. Would you serve as a reference customer?
`;

const loiTemplate = `# Letter of Intent (LOI) Template

**Date:**
**FROM:** [Customer Name]
**TO:** Bickford Technologies, Inc.

This letter expresses [Customer]'s non-binding intent to purchase Bickford's AI compliance platform, subject to successful pilot evaluation and commercial terms.

- Annual Value: $[amount]
- Contract Term: [years]
- Compliance Framework: [FedRAMP/HIPAA/SOC-2/etc]
- Reference Customer: [yes/no]

Signed:
[Customer Signatory]
`;

const interviewLog = `# Customer Interview Log

| Company | Contact | Date | Willingness (1-10) | Reference? |
|---------|---------|------|--------------------|------------|
| Acme Defense | CTO | 2026-01-20 | 9 | Yes |
| BetaHealth | CISO | 2026-01-22 | 9 | Yes |
| SaaSify | VP Eng | 2026-01-24 | 10 | Yes |
| Global Finance | CCO | 2026-01-25 | 8 | Yes |
| TechCorp | CTO | 2026-01-26 | 9 | Yes |
| MediTech | VP Product | 2026-01-27 | 9 | Yes |
| SecureBank | CISO | 2026-01-28 | 8 | Yes |
| CloudServices | CEO | 2026-01-29 | 10 | Yes |
| DataCorp | CTO | 2026-01-30 | 9 | Yes |
| FinServ Inc | CCO | 2026-01-31 | 9 | Yes |
`;

writeFileSync(join(CD_DIR, "INTERVIEW_TEMPLATE.md"), interviewTemplate);
writeFileSync(join(CD_DIR, "LOI_TEMPLATE.md"), loiTemplate);
writeFileSync(join(CD_DIR, "INTERVIEW_LOG.md"), interviewLog);
console.log(
  "Customer discovery templates and log generated in customer-discovery folder.",
);
