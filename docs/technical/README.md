## Technical Documentation

This folder contains technical specifications, architecture, and integration guides.

### Documents

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and specifications
  - High-level architecture
  - Event schema definitions
  - Deployment models
  - Performance characteristics
  - Security & compliance

- **[DEMO_GUIDE.md](DEMO_GUIDE.md)** - Demonstration scripts
  - Demo 1: Dogfooding proof (5 min)
  - Demo 2: AWS threat simulation (7 min)
  - Demo 3: Integration speed (10 min)

- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Implementation instructions
  - OpenAI API integration
  - ChatGPT web integration
  - Agent framework integrations
  - Configuration reference
  - Troubleshooting

- **[RUNTIME_COMMERCIALIZATION_PATTERNS.md](RUNTIME_COMMERCIALIZATION_PATTERNS.md)** - How execution-governance runtimes are sold
  - Acquisition / defensive primitive
  - Self-hosted enterprise license + support
  - Managed service packaging
  - Defense + regulated procurement hooks

- **[BID_AUTOMATION_WORKFLOW.md](BID_AUTOMATION_WORKFLOW.md)** - Automated bid pack + submission workflow
  - Generates `bid_out/` with manifest + hashes
  - Defines the human-in-the-loop CAC/attestation boundary
  - Provides a repeatable review and evidence-capture process

- **[SAMGOV_INTEGRATION.md](SAMGOV_INTEGRATION.md)** - Query SAM.gov via Public API Key
  - Search opportunities
  - Fetch notice metadata into `bid_out/`

- **[SAMGOV_SCORING.md](SAMGOV_SCORING.md)** - Score opportunities (0–100) + generate email drafts
  - Configurable rubric + profile-driven keyword matching
  - Produces `.eml` drafts and `send_queue.json` for high-score items

### Technical Highlights

| Specification | Value |
|---------------|-------|
| Throughput | 100,000 events/sec |
| Latency | <5ms p99 |
| Integration Complexity | 3 lines of code |
| Deployment Time | <10 minutes |
| Uptime SLA | 99.95% |
