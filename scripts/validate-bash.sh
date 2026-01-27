#!/bin/bash

# Bickford Build Validation (Bash version)
# For environments without Bun installed

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        Bickford Acquisition Package Validation            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PASS=0
FAIL=0
WARN=0

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $2"
        ((PASS++))
    else
        echo "❌ $2 - Missing: $1"
        ((FAIL++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $2"
        ((PASS++))
    else
        echo "⚠️  $2 - Will be created: $1"
        ((WARN++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TECHNICAL ASSETS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "bickford-intelligence/packages/core/claude-enforcer.ts" "Core enforcer"
check_file "bickford-intelligence/packages/demo/claude-comparison.ts" "Demo: Claude comparison"
check_file "bickford-intelligence/packages/demo/compliance-demo.ts" "Demo: Compliance artifacts"
check_file "bickford-intelligence/packages/demo/regulator-demo.ts" "Demo: Regulator verification"
check_file "package.json" "Package configuration"
check_file "scripts/complete-build.ts" "Build automation"
check_file "scripts/validate-build.ts" "Validation script"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STRATEGIC DOCUMENTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "docs/ACQUISITION_PACKAGE_ENHANCED.md" "Anthropic acquisition package (PRIMARY)"
check_file "docs/BOARD_PRESENTATION_DRIFT_FOCUSED.md" "Board presentation deck"
check_file "docs/ONE_PAGE_SUMMARY.md" "One-page executive summary"
check_file "docs/ACQUISITION_PACKAGE.md" "Generic acquisition package"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "EXECUTION MATERIALS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "docs/EXECUTION_TRACKER.md" "Week-by-week tracker"
check_file "docs/OUTREACH_EMAIL_TEMPLATES.md" "Email templates"
check_file "docs/DEMO_NARRATION_SCRIPT.md" "Demo recording script"
check_file "docs/QA_PREPARATION.md" "Q&A preparation"
check_file "docs/MASTER_CHECKLIST.md" "Master checklist"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DEMO READINESS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_dir "artifacts" "Artifacts directory"
check_dir "demo-outputs" "Demo outputs directory"
check_file "README.md" "Main README"
check_file "demo-runner.sh" "Demo runner script"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   Validation Summary                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Passed: $PASS"
echo "⚠️  Warnings: $WARN"
echo "❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ] && [ $WARN -eq 0 ]; then
    echo "🎉 ALL SYSTEMS GO - Ready for executive demo and acquisition pitch!"
    echo ""
    echo "Next steps:"
    echo "  1. Install Bun: curl -fsSL https://bun.sh/install | bash"
    echo "  2. Run: bun run build:evidence"
    echo "  3. Record demo video (use docs/DEMO_NARRATION_SCRIPT.md)"
    echo "  4. Send outreach (use docs/OUTREACH_EMAIL_TEMPLATES.md)"
    exit 0
elif [ $FAIL -eq 0 ]; then
    echo "✅ Core systems operational with some warnings"
    echo "Review warnings above - most will be auto-created on first run"
    echo ""
    echo "Install Bun to proceed: curl -fsSL https://bun.sh/install | bash"
    exit 0
else
    echo "❌ Critical files missing"
    echo "This repository may be incomplete or corrupted"
    exit 1
fi
