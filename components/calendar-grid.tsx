"use client";

import { daysInMonth, toISODate } from "@/lib/dates";
import { WEEKDAY_NAMES } from "@/lib/constants";
import type { CalendarDayMarks } from "@/lib/types";

type CalendarGridProps = {
  year: number;
  month: number;
  selectedDate?: string;
  marks?: Record<string, CalendarDayMarks>;
  onSelect: (isoDate: string) => void;
};

export function CalendarGrid({
  year,
  month,
  selectedDate,
  marks = {},
  onSelect,
}: CalendarGridProps) {
  const firstDow = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const today = toISODate(new Date());
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: total }, (_, index) => index + 1),
  ];

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 text-center text-[11px] uppercase tracking-wide text-stone-500">
        {WEEKDAY_NAMES.map((name) => (
          <div key={name}>{name}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-14" />;
          }
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayMarks = marks[iso];
          const selected = selectedDate === iso;
          const isToday = today === iso;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`flex h-14 flex-col items-center justify-center rounded-xl border text-sm ${
                selected
                  ? "border-amber-300 bg-amber-300/15 text-amber-100"
                  : isToday
                    ? "border-teal-400/50 bg-teal-400/10 text-stone-100"
                    : "border-transparent text-stone-200 hover:bg-ink-700"
              }`}
            >
              <span className="font-medium">{day}</span>
              <span className="mt-1 flex gap-0.5">
                <Dot on={Boolean(dayMarks?.workout)} className="bg-teal-400" />
                <Dot on={Boolean(dayMarks?.protein)} className="bg-amber-300" />
                <Dot on={Boolean(dayMarks?.sleep)} className="bg-violet-400" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Dot({ on, className }: { on: boolean; className: string }) {
  return (
    <span
      className={`h-1.5 w-1.5 rounded-full ${on ? className : "bg-ink-600"}`}
      aria-hidden
    />
  );
}
