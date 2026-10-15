CREATE TABLE "row_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"am_row_log_id" integer NOT NULL,
	"blob_url" text NOT NULL,
	"pathname" text NOT NULL,
	"content_type" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "row_session_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"am_row_log_id" integer NOT NULL,
	"total_time" text,
	"distance_meters" integer,
	"avg_split" text,
	"avg_spm" numeric(5, 1),
	"watts" numeric(6, 1),
	"heart_rate" integer,
	"intervals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confirmed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_weights" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"week_start" date NOT NULL,
	"weigh_date" date NOT NULL,
	"weight_lb" numeric(5, 1) NOT NULL,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "logged_sets" ADD COLUMN "added_weight" numeric(7, 1);--> statement-breakpoint
ALTER TABLE "logged_sets" ADD COLUMN "is_bodyweight" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "logged_sets" ADD COLUMN "seconds" integer;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD COLUMN "parent_exercise_id" integer;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD COLUMN "load_type" text DEFAULT 'weight' NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD COLUMN "effort" text DEFAULT 'reps' NOT NULL;--> statement-breakpoint
ALTER TABLE "row_photos" ADD CONSTRAINT "row_photos_am_row_log_id_am_row_logs_id_fk" FOREIGN KEY ("am_row_log_id") REFERENCES "public"."am_row_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "row_session_metrics" ADD CONSTRAINT "row_session_metrics_am_row_log_id_am_row_logs_id_fk" FOREIGN KEY ("am_row_log_id") REFERENCES "public"."am_row_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "row_session_metrics_am_row" ON "row_session_metrics" USING btree ("am_row_log_id");--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_weights_user_week" ON "weekly_weights" USING btree ("user_id","week_start");--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_parent_exercise_id_plan_exercises_id_fk" FOREIGN KEY ("parent_exercise_id") REFERENCES "public"."plan_exercises"("id") ON DELETE cascade ON UPDATE no action;