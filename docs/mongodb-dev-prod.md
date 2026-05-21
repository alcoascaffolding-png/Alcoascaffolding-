# MongoDB dev / prod separation (Alcoa)

## Terminology (Atlas screenshot)

| Atlas UI label | What it is | Your names |
|----------------|------------|------------|
| Cluster | Server group | `alcoa-db` |
| Database | Namespace containing many collections | `alcoa-admin-dev`, `alcoa-admin-prod` |
| Collection | One table-like store | `users`, `quotations`, `customers`, … (14 in dev) |

`alcoa-admin` in your screenshot is a **database**, not a single collection. Renaming it means creating a new database and copying data.

## Recommended structure

```
MongoDB Atlas
└── Cluster: alcoa-db
    ├── alcoa-admin-dev     ← development, seeds, experiments
    ├── alcoa-admin-prod    ← live site only
    └── alcoa-admin         ← legacy (keep as backup, drop after migration)
```

**Best practices**

- One cluster is fine for small/medium apps; use **separate database names**, not separate collections, for dev vs prod.
- Prefer **one DB user per environment** with read/write scoped only to that database (Atlas → Database Access).
- Never run destructive seeds (`npm run seed`) against `*-prod`.
- Store credentials only in `.env.local` (dev) and hosting secrets (Vercel/Render), never in git.
- Use `MONGODB_URI` without a database path + explicit `MONGODB_DB_NAME` so switching env is one variable.

## Environment variables

### Local development (`alcoa-admin/.env.local`)

```env
APP_ENV=development
NODE_ENV=development

MONGODB_URI=mongodb+srv://USER:PASS@alcoa-db.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=alcoa-admin-dev

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-dev-secret
```

### Production (Vercel → Environment Variables → Production)

```env
APP_ENV=production
NODE_ENV=production

MONGODB_URI=mongodb+srv://USER:PASS@alcoa-db.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=alcoa-admin-prod

NEXTAUTH_URL=https://your-admin-domain.com
NEXTAUTH_SECRET=strong-production-secret
```

Copy templates from `alcoa-admin/.env.example` and `alcoa-admin/.env.production.example`.

## Backend connection (Next.js admin)

`alcoa-admin/lib/db.js` uses `lib/mongodb-config.js`:

- Resolves database via `MONGODB_DB_NAME` → URI path → `APP_ENV` default.
- **Blocks** `APP_ENV=production` + `*-dev` or legacy `alcoa-admin` unless `MONGODB_ALLOW_DEV_IN_PRODUCTION=true`.

## Step-by-step migration from `alcoa-admin`

1. In Atlas Data Explorer, click **Create database** → name `alcoa-admin-dev` (empty is OK).
2. In `alcoa-admin/.env.local` set `MONGODB_URI` (cluster only) and temporarily:
   ```env
   MONGODB_SOURCE_DB=alcoa-admin
   MONGODB_TARGET_DB=alcoa-admin-dev
   ```
3. Dry run: `npm run db:migrate-rename`
4. Apply copy: `npm run db:migrate-rename -- --apply`
5. Point dev at new DB: `MONGODB_DB_NAME=alcoa-admin-dev`
6. Verify: `npm run db:test`
7. Create prod DB in Atlas: `alcoa-admin-prod`
8. Seed minimal prod data: `MONGODB_DB_NAME=alcoa-admin-prod npm run seed:prod-sample -- --confirm`
9. After verification, drop legacy `alcoa-admin` in Atlas (optional backup export first).

## NPM scripts (`alcoa-admin`)

| Script | Purpose |
|--------|---------|
| `npm run db:test` | Connect and list collections |
| `npm run db:migrate-rename` | Copy `alcoa-admin` → `alcoa-admin-dev` |
| `npm run seed` | Full dev dataset (blocked on `*-prod`) |
| `npm run seed:prod-sample -- --confirm` | Small prod smoke-test records |

## Production deployment

### Vercel (Next.js `alcoa-admin`)

1. Project → Settings → Environment Variables.
2. Add production-only: `APP_ENV=production`, `MONGODB_DB_NAME=alcoa-admin-prod`, `MONGODB_URI`, `NEXTAUTH_*`, etc.
3. Preview/Development envs: use `alcoa-admin-dev` and separate secrets if possible.

### Render (legacy Express `backend/`)

`render.yaml` sets `APP_ENV=production` and `MONGODB_DB_NAME=alcoa-admin-prod`. Set `MONGODB_URI` in the Render dashboard (sync: false).

## Naming conventions

| Item | Convention |
|------|------------|
| Dev database | `alcoa-admin-dev` |
| Prod database | `alcoa-admin-prod` |
| Legacy | `alcoa-admin` (migrate away) |
| Env switch | `APP_ENV` + `MONGODB_DB_NAME` |
| Cluster | `alcoa-db` (unchanged) |

## Folder layout (scalable)

```
alcoa-admin/
├── lib/
│   ├── mongodb-config.js   # env + db name resolution
│   └── db.js               # Next.js connection singleton
├── scripts/
│   ├── test-mongo-connection.mjs
│   ├── migrate-rename-database.mjs
│   ├── seed.mjs            # dev only
│   └── seed-prod-sample.mjs
├── .env.example
└── .env.production.example

backend/                    # legacy API (same env pattern)
├── config/
│   ├── mongodb.js
│   └── database.js
└── .env.example
```
