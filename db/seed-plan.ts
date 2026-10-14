import { and, eq } from "drizzle-orm";
import {
  DEFAULT_TRAVEL_RANGE,
  FOOD_STAPLES,
  FUELING,
  ROAD_STAPLES,
  TRAVEL_COOLDOWN,
  TRAVEL_DAY_NOTES,
  TRAVEL_WARMUP,
  VOLLEYBALL_COOLDOWN,
  VOLLEYBALL_WARMUP,
  WORKOUT_COOLDOWN,
  WORKOUT_WARMUP,
} from "../lib/constants";
import type { AppDb } from "./index";
import { dailyHabits, dayLogs, foodStaples, planExercises, travelRanges, weekdayPlans } from "./schema";

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
  variant: "home" | "travel";
  title: string;
  subtitle?: string;
  kind: string;
  location?: string;
  timeWindow?: string;
  notes?: string;
  warmup: string[];
  cooldown: string[];
  isJumping?: boolean;
  isHeavyLegs?: boolean;
  exercises: SeedExercise[];
};

const homePlans: SeedPlan[] = [
  {
    weekday: 1,
    variant: "home",
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
    variant: "home",
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
    variant: "home",
    title: "Legs",
    subtitle: "Squats, hinges, calves",
    kind: "workout",
    isHeavyLegs: true,
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
    variant: "home",
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
    variant: "home",
    title: "Volleyball",
    subtitle: "Beyond the Baseline",
    kind: "volleyball",
    location: "Beyond the Baseline",
    timeWindow: "12:30–3:00",
    isJumping: true,
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
    variant: "home",
    title: "Hybrid circuit",
    subtitle: "4–5 rounds",
    kind: "hybrid",
    isJumping: true,
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
    variant: "home",
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

const travelPlans: SeedPlan[] = [
  {
    weekday: 0,
    variant: "travel",
    title: "Travel / rest",
    subtitle: "Walk + mobility after the flight",
    kind: "rest",
    notes: "Hotel-room day. Daily knee work: Spanish squat holds, clamshells, 20–30 min walk.",
    warmup: [],
    cooldown: [],
    exercises: [
      { name: "Walk", prescription: "20–30 min", targetSets: 1 },
      { name: "Hips and calves mobility", prescription: "As needed", targetSets: 1 },
      { name: "Spanish squat holds", prescription: "3×30–45 s", targetSets: 3 },
    ],
  },
  {
    weekday: 1,
    variant: "travel",
    title: "Hotel upper body",
    subtitle: "Press, rows, arms · about 40 min",
    kind: "workout",
    notes: "Hotel gym. Pack a mini band and the long band. Finish with 10 min easy on the rower or bike.",
    warmup: TRAVEL_WARMUP,
    cooldown: TRAVEL_COOLDOWN,
    exercises: [
      { name: "DB bench", prescription: "4×10", targetSets: 4, targetReps: "10" },
      {
        name: "DB rows",
        prescription: "4×10",
        targetSets: 4,
        targetReps: "10",
        notes: "Chest-supported on an incline bench if there is one",
      },
      {
        name: "Push-ups",
        prescription: "3 sets near failure",
        targetSets: 3,
        notes: "Near failure each set",
      },
      { name: "Curls", prescription: "3×12", targetSets: 3, targetReps: "12" },
      { name: "Skull crushers", prescription: "3×12", targetSets: 3, targetReps: "12" },
      { name: "Planks", prescription: "3 rounds", targetSets: 3, isCircuit: true },
      { name: "Side planks", prescription: "3 rounds", targetSets: 3, isCircuit: true },
      { name: "Easy rower or bike", prescription: "10 min", targetSets: 1 },
    ],
  },
  {
    weekday: 2,
    variant: "travel",
    title: "Easy + volleyball option",
    subtitle: "Morning walk only; optional evening pickup",
    kind: "volleyball",
    location: "Taylor YMCA",
    timeWindow: "6:30 PM ET",
    isJumping: true,
    notes:
      "Nothing hard before the talk. If guest access works, full volleyball warmup/cooldown, play about an hour, stop by 8. If not, 20 min easy cardio intervals.",
    warmup: VOLLEYBALL_WARMUP,
    cooldown: VOLLEYBALL_COOLDOWN,
    exercises: [
      {
        name: "Easy mobility + walk",
        prescription: "15 min",
        targetSets: 1,
        notes: "Morning only — nothing hard before the talk",
      },
      {
        name: "Volleyball pickup or easy intervals",
        prescription: "About 60 min or 20 min intervals",
        targetSets: 1,
        notes: "Taylor YMCA advanced pickup after confirming guest access",
      },
    ],
  },
  {
    weekday: 3,
    variant: "travel",
    title: "Travel day",
    subtitle: "Airport walk + knee work",
    kind: "rest",
    notes: "Walk the airport, do the daily knee work at the hotel, and sleep.",
    warmup: [],
    cooldown: [],
    exercises: [
      { name: "Airport walk", prescription: "Easy", targetSets: 1 },
      { name: "Spanish squat holds", prescription: "3×30–45 s", targetSets: 3 },
      { name: "Clamshells", prescription: "15 / side", targetSets: 2, targetReps: "15" },
    ],
  },
  {
    weekday: 4,
    variant: "travel",
    title: "Hotel legs",
    subtitle: "No jumping · moderate weight",
    kind: "workout",
    isHeavyLegs: true,
    notes: "Hotel gym, no jumping. Keep it moderate — volleyball is the next day.",
    warmup: TRAVEL_WARMUP,
    cooldown: TRAVEL_COOLDOWN,
    exercises: [
      {
        name: "Goblet / DB tempo squats",
        prescription: "4×8",
        targetSets: 4,
        targetReps: "8",
        notes: "3 seconds down",
      },
      { name: "Split squats", prescription: "3×10 / side", targetSets: 3, targetReps: "10" },
      { name: "DB RDLs", prescription: "4×10", targetSets: 4, targetReps: "10" },
      { name: "Single-leg hip thrusts", prescription: "3×12", targetSets: 3, targetReps: "12" },
      { name: "Calf raises", prescription: "4×15", targetSets: 4, targetReps: "15" },
      { name: "Spanish squat holds", prescription: "3×30–45 s", targetSets: 3 },
    ],
  },
  {
    weekday: 5,
    variant: "travel",
    title: "IVL open gym",
    subtitle: "Wilcox HS · main volleyball day",
    kind: "volleyball",
    location: "Wilcox HS, Santa Clara",
    timeWindow: "8:00–10:30 PM",
    isJumping: true,
    notes:
      "Morning is easy only: walk and band work. Full volleyball warmup and cooldown. Cap play at about 90 minutes.",
    warmup: VOLLEYBALL_WARMUP,
    cooldown: VOLLEYBALL_COOLDOWN,
    exercises: [
      {
        name: "Easy walk + band work",
        prescription: "Morning",
        targetSets: 1,
        notes: "Nothing hard before the evening session",
      },
      {
        name: "IVL open gym",
        prescription: "About 90 min",
        targetSets: 1,
        notes: "Wilcox HS 8–10:30 PM. $14 in Reclub. Sit out every few games.",
      },
    ],
  },
  {
    weekday: 6,
    variant: "travel",
    title: "Travel home",
    subtitle: "Holds + walk",
    kind: "rest",
    notes:
      "Spanish squat holds and a walk. Next-morning knee check: if it's 3 or higher on the stairs, keep next week's jumping to Friday only.",
    warmup: [],
    cooldown: [],
    exercises: [
      { name: "Spanish squat holds", prescription: "3×30–45 s", targetSets: 3 },
      { name: "Walk", prescription: "20–30 min", targetSets: 1 },
    ],
  },
];

const habits = [
  { name: "Spanish squat holds", prescription: "3×30–45 s", sortOrder: 0 },
  { name: "Clamshells or lateral walks", prescription: "Daily", sortOrder: 1 },
  { name: "Slant board", prescription: "3–4 days / week", sortOrder: 2 },
  { name: "Midday walk", prescription: "Daily", sortOrder: 3 },
];

async function insertPlans(db: AppDb, userId: string, plans: SeedPlan[]) {
  for (const plan of plans) {
    const [created] = await db
      .insert(weekdayPlans)
      .values({
        userId,
        weekday: plan.weekday,
        variant: plan.variant,
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
        isJumping: plan.isJumping ?? false,
        isHeavyLegs: plan.isHeavyLegs ?? false,
      })
      .returning();

    if (!created) {
      throw new Error(`Failed to insert ${plan.variant} plan ${plan.weekday}`);
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
}

async function variantExists(db: AppDb, userId: string, variant: "home" | "travel") {
  const [row] = await db
    .select({ id: weekdayPlans.id })
    .from(weekdayPlans)
    .where(and(eq(weekdayPlans.userId, userId), eq(weekdayPlans.variant, variant)))
    .limit(1);
  return Boolean(row);
}

async function syncHomePlanFlags(db: AppDb, userId: string) {
  for (const plan of homePlans) {
    await db
      .update(weekdayPlans)
      .set({
        variant: "home",
        isJumping: plan.isJumping ?? false,
        isHeavyLegs: plan.isHeavyLegs ?? false,
      })
      .where(
        and(
          eq(weekdayPlans.userId, userId),
          eq(weekdayPlans.weekday, plan.weekday),
          eq(weekdayPlans.variant, "home"),
        ),
      );
  }
}

async function seedStaplesIfMissing(
  db: AppDb,
  userId: string,
  stapleSet: "home" | "road",
  items: readonly { name: string; proteinGrams: number; sortOrder: number }[],
) {
  const [existing] = await db
    .select({ id: foodStaples.id })
    .from(foodStaples)
    .where(and(eq(foodStaples.userId, userId), eq(foodStaples.stapleSet, stapleSet)))
    .limit(1);

  if (existing) return false;

  await db.insert(foodStaples).values(
    items.map((staple) => ({
      userId,
      name: staple.name,
      proteinGrams: staple.proteinGrams.toFixed(1),
      sortOrder: staple.sortOrder,
      stapleSet,
    })),
  );
  return true;
}

async function seedDefaultTravelRange(db: AppDb, userId: string) {
  const [existing] = await db
    .select({ id: travelRanges.id })
    .from(travelRanges)
    .where(
      and(
        eq(travelRanges.userId, userId),
        eq(travelRanges.startDate, DEFAULT_TRAVEL_RANGE.startDate),
        eq(travelRanges.endDate, DEFAULT_TRAVEL_RANGE.endDate),
      ),
    )
    .limit(1);

  if (existing) return false;

  await db.insert(travelRanges).values({
    userId,
    startDate: DEFAULT_TRAVEL_RANGE.startDate,
    endDate: DEFAULT_TRAVEL_RANGE.endDate,
    label: DEFAULT_TRAVEL_RANGE.label,
  });
  return true;
}

async function seedTravelDayNotes(db: AppDb, userId: string, overwrite: boolean) {
  let changed = false;
  for (const [date, notes] of Object.entries(TRAVEL_DAY_NOTES)) {
    const [existing] = await db
      .select()
      .from(dayLogs)
      .where(and(eq(dayLogs.userId, userId), eq(dayLogs.date, date)))
      .limit(1);

    if (!existing) {
      await db.insert(dayLogs).values({ userId, date, notes });
      changed = true;
      continue;
    }

    if (overwrite || existing.notes == null || existing.notes === "") {
      await db
        .update(dayLogs)
        .set({ notes, updatedAt: new Date() })
        .where(eq(dayLogs.id, existing.id));
      changed = true;
    }
  }
  return changed;
}

export async function seedUserPlan(
  db: AppDb,
  userId: string,
  options: { force?: boolean } = {},
) {
  if (options.force) {
    await db.delete(weekdayPlans).where(eq(weekdayPlans.userId, userId));
    await db.delete(dailyHabits).where(eq(dailyHabits.userId, userId));
    await db.delete(foodStaples).where(eq(foodStaples.userId, userId));
    await db.delete(travelRanges).where(eq(travelRanges.userId, userId));
  }

  let changed = false;

  if (!(await variantExists(db, userId, "home"))) {
    await insertPlans(db, userId, homePlans);
    changed = true;
  } else {
    await syncHomePlanFlags(db, userId);
  }

  if (!(await variantExists(db, userId, "travel"))) {
    await insertPlans(db, userId, travelPlans);
    changed = true;
  }

  const [existingHabit] = await db
    .select({ id: dailyHabits.id })
    .from(dailyHabits)
    .where(eq(dailyHabits.userId, userId))
    .limit(1);

  if (!existingHabit) {
    await db.insert(dailyHabits).values(habits.map((habit) => ({ userId, ...habit })));
    changed = true;
  }

  if (await seedStaplesIfMissing(db, userId, "home", FOOD_STAPLES)) changed = true;
  if (await seedStaplesIfMissing(db, userId, "road", ROAD_STAPLES)) changed = true;
  if (await seedDefaultTravelRange(db, userId)) changed = true;
  if (await seedTravelDayNotes(db, userId, options.force ?? false)) changed = true;

  return changed;
}

export async function ensureUserSeeded(db: AppDb, userId: string) {
  await seedUserPlan(db, userId);
}
