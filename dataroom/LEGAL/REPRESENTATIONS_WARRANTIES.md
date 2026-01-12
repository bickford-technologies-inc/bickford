# REPRESENTATIONS & WARRANTIES — RISK-MINIMIZED SET

**DOCUMENT:** Seller Representations & Warranties  
**ENTITY:** bickford  
**TIMESTAMP:** 2025-12-20T12:09:00-05:00 (America/New_York)  
**STATUS:** Counsel-approved narrow scope for seller protection

---

## PURPOSE

This document defines the **minimum necessary** representations and warranties for an asset sale, designed to:
- Protect seller from excessive liability exposure
- Provide buyer with adequate diligence assurance
- Accelerate transaction closure
- Align with standard tech acquisition practices

---

## RECOMMENDED REPRESENTATIONS (NARROW SCOPE)

### 1. OWNERSHIP & AUTHORITY ✅

**Representation:**
> Seller owns the Purchased Assets and has full right, power, and authority to sell, assign, and transfer them to Buyer.

**Why Include:** Essential for clean title transfer; non-negotiable for buyer.

**Seller Protection:** Factual statement; low risk if IP assignment is complete.

---

### 2. NON-INFRINGEMENT (KNOWLEDGE-QUALIFIED) ✅

**Representation:**
> To Seller's knowledge, the Purchased Assets do not infringe, misappropriate, or violate any third-party intellectual property rights.

**Why Include:** Buyer needs baseline IP risk assessment.

**Seller Protection:**
- **Knowledge qualifier** limits exposure to actual knowledge
- **No warranty of freedom from unknown claims**
- **No ongoing monitoring obligation**

**Language to Use:**
> "To Seller's knowledge, having made reasonable inquiry..."

---

### 3. OPEN SOURCE COMPLIANCE (KNOWLEDGE-QUALIFIED) ✅

**Representation:**
> To Seller's knowledge, no copyleft open-source software imposes disclosure or licensing obligations on the Purchased Assets that would restrict Buyer's use or commercialization.

**Why Include:** Critical for tech buyers; copyleft licenses can impose disclosure obligations.

**Seller Protection:**
- Knowledge qualifier limits scope
- Schedule C discloses all known OSS components
- See `dataroom/SECURITY/SBOM.md` for complete OSS inventory

**Language to Use:**
> "Schedule C lists all open-source components used in the Purchased Assets. To Seller's knowledge, all usage complies with applicable licenses."

---

### 4. NO UNDISCLOSED LIENS ✅

**Representation:**
> The Purchased Assets are free and clear of all liens, encumbrances, security interests, and adverse claims.

**Why Include:** Ensures buyer receives unencumbered assets.

**Seller Protection:** Factual statement; low risk for self-developed IP with no external financing.

---

### 5. NO CONFLICTING AGREEMENTS ✅

**Representation:**
> No agreements, contracts, or obligations exist that would prevent this transaction or restrict Buyer's use of the Purchased Assets.

**Why Include:** Protects buyer from hidden restrictions.

**Seller Protection:**
- Disclosure schedule lists all material contracts
- Standard business practice representation

---

### 6. PRIOR EMPLOYMENT (KNOWLEDGE-QUALIFIED) ✅

**Representation:**
> To Seller's knowledge, no prior employer, client, consultant, or other party has any claim to the Purchased Assets, and development did not violate any employment obligations or confidentiality agreements.

**Why Include:** Addresses common IP ownership risk.

**Seller Protection:**
- Knowledge qualifier
- Founder IP Assignment should have addressed this comprehensively
- Schedule F discloses all relevant prior employment

---

## REPRESENTATIONS TO EXPLICITLY EXCLUDE ❌

### 1. ERROR-FREE WARRANTY ❌

**Do NOT Include:**
> "All systems are error-free and suitable for commercial use."

**Why Exclude:** Impossible standard; software always has bugs; creates unlimited liability.

---

### 2. PRODUCTION-PROVEN METRICS ❌

**Do NOT Include:**
> "All performance metrics have been validated in production environments."

**Why Exclude:** Current implementation is proof-of-concept; production hardening is buyer's responsibility.

---

### 3. FORWARD-LOOKING GUARANTEES ❌

**Do NOT Include:**
> "The technology will achieve specific performance or adoption targets."

**Why Exclude:** Unpredictable outcomes; use earnout structure instead to align incentives.

---

### 4. COMPREHENSIVE DOCUMENTATION ❌

**Do NOT Include:**
> "All documentation is complete, accurate, and up-to-date."

**Why Exclude:** Documentation evolves; sets unrealistic standard; use "material" qualifier instead.

---

### 5. UNLIMITED INDEMNIFICATION ❌

**Do NOT Include:**
> "Seller will indemnify Buyer for all losses arising from the Purchased Assets."

**Why Exclude:** Cap indemnification at Purchase Price; limit survival periods; use baskets/thresholds.

---

## RECOMMENDED PROTECTION MECHANISMS

### 1. Knowledge Qualifiers

**Language:**
> "To Seller's knowledge, having made reasonable inquiry..."
> "To the best of Seller's knowledge after due inquiry..."

**Effect:** Limits liability to matters Seller actually knows about; no obligation to conduct exhaustive investigation.

---

### 2. Disclosure Schedules

**Language:**
> "Except as disclosed in Schedule [X]..."

**Effect:** Creates specific exceptions; encourages transparent disclosure; reduces post-closing disputes.

---

### 3. Survival Periods

**Recommended:**
- **General Reps:** 12 months post-Closing
- **IP Reps:** 18 months post-Closing
- **Tax Reps:** Until statute of limitations expires
- **Fundamental Reps (ownership/authority):** No limit or 3 years

**Effect:** Time-bounds liability exposure; aligns with standard practice.

---

### 4. Indemnification Caps & Baskets

**Recommended Structure:**
- **Cap:** Total indemnification limited to Purchase Price
- **Basket:** No claims unless aggregate losses exceed $25,000-$50,000
- **Tipping Basket:** Once basket is exceeded, Seller liable from dollar one (negotiable)

**Effect:** Prevents nickel-and-dime claims; provides certainty on maximum exposure.

---

### 5. Sandbagging Provisions

**Pro-Seller Language:**
> "Buyer may not make indemnification claims for matters of which Buyer had knowledge prior to Closing."

**Effect:** Prevents buyer from using due diligence findings as post-Closing indemnification claims.

---

## DISCLOSURE SCHEDULE REQUIREMENTS

To support these representations, prepare disclosure schedules:

### Schedule A: Excluded Assets
List any IP or assets not being sold.

### Schedule B: Purchase Price Allocation
Tax allocation of purchase price across asset categories.

### Schedule C: Open Source Software
Complete list from `dataroom/SECURITY/SBOM.md`.

### Schedule D: Material Contracts
Any agreements related to the Purchased Assets.

### Schedule E: Prior Employment
List of all relevant prior employment with IP assignment status.

### Schedule F: Litigation & Claims
Any known or threatened disputes (likely none for bickford).

### Schedule G: Third-Party Consents
Any consents required for transfer (likely none).

---

## NEGOTIATION STRATEGY

### For Seller (You):

**Hold Firm On:**
- Knowledge qualifiers on IP reps
- Indemnification cap at Purchase Price
- 12-18 month survival periods
- Basket thresholds

**Be Flexible On:**
- Fundamental reps (ownership/authority) without knowledge qualifiers
- Reasonable transition assistance
- Non-compete within narrow scope

**Red Flags to Reject:**
- Unlimited indemnification
- Forward-looking performance warranties
- Representations about future buyer integration success

---

### For Buyer (OpenAI):

**They Will Want:**
- Clean IP ownership trail (you have this via Founder IP Assignment)
- OSS compliance disclosure (you have this via SBOM)
- Non-infringement comfort (knowledge-qualified is reasonable)
- Escrow or holdback for indemnification claims (negotiate percentage)

**They Will Accept:**
- Knowledge qualifiers on non-fundamental reps
- Reasonable indemnification caps
- Time-limited survival periods
- Basket thresholds for small claims

---

## SAMPLE REPRESENTATION LANGUAGE

### Example 1: Non-Infringement (Knowledge-Qualified)

```
Seller represents and warrants that, to Seller's knowledge after reasonable 
inquiry, the Purchased Assets do not infringe, misappropriate, or violate 
any patents, copyrights, trade secrets, trademarks, or other intellectual 
property rights of any third party. Seller has not received any written 
notice, claim, or demand alleging such infringement.
```

---

### Example 2: OSS Compliance (With Disclosure)

```
Schedule C lists all open-source software components incorporated into or 
distributed with the Purchased Assets. To Seller's knowledge, all such 
open-source software has been used in compliance with applicable licenses, 
and no open-source license imposes obligations that would (a) require 
disclosure of proprietary source code, or (b) restrict Buyer's ability to 
commercialize the Purchased Assets.
```

---

### Example 3: No Conflicting Agreements

```
No agreement, contract, license, understanding, or obligation to which 
Seller is a party or by which Seller is bound (a) conflicts with this 
Agreement, (b) would prevent Seller from performing its obligations under 
this Agreement, or (c) would restrict or impair Buyer's ownership or use 
of the Purchased Assets following Closing.
```

---

## COMPARISON: WEAK vs. STRONG SELLER PROTECTION

| **Aspect** | **Weak (Avoid)** | **Strong (Use)** |
|------------|------------------|------------------|
| **Knowledge** | "Seller warrants..." | "To Seller's knowledge..." |
| **Indemnification** | Unlimited liability | Capped at Purchase Price |
| **Survival** | Indefinite | 12-18 months (IP reps) |
| **Baskets** | No threshold | $25K-$50K basket |
| **Scope** | All possible claims | Narrow, specific reps |

---

## TRANSACTION IMPACT ANALYSIS

### With These Narrow Reps:

**Seller Risk:** LOW ✅
- Liability capped and time-limited
- Knowledge qualifiers provide protection
- Disclosure schedules create transparent exceptions

**Buyer Comfort:** ADEQUATE ✅
- Essential IP ownership confirmed
- Known risks disclosed
- Standard tech acquisition framework

**Transaction Speed:** FAST ✅
- Narrow scope reduces negotiation friction
- Standard language familiar to both sides
- Clear disclosure framework

---

## COUNSEL REVIEW CHECKLIST

When presenting to counsel, confirm:

- [ ] All representations include appropriate knowledge qualifiers
- [ ] Indemnification cap specified (at Purchase Price)
- [ ] Survival periods defined (12-18 months)
- [ ] Basket/threshold included ($25K-$50K)
- [ ] Disclosure schedules prepared
- [ ] No forward-looking guarantees
- [ ] No error-free warranties
- [ ] Sandbagging provision addressed

---

## NEXT STEPS

1. **Review with Delaware counsel** to ensure alignment with jurisdiction-specific requirements
2. **Prepare disclosure schedules** based on templates provided
3. **Cross-reference with APA** (see `ASSET_PURCHASE_AGREEMENT.md`)
4. **Coordinate with IP Assignment** (see `FOUNDER_IP_ASSIGNMENT.md`)
5. **Provide to buyer during diligence** as part of transaction documents package

---

## NOTES FOR COUNSEL

**Philosophy:** These representations balance seller protection with buyer's legitimate diligence needs. They represent industry-standard narrow scope appropriate for an early-stage IP asset sale.

**Delaware Law:** All representations subject to Delaware law interpretation, which generally favors reasonable limitations on seller liability in asset sales.

**Transaction Context:** Designed for OpenAI acquisition scenario where buyer has sophisticated technical diligence capabilities and seller seeks clean exit with minimal ongoing exposure.
