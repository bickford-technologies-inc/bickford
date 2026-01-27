#!/bin/bash
# Quick demo runner for Bickford Acquisition Package

set -e

# Run all demos and capture outputs
echo "Running Claude Comparison Demo..."
bun run bickford-intelligence/packages/demo/claude-comparison.ts > demo-outputs/claude-comparison.txt

echo "Running Compliance Demo..."
bun run bickford-intelligence/packages/demo/compliance-demo.ts > demo-outputs/compliance-demo.txt

echo "Running Regulator Demo..."
bun run bickford-intelligence/packages/demo/regulator-demo.ts > demo-outputs/regulator-demo.txt

echo "Running Adversarial Demo..."
bun run bickford-intelligence/packages/demo/adversarial-demo.ts

echo "Running Multi-Policy Demo..."
bun run bickford-intelligence/packages/demo/multi-policy-demo.ts

echo "Running Edge Case Demo..."
bun run bickford-intelligence/packages/demo/edgecase-demo.ts

echo "Running Batch Demo..."
bun run bickford-intelligence/packages/demo/batch-demo.ts

echo "Running Tamper Detection Demo..."
bun run bickford-intelligence/packages/demo/tamper-demo.ts

echo "Running Policy Update Demo..."
bun run bickford-intelligence/packages/demo/policy-update-demo.ts

echo "All demos complete. Outputs in demo-outputs/"
