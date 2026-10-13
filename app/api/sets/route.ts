import { assertISODate } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { getDayResponse, upsertSet } from "@/lib/queries";

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    planExerciseId?: number | null;
    name?: string;
    setIndex?: number;
    weight?: number | null;
    reps?: number | null;
    completed?: boolean;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    if (!body.name || body.setIndex == null) {
      throw new Error("name and setIndex are required");
    }
    await upsertSet(user.id, date, {
      planExerciseId: body.planExerciseId,
      name: body.name,
      setIndex: body.setIndex,
      weight: body.weight,
      reps: body.reps,
      completed: body.completed,
    });
    return getDayResponse(user, date);
  });
}
