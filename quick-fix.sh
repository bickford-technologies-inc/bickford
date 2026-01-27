#!/bin/bash
# ONE-COMMAND FIX for Claude Model Names
# Run this to fix all files at once

echo "🔧 Fixing all Claude model names..."
echo ""

find /workspaces/bickford -name "*.ts" -o -name "*.js" | while read file; do
    if grep -q "claude-3-sonnet-20250514\|claude-sonnet-4-20250514\|claude-sonnet-4-5-20250929" "$file" 2>/dev/null; then
        echo "Fixing: $file"
        sed -i \
            -e 's/claude-3-sonnet-20250514/claude-3-5-sonnet-20241022/g' \
            -e 's/claude-sonnet-4-20250514/claude-3-5-sonnet-20241022/g' \
            -e 's/claude-sonnet-4-5-20250929/claude-3-5-sonnet-20241022/g' \
            "$file"
        echo "  ✅ Fixed"
    fi
done

echo ""
echo "✅ All model names updated to: claude-3-5-sonnet-20241022"
echo ""
echo "Now run your demos:"
echo "  cd /workspaces/bickford"
echo "  ./demo-runner.sh"
echo ""
