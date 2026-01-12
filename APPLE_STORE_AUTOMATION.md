# Apple Store Connect Automation Setup

This guide explains how to automate iOS app builds and submissions to Apple Store Connect using GitHub Actions and Expo Application Services (EAS).

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Enrolled in the Apple Developer Program
   - Have access to App Store Connect

2. **App Store Connect App**
   - Create your app in App Store Connect
   - Note your App ID (numeric, e.g., `1234567890`)

3. **Expo Account**
   - Sign up at https://expo.dev
   - Install EAS CLI: `npm install -g eas-cli`

## Step 1: Configure Apple Credentials

### 1.1 Generate App-Specific Password

1. Go to https://appleid.apple.com/account/manage
2. Sign in with your Apple ID
3. In the **Security** section, click **Generate Password** under **App-Specific Passwords**
4. Label it "EAS Build" or similar
5. **Copy and save** the generated password (you won't see it again)

### 1.2 Get Your Team ID

1. Go to https://developer.apple.com/account
2. Click **Membership** in the sidebar
3. Note your **Team ID** (e.g., `AB1C2D3E4F`)

### 1.3 Get Your App Store Connect App ID

1. Go to https://appstoreconnect.apple.com
2. Navigate to **My Apps**
3. Select your app
4. In the **App Information** section, find **Apple ID** (numeric ID like `1234567890`)

## Step 2: Configure Expo

### 2.1 Login to Expo

```bash
cd packages/bickford-mobile-expo
npx eas-cli login
```

### 2.2 Configure EAS Project

```bash
npx eas-cli build:configure
```

This will link your project to your Expo account.

### 2.3 Set Up iOS Credentials

```bash
npx eas-cli credentials
```

Select:
- Platform: **iOS**
- Action: **Set up Apple credentials**
- Follow prompts to enter:
  - Apple ID (your developer email)
  - App-Specific Password (from Step 1.1)
  - Team ID (from Step 1.2)

## Step 3: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

### 3.1 Go to Repository Settings

1. Navigate to: `https://github.com/YOUR_ORG/YOUR_REPO/settings/secrets/actions`
2. Click **New repository secret**

### 3.2 Add Required Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `EXPO_TOKEN` | Expo access token for CI/CD | Generate at https://expo.dev/accounts/[account]/settings/access-tokens |
| `EXPO_APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from Apple | From Step 1.1 |

#### Generating EXPO_TOKEN:

1. Go to https://expo.dev/accounts/[your-username]/settings/access-tokens
2. Click **Create Token**
3. Name it "GitHub Actions CI/CD"
4. Copy the token and add it as `EXPO_TOKEN` in GitHub secrets

### 3.3 Configure Repository Variables

Add the following variables to your GitHub repository:

1. Navigate to: `https://github.com/YOUR_ORG/YOUR_REPO/settings/variables/actions`
2. Click **New repository variable**

| Variable Name | Value |
|--------------|-------|
| `APPLE_ID` | Your Apple ID email |
| `ASC_APP_ID` | Your App Store Connect App ID (numeric) |
| `APPLE_TEAM_ID` | Your Apple Developer Team ID |

Or, you can use secrets for these if you prefer to keep them private.

## Step 4: Update Environment Variables

Create or update `packages/bickford-mobile-expo/.env`:

```bash
# Apple Developer Configuration
APPLE_ID=your.email@example.com
ASC_APP_ID=1234567890
APPLE_TEAM_ID=AB1C2D3E4F
```

Add this to `.gitignore` if it contains sensitive data.

## Step 5: Test the Build Locally

### 5.1 Test iOS Build

```bash
cd packages/bickford-mobile-expo
npm run eas:build:ios
```

This will:
- Upload your app to EAS servers
- Build the iOS app in the cloud
- Provide a download link when complete

### 5.2 Test Submission

```bash
npm run eas:submit:ios
```

This will submit the most recent build to App Store Connect.

## Step 6: Automated Workflow

The GitHub Actions workflow (`.github/workflows/ios-deploy.yml`) will automatically:

### 6.1 Trigger Conditions

- **Automatic**: When code is pushed to `main` branch and mobile app files change
- **Manual**: Via GitHub Actions UI (workflow_dispatch)

### 6.2 What It Does

1. ✅ Checks out code
2. ✅ Sets up Node.js and Expo/EAS
3. ✅ Installs dependencies
4. ✅ Builds iOS app with EAS (using Apple credentials)
5. ✅ Submits to App Store Connect
6. ✅ Notifies on completion

### 6.3 Manual Trigger

To manually trigger a build and submission:

1. Go to: `https://github.com/YOUR_ORG/YOUR_REPO/actions`
2. Select **iOS Build & Submit to App Store**
3. Click **Run workflow**
4. Choose environment (production or staging)
5. Click **Run workflow**

## Step 7: Monitor Submissions

### 7.1 Check EAS Dashboard

Monitor build progress:
```
https://expo.dev/accounts/[account]/projects/bickford/builds
```

### 7.2 Check App Store Connect

Monitor submission status:
```
https://appstoreconnect.apple.com/apps/[your-app-id]/appstore
```

Statuses you'll see:
- **Waiting for Review**: Submitted successfully
- **In Review**: Apple is reviewing your app
- **Ready for Sale**: Approved and live
- **Rejected**: Needs changes

## Troubleshooting

### Issue: "Could not authenticate"

**Solution**: Regenerate your Expo token and update `EXPO_TOKEN` secret.

### Issue: "Apple credentials not configured"

**Solution**: Run `eas credentials` locally to set up Apple credentials with Expo.

### Issue: "Build failed"

**Solution**: Check EAS build logs at https://expo.dev/accounts/[account]/projects/bickford/builds

### Issue: "Invalid App-Specific Password"

**Solution**: Generate a new app-specific password at https://appleid.apple.com and update the secret.

## Manual Commands Reference

```bash
# Login to Expo
npx eas-cli login

# Configure Apple credentials
npx eas-cli credentials

# Build iOS app
npm run eas:build:ios

# Submit to App Store
npm run eas:submit:ios

# Check build status
npx eas-cli build:list

# View credentials
npx eas-cli credentials
```

## Advanced Configuration

### Custom Build Profiles

Edit `packages/bickford-mobile-expo/eas.json`:

```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "buildConfiguration": "Release",
        "distribution": "store"
      }
    },
    "staging": {
      "ios": {
        "resourceClass": "m-medium", 
        "buildConfiguration": "Release",
        "distribution": "internal"
      }
    }
  }
}
```

### TestFlight Distribution

To distribute via TestFlight instead of App Store:

```json
{
  "build": {
    "staging": {
      "ios": {
        "distribution": "internal"
      }
    }
  }
}
```

## Cost Considerations

- **Apple Developer Program**: $99/year
- **EAS Build**: Free tier includes limited builds/month
  - Production apps: Consider EAS Production plan ($99/month)
  - See pricing: https://expo.dev/pricing

## Security Best Practices

1. ✅ Never commit API keys or passwords to git
2. ✅ Use GitHub secrets for sensitive data
3. ✅ Rotate App-Specific Passwords periodically
4. ✅ Use separate credentials for staging and production
5. ✅ Enable 2FA on all accounts (Apple, Expo, GitHub)

## Complete Workflow

```
Developer pushes to main
         ↓
GitHub Actions triggered
         ↓
Build iOS app with EAS (cloud)
         ↓
Submit to App Store Connect
         ↓
Apple reviews app
         ↓
App goes live (or TestFlight)
```

## Next Steps

After setup:
1. ✅ Test manual build: `npm run eas:build:ios`
2. ✅ Test manual submit: `npm run eas:submit:ios`
3. ✅ Push to main to trigger automatic build
4. ✅ Monitor App Store Connect for review status

## Support

- **Expo Docs**: https://docs.expo.dev/eas/
- **Apple Developer**: https://developer.apple.com/support/
- **App Store Connect**: https://appstoreconnect.apple.com

---

**Note**: First build may take longer (20-30 minutes) as dependencies are cached. Subsequent builds are faster (10-15 minutes).
