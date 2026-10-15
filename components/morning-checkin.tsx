"use client";

import { useState } from "react";
import { readJson } from "@/lib/client";
import type { DayPayload } from "@/lib/types";

export function MorningCheckin({
  date,
  data,
  onSaved,
}: {
  date: string;
  data: DayPayload;
  onSaved: (payload: DayPayload) => void;
}) {
  const [bedtime, setBedtime] = useState(data.sleep?.bedtime ?? "22:30");
  const [wakeTime, setWakeTime] = useState(data.sleep?.wakeTime ?? "06:30");
  const [quality, setQuality] = useState(data.sleep?.quality ?? 3);
  const [kneePain, setKneePain] = useState(data.sleep?.kneePain ?? 0);

  async function save(next?: Partial<{ quality: number; kneePain: number }>) {
    const response = await fetch("/api/sleep", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        bedtime,
        wakeTime,
        quality: next?.quality ?? quality,
        kneePain: next?.kneePain ?? kneePain,
      }),
    });
    onSaved(await readJson<DayPayload>(response));
  }

  return (
    <section id="sleep" className="px-4 pt-5">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
        Morning check-in
      </h2>
      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
        <p className="mb-3 text-xs text-stone-400">
          Sleep and next-morning knee pain. Saves on blur or tap. Past days stay editable.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-stone-400">
            Bedtime
            <input
              type="time"
              value={bedtime}
              onChange={(event) => setBedtime(event.target.value)}
              onBlur={() => void save()}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm text-stone-100"
            />
          </label>
          <label className="text-xs text-stone-400">
            Wake
            <input
              type="time"
              value={wakeTime}
              onChange={(event) => setWakeTime(event.target.value)}
              onBlur={() => void save()}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm text-stone-100"
            />
          </label>
        </div>
        <p className="mb-2 mt-4 text-xs text-stone-400">Sleep quality 1–5</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setQuality(value);
                void save({ quality: value });
              }}
              className={`h-9 flex-1 rounded-lg text-sm ${
                quality === value ? "bg-amber-300 text-ink-950" : "bg-ink-800 text-stone-200"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <p id="knee-pain" className="mb-2 mt-4 text-xs text-stone-400">
          Next-morning knee pain 0–10
        </p>
        <div className="grid grid-cols-11 gap-1">
          {Array.from({ length: 11 }, (_, value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setKneePain(value);
                void save({ kneePain: value });
              }}
              className={`h-8 rounded-md text-[11px] ${
                kneePain === value
                  ? value >= 3
                    ? "bg-amber-300 text-ink-950"
                    : "bg-teal-400 text-ink-950"
                  : "bg-ink-800 text-stone-300"
              }`}
              aria-label={`Knee pain ${value}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
