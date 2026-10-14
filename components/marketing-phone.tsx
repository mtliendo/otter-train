export function MarketingPhone() {
  return (
    <div className="relative mx-auto w-[min(100%,20.5rem)]">
      <div
        className="pointer-events-none absolute -inset-10 rounded-[3rem] bg-teal-400/15 blur-3xl"
        aria-hidden
      />
      <div className="relative rounded-[2.1rem] border border-ink-600 bg-ink-900 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)]">
        <div className="overflow-hidden rounded-[1.7rem] border border-ink-700 bg-ink-950">
          <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-stone-500">
            <span>9:41</span>
            <span className="mx-auto h-4 w-20 rounded-full bg-ink-800" />
            <span>100%</span>
          </div>
          <div className="px-4 pb-5 pt-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-teal-300">otter-train</p>
                <p className="text-xs text-stone-400">Focus</p>
              </div>
              <span className="rounded-full bg-teal-400 px-2.5 py-1 text-[10px] font-semibold text-ink-950">
                Travel
              </span>
            </div>
            <div className="mt-3 rounded-2xl bg-ink-800 px-3 py-2">
              <p className="text-sm font-semibold text-stone-50">Mon, Oct 19</p>
              <p className="text-[11px] text-stone-400">Travel · Oct 18–24</p>
            </div>
            <div className="mt-3 rounded-2xl border border-amber-300/35 bg-amber-300/10 px-3 py-2">
              <p className="text-[11px] font-semibold text-amber-100">Heavy legs next to volleyball</p>
              <p className="text-[10px] text-amber-100/70">Warning only — the plan is unchanged.</p>
            </div>
            <p className="mt-4 text-[10px] uppercase tracking-wide text-teal-300">travel · workout</p>
            <h3 className="text-xl font-semibold text-stone-50">Hotel upper body</h3>
            <p className="text-xs text-stone-400">Press, rows, arms · about 40 min</p>
            <article className="mt-3 rounded-2xl border border-ink-700 bg-ink-900 p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-sm font-medium text-stone-50">DB bench</p>
                <p className="text-[11px] text-stone-500">4×10</p>
              </div>
              <div className="space-y-1.5">
                <MockSet n={1} weight="50" reps="10" done />
                <MockSet n={2} weight="50" reps="10" done />
                <MockSet n={3} weight="50" reps="" />
              </div>
            </article>
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-amber-300/30 bg-amber-300/10 px-3 py-2">
              <p className="text-xs text-amber-100">Rest timer</p>
              <p className="font-mono text-lg font-semibold text-amber-200">1:18</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockSet({
  n,
  weight,
  reps,
  done,
}: {
  n: number;
  weight: string;
  reps: string;
  done?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1.2rem_1fr_1fr_1.6rem] items-center gap-1.5">
      <span className="text-[10px] text-stone-500">{n}</span>
      <span className="rounded-md border border-ink-600 bg-ink-950 px-2 py-1 text-[11px] text-stone-200">
        {weight}
        <span className="ml-1 text-stone-500">lb</span>
      </span>
      <span className="rounded-md border border-ink-600 bg-ink-950 px-2 py-1 text-[11px] text-stone-200">
        {reps || "reps"}
      </span>
      <span
        className={`grid h-6 w-6 place-items-center rounded-md text-[11px] font-semibold ${
          done ? "bg-teal-400 text-ink-950" : "bg-ink-700 text-stone-400"
        }`}
      >
        ✓
      </span>
    </div>
  );
}
