# Decommission: Legacy Express Backend

**Date:** 2026-08-09
**Service:** `alcoa-scaffolding-backend` (Render web service, runs `backend/` via `node server.js`)

## Why

The Next.js admin app (`alcoa-admin/`, deployed to Vercel) is fully self-contained and
serves all of its own APIs via Route Handlers. The legacy Express `backend/` service is
**not used by the admin app**, yet it was still deployed on Render against the **same
production MongoDB** (`MONGODB_DB_NAME: alcoa-admin-prod`). A second, unused writer on the
production database is a data-integrity risk, so the service is being decommissioned.

## What changed (in this repo)

- `render.yaml`: the entire `alcoa-scaffolding-backend` web service block was **commented
  out** (kept intact so it is recoverable) with a dated explanation. `services:` is now an
  explicit empty list (`services: []`). No other service was touched.
- Nothing under `backend/` was deleted — the source remains for reference/rollback.

## Manual steps to finish (Render dashboard) — REQUIRED

Removing the block from `render.yaml` does **not** delete an already-created Render service.
Complete these steps in the Render dashboard:

1. Confirm no other consumer depends on the backend URL (public website, cron, webhooks,
   integrations). The admin app does not.
2. Open the **`alcoa-scaffolding-backend`** service → **Suspend** it.
3. Monitor for ~24–48h to confirm nothing breaks (admin app + website stay healthy).
4. Once confirmed, **Delete** the service in the Render dashboard.
5. **Keep the MongoDB** (`alcoa-admin-prod`) and its connection string — the Next.js app
   still uses it. Do NOT delete the database.

## Rollback

Un-comment the service block in `render.yaml` (restore `services:` with the block) and
redeploy, or recreate the service in Render using the values preserved in the commented
block.
