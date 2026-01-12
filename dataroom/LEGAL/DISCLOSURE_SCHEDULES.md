# DISCLOSURE SCHEDULE INDEX

**DOCUMENT:** Disclosure Schedule Framework  
**ENTITY:** bickford  
**TIMESTAMP:** 2025-12-20T12:09:00-05:00 (America/New_York)  
**STATUS:** Transaction organization tool — prevents last-minute chaos

---

## PURPOSE

Disclosure schedules are **attachments to the Asset Purchase Agreement** that:
- Provide exceptions to representations and warranties
- Disclose known issues that would otherwise constitute breaches
- Organize diligence materials in transaction-standard format
- Prevent post-Closing disputes

**Key Principle:** If you disclose it in a schedule, you can't be liable for breach of rep.

---

## STANDARD DISCLOSURE SCHEDULE STRUCTURE

### Schedule 1 — PURCHASED ASSETS

**Purpose:** Comprehensive list of assets being sold

**Contents:**
1. **Intellectual Property Assets**
   - Software source code repositories (GitHub URLs)
   - Documentation and specifications
   - Algorithms and mathematical formulas
   - Trade secrets and know-how

2. **Branding Assets**
   - Trademark: "bickford"
   - Domain names: [list all owned domains]
   - Social media handles: [if any]

3. **Tangible Assets**
   - Demo environments and test systems
   - Data room materials
   - Customer/prospect lists: [if any]

4. **Contracts and Agreements**
   - Open-source licenses: See Schedule 3
   - Service agreements: [if any]
   - Partnership agreements: [if any]

**Example Entry:**
```
1.1 Software Repositories
    - https://github.com/bickfordd-bit/session-completion-runtime
    - All branches, commits, tags, and historical versions
    - All related documentation (README, ARCHITECTURE, QUICKSTART, etc.)
```

---

### Schedule 2 — EXCLUDED ASSETS

**Purpose:** Assets retained by seller (not being sold)

**Typical Contents:**
- Personal property unrelated to Bickford
- Cash and cash equivalents
- Seller's personal computers and equipment
- Unrelated intellectual property
- Tax refunds for pre-Closing periods

**Example Entry:**
```
2.1 Personal Development Tools
    - Seller's personal laptop and development workstations
    - Seller's personal software licenses (JetBrains, etc.)
    - Seller's personal cloud storage accounts

2.2 Unrelated IP
    - Any inventions or works created by Seller unrelated to decision 
      tracking, OPTR, governance, or session management
```

---

### Schedule 3 — OPEN SOURCE SOFTWARE DISCLOSURE

**Purpose:** Complete list of OSS components and licenses

**Contents:** (Cross-reference `dataroom/SECURITY/SBOM.md`)

**Structure:**
| Component | License | Version | Usage | Copyleft Risk |
|-----------|---------|---------|-------|---------------|
| Node.js crypto | Node.js License (MIT-like) | Built-in | Hashing | LOW |
| Node.js fs/promises | Node.js License | Built-in | Persistence | LOW |

**Copyleft Analysis:**
- **MIT/Apache/BSD:** Permissive; no disclosure obligations ✅
- **GPL/AGPL:** Copyleft; requires disclosure ⚠️ (NONE IN BICKFORD)
- **LGPL:** Limited copyleft; manageable ⚠️ (NONE IN BICKFORD)

**Conclusion Statement:**
```
All open-source software used in the Purchased Assets is subject to 
permissive licenses (MIT, Apache 2.0, or BSD-style) that do not impose 
disclosure or licensing obligations on derivative works. No copyleft 
licenses (GPL, AGPL, LGPL) are present.
```

---

### Schedule 4 — PRIOR AGREEMENTS DISCLOSURE

**Purpose:** Disclose any agreements that could affect transaction or assets

**Typical Contents:**
- Employment agreements with IP assignment clauses
- Consulting agreements with prior clients
- NDAs with potential acquirers or partners
- Confidentiality agreements

**Example Entry:**
```
4.1 Prior Employment

Seller was employed by [Company Name] from [Date] to [Date]. 
Employment agreement included standard IP assignment clause for 
work performed during employment.

Seller represents that no Bickford-related work was performed 
during this employment, and [Company Name] has no claim to the 
Purchased Assets.

Supporting Documentation: Copy of employment agreement and resignation 
letter attached as Exhibit 4.1-A.

---

4.2 Non-Disclosure Agreements

Seller entered into mutual NDAs with the following parties during 
preliminary acquisition discussions:

- [Company A] - executed [Date]
- [Company B] - executed [Date]

These NDAs do not restrict Seller's ability to sell the Purchased 
Assets to Buyer. Copies attached as Exhibit 4.2-A and 4.2-B.
```

---

### Schedule 5 — EMPLOYEE/CONTRACTOR IP ASSIGNMENTS

**Purpose:** Prove all contributors assigned rights to seller

**Contents:**
- List of all individuals who contributed to Purchased Assets
- IP assignment agreements for each contributor
- Confirmation that seller owns all rights

**Example Entry:**
```
5.1 Individual Contributors

The following individuals contributed to the Purchased Assets:

Name: Derek Bickford
Role: Founder / Sole Developer
Contribution: All software, documentation, and architecture
IP Assignment: Founder IP Assignment executed [Date] (see LEGAL/FOUNDER_IP_ASSIGNMENT.md)

[If contractors or employees exist, list each with their agreement]

---

5.2 Confirmation

Seller confirms that:
- All contributors have assigned their rights to Seller
- No work-for-hire agreements with third parties exist
- Seller is sole owner of all Purchased Assets
```

---

### Schedule 6 — DOMAINS & REPOSITORIES

**Purpose:** Complete inventory of digital assets

**Contents:**

**6.1 Domain Names**
| Domain | Registrar | Expiration Date | Status |
|--------|-----------|----------------|--------|
| [if owned] | [registrar] | [date] | Included in sale |

**6.2 Code Repositories**
| Repository | Platform | Visibility | Branches |
|------------|----------|------------|----------|
| session-completion-runtime | GitHub | Public | main, feature/* |

**6.3 Social Media / Online Presence**
- Twitter: [if exists]
- LinkedIn: [if exists]
- Medium: [if exists]

**Transfer Process:**
- Domains: Transfer authorization codes provided at Closing
- GitHub: Repository transferred to Buyer's organization
- Social Media: Account access credentials transferred (or buyer creates new)

---

### Schedule 7 — CLAIMS vs EVIDENCE CLASSIFICATION

**Purpose:** Map representations to verifiable evidence

**Contents:** (Cross-reference `dataroom/CLAIMS_EVIDENCE_MAP.md`)

**Structure:**
| Claim | Evidence | Location | Verification Method |
|-------|----------|----------|---------------------|
| Immutable decision tracking | Source code | src/core/DecisionTracker.js | Code inspection, hash verification |
| Zero external dependencies | package.json | Repository root | File inspection |
| Cryptographic integrity | SHA-256 implementation | DecisionTracker.js lines 45-52 | Code review |

**Purpose in Transaction:**
Demonstrates transparency and provides buyer with clear audit trail from claims to code.

---

### Schedule 8 — LITIGATION & DISPUTES

**Purpose:** Disclose any legal proceedings or threatened claims

**Typical Contents:**
- Active litigation involving Purchased Assets
- Threatened claims or cease-and-desist letters
- Regulatory inquiries or investigations
- Patent or trademark disputes

**Example Entry (Clean):**
```
8.1 Litigation

Seller represents that:

(a) No litigation, arbitration, or administrative proceeding is pending 
or, to Seller's knowledge, threatened against Seller relating to the 
Purchased Assets.

(b) Seller has not received any cease-and-desist letters, infringement 
claims, or demands relating to the Purchased Assets.

(c) Seller is not aware of any facts that would reasonably be expected 
to give rise to litigation relating to the Purchased Assets.
```

---

### Schedule 9 — THIRD-PARTY CONSENTS

**Purpose:** Identify any consents required for transaction

**Typical Contents:**
- Customer consent requirements (if any)
- Partner approval requirements (if any)
- Licensor consents for transferred licenses
- Regulatory approvals

**Example Entry (Clean):**
```
9.1 Required Consents

Seller represents that no third-party consents, approvals, or waivers 
are required for:

(a) Execution of this Asset Purchase Agreement
(b) Transfer of the Purchased Assets to Buyer
(c) Buyer's use of the Purchased Assets post-Closing

Rationale: All Purchased Assets were developed independently by Seller 
without customer agreements, joint development arrangements, or licenses 
requiring consent for transfer.
```

---

### Schedule 10 — FINANCIAL INFORMATION

**Purpose:** Provide revenue, cost, and valuation data (if applicable)

**Contents:**
- Historical revenue from Purchased Assets (if any)
- Development costs and capitalized expenses
- Customer pipeline and prospects
- Valuation methodology

**Example Entry (Early Stage):**
```
10.1 Revenue History

The Purchased Assets have not generated revenue to date. Development 
was conducted as proof-of-concept without commercial offerings.

10.2 Development Costs

Estimated development costs (founder time): $[amount]
Estimated development costs (infrastructure): $[amount if any]

10.3 Customer Pipeline

No active customer contracts or commitments exist. Preliminary 
discussions with [if any] have occurred but no binding agreements.
```

---

### Schedule 11 — GOVERNMENT CONTRACTS & REGULATIONS

**Purpose:** Disclose government-related obligations (if applicable)

**Typical Contents:**
- SBIR/STTR funding (if any)
- Government contracts or grants
- Export control classifications
- ITAR or EAR compliance obligations

**Example Entry (Clean):**
```
11.1 Government Funding

The Purchased Assets were not developed with government funding (SBIR, 
STTR, or other federal/state grants). Seller has no obligations to any 
government agency relating to the Purchased Assets.

11.2 Export Control

To Seller's knowledge, the Purchased Assets are not subject to export 
control restrictions under ITAR or EAR. The software is publicly available 
and does not contain encryption (other than standard hashing functions).
```

---

### Schedule 12 — MATERIAL CHANGES

**Purpose:** Disclose changes between signing and closing (if gap exists)

**Contents:**
- Material changes to Purchased Assets
- New agreements or obligations
- Loss of key contributors (if team exists)
- Security incidents or breaches

**Example Entry:**
```
12.1 Material Changes

Between the date of this Agreement and the Closing Date, the following 
material changes have occurred [or "no material changes have occurred"]:

[List any significant updates, security patches, or architectural changes]

All such changes are included in the Purchased Assets as of Closing.
```

---

## DISCLOSURE BEST PRACTICES

### 1. Over-Disclose ✅

**Principle:** When in doubt, disclose it.

**Benefit:** Can't be liable for breach of rep if you disclosed the issue.

**Example:** Unsure if prior employer has any claim? Disclose the employment relationship and your analysis of why they don't.

---

### 2. Be Specific 📝

**Weak:** "Seller previously worked for tech companies."

**Strong:** "Seller was employed by Acme Corp from Jan 2020 to June 2022. Employment agreement included standard IP assignment clause. Bickford development began July 2023, over one year after separation. Acme Corp has no claim to Purchased Assets."

---

### 3. Provide Evidence 📎

**Practice:** Attach supporting documents as exhibits.

**Examples:**
- Employment agreements → Exhibit 4.1-A
- NDA with prior acquirer → Exhibit 4.2-A
- Open-source license text → Exhibit 3.1-A

---

### 4. Cross-Reference Data Room 🔗

**Practice:** Point to existing data room materials.

**Example:**
```
"See dataroom/SECURITY/SBOM.md for complete open-source 
software inventory and license analysis."
```

**Benefit:** Reduces duplication; maintains single source of truth.

---

### 5. Update Before Closing 🔄

**Practice:** Disclosure schedules are "as of Closing" documents.

**Timeline:**
- Draft during diligence (Weeks 1-3)
- Update during negotiation (Weeks 4-6)
- Final update at Closing (Day of)

---

## TRANSACTION WORKFLOW

### Phase 1: Initial Draft (Diligence Period)

**Week 1-2:**
1. Create disclosure schedule shells (Schedules 1-12)
2. Populate with known information
3. Flag items requiring further research
4. Share preliminary versions with buyer

---

### Phase 2: Buyer Review (Negotiation Period)

**Week 3-4:**
1. Buyer reviews disclosure schedules
2. Buyer requests clarifications or additional disclosure
3. Seller updates schedules based on buyer questions
4. Iterate until buyer is satisfied

---

### Phase 3: Final Update (Pre-Closing)

**Week 5-6:**
1. Conduct final review of all schedules
2. Update for any changes since initial draft
3. Attach all referenced exhibits
4. Execute as part of APA package

---

### Phase 4: Post-Closing (if applicable)

**Days 1-30:**
1. If Material Change provision exists, update Schedule 12
2. Provide to buyer within specified timeframe
3. Address any post-Closing disclosure obligations

---

## SAMPLE SCHEDULE TEMPLATE

```
SCHEDULE [X] TO ASSET PURCHASE AGREEMENT

SUBJECT: [Schedule Title]

This Schedule [X] is attached to and made part of that certain Asset 
Purchase Agreement dated as of [Date] (the "Agreement") by and between 
bickford (or Derek Bickford), as Seller, and [OpenAI Legal Entity], 
as Buyer.

Capitalized terms used but not defined herein have the meanings set 
forth in the Agreement.

---

[Schedule Content]

---

Prepared as of: [Date]
Last Updated: [Date]
Page [X] of [Y]

SELLER:
_________________________
[Signature if required]
```

---

## COUNSEL REVIEW CHECKLIST

- [ ] All schedules referenced in APA are prepared
- [ ] Each schedule is properly numbered and titled
- [ ] All disclosures are specific and verifiable
- [ ] Supporting exhibits are attached
- [ ] Cross-references to data room are accurate
- [ ] No material information is omitted
- [ ] Schedules are dated and signed (if required)
- [ ] Final update completed before Closing

---

## NEXT STEPS

1. **Create Schedule Shells**
   - Use templates provided above
   - Customize for Bickford-specific details
   - Number consistently with APA

2. **Populate Schedules**
   - Gather information from data room
   - Cross-reference existing documentation
   - Flag items requiring clarification

3. **Review with Counsel**
   - Ensure all material items disclosed
   - Verify compliance with APA representations
   - Check for over-disclosure or under-disclosure

4. **Share with Buyer**
   - Provide as part of diligence package
   - Respond to buyer questions
   - Update based on feedback

5. **Finalize at Closing**
   - Conduct final review
   - Execute as APA exhibits
   - Retain copies in corporate records

---

## NOTES FOR COUNSEL

**Strategic Value:** Well-organized disclosure schedules:
- Reduce diligence friction
- Demonstrate transparency and professionalism
- Minimize post-Closing disputes
- Provide clear protection for seller representations

**Transaction Standard:** This 12-schedule structure is consistent with tech acquisition best practices and familiar to OpenAI's legal team.

**Timing:** Start early (Week 1 of diligence); incomplete or last-minute schedules create transaction risk.

**Cross-Functional:** Involve founder, counsel, and accountant (for financial schedules) to ensure completeness.

---

**End of Disclosure Schedule Index**
