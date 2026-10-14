import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const weekdayPlans = pgTable(
  "weekday_plans",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    weekday: integer("weekday").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    kind: text("kind").notNull(),
    location: text("location"),
    timeWindow: text("time_window"),
    notes: text("notes"),
    warmup: jsonb("warmup").$type<string[]>().notNull(),
    cooldown: jsonb("cooldown").$type<string[]>().notNull(),
    fuelingPre: text("fueling_pre"),
    fuelingPost: text("fueling_post"),
    fuelingEvening: text("fueling_evening"),
    variant: text("variant").notNull().default("home"),
    isJumping: boolean("is_jumping").notNull().default(false),
    isHeavyLegs: boolean("is_heavy_legs").notNull().default(false),
  },
  (table) => [
    uniqueIndex("weekday_plans_user_weekday_variant").on(
      table.userId,
      table.weekday,
      table.variant,
    ),
  ],
);

export const planExercises = pgTable("plan_exercises", {
  id: serial("id").primaryKey(),
  weekdayPlanId: integer("weekday_plan_id")
    .notNull()
    .references(() => weekdayPlans.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prescription: text("prescription"),
  targetSets: integer("target_sets").notNull().default(1),
  targetReps: text("target_reps"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  isCircuit: boolean("is_circuit").notNull().default(false),
});

export const dailyHabits = pgTable("daily_habits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  prescription: text("prescription"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const foodStaples = pgTable("food_staples", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  proteinGrams: numeric("protein_grams", { precision: 6, scale: 1 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  stapleSet: text("staple_set").notNull().default("home"),
});

export const travelRanges = pgTable("travel_ranges", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dayLogs = pgTable(
  "day_logs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: date("date").notNull(),
    workoutCompleted: boolean("workout_completed").notNull().default(false),
    warmupDone: boolean("warmup_done").notNull().default(false),
    cooldownDone: boolean("cooldown_done").notNull().default(false),
    fuelingPreDone: boolean("fueling_pre_done").notNull().default(false),
    fuelingPostDone: boolean("fueling_post_done").notNull().default(false),
    fuelingEveningDone: boolean("fueling_evening_done").notNull().default(false),
    creatineTaken: boolean("creatine_taken").notNull().default(false),
    notes: text("notes"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("day_logs_user_date").on(table.userId, table.date)],
);

export const habitChecks = pgTable(
  "habit_checks",
  {
    id: serial("id").primaryKey(),
    dayLogId: integer("day_log_id")
      .notNull()
      .references(() => dayLogs.id, { onDelete: "cascade" }),
    habitId: integer("habit_id")
      .notNull()
      .references(() => dailyHabits.id, { onDelete: "cascade" }),
    done: boolean("done").notNull().default(false),
  },
  (table) => [uniqueIndex("habit_checks_day_habit").on(table.dayLogId, table.habitId)],
);

export const loggedExercises = pgTable("logged_exercises", {
  id: serial("id").primaryKey(),
  dayLogId: integer("day_log_id")
    .notNull()
    .references(() => dayLogs.id, { onDelete: "cascade" }),
  planExerciseId: integer("plan_exercise_id"),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const loggedSets = pgTable(
  "logged_sets",
  {
    id: serial("id").primaryKey(),
    loggedExerciseId: integer("logged_exercise_id")
      .notNull()
      .references(() => loggedExercises.id, { onDelete: "cascade" }),
    setIndex: integer("set_index").notNull(),
    weight: numeric("weight", { precision: 7, scale: 1 }),
    reps: integer("reps"),
    completed: boolean("completed").notNull().default(false),
  },
  (table) => [uniqueIndex("logged_sets_exercise_index").on(table.loggedExerciseId, table.setIndex)],
);

export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  dayLogId: integer("day_log_id")
    .notNull()
    .references(() => dayLogs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  proteinGrams: numeric("protein_grams", { precision: 6, scale: 1 }).notNull(),
  stapleId: integer("staple_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sleepLogs = pgTable(
  "sleep_logs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: date("date").notNull(),
    bedtime: text("bedtime").notNull(),
    wakeTime: text("wake_time").notNull(),
    quality: integer("quality").notNull(),
    kneePain: integer("knee_pain").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sleep_logs_user_date").on(table.userId, table.date)],
);
