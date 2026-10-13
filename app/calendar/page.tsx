import { Suspense } from "react";
import { CalendarPage } from "@/components/calendar-page";

export default function Calendar() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-stone-400">Loading calendar…</div>}>
      <CalendarPage />
    </Suspense>
  );
}
