# Negotiation Fallback Positions — bickford

**Document Type:** Internal Negotiation Strategy  
**Timestamp:** 2025-12-20T17:42:00-05:00  
**Purpose:** Define walk-away triggers and fallback positions

---

## Price

### Target Range
**$8M - $10M total consideration**

### Structure
- **Base:** $6.5M - $7M (70% upfront cash)
- **Earnout:** $2M - $3M (objective milestones over 15 months)

### Fallback Positions

#### Position 1: Lower Base, Higher Earnout
- **Base:** $6M (60% upfront)
- **Earnout:** $4M (40% over 18 months)
- **Condition:** Earnout milestones must be 100% objective (no revenue-only clauses)
- **Risk:** More dependent on buyer execution, but acceptable if milestones are achievable

#### Position 2: Higher Base, No Earnout
- **Base:** $8M (100% cash at closing)
- **Earnout:** $0
- **Condition:** Buyer must value certainty over performance incentives
- **Benefit:** Clean exit, no post-closing obligations beyond consulting

#### Position 3: All-Cash Floor
- **Base:** $7M cash (no earnout)
- **Condition:** Buyer nervous about earnout mechanics or integration timeline
- **Rationale:** Certainty > maximum upside

### Floor (Walk-Away)
**$6M cash minimum**
- Below this, transaction not economically viable
- No flexibility on sub-$6M base regardless of earnout structure

### Ceiling (Aspiration)
**$12M total** ($8M base + $4M earnout)
- Requires buyer to highly value competitive positioning
- Justification: Strategic premium for first-mover advantage in execution governance

---

## Structure (Asset vs Stock)

### Preferred: Asset Purchase
**Rationale:**
- Buyer gets step-up in tax basis (~$500K-$1M NPV benefit)
- Seller protected from unknown liabilities
- Clean post-closing (no subsidiary to manage)
- 338(h)(10) election possible (both parties benefit)

### Acceptable: Asset Purchase (No 338(h)(10))
**Condition:** If Seller entity cannot convert LLC→Corp in time
- Slightly less favorable tax treatment for Seller (~$100K more tax)
- Still better than stock sale for liability protection

### Fallback: Stock Purchase
**Conditions Required:**
1. **Enhanced Reps & Warranties:** Buyer demands stronger liability coverage
2. **Higher Indemnification Cap:** 1.5x - 2x Purchase Price (vs 1x for asset sale)
3. **Longer Survival Periods:** 24-36 months (vs 18 months for asset sale)
4. **Escrow Holdback:** 15-20% held for 24 months (vs 10% for asset sale)

**When to Accept Stock Sale:**
- Buyer has strategic reason to maintain subsidiary
- Third-party consents become unexpectedly complex (unlikely for bickford)
- Seller strongly prefers simpler paperwork despite tax cost

### Never Accept: Stock Sale + 338(g) Election
**Reason:** Double taxation for Seller (capital gains + corporate-level tax)
- Seller would need $1M+ price increase to compensate
- Economically irrational structure

---

## Earnout Structure

### Preferred: Objective Integration Milestones
**3-Tier Structure:**
1. **Integration (50% weight, $1M-$1.5M):**
   - Trigger: bickford integrated into buyer's agent platform
   - Verification: Production deployment serving >1,000 agent sessions/day
   - Timeline: 6 months from Closing

2. **Adoption (30% weight, $600K-$900K):**
   - Trigger: 3+ enterprise pilots deployed using bickford features
   - Verification: Signed pilot agreements + 30-day operational stability
   - Timeline: 9 months from Closing

3. **Revenue Enablement (20% weight, $400K-$600K):**
   - Trigger: Buyer product feature leveraging bickford generates $5M ARR
   - Verification: Buyer finance attestation of ARR attribution
   - Timeline: 15 months from Closing

**Why This Works:**
- Integration/Adoption milestones are 100% objective (no ambiguity)
- Revenue milestone is small portion (20%) to reduce Seller risk
- All milestones achievable if Buyer commits to integration

### Acceptable Fallback: Time-Based Vesting
**Structure:**
- Earnout payments vest quarterly over 15 months
- Not tied to performance (guaranteed if Seller continues consulting)
- **Condition:** Minimum guaranteed earnout (e.g., $1.5M guaranteed, $500K performance-based)

**When to Accept:**
- Buyer cannot commit to objective milestones (organizational uncertainty)
- Seller values certainty over maximum upside

### Avoid: Revenue-Only Earnouts
**Problem:** Seller has no control over buyer's go-to-market execution
**Exceptions:**
- Revenue milestone is small portion (<20% of total earnout)
- Revenue target is conservative ($5M ARR or less)
- Alternative milestone available if revenue not achieved (e.g., adoption metrics)

### Walk-Away: Subjective Earnouts
**Examples of Unacceptable Terms:**
- "Earnout paid if integration deemed successful by Buyer"
- "Earnout contingent on Buyer satisfaction with performance"
- "Earnout at Buyer's sole discretion"

**Why Walk Away:**
- Buyer has unilateral control (Seller likely gets $0)
- Creates perverse incentives (Buyer benefits from withholding payment)
- Not industry-standard (red flag on Buyer good faith)

---

## Employment / Consulting

### Preferred: 12-Month Consulting (Non-Employee)
**Structure:**
- Scope: 20 hours/week first 6 months, 10 hours/week thereafter
- Duties: Integration support, code review, knowledge transfer, customer pilots
- Compensation: Flexible (see options below)
- No management obligations, no on-call, no direct reports

**Why Preferred:**
- Avoids employee classification (no benefits, no PTO, no HR complexity)
- Preserves Founder flexibility (can take other opportunities)
- Clean exit after 12 months (no long-term lock-in)

### Compensation Options (Ranked)

#### Option 1: Cash Stipend (Simplest)
- $180K annual ($15K/month for 12 months)
- Paid monthly in arrears
- No equity, no earnout linkage

#### Option 2: Equity Participation (If Buyer is Growth-Stage)
- OpenAI Profit Interests: 0.05%-0.10% (4-year vest, 1-year cliff)
- Or RSUs with equivalent value
- Upside if Buyer IPOs or exits

#### Option 3: Earnout-Linked (Aligns Incentives)
- Base: $120K annual ($10K/month)
- Plus: 10% of all earnout payments actually paid
- Example: If $2.5M earnout paid, Founder receives additional $250K

### Fallback: Advisory Role Only
**Structure:**
- 5-10 hours/month for 12 months
- Compensation: $60K-$100K annual
- Minimal obligations (available for key decisions only)

**When to Accept:**
- Founder wants clean exit with minimal ongoing involvement
- Buyer has strong internal team (less integration support needed)

### Avoid: Full-Time Employment
**Problems:**
- Loss of flexibility (cannot pursue other opportunities)
- Benefits/HR complexity (W-2 vs 1099)
- Long-term lock-in (typically 2-4 year vesting)

**Exceptions:**
- Buyer offers executive role (VP of Agent Safety, etc.) with meaningful equity
- Compensation significantly exceeds consulting equivalent (2x-3x)

---

## IP & Post-Closing Restrictions

### Non-Negotiable: Clean IP Transfer
**Requirements:**
1. **No Residual License-Back:** Seller does not retain any rights to use bickford IP post-Closing
2. **No Revenue Sharing:** Buyer does not owe Seller royalties or revenue share on future bickford products
3. **No Approval Rights:** Seller has no approval rights over Buyer's use of bickford IP

**Rationale:** Clean transfer is industry-standard for asset purchases. Anything less creates ongoing entanglements.

### Non-Negotiable: Personal Research Freedom
**Requirements:**
1. **No Blanket AI Ban:** Non-compete does not prevent Founder from working in AI industry generally
2. **No Research Restrictions:** Founder can publish academic papers, contribute to open-source, teach courses on decision continuity concepts
3. **Narrow Scope:** Non-compete applies only to "whole system" competition (all 5 bickford components together), not individual features

**Walk-Away Trigger:** Buyer demands broad non-compete (e.g., "no work on agent safety for 5 years")

### Acceptable: Limited Non-Compete
**Scope:**
- **Duration:** 24 months (not 36+)
- **Geographic:** Worldwide (acceptable for software)
- **Activity:** Developing or marketing a directly competing product that combines ALL of:
  * Immutable decision tracking with cryptographic hash chains
  * Multi-criteria path scoring (OPTR)
  * Governance gates with promotion validation
  * Session persistence with cross-device continuity
  * IP-protected integration controls

**Permitted Activities:**
- Employment at OpenAI competitors (Google, Meta, Anthropic, etc.)
- Development of single-feature tools (audit logging, OPTR alone, etc.)
- Open-source contributions
- Academic research and publishing
- Consulting on AI governance/safety (non-competing services)

---

## Indemnification

### Preferred: Seller-Friendly Caps
**Structure:**
- **General Cap:** 1x Purchase Price (standard)
- **Basket:** $50K tipping basket (first $50K Seller not liable, then liable for full amount)
- **Survival:** 18 months general reps, 5 years IP reps
- **Exceptions (No Cap):** Fraud, criminal conduct, IP ownership breaches (capped at 2x PP)

### Fallback: Higher Cap for Stock Sale
**Structure:**
- **General Cap:** 1.5x - 2x Purchase Price (compensates Buyer for assuming all liabilities in stock sale)
- **Basket:** $25K (lower to make cap meaningful)
- **Survival:** 24 months general reps, 5 years IP reps
- **Escrow:** 15-20% held for 18-24 months (vs 10% for asset sale)

### Walk-Away: Uncapped Indemnification
**Red Flags:**
- "Seller liable for all losses without limit"
- No basket (Seller liable for every minor claim)
- Survival period >5 years (except tax reps)

**Why Walk Away:**
- Unlimited downside for Seller (could exceed Purchase Price by 10x)
- Not industry-standard (red flag on Buyer good faith)
- Makes deal economically irrational for Seller

---

## Walk-Away Triggers (Non-Negotiable)

### Trigger 1: Training Data Demands
**Scenario:** Buyer demands access to training data, conversation logs, user prompts

**Response:** Walk away immediately
- **Reason:** bickford does not collect or require training data (operates on decision records only)
- **Implication:** Buyer misunderstands product or has hidden agenda

### Trigger 2: Open-Ended Liability
**Scenario:** Buyer refuses to cap indemnification or demands Seller liability for all future issues

**Response:** Walk away
- **Reason:** Unlimited downside makes deal irrational
- **Alternative:** Negotiate higher cap (2x PP) or longer escrow, but never accept "no cap"

### Trigger 3: Subjective Earnouts
**Scenario:** Buyer insists earnout is "at Buyer's discretion" or "subject to Buyer satisfaction"

**Response:** Walk away or convert to time-based vesting
- **Reason:** Seller will never see earnout payment (Buyer controls outcome)
- **Alternative:** Objective milestones or guaranteed time-based vesting

### Trigger 4: Broad Non-Compete
**Scenario:** Buyer demands Founder cannot work in AI industry for 3-5 years

**Response:** Walk away
- **Reason:** Career-limiting, likely unenforceable, signals Buyer bad faith
- **Alternative:** Narrow non-compete (whole-system competition only, 24 months max)

### Trigger 5: Control Over Personal Research
**Scenario:** Buyer demands approval rights over Founder's academic publications, open-source contributions, or teaching

**Response:** Walk away immediately
- **Reason:** Violates academic freedom, likely unenforceable, not industry-standard
- **Alternative:** Standard confidentiality (Founder cannot disclose Buyer confidential information) but no pre-approval of independent research

---

## Negotiation Strategy

### Prioritization Framework

**Tier 1 (Non-Negotiable):**
- $6M minimum cash
- Clean IP transfer (no license-backs)
- Personal research freedom
- No unlimited liability

**Tier 2 (Strongly Preferred):**
- Asset sale structure (vs stock sale)
- Objective earnout milestones (vs subjective)
- 12-month consulting (vs full-time employment)
- Narrow non-compete (vs broad industry ban)

**Tier 3 (Nice-to-Have):**
- $10M total price (vs $8M)
- All-cash deal (vs earnout)
- Shorter consulting term (vs 12 months)
- Higher earnout weight on integration (vs revenue)

### Concession Strategy

**Give on Tier 3 to Protect Tier 1/2:**
- Accept $8M total (vs $10M) if Buyer agrees to asset sale
- Accept 12-month consulting (vs 6 months) if earnout milestones are objective
- Accept longer survival periods (24 months vs 18 months) if general cap stays at 1x PP

**Never Trade Tier 1 for Tier 2/3:**
- Do not accept <$6M base even if earnout is higher
- Do not accept unlimited liability even if price increases
- Do not accept broad non-compete even if Buyer offers premium

---

## Decision Tree

```
Price Below $6M?
├─ Yes → Walk Away
└─ No → Continue

Structure: Asset Sale Possible?
├─ Yes → Negotiate Asset Sale + 338(h)(10)
└─ No → Demand Enhanced Terms (1.5x cap, 24mo survival, 15% escrow)

Earnout: Objective Milestones?
├─ Yes → Accept 3-Tier Structure
└─ No → Negotiate Time-Based Vesting or All-Cash

Non-Compete: Narrow Scope (24mo, whole-system only)?
├─ Yes → Accept
└─ No → Walk Away (Career-Limiting)

Indemnification: Capped at 1x-2x PP?
├─ Yes → Accept
└─ No → Walk Away (Unlimited Downside)
```

---

## Summary Table

| Term | Preferred | Acceptable | Walk-Away |
|------|-----------|------------|-----------|
| **Price** | $8M-$10M | $7M-$8M | <$6M |
| **Structure** | Asset + 338(h)(10) | Asset (no election) or Stock (enhanced terms) | Stock + 338(g) |
| **Earnout** | Objective (Integration/Adoption/Revenue) | Time-based vesting | Subjective ("Buyer discretion") |
| **Employment** | 12mo consulting, non-employee | Advisory only | Full-time required |
| **Non-Compete** | 24mo, narrow (whole-system only) | None | 36mo+ or broad industry ban |
| **Indemnity Cap** | 1x PP (asset sale) or 1.5x-2x PP (stock sale) | 2x PP with escrow | Uncapped |
| **Research Freedom** | Full freedom (confidentiality only) | Limited disclosure | Buyer approval required |

---

## Document Control

- **Version:** 1.0
- **Date:** 2025-12-20
- **Purpose:** Internal negotiation guidance
- **Status:** Confidential (Seller only)

---

*This document defines Seller's negotiation boundaries. Do not share with Buyer. Use to guide negotiation strategy and identify walk-away scenarios.*
