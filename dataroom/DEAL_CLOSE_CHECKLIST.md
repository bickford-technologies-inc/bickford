# Deal Close Checklist — bickford Acquisition

**Document Type:** Transaction Execution Checklist  
**Timestamp:** 2025-12-20T17:55:00-05:00  
**Purpose:** Ensure complete, on-time closing with no surprises

---

## Overview

This checklist covers:
- Legal documentation and approvals
- Technical handoff and verification
- Operational integration preparation
- Financial/payment mechanics
- Post-closing obligations

**Timeline:** Assume 30-45 day diligence → 14 days documentation → 7 days closing mechanics

---

## Phase 1: Pre-Signing (Diligence Stage)

### Legal Diligence

- [ ] **Founder IP Assignment Executed**
  - Signed and notarized
  - All IP transferred to bickford entity (or directly to OpenAI if asset sale)
  - No residual rights retained by Founder
  - **Owner:** OpenAI Legal
  - **Due Date:** Before APA signing

- [ ] **IP Inventory Validated**
  - All source code repositories identified
  - All trademarks/domains cataloged
  - All documentation/specifications included
  - Patents (if any) disclosed
  - **Owner:** OpenAI Legal + Product Counsel
  - **Due Date:** Week 2 of diligence

- [ ] **OSS Audit Completed**
  - SBOM reviewed and accepted
  - No copyleft licenses (GPL, AGPL) found
  - All permissive licenses (MIT, Apache 2.0, BSD) compliant
  - Attribution requirements documented
  - **Owner:** OpenAI Security + Legal
  - **Due Date:** Week 2 of diligence

- [ ] **Trademark Clearance Confirmed**
  - USPTO search for "bickford" completed
  - No conflicting marks in Class 9/42
  - Intent-to-use application filed (if desired)
  - **Owner:** OpenAI Trademark Counsel
  - **Due Date:** Week 3 of diligence

- [ ] **No Third-Party Encumbrances**
  - No liens, security interests, or other encumbrances on assets
  - No prior employer claims to IP
  - No outstanding licensing obligations
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 2 of diligence

- [ ] **Liability Caps Agreed**
  - General indemnification cap: 1x Purchase Price (asset sale) or 1.5x-2x (stock sale)
  - Basket: $50K (tipping basket)
  - Survival periods: 18 months general reps, 5 years IP reps
  - Exceptions (no cap): Fraud, criminal conduct, IP ownership (capped at 2x PP)
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 4 of diligence

- [ ] **Earnout Metrics Finalized**
  - Tier 1 (Integration, 50%): Production deployment >1K sessions/day
  - Tier 2 (Adoption, 30%): 3+ enterprise pilots operational for 30 days
  - Tier 3 (Revenue, 20%): $5M ARR attributable to bickford features
  - Verification procedures defined
  - Dispute resolution mechanism agreed
  - **Owner:** OpenAI Legal + Finance + Product
  - **Due Date:** Week 4 of diligence

### Technical Diligence

- [ ] **Code Review Completed**
  - Security team reviewed source code
  - No critical or high-severity vulnerabilities found (or remediated)
  - Code quality meets OpenAI standards
  - **Owner:** OpenAI Security + Engineering
  - **Due Date:** Week 3 of diligence

- [ ] **SBOM Verified**
  - Independent verification of dependency inventory
  - No undisclosed dependencies with high-risk licenses
  - Dependency tree documented
  - **Owner:** OpenAI Security
  - **Due Date:** Week 2 of diligence

- [ ] **Build Reproducibility Confirmed**
  - Deterministic builds verified (same inputs → same outputs)
  - Build stamp validated (commit SHA, version, timestamp)
  - Evidence pack hashes match artifacts
  - **Owner:** OpenAI Engineering
  - **Due Date:** Week 3 of diligence

- [ ] **Integration Assessment Complete**
  - Tool invocation boundary identified
  - Agent orchestration integration plan reviewed
  - Performance overhead acceptable (<50ms per decision)
  - Rollout strategy defined (dev → dogfood → pilots → GA)
  - **Owner:** OpenAI Agent Platform Engineering
  - **Due Date:** Week 4 of diligence

- [ ] **Safety Review Complete**
  - Safety team reviewed invariants and promotion gates
  - Multi-agent non-interference proofs validated
  - Failure modes acceptable (false positives tunable, false negatives bounded)
  - **Owner:** OpenAI Safety Team
  - **Due Date:** Week 4 of diligence

### Business Diligence

- [ ] **Financial Due Diligence**
  - No outstanding debts or liabilities
  - No pending legal claims
  - Tax compliance verified
  - **Owner:** OpenAI Finance
  - **Due Date:** Week 2 of diligence

- [ ] **Customer/Revenue Verification** (if applicable)
  - Any existing customers/pilots identified
  - Revenue disclosed (if any)
  - Customer contracts reviewed
  - **Owner:** OpenAI Finance + Legal
  - **Due Date:** Week 2 of diligence
  - **Note:** bickford likely has zero customers (pre-revenue asset)

---

## Phase 2: Documentation (Signing Preparation)

### Asset Purchase Agreement (APA)

- [ ] **APA Drafted**
  - Based on OpenAI standard template + bickford-specific redlines
  - Includes all negotiated terms (price, earnout, reps/warranties, etc.)
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 5 (post-diligence)

- [ ] **Disclosure Schedules Prepared**
  - Schedule 1: Purchased Assets (complete list)
  - Schedule 2: Excluded Assets (if any)
  - Schedule 3: OSS Disclosure (SBOM + license details)
  - Schedule 4: Prior Agreements (contracts, if any)
  - Schedule 5: Employee/Contractor Assignments (founder IP assignment)
  - Schedule 6: Domains & Repos (complete list with transfer instructions)
  - **Owner:** Seller (Founder) with OpenAI Legal review
  - **Due Date:** Week 5

- [ ] **Reps & Warranties Finalized**
  - Knowledge-qualified (where appropriate)
  - SBOM accuracy representation included
  - No copyleft contamination representation included
  - No prior employer claims representation included
  - Safety posture representation (no known critical vulnerabilities)
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 5

- [ ] **Indemnification Terms Locked**
  - Caps, baskets, survival periods finalized
  - IP indemnification (5-year survival) confirmed
  - Third-party claim procedures defined
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 5

### Founder Consulting Agreement

- [ ] **Consulting Agreement Drafted**
  - 12-month term
  - Scope: 20 hrs/week first 6 months, 10 hrs/week thereafter
  - Deliverables: Architecture review, code walkthroughs, knowledge transfer, pilot support
  - Compensation option selected (cash stipend, equity, or earnout-linked)
  - **Owner:** OpenAI Legal + HR
  - **Due Date:** Week 5

- [ ] **Non-Compete Terms Finalized**
  - Duration: 24 months
  - Scope: Narrow (whole-system competition only)
  - Carve-outs: General AI employment, single-feature tools, open-source, teaching
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 5

- [ ] **Non-Solicitation Terms Finalized**
  - Duration: 24 months
  - Scope: OpenAI employees working on agent platform (not all employees)
  - Exception: General job postings/LinkedIn not "solicitation"
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 5

### Additional Agreements

- [ ] **IP Assignment Agreements**
  - Copyright assignment (all source code, documentation)
  - Trademark assignment ("bickford" mark + domain names)
  - Patent assignment (if any patents or patent applications exist)
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 5

- [ ] **Bill of Sale**
  - Lists all tangible assets (if any—likely none for software)
  - Confirms transfer of ownership at Closing
  - **Owner:** OpenAI Legal
  - **Due Date:** Week 5

- [ ] **Escrow Agreement** (if applicable)
  - Escrow amount: 10-15% of Purchase Price
  - Escrow term: 18-24 months
  - Release conditions defined
  - **Owner:** OpenAI Legal + Finance
  - **Due Date:** Week 5

### Internal Approvals

- [ ] **Board Approval** (if required)
  - Board resolution approving transaction
  - **Owner:** OpenAI Corp Dev + Legal
  - **Due Date:** Week 5

- [ ] **Budget Approval**
  - Purchase Price allocation approved by Finance
  - Integration budget approved (if separate from acquisition price)
  - **Owner:** OpenAI Finance
  - **Due Date:** Week 5

- [ ] **Exec Sponsor Sign-Off**
  - Agent Platform Leadership approves integration plan
  - Safety Team approves safety/invariant framework
  - **Owner:** OpenAI Product + Safety Leadership
  - **Due Date:** Week 5

---

## Phase 3: Signing

### Document Execution

- [ ] **APA Signed**
  - OpenAI authorized signatory executes
  - Seller (Founder) executes
  - Signed copies exchanged (DocuSign or wet signatures)
  - **Owner:** OpenAI Legal + Corp Dev
  - **Due Date:** Signing Date

- [ ] **Disclosure Schedules Attached**
  - All schedules attached to signed APA
  - Exhibits confirmed complete
  - **Owner:** OpenAI Legal
  - **Due Date:** Signing Date

- [ ] **Consulting Agreement Signed**
  - Founder signs consulting agreement
  - HR paperwork completed (W-9, contractor agreement, etc.)
  - **Owner:** OpenAI HR + Legal
  - **Due Date:** Signing Date

- [ ] **IP Assignments Signed**
  - All IP assignment agreements executed
  - Recordation documents prepared (for USPTO, if trademarks assigned)
  - **Owner:** OpenAI Legal
  - **Due Date:** Signing Date

### Closing Conditions Verified

- [ ] **Seller Closing Conditions Satisfied**
  - All Seller reps/warranties true and correct
  - No material adverse change (MAC) since signing
  - All Seller deliverables provided
  - **Owner:** OpenAI Legal
  - **Due Date:** Closing Date

- [ ] **Buyer Closing Conditions Satisfied**
  - Board approval obtained (if required)
  - HSR clearance obtained (if applicable—unlikely for $8-10M deal)
  - No material adverse effect identified post-signing
  - **Owner:** OpenAI Legal
  - **Due Date:** Closing Date

---

## Phase 4: Closing

### Financial Mechanics

- [ ] **Purchase Price Payment**
  - Base Cash Amount: $6.5M-$7M
  - Wire transfer to Seller's designated account
  - Wire instructions verified (call Seller to confirm, prevent fraud)
  - **Owner:** OpenAI Finance
  - **Due Date:** Closing Date (within 5 business days of Closing)

- [ ] **Escrow Funding** (if applicable)
  - Escrow amount deposited to escrow agent
  - Escrow agreement executed by all parties
  - **Owner:** OpenAI Finance + Legal
  - **Due Date:** Closing Date

- [ ] **Earnout Tracking Setup**
  - Milestone definitions documented in shared system
  - Verification procedures communicated to all stakeholders
  - Payment triggers configured in Finance systems
  - **Owner:** OpenAI Finance + Product
  - **Due Date:** Closing Date

### Asset Transfer

- [ ] **GitHub Repositories Transferred**
  - All repos transferred to OpenAI GitHub org
  - OR: Access granted to OpenAI (mirror created)
  - Commit history preserved
  - **Owner:** OpenAI Engineering + Founder
  - **Due Date:** Closing Date

- [ ] **Domain Names Transferred**
  - "bickford.ai" or similar domains transferred to OpenAI registrar account
  - DNS changes planned (to avoid downtime)
  - **Owner:** OpenAI IT + Founder
  - **Due Date:** Closing Date + 7 days

- [ ] **Documentation Transferred**
  - All specs, architecture docs, whitepapers provided
  - Stored in OpenAI internal wiki/docs system
  - **Owner:** OpenAI Product + Founder
  - **Due Date:** Closing Date

- [ ] **Build Artifacts Transferred**
  - Build scripts, CI/CD configurations transferred
  - Evidence packs and SBOMs archived
  - **Owner:** OpenAI Engineering + Founder
  - **Due Date:** Closing Date

### Legal Filings

- [ ] **Trademark Assignment Recorded** (if applicable)
  - USPTO assignment recordation filed
  - **Owner:** OpenAI Trademark Counsel
  - **Due Date:** Within 30 days of Closing

- [ ] **Corporate Records Updated**
  - OpenAI corporate records reflect asset acquisition
  - Purchase Price allocation recorded (for tax purposes)
  - **Owner:** OpenAI Legal + Finance
  - **Due Date:** Within 30 days of Closing

- [ ] **Tax Elections Filed** (if 338(h)(10) elected)
  - Form 8023 filed with IRS (joint election by Buyer and Seller)
  - **Owner:** OpenAI Tax + Seller's Tax Advisor
  - **Due Date:** Within 8.5 months of Closing

---

## Phase 5: Post-Closing Integration (Days 0-90)

### Technical Handoff (Days 0-30)

- [ ] **Architecture Review Session**
  - 5-day deep dive with Founder
  - Agent Platform Engineering attends
  - Covers: Decision tracking, OPTR, governance gates, session management, IP protection
  - **Owner:** OpenAI Engineering + Founder
  - **Due Date:** Within 30 days of Closing

- [ ] **Code Walkthroughs**
  - Detailed walkthroughs of each core component
  - Q&A on design decisions, edge cases, performance tuning
  - **Owner:** OpenAI Engineering + Founder
  - **Due Date:** Within 30 days of Closing

- [ ] **Test Plan Review**
  - Review existing test coverage
  - Identify gaps and add tests if needed (>80% line coverage goal)
  - **Owner:** OpenAI Engineering + Founder
  - **Due Date:** Within 30 days of Closing

- [ ] **Documentation Completion**
  - Any missing technical docs completed (reasonable scope, <40 hours)
  - API documentation finalized
  - **Owner:** Founder with OpenAI review
  - **Due Date:** Within 30 days of Closing

### Integration Setup (Days 0-60)

- [ ] **Internal Owner Assigned**
  - Product owner for bickford integration identified
  - Engineering lead for integration work assigned
  - **Owner:** OpenAI Product + Engineering Leadership
  - **Due Date:** Day 1 post-Closing

- [ ] **Integration Backlog Created**
  - User stories for integration work defined
  - Prioritized by Agent Platform team
  - **Owner:** OpenAI Product + Engineering
  - **Due Date:** Within 30 days of Closing

- [ ] **Dev Environment Setup**
  - bickford integrated into OpenAI dev environment
  - End-to-end smoke tests passing
  - **Owner:** OpenAI Engineering
  - **Due Date:** Within 45 days of Closing

- [ ] **Dogfooding Plan**
  - Internal use cases identified (OpenAI agents using bickford)
  - Metrics defined (decision volume, denial rate, false positives)
  - **Owner:** OpenAI Product
  - **Due Date:** Within 60 days of Closing

### Safety/Compliance (Days 0-60)

- [ ] **Safety Team Sign-Off**
  - Safety team reviews integrated system
  - Invariants validated in OpenAI environment
  - Sign-off on promotion gate logic
  - **Owner:** OpenAI Safety Team
  - **Due Date:** Within 60 days of Closing

- [ ] **Execution Boundary Documented**
  - Clear documentation of where bickford sits in agent stack
  - Integration points with tool execution, session management, audit systems
  - **Owner:** OpenAI Architecture + Engineering
  - **Due Date:** Within 60 days of Closing

- [ ] **Audit Trail Configuration**
  - Integration with OpenAI audit/logging systems
  - Retention policies defined (how long to keep decision records)
  - **Owner:** OpenAI Compliance + Engineering
  - **Due Date:** Within 60 days of Closing

### Customer Transition (Days 0-90, if applicable)

- [ ] **Existing Customers Notified** (if any)
  - Founder introduces OpenAI to existing customers/pilots
  - Transition plan communicated (service continuity, support model)
  - **Owner:** Founder + OpenAI Product
  - **Due Date:** Within 30 days of Closing
  - **Note:** Likely N/A for bickford (pre-revenue asset)

- [ ] **Contract Novation** (if applicable)
  - Customer contracts assigned to OpenAI (with customer consent)
  - OR: New contracts issued by OpenAI
  - **Owner:** OpenAI Legal + Sales
  - **Due Date:** Within 90 days of Closing
  - **Note:** Likely N/A for bickford

---

## Phase 6: Post-Closing Founder Obligations

### Consulting Engagement (Months 1-12)

- [ ] **30-Day Cadence Established**
  - Regular check-ins scheduled (weekly or bi-weekly)
  - Integration questions/issues addressed
  - **Owner:** OpenAI Product + Founder
  - **Due Date:** Ongoing for 12 months

- [ ] **Knowledge Transfer Milestones**
  - Month 1-3: Architecture review, code walkthroughs complete
  - Month 4-6: Integration support, pilot deployments supported
  - Month 7-9: Tuning support, optimization guidance
  - Month 10-12: Wrap-up, final documentation
  - **Owner:** Founder with OpenAI oversight
  - **Due Date:** Milestones tracked monthly

- [ ] **No Operational On-Call Burden**
  - Founder not responsible for 24/7 support
  - Consultative role only (available during business hours, reasonable notice)
  - **Owner:** OpenAI Product (manage expectations)
  - **Due Date:** Ongoing

- [ ] **Clean Exit Option Preserved**
  - If Founder wants to exit early (after 6-12 months), transition plan in place
  - No penalty for early exit if knowledge transfer complete
  - **Owner:** OpenAI Legal + Product
  - **Due Date:** Review at 6-month mark

---

## Phase 7: Earnout Verification

### Tier 1: Integration Milestone (Month 6)

- [ ] **Integration Verified**
  - bickford runtime integrated into OpenAI agent platform
  - Production deployment live
  - >1,000 agent sessions/day using bickford execution gates
  - **Owner:** OpenAI Product + Engineering
  - **Verification Date:** 6 months from Closing
  - **Payment:** 50% of earnout ($1M-$1.5M) within 30 days of verification

### Tier 2: Adoption Milestone (Month 9)

- [ ] **Adoption Verified**
  - 3+ enterprise pilots deployed using bickford governance features
  - Signed pilot agreements + 30-day operational stability confirmed
  - **Owner:** OpenAI Product + Sales
  - **Verification Date:** 9 months from Closing
  - **Payment:** 30% of earnout ($600K-$900K) within 30 days of verification

### Tier 3: Revenue Enablement (Month 15)

- [ ] **Revenue Verified**
  - OpenAI product feature leveraging bickford generates $5M ARR
  - Finance attestation of ARR attribution provided
  - **Owner:** OpenAI Finance + Product
  - **Verification Date:** 15 months from Closing
  - **Payment:** 20% of earnout ($400K-$600K) within 30 days of verification

---

## Risk Management

### Walk-Away Scenarios (Pre-Closing)

- [ ] **Security Showstopper Found**
  - Critical vulnerability discovered that cannot be remediated
  - AND would expose OpenAI to >$1M liability
  - AND cannot be mitigated through reasonable workarounds
  - **Action:** Terminate APA (invoke termination rights)

- [ ] **IP Ownership Defect Discovered**
  - Seller does not own >25% of Purchased Assets (by value)
  - Due to prior employer claims, third-party ownership, or OSS issues
  - **Action:** Renegotiate price or terminate

- [ ] **Material Adverse Effect (MAC)**
  - Significant event reduces value of Purchased Assets by >30%
  - Between signing and Closing
  - **Action:** Renegotiate price or terminate

### Post-Closing Risk Mitigation

- [ ] **Escrow for Indemnification Claims**
  - 10-15% of Purchase Price held in escrow for 18-24 months
  - Covers any breaches of reps/warranties discovered post-Closing
  - **Owner:** OpenAI Legal + Finance

- [ ] **Fallback Integration Options**
  - If full integration harder than expected:
    * Use bickford for audit trail only (passive monitoring)
    * Limit to high-stakes actions only (production deploys, financial transactions)
    * Open-source audit primitives (extract value even if full integration doesn't happen)
  - **Owner:** OpenAI Product + Engineering

---

## Success Metrics

### Integration Success (6 months post-Closing)

- [ ] **Production Deployment:** bickford live in agent platform
- [ ] **Decision Volume:** >1,000 agent sessions/day using bickford gates
- [ ] **False Positive Rate:** <5% (tuned over first 60 days)
- [ ] **Incident Prevention:** Zero severity-1 execution incidents attributable to bickford-gated workflows
- [ ] **Team Confidence:** Agent Platform and Safety teams signed off on production rollout

### Business Success (12 months post-Closing)

- [ ] **Autonomous Agent Expansion:** Safe autonomy enabled in 3+ regulated environments (finance, healthcare, government)
- [ ] **Revenue Impact:** $5M+ ARR attributable to bickford-enabled features
- [ ] **Competitive Positioning:** OpenAI positioned as "only platform with enforced execution governance"
- [ ] **Incident Avoidance:** >1 avoided severity-1 execution incident (deal pays for itself)

---

## Document Control

- **Version:** 1.0
- **Date:** 2025-12-20
- **Owner:** OpenAI Corp Dev + Legal
- **Status:** Execution Checklist (active use)
- **Next Review:** Weekly during transaction process

---

*This checklist is designed to be used in real-time during the bickford acquisition. Assign owners, set due dates, and track completion weekly.*
