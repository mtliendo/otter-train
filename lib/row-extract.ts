import { z } from "zod";
import type { RowInterval } from "@/db/schema";

export const ROW_VISION_MODEL = "google/gemini-3.8-flash";

export const rowIntervalSchema = z.object({
  index: z.number().int().nullable(),
  time: z.string().nullable(),
  distanceMeters: z.number().nullable(),
  split: z.string().nullable(),
  spm: z.number().nullable(),
});

export const rowExtractionSchema = z.object({
  screenKind: z.enum(["summary", "intervals", "partial", "unknown"]),
  totalTime: z.string().nullable(),
  distanceMeters: z.number().nullable(),
  avgSplit: z.string().nullable(),
  avgSpm: z.number().nullable(),
  watts: z.number().nullable(),
  heartRate: z.number().nullable(),
  intervals: z.array(rowIntervalSchema),
});

export type RowExtraction = z.infer<typeof rowExtractionSchema>;

export type RowSessionDraft = {
  totalTime: string | null;
  distanceMeters: number | null;
  avgSplit: string | null;
  avgSpm: number | null;
  watts: number | null;
  heartRate: number | null;
  intervals: RowInterval[];
};

export const EXTRACT_PROMPT = `You are reading Concept2 PM5 rower screenshots.
Extract workout stats. Times look like 1:55.0 or 21:30.4. Splits are /500m.
Distance is meters. SPM is strokes per minute.
If the screen is an interval list, fill intervals and set screenKind to intervals.
If it is a workout summary (total time, distance, avg split), set screenKind to summary.
Use null when a value is not shown. Do not invent numbers.`;

function intervalKey(interval: RowInterval) {
  return [
    interval.time ?? "",
    interval.distanceMeters ?? "",
    interval.split ?? "",
    interval.spm ?? "",
  ].join("|");
}

function scoreExtraction(item: RowExtraction) {
  let score = 0;
  if (item.totalTime) score += 3;
  if (item.distanceMeters) score += 3;
  if (item.avgSplit) score += 2;
  if (item.avgSpm) score += 1;
  if (item.watts) score += 1;
  if (item.heartRate) score += 1;
  if (item.screenKind === "summary") score += 2;
  score += Math.min(item.intervals.length, 6);
  return score;
}

export function mergeRowExtractions(results: RowExtraction[]): RowSessionDraft {
  const ranked = [...results].sort((a, b) => scoreExtraction(b) - scoreExtraction(a));
  const best = ranked[0];
  const intervals: RowInterval[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    for (const interval of result.intervals) {
      const key = intervalKey(interval);
      if (!key.replace(/\|/g, "") || seen.has(key)) continue;
      seen.add(key);
      intervals.push(interval);
    }
  }

  intervals.sort((a, b) => (a.index ?? 999) - (b.index ?? 999));

  return {
    totalTime: best?.totalTime ?? ranked.find((item) => item.totalTime)?.totalTime ?? null,
    distanceMeters:
      best?.distanceMeters ??
      ranked.find((item) => item.distanceMeters != null)?.distanceMeters ??
      null,
    avgSplit: best?.avgSplit ?? ranked.find((item) => item.avgSplit)?.avgSplit ?? null,
    avgSpm: best?.avgSpm ?? ranked.find((item) => item.avgSpm != null)?.avgSpm ?? null,
    watts: best?.watts ?? ranked.find((item) => item.watts != null)?.watts ?? null,
    heartRate:
      best?.heartRate ?? ranked.find((item) => item.heartRate != null)?.heartRate ?? null,
    intervals,
  };
}

export function emptyRowDraft(): RowSessionDraft {
  return {
    totalTime: null,
    distanceMeters: null,
    avgSplit: null,
    avgSpm: null,
    watts: null,
    heartRate: null,
    intervals: [],
  };
}

export function formatMeters(meters: number | null | undefined) {
  if (meters == null) return "";
  return `${meters} m`;
}
