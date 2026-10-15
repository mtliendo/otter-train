import { assertISODate, startOfWeekSunday } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { getDayResponse, upsertWeeklyWeight } from "@/lib/queries";

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    weekStart?: string;
    weightLb?: number;
    notes?: string | null;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    if (body.weightLb == null || !Number.isFinite(body.weightLb) || body.weightLb <= 0) {
      throw new Error("weightLb must be a positive number");
    }
    const weekStart = body.weekStart ? assertISODate(body.weekStart) : startOfWeekSunday(date);
    await upsertWeeklyWeight(user.id, {
      date,
      weekStart,
      weightLb: body.weightLb,
      notes: body.notes ?? null,
    });
    return getDayResponse(user, date);
  });
}
