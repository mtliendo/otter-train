import { addDays } from "./dates";

export type WeekPlanDay = {
  date: string;
  kind: string;
  isJumping: boolean;
  isHeavyLegs: boolean;
};

export type KneeGuardrailWarning = {
  kind: "jumping-days" | "heavy-legs-volleyball";
  message: string;
};

export function travelKneeGuardrails(
  weekDays: WeekPlanDay[],
  lookup: (date: string) => WeekPlanDay | undefined,
): KneeGuardrailWarning[] {
  const warnings: KneeGuardrailWarning[] = [];
  const jumping = weekDays.filter((day) => day.isJumping);

  if (jumping.length > 2) {
    warnings.push({
      kind: "jumping-days",
      message: `More than 2 jumping days this week (${jumping.length}: ${jumping
        .map((day) => day.date)
        .join(", ")}). Warning only — the plan is unchanged.`,
    });
  }

  const heavyNextToVolleyball = weekDays.filter((day) => {
    if (!day.isHeavyLegs) return false;
    const previous = lookup(addDays(day.date, -1));
    const next = lookup(addDays(day.date, 1));
    return previous?.kind === "volleyball" || next?.kind === "volleyball";
  });

  if (heavyNextToVolleyball.length > 0) {
    warnings.push({
      kind: "heavy-legs-volleyball",
      message: `Heavy legs sit the day before or after volleyball (${heavyNextToVolleyball
        .map((day) => day.date)
        .join(", ")}). Warning only — the plan is unchanged.`,
    });
  }

  return warnings;
}
