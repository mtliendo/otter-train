import { assertISODate } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { getDayResponse, upsertSleep } from "@/lib/queries";

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    bedtime?: string;
    wakeTime?: string;
    quality?: number;
    kneePain?: number;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    if (!body.bedtime || !body.wakeTime || body.quality == null || body.kneePain == null) {
      throw new Error("bedtime, wakeTime, quality, and kneePain are required");
    }
    if (body.quality < 1 || body.quality > 5) {
      throw new Error("quality must be 1-5");
    }
    if (body.kneePain < 0 || body.kneePain > 10) {
      throw new Error("kneePain must be 0-10");
    }
    await upsertSleep(user.id, date, {
      bedtime: body.bedtime,
      wakeTime: body.wakeTime,
      quality: body.quality,
      kneePain: body.kneePain,
    });
    return getDayResponse(user, date);
  });
}
