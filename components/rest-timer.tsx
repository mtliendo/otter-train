"use client";

import { useEffect, useState } from "react";
import { DEFAULT_REST_SECONDS } from "@/lib/constants";

type RestTimerProps = {
  running: boolean;
  seconds: number;
  onStop: () => void;
};

export function RestTimer({ running, seconds, onStop }: RestTimerProps) {
  if (!running) return null;

  const remaining = Math.max(0, seconds);
  const ratio = remaining / DEFAULT_REST_SECONDS;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 mx-auto w-full max-w-lg px-4">
      <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-ink-800/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="relative h-12 w-12 shrink-0">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
            <circle cx="18" cy="18" r="15" className="fill-none stroke-ink-600" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              className="fill-none stroke-amber-300"
              strokeWidth="3"
              strokeDasharray={`${ratio * 94.2} 94.2`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-mono text-sm text-amber-100">
            {remaining}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-100">Rest</p>
          <p className="text-xs text-stone-400">Tap done when you are ready</p>
        </div>
        <button
          type="button"
          onClick={onStop}
          className="rounded-xl bg-amber-300 px-3 py-2 text-sm font-semibold text-ink-900"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export function useRestTimer(defaultSeconds = DEFAULT_REST_SECONDS) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(defaultSeconds);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(id);
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function start(next = defaultSeconds) {
    setSeconds(next);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    setSeconds(defaultSeconds);
  }

  return { running, seconds, start, stop };
}
