"use client";

import { useState } from "react";
import { TrendChart } from "@/components/trend-chart";
import { readJson } from "@/lib/client";
import { formatLongDate, mondayOfWeek, startOfWeekSunday, weekdayIndex } from "@/lib/dates";
import type { DayPayload } from "@/lib/types";

export function WeighInCard({
  date,
  data,
  onSaved,
}: {
  date: string;
  data: DayPayload;
  onSaved: (payload: DayPayload) => void;
}) {
  const monday = weekdayIndex(date) === 1;
  const [weight, setWeight] = useState(
    data.weight.thisWeek?.weightLb != null ? String(data.weight.thisWeek.weightLb) : "",
  );
  const [weekStart, setWeekStart] = useState(data.weight.thisWeek?.weekStart ?? startOfWeekSunday(date));
  const current = data.weight.history.find((row) => row.weekStart === weekStart) ?? data.weight.thisWeek;

  async function save() {
    if (weight === "") return;
    const response = await fetch("/api/weight", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        weekStart,
        weightLb: Number(weight),
      }),
    });
    onSaved(await readJson<DayPayload>(response));
  }

  return (
    <section id="weigh-in" className="px-4 pt-5">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
        Weekly weight
      </h2>
      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
        {monday ? (
          <p className="mb-3 text-sm font-medium text-teal-200">Monday morning weigh-in</p>
        ) : (
          <p className="mb-3 text-xs text-stone-400">
            Prompted on Mondays. Log or edit any week from here.
          </p>
        )}
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <label className="text-xs text-stone-400">
            Week of {formatLongDate(weekStart)} · Monday {formatLongDate(mondayOfWeek(weekStart))}
            <input
              inputMode="decimal"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              onBlur={() => void save()}
              placeholder={current ? String(current.weightLb) : "lb"}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm text-stone-100"
              aria-label="Weekly weight in pounds"
            />
          </label>
          <label className="text-xs text-stone-400">
            Week start
            <input
              type="date"
              value={weekStart}
              onChange={(event) => setWeekStart(startOfWeekSunday(event.target.value))}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm text-stone-100"
            />
          </label>
        </div>
        {current?.rollingAvg4 != null ? (
          <p className="mt-2 text-xs text-stone-400">
            4-week rolling average: {current.rollingAvg4} lb
          </p>
        ) : null}
        <div className="mt-3">
          <TrendChart
            points={data.weight.history.map((row) => ({
              label: row.weekStart.slice(5),
              value: row.weightLb,
              secondary: row.rollingAvg4,
            }))}
            valueLabel="Weight"
            secondaryLabel="4-wk avg"
          />
        </div>
      </div>
    </section>
  );
}
