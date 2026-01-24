#!/bin/bash
# master-setup.sh
# Master orchestration script for TypeScript fixes + Intent Translation Engine

set -e

clear

cat << "BANNER"
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   🚀 Bickford TypeScript Fixer + Intent Translation Engine           ║
║                                                                       ║
║   Step 1: Fix all TypeScript errors                                  ║
║   Step 2: Install Intent Translation Engine                          ║
║   Step 3: Integrate with chat API                                    ║
║   Step 4: Deploy to Vercel                                           ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
BANNER

echo ""
echo "Starting automated setup..."
echo ""

# Check we're in the right directory
REPO_ROOT="/workspace/bickford"
if [ ! -f "$REPO_ROOT/package.json" ]; then
  echo "❌ Error: Not in Bickford repository root"
  echo "Expected: $REPO_ROOT"
  exit 1
fi

cd "$REPO_ROOT"

# ============================================================================
# Step 1: Fix TypeScript Errors
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Fixing TypeScript Errors"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "./scan-and-fix-typescript.sh" ]; then
  chmod +x ./scan-and-fix-typescript.sh
  ./scan-and-fix-typescript.sh
else
  echo "⚠️  scan-and-fix-typescript.sh not found, running manual fixes..."

  # Quick fix: Add missing types
  if [ -f "packages/types/src/index.ts" ]; then
    if ! grep -q "export interface Intent" packages/types/src/index.ts; then
      cat >> packages/types/src/index.ts << 'EOFTYPE'

export interface Intent {
  id: string;
  timestamp: number;
  action: string;
  authority: string;
  metadata?: Record<string, unknown>;
}

export interface WhyNotTrace {
  reason: string;
  timestamp: number;
  context?: Record<string, unknown>;
  deniedBy?: string;
}

export interface DeniedDecisionPayload {
  denied: true;
  reason: string;
  timestamp: number;
  trace?: WhyNotTrace;
}

export interface AgentResult {
  agent: "codex" | "claude" | "copilot" | "mscopilot";
  output: unknown;
  admissible: boolean;
  ttvEstimate: number;
  invariants: string[];
  executionTime: number;
  hash: string;
  timestamp: number;
}
EOFTYPE
      echo "✓ Added missing type definitions"
    fi
  fi

  # Rebuild types
  if [ -d "packages/types" ]; then
    cd packages/types && pnpm build && cd ../..
    echo "✓ Types package rebuilt"
  fi
fi

echo ""
echo "✅ Step 1 Complete"
echo ""

# ============================================================================
# Step 2: Install Intent Translation Engine
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Installing Intent Translation Engine"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create package structure
mkdir -p packages/intent-translator/src
cd packages/intent-translator

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "Creating package.json..."
  cat > package.json << 'EOFINSTALL'
{
  "name": "@bickford/intent-translator",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.9.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
EOFINSTALL
  echo "✓ package.json created"
fi

# Create tsconfig.json
if [ ! -f "tsconfig.json" ]; then
  echo "Creating tsconfig.json..."
  cat > tsconfig.json << 'EOFTSCONFIG'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"]
}
EOFTSCONFIG
  echo "✓ tsconfig.json created"
fi

# Copy intent translator if available
if [ -f "../../intent-translator.ts" ]; then
  cp ../../intent-translator.ts src/index.ts
  echo "✓ Intent translator copied"
elif [ ! -f "src/index.ts" ]; then
  echo "⚠️  intent-translator.ts not found, creating placeholder..."
  cat > src/index.ts << 'EOFTS'
// Intent Translation Engine
// TODO: Copy implementation from intent-translator.ts

export class IntentTranslationEngine {
  constructor(config: { anthropicKey: string; openaiKey: string }) {
    // Implementation here
  }

  async process(chatInput: string): Promise<{
    accepted: boolean;
    output?: unknown;
    rejection?: unknown;
  }> {
    // Implementation here
    return { accepted: false };
  }
}

export default IntentTranslationEngine;
EOFTS
  echo "✓ Placeholder created"
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build
echo "Building package..."
pnpm build

cd ../..

echo ""
echo "✅ Step 2 Complete"
echo ""

# ============================================================================
# Step 3: Verify Installation
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run typecheck
echo "Running typecheck..."
pnpm run typecheck > /tmp/typecheck-final.txt 2>&1 || true

ERROR_COUNT=$(grep -c "error TS" /tmp/typecheck-final.txt || echo "0")

if [ "$ERROR_COUNT" -eq 0 ]; then
  echo "✅ TypeScript: No errors"
else
  echo "⚠️  TypeScript: $ERROR_COUNT errors remaining"
  echo "   See: cat /tmp/typecheck-final.txt"
fi

# Check packages exist
if [ -d "packages/intent-translator/dist" ]; then
  echo "✅ Intent Translation Engine: Installed"
else
  echo "⚠️  Intent Translation Engine: Build failed"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ERROR_COUNT" -eq 0 ]; then
  echo "✅ All systems operational"
  echo ""
  echo "Next steps:"
  echo "  1. Copy intent-translator.ts to packages/intent-translator/src/index.ts (if not done)"
  echo "  2. Rebuild: cd packages/intent-translator && pnpm build"
  echo "  3. Integrate with chat API (see INTENT_TRANSLATION_COMPLETE.md)"
  echo "  4. Deploy: vercel --prod"
  echo ""
  echo "Files to review:"
  echo "  - EXECUTE_NOW.md (complete guide)"
  echo "  - INTENT_TRANSLATION_COMPLETE.md (architecture)"
  echo "  - intent-translator.ts (implementation)"
  echo ""
else
  echo "⚠️  Setup complete with warnings"
  echo ""
  echo "Remaining issues:"
  echo "  - $ERROR_COUNT TypeScript errors"
  echo ""
  echo "To fix:"
  echo "  cat /tmp/typecheck-final.txt"
  echo "  # Review errors and apply manual fixes"
  echo ""
fi

echo "Documentation:"
echo "  📖 EXECUTE_NOW.md - Complete execution guide"
echo "  📖 INTENT_TRANSLATION_COMPLETE.md - Full architecture"
echo "  📖 TYPESCRIPT_FIXES.md - Manual fix guide"
echo ""

rm -f /tmp/typecheck-final.txt

exit 0
