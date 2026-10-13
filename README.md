# otter-train

Personal training log for one user (**Focus**). Log the day's workout set by set, food and protein, sleep, and knee pain — then glance at a month calendar to see what landed.

This is a mobile-first, dark-mode, installable PWA. There is no public MCP endpoint yet.

## What it does

- **Today** — one scrolling page for a date: warmup, exercises, rest timer, cooldown, fueling, daily extras, food, sleep.
- **Date picker** — tap the date to open a month calendar; previous/next day arrows; past days stay editable.
- **Workouts** — weekday templates live in Postgres. Sets are logged weight × reps and prefilled from the last time that exercise was logged. Tap ⏱ to start a 90s rest timer.
- **Food** — house staples with preset protein grams plus free-text entries. Daily protein total vs a 160–200 g target. Creatine 5 g checkbox.
- **Sleep** — morning entry: bedtime, wake time, quality 1–5, next-morning knee pain 0–10.
- **Knee rule** — if knee pain is ≥ 3, a **Cut jumping this week** banner shows for the rest of that Sunday–Saturday week. Warning only; the plan never auto-changes.
- **Calendar** — month grid with dots for workout done, protein target hit (160 g+), and sleep logged.

## Stack

- Next.js App Router (TypeScript, Tailwind CSS)
- Next.js Route Handlers (`app/api/*`)
- Neon (Lakebase Postgres) + Drizzle ORM (schema, SQL migrations, seed script)
- Deploy target: Vercel
- Auth: stub user today, designed for `@auth0/nextjs-auth0`

## Setup

```bash
pnpm install
cp .env.example .env.local
# set DATABASE_URL (and DATABASE_URL_UNPOOLED if you have a direct Neon URL)
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The stub user **Focus** is signed in automatically.

### Database

Read `DATABASE_URL` from the environment. Prefer Neon's **pooled** URL for the app and the **direct / unpooled** URL for migrations (`DATABASE_URL_UNPOOLED`). If the unpooled URL is missing, Drizzle falls back to `DATABASE_URL`.

```bash
pnpm db:generate   # after schema changes
pnpm db:migrate    # apply drizzle/ SQL migrations
pnpm db:seed       # weekday plan, daily habits, house staples
pnpm db:seed -- --force   # replace templates (does not wipe logs)
```

Seeded plan (weekday templates):

| Day | Session |
| --- | --- |
| Mon | Push + arms: DB bench 4×8–10, flys 3×12, push-ups 3 near failure, skull crushers 3×12, curls 3×12, 10-min easy row (league night from Nov 2) |
| Tue | Rower intervals 8× (1 min hard / 1 min easy); planks, side planks, dead bugs ×3 |
| Wed | Legs: vest/KB tempo squats 4×8, slant-board squats 3×12, RDLs 4×8, hip thrusts 3×12, calf raises 4×15 |
| Thu | Back: pull-ups 4, chest-supported DB rows 4×10, single-arm KB rows 3×10, band pull-aparts, curls, oblique circuit, 15–20 min easy row |
| Fri | Volleyball at Beyond the Baseline 12:30–3, volleyball warmup/cooldown |
| Sat | Hybrid circuit 4–5 rounds: 250 m row, 15 KB swings, 15 push-ups, 10 vest squats, 30 s jump rope, 10 single-leg calf raises / side |
| Sun | Rest, dog walk, mobility |

Every training day also includes the shared warmup/cooldown/fueling lists, plus daily extras: Spanish squat holds 3×30–45 s, clamshells or lateral walks, slant board 3–4 days/week, midday walk.

House staples (protein defaults, editable on each log row): bananas 1.3 g, milk 8 g, raisin bran 5 g, granola 4 g, protein powder 25 g, oranges 1.2 g, cottage cheese 25 g, bread 4 g, peanut butter 8 g, leftover chicken 30 g.

## Environment variables

Copy `.env.example` to `.env.local`.

| Variable | Required now | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Pooled Neon connection string |
| `DATABASE_URL_UNPOOLED` | recommended | Direct URL for `pnpm db:migrate` |
| `AUTH_STUB` | no (default `true`) | `true` uses the Focus stub user |
| `AUTH0_DOMAIN` | for Auth0 swap | Tenant host, e.g. `demo-showcase.us.auth0.com` |
| `AUTH0_CLIENT_ID` | for Auth0 swap | `CBR8NFocoUkfCCtEPVC9oEciT4s8Ez7E` |
| `AUTH0_CLIENT_SECRET` | for Auth0 swap | Auth0 application secret |
| `AUTH0_SECRET` | for Auth0 swap | `openssl rand -hex 32` |
| `APP_BASE_URL` | for Auth0 swap | `http://localhost:3000` locally; production URL on Vercel |

Auth0 tenant: **demo-showcase**. Application: **otter-train**. If Universal Login 404s, try `demo-showcase.auth0.com` vs `demo-showcase.us.auth0.com`.

## Auth (stub now, Auth0 next)

All reads and writes are scoped to `getCurrentUser()` in `lib/auth.ts`. Today that helper returns a single stub user (`auth0|focus` / Focus) when `AUTH_STUB` is not `false`.

To swap in real Auth0 later:

1. `pnpm add @auth0/nextjs-auth0`
2. Fill the `AUTH0_*` and `APP_BASE_URL` vars.
3. Uncomment `Auth0Client` in `lib/auth0.ts` and `auth0.middleware` in `proxy.ts`.
4. Add Auth0 callback URLs:
   - Allowed Callback: `{APP_BASE_URL}/auth/callback`
   - Allowed Logout: `{APP_BASE_URL}`
5. Set `AUTH_STUB=false`.
6. Existing rows stay user-scoped by `user_id`. After the first real login, re-seed or update `user_id` from `auth0|focus` to the Auth0 `sub` if you want to keep local data.

## Deploy (Vercel)

1. Create a Vercel project from this repo (team **Focus Otter's projects** is fine).
2. Attach a Neon database (Vercel Marketplace or an existing Neon project).
3. Set `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `AUTH_STUB=true` on Production / Preview / Development.
4. After the first deploy, run migrations and seed against that database:

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. When Auth0 is ready, add the Auth0 env vars and set `AUTH_STUB=false`. Add the Vercel URL to Auth0 Allowed Callbacks / Logouts.

No tests are included in this MVP.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate a new Drizzle migration from `db/schema.ts` |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed Focus's plan, habits, and staples |
