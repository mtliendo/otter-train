# otter-train

Personal training log for one user (**Focus**). Log the day's workout set by set, food and protein, sleep, and knee pain — then glance at a month calendar to see what landed.

This is a mobile-first, dark-mode, installable PWA. There is no public MCP endpoint yet.

`/` is a **public marketing homepage** (no login). The authenticated log lives at `/today`. The calendar stays behind login. A signed-in visitor hitting `/` is sent to `/today`; when the Auth stub is on, `/` stays public and the hero shows **Open app**.

## What it does

- **Home** — logged-out marketing page: hero, feature sections (Today, AM Row, warmup/fueling, food, sleep/knees, calendar, travel), closing CTA.
- **Today** (`/today`) — one scrolling page for a date: AM Row, warmup, afternoon lift, rest timer, cooldown, fueling, daily extras, food, sleep.
- **AM Row** — daily morning Concept2 RowErg workout of the day (`https://log.concept2.com/wod/YYYY-MM-DD/rowerg`), fetched server-side and cached per date. Monday and Tuesday are HARD; Wednesday (legs), Thursday, Friday, Saturday (protecting volleyball), and Sunday are EASY at a conversational ~20 spm. Sunday is optional. If morning knee pain is ≥ 3, the card warns to skip or keep it very light and HARD is downgraded to EASY/optional. Fetch/parse failure falls back to an easy 20-minute steady row. Log done/skipped, time, distance, and notes; time and distance prefill from the last completed row. Travel days show the same card.
- **Date picker** — tap the date to open a month calendar; previous/next day arrows; past days stay editable.
- **Workouts** — weekday templates live in Postgres (home and travel variants). Sets are logged weight × reps and prefilled from the last time that exercise was logged. Tap ⏱ to start a 90s rest timer.
- **Travel mode** — a start/end date range, not a global switch. Days inside the range use hotel-gym / bodyweight weekday templates with the same training intent. It turns off after the end date. Calendar events do not auto-toggle travel (future).
- **Day note** — per-day trip details (talk time, Taylor YMCA pickup, IVL at Wilcox HS, flights). Oct 18–24 2026 is pre-filled from the travel-week plan.
- **Food** — house staples with preset protein grams plus free-text entries. On travel days, a road set is added: eggs, Greek yogurt, protein bar, jerky, nuts, conference chicken. Daily protein total vs a 160–200 g target. Creatine 5 g checkbox.
- **Sleep** — morning entry: bedtime, wake time, quality 1–5, next-morning knee pain 0–10.
- **Knee rule** — if knee pain is ≥ 3, a **Cut jumping this week** banner shows for the rest of that Sunday–Saturday week. Extra warning-only banners if a week has more than 2 jumping days, or heavy legs sit the day before/after volleyball. The plan never auto-changes.
- **Calendar** — month grid with dots for workout done, protein target hit (160 g+), and sleep logged. Travel dates get a teal tint.

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

Open [http://localhost:3000](http://localhost:3000) for the public homepage. The log is [http://localhost:3000/today](http://localhost:3000/today). Until `AUTH0_CLIENT_SECRET` is set, the stub user **Focus** is signed in automatically on app routes; `/` still loads without Auth0.

### Database

Read `DATABASE_URL` from the environment. Prefer Neon's **pooled** URL for the app and the **direct / unpooled** URL for migrations (`DATABASE_URL_UNPOOLED`). If the unpooled URL is missing, Drizzle falls back to `DATABASE_URL`.

```bash
pnpm db:generate   # after schema changes
pnpm db:migrate    # apply drizzle/ SQL migrations
pnpm db:seed       # weekday plans (home + travel), habits, house + road staples, default travel week
pnpm db:seed -- --force   # replace templates (does not wipe set/food/sleep logs)
```

Seeded home plan (weekday templates):

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

Travel weekday templates (used when the date is inside a travel range):

| Day | Session |
| --- | --- |
| Sun | Travel / rest: 20–30 min walk, hips and calves mobility, Spanish squat holds |
| Mon | Hotel upper body (~40 min): DB bench 4×10, DB rows 4×10, push-ups 3 near failure, curls 3×12, skull crushers 3×12, plank / side plank ×3, 10 min easy rower or bike |
| Tue | Easy pre-volleyball: 15 min morning mobility + walk; optional Taylor YMCA pickup or 20 min easy intervals (jumping day) |
| Wed | Travel day: airport walk, Spanish squat holds, clamshells |
| Thu | Hotel legs, no jumping: tempo goblet/DB squats 4×8, split squats 3×10/side, DB RDLs 4×10, single-leg hip thrusts 3×12, calf raises 4×15, Spanish squat holds (heavy-legs day) |
| Fri | IVL open gym at Wilcox HS 8:00–10:30 PM; morning walk + band work (jumping day) |
| Sat | Travel home: Spanish squat holds and a walk |

Default travel range: **2026-10-18 through 2026-10-24** (Raleigh / San Jose). Day notes for that week are pre-filled.

House staples (protein defaults, editable on each log row): bananas 1.3 g, milk 8 g, raisin bran 5 g, granola 4 g, protein powder 25 g, oranges 1.2 g, cottage cheese 25 g, bread 4 g, peanut butter 8 g, leftover chicken 30 g.

Road staples (added on travel days): eggs 12 g, Greek yogurt 17 g, protein bar 20 g, jerky 12 g, nuts 6 g, conference chicken 30 g.

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

All reads and writes are scoped to `getCurrentUser()` in `lib/auth.ts`. `lib/auth0.ts` uses `@auth0/nextjs-auth0` v4 (`Auth0Client` + `proxy.ts` middleware on `/auth/*`). `proxy.ts` lets `/` (and `/marketing/*` assets) through without a session so the homepage never 307s to Auth0. `/today`, `/calendar`, and `/api/*` still require a session when the stub is off.

Real login turns on automatically once `AUTH0_CLIENT_SECRET` is set (or set `AUTH_STUB=false`). The first authenticated Auth0 `sub` gets the weekday plan, habits, and staples seeded on first request.

Add these URLs on the **otter-train** Regular Web Application (Auth0 Dashboard → Applications → otter-train → Settings):

- Allowed Callback URLs: `http://localhost:3000/auth/callback,https://otter-train.vercel.app/auth/callback,https://*.vercel.app/auth/callback`
- Allowed Logout URLs: `http://localhost:3000,https://otter-train.vercel.app,https://*.vercel.app`
- Allowed Web Origins: `http://localhost:3000,https://otter-train.vercel.app,https://*.vercel.app`

Existing rows stay user-scoped by `user_id`. Local stub data lives under `auth0|focus`; a real Auth0 login is a new user unless you remap those rows.

## Deploy (Vercel)

Vercel project: **otter-train** (`prj_C6iYr3rYBdAQoAh3GDMKpLV1zLsD`) on team **Focus Otter's projects**, Git-linked to GitHub `mtliendo/otter-train`. Production branch is `main`: every push or merge to `main` auto-deploys production. Production domain: `https://otter-train.vercel.app`. Auto-assign of production domains is on.

Permanent Neon project **otter-train** (`summer-darkness-11061970`, `aws-us-east-1`) is attached on Vercel via `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) for Production / Preview / Development. Migrations and the Focus stub seed have been applied. First real Auth0 login still auto-seeds that user's plan.

Auth0 tenant **demo-showcase** / app **otter-train** env vars are already on the Vercel project (`AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`). Production `APP_BASE_URL=https://otter-train.vercel.app`; development `APP_BASE_URL=http://localhost:3000`. Leave Preview `APP_BASE_URL` unset so the SDK uses `https://$VERCEL_URL`.

The Auth0 MCP server is **not available** in this Cloud Agent session, and the Auth0 CLI has no tenant login (`no_config`). Callback / logout / web-origin URLs still need to be saved on the otter-train Regular Web Application (values above). `AUTH0_CLIENT_SECRET` was not overwritten.

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
| `pnpm db:seed` | Seed Focus's home + travel plans, habits, staples, and Oct 18–24 notes |
