CREATE TABLE "travel_ranges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "weekday_plans_user_weekday";--> statement-breakpoint
ALTER TABLE "food_staples" ADD COLUMN "staple_set" text DEFAULT 'home' NOT NULL;--> statement-breakpoint
ALTER TABLE "weekday_plans" ADD COLUMN "variant" text DEFAULT 'home' NOT NULL;--> statement-breakpoint
ALTER TABLE "weekday_plans" ADD COLUMN "is_jumping" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "weekday_plans" ADD COLUMN "is_heavy_legs" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "weekday_plans_user_weekday_variant" ON "weekday_plans" USING btree ("user_id","weekday","variant");