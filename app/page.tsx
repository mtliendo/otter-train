import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MarketingHome } from "@/components/marketing-home";
import { getOptionalUser, isAuthStubEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: "otter-train — log the day, keep Friday",
  description:
    "Focus's personal training log: set-by-set workouts, protein, sleep, travel weeks, and a knee rule that warns before jumping stays on the calendar.",
};

export default function Home() {
  return (
    <Suspense fallback={<MarketingHome signedIn={false} />}>
      <HomeWithSession />
    </Suspense>
  );
}

async function HomeWithSession() {
  const user = await getOptionalUser();
  const stub = isAuthStubEnabled();

  if (user && !stub) {
    redirect("/today");
  }

  return <MarketingHome signedIn={Boolean(user)} />;
}
