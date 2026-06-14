// components/admin/ui/area-chart.tsx

interface AreaPoint { label?: string; value: number; }

const VW = 340, VH = 130;
const ML = 8, MR = 8, MT = 8, MB = 8;
const CW = VW - ML - MR;
const CH = VH - MT - MB;

function buildPath(data: AreaPoint[]): { line: string; area: string } {
  const vals = data.map((d) => d.value);
  const minV = Math.min(...vals) * 0.9;
  const maxV = Math.max(...vals) * 1.05;
  const range = maxV - minV || 1;

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * CW,
    y: CH - ((d.value - minV) / range) * CH,
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${CH} L ${pts[0].x.toFixed(1)} ${CH} Z`;

  return { line, area };
}

export function AreaChart({
  data,
  color = "#10b981",
}: {
  data: AreaPoint[];
  color?: string;
}) {
  if (data.length < 2) return null;
  const { line, area } = buildPath(data);
  const id = `area-fill-${color.replace("#", "")}`;

  return (
    <svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} fill="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <g transform={`translate(${ML},${MT})`}>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
