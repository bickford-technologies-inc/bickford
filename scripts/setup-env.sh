#!/usr/bin/env bash
set -euo pipefail

trap 'echo "❌ Setup failed on line $LINENO"; exit 1' ERR

echo "🔧 Bickford Environment Setup"
echo "=============================="
echo ""

ENV_FILE="packages/bickford/.env"
ENV_EXAMPLE="packages/bickford/.env.example"

# Cross-platform sed function
update_env_var() {
  local key=$1
  local value=$2
  local file=$3
  
  local escaped_value=$(printf '%s\n' "$value" | sed 's/[&/\]/\\&/g')
  
  if command -v perl &> /dev/null; then
    perl -i -pe "s|^${key}=.*|${key}=${escaped_value}|" "$file"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^${key}=.*|${key}=${escaped_value}|" "$file"
  else
    sed -i "s|^${key}=.*|${key}=${escaped_value}|" "$file"
  fi
}

# Create packages dir if needed
mkdir -p packages/bickford

# Ensure .env.example exists
if [ ! -f "$ENV_EXAMPLE" ]; then
  cat > "$ENV_EXAMPLE" << 'ENVEOF'
# Bickford Environment Configuration
AUTH_MODE=none

# OpenAI Configuration (optional - enables smart chat replies)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TIMEOUT_MS=15000
ENVEOF
  echo "✅ Created $ENV_EXAMPLE"
fi

# Create packages dir if needed
mkdir -p packages/bickford

# Check if .env exists
if [ -f "$ENV_FILE" ]; then
  echo "✅ $ENV_FILE already exists"
  
  # Update OPENAI_API_KEY if it's empty and env var is set
  if [ -n "${OPENAI_API_KEY:-}" ]; then
    if grep -q "^OPENAI_API_KEY=$" "$ENV_FILE" 2>/dev/null; then
      update_env_var "OPENAI_API_KEY" "$OPENAI_API_KEY" "$ENV_FILE"
  if [ -n "$OPENAI_API_KEY" ]; then
    if ! grep -q "^OPENAI_API_KEY=.\+" "$ENV_FILE" 2>/dev/null; then
      sed -i.bak "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|" "$ENV_FILE"
      rm -f "$ENV_FILE.bak"
      echo "✅ Auto-configured OPENAI_API_KEY from environment"
    fi
  fi
else
  # Create from example
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "✅ Created $ENV_FILE from template"
  
  # Auto-configure if env var is set
  if [ -n "${OPENAI_API_KEY:-}" ]; then
    update_env_var "OPENAI_API_KEY" "$OPENAI_API_KEY" "$ENV_FILE"
    echo "✅ Auto-configured OPENAI_API_KEY from environment"
  fi
fi

# Interactive prompt only if not automated and key is missing
if [ -z "${CI:-}" ] && [ -z "${CODESPACE_NAME:-}" ]; then
  if ! grep -q "^OPENAI_API_KEY=sk-" "$ENV_FILE" 2>/dev/null; then
  # Create from example or template
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "✅ Created $ENV_FILE from template"
  else
    # Create minimal .env for quick start (no external dependencies)
    # For full production config with JWT/Redis/PostgreSQL, copy from .env.example
    cat > "$ENV_FILE" << 'ENVEOF'
# Bickford Environment Configuration
AUTH_MODE=none

# OpenAI Configuration (optional)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TIMEOUT_MS=15000
ENVEOF
    echo "✅ Created $ENV_FILE"
  fi
  
  # Auto-configure if env var is set
  if [ -n "$OPENAI_API_KEY" ]; then
    sed -i.bak "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|" "$ENV_FILE"
    rm -f "$ENV_FILE.bak"
    echo "✅ Auto-configured OPENAI_API_KEY from environment"
  fi
fi

# Interactive prompt only if not automated and key is missing
if [ -z "$CI" ] && [ -z "$CODESPACE_NAME" ]; then
  if ! grep -q "^OPENAI_API_KEY=.\+" "$ENV_FILE" 2>/dev/null; then
    echo ""
    echo "📝 OpenAI Configuration (Optional)"
    echo "   Without a key, chat will work in demo mode."
    echo "   Get your key from: https://platform.openai.com/api-keys"
    echo ""
    read -p "Enter your OpenAI API key (or press Enter to skip): " api_key

    if [ -n "$api_key" ]; then
      # Validate key format
      if [[ ! "$api_key" =~ ^sk-[a-zA-Z0-9_\-]+ ]]; then
        echo "⚠️  Warning: API key doesn't match expected format (sk-...)"
        read -p "Continue anyway? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
          echo "❌ Setup cancelled"
          exit 1
        fi
      fi
      
      update_env_var "OPENAI_API_KEY" "$api_key" "$ENV_FILE"
    
    if [ -n "$api_key" ]; then
      sed -i.bak "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=$api_key|" "$ENV_FILE"
      rm -f "$ENV_FILE.bak"
      echo "✅ Saved OPENAI_API_KEY to $ENV_FILE"
    else
      echo "⏭️  Skipping OpenAI setup (demo mode enabled)"
    fi
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
echo "✅ Setup complete!"
echo ""
echo "🚀 Start the app:"
echo "   npm start    # Automatic (both services)"
echo "   npm run dev  # Alternative"
echo "   npm run dev  # Alternative (uses concurrently)"
echo ""
