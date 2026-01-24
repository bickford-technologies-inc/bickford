#!/bin/bash
# Quick PR review

echo "═══════════════════════════════════════════════════════════════════"
echo "🔍 PR Dashboard - $(date)"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

PRS=$(gh pr list --json number,title,author,isDraft,reviewDecision,statusCheckRollup,createdAt,updatedAt)
TOTAL=$(echo "$PRS" | jq '. | length')

if [ "$TOTAL" -eq 0 ]; then
    echo "✅ No open PRs"
    exit 0
fi

echo "📊 Summary"
echo "Total PRs: $TOTAL"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Ready to Merge (Approved + CI Passing)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$PRS" | jq -r '.[] | select(.isDraft == false and .reviewDecision == "APPROVED" and (.statusCheckRollup == null or .statusCheckRollup[0].state == "SUCCESS")) | "#\(.number): \(.title) (by @\(.author.login))"'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👀 Needs Review"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$PRS" | jq -r '.[] | select(.isDraft == false and (.reviewDecision == null or .reviewDecision == "REVIEW_REQUIRED")) | "#\(.number): \(.title) (by @\(.author.login))"'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ Failing CI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$PRS" | jq -r '.[] | select(.statusCheckRollup != null and .statusCheckRollup[0].state == "FAILURE") | "#\(.number): \(.title) (by @\(.author.login))"'
echo ""
