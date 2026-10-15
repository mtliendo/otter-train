import { Suspense } from "react";
import { ReportPage } from "@/components/report-page";

export default function Report() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-stone-400">Loading report…</div>}>
      <ReportPage />
    </Suspense>
  );
}
