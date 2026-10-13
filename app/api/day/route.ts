import { assertISODate } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { getDayResponse, updateDayLog } from "@/lib/queries";

export async function GET(request: Request) {
  return withUser(async (user) => {
    const url = new URL(request.url);
    const date = assertISODate(url.searchParams.get("date"));
    return getDayResponse(user, date);
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    workoutCompleted?: boolean;
    warmupDone?: boolean;
    cooldownDone?: boolean;
    fuelingPreDone?: boolean;
    fuelingPostDone?: boolean;
    fuelingEveningDone?: boolean;
    creatineTaken?: boolean;
    notes?: string | null;
    habits?: Record<string, boolean>;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    await updateDayLog(user.id, date, body);
    return getDayResponse(user, date);
  });
}
