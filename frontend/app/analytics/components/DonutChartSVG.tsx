"use client";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
  centerLabel?: string;
  size?: number;
}

export default function DonutChartSVG({ segments, centerLabel, size = 160 }: Props) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: size }}>
        <span className="text-white/30 text-sm">No data</span>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.38;
  const r = size * 0.24;
  const gap = 0.015; // radians gap between slices

  let angle = -Math.PI / 2;
  const slices = segments.map((seg) => {
    const sweep = (seg.value / total) * (2 * Math.PI) - gap;
    const startA = angle + gap / 2;
    const endA = startA + sweep;

    const x1 = cx + R * Math.cos(startA);
    const y1 = cy + R * Math.sin(startA);
    const x2 = cx + R * Math.cos(endA);
    const y2 = cy + R * Math.sin(endA);
    const ix1 = cx + r * Math.cos(endA);
    const iy1 = cy + r * Math.sin(endA);
    const ix2 = cx + r * Math.cos(startA);
    const iy2 = cy + r * Math.sin(startA);
    const largeArc = sweep > Math.PI ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${r} ${r} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");

    angle += (seg.value / total) * (2 * Math.PI);
    return { d, color: seg.color, label: seg.label, value: seg.value, pct: Math.round((seg.value / total) * 100) };
  });

  const biggest = slices.reduce((a, b) => (a.value > b.value ? a : b));
  const displayPct = centerLabel ?? `${biggest.pct}%`;
  const displayLabel = biggest.label;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.d}
            fill={s.color}
            stroke="#0B1B3D"
            strokeWidth="1.5"
          />
        ))}
        {/* Center text */}
        <text
          x={cx} y={cy - size * 0.04}
          textAnchor="middle"
          fontSize={size * 0.12}
          fontWeight="700"
          fill="#FAF7F0"
        >
          {displayPct}
        </text>
        <text
          x={cx} y={cy + size * 0.1}
          textAnchor="middle"
          fontSize={size * 0.065}
          fill="rgba(255,255,255,0.45)"
        >
          {displayLabel}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: s.color }}
            />
            <div className="min-w-0">
              <div className="text-xs text-white/50 truncate">{s.label}</div>
              <div className="text-sm font-semibold text-white leading-tight">
                {s.value.toLocaleString()}
                <span className="text-white/40 text-xs ml-1">({s.pct}%)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
