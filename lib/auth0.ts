import { Auth0Client } from "@auth0/nextjs-auth0/server";
import type { AppUser } from "./auth";
import { resolveAppBaseUrl } from "./app-url";

export const AUTH0_TENANT = "demo-showcase";
export const AUTH0_APP_NAME = "otter-train";
export const AUTH0_DEFAULT_DOMAIN = "demo-showcase.us.auth0.com";
export const AUTH0_DEFAULT_CLIENT_ID = "CBR8NFocoUkfCCtEPVC9oEciT4s8Ez7E";

let client: Auth0Client | undefined;

export function getAuth0() {
  if (!client) {
    client = new Auth0Client({
      domain: process.env.AUTH0_DOMAIN ?? AUTH0_DEFAULT_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID ?? AUTH0_DEFAULT_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      secret: process.env.AUTH0_SECRET,
      appBaseUrl: resolveAppBaseUrl(),
    });
  }

  return client;
}

export const auth0 = {
  middleware: (...args: Parameters<Auth0Client["middleware"]>) => getAuth0().middleware(...args),
  getSession: (...args: Parameters<Auth0Client["getSession"]>) => getAuth0().getSession(...args),
};

export async function getAuth0User(): Promise<AppUser | null> {
  const session = await getAuth0().getSession();
  if (!session?.user?.sub) return null;

  return {
    id: session.user.sub,
    name: session.user.name ?? "Focus",
    email: session.user.email ?? "",
  };
}
