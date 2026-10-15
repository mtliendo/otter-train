import type { EffortKind, LoadType } from "@/db/schema";

const BODYWEIGHT_NAMES = [
  "pull-up",
  "push-up",
  "plank",
  "dead bug",
  "copenhagen",
  "jump rope",
  "band pull-apart",
  "vest squat",
  "spanish squat",
  "clamshell",
];

const TIMED_NAMES = ["plank", "copenhagen", "jump rope", "spanish squat hold"];

export function defaultLoadType(name: string, explicit?: LoadType): LoadType {
  if (explicit) return explicit;
  const lower = name.toLowerCase();
  return BODYWEIGHT_NAMES.some((item) => lower.includes(item)) ? "bodyweight" : "weight";
}

export function defaultEffort(name: string, explicit?: EffortKind): EffortKind {
  if (explicit) return explicit;
  const lower = name.toLowerCase();
  return TIMED_NAMES.some((item) => lower.includes(item)) ? "seconds" : "reps";
}

export function isRowExercise(name: string) {
  return /row/i.test(name);
}

export function formatSetLoad(input: {
  isBodyweight: boolean;
  weight: number | null;
  addedWeight: number | null;
}) {
  if (input.isBodyweight) {
    return input.addedWeight != null ? `BW + ${input.addedWeight} lb` : "BW";
  }
  return input.weight != null ? `${input.weight} lb` : "—";
}
