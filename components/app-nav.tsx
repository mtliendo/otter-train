"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-700 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-3">
        <NavLink href="/today" active={pathname.startsWith("/today")} label="Today" />
        <NavLink href="/report" active={pathname.startsWith("/report")} label="Report" />
        <NavLink href="/calendar" active={pathname.startsWith("/calendar")} label="Calendar" />
      </div>
    </nav>
  );
}

function NavLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`px-4 py-3 text-center text-sm font-semibold ${
        active ? "text-amber-200" : "text-stone-400"
      }`}
    >
      {label}
    </Link>
  );
}
