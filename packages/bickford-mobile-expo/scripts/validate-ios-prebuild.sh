#!/bin/bash
set -e

echo "🔍 Validating iOS build configuration..."

# Check icon exists and is correct size
ICON_PATH="assets/icon.png"
if [ ! -f "$ICON_PATH" ]; then
  echo "❌ Error: Icon not found at $ICON_PATH"
  exit 1
fi

# Try to validate icon size if identify is available
if command -v identify &> /dev/null; then
  if ICON_SIZE=$(identify -format "%wx%h" "$ICON_PATH" 2>&1); then
    if [ "$ICON_SIZE" != "1024x1024" ]; then
      echo "❌ Error: Icon must be 1024x1024, found $ICON_SIZE"
      exit 1
    else
      echo "✅ Icon validation passed (1024x1024)"
    fi
  else
    echo "⚠️  Warning: Could not read icon with ImageMagick, skipping size validation"
  fi
else
  # Fallback: just check file exists and is a PNG
  if file "$ICON_PATH" | grep -q "PNG image data"; then
    echo "✅ Icon exists and is a PNG (size check skipped - ImageMagick not installed)"
  else
    echo "❌ Error: Icon must be a PNG file"
    exit 1
  fi
fi

# Check app.json has correct iPad exclusion (flexible whitespace)
if ! grep -E '"supportsTablet"\s*:\s*false' app.json > /dev/null; then
  echo "❌ Error: app.json must have 'supportsTablet: false'"
  exit 1
fi

echo "✅ iPad exclusion validated"
echo "✅ All pre-build checks passed"
