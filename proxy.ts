import { NextResponse, type NextRequest } from "next/server";
import { isAuthStubEnabled } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (isAuthStubEnabled()) {
    return NextResponse.next();
  }

  const { auth0 } = await import("@/lib/auth0");
  const authRes = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  const session = await auth0.getSession(request);
  if (!session) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }

  return authRes;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons|manifest.webmanifest).*)",
  ],
};
