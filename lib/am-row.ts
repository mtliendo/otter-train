import { KNEE_PAIN_JUMP_THRESHOLD, EASY_ROW_GUIDANCE } from "./constants";
import { weekdayIndex } from "./dates";
import type { AmRowIntensity } from "./types";

export function concept2WodUrl(date: string): string {
  return `https://log.concept2.com/wod/${date}/rowerg`;
}

export function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseConcept2Wod(html: string): { title: string; description: string } {
  const afterHeading = html.split(/<h1>\s*Workout of the Day\s*<\/h1>/i)[1];
  if (!afterHeading) {
    throw new Error("Concept2 WOD heading not found");
  }

  const titleMatch = afterHeading.match(/<h3>([\s\S]*?)<\/h3>/i);
  const descriptionMatch = afterHeading.match(/<p>([\s\S]*?)<\/p>/i);
  const title = decodeHtml(titleMatch?.[1] ?? "");
  const description = decodeHtml(descriptionMatch?.[1] ?? "");

  if (!title || !description) {
    throw new Error("Concept2 WOD body not found");
  }

  return { title, description };
}

export function plannedRowIntensity(weekday: number): AmRowIntensity {
  return weekday === 1 || weekday === 2 ? "hard" : "easy";
}

export function isRestDayOptional(weekday: number): boolean {
  return weekday === 0;
}

export function intensityReason(weekday: number, kneeCaution: boolean): string {
  if (kneeCaution) {
    return `Morning knee pain is ${KNEE_PAIN_JUMP_THRESHOLD}+. Skip this row or keep it very light. ${EASY_ROW_GUIDANCE}`;
  }
  if (weekday === 0) {
    return `Optional rest-day row. ${EASY_ROW_GUIDANCE}`;
  }
  if (weekday === 3) {
    return `Easy — legs day. ${EASY_ROW_GUIDANCE}`;
  }
  if (weekday === 4 || weekday === 6) {
    return `Easy — protecting Friday volleyball. ${EASY_ROW_GUIDANCE}`;
  }
  if (weekday === 5) {
    return `Easy — volleyball day. ${EASY_ROW_GUIDANCE}`;
  }
  return "Hard day — take the workout as written.";
}

export function resolveAmRowIntensity(date: string, kneePain: number | null) {
  const weekday = weekdayIndex(date);
  const planned = plannedRowIntensity(weekday);
  const kneeCaution = kneePain != null && kneePain >= KNEE_PAIN_JUMP_THRESHOLD;
  const optional = isRestDayOptional(weekday) || kneeCaution;
  const intensity: AmRowIntensity = kneeCaution ? "easy" : planned;

  return {
    plannedIntensity: planned,
    intensity,
    optional,
    kneeCaution,
    easyGuidance: EASY_ROW_GUIDANCE,
    intensityReason: intensityReason(weekday, kneeCaution),
  };
}

export async function fetchConcept2Wod(
  date: string,
): Promise<{ title: string; description: string; sourceUrl: string } | null> {
  const sourceUrl = concept2WodUrl(date);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(sourceUrl, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "text/html",
        "User-Agent": "otter-train/1.0 (personal training log)",
      },
    });
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const parsed = parseConcept2Wod(html);
    return { ...parsed, sourceUrl };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
