import { assertISODate } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { getDayResponse, upsertAmRow } from "@/lib/queries";
import type { AmRowStatus } from "@/lib/types";

function parseStatus(value: unknown): AmRowStatus | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (value === "done" || value === "skipped") return value;
  throw new Error("status must be done, skipped, or empty");
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    status?: AmRowStatus | null;
    duration?: string | null;
    distance?: string | null;
    notes?: string | null;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    await upsertAmRow(user.id, date, {
      status: parseStatus(body.status),
      duration: body.duration,
      distance: body.distance,
      notes: body.notes,
    });
    return getDayResponse(user, date);
  });
}
