export type AppUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Single-user stub for local development. Swap AUTH_STUB=false and implement
 * getAuth0User() once @auth0/nextjs-auth0 is wired (see lib/auth0.ts).
 */
export const STUB_USER: AppUser = {
  id: "auth0|focus",
  name: "Focus",
  email: "focus@focusotter.com",
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export function isAuthStubEnabled() {
  return process.env.AUTH_STUB !== "false";
}

export async function getCurrentUser(): Promise<AppUser> {
  if (isAuthStubEnabled()) {
    return STUB_USER;
  }

  const { getAuth0User } = await import("./auth0");
  const user = await getAuth0User();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}
