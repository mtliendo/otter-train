CREATE TABLE "daily_habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"prescription" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "day_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"workout_completed" boolean DEFAULT false NOT NULL,
	"warmup_done" boolean DEFAULT false NOT NULL,
	"cooldown_done" boolean DEFAULT false NOT NULL,
	"fueling_pre_done" boolean DEFAULT false NOT NULL,
	"fueling_post_done" boolean DEFAULT false NOT NULL,
	"fueling_evening_done" boolean DEFAULT false NOT NULL,
	"creatine_taken" boolean DEFAULT false NOT NULL,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_log_id" integer NOT NULL,
	"name" text NOT NULL,
	"protein_grams" numeric(6, 1) NOT NULL,
	"staple_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_staples" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"protein_grams" numeric(6, 1) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_log_id" integer NOT NULL,
	"habit_id" integer NOT NULL,
	"done" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logged_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_log_id" integer NOT NULL,
	"plan_exercise_id" integer,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logged_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"logged_exercise_id" integer NOT NULL,
	"set_index" integer NOT NULL,
	"weight" numeric(7, 1),
	"reps" integer,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"weekday_plan_id" integer NOT NULL,
	"name" text NOT NULL,
	"prescription" text,
	"target_sets" integer DEFAULT 1 NOT NULL,
	"target_reps" text,
	"notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_circuit" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sleep_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"bedtime" text NOT NULL,
	"wake_time" text NOT NULL,
	"quality" integer NOT NULL,
	"knee_pain" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekday_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"weekday" integer NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"kind" text NOT NULL,
	"location" text,
	"time_window" text,
	"notes" text,
	"warmup" jsonb NOT NULL,
	"cooldown" jsonb NOT NULL,
	"fueling_pre" text,
	"fueling_post" text,
	"fueling_evening" text
);
--> statement-breakpoint
ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_day_log_id_day_logs_id_fk" FOREIGN KEY ("day_log_id") REFERENCES "public"."day_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_checks" ADD CONSTRAINT "habit_checks_day_log_id_day_logs_id_fk" FOREIGN KEY ("day_log_id") REFERENCES "public"."day_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_checks" ADD CONSTRAINT "habit_checks_habit_id_daily_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."daily_habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logged_exercises" ADD CONSTRAINT "logged_exercises_day_log_id_day_logs_id_fk" FOREIGN KEY ("day_log_id") REFERENCES "public"."day_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logged_sets" ADD CONSTRAINT "logged_sets_logged_exercise_id_logged_exercises_id_fk" FOREIGN KEY ("logged_exercise_id") REFERENCES "public"."logged_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_weekday_plan_id_weekday_plans_id_fk" FOREIGN KEY ("weekday_plan_id") REFERENCES "public"."weekday_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "day_logs_user_date" ON "day_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "habit_checks_day_habit" ON "habit_checks" USING btree ("day_log_id","habit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "logged_sets_exercise_index" ON "logged_sets" USING btree ("logged_exercise_id","set_index");--> statement-breakpoint
CREATE UNIQUE INDEX "sleep_logs_user_date" ON "sleep_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "weekday_plans_user_weekday" ON "weekday_plans" USING btree ("user_id","weekday");