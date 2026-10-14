export function SignInCard({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-lg p-6">
      <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
        {message}
      </p>
      <a
        href="/auth/login"
        className="mt-4 inline-block rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-ink-950"
      >
        Sign in with Auth0
      </a>
    </div>
  );
}

export function SignOutLink({ stub }: { stub?: boolean }) {
  if (stub) return null;

  return (
    <a href="/auth/logout" className="text-[11px] text-stone-500 underline-offset-2 hover:underline">
      Sign out
    </a>
  );
}
