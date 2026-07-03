// components/admin/ui/line-chart.tsx
import type { ChartPoint } from "@/lib/admin/types";

const VW = 560, VH = 190;
const ML = 38, MR = 12, MT = 10, MB = 36;
const CW = VW - ML - MR;
const CH = VH - MT - MB;

function sx(i: number, total: number) {
  return ((i / (total - 1)) * CW).toFixed(1);
}
function sy(v: number, min: number, max: number) {
  return (CH - ((v - min) / (max - min || 1)) * CH).toFixed(1);
}

export function LineChart({ data }: { data: ChartPoint[] }) {
  const allVals = data.flatMap((d) => [d.inscriptions, d.validations]);
  const minV = Math.max(0, Math.min(...allVals) - 3);
  const maxV = Math.max(...allVals) + 3;

  const insLine = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${sx(i, data.length)} ${sy(d.inscriptions, minV, maxV)}`)
    .join(" ");

  const valLine = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${sx(i, data.length)} ${sy(d.validations, minV, maxV)}`)
    .join(" ");

  // Y-axis ticks (5 evenly spaced)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: (t * CH).toFixed(1),
    label: Math.round(maxV - t * (maxV - minV)),
  }));

  // X-axis labels every 5 days
  const xLabels: { x: string; label: string }[] = [];
  data.forEach((d, i) => {
    if (i === 0 || d.day % 5 === 0 || i === data.length - 1) {
      xLabels.push({ x: sx(i, data.length), label: `J${d.day}` });
    }
  });

  return (
    <svg
      width="100%"
      height={VH}
      viewBox={`0 0 ${VW} ${VH}`}
      fill="none"
      aria-hidden
    >
      <g transform={`translate(${ML},${MT})`}>
        {/* Horizontal grid lines */}
        {yTicks.map(({ y, label }) => (
          <g key={y}>
            <line x1={0} y1={y} x2={CW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={-5} y={Number(y) + 4} fontSize="10" fill="#9ca3af" textAnchor="end">
              {label}
            </text>
          </g>
        ))}

        {/* Inscriptions */}
        <path d={insLine} stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Validations */}
        <path d={valLine} stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* X axis baseline */}
        <line x1={0} y1={CH} x2={CW} y2={CH} stroke="#e5e7eb" strokeWidth="1" />

        {/* X labels */}
        {xLabels.map(({ x, label }) => (
          <text key={label} x={x} y={CH + 20} fontSize="10" fill="#9ca3af" textAnchor="middle">
            {label}
          </text>
        ))}
      </g>
    </svg>
  );
}
