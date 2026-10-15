export type ChartPoint = {
  label: string;
  value: number | null;
  secondary?: number | null;
};

export function TrendChart({
  points,
  height = 120,
  valueLabel,
  secondaryLabel,
}: {
  points: ChartPoint[];
  height?: number;
  valueLabel?: string;
  secondaryLabel?: string;
}) {
  const values = points.map((point) => point.value).filter((value): value is number => value != null);
  if (values.length === 0) {
    return <p className="text-xs text-stone-500">No data yet.</p>;
  }

  const width = 320;
  const pad = 12;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const usable = points.length > 1 ? points.length - 1 : 1;

  function x(index: number) {
    return pad + (index / usable) * (width - pad * 2);
  }
  function y(value: number) {
    return pad + ((max - value) / span) * (height - pad * 2);
  }

  const path = points
    .map((point, index) =>
      point.value == null ? null : `${index === 0 || points.slice(0, index).every((item) => item.value == null) ? "M" : "L"} ${x(index)} ${y(point.value)}`,
    )
    .filter(Boolean)
    .join(" ");

  const avgPath = points
    .map((point, index) =>
      point.secondary == null
        ? null
        : `${points.slice(0, index).every((item) => item.secondary == null) ? "M" : "L"} ${x(index)} ${y(point.secondary)}`,
    )
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full" role="img">
        <path d={path} fill="none" stroke="#2dd4bf" strokeWidth="2" />
        {avgPath ? <path d={avgPath} fill="none" stroke="#fcd34d" strokeWidth="2" strokeDasharray="4 3" /> : null}
        {points.map((point, index) =>
          point.value == null ? null : (
            <circle key={point.label} cx={x(index)} cy={y(point.value)} r="3" fill="#2dd4bf" />
          ),
        )}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-stone-500">
        <span>{points[0]?.label}</span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
      <div className="mt-1 flex gap-3 text-[10px] text-stone-400">
        {valueLabel ? <span className="text-teal-300">{valueLabel}</span> : null}
        {secondaryLabel ? <span className="text-amber-200">{secondaryLabel}</span> : null}
      </div>
    </div>
  );
}
