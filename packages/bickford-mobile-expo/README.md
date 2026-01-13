# Bickford Mobile (Expo/EAS)

This package exists specifically to produce a native iOS build for App Store review.

## What this fixes (Apple)
- **2.3.8 App icon**: generates a compliant `1024x1024` PNG (no transparency) at `assets/icon.png`.
- **iPad note**: `ios.supportsTablet` is set to `false` to avoid iPad installs until tablet support is validated.
- **Crash Prevention**: Comprehensive error recovery system prevents SIGABRT crashes (see [CRASH_PREVENTION.md](./CRASH_PREVENTION.md))

## Crash Prevention

This app includes a comprehensive crash prevention system that addresses:

- SIGABRT crashes from uncaught Objective-C exceptions
- Expo error recovery queue failures
- React component errors
- Unhandled promise rejections

**See [CRASH_PREVENTION.md](./CRASH_PREVENTION.md) for full documentation.**

Key components:
- `ErrorBoundary` - Catches React errors
- `errorRecovery.ts` - Safe wrappers for operations
- `errorLogger.ts` - Centralized error logging
- `withCrashGuard.ts` - Native-level crash guard plugin

## Commands

From repo root:

```bash
npm -w packages/bickford-mobile-expo run prebuild
npm -w packages/bickford-mobile-expo run eas:build:ios
```

Or from within the package folder:

```bash
npm install
npm run prebuild
npm run eas:build:ios
```

## Notes
- The icon is generated automatically via `postinstall`.
- Replace `ios.bundleIdentifier` in `app.json` if your App Store Connect bundle id differs.
- Error recovery is initialized automatically on app launch.
- See [CRASH_PREVENTION.md](./CRASH_PREVENTION.md) for crash prevention best practices.

