import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AppNav />
    </>
  );
}
