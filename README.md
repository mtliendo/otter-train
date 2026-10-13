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
- Auth: `@auth0/nextjs-auth0` v4 (tenant **demo-showcase**, app **otter-train**). Falls back to the Focus stub user until `AUTH0_CLIENT_SECRET` is set.

## Setup

```bash
pnpm install
cp .env.example .env.local
# set DATABASE_URL (and DATABASE_URL_UNPOOLED if you have a direct Neon URL)
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Until `AUTH0_CLIENT_SECRET` is set, the stub user **Focus** is signed in automatically.

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
| `AUTH_STUB` | no | `true` forces the Focus stub; `false` requires Auth0. If omitted, stub is used only when `AUTH0_CLIENT_SECRET` is missing. |
| `AUTH0_DOMAIN` | for real login | `demo-showcase.us.auth0.com` |
| `AUTH0_CLIENT_ID` | for real login | `CBR8NFocoUkfCCtEPVC9oEciT4s8Ez7E` |
| `AUTH0_CLIENT_SECRET` | for real login | Auth0 application secret (not readable from Auth0 CLI/MCP in this environment) |
| `AUTH0_SECRET` | for real login | `openssl rand -hex 32` |
| `APP_BASE_URL` | for real login | `http://localhost:3000` locally; `https://otter-train.vercel.app` on production. Omit on Preview so the SDK uses `https://$VERCEL_URL`. |

Auth0 tenant: **demo-showcase**. Application: **otter-train**. OIDC issuer is `https://demo-showcase.us.auth0.com/`.

## Auth (Auth0 wired, stub fallback)

All reads and writes are scoped to `getCurrentUser()` in `lib/auth.ts`. `lib/auth0.ts` uses `@auth0/nextjs-auth0` v4 (`Auth0Client` + `proxy.ts` middleware on `/auth/*`).

Real login turns on automatically once `AUTH0_CLIENT_SECRET` is set (or set `AUTH_STUB=false`). The first authenticated Auth0 `sub` gets the weekday plan, habits, and staples seeded on first request.

Add these URLs on the **otter-train** Regular Web Application (Auth0 Dashboard → Applications → otter-train → Settings):

- Allowed Callback URLs: `http://localhost:3000/auth/callback,https://otter-train.vercel.app/auth/callback,https://*.vercel.app/auth/callback`
- Allowed Logout URLs: `http://localhost:3000,https://otter-train.vercel.app,https://*.vercel.app`
- Allowed Web Origins: `http://localhost:3000,https://otter-train.vercel.app,https://*.vercel.app`

Existing rows stay user-scoped by `user_id`. Local stub data lives under `auth0|focus`; a real Auth0 login is a new user unless you remap those rows.

## Deploy (Vercel)

Vercel project: **otter-train** (`prj_C6iYr3rYBdAQoAh3GDMKpLV1zLsD`) on team **Focus Otter's projects**, linked to `mtliendo/otter-train`. Production domain: `https://otter-train.vercel.app`. Do not promote this PR to production.

1. Attach a permanent Neon database (Vercel Marketplace Neon install `icfg_fHYuFQ1Ncfh5ecIOgWYKH0Ao`, plan `free_v3`, region `iad1`, auth off).
2. Set `DATABASE_URL` and `DATABASE_URL_UNPOOLED` on Production / Preview / Development.
3. Auth0 vars already expected on the project: `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_SECRET`. Add `AUTH0_CLIENT_SECRET` when you have it. Set production `APP_BASE_URL=https://otter-train.vercel.app` and development `APP_BASE_URL=http://localhost:3000`. Leave Preview `APP_BASE_URL` unset.
4. After the database is attached, run migrations (seed happens on first login / first stub request):

   ```bash
   pnpm db:migrate
   ```

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
