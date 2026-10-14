"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInCard, SignOutLink } from "@/components/auth-session";
import { CalendarGrid } from "@/components/calendar-grid";
import { RestTimer, useRestTimer } from "@/components/rest-timer";
import { readJson } from "@/lib/client";
import {
  CREATINE_GRAMS,
  DEFAULT_REST_SECONDS,
  PROTEIN_TARGET_MAX,
  PROTEIN_TARGET_MIN,
} from "@/lib/constants";
import { addDays, formatLongDate, formatMonthTitle, monthKey, toISODate } from "@/lib/dates";
import type { CalendarPayload, DayPayload } from "@/lib/types";

function emptyLog() {
  return {
    workoutCompleted: false,
    warmupDone: false,
    cooldownDone: false,
    fuelingPreDone: false,
    fuelingPostDone: false,
    fuelingEveningDone: false,
    creatineTaken: false,
    habits: {} as Record<string, boolean>,
    food: [] as NonNullable<DayPayload["log"]>["food"],
  };
}

export function TodayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? toISODate(new Date());
  const [data, setData] = useState<DayPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMarks, setPickerMarks] = useState<CalendarPayload["days"]>({});
  const timer = useRestTimer();

  const load = useCallback(async (nextDate: string) => {
    const response = await fetch(`/api/day?date=${nextDate}`);
    return readJson<DayPayload>(response);
  }, []);

  useEffect(() => {
    let cancelled = false;
    load(date)
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
  }, [date, load]);

  useEffect(() => {
    if (!pickerOpen) return;
    const parsed = new Date(date);
    fetch(`/api/calendar?month=${monthKey(parsed.getFullYear(), parsed.getMonth())}`)
      .then((response) => readJson<CalendarPayload>(response))
      .then((payload) => setPickerMarks(payload.days))
      .catch(() => undefined);
  }, [pickerOpen, date]);

  function goTo(nextDate: string) {
    setPickerOpen(false);
    router.push(`/today?date=${nextDate}`);
  }

  async function patchDay(patch: Record<string, unknown>) {
    const response = await fetch("/api/day", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, ...patch }),
    });
    setData(await readJson<DayPayload>(response));
  }

  const log = data?.log ?? emptyLog();
  const pickerDate = useMemo(() => {
    const parsed = new Date(`${date}T00:00:00`);
    return { year: parsed.getFullYear(), month: parsed.getMonth() };
  }, [date]);

  if (error) {
    if (error === "Unauthorized") {
      return <SignInCard message="Sign in to open today's log." />;
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
    return <div className="p-6 text-sm text-stone-400">Loading today…</div>;
  }

  const doneLabel =
    data.plan?.kind === "volleyball"
      ? "Volleyball done"
      : data.plan?.kind === "rest"
        ? "Rest day done"
        : "Workout done";

  return (
    <div className="mx-auto w-full max-w-lg pb-28">
      <header className="sticky top-0 z-20 border-b border-ink-700/80 bg-ink-950/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-teal-300">otter-train</p>
            <p className="text-sm text-stone-400">{data.user.name}</p>
            <SignOutLink stub={data.user.stub} />
          </div>
          <button
            type="button"
            onClick={() => patchDay({ workoutCompleted: !log.workoutCompleted })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              log.workoutCompleted
                ? "bg-teal-400 text-ink-950"
                : "bg-ink-700 text-stone-200"
            }`}
          >
            {log.workoutCompleted ? "Done" : doneLabel}
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-ink-800 px-3 py-2 text-lg text-stone-300"
            onClick={() => goTo(addDays(date, -1))}
            aria-label="Previous day"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex-1 rounded-xl bg-ink-800 px-3 py-2 text-left"
          >
            <p className="text-base font-semibold text-stone-50">{formatLongDate(date)}</p>
            <p className="text-xs text-stone-400">
              {data.travel.active
                ? `Travel${data.travel.range ? ` · ${data.travel.range.startDate}–${data.travel.range.endDate}` : ""}`
                : "Tap to open calendar"}
            </p>
          </button>
          <button
            type="button"
            className="rounded-xl bg-ink-800 px-3 py-2 text-lg text-stone-300"
            onClick={() => goTo(addDays(date, 1))}
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </header>

      {data.kneeWarning.active ? (
        <div className="mx-4 mt-4 rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3">
          <p className="text-sm font-semibold text-amber-100">Cut jumping this week</p>
          <p className="mt-1 text-xs text-amber-100/80">
            Knee pain {data.kneeWarning.kneePain}/10 on {data.kneeWarning.sourceDate}. Warning
            only — the plan is unchanged.
          </p>
        </div>
      ) : null}

      {data.kneeGuardrails.map((warning) => (
        <div
          key={warning.kind}
          className="mx-4 mt-4 rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3"
        >
          <p className="text-sm font-semibold text-amber-100">
            {warning.kind === "jumping-days"
              ? "Too many jumping days"
              : "Heavy legs next to volleyball"}
          </p>
          <p className="mt-1 text-xs text-amber-100/80">{warning.message}</p>
        </div>
      ))}

      <TravelCard
        key={`${date}-${data.travel.range?.id ?? "none"}-${data.travel.range?.startDate ?? ""}-${data.travel.range?.endDate ?? ""}`}
        date={date}
        data={data}
        onSaved={setData}
      />
      <DayNoteCard key={`${date}-note`} date={date} notes={data.log?.notes ?? ""} onSaved={setData} />

      {data.plan ? (
        <section className="px-4 pt-5">
          <p className="text-xs uppercase tracking-wide text-teal-300">
            {data.travel.active ? "travel · " : ""}
            {data.plan.kind}
          </p>
          <h1 className="text-2xl font-semibold text-stone-50">{data.plan.title}</h1>
          {data.plan.subtitle ? (
            <p className="text-sm text-stone-400">{data.plan.subtitle}</p>
          ) : null}
          {data.plan.location || data.plan.timeWindow ? (
            <p className="mt-1 text-sm text-stone-300">
              {[data.plan.location, data.plan.timeWindow].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {data.plan.notes ? (
            <p className="mt-2 text-sm text-stone-400">{data.plan.notes}</p>
          ) : null}
        </section>
      ) : (
        <p className="px-4 pt-5 text-sm text-stone-400">No plan seeded for this weekday.</p>
      )}

      {data.plan?.warmup.length ? (
        <ChecklistCard
          title="Warmup"
          done={log.warmupDone}
          onToggle={() => patchDay({ warmupDone: !log.warmupDone })}
          items={data.plan.warmup}
        />
      ) : null}

      {data.plan?.exercises.length ? (
        <section className="px-4 pt-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            Exercises
          </h2>
          <div className="space-y-3">
            {data.plan.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                date={date}
                exercise={exercise}
                logged={data.log?.exercises.find((item) => item.name === exercise.name)}
                previous={data.previousByExercise[exercise.name] ?? []}
                onSaved={setData}
                onStartTimer={timer.start}
              />
            ))}
          </div>
        </section>
      ) : null}

      {data.plan?.cooldown.length ? (
        <ChecklistCard
          title="Cooldown"
          done={log.cooldownDone}
          onToggle={() => patchDay({ cooldownDone: !log.cooldownDone })}
          items={data.plan.cooldown}
        />
      ) : null}

      {data.plan ? (
        <section className="px-4 pt-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            Fueling
          </h2>
          <div className="space-y-2 rounded-2xl border border-ink-700 bg-ink-900 p-3">
            <FuelRow
              label="Before"
              value={data.plan.fueling.pre}
              done={log.fuelingPreDone}
              onToggle={() => patchDay({ fuelingPreDone: !log.fuelingPreDone })}
            />
            <FuelRow
              label="After"
              value={data.plan.fueling.post}
              done={log.fuelingPostDone}
              onToggle={() => patchDay({ fuelingPostDone: !log.fuelingPostDone })}
            />
            <FuelRow
              label="Evening"
              value={data.plan.fueling.evening}
              done={log.fuelingEveningDone}
              onToggle={() => patchDay({ fuelingEveningDone: !log.fuelingEveningDone })}
            />
          </div>
        </section>
      ) : null}

      {data.plan?.habits.length ? (
        <section className="px-4 pt-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
            Daily extras
          </h2>
          <div className="space-y-2 rounded-2xl border border-ink-700 bg-ink-900 p-3">
            {data.plan.habits.map((habit) => (
              <CheckRow
                key={habit.id}
                label={habit.name}
                detail={habit.prescription}
                checked={Boolean(log.habits[String(habit.id)])}
                onToggle={() =>
                  patchDay({
                    habits: { [habit.id]: !log.habits[String(habit.id)] },
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      <FoodSection date={date} data={data} onSaved={setData} onPatchDay={patchDay} />
      <SleepSection key={date} date={date} data={data} onSaved={setData} />

      <RestTimer running={timer.running} seconds={timer.seconds} onStop={timer.stop} />

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setPickerOpen(false)}>
          <div
            className="mx-auto mt-16 max-w-lg rounded-3xl border border-ink-700 bg-ink-900 p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {formatMonthTitle(pickerDate.year, pickerDate.month)}
              </h2>
              <button
                type="button"
                className="text-sm text-stone-400"
                onClick={() => setPickerOpen(false)}
              >
                Close
              </button>
            </div>
            <CalendarGrid
              year={pickerDate.year}
              month={pickerDate.month}
              selectedDate={date}
              marks={pickerMarks}
              onSelect={goTo}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StapleGroup({
  title,
  staples,
  onAdd,
}: {
  title: string;
  staples: DayPayload["food"]["staples"];
  onAdd: (staple: DayPayload["food"]["staples"][number]) => void;
}) {
  if (staples.length === 0) return null;
  return (
    <>
      <p className="mb-2 mt-3 text-xs uppercase tracking-wide text-stone-500">{title}</p>
      <div className="flex flex-wrap gap-2">
        {staples.map((staple) => (
          <button
            key={staple.id}
            type="button"
            onClick={() => onAdd(staple)}
            className="rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs text-stone-100"
          >
            {staple.name} · {staple.proteinGrams}g
          </button>
        ))}
      </div>
    </>
  );
}

function TravelCard({
  date,
  data,
  onSaved,
}: {
  date: string;
  data: DayPayload;
  onSaved: (payload: DayPayload) => void;
}) {
  const [startDate, setStartDate] = useState(data.travel.range?.startDate ?? date);
  const [endDate, setEndDate] = useState(data.travel.range?.endDate ?? date);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/travel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          id: data.travel.range?.id,
          startDate,
          endDate,
        }),
      });
      onSaved(await readJson<DayPayload>(response));
    } finally {
      setSaving(false);
    }
  }

  async function clearRange() {
    if (!data.travel.range) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/travel?date=${date}&id=${data.travel.range.id}`, {
        method: "DELETE",
      });
      onSaved(await readJson<DayPayload>(response));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="px-4 pt-5">
      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">Travel mode</p>
            <p className="text-sm font-semibold text-stone-50">
              {data.travel.active ? "On for this day" : "Off — home plan"}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Date range only. Days inside use hotel/bodyweight templates; it turns off after the
              end date. Calendar events do not toggle this.
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              data.travel.active ? "bg-teal-400 text-ink-950" : "bg-ink-700 text-stone-300"
            }`}
          >
            {data.travel.active ? "Travel" : "Home"}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="text-xs text-stone-400">
            Start
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm text-stone-100"
            />
          </label>
          <label className="text-xs text-stone-400">
            End
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm text-stone-100"
            />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-lg bg-teal-400 px-3 py-2 text-sm font-semibold text-ink-950 disabled:opacity-60"
          >
            {data.travel.range ? "Update dates" : "Set travel dates"}
          </button>
          {data.travel.range ? (
            <button
              type="button"
              onClick={() => void clearRange()}
              disabled={saving}
              className="rounded-lg bg-ink-700 px-3 py-2 text-sm text-stone-200 disabled:opacity-60"
            >
              Clear this trip
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DayNoteCard({
  date,
  notes,
  onSaved,
}: {
  date: string;
  notes: string;
  onSaved: (payload: DayPayload) => void;
}) {
  const [value, setValue] = useState(notes);

  async function save() {
    if (value === notes) return;
    const response = await fetch("/api/day", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, notes: value === "" ? null : value }),
    });
    onSaved(await readJson<DayPayload>(response));
  }

  return (
    <section className="px-4 pt-5">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
        Day note
      </h2>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => void save()}
        rows={4}
        placeholder="Trip details — talk time, gym pickup, open gym, flights…"
        className="w-full rounded-2xl border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-stone-100"
      />
    </section>
  );
}

function ChecklistCard({
  title,
  done,
  onToggle,
  items,
}: {
  title: string;
  done: boolean;
  onToggle: () => void;
  items: string[];
}) {
  return (
    <section className="px-4 pt-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">{title}</h2>
        <button
          type="button"
          onClick={onToggle}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            done ? "bg-teal-400 text-ink-950" : "bg-ink-700 text-stone-200"
          }`}
        >
          {done ? "Done" : "Mark done"}
        </button>
      </div>
      <ul className="space-y-1.5 rounded-2xl border border-ink-700 bg-ink-900 p-3 text-sm text-stone-200">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FuelRow({
  label,
  value,
  done,
  onToggle,
}: {
  label: string;
  value: string | null;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <CheckRow
      label={`${label}: ${value ?? "—"}`}
      checked={done}
      onToggle={onToggle}
    />
  );
}

function CheckRow({
  label,
  detail,
  checked,
  onToggle,
}: {
  label: string;
  detail?: string | null;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-start gap-3 rounded-xl px-1 py-1.5 text-left"
    >
      <span
        className={`mt-0.5 grid h-5 w-5 place-items-center rounded-md border ${
          checked ? "border-teal-300 bg-teal-400 text-ink-950" : "border-stone-500"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      <span>
        <span className="block text-sm text-stone-100">{label}</span>
        {detail ? <span className="block text-xs text-stone-400">{detail}</span> : null}
      </span>
    </button>
  );
}

function ExerciseCard({
  date,
  exercise,
  logged,
  previous,
  onSaved,
  onStartTimer,
}: {
  date: string;
  exercise: NonNullable<DayPayload["plan"]>["exercises"][number];
  logged?: NonNullable<DayPayload["log"]>["exercises"][number];
  previous: { setIndex: number; weight: number | null; reps: number | null }[];
  onSaved: (payload: DayPayload) => void;
  onStartTimer: (seconds?: number) => void;
}) {
  return (
    <article className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
      <div className="mb-2">
        <h3 className="font-medium text-stone-50">{exercise.name}</h3>
        <p className="text-xs text-stone-400">
          {[exercise.prescription, exercise.notes].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="space-y-2">
        {Array.from({ length: exercise.targetSets }, (_, index) => {
          const setIndex = index + 1;
          const saved = logged?.sets.find((set) => set.setIndex === setIndex);
          const prior = previous.find((set) => set.setIndex === setIndex);
          return (
            <SetRow
              key={`${date}-${exercise.id}-${setIndex}`}
              date={date}
              exerciseName={exercise.name}
              planExerciseId={exercise.id}
              setIndex={setIndex}
              saved={saved}
              prior={prior}
              onSaved={onSaved}
              onStartTimer={onStartTimer}
            />
          );
        })}
      </div>
    </article>
  );
}

function SetRow({
  date,
  exerciseName,
  planExerciseId,
  setIndex,
  saved,
  prior,
  onSaved,
  onStartTimer,
}: {
  date: string;
  exerciseName: string;
  planExerciseId: number;
  setIndex: number;
  saved?: { weight: number | null; reps: number | null; completed: boolean };
  prior?: { weight: number | null; reps: number | null };
  onSaved: (payload: DayPayload) => void;
  onStartTimer: (seconds?: number) => void;
}) {
  const [weight, setWeight] = useState(
    saved?.weight != null ? String(saved.weight) : prior?.weight != null ? String(prior.weight) : "",
  );
  const [reps, setReps] = useState(
    saved?.reps != null ? String(saved.reps) : prior?.reps != null ? String(prior.reps) : "",
  );
  const completed = saved?.completed ?? false;

  async function save(next?: { completed?: boolean }) {
    const response = await fetch("/api/sets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        name: exerciseName,
        planExerciseId,
        setIndex,
        weight: weight === "" ? null : Number(weight),
        reps: reps === "" ? null : Number(reps),
        completed: next?.completed ?? completed,
      }),
    });
    onSaved(await readJson<DayPayload>(response));
  }

  return (
    <div className="grid grid-cols-[2rem_1fr_1fr_auto_auto] items-center gap-2">
      <span className="text-xs text-stone-500">{setIndex}</span>
      <input
        inputMode="decimal"
        placeholder="lb"
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        onBlur={() => void save()}
        className="w-full rounded-lg border border-ink-600 bg-ink-950 px-2 py-2 text-sm text-stone-100"
        aria-label={`Set ${setIndex} weight`}
      />
      <input
        inputMode="numeric"
        placeholder="reps"
        value={reps}
        onChange={(event) => setReps(event.target.value)}
        onBlur={() => void save()}
        className="w-full rounded-lg border border-ink-600 bg-ink-950 px-2 py-2 text-sm text-stone-100"
        aria-label={`Set ${setIndex} reps`}
      />
      <button
        type="button"
        onClick={() => void save({ completed: !completed })}
        className={`h-9 w-9 rounded-lg text-sm font-semibold ${
          completed ? "bg-teal-400 text-ink-950" : "bg-ink-700 text-stone-300"
        }`}
        aria-label={`Mark set ${setIndex} complete`}
      >
        ✓
      </button>
      <button
        type="button"
        onClick={() => onStartTimer(DEFAULT_REST_SECONDS)}
        className="h-9 w-9 rounded-lg bg-ink-700 text-amber-200"
        aria-label={`Start ${DEFAULT_REST_SECONDS}s rest`}
      >
        ⏱
      </button>
    </div>
  );
}

function FoodSection({
  date,
  data,
  onSaved,
  onPatchDay,
}: {
  date: string;
  data: DayPayload;
  onSaved: (payload: DayPayload) => void;
  onPatchDay: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const [customName, setCustomName] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const entries = data.log?.food ?? [];
  const total = data.food.totalProtein;
  const inRange = total >= PROTEIN_TARGET_MIN && total <= PROTEIN_TARGET_MAX;
  const under = total < PROTEIN_TARGET_MIN;
  const ratio = Math.min(total / PROTEIN_TARGET_MAX, 1);

  async function add(name: string, proteinGrams: number, stapleId?: number) {
    const response = await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, name, proteinGrams, stapleId }),
    });
    onSaved(await readJson<DayPayload>(response));
  }

  async function updateProtein(id: number, proteinGrams: number) {
    const response = await fetch("/api/food", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, id, proteinGrams }),
    });
    onSaved(await readJson<DayPayload>(response));
  }

  async function remove(id: number) {
    const response = await fetch(`/api/food?date=${date}&id=${id}`, { method: "DELETE" });
    onSaved(await readJson<DayPayload>(response));
  }

  return (
    <section id="food" className="px-4 pt-5">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">Food</h2>
      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
        <div className="mb-3">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-stone-200">
              Protein{" "}
              <span className="font-semibold text-stone-50">{total.toFixed(1)} g</span>
            </p>
            <p className="text-xs text-stone-400">
              target {PROTEIN_TARGET_MIN}–{PROTEIN_TARGET_MAX} g
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-700">
            <div
              className={`h-full ${inRange ? "bg-teal-400" : under ? "bg-amber-300" : "bg-rose-300"}`}
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
        </div>

        <CheckRow
          label={`Creatine ${CREATINE_GRAMS} g`}
          checked={Boolean(data.log?.creatineTaken)}
          onToggle={() => onPatchDay({ creatineTaken: !data.log?.creatineTaken })}
        />

        <StapleGroup
          title="House staples"
          staples={data.food.staples.filter((staple) => staple.stapleSet !== "road")}
          onAdd={(staple) => void add(staple.name, staple.proteinGrams, staple.id)}
        />

        {data.travel.active ? (
          <StapleGroup
            title="On the road"
            staples={data.food.staples.filter((staple) => staple.stapleSet === "road")}
            onAdd={(staple) => void add(staple.name, staple.proteinGrams, staple.id)}
          />
        ) : null}

        <div className="mt-3 flex gap-2">
          <input
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
            placeholder="Free-text food"
            className="min-w-0 flex-1 rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm"
          />
          <input
            inputMode="decimal"
            value={customProtein}
            onChange={(event) => setCustomProtein(event.target.value)}
            placeholder="g"
            className="w-16 shrink-0 rounded-lg border border-ink-600 bg-ink-950 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (!customName || customProtein === "") return;
              void add(customName, Number(customProtein));
              setCustomName("");
              setCustomProtein("");
            }}
            className="shrink-0 rounded-lg bg-amber-300 px-3 text-sm font-semibold text-ink-950"
          >
            Add
          </button>
        </div>

        <ul className="mt-3 space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1 text-stone-100">{entry.name}</span>
              <input
                inputMode="decimal"
                defaultValue={entry.proteinGrams}
                onBlur={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isFinite(next) && next !== entry.proteinGrams) {
                    void updateProtein(entry.id, next);
                  }
                }}
                className="w-16 rounded-lg border border-ink-600 bg-ink-950 px-2 py-1 text-right"
                aria-label={`${entry.name} protein grams`}
              />
              <span className="text-xs text-stone-500">g</span>
              <button
                type="button"
                onClick={() => void remove(entry.id)}
                className="text-xs text-rose-200"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SleepSection({
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
    <section className="px-4 pt-5">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-400">
        Sleep
      </h2>
      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
        <p className="mb-3 text-xs text-stone-400">Morning entry. Past days stay editable.</p>
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
        <p className="mb-2 mt-4 text-xs text-stone-400">Quality 1–5</p>
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
        <p className="mb-2 mt-4 text-xs text-stone-400">Next-morning knee pain 0–10</p>
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
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
