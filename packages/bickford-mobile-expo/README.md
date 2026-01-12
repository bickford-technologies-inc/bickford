# Bickford Mobile (Expo/EAS)

This package exists specifically to produce a native iOS build for App Store review.

## What this fixes (Apple)
- **2.3.8 App icon**: generates a compliant `1024x1024` PNG (no transparency) at `assets/icon.png`.
- **iPad note**: `ios.supportsTablet` is set to `false` to avoid iPad installs until tablet support is validated.

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
