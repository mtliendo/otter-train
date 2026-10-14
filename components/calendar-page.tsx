"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInCard } from "@/components/auth-session";
import { CalendarGrid } from "@/components/calendar-grid";
import { readJson } from "@/lib/client";
import { formatMonthTitle, monthKey, parseMonthKey, toISODate } from "@/lib/dates";
import type { CalendarPayload } from "@/lib/types";

export function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = toISODate(new Date());
  const fallback = parseMonthKey(today.slice(0, 7))!;
  const initial = parseMonthKey(searchParams.get("month") ?? "") ?? fallback;
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [marks, setMarks] = useState<CalendarPayload["days"]>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/calendar?month=${monthKey(year, month)}`)
      .then((response) => readJson<CalendarPayload>(response))
      .then((payload) => {
        if (!cancelled) {
          setError(null);
          setMarks(payload.days);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  function shift(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    router.replace(`/calendar?month=${monthKey(next.getFullYear(), next.getMonth())}`);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-teal-300">otter-train</p>
      <div className="mt-2 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} className="rounded-xl bg-ink-800 px-3 py-2">
          ‹
        </button>
        <h1 className="text-xl font-semibold">{formatMonthTitle(year, month)}</h1>
        <button type="button" onClick={() => shift(1)} className="rounded-xl bg-ink-800 px-3 py-2">
          ›
        </button>
      </div>
      <p className="mt-2 text-sm text-stone-400">Tap a day to open its log. Past days stay editable.</p>

      {error === "Unauthorized" ? <SignInCard message="Sign in to open the calendar." /> : null}

      <div className="mt-4 rounded-3xl border border-ink-700 bg-ink-900 p-3">
        {error && error !== "Unauthorized" ? <p className="text-sm text-rose-200">{error}</p> : null}
        <CalendarGrid
          year={year}
          month={month}
          selectedDate={today}
          marks={marks}
          onSelect={(isoDate) => router.push(`/?date=${isoDate}`)}
        />
      </div>

      <ul className="mt-4 space-y-1 text-xs text-stone-400">
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-400" /> Workout done
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-300" /> Protein target hit (160 g+)
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-400" /> Sleep logged
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full border border-teal-300 bg-teal-400/20" /> Travel dates
        </li>
      </ul>
    </div>
  );
}
