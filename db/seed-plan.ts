import { eq } from "drizzle-orm";
import {
  FOOD_STAPLES,
  FUELING,
  VOLLEYBALL_COOLDOWN,
  VOLLEYBALL_WARMUP,
  WORKOUT_COOLDOWN,
  WORKOUT_WARMUP,
} from "../lib/constants";
import type { AppDb } from "./index";
import { dailyHabits, foodStaples, planExercises, weekdayPlans } from "./schema";

type SeedExercise = {
  name: string;
  prescription?: string;
  targetSets: number;
  targetReps?: string;
  notes?: string;
  isCircuit?: boolean;
};

type SeedPlan = {
  weekday: number;
  title: string;
  subtitle?: string;
  kind: string;
  location?: string;
  timeWindow?: string;
  notes?: string;
  warmup: string[];
  cooldown: string[];
  exercises: SeedExercise[];
};

const plans: SeedPlan[] = [
  {
    weekday: 1,
    title: "Push + arms",
    subtitle: "Upper body press and arms",
    kind: "workout",
    notes: "League night from Nov 2 — keep the 10-min easy row.",
    warmup: WORKOUT_WARMUP,
    cooldown: WORKOUT_COOLDOWN,
    exercises: [
      { name: "DB bench", prescription: "4×8–10", targetSets: 4, targetReps: "8-10" },
      { name: "Flys", prescription: "3×12", targetSets: 3, targetReps: "12" },
      {
        name: "Push-ups",
        prescription: "3 sets near failure",
        targetSets: 3,
        notes: "Near failure each set",
      },
      { name: "Skull crushers", prescription: "3×12", targetSets: 3, targetReps: "12" },
      { name: "Curls", prescription: "3×12", targetSets: 3, targetReps: "12" },
      {
        name: "Easy row",
        prescription: "10 min",
        targetSets: 1,
        notes: "League night from Nov 2",
      },
    ],
  },
  {
    weekday: 2,
    title: "Rower + core",
    subtitle: "Intervals and midline",
    kind: "workout",
    warmup: WORKOUT_WARMUP,
    cooldown: WORKOUT_COOLDOWN,
    exercises: [
      {
        name: "Rower intervals",
        prescription: "8× (1 min hard / 1 min easy)",
        targetSets: 8,
        notes: "1 min hard, 1 min easy",
      },
      { name: "Planks", prescription: "3 rounds", targetSets: 3, isCircuit: true },
      { name: "Side planks", prescription: "3 rounds", targetSets: 3, isCircuit: true },
      { name: "Dead bugs", prescription: "3 rounds", targetSets: 3, isCircuit: true },
    ],
  },
  {
    weekday: 3,
    title: "Legs",
    subtitle: "Squats, hinges, calves",
    kind: "workout",
    warmup: WORKOUT_WARMUP,
    cooldown: WORKOUT_COOLDOWN,
    exercises: [
      { name: "Vest / KB tempo squats", prescription: "4×8", targetSets: 4, targetReps: "8" },
      { name: "Slant-board squats", prescription: "3×12", targetSets: 3, targetReps: "12" },
      { name: "RDLs", prescription: "4×8", targetSets: 4, targetReps: "8" },
      { name: "Hip thrusts", prescription: "3×12", targetSets: 3, targetReps: "12" },
      { name: "Calf raises", prescription: "4×15", targetSets: 4, targetReps: "15" },
    ],
  },
  {
    weekday: 4,
    title: "Back",
    subtitle: "Pulls, rows, arms",
    kind: "workout",
    warmup: WORKOUT_WARMUP,
    cooldown: WORKOUT_COOLDOWN,
    exercises: [
      { name: "Pull-ups", prescription: "4 sets", targetSets: 4 },
      { name: "Chest-supported DB rows", prescription: "4×10", targetSets: 4, targetReps: "10" },
      { name: "Single-arm KB rows", prescription: "3×10", targetSets: 3, targetReps: "10" },
      { name: "Band pull-aparts", prescription: "3×15", targetSets: 3, targetReps: "15" },
      { name: "Curls", prescription: "3×12", targetSets: 3, targetReps: "12" },
      { name: "Oblique circuit", prescription: "3 rounds", targetSets: 3, isCircuit: true },
      { name: "Easy row", prescription: "15–20 min", targetSets: 1 },
    ],
  },
  {
    weekday: 5,
    title: "Volleyball",
    subtitle: "Beyond the Baseline",
    kind: "volleyball",
    location: "Beyond the Baseline",
    timeWindow: "12:30–3:00",
    notes: "Court time 12:30–3. Use volleyball warmup and cooldown.",
    warmup: VOLLEYBALL_WARMUP,
    cooldown: VOLLEYBALL_COOLDOWN,
    exercises: [
      {
        name: "Volleyball session",
        prescription: "Match / open play",
        targetSets: 1,
        notes: "Beyond the Baseline 12:30–3",
      },
    ],
  },
  {
    weekday: 6,
    title: "Hybrid circuit",
    subtitle: "4–5 rounds",
    kind: "hybrid",
    warmup: WORKOUT_WARMUP,
    cooldown: WORKOUT_COOLDOWN,
    exercises: [
      {
        name: "250 m row",
        prescription: "4–5 rounds",
        targetSets: 5,
        isCircuit: true,
      },
      {
        name: "KB swings",
        prescription: "15 reps",
        targetSets: 5,
        targetReps: "15",
        isCircuit: true,
      },
      {
        name: "Push-ups",
        prescription: "15 reps",
        targetSets: 5,
        targetReps: "15",
        isCircuit: true,
      },
      {
        name: "Vest squats",
        prescription: "10 reps",
        targetSets: 5,
        targetReps: "10",
        isCircuit: true,
      },
      {
        name: "Jump rope",
        prescription: "30 s",
        targetSets: 5,
        isCircuit: true,
      },
      {
        name: "Single-leg calf raises",
        prescription: "10 / side",
        targetSets: 5,
        targetReps: "10",
        isCircuit: true,
      },
    ],
  },
  {
    weekday: 0,
    title: "Rest",
    subtitle: "Dog walk + mobility",
    kind: "rest",
    notes: "Easy day. Walk the dog and move, no training load.",
    warmup: [],
    cooldown: [],
    exercises: [
      { name: "Dog walk", prescription: "Easy", targetSets: 1 },
      { name: "Mobility", prescription: "As needed", targetSets: 1 },
    ],
  },
];

const habits = [
  { name: "Spanish squat holds", prescription: "3×30–45 s", sortOrder: 0 },
  { name: "Clamshells or lateral walks", prescription: "Daily", sortOrder: 1 },
  { name: "Slant board", prescription: "3–4 days / week", sortOrder: 2 },
  { name: "Midday walk", prescription: "Daily", sortOrder: 3 },
];

export async function seedUserPlan(
  db: AppDb,
  userId: string,
  options: { force?: boolean } = {},
) {
  const existing = await db
    .select({ id: weekdayPlans.id })
    .from(weekdayPlans)
    .where(eq(weekdayPlans.userId, userId))
    .limit(1);

  if (existing.length > 0 && options.force) {
    await db.delete(weekdayPlans).where(eq(weekdayPlans.userId, userId));
    await db.delete(dailyHabits).where(eq(dailyHabits.userId, userId));
    await db.delete(foodStaples).where(eq(foodStaples.userId, userId));
  } else if (existing.length > 0) {
    return false;
  }

  for (const plan of plans) {
    const [created] = await db
      .insert(weekdayPlans)
      .values({
        userId,
        weekday: plan.weekday,
        title: plan.title,
        subtitle: plan.subtitle,
        kind: plan.kind,
        location: plan.location,
        timeWindow: plan.timeWindow,
        notes: plan.notes,
        warmup: plan.warmup,
        cooldown: plan.cooldown,
        fuelingPre: FUELING.pre,
        fuelingPost: FUELING.post,
        fuelingEvening: FUELING.evening,
      })
      .returning();

    if (!created) {
      throw new Error(`Failed to insert weekday plan ${plan.weekday}`);
    }

    if (plan.exercises.length > 0) {
      await db.insert(planExercises).values(
        plan.exercises.map((exercise, index) => ({
          weekdayPlanId: created.id,
          name: exercise.name,
          prescription: exercise.prescription,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          notes: exercise.notes,
          sortOrder: index,
          isCircuit: exercise.isCircuit ?? false,
        })),
      );
    }
  }

  await db.insert(dailyHabits).values(
    habits.map((habit) => ({
      userId,
      ...habit,
    })),
  );

  await db.insert(foodStaples).values(
    FOOD_STAPLES.map((staple) => ({
      userId,
      name: staple.name,
      proteinGrams: staple.proteinGrams.toFixed(1),
      sortOrder: staple.sortOrder,
    })),
  );

  return true;
}

export async function ensureUserSeeded(db: AppDb, userId: string) {
  await seedUserPlan(db, userId);
}
