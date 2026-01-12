# Netlify Setup Guide

## Required Environment Variables

### Sentry (Error Tracking)
- `SENTRY_ORG` - Your Sentry organization slug
- `SENTRY_PROJECT` - Your Sentry project name
- `SENTRY_AUTH_TOKEN` - Sentry API token for source map uploads

### Visual Diff (via Applitools Eyes)
- `APPLITOOLS_API_KEY` - API key from eyes.applitools.com
  - Used by `netlify-plugin-visual-diff` for visual regression testing
  - Automatically captures screenshots across browsers and responsive widths

### Snaplet (Preview Databases)
- `SNAPLET_ACCESS_TOKEN` - Snaplet API token
- `DATABASE_URL` - Production database connection string (for snapshots)

## Setup Steps

1. **Install Netlify CLI**: `npm install -g netlify-cli`
2. **Link project**: `netlify link`
3. **Set environment variables**:
   ```bash
   netlify env:set SENTRY_ORG "your-org"
   netlify env:set SENTRY_PROJECT "bickford-web"
   netlify env:set SENTRY_AUTH_TOKEN "your-token"
   netlify env:set APPLITOOLS_API_KEY "your-key"
   netlify env:set SNAPLET_ACCESS_TOKEN "your-token"
   netlify env:set DATABASE_URL "postgresql://..."
   ```
4. **Test build locally**: `netlify build`
5. **Deploy**: `netlify deploy --prod`

## Plugin Behavior

### Auto-Approval (Visual Diff)
- Changes <5% layout shift: **AUTO-APPROVE**
- Changes >5% layout shift: **MANUAL REVIEW REQUIRED**
- No visual changes: **AUTO-APPROVE**

### Performance Coaching (Lighthouse)
- Runs after every build
- Fails build if performance <50
- Reports available in Netlify UI

### Preview Databases (Snaplet)
- Each PR gets isolated database
- Production data anonymized
- Auto-cleanup after PR merge

### Build Cache (Debug Cache)
- Provides transparency into what persists between builds
- Helps diagnose cache-related issues
- Shows cache contents in build logs

### Link Validation (Checklinks)
- Validates all internal links
- Validates external links
- Fails build if broken links detected
- Provides actionable error messages

### Contextual Environment (Contextual Env)
- Automatically switches environment variables by branch
- Prefixes: `VITE_` for frontend variables
- Production branch uses production values
- Preview branches use preview values
- Local development uses local values

## Netlify Configuration

The main configuration file is `netlify.toml` at the repository root.

### Build Settings

```toml
[build]
  base = "."
  publish = "packages/web-ui/dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "22.12.0"
  NPM_FLAGS = "--legacy-peer-deps"
```

### Redirects

API requests are redirected to Netlify Functions:

```toml
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Security Headers

Security headers are automatically applied to all pages:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Testing Locally

### Prerequisites

Install Netlify CLI:
```bash
npm install -g netlify-cli
```

### Link Your Project

```bash
netlify link
```

Follow the prompts to connect your local repository to your Netlify site.

### Test Build

```bash
netlify build
```

This runs the build with all plugins enabled, just like in production.

### Test Deploy (Draft)

```bash
netlify deploy
```

This creates a draft deploy URL for testing.

### Deploy to Production

```bash
netlify deploy --prod
```

## Troubleshooting

### Plugin Failures

If a plugin fails, check the build logs for details:

```bash
netlify build --debug
```

### Environment Variables

List all environment variables:

```bash
netlify env:list
```

Get a specific variable:

```bash
netlify env:get SENTRY_ORG
```

### Cache Issues

Clear the Netlify cache:

```bash
netlify build --clear-cache
```

### Link Validation Errors

If link validation fails:
1. Check the build log for the specific broken link
2. Fix the link in your code
3. Rebuild

To temporarily skip link validation (not recommended):
```toml
[[plugins]]
  package = "netlify-plugin-checklinks"
  [plugins.inputs]
    skipPatterns = ["/admin/*", "/internal/*"]
```

## Expected Outcomes

### 80% Auto-Approval Rate
Visual diff should automatically approve most changes, reducing manual review overhead.

### Build Observability
Lighthouse scores and performance metrics visible in Netlify UI without checking raw logs.

### PR Isolation
Each PR tests against its own database snapshot, preventing test data conflicts.

### Error Coaching
Sentry provides actionable error reports with stack traces and source maps.

### Cache Transparency
Debug cache plugin shows what persists between builds, helping diagnose issues.

## Integration with Canon System

All Netlify automation respects the Bickford Canon authorization system:
- Deployments require proper authorization
- Preview environments maintain tenant isolation
- Build secrets are managed securely
- Access controls are enforced at all levels

## Support

For issues or questions:
1. Check Netlify build logs
2. Review plugin documentation in `.netlify/README.md`
3. Consult the main repository documentation
4. Contact the team via GitHub issues
