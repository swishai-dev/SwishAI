# Quickstart: Basketball Data Layer

## Prerequisites
- Node.js 20+
- Docker (for PostgreSQL & Redis)
- PNPM (recommended)

## Setup Steps

1. **Environment Variables**
   Copy `.env.example` to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/swish_ai"
   REDIS_URL="redis://localhost:6379"
   GAMMA_API_BASE="https://gamma-api.polymarket.com"
   ```

2. **Start Infrastructure**
   ```bash
   docker-compose up -d
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Initialize Database**
   ```bash
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Adding New Leagues
1. Update `BASKETBALL_TAG_IDS` in `lib/services/polymarket.ts`.
2. Add the league identifier to the `league` enum in `prisma/schema.prisma`.
3. Run `npx prisma generate`.

### Testing Data Fetching
Run the standalone fetcher script to verify Gamma API connectivity:
```bash
npx ts-node scripts/test-fetch.ts --league NBA
```

### Clearing Cache
```bash
redis-cli flushall
```
