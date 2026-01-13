#!/bin/bash
set -e

# This script adds native crash guards to the iOS AppDelegate after prebuild
# It prevents SIGABRT crashes from uncaught Objective-C exceptions

IOS_DIR="ios"
APP_DELEGATE="$IOS_DIR/bickford/AppDelegate.mm"

if [ ! -f "$APP_DELEGATE" ]; then
  echo "⚠️  Warning: AppDelegate.mm not found at $APP_DELEGATE"
  echo "This script should be run after 'expo prebuild'"
  exit 0
fi

# Check if crash guard is already installed
if grep -q "CRASH_GUARD_START" "$APP_DELEGATE"; then
  echo "✅ Crash guard already installed in AppDelegate"
  exit 0
fi

echo "🛡️  Installing native crash guard in AppDelegate..."

# Create backup
cp "$APP_DELEGATE" "$APP_DELEGATE.backup"

# Add crash guard around didFinishLaunchingWithOptions
# Find the method and wrap its content in @try/@catch
perl -i -pe '
  if (/- \(BOOL\)application:\(UIApplication \*\)application didFinishLaunchingWithOptions:\(NSDictionary \*\)launchOptions/) {
    $_ .= "{\n  // CRASH_GUARD_START: Prevent uncaught Objective-C exceptions from causing SIGABRT\n  @try {\n";
    $in_method = 1;
  }
  if ($in_method && /^}/) {
    $_ = "  } @catch (NSException *exception) {\n    NSLog(@\"[CrashGuard] Fatal exception caught: %@\", exception);\n    NSLog(@\"[CrashGuard] Stack: %@\", [exception callStackSymbols]);\n  }\n  // CRASH_GUARD_END\n" . $_;
    $in_method = 0;
  }
' "$APP_DELEGATE"

echo "✅ Native crash guard installed successfully"
echo "📝 Backup saved to $APP_DELEGATE.backup"
