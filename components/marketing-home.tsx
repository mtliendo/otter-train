import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingPhone } from "@/components/marketing-phone";

const LOGIN_HREF = "/auth/login?returnTo=/today";

export function MarketingHome({ signedIn }: { signedIn: boolean }) {
  const primaryHref = signedIn ? "/today" : LOGIN_HREF;
  const primaryLabel = signedIn ? "Open app" : "Get started";

  return (
    <div className="relative min-h-full overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(90%_60%_at_80%_-10%,rgba(45,212,191,0.16),transparent_55%),radial-gradient(70%_50%_at_0%_10%,rgba(252,211,77,0.08),transparent_50%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="text-[11px] uppercase tracking-[0.22em] text-teal-300">
            otter-train
          </Link>
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                href="/today"
                className="rounded-full bg-teal-400 px-3 py-1.5 text-xs font-semibold text-ink-950"
              >
                Open app
              </Link>
            ) : (
              <>
                <a href={LOGIN_HREF} className="px-2 py-1.5 text-xs text-stone-400">
                  Sign in
                </a>
                <a
                  href={LOGIN_HREF}
                  className="rounded-full bg-teal-400 px-3 py-1.5 text-xs font-semibold text-ink-950"
                >
                  Get started
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:pt-20">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-teal-300">personal training log</p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight text-stone-50 sm:text-5xl md:text-6xl">
              Log the day.
              <span className="block text-teal-300">Keep Friday.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-stone-400">
              otter-train is Focus&apos;s weekday plan — sets, protein, sleep, and hotel weeks — with
              a warning when jumping should come off the calendar.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={primaryHref}
                className="rounded-2xl bg-teal-400 px-5 py-3 text-sm font-semibold text-ink-950"
              >
                {primaryLabel}
              </a>
              {!signedIn ? (
                <a href={LOGIN_HREF} className="rounded-2xl bg-ink-800 px-5 py-3 text-sm text-stone-200">
                  Sign in
                </a>
              ) : (
                <Link href="/calendar" className="rounded-2xl bg-ink-800 px-5 py-3 text-sm text-stone-200">
                  Open calendar
                </Link>
              )}
            </div>
            <p className="mt-4 text-xs text-stone-500">
              One user. Dark, mobile-first. Installable as a PWA.
            </p>
          </div>
          <MarketingPhone />
        </section>

        <section className="border-t border-ink-800">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200">What it holds</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight text-stone-50 md:text-4xl">
              The whole day on one scroll. Nothing auto-rewrites the plan.
            </h2>

            <div className="mt-12 space-y-16 md:space-y-24">
              <Feature
                kicker="Today"
                title="Set logging and a rest timer that stays out of the way"
                copy="Each exercise is weight × reps, prefilled from the last time you logged that movement. Tap the check to close a set. Tap ⏱ for a 90-second rest. Past days stay editable."
                visual={<SetsCard />}
              />
              <Feature
                reverse
                kicker="Warmup, cooldown, fueling"
                title="The stuff around the work, not just the work"
                copy="Shared warmup and cooldown lists, plus before / after / evening fueling checkboxes. Daily extras — Spanish squat holds, clamshells, slant board, a walk — sit on every weekday."
                visual={<FuelCard />}
              />
              <Feature
                kicker="Food"
                title="Protein against a 160–200 g target"
                copy="House staples with preset grams, plus free-text food. Creatine is a 5 g checkbox. On travel days a road set appears: eggs, Greek yogurt, protein bar, jerky, nuts, conference chicken."
                visual={<FoodCard />}
              />
              <Feature
                reverse
                kicker="Sleep and knees"
                title="A knee rule that warns. It never silently edits Friday."
                copy="Morning entry: bedtime, wake, quality 1–5, next-morning knee pain 0–10. Pain ≥ 3 raises Cut jumping this week. Extra banners if a week has more than two jumping days, or heavy legs sit next to volleyball."
                visual={<KneeCard />}
              />
              <Feature
                kicker="Calendar"
                title="A month of what actually landed"
                copy="Dots for workout done, protein target hit, and sleep logged. Travel dates get a teal tint. Tap a day to open its log. There is no calendar auto-toggle for travel — that stays a date range you set."
                visual={<CalCard />}
              />
              <Feature
                reverse
                kicker="Travel mode"
                title="Hotel-gym weeks, same training intent"
                copy="A start and end date — not a global switch. Days inside the range use hotel and bodyweight templates. Day notes hold the trip: the talk, Taylor YMCA pickup, IVL at Wilcox HS. It turns off after the end date."
                visual={<TravelCard />}
              />
              <Feature
                kicker="AM Row"
                title="Concept2's workout of the day, tagged hard or easy"
                copy="A morning RowErg session from log.concept2.com, fetched server-side and cached per date. Monday and Tuesday are hard. Wednesday through Sunday stay easy at about 20 spm — Sunday is optional. Knee pain ≥ 3 downgrades hard to easy/optional. Snap every PM5 screen — intervals included — then confirm the extracted totals before they save."
                visual={<AmRowFeatureCard />}
              />
              <Feature
                reverse
                kicker="Report"
                title="One week: what you planned, what you rowed, how the knees felt"
                copy="Workouts completed vs planned, row split and distance from confirmed photos, weekly weight with a 4-week average, knee pain, and sleep. A page, not an email."
                visual={<CalCard />}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-ink-800">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-300">Ready</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 md:text-5xl">
              Open today&apos;s log.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-stone-400">
              Sign in, pick the date, and start the first set. The weekday plan is already there.
            </p>
            <a
              href={primaryHref}
              className="mt-8 inline-block rounded-2xl bg-teal-400 px-6 py-3 text-sm font-semibold text-ink-950"
            >
              {primaryLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>otter-train · built for Focus</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-stone-300">
              Home
            </Link>
            {signedIn ? (
              <>
                <Link href="/today" className="hover:text-stone-300">
                  Today
                </Link>
                <Link href="/calendar" className="hover:text-stone-300">
                  Calendar
                </Link>
              </>
            ) : (
              <a href={LOGIN_HREF} className="hover:text-stone-300">
                Sign in
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  kicker,
  title,
  copy,
  visual,
  reverse,
}: {
  kicker: string;
  title: string;
  copy: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <article
      className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-teal-300">{kicker}</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-stone-50">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">{copy}</p>
      </div>
      {visual}
    </article>
  );
}

function SetsCard() {
  return (
    <div className="rounded-3xl border border-ink-700 bg-ink-900 p-4">
      <p className="text-sm font-medium text-stone-50">DB bench</p>
      <p className="text-xs text-stone-500">4×10 · last time 50 × 10</p>
      <div className="mt-3 space-y-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid grid-cols-[1.5rem_1fr_1fr_auto_auto] items-center gap-2">
            <span className="text-xs text-stone-500">{n}</span>
            <span className="rounded-lg border border-ink-600 bg-ink-950 px-2 py-2 text-xs">50</span>
            <span className="rounded-lg border border-ink-600 bg-ink-950 px-2 py-2 text-xs">10</span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-400 text-xs font-semibold text-ink-950">
              ✓
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink-700 text-amber-200">
              ⏱
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FuelCard() {
  return (
    <div className="space-y-3 rounded-3xl border border-ink-700 bg-ink-900 p-4">
      {["Warmup · 8 moves, including Spanish squat holds", "Before: PB toast + fruit", "After: shake with milk + creatine"].map(
        (label, index) => (
          <div key={label} className="flex items-center gap-3 text-sm text-stone-200">
            <span
              className={`grid h-5 w-5 place-items-center rounded-md border text-[10px] ${
                index < 2
                  ? "border-teal-300 bg-teal-400 font-semibold text-ink-950"
                  : "border-stone-500"
              }`}
            >
              {index < 2 ? "✓" : ""}
            </span>
            {label}
          </div>
        ),
      )}
    </div>
  );
}

function FoodCard() {
  return (
    <div className="rounded-3xl border border-ink-700 bg-ink-900 p-4">
      <div className="flex items-baseline justify-between text-sm">
        <p className="text-stone-200">
          Protein <span className="font-semibold text-stone-50">172.0 g</span>
        </p>
        <p className="text-xs text-stone-500">160–200 g</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full w-[86%] bg-teal-400" />
      </div>
      <p className="mb-2 mt-4 text-[10px] uppercase tracking-wide text-stone-500">On the road</p>
      <div className="flex flex-wrap gap-2">
        {["Eggs · 12g", "Greek yogurt · 17g", "Protein bar · 20g", "Jerky · 12g"].map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs text-stone-100"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function KneeCard() {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-amber-300/40 bg-amber-300/10 px-4 py-3">
        <p className="text-sm font-semibold text-amber-100">Cut jumping this week</p>
        <p className="mt-1 text-xs text-amber-100/75">
          Knee pain 3/10 on 2026-10-14. Warning only — the plan is unchanged.
        </p>
      </div>
      <div className="rounded-3xl border border-ink-700 bg-ink-900 p-4">
        <p className="text-xs text-stone-400">Next-morning knee pain</p>
        <div className="mt-2 grid grid-cols-11 gap-1">
          {Array.from({ length: 11 }, (_, value) => (
            <span
              key={value}
              className={`grid h-7 place-items-center rounded-md text-[10px] ${
                value === 3
                  ? "bg-amber-300 font-semibold text-ink-950"
                  : "bg-ink-800 text-stone-400"
              }`}
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalCard() {
  const cells = ["18", "19", "20", "21", "22", "23", "24"];
  return (
    <div className="rounded-3xl border border-ink-700 bg-ink-900 p-4">
      <p className="mb-3 text-sm font-medium text-stone-50">October 2026</p>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, index) => (
          <div
            key={day}
            className={`grid h-12 place-items-center rounded-xl border text-sm ${
              index === 1
                ? "border-amber-300 bg-amber-300/15 text-amber-100"
                : "border-teal-400/25 bg-teal-400/5 text-stone-100"
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-500">Travel dates tinted · tap a day to open its log</p>
    </div>
  );
}

function TravelCard() {
  return (
    <div className="rounded-3xl border border-ink-700 bg-ink-900 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-stone-500">Travel mode</p>
          <p className="text-sm font-semibold text-stone-50">On for this day</p>
        </div>
        <span className="rounded-full bg-teal-400 px-2.5 py-1 text-[11px] font-semibold text-ink-950">
          Travel
        </span>
      </div>
      <p className="mt-3 text-sm text-stone-300">Oct 18–24 · Raleigh / San Jose</p>
      <p className="mt-2 text-xs leading-relaxed text-stone-400">
        IVL open gym, 8–10:30 PM at Wilcox HS. $14 in Reclub. Cap play at about 90 minutes.
      </p>
    </div>
  );
}

function AmRowFeatureCard() {
  return (
    <div className="rounded-3xl border border-ink-700 bg-ink-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-teal-300">AM Row</p>
          <p className="text-sm font-semibold text-stone-50">1/3/5/3/1 minutes with 2 minutes rest</p>
        </div>
        <span className="rounded-full bg-teal-400 px-2.5 py-1 text-[11px] font-semibold text-ink-950">
          EASY
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-stone-400">
        Same structure at a conversational pace, about 20 spm.
      </p>
      <div className="mt-3 flex gap-2">
        <span className="rounded-lg bg-teal-400 px-3 py-1.5 text-xs font-semibold text-ink-950">
          Done
        </span>
        <span className="rounded-lg bg-ink-700 px-3 py-1.5 text-xs text-stone-300">Skipped</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-400">
        <div className="rounded-lg border border-ink-600 bg-ink-950 px-3 py-2">Time · 21:30</div>
        <div className="rounded-lg border border-ink-600 bg-ink-950 px-3 py-2">Distance · 4500 m</div>
      </div>
    </div>
  );
}
