## Trackd.app

A full‑stack TypeScript app for small trades and services businesses. The app provides jobs, customers, competitors, and AI insights features with a modern React UI and an Express API. It runs locally without external services by default, and switches to real services when environment variables are provided.

### Tech Stack
- Express (Node) + Vite middleware
- React 18 + Tailwind CSS + Radix UI
- Drizzle ORM (Postgres) + Zod schemas (shared)
- OpenAI (optional) for AI analyses
 - Sessions: express-session + connect-pg-simple (Postgres store)

### Repository Layout
- `server/`: Express API, Vite integration, storage and AI
- `client/`: React app (Vite) and UI components
- `shared/`: Database tables and validation schemas (Drizzle + Zod)

## Prerequisites
- Node.js 20+
- npm 10+

## Quickstart
1. Install dependencies
```bash
npm install
```
2. Setup .env (Supabase pooler recommended in dev; add `?sslmode=require`)
```bash
cp .env.example .env # or create manually (see below)
```
3. Run in development (serves API and client on one port)
```bash
PORT=5001 npm run dev
```
Open `http://127.0.0.1:5001`.

## Environment Variables
Create a `.env` file in the project root as needed:

```bash
# Server
PORT=5000

# Database (Postgres)
# Use Supabase/Neon pooler in dev (IPv4, stable TLS)
DATABASE_URL=postgresql://USER:PASSWORD@POOL_HOST:6543/DB?sslmode=require

# Force in‑memory storage even if DATABASE_URL is set (dev only)
TRACKD_FORCE_MEMORY=0

# AI Provider
# AI_PROVIDER can be: auto | openai | perplexity (default: auto)
AI_PROVIDER=auto
# OpenAI (optional)
OPENAI_API_KEY=sk-...
# Perplexity (optional)
PERPLEXITY_API_KEY=perplexity-...
PERPLEXITY_MODEL=sonar

# Airtable (optional – subscription tiers)
AIRTABLE_API_KEY=pat_...
AIRTABLE_BASE_ID=app_...

# Sessions
SESSION_SECRET=change-me
```

Notes:
- If `DATABASE_URL` is not set or `TRACKD_FORCE_MEMORY=1`, the app runs with in‑memory storage.
- If no AI provider keys are set, insights generation falls back to local heuristics.
- In development, TLS verification is relaxed and Helmet CSP is disabled to support Vite HMR.

## Database Setup (Postgres)
Trackd uses Drizzle ORM with Postgres (e.g., Neon or Supabase).
1. Set `DATABASE_URL` in `.env`.
2. Apply schema (if TLS complains locally, add `NODE_TLS_REJECT_UNAUTHORIZED=0`):
```bash
npm run db:push
```

## NPM Scripts
- `npm run dev`: Start Express with Vite middleware (development)
- `npm run build`: Build client and bundle server into `dist/`
- `npm run start`: Start the built server from `dist/`
- `npm run check`: TypeScript check
- `npm run db:push`: Apply Drizzle schema to the configured database

## API Overview
Base URL: `http://127.0.0.1:5000`

### AI
- `POST /api/ai/competitor-analysis` → competitor insights
- `POST /api/ai/pricing-analysis` → pricing insights

### Jobs
- `GET /api/jobs/:userId`
- `POST /api/jobs/:userId` (auto‑upserts `customer` by name when creating new)
- `PUT /api/jobs/:userId/:id`
- `DELETE /api/jobs/:userId/:id`

### Customers
- `GET /api/customers/:userId`
- `POST /api/customers/:userId`

Notes:
- Client uses cookie sessions; requests include credentials. Request bodies are validated with Zod using schemas from `shared/schema.ts`.

### Tiers (Airtable)
- `GET /api/config/tiers` (add `?refresh=1` to bypass cache after editing Airtable)

### n8n/Tavily (competitor ingest)
- `POST /api/webhooks/competitor-search` → { userId, competitors: [{ name, location?, hourlyRate?, website?, phone?, isActive? }] }

## Client Routes
- `/` → Dashboard
- `/jobs` → Jobs
- `/customers` → Customers
- `/competitors` → Competitors
- `/profile` → Profile
- `/insights` → Insights

## Build and Production
```bash
npm run build
npm run start
```
The server will listen on `PORT` (default `5001`) and serve both API and static client files.

### Production hardening
- Enable Helmet CSP (default) and set explicit CORS origin allow‑list.
- Use pooler or managed Postgres with SSL; set `SESSION_SECRET`.
- Provide API keys for OpenAI/Stripe/Airtable/Tavily as needed.

## Git: Connect and Pull `main`
If your working tree has local changes, stash them before pulling:
```bash
git remote -v
# If needed, set the origin URL
# git remote set-url origin https://github.com/<user>/<repo>.git

git fetch origin
git stash push -u -m "wip: local changes before pull"
git checkout main
git pull --rebase origin main
git stash pop --index || true
```
Resolve any merge conflicts, then continue the rebase if needed.

## Troubleshooting
- Port already in use → change `PORT` or free the port
- No DB available → unset `DATABASE_URL` or set `TRACKD_FORCE_MEMORY=1`
- OpenAI disabled → add `OPENAI_API_KEY` or expect mock responses

## License
MIT
