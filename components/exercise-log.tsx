"use client";

import { useState } from "react";
import { readJson } from "@/lib/client";
import { DEFAULT_REST_SECONDS } from "@/lib/constants";
import type { DayPayload, PlanExercise } from "@/lib/types";

type LoggedExercise = NonNullable<DayPayload["log"]>["exercises"][number];
type PreviousSet = DayPayload["previousByExercise"][string][number];

export function ExerciseList({
  date,
  exercises,
  logged,
  previousByExercise,
  onSaved,
  onStartTimer,
}: {
  date: string;
  exercises: PlanExercise[];
  logged?: LoggedExercise[];
  previousByExercise: DayPayload["previousByExercise"];
  onSaved: (payload: DayPayload) => void;
  onStartTimer: (seconds?: number) => void;
}) {
  const roots = exercises.filter((exercise) => exercise.parentExerciseId == null);
  const childrenOf = (id: number) => exercises.filter((exercise) => exercise.parentExerciseId === id);

  return (
    <div className="space-y-3">
      {roots.map((exercise) => {
        const children = childrenOf(exercise.id);
        if (exercise.isCircuit || children.length > 0) {
          return (
            <article key={exercise.id} className="rounded-2xl border border-ink-700 bg-ink-900 p-3">
              <div className="mb-3">
                <p className="text-[11px] uppercase tracking-wide text-teal-300">Circuit</p>
                <h3 className="font-medium text-stone-50">{exercise.name}</h3>
                <p className="text-xs text-stone-400">
                  {[exercise.prescription, exercise.notes].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="space-y-3">
                {(children.length > 0 ? children : [exercise]).map((child) => (
                  <ExerciseCard
                    key={child.id}
                    nested={children.length > 0}
                    date={date}
                    exercise={child}
                    logged={logged?.find((item) => item.name === child.name)}
                    previous={previousByExercise[child.name] ?? []}
                    onSaved={onSaved}
                    onStartTimer={onStartTimer}
                  />
                ))}
              </div>
            </article>
          );
        }

        return (
          <ExerciseCard
            key={exercise.id}
            date={date}
            exercise={exercise}
            logged={logged?.find((item) => item.name === exercise.name)}
            previous={previousByExercise[exercise.name] ?? []}
            onSaved={onSaved}
            onStartTimer={onStartTimer}
          />
        );
      })}
    </div>
  );
}

function ExerciseCard({
  date,
  exercise,
  logged,
  previous,
  onSaved,
  onStartTimer,
  nested = false,
}: {
  date: string;
  exercise: PlanExercise;
  logged?: LoggedExercise;
  previous: PreviousSet[];
  onSaved: (payload: DayPayload) => void;
  onStartTimer: (seconds?: number) => void;
  nested?: boolean;
}) {
  return (
    <article className={nested ? "rounded-xl border border-ink-600 bg-ink-950 p-2.5" : "rounded-2xl border border-ink-700 bg-ink-900 p-3"}>
      <div className="mb-2">
        <h3 className="font-medium text-stone-50">{exercise.name}</h3>
        <p className="text-xs text-stone-400">
          {[exercise.prescription, exercise.notes, exercise.effort === "seconds" ? "log seconds" : null]
            .filter(Boolean)
            .join(" · ")}
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
              exercise={exercise}
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
  exercise,
  setIndex,
  saved,
  prior,
  onSaved,
  onStartTimer,
}: {
  date: string;
  exercise: PlanExercise;
  setIndex: number;
  saved?: LoggedExercise["sets"][number];
  prior?: PreviousSet;
  onSaved: (payload: DayPayload) => void;
  onStartTimer: (seconds?: number) => void;
}) {
  const timed = exercise.effort === "seconds";
  const [isBodyweight, setIsBodyweight] = useState(
    saved?.isBodyweight ?? prior?.isBodyweight ?? exercise.loadType === "bodyweight",
  );
  const [weight, setWeight] = useState(
    saved?.weight != null ? String(saved.weight) : prior?.weight != null ? String(prior.weight) : "",
  );
  const [addedWeight, setAddedWeight] = useState(
    saved?.addedWeight != null
      ? String(saved.addedWeight)
      : prior?.addedWeight != null
        ? String(prior.addedWeight)
        : "",
  );
  const [reps, setReps] = useState(
    saved?.reps != null ? String(saved.reps) : prior?.reps != null ? String(prior.reps) : "",
  );
  const [seconds, setSeconds] = useState(
    saved?.seconds != null ? String(saved.seconds) : prior?.seconds != null ? String(prior.seconds) : "",
  );
  const completed = saved?.completed ?? false;

  async function save(next?: { completed?: boolean; isBodyweight?: boolean }) {
    const bodyweight = next?.isBodyweight ?? isBodyweight;
    const response = await fetch("/api/sets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        name: exercise.name,
        planExerciseId: exercise.id,
        setIndex,
        isBodyweight: bodyweight,
        weight: bodyweight || weight === "" ? null : Number(weight),
        addedWeight: bodyweight && addedWeight !== "" ? Number(addedWeight) : null,
        reps: timed || reps === "" ? null : Number(reps),
        seconds: timed && seconds !== "" ? Number(seconds) : null,
        completed: next?.completed ?? completed,
      }),
    });
    onSaved(await readJson<DayPayload>(response));
  }

  return (
    <div className="grid grid-cols-[2rem_auto_1fr_1fr_auto_auto] items-center gap-2">
      <span className="text-xs text-stone-500">{setIndex}</span>
      <button
        type="button"
        onClick={() => {
          const next = !isBodyweight;
          setIsBodyweight(next);
          void save({ isBodyweight: next });
        }}
        className={`h-9 rounded-lg px-2 text-[11px] font-semibold ${
          isBodyweight ? "bg-teal-400 text-ink-950" : "bg-ink-700 text-stone-300"
        }`}
        aria-label={`Set ${setIndex} ${isBodyweight ? "bodyweight" : "weighted"}`}
      >
        {isBodyweight ? "BW" : "lb"}
      </button>
      {isBodyweight ? (
        <input
          inputMode="decimal"
          placeholder="+ lb"
          value={addedWeight}
          onChange={(event) => setAddedWeight(event.target.value)}
          onBlur={() => void save()}
          className="w-full rounded-lg border border-ink-600 bg-ink-950 px-2 py-2 text-sm text-stone-100"
          aria-label={`Set ${setIndex} added weight`}
        />
      ) : (
        <input
          inputMode="decimal"
          placeholder="lb"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          onBlur={() => void save()}
          className="w-full rounded-lg border border-ink-600 bg-ink-950 px-2 py-2 text-sm text-stone-100"
          aria-label={`Set ${setIndex} weight`}
        />
      )}
      <input
        inputMode="numeric"
        placeholder={timed ? "sec" : "reps"}
        value={timed ? seconds : reps}
        onChange={(event) => (timed ? setSeconds(event.target.value) : setReps(event.target.value))}
        onBlur={() => void save()}
        className="w-full rounded-lg border border-ink-600 bg-ink-950 px-2 py-2 text-sm text-stone-100"
        aria-label={`Set ${setIndex} ${timed ? "seconds" : "reps"}`}
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
