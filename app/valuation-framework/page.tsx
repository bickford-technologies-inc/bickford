import styles from "./valuation-framework.module.css";

export default function ValuationFrameworkPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Bickford Valuation Framework</h1>
          <p className={styles.subtitle}>
            Comprehensive Analysis of Key Value Drivers Behind the $6.3B AWS
            Decision Continuity Index Assessment
          </p>

          <div className={styles.valuationHighlight}>
            <div className={styles.valuationAmount}>$6.3B</div>
            <div className={styles.valuationDesc}>
              Strategic Valuation Target Based on AWS Decision Continuity Index
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Primary Value Drivers (70% of Valuation)
          </h2>

          <div className={styles.valueDriverGrid}>
            <div
              className={`${styles.valueDriverCard} ${styles.valueDriverCardPrimary}`}
            >
              <div className={styles.driverHeader}>
                <div
                  className={`${styles.driverIcon} ${styles.driverIconPrimary}`}
                >
                  🏛️
                </div>
                <div className={styles.driverTitle}>
                  Regulated Market Enablement
                </div>
              </div>
              <div
                className={`${styles.driverValue} ${styles.driverValuePrimary}`}
              >
                $4.4B
              </div>
              <div className={styles.driverDesc}>
                <strong>Core Value:</strong> Unlocks $7.8B+ TAM in regulated AI
                markets where enforcement is prerequisite for deployment.
                <br />
                <br />
                <strong>Key Markets:</strong>
                <ul className={styles.driverList}>
                  <li>Defense &amp; Intelligence: $2.1B (FedRAMP High/IL5)</li>
                  <li>Healthcare: $3.8B (HIPAA compliance)</li>
                  <li>Financial Services: $1.9B (SEC/FINRA)</li>
                </ul>
                <br />
                <strong>Multiplier Logic:</strong> Enterprise customers pay 3-5x
                premium for solutions that eliminate compliance friction.
                Bickford&apos;s architectural enforcement creates 80%+ reduction
                in compliance overhead.
              </div>
            </div>

            <div
              className={`${styles.valueDriverCard} ${styles.valueDriverCardPrimary}`}
            >
              <div className={styles.driverHeader}>
                <div
                  className={`${styles.driverIcon} ${styles.driverIconPrimary}`}
                >
                  ⚡
                </div>
                <div className={styles.driverTitle}>
                  Execution Velocity Premium
                </div>
              </div>
              <div
                className={`${styles.driverValue} ${styles.driverValuePrimary}`}
              >
                $1.2B
              </div>
              <div className={styles.driverDesc}>
                <strong>Core Value:</strong> 20-40% reduction in execution
                latency through authority convergence and elimination of manual
                coordination overhead.
                <br />
                <br />
                <strong>Proven Metrics:</strong>
                <ul className={styles.driverList}>
                  <li>~15 minutes to convergence (validated Jan 14, 2026)</li>
                  <li>Single truth collapse eliminates decision latency</li>
                  <li>Cryptographic authority prevents rework cycles</li>
                </ul>
                <br />
                <strong>Enterprise Impact:</strong> Time-to-value acceleration
                justifies significant valuation multiple in enterprise AI
                deployments.
              </div>
            </div>

            <div
              className={`${styles.valueDriverCard} ${styles.valueDriverCardPrimary}`}
            >
              <div className={styles.driverHeader}>
                <div
                  className={`${styles.driverIcon} ${styles.driverIconPrimary}`}
                >
                  🔐
                </div>
                <div className={styles.driverTitle}>
                  Constitutional AI Enforcement Moat
                </div>
              </div>
              <div
                className={`${styles.driverValue} ${styles.driverValuePrimary}`}
              >
                $700M
              </div>
              <div className={styles.driverDesc}>
                <strong>Core Value:</strong> Only platform that transforms
                Constitutional AI from training-time philosophy to runtime
                architectural guarantee.
                <br />
                <br />
                <strong>Competitive Differentiation:</strong>
                <ul className={styles.driverList}>
                  <li>Purpose-built for Constitutional AI principles</li>
                  <li>Cryptographic proof of constraint enforcement</li>
                  <li>Architectural impossibility of violations</li>
                </ul>
                <br />
                <strong>Switching Costs:</strong> Once deployed, compliance
                integration depth creates exponentially increasing switching
                costs.
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.technicalCapabilities}>
            <h2
              className={`${styles.sectionTitle} ${styles.sectionTitleAccentBlue}`}
            >
              Technical Capabilities Driving Valuation
            </h2>

            <div className={styles.capabilityGrid}>
              <div className={styles.capabilityCard}>
                <h4 className={styles.capabilityCardTitle}>
                  🔗 Cryptographic Guarantees
                </h4>
                <p className={styles.capabilityCardBody}>
                  <strong>Value Driver:</strong> SHA-256 hash chains with Merkle
                  tree proofs create mathematically detectable tampering.
                  Enterprise-grade immutability that no competitor provides.
                </p>
              </div>

              <div className={styles.capabilityCard}>
                <h4 className={styles.capabilityCardTitle}>
                  ⚖️ Multi-Agent Convergence
                </h4>
                <p className={styles.capabilityCardBody}>
                  <strong>Value Driver:</strong> Asymmetric authority model
                  collapses divergent AI outputs into single authoritative
                  truth. Eliminates "AI gave conflicting advice" problem.
                </p>
              </div>

              <div className={styles.capabilityCard}>
                <h4 className={styles.capabilityCardTitle}>
                  📊 Real-time Compliance Certs
                </h4>
                <p className={styles.capabilityCardBody}>
                  <strong>Value Driver:</strong> Automated generation of
                  FedRAMP, HIPAA, SEC audit trails on demand. Reduces compliance
                  preparation from weeks to minutes.
                </p>
              </div>

              <div className={styles.capabilityCard}>
                <h4 className={styles.capabilityCardTitle}>
                  🎯 Zero-Touch Integration
                </h4>
                <p className={styles.capabilityCardBody}>
                  <strong>Value Driver:</strong> Middleware wrapper preserves
                  Claude&apos;s capabilities while adding enforcement. No
                  disruption to Anthropic&apos;s model development roadmap.
                </p>
              </div>

              <div className={styles.capabilityCard}>
                <h4 className={styles.capabilityCardTitle}>
                  🔄 Deterministic Enforcement
                </h4>
                <p className={styles.capabilityCardBody}>
                  <strong>Value Driver:</strong> Policies are code, not prompts.
                  "Please don&apos;t leak secrets" becomes architecturally
                  impossible action.
                </p>
              </div>

              <div className={styles.capabilityCard}>
                <h4 className={styles.capabilityCardTitle}>
                  ⚡ Authority Convergence Runtime
                </h4>
                <p className={styles.capabilityCardBody}>
                  <strong>Value Driver:</strong> Proven ~15 minute convergence
                  time for critical infrastructure incidents. Transforms AI from
                  advisory to authoritative.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.marketAnalysis}>
            <h2 className={styles.sectionTitle}>Market Opportunity Analysis</h2>

            <div className={styles.marketGrid}>
              <div className={styles.marketCard}>
                <div className={styles.marketValue}>$7.8B+</div>
                <div className={styles.marketLabel}>
                  Total Addressable Market
                </div>
                <div className={styles.marketDesc}>
                  Combined regulated AI markets where enforcement is
                  prerequisite for deployment
                </div>
              </div>

              <div className={styles.marketCard}>
                <div className={styles.marketValue}>$2.1B</div>
                <div className={styles.marketLabel}>
                  Defense &amp; Intelligence
                </div>
                <div className={styles.marketDesc}>
                  FedRAMP High/IL5 requirements, zero-trust architecture,
                  classified data processing
                </div>
              </div>

              <div className={styles.marketCard}>
                <div className={styles.marketValue}>$3.8B</div>
                <div className={styles.marketLabel}>Healthcare AI</div>
                <div className={styles.marketDesc}>
                  HIPAA compliance, malpractice protection, diagnostic reasoning
                  preservation
                </div>
              </div>

              <div className={styles.marketCard}>
                <div className={styles.marketValue}>$1.9B</div>
                <div className={styles.marketLabel}>Financial Services</div>
                <div className={styles.marketDesc}>
                  SEC/FINRA compliance, algorithmic trading audit trails, risk
                  management
                </div>
              </div>

              <div className={styles.marketCard}>
                <div className={styles.marketValue}>3-5x</div>
                <div className={styles.marketLabel}>Enterprise Premium</div>
                <div className={styles.marketDesc}>
                  Multiplier customers pay for compliance-ready solutions vs
                  generic AI tools
                </div>
              </div>

              <div className={styles.marketCard}>
                <div className={styles.marketValue}>80%+</div>
                <div className={styles.marketLabel}>
                  Compliance Friction Reduction
                </div>
                <div className={styles.marketDesc}>
                  Reduction in manual audit preparation and compliance overhead
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.competitiveMoat}>
            <h2
              className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}
            >
              Competitive Moat &amp; Defensibility
            </h2>

            <div className={styles.moatGrid}>
              <div className={styles.moatCard}>
                <h4 className={styles.moatCardTitle}>
                  🏗️ Architectural Enforcement
                </h4>
                <p className={styles.moatCardBody}>
                  Unlike prompt-based safety (OpenAI) or policy suggestions
                  (Microsoft), Bickford makes violations architecturally
                  impossible. Cannot be replicated through training alone.
                </p>
              </div>

              <div className={styles.moatCard}>
                <h4 className={styles.moatCardTitle}>
                  🔗 Constitutional AI Native
                </h4>
                <p className={styles.moatCardBody}>
                  Purpose-built for Constitutional AI principles.
                  Authority-auditor-executor model aligns perfectly with
                  harmlessness, honesty, helpfulness framework.
                </p>
              </div>

              <div className={styles.moatCard}>
                <h4 className={styles.moatCardTitle}>📈 Network Effects</h4>
                <p className={styles.moatCardBody}>
                  Multi-agent orchestration platform becomes more valuable as
                  more AI services integrate. Creates ecosystem lock-in effect.
                </p>
              </div>

              <div className={styles.moatCard}>
                <h4 className={styles.moatCardTitle}>
                  🛡️ Regulatory Expertise
                </h4>
                <p className={styles.moatCardBody}>
                  Deep understanding of FedRAMP, HIPAA, SEC requirements. Policy
                  engine contains years of regulatory compliance knowledge.
                </p>
              </div>

              <div className={styles.moatCard}>
                <h4 className={styles.moatCardTitle}>
                  ⚡ Execution Authority IP
                </h4>
                <p className={styles.moatCardBody}>
                  Proprietary convergence algorithms and cryptographic authority
                  protocols. Core IP around multi-agent truth collapse.
                </p>
              </div>

              <div className={styles.moatCard}>
                <h4 className={styles.moatCardTitle}>🔄 Switching Costs</h4>
                <p className={styles.moatCardBody}>
                  Once deployed, compliance integration creates exponentially
                  increasing switching costs. Audit trails become
                  business-critical infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Secondary Value Drivers (20% of Valuation)
          </h2>

          <div className={styles.valueDriverGrid}>
            <div
              className={`${styles.valueDriverCard} ${styles.valueDriverCardSecondary}`}
            >
              <div className={styles.driverHeader}>
                <div
                  className={`${styles.driverIcon} ${styles.driverIconSecondary}`}
                >
                  🔗
                </div>
                <div className={styles.driverTitle}>
                  Platform Network Effects
                </div>
              </div>
              <div
                className={`${styles.driverValue} ${styles.driverValueSecondary}`}
              >
                $800M
              </div>
              <div className={styles.driverDesc}>
                <strong>Core Value:</strong> Multi-agent orchestration platform
                becomes more valuable as more AI services integrate with
                Constitutional AI + enforcement ecosystem.
                <br />
                <br />
                <strong>Growth Multiplier:</strong> Each additional AI service
                integration increases platform value exponentially through
                network effects and ecosystem lock-in.
              </div>
            </div>

            <div
              className={`${styles.valueDriverCard} ${styles.valueDriverCardSecondary}`}
            >
              <div className={styles.driverHeader}>
                <div
                  className={`${styles.driverIcon} ${styles.driverIconSecondary}`}
                >
                  📊
                </div>
                <div className={styles.driverTitle}>
                  OPTR Time-to-Value Optimization
                </div>
              </div>
              <div
                className={`${styles.driverValue} ${styles.driverValueSecondary}`}
              >
                $460M
              </div>
              <div className={styles.driverDesc}>
                <strong>Core Value:</strong> Proprietary OPTR diagnostic
                methodology creates measurable 20-40% improvement in execution
                velocity across enterprise deployments.
                <br />
                <br />
                <strong>Consulting Revenue:</strong> OPTR diagnostic services
                create additional revenue stream while demonstrating platform
                value to enterprise customers.
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.valuationBreakdown}>
            <h2
              className={`${styles.sectionTitle} ${styles.sectionTitleAccentGold}`}
            >
              $6.3B Valuation Breakdown
            </h2>

            <div className={styles.breakdownGrid}>
              <div className={styles.breakdownItem}>
                <div className={styles.breakdownValue}>$4.4B</div>
                <div className={styles.breakdownLabel}>
                  Regulated Market Enablement (70%)
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownValue}>$800M</div>
                <div className={styles.breakdownLabel}>
                  Platform Network Effects (13%)
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownValue}>$460M</div>
                <div className={styles.breakdownLabel}>
                  OPTR Optimization (7%)
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownValue}>$320M</div>
                <div className={styles.breakdownLabel}>
                  IP &amp; Technology Moat (5%)
                </div>
              </div>

              <div className={styles.breakdownItem}>
                <div className={styles.breakdownValue}>$320M</div>
                <div className={styles.breakdownLabel}>
                  Strategic Premium (5%)
                </div>
              </div>
            </div>

            <div className={styles.breakdownFooter}>
              <h3 className={styles.breakdownFooterTitle}>
                AWS Decision Continuity Index Multiplier
              </h3>
              <p className={styles.breakdownFooterBody}>
                Valuation based on AWS&apos;s strategic framework for measuring
                enterprise execution velocity and AI governance maturity.
                Bickford directly addresses core index metrics with measurable
                impact.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.riskFactors}>
            <h2 className={styles.sectionTitle}>
              Risk Factors &amp; Mitigation
            </h2>

            <div className={styles.riskGrid}>
              <div className={styles.riskCard}>
                <h4 className={styles.riskCardTitle}>⚠️ Regulatory Changes</h4>
                <p className={styles.riskCardBody}>
                  <strong>Risk:</strong> Changes in FedRAMP, HIPAA, or SEC
                  requirements could impact compliance value proposition.
                  <br />
                  <br />
                  <strong>Mitigation:</strong> Policy engine designed for
                  adaptability. Regulatory expertise team monitors changes
                  proactively.
                </p>
              </div>

              <div className={styles.riskCard}>
                <h4 className={styles.riskCardTitle}>
                  ⚠️ Competitive Response
                </h4>
                <p className={styles.riskCardBody}>
                  <strong>Risk:</strong> Microsoft, Google, or OpenAI could
                  develop competing enforcement layers.
                  <br />
                  <br />
                  <strong>Mitigation:</strong> Constitutional AI native design
                  creates significant technical moat. First-mover advantage in
                  regulated markets.
                </p>
              </div>

              <div className={styles.riskCard}>
                <h4 className={styles.riskCardTitle}>
                  ⚠️ Integration Complexity
                </h4>
                <p className={styles.riskCardBody}>
                  <strong>Risk:</strong> Enterprise integration could be more
                  complex than projected 12-week timeline.
                  <br />
                  <br />
                  <strong>Mitigation:</strong> Zero-touch middleware design
                  minimizes integration burden. Proven production validation.
                </p>
              </div>

              <div className={styles.riskCard}>
                <h4 className={styles.riskCardTitle}>
                  ⚠️ Market Adoption Rate
                </h4>
                <p className={styles.riskCardBody}>
                  <strong>Risk:</strong> Regulated market adoption of AI could
                  be slower than projected.
                  <br />
                  <br />
                  <strong>Mitigation:</strong> Enforcement infrastructure
                  accelerates adoption by removing compliance barriers. Pent-up
                  demand validated.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.conclusion}>
          <h3 className={styles.conclusionTitle}>
            Strategic Valuation Justification
          </h3>
          <p className={styles.conclusionBody}>
            The $6.3B valuation reflects Bickford&apos;s unique position as the
            enforcement layer that transforms Constitutional AI from
            training-time philosophy to runtime architectural guarantee. With
            70% of value driven by regulated market enablement and proven
            technical capabilities, this assessment represents conservative
            projections based on measurable market demand and demonstrated
            execution velocity improvements. The combination of Constitutional
            AI principles and cryptographic enforcement creates the only AI
            platform where compliance violations are architecturally
            impossible—a prerequisite for multi-billion-dollar regulated market
            deployments.
          </p>
        </div>
      </div>
    </div>
  );
}
