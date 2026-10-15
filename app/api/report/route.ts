import { assertISODate } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { getReportPayload } from "@/lib/queries";

export async function GET(request: Request) {
  return withUser(async (user) => {
    const url = new URL(request.url);
    const date = assertISODate(url.searchParams.get("date"));
    return getReportPayload(user.id, date);
  });
}
