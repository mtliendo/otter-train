import { config } from "dotenv";
import { STUB_USER } from "../lib/auth";
import { getDb } from "./index";
import { seedUserPlan } from "./seed-plan";

config({ path: ".env.local" });
config({ path: ".env" });

async function seed() {
  const db = getDb();
  const seeded = await seedUserPlan(db, STUB_USER.id, {
    force: process.argv.includes("--force"),
  });

  if (!seeded) {
    console.log("Plan already seeded for stub user. Re-run with --force to replace templates.");
    return;
  }

  console.log(
    `Seeded home and travel weekday plans, habits, house + road staples, and Oct 18–24 travel notes for ${STUB_USER.name}.`,
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
