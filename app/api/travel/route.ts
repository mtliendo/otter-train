import { assertISODate } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { deleteTravelRange, getDayResponse, upsertTravelRange } from "@/lib/queries";

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    id?: number;
    startDate?: string;
    endDate?: string;
    label?: string | null;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    const startDate = assertISODate(body.startDate);
    const endDate = assertISODate(body.endDate);
    await upsertTravelRange(user.id, {
      id: body.id,
      startDate,
      endDate,
      label: body.label,
    });
    return getDayResponse(user, date);
  });
}

export async function DELETE(request: Request) {
  return withUser(async (user) => {
    const url = new URL(request.url);
    const date = assertISODate(url.searchParams.get("date"));
    const id = Number(url.searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("id must be a positive integer");
    }
    await deleteTravelRange(user.id, id);
    return getDayResponse(user, date);
  });
}
