import { NextResponse } from "next/server";

export function proxy() {
  // Auth0 swap: return await auth0.middleware(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icons|manifest.webmanifest).*)",
  ],
};
