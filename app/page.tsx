import { Suspense } from "react";
import { TodayPage } from "@/components/today-page";

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-stone-400">Loading today…</div>}>
      <TodayPage />
    </Suspense>
  );
}
