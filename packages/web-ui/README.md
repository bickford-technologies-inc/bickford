# Bickford Web UI

A Next.js application for the Bickford decision continuity runtime, optimized for deployment on Vercel.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Workspace integration** with monorepo packages
- **Vercel-ready** deployment configuration

## Development

### Prerequisites

- Node.js 20.x
- pnpm 10.28.0 or higher

### Local Development

1. Install dependencies (from repository root):

```bash
pnpm install
```

2. Start the development server:

```bash
cd packages/web-ui
pnpm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_API_URL` - API endpoint URL

### Building

Build the application:

```bash
pnpm run build
```

Start the production server:

```bash
pnpm run start
```

## Deployment to Vercel

### Automatic Deployment

The application is configured for automatic deployment via the GitHub integration:

1. Push changes to the `main` branch
2. Vercel automatically builds and deploys
3. Preview deployments are created for pull requests

### Manual Deployment

Using the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Environment Configuration

Set environment variables in Vercel dashboard:

1. Go to Project Settings → Environment Variables
2. Add required variables:
   - `NEXT_PUBLIC_API_URL`
   - Any other environment-specific variables

### Build Configuration

The deployment is configured via `/vercel.json`:

- **Framework**: Next.js
- **Root Directory**: `packages/web-ui`
- **Install Command**: `pnpm install`
- **Build Command**: `cd packages/web-ui && pnpm run build`

Security headers are automatically applied for all routes.

## Project Structure

```
packages/web-ui/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Home page
├── public/          # Static assets
├── .env.example     # Environment template
├── next.config.js   # Next.js configuration
├── package.json     # Dependencies and scripts
└── tsconfig.json    # TypeScript configuration
```

## Workspace Dependencies

This package uses the following workspace packages:

- `@bickford/ledger` - Ledger functionality
- `@bickford/types` - Shared types
- `@bickford/execution-convergence` - Execution runtime

These are automatically transpiled by Next.js via the `transpilePackages` configuration.

## CI/CD Integration

The web-ui package is integrated into the monorepo CI/CD pipeline:

- **Linting**: Runs on every commit
- **Type checking**: TypeScript validation
- **Build validation**: Ensures successful builds
- **Deployment**: Automatic on merge to main

See `.github/workflows/vercel.yml` for the deployment workflow.

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `pnpm install`
3. Rebuild: `pnpm run build`

### Workspace Resolution Issues

If workspace packages aren't resolving:

1. Ensure you're in the repository root when running `pnpm install`
2. Check `pnpm-workspace.yaml` includes `packages/*`
3. Verify `transpilePackages` in `next.config.js` lists all workspace dependencies

## Support

For issues or questions, please refer to the main repository documentation or open an issue.

