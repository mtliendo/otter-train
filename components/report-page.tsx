"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInCard } from "@/components/auth-session";
import { TrendChart } from "@/components/trend-chart";
import { readJson } from "@/lib/client";
import { addDays, formatLongDate, formatWeekRange, toISODate } from "@/lib/dates";
import type { ReportPayload } from "@/lib/types";

export function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? toISODate(new Date());
  const [data, setData] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/report?date=${date}`)
      .then((response) => readJson<ReportPayload>(response))
      .then((payload) => {
        if (!cancelled) {
          setError(null);
          setData(payload);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  if (error) {
    if (error === "Unauthorized") {
      return <SignInCard message="Sign in to open the weekly report." />;
    }
    return (
      <div className="p-6">
        <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-sm text-stone-400">Loading report…</div>;
  }

  const splitPoints = data.rows.map((row) => ({
    label: row.date.slice(5),
    value: splitToSeconds(row.avgSplit),
  }));
  const distancePoints = data.rows.map((row) => ({
    label: row.date.slice(5),
    value: row.distanceMeters,
  }));

  return (
    <div className="mx-auto w-full max-w-lg pb-28">
      <header className="sticky top-0 z-20 border-b border-ink-700/80 bg-ink-950/90 px-4 py-3 backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.2em] text-teal-300">Weekly report</p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-ink-800 px-3 py-2 text-lg text-stone-300"
            onClick={() => router.push(`/report?date=${addDays(data.weekStart, -7)}`)}
            aria-label="Previous week"
          >
            ‹
          </button>
          <div className="flex-1 rounded-xl bg-ink-800 px-3 py-2">
            <p className="text-base font-semibold text-stone-50">{formatWeekRange(data.weekStart)}</p>
            <p className="text-xs text-stone-400">Page only — nothing is emailed.</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-ink-800 px-3 py-2 text-lg text-stone-300"
            onClick={() => router.push(`/report?date=${addDays(data.weekStart, 7)}`)}
            aria-label="Next week"
          >
            ›
          </button>
        </div>
      </header>

      <section className="px-4 pt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
          Workouts
        </h2>
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
          <p className="text-2xl font-semibold text-stone-50">
            {data.completedCount}
            <span className="text-base font-normal text-stone-400"> / {data.plannedCount} planned</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {data.days.map((day) => (
              <li key={day.date} className="flex items-center justify-between gap-2">
                <span className="text-stone-200">
                  {formatLongDate(day.date)} · {day.title}
                </span>
                <span className={`text-xs ${day.planned ? (day.completed ? "text-teal-300" : "text-amber-200") : "text-stone-500"}`}>
                  {day.planned ? (day.completed ? "Done" : "Open") : "Rest"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
          Row sessions
        </h2>
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
          <p className="text-xs text-stone-400">Split and distance from confirmed PM5 photos.</p>
          <div className="mt-3">
            <TrendChart points={splitPoints} valueLabel="Avg split (sec /500m)" />
          </div>
          <div className="mt-4">
            <TrendChart points={distancePoints} valueLabel="Distance (m)" />
          </div>
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
          Weight
        </h2>
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
          <TrendChart
            points={data.weight.map((row) => ({
              label: row.weekStart.slice(5),
              value: row.weightLb,
              secondary: row.rollingAvg4,
            }))}
            valueLabel="lb"
            secondaryLabel="4-wk avg"
          />
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
          Knee pain
        </h2>
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
          <TrendChart
            points={data.days.map((day) => ({
              label: day.date.slice(8),
              value: day.kneePain,
            }))}
            valueLabel="0–10"
          />
        </div>
      </section>

      <section className="px-4 pt-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
          Sleep
        </h2>
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
          <p className="text-sm text-stone-200">
            Logged {data.sleepLogged} / 7 mornings
          </p>
          <TrendChart
            points={data.days.map((day) => ({
              label: day.date.slice(8),
              value: day.sleepHours,
            }))}
            valueLabel="Hours"
          />
        </div>
      </section>
    </div>
  );
}

function splitToSeconds(split: string | null) {
  if (!split) return null;
  const match = /^(\d+):(\d+(?:\.\d+)?)$/.exec(split.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}
