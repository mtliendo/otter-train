import { put } from "@vercel/blob";
import { assertISODate } from "@/lib/dates";
import { withUser } from "@/lib/api-helpers";
import { confirmRowSession, getDayResponse } from "@/lib/queries";
import {
  emptyRowDraft,
  mergeRowExtractions,
  type RowExtraction,
  type RowSessionDraft,
} from "@/lib/row-extract";
import { extractRowPhoto } from "@/lib/row-vision";
import type { RowInterval } from "@/lib/types";

export const maxDuration = 60;

const MAX_FILES = 8;
const MAX_BYTES = 8 * 1024 * 1024;

function parseDraft(body: Record<string, unknown>): RowSessionDraft {
  const intervals = Array.isArray(body.intervals) ? (body.intervals as RowInterval[]) : [];
  return {
    totalTime: typeof body.totalTime === "string" && body.totalTime ? body.totalTime : null,
    distanceMeters:
      typeof body.distanceMeters === "number" && Number.isFinite(body.distanceMeters)
        ? body.distanceMeters
        : null,
    avgSplit: typeof body.avgSplit === "string" && body.avgSplit ? body.avgSplit : null,
    avgSpm: typeof body.avgSpm === "number" && Number.isFinite(body.avgSpm) ? body.avgSpm : null,
    watts: typeof body.watts === "number" && Number.isFinite(body.watts) ? body.watts : null,
    heartRate:
      typeof body.heartRate === "number" && Number.isFinite(body.heartRate) ? body.heartRate : null,
    intervals,
  };
}

export async function POST(request: Request) {
  return withUser(async (user) => {
    const form = await request.formData();
    const date = assertISODate(String(form.get("date") ?? ""));
    const files = form
      .getAll("files")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (files.length === 0) {
      throw new Error("Upload at least one PM5 photo");
    }
    if (files.length > MAX_FILES) {
      throw new Error(`Upload at most ${MAX_FILES} photos`);
    }

    const photos: { url: string; pathname: string; contentType: string }[] = [];
    const extractions: RowExtraction[] = [];
    const errors: string[] = [];

    for (const [index, file] of files.entries()) {
      if (file.size > MAX_BYTES) {
        throw new Error(`${file.name} is larger than 8 MB`);
      }
      const contentType = file.type || "image/jpeg";
      if (!contentType.startsWith("image/")) {
        throw new Error(`${file.name} is not an image`);
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pathname = `row/${user.id}/${date}/${Date.now()}-${index}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      const blob = await put(pathname, file, {
        access: "public",
        contentType,
        addRandomSuffix: true,
      });
      photos.push({ url: blob.url, pathname: blob.pathname, contentType });

      try {
        extractions.push(await extractRowPhoto({ data: bytes, mediaType: contentType }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Vision extract failed";
        errors.push(`${file.name}: ${message}`);
      }
    }

    const draft = extractions.length > 0 ? mergeRowExtractions(extractions) : emptyRowDraft();
    return {
      date,
      photos,
      draft,
      extractErrors: errors,
    };
  });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    date?: string;
    photos?: { url: string; pathname: string; contentType?: string | null }[];
    metrics?: Record<string, unknown>;
  };

  return withUser(async (user) => {
    const date = assertISODate(body.date);
    if (!body.photos?.length) {
      throw new Error("photos are required to confirm");
    }
    if (!body.metrics) {
      throw new Error("metrics are required to confirm");
    }
    await confirmRowSession(user.id, date, {
      photos: body.photos,
      metrics: parseDraft(body.metrics),
    });
    return getDayResponse(user, date);
  });
}
