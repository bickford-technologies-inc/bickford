# Bickford Quickstart Guide

## Prerequisites

- Node.js >= 20.19.4
- PostgreSQL (or use Docker Compose)
- npm >= 10.0.0

## Quick Start

```bash
# Clone the repository
git clone https://github.com/bickfordd-bit/bickford.git
cd bickford

# Run setup script (creates .env, starts Postgres, initializes DB)
npm run start
```

The setup script will:
1. Create `.env` from `.env.example` if missing
2. Start PostgreSQL via Docker Compose if needed
3. Run database migrations
4. Install dependencies
5. Start the development server

## Manual Setup

If you prefer manual setup:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 3. Start PostgreSQL
docker-compose up -d postgres

# 4. Initialize database
npx prisma migrate deploy

# 5. Start development server
npm run dev
```

## Verify Installation

### Check Health
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T04:00:00.000Z",
  "uptime": 123.45,
  "version": "1.0.0"
}
```

### Check Canon Status
```bash
curl http://localhost:3000/api/canon
```

### Execute an Intent
```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "origin": "test-agent",
    "intent": "Add health check endpoint"
  }'
```

### Query Ledger
```bash
curl http://localhost:3000/api/ledger
```

## Troubleshooting

### Database Connection Issues
If PostgreSQL fails to start:
```bash
docker-compose down
docker-compose up -d postgres
```

### Port Already in Use
If port 3000 is busy:
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Missing Dependencies
```bash
npm run install:all
```

## Next Steps

- Read [Architecture Guide](ARCHITECTURE.md)
- Explore [API Reference](API.md)
- Review [Acquisition Docs](ACQUISITION.md)
