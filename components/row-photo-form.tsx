"use client";

import { useState } from "react";
import { readJson } from "@/lib/client";
import { formatMeters, type RowSessionDraft } from "@/lib/row-extract";
import type { DayPayload, RowInterval, RowPhoto } from "@/lib/types";

type AnalyzeResponse = {
  photos: { url: string; pathname: string; contentType: string }[];
  draft: RowSessionDraft;
  extractErrors: string[];
};

export function RowPhotoForm({
  date,
  data,
  onSaved,
}: {
  date: string;
  data: DayPayload;
  onSaved: (payload: DayPayload) => void;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [photos, setPhotos] = useState<{ url: string; pathname: string; contentType?: string | null }[]>(
    data.amRow.photos.map((photo) => ({ url: photo.url, pathname: photo.pathname })),
  );
  const [draft, setDraft] = useState<RowSessionDraft | null>(
    data.amRow.metrics
      ? {
          totalTime: data.amRow.metrics.totalTime,
          distanceMeters: data.amRow.metrics.distanceMeters,
          avgSplit: data.amRow.metrics.avgSplit,
          avgSpm: data.amRow.metrics.avgSpm,
          watts: data.amRow.metrics.watts,
          heartRate: data.amRow.metrics.heartRate,
          intervals: data.amRow.metrics.intervals,
        }
      : null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmed = Boolean(data.amRow.metrics?.confirmedAt);

  async function analyze() {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("date", date);
      for (const file of Array.from(files)) {
        form.append("files", file);
      }
      const response = await fetch("/api/row-photos", { method: "POST", body: form });
      const payload = await readJson<AnalyzeResponse>(response);
      setPhotos(payload.photos);
      setDraft(payload.draft);
      if (payload.extractErrors.length) {
        setError(payload.extractErrors.join(" · "));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the photos");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!draft || photos.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/row-photos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, photos, metrics: draft }),
      });
      onSaved(await readJson<DayPayload>(response));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save row session");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-ink-700 pt-3">
      <p className="text-xs uppercase tracking-wide text-stone-500">PM5 photos</p>
      <p className="mt-1 text-xs text-stone-400">
        Upload every interval screen. Numbers stay a draft until you confirm.
      </p>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => setFiles(event.target.files)}
        className="mt-2 block w-full text-xs text-stone-300 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-700 file:px-3 file:py-2 file:text-xs file:text-stone-100"
      />
      <button
        type="button"
        onClick={() => void analyze()}
        disabled={busy || !files?.length}
        className="mt-2 rounded-lg bg-ink-700 px-3 py-2 text-sm text-stone-100 disabled:opacity-60"
      >
        {busy ? "Reading…" : "Extract from photos"}
      </button>
      {error ? <p className="mt-2 text-xs text-amber-100/80">{error}</p> : null}

      {photos.length ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <img
              key={photo.pathname}
              src={photo.url}
              alt="PM5 screen"
              className="h-20 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      ) : null}

      {draft ? (
        <ConfirmFields draft={draft} onChange={setDraft} />
      ) : confirmed ? (
        <SavedMetrics photos={data.amRow.photos} />
      ) : null}

      {draft ? (
        <button
          type="button"
          onClick={() => void confirm()}
          disabled={busy}
          className="mt-3 w-full rounded-lg bg-teal-400 px-3 py-2 text-sm font-semibold text-ink-950 disabled:opacity-60"
        >
          {busy ? "Saving…" : confirmed ? "Re-confirm and save" : "Confirm and save"}
        </button>
      ) : null}
    </div>
  );
}

function ConfirmFields({
  draft,
  onChange,
}: {
  draft: RowSessionDraft;
  onChange: (draft: RowSessionDraft) => void;
}) {
  function patch(partial: Partial<RowSessionDraft>) {
    onChange({ ...draft, ...partial });
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-stone-200">Edit before saving</p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Total time" value={draft.totalTime ?? ""} onChange={(value) => patch({ totalTime: value || null })} />
        <Field
          label="Distance (m)"
          value={draft.distanceMeters == null ? "" : String(draft.distanceMeters)}
          onChange={(value) => patch({ distanceMeters: value === "" ? null : Number(value) })}
        />
        <Field label="Avg split /500m" value={draft.avgSplit ?? ""} onChange={(value) => patch({ avgSplit: value || null })} />
        <Field
          label="Avg SPM"
          value={draft.avgSpm == null ? "" : String(draft.avgSpm)}
          onChange={(value) => patch({ avgSpm: value === "" ? null : Number(value) })}
        />
        <Field
          label="Watts"
          value={draft.watts == null ? "" : String(draft.watts)}
          onChange={(value) => patch({ watts: value === "" ? null : Number(value) })}
        />
        <Field
          label="Heart rate"
          value={draft.heartRate == null ? "" : String(draft.heartRate)}
          onChange={(value) => patch({ heartRate: value === "" ? null : Number(value) })}
        />
      </div>
      {draft.intervals.length ? (
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-left text-[11px] text-stone-300">
            <thead>
              <tr className="text-stone-500">
                <th className="py-1">#</th>
                <th>Time</th>
                <th>m</th>
                <th>Split</th>
                <th>SPM</th>
              </tr>
            </thead>
            <tbody>
              {draft.intervals.map((interval, index) => (
                <IntervalRow
                  key={index}
                  interval={interval}
                  onChange={(next) => {
                    const intervals = [...draft.intervals];
                    intervals[index] = next;
                    patch({ intervals });
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-stone-500">No interval rows detected. Totals still save.</p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-xs text-stone-400">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-950 px-2 py-1.5 text-sm text-stone-100"
      />
    </label>
  );
}

function IntervalRow({
  interval,
  onChange,
}: {
  interval: RowInterval;
  onChange: (interval: RowInterval) => void;
}) {
  return (
    <tr>
      <td className="pr-2">
        <input
          value={interval.index ?? ""}
          onChange={(event) =>
            onChange({ ...interval, index: event.target.value === "" ? null : Number(event.target.value) })
          }
          className="w-8 bg-transparent"
        />
      </td>
      <td>
        <input
          value={interval.time ?? ""}
          onChange={(event) => onChange({ ...interval, time: event.target.value || null })}
          className="w-16 bg-transparent"
        />
      </td>
      <td>
        <input
          value={interval.distanceMeters ?? ""}
          onChange={(event) =>
            onChange({
              ...interval,
              distanceMeters: event.target.value === "" ? null : Number(event.target.value),
            })
          }
          className="w-14 bg-transparent"
        />
      </td>
      <td>
        <input
          value={interval.split ?? ""}
          onChange={(event) => onChange({ ...interval, split: event.target.value || null })}
          className="w-14 bg-transparent"
        />
      </td>
      <td>
        <input
          value={interval.spm ?? ""}
          onChange={(event) =>
            onChange({ ...interval, spm: event.target.value === "" ? null : Number(event.target.value) })
          }
          className="w-10 bg-transparent"
        />
      </td>
    </tr>
  );
}

function SavedMetrics({ photos }: { photos: RowPhoto[] }) {
  return photos.length ? (
    <p className="mt-2 text-xs text-stone-400">
      Saved session from {photos.length} photo{photos.length === 1 ? "" : "s"}. Re-extract to edit.
    </p>
  ) : null;
}

export function RowSessionSummary({ data }: { data: DayPayload }) {
  const metrics = data.amRow.metrics;
  if (!metrics) return null;
  return (
    <p className="mt-2 text-xs text-stone-300">
      Confirmed: {[metrics.totalTime, formatMeters(metrics.distanceMeters) || null, metrics.avgSplit ? `${metrics.avgSplit} /500m` : null]
        .filter(Boolean)
        .join(" · ")}
    </p>
  );
}
