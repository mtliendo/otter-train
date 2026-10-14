import { parseMonthKey } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { getCalendarMonth } from "@/lib/queries";

export async function GET(request: Request) {
  return withUser(async (user) => {
    const url = new URL(request.url);
    const parsed = parseMonthKey(url.searchParams.get("month") ?? "");
    if (!parsed) {
      throw new Error("month must be YYYY-MM");
    }
    return getCalendarMonth(user.id, parsed.year, parsed.month);
  });
}
