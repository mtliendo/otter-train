import { assertISODate } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { addFood, deleteFood, getDayResponse, updateFood } from "@/lib/queries";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    name?: string;
    proteinGrams?: number;
    stapleId?: number | null;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    if (!body.name || body.proteinGrams == null) {
      throw new Error("name and proteinGrams are required");
    }
    await addFood(user.id, date, {
      name: body.name,
      proteinGrams: Number(body.proteinGrams),
      stapleId: body.stapleId,
    });
    return getDayResponse(user, date);
  });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    id?: number;
    name?: string;
    proteinGrams?: number;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    if (body.id == null) {
      throw new Error("id is required");
    }
    await updateFood(user.id, body.id, {
      name: body.name,
      proteinGrams: body.proteinGrams,
    });
    return getDayResponse(user, date);
  });
}

export async function DELETE(request: Request) {
  return withUser(async (user) => {
    const url = new URL(request.url);
    const date = assertISODate(url.searchParams.get("date"));
    const id = Number(url.searchParams.get("id"));
    if (!Number.isFinite(id)) {
      throw new Error("id is required");
    }
    await deleteFood(user.id, id);
    return getDayResponse(user, date);
  });
}
