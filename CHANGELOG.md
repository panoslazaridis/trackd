# Changelog (last 7 days)

## Enhancements
- Sessions: Added express-session with connect-pg-simple store, secure cookies.
- Security: Helmet, CORS (dev open), scoped rate-limits in production.
- Insights: Uses logged-in user; server fallback when no OpenAI key; parsing hardening.
- Jobs: Frontend validation and payload normalization; server-side coercion; auto-upsert new customer when creating a job.
- Customers: Job creation invalidates customers cache.
- Subscriptions: Airtable cache-busting via `GET /api/config/tiers?refresh=1`.
- Integrations: n8n/Tavily ingest webhook `POST /api/webhooks/competitor-search`.
- DevX: Disabled Replit runtime overlay outside Replit; relaxed TLS in dev; disabled Helmet CSP in dev to enable HMR.
- UI: Button `link` variant; fixed competitor card types; insights list filter shows items on AI tab.

## Fixes
- Resolved signup flow crash in memory mode; best-effort subscription creation.
- Enforced one trial per user on signup.
- Fixed profile update errors by sending decimal fields as strings.
- Addressed TypeScript errors across client/pages.
- Auto-create `session` table for session store.
- Fixed blank page due to CSP blocking Vite scripts.

## Known Pending
- Stripe checkout/portal routes (stubbed) and webhooks.
- Route guards leveraging server sessions (client relies on local context).
- End-to-end tests and broader QA pass.

## Breaking Changes
- API paths use `/:userId` for jobs/customers endpoints.


