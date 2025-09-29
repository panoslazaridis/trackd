Trackd.app – Replit Working Prototype

Overview

Trackd.app is a full‑stack TypeScript app (Express + Vite + React + Tailwind + Drizzle). This snapshot runs locally without a database or OpenAI, using in‑memory storage and mock AI responses. When you add credentials, it seamlessly switches to real services.

Prerequisites

- Node.js 20+
- npm 10+

Getting Started (Local Dev)

1) Install

```bash
npm install
```

2) Run (port 5000)

```bash
PORT=5000 npm run dev
```

Open http://127.0.0.1:5000

Environment Variables

- PORT: default 5000
- DATABASE_URL: optional in dev; when unset, the server uses in‑memory storage
- OPENAI_API_KEY: optional in dev; when unset, AI endpoints return mock data

Copy `.env.example` to `.env` and adjust as needed.

Production / Real Services

- Database: Provide `DATABASE_URL` (e.g., Neon Postgres). Then run:

```bash
npm run db:push
```

This applies Drizzle schema to your database. Build and start:

```bash
npm run build
npm run start
```

Key Scripts

- npm run dev: Development server (Express + Vite middleware)
- npm run build: Build client and server
- npm run start: Start built server
- npm run db:push: Push Drizzle schema to the configured database

Architecture

- server: Express API, Vite middleware, storage and AI integrations
- client: React + Vite + Tailwind UI
- shared: Type‑safe schemas (Drizzle + Zod)

Offline‑friendly Dev Changes

- `server/db.ts`: Database optional when `DATABASE_URL` is missing
- `server/storage.ts`: Falls back to in‑memory storage when no DB
- `server/ai.ts`: Returns mock AI responses when no `OPENAI_API_KEY`
- `server/index.ts`: Binds to 127.0.0.1 and removes reusePort

Current Snapshot

Tag: `replit-working-prototype`
Branch: Feature branch snapshot (safe; does not alter `main`)


