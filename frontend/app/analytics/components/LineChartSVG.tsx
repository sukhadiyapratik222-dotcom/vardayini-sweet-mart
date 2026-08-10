"use client";

interface Point {
  label: string;
  value: number;
}

interface Props {
  data: Point[];
  color?: string;
  isCurrency?: boolean;
  height?: number;
}

export default function LineChartSVG({
  data,
  color = "#D4AF37",
  isCurrency = false,
  height = 180,
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
  const PL = 48;
  const PR = 16;
  const PT = 16;
  const PB = 28;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const minVal = Math.min(...data.map((d) => d.value), 0);
  const range = maxVal - minVal || 1;

  const xAt = (i: number) =>
    data.length === 1 ? PL + cW / 2 : PL + (i / (data.length - 1)) * cW;
  const yAt = (v: number) => PT + cH - ((v - minVal) / range) * cH;

  // Smooth bezier path
  const points = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value), label: d.label }));
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `${acc} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`;
  }, "");
  const fillPath = `${linePath} L${points[points.length - 1].x},${PT + cH} L${PL},${PT + cH} Z`;

  // Y-axis gridlines
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  // X-axis: show max 8 labels
  const step = Math.max(1, Math.ceil(points.length / 8));
  const xLabels = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  const gradId = `lg_${color.replace("#", "")}`;

  const fmt = (v: number) => {
    if (!isCurrency) return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${Math.round(v)}`;
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
    return `₹${Math.round(v)}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((t, i) => {
        const y = PT + cH * t;
        const v = maxVal - t * range;
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

      {/* Filled area */}
      <path d={fillPath} fill={`url(#${gradId})`} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={i} cx={p.x} cy={p.y} r="3.5"
          fill={color} stroke="#0B1B3D" strokeWidth="2"
        />
      ))}

      {/* X labels */}
      {xLabels.map((p, i) => (
        <text
          key={i} x={p.x} y={H - 4}
          textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
