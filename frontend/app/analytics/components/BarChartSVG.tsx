"use client";

interface Bar {
  label: string;
  value: number;
  sublabel?: string;
}

interface Props {
  data: Bar[];
  color?: string;
  isCurrency?: boolean;
  height?: number;
}

export default function BarChartSVG({
  data,
  color = "#D4AF37",
  isCurrency = false,
  height = 200,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <span className="text-white/30 text-sm">No data for this period</span>
      </div>
    );
  }

  const W = 560;
  const H = height;
  const PL = 54;
  const PR = 16;
  const PT = 16;
  const PB = 48;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const slotW = cW / data.length;
  const barW = Math.max(slotW * 0.55, 8);

  const fmt = (v: number) => {
    if (!isCurrency) return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${Math.round(v)}`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
    return `₹${Math.round(v)}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="bar_grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = PT + cH * t;
        const v = maxVal * (1 - t);
        return (
          <g key={i}>
            <line
              x1={PL} y1={y} x2={W - PR} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
            <text
              x={PL - 5} y={y + 4}
              textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)"
            >
              {fmt(v)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = Math.max((d.value / maxVal) * cH, 2);
        const x = PL + i * slotW + (slotW - barW) / 2;
        const y = PT + cH - barH;
        const truncLabel =
          d.label.length > 10 ? d.label.slice(0, 9) + "…" : d.label;

        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill="url(#bar_grad)" />
            {/* Value on top */}
            {barH > 20 && (
              <text
                x={x + barW / 2} y={y - 4}
                textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)"
              >
                {fmt(d.value)}
              </text>
            )}
            {/* X label */}
            <text
              x={x + barW / 2} y={H - PB + 14}
              textAnchor="middle" fontSize="8.5" fill="rgba(255,255,255,0.4)"
            >
              {truncLabel}
            </text>
            {/* Sub-label (optional) */}
            {d.sublabel && (
              <text
                x={x + barW / 2} y={H - PB + 26}
                textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.25)"
              >
                {d.sublabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
