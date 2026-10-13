import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  dailyHabits,
  dayLogs,
  foodEntries,
  foodStaples,
  habitChecks,
  loggedExercises,
  loggedSets,
  planExercises,
  sleepLogs,
  weekdayPlans,
} from "@/db/schema";
import { KNEE_PAIN_JUMP_THRESHOLD, PROTEIN_TARGET_MIN } from "./constants";
import { endOfWeekSaturday, startOfWeekSunday, weekdayIndex } from "./dates";

function num(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getDayResponse(user: { id: string; name: string }, date: string) {
  return {
    user: { id: user.id, name: user.name },
    ...(await getDayPayload(user.id, date)),
  };
}

export async function getDayPayload(userId: string, date: string) {
  const weekday = weekdayIndex(date);

  const [plan] = await db
    .select()
    .from(weekdayPlans)
    .where(and(eq(weekdayPlans.userId, userId), eq(weekdayPlans.weekday, weekday)))
    .limit(1);

  const exercises = plan
    ? await db
        .select()
        .from(planExercises)
        .where(eq(planExercises.weekdayPlanId, plan.id))
        .orderBy(planExercises.sortOrder)
    : [];

  const habits = await db
    .select()
    .from(dailyHabits)
    .where(eq(dailyHabits.userId, userId))
    .orderBy(dailyHabits.sortOrder);

  const staples = await db
    .select()
    .from(foodStaples)
    .where(eq(foodStaples.userId, userId))
    .orderBy(foodStaples.sortOrder);

  const [dayLog] = await db
    .select()
    .from(dayLogs)
    .where(and(eq(dayLogs.userId, userId), eq(dayLogs.date, date)))
    .limit(1);

  const [sleep] = await db
    .select()
    .from(sleepLogs)
    .where(and(eq(sleepLogs.userId, userId), eq(sleepLogs.date, date)))
    .limit(1);

  const weekStart = startOfWeekSunday(date);
  const weekEnd = endOfWeekSaturday(date);
  const weekKnee = await db
    .select({
      date: sleepLogs.date,
      kneePain: sleepLogs.kneePain,
    })
    .from(sleepLogs)
    .where(
      and(
        eq(sleepLogs.userId, userId),
        gte(sleepLogs.date, weekStart),
        lte(sleepLogs.date, weekEnd),
        gte(sleepLogs.kneePain, KNEE_PAIN_JUMP_THRESHOLD),
      ),
    )
    .orderBy(sleepLogs.date)
    .limit(1);

  const previousByExercise: Record<string, { setIndex: number; weight: number | null; reps: number | null }[]> =
    {};

  for (const exercise of exercises) {
    const [latest] = await db
      .select({
        id: loggedExercises.id,
        date: dayLogs.date,
      })
      .from(loggedExercises)
      .innerJoin(dayLogs, eq(loggedExercises.dayLogId, dayLogs.id))
      .where(
        and(
          eq(dayLogs.userId, userId),
          eq(loggedExercises.name, exercise.name),
          sql`${dayLogs.date} < ${date}`,
        ),
      )
      .orderBy(desc(dayLogs.date), desc(loggedExercises.id))
      .limit(1);

    if (!latest) continue;

    const prevSets = await db
      .select()
      .from(loggedSets)
      .where(eq(loggedSets.loggedExerciseId, latest.id))
      .orderBy(loggedSets.setIndex);

    previousByExercise[exercise.name] = prevSets.map((set) => ({
      setIndex: set.setIndex,
      weight: num(set.weight),
      reps: set.reps,
    }));
  }

  let log = null;
  if (dayLog) {
    const checks = await db
      .select()
      .from(habitChecks)
      .where(eq(habitChecks.dayLogId, dayLog.id));

    const logged = await db
      .select()
      .from(loggedExercises)
      .where(eq(loggedExercises.dayLogId, dayLog.id))
      .orderBy(loggedExercises.sortOrder);

    const setsByExercise = new Map<number, typeof loggedSets.$inferSelect[]>();
    for (const loggedExercise of logged) {
      const sets = await db
        .select()
        .from(loggedSets)
        .where(eq(loggedSets.loggedExerciseId, loggedExercise.id))
        .orderBy(loggedSets.setIndex);
      setsByExercise.set(loggedExercise.id, sets);
    }

    const foods = await db
      .select()
      .from(foodEntries)
      .where(eq(foodEntries.dayLogId, dayLog.id))
      .orderBy(foodEntries.createdAt);

    log = {
      id: dayLog.id,
      workoutCompleted: dayLog.workoutCompleted,
      warmupDone: dayLog.warmupDone,
      cooldownDone: dayLog.cooldownDone,
      fuelingPreDone: dayLog.fuelingPreDone,
      fuelingPostDone: dayLog.fuelingPostDone,
      fuelingEveningDone: dayLog.fuelingEveningDone,
      creatineTaken: dayLog.creatineTaken,
      notes: dayLog.notes,
      habits: Object.fromEntries(checks.map((check) => [check.habitId, check.done])),
      exercises: logged.map((item) => ({
        id: item.id,
        planExerciseId: item.planExerciseId,
        name: item.name,
        sortOrder: item.sortOrder,
        sets: (setsByExercise.get(item.id) ?? []).map((set) => ({
          id: set.id,
          setIndex: set.setIndex,
          weight: num(set.weight),
          reps: set.reps,
          completed: set.completed,
        })),
      })),
      food: foods.map((entry) => ({
        id: entry.id,
        name: entry.name,
        proteinGrams: num(entry.proteinGrams) ?? 0,
        stapleId: entry.stapleId,
      })),
    };
  }

  const foodEntriesForTotal = log?.food ?? [];
  const totalProtein = foodEntriesForTotal.reduce((sum, entry) => sum + entry.proteinGrams, 0);

  return {
    date,
    weekday,
    kneeWarning: weekKnee[0]
      ? {
          active: true,
          sourceDate: weekKnee[0].date,
          kneePain: weekKnee[0].kneePain,
        }
      : { active: false as const },
    plan: plan
      ? {
          id: plan.id,
          title: plan.title,
          subtitle: plan.subtitle,
          kind: plan.kind,
          location: plan.location,
          timeWindow: plan.timeWindow,
          notes: plan.notes,
          warmup: plan.warmup,
          cooldown: plan.cooldown,
          fueling: {
            pre: plan.fuelingPre,
            post: plan.fuelingPost,
            evening: plan.fuelingEvening,
          },
          exercises: exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            prescription: exercise.prescription,
            targetSets: exercise.targetSets,
            targetReps: exercise.targetReps,
            notes: exercise.notes,
            isCircuit: exercise.isCircuit,
          })),
          habits: habits.map((habit) => ({
            id: habit.id,
            name: habit.name,
            prescription: habit.prescription,
          })),
        }
      : null,
    log,
    previousByExercise,
    food: {
      totalProtein,
      staples: staples.map((staple) => ({
        id: staple.id,
        name: staple.name,
        proteinGrams: num(staple.proteinGrams) ?? 0,
      })),
    },
    sleep: sleep
      ? {
          bedtime: sleep.bedtime,
          wakeTime: sleep.wakeTime,
          quality: sleep.quality,
          kneePain: sleep.kneePain,
        }
      : null,
  };
}

export async function ensureDayLog(userId: string, date: string) {
  const [existing] = await db
    .select()
    .from(dayLogs)
    .where(and(eq(dayLogs.userId, userId), eq(dayLogs.date, date)))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(dayLogs)
    .values({ userId, date })
    .returning();

  if (!created) {
    throw new Error("Failed to create day log");
  }
  return created;
}

export async function updateDayLog(
  userId: string,
  date: string,
  patch: Partial<{
    workoutCompleted: boolean;
    warmupDone: boolean;
    cooldownDone: boolean;
    fuelingPreDone: boolean;
    fuelingPostDone: boolean;
    fuelingEveningDone: boolean;
    creatineTaken: boolean;
    notes: string | null;
    habits: Record<string, boolean>;
  }>,
) {
  const dayLog = await ensureDayLog(userId, date);

  const { habits, ...fields } = patch;
  if (Object.keys(fields).length > 0) {
    await db
      .update(dayLogs)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(dayLogs.id, dayLog.id));
  }

  if (habits) {
    for (const [habitId, done] of Object.entries(habits)) {
      await db
        .insert(habitChecks)
        .values({
          dayLogId: dayLog.id,
          habitId: Number(habitId),
          done,
        })
        .onConflictDoUpdate({
          target: [habitChecks.dayLogId, habitChecks.habitId],
          set: { done },
        });
    }
  }
}

export async function upsertSet(
  userId: string,
  date: string,
  input: {
    planExerciseId?: number | null;
    name: string;
    setIndex: number;
    weight?: number | null;
    reps?: number | null;
    completed?: boolean;
  },
) {
  const dayLog = await ensureDayLog(userId, date);

  const [existingExercise] = await db
    .select()
    .from(loggedExercises)
    .where(and(eq(loggedExercises.dayLogId, dayLog.id), eq(loggedExercises.name, input.name)))
    .limit(1);

  const exercise =
    existingExercise ??
    (
      await db
        .insert(loggedExercises)
        .values({
          dayLogId: dayLog.id,
          planExerciseId: input.planExerciseId ?? null,
          name: input.name,
          sortOrder: input.planExerciseId ?? 0,
        })
        .returning()
    )[0];

  if (!exercise) {
    throw new Error("Failed to save exercise");
  }

  const [existingSet] = await db
    .select()
    .from(loggedSets)
    .where(and(eq(loggedSets.loggedExerciseId, exercise.id), eq(loggedSets.setIndex, input.setIndex)))
    .limit(1);

  const values = {
    weight: input.weight == null ? null : input.weight.toFixed(1),
    reps: input.reps ?? null,
    completed: input.completed ?? existingSet?.completed ?? false,
  };

  if (existingSet) {
    await db.update(loggedSets).set(values).where(eq(loggedSets.id, existingSet.id));
  } else {
    await db.insert(loggedSets).values({
      loggedExerciseId: exercise.id,
      setIndex: input.setIndex,
      ...values,
    });
  }
}

export async function addFood(
  userId: string,
  date: string,
  input: { name: string; proteinGrams: number; stapleId?: number | null },
) {
  const dayLog = await ensureDayLog(userId, date);
  const [created] = await db
    .insert(foodEntries)
    .values({
      dayLogId: dayLog.id,
      name: input.name,
      proteinGrams: input.proteinGrams.toFixed(1),
      stapleId: input.stapleId ?? null,
    })
    .returning();
  return created;
}

export async function updateFood(
  userId: string,
  id: number,
  patch: { name?: string; proteinGrams?: number },
) {
  const [entry] = await db
    .select({
      id: foodEntries.id,
      dayUserId: dayLogs.userId,
    })
    .from(foodEntries)
    .innerJoin(dayLogs, eq(foodEntries.dayLogId, dayLogs.id))
    .where(eq(foodEntries.id, id))
    .limit(1);

  if (!entry || entry.dayUserId !== userId) {
    throw new Error("Food entry not found");
  }

  await db
    .update(foodEntries)
    .set({
      ...(patch.name ? { name: patch.name } : {}),
      ...(patch.proteinGrams != null ? { proteinGrams: patch.proteinGrams.toFixed(1) } : {}),
    })
    .where(eq(foodEntries.id, id));
}

export async function deleteFood(userId: string, id: number) {
  const [entry] = await db
    .select({
      id: foodEntries.id,
      dayUserId: dayLogs.userId,
    })
    .from(foodEntries)
    .innerJoin(dayLogs, eq(foodEntries.dayLogId, dayLogs.id))
    .where(eq(foodEntries.id, id))
    .limit(1);

  if (!entry || entry.dayUserId !== userId) {
    throw new Error("Food entry not found");
  }

  await db.delete(foodEntries).where(eq(foodEntries.id, id));
}

export async function upsertSleep(
  userId: string,
  date: string,
  input: { bedtime: string; wakeTime: string; quality: number; kneePain: number },
) {
  const [existing] = await db
    .select()
    .from(sleepLogs)
    .where(and(eq(sleepLogs.userId, userId), eq(sleepLogs.date, date)))
    .limit(1);

  const values = {
    bedtime: input.bedtime,
    wakeTime: input.wakeTime,
    quality: input.quality,
    kneePain: input.kneePain,
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(sleepLogs).set(values).where(eq(sleepLogs.id, existing.id));
  } else {
    await db.insert(sleepLogs).values({ userId, date, ...values });
  }
}

export async function getCalendarMonth(userId: string, year: number, month: number) {
  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const logs = await db
    .select({
      date: dayLogs.date,
      workoutCompleted: dayLogs.workoutCompleted,
    })
    .from(dayLogs)
    .where(and(eq(dayLogs.userId, userId), gte(dayLogs.date, start), lte(dayLogs.date, end)));

  const sleep = await db
    .select({ date: sleepLogs.date })
    .from(sleepLogs)
    .where(and(eq(sleepLogs.userId, userId), gte(sleepLogs.date, start), lte(sleepLogs.date, end)));

  const proteinRows = await db
    .select({
      date: dayLogs.date,
      total: sql<string>`coalesce(sum(${foodEntries.proteinGrams}::numeric), 0)`,
    })
    .from(dayLogs)
    .leftJoin(foodEntries, eq(foodEntries.dayLogId, dayLogs.id))
    .where(and(eq(dayLogs.userId, userId), gte(dayLogs.date, start), lte(dayLogs.date, end)))
    .groupBy(dayLogs.date);

  const days: Record<string, { workout: boolean; protein: boolean; sleep: boolean }> = {};

  for (const log of logs) {
    days[log.date] = {
      workout: log.workoutCompleted,
      protein: false,
      sleep: false,
    };
  }

  for (const row of proteinRows) {
    const current = days[row.date] ?? { workout: false, protein: false, sleep: false };
    current.protein = Number(row.total) >= PROTEIN_TARGET_MIN;
    days[row.date] = current;
  }

  for (const row of sleep) {
    const current = days[row.date] ?? { workout: false, protein: false, sleep: false };
    current.sleep = true;
    days[row.date] = current;
  }

  return { year, month, days };
}
