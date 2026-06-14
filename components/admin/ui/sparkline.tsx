// components/admin/ui/sparkline.tsx

export function Sparkline({
  data,
  color = "#10b981",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 120, H = 34;
  const step = W / (data.length - 1);
  const fy = (v: number) => H - ((v - min) / range) * H * 0.75 - H * 0.12;
  const d = data
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${fy(v).toFixed(1)}`)
    .join(" ");
  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      <path
        d={d}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
