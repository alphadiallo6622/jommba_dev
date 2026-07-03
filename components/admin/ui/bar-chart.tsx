// components/admin/ui/bar-chart.tsx

interface BarPoint { label: string; value: number; }

const VW = 520, VH = 160;
const ML = 10, MR = 10, MT = 10, MB = 28;
const CW = VW - ML - MR;
const CH = VH - MT - MB;

export function BarChart({
  data,
  color = "#10b981",
}: {
  data: BarPoint[];
  color?: string;
}) {
  const maxV = Math.max(...data.map((d) => d.value)) || 1;
  const barW = CW / data.length;
  const gap  = barW * 0.25;

  return (
    <svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} fill="none" aria-hidden>
      <g transform={`translate(${ML},${MT})`}>
        {data.map((d, i) => {
          const bh   = Math.max(4, (d.value / maxV) * CH);
          const x    = i * barW + gap / 2;
          const y    = CH - bh;
          const w    = barW - gap;
          return (
            <g key={i}>
              <rect x={x} y={y} width={w} height={bh} rx={3} fill={color} />
              <text x={x + w / 2} y={CH + 16} fontSize="9" fill="#9ca3af" textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// Mini bar chart for Coach IA (taller, fewer bars)
export function MiniBarChart({
  data,
  color = "#10b981",
}: {
  data: { day: number; count: number }[];
  color?: string;
}) {
  const maxV = Math.max(...data.map((d) => d.count)) || 1;
  const W = 400, H = 100;
  const barW = W / data.length;
  const gap  = barW * 0.3;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden>
      {data.map((d, i) => {
        const bh = Math.max(4, (d.count / maxV) * (H - 8));
        const x  = i * barW + gap / 2;
        const y  = H - bh;
        const w  = barW - gap;
        return <rect key={i} x={x} y={y} width={w} height={bh} rx={2} fill={color} />;
      })}
    </svg>
  );
}
