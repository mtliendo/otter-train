import { NextResponse } from "next/server";
import { getCurrentUser, UnauthorizedError } from "./auth";

export async function withUser<T>(
  handler: (user: Awaited<ReturnType<typeof getCurrentUser>>) => Promise<T>,
) {
  try {
    const user = await getCurrentUser();
    const data = await handler(user);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Request failed";
    const status = message.includes("must be") || message.includes("not found") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
