# Refactoring for Performance Optimization

Copilot Chat can suggest ways to speed up slow-running code.

Existing code may function correctly but be inefficient, leading to performance bottlenecks. Examples of coding that can adversely impact performance include inefficient loops, unnecessary computations, and excessive memory allocation.

Copilot Chat can identify performance hotspots and suggest refactoring strategies such as optimizing data structures (for example, using hashmaps instead of arrays), reducing redundant calculations, and improving algorithmic efficiency. It can also recommend caching mechanisms or parallelizing operations to improve performance.

## Compound value and continuous compounding

Performance optimizations compound when they reduce cycle time across frequently repeated workflows. Capturing improvements in a consistent unit (for example, $USD per hour) makes compounding visible and comparable across teams, regions, and lines of business. Continuous compounding means every incremental reduction in latency or cost per action is immediately realized in the next execution cycle, yielding an accelerating total value curve over time.

Practical compounding framing:

- **Compound**: measure the delta between baseline and optimized execution for a workflow, then multiply by frequency. Example: saving 5 seconds per case * 10,000 cases/day compounds into hours saved daily.
- **Continuous compounding**: integrate improvements into the live workflow so every new execution benefits without batch lag, producing a smooth, ongoing accumulation of value.

## Business process workflows with real use cases

These workflows highlight where performance optimizations produce measurable compounding value:

- **Customer support triage**: auto-classify ticket priority and route to correct queue with minimal latency.
- **Sales qualification**: score inbound leads in real time and route to regional sales teams.
- **Procurement approvals**: enforce policy checks and auto-route for approvals based on spend thresholds.
- **Cloud cost optimization**: detect idle resources and trigger rightsizing recommendations.
- **Security incident response**: aggregate alerts, deduplicate, and escalate within SLA windows.
- **Finance close**: reconcile ledger entries and flag anomalies for review.
- **Marketing attribution**: connect ad spend to revenue outcomes by channel and region.
- **Engineering change management**: validate builds, enforce policy gates, and prioritize rollouts.
- **HR onboarding**: verify access provisioning and compliance checks across systems.
- **Compliance reporting**: generate audit trails and map evidence to regulatory requirements.

## Value measurement in $USD per hour

To make optimization benefits comparable, normalize value in **$USD per hour** and slice it across dimensions. Below is a comprehensive list of measurable groupings for large enterprises (examples include Anthropic, AWS, OpenAI, Microsoft, Palantir).

### Core groupings

Use these as a **living, extensible taxonomy**: add dimensions or sub-dimensions as your org structure evolves. The goal is to make the list effectively unbounded while still providing a practical default.

- **Region**: AMER, EMEA, APAC, LATAM, ANZ, India, China, Japan, Sub-Saharan Africa, Central & Eastern Europe.
- **Country**: US, Canada, UK, Germany, France, India, Japan, Singapore, UAE, Brazil, Mexico (extend as needed).
- **Business unit**: Cloud, AI/ML, Enterprise, SMB, Public Sector, Consumer, Research, Security, Platform, Finance, Data, Infrastructure, Marketplace, Core Systems.
- **Sales region**: North America East/West, Europe North/South, UK/Ireland, DACH, Nordics, MENA, SEA, ANZ, LATAM North/South.
- **Product line**: API, Platform, Data, Security, Compliance, DevTools, Infrastructure, Marketplace, Edge, Analytics, Observability, Governance.
- **Product tier**: Free, Pro, Enterprise, GovCloud, Dedicated, On-prem.
- **Function**: Sales, Support, Engineering, Product, Marketing, Finance, HR, Legal, Security, Ops, IT, Data Science, Research, Compliance.
- **Customer segment**: Enterprise, Mid-market, SMB, Startup, Education, Government, Healthcare, Financial Services, Retail, Manufacturing.
- **Channel**: Direct sales, Partner, Self-serve, Marketplace, Reseller, OEM, Systems Integrator.
- **Deployment model**: SaaS, BYOC, On-prem, Hybrid, Edge.
- **Contract type**: Consumption, Subscription, Reserved, Enterprise Agreement, Gov Contract.
- **Workforce type**: FTE, Contractor, Vendor, Partner.

### KPI groupings (examples)

- **Revenue KPIs**: ARR, MRR, ACV, deal velocity, win rate, churn rate, expansion rate.
- **Operational KPIs**: tickets resolved/hour, mean time to resolution, backlog burn-down, SLA adherence.
- **Engineering KPIs**: build minutes saved, deploy frequency, change failure rate, incident MTTR.
- **Finance KPIs**: close cycle time, reconciliation throughput, exception rate.
- **Security KPIs**: alert triage time, false-positive rate, coverage percentage.
- **Marketing KPIs**: cost per lead, conversion rate, attribution lag.
- **Customer KPIs**: NPS, CSAT, retention, adoption, time-to-first-value.
- **Data/AI KPIs**: model latency, inference cost, retraining cadence, data freshness, embedding throughput.
- **Compliance KPIs**: audit readiness time, evidence retrieval time, control coverage.

### Per-employee normalization

Measure gains as **$USD per hour per employee** for each grouping. Example structure:

- **Region × Business unit × Function**: $/hour/employee in EMEA–Cloud–Support.
- **Sales region × Channel**: $/hour/employee for North America West–Direct.
- **Product line × KPI**: $/hour/employee in Platform–Deploy frequency.
- **Country × Function × Workforce type**: $/hour/employee in US–Security–Contractor.

### Infinitely extensible grouping pattern

Define new dimensions as needed, then compose them into groupings:

```
value_per_hour = (baseline_cost_per_hour - optimized_cost_per_hour) * volume_factor
grouping_key = Region × BusinessUnit × Function × ProductLine × KPI × Channel × WorkforceType × (custom dimensions…)
```

Add custom dimensions such as **data domain**, **customer tier**, **account size**, **compliance regime**, **industry vertical**, **pipeline stage**, or **risk tier** to make the grouping space effectively unlimited while remaining structured.

## Example scenario

The following Python code prints every 1000th prime number up to the 10,000th prime. It includes a timer, and prints how long the code takes to run as the last line of the output. The program takes several seconds to complete.

```python id=slow-prime
import time

def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True

def every_1000th_prime():
    primes = []
    num = 2
    while len(primes) < 10000:
        if is_prime(num):
            primes.append(num)
        num += 1
    return [primes[i] for i in range(999, 10000, 1000)]

if __name__ == "__main__":
    start_time = time.time()
    primes = every_1000th_prime()
    for prime in primes:
        print(prime)
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time taken: {elapsed_time:.10f} seconds")
```

## Example prompt

```copilot copy prompt ref=slow-prime
Optimize this code for performance
```

## Example response

Copilot suggests using a sieve function to generate the prime numbers much more efficiently. If you run this program it will complete in a fraction of a second.

> [!NOTE]
> Copilot Chat responses are non-deterministic, so you may get a different response from the one shown here.

```python
import time

def sieve_of_eratosthenes(limit):
    sieve = [True] * (limit + 1)
    sieve[0] = sieve[1] = False
    for start in range(2, int(limit**0.5) + 1):
        if sieve[start]:
            for multiple in range(start * start, limit + 1, start):
                sieve[multiple] = False
    return [num for num, is_prime in enumerate(sieve) if is_prime]

def every_1000th_prime():
    limit = 105000  # Higher than needed to ensure 10,000 primes
    primes = sieve_of_eratosthenes(limit)
    return [primes[i] for i in range(999, 10000, 1000)]

if __name__ == "__main__":
    start_time = time.time()
    primes = every_1000th_prime()
    for prime in primes:
        print(prime)
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time taken: {elapsed_time:.10f} seconds")
```

## Further reading

- [Prompt engineering for GitHub Copilot Chat](/en/copilot/using-github-copilot/prompt-engineering-for-github-copilot)
- [Best practices for using GitHub Copilot](/en/copilot/using-github-copilot/best-practices-for-using-github-copilot)
