export type AppUser = {
  id: string;
  name: string;
  email: string;
};

/**
 * Local / preview fallback while AUTH0_CLIENT_SECRET is missing.
 * Set AUTH_STUB=false once the otter-train client secret is in env.
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
  if (process.env.AUTH_STUB === "true") return true;
  if (process.env.AUTH_STUB === "false") return false;
  return !process.env.AUTH0_CLIENT_SECRET;
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
