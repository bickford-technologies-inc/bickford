#!/usr/bin/env bash
set -e

echo "🔧 Bickford Environment Setup"
echo "=============================="
echo ""

# Check if running in Codespaces
if [ -n "$CODESPACE_NAME" ]; then
  echo "✅ Detected GitHub Codespaces environment"
  echo ""
fi

# Setup packages/bickford/.env
ENV_FILE="packages/bickford/.env"
if [ -f "$ENV_FILE" ]; then
  echo "⚠️  $ENV_FILE already exists"
  read -p "Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping .env creation"
  else
    cp packages/bickford/.env.example "$ENV_FILE"
    echo "✅ Created $ENV_FILE from template"
  fi
else
  cp packages/bickford/.env.example "$ENV_FILE"
  echo "✅ Created $ENV_FILE from template"
fi

# Check for OPENAI_API_KEY
if [ -z "$OPENAI_API_KEY" ]; then
  echo ""
  echo "⚠️  OPENAI_API_KEY not found in environment"
  echo "   Get your key from: https://platform.openai.com/api-keys"
  echo ""
  read -p "Enter your OpenAI API key (or press Enter to skip): " api_key
  
  if [ -n "$api_key" ]; then
    # Update .env file
    if grep -q "^OPENAI_API_KEY=" "$ENV_FILE"; then
      sed -i.bak "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$api_key|" "$ENV_FILE"
      rm -f "$ENV_FILE.bak"
    else
      echo "OPENAI_API_KEY=$api_key" >> "$ENV_FILE"
    fi
    echo "✅ Saved OPENAI_API_KEY to $ENV_FILE"
  else
    echo "⏭️  Skipping OpenAI setup (demo mode will be used)"
  fi
else
  echo "✅ OPENAI_API_KEY found in environment"
  if grep -q "^OPENAI_API_KEY=" "$ENV_FILE"; then
    sed -i.bak "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|" "$ENV_FILE"
    rm -f "$ENV_FILE.bak"
    echo "✅ Auto-configured OPENAI_API_KEY in $ENV_FILE"
  fi
fi

# Function to update or add env var
update_env_var() {
  local key=$1
  local value=$2
  local file=$3
  
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
    rm -f "${file}.bak"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

# Authorization Configuration
echo ""
echo "🔒 Authorization Configuration"
echo "   Permissive: Always allow (default) - best for development"
echo "   Audit: Log denials but allow - best for testing auth rules"
echo "   Enforce: Block denied requests - best for production"
echo ""
read -p "Authorization mode (permissive/audit/enforce) [permissive]: " auth_mode
auth_mode=${auth_mode:-permissive}

# Validate
if [[ ! "$auth_mode" =~ ^(permissive|audit|enforce)$ ]]; then
  echo "⚠️  Invalid mode, defaulting to permissive"
  auth_mode="permissive"
fi

# Add to .env file
update_env_var "AUTH_DECISION_MODE" "$auth_mode" "$ENV_FILE"
echo "✅ Authorization mode: $auth_mode"

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev:api    # Start backend"
echo "  3. npm run dev:web    # Start frontend"
echo ""
