import type { AppUser } from "./auth";

/**
 * Auth0 swap point for @auth0/nextjs-auth0.
 *
 * Tenant: demo-showcase
 * App: otter-train
 * Client ID: CBR8NFocoUkfCCtEPVC9oEciT4s8Ez7E
 *
 * 1. pnpm add @auth0/nextjs-auth0
 * 2. Fill AUTH0_* and APP_BASE_URL in .env.local
 * 3. Uncomment Auth0Client below and the middleware call in proxy.ts
 * 4. Set AUTH_STUB=false
 */
export async function getAuth0User(): Promise<AppUser | null> {
  // import { Auth0Client } from "@auth0/nextjs-auth0/server";
  //
  // export const auth0 = new Auth0Client({
  //   domain: process.env.AUTH0_DOMAIN!,
  //   clientId: process.env.AUTH0_CLIENT_ID!,
  //   clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  //   secret: process.env.AUTH0_SECRET!,
  //   appBaseUrl: process.env.APP_BASE_URL!,
  // });
  //
  // const session = await auth0.getSession();
  // if (!session?.user?.sub) return null;
  // return {
  //   id: session.user.sub,
  //   name: session.user.name ?? "Focus",
  //   email: session.user.email ?? "",
  // };

  throw new Error(
    "Auth0 is not wired yet. Keep AUTH_STUB=true or implement getAuth0User() in lib/auth0.ts.",
  );
}
