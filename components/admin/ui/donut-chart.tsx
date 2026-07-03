// components/admin/ui/donut-chart.tsx
import type { DonutSegment } from "@/lib/admin/types";

const CX = 110, CY = 110, R_OUT = 92, R_IN = 60;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(startDeg: number, endDeg: number): string {
  const p1 = polar(CX, CY, R_OUT, startDeg);
  const p2 = polar(CX, CY, R_OUT, endDeg);
  const p3 = polar(CX, CY, R_IN,  endDeg);
  const p4 = polar(CX, CY, R_IN,  startDeg);
  const lg = endDeg - startDeg > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return [
    `M ${f(p1.x)} ${f(p1.y)}`,
    `A ${R_OUT} ${R_OUT} 0 ${lg} 1 ${f(p2.x)} ${f(p2.y)}`,
    `L ${f(p3.x)} ${f(p3.y)}`,
    `A ${R_IN} ${R_IN} 0 ${lg} 0 ${f(p4.x)} ${f(p4.y)}`,
    "Z",
  ].join(" ");
}

export function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let angle = 0;
  const paths = segments.map((seg) => {
    const sweep = (seg.value / total) * 360;
    const start = angle;
    angle += sweep;
    // Leave a tiny gap between segments
    const end = angle - (sweep > 5 ? 1.2 : 0);
    return { ...seg, start, end, sweep };
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <svg width={220} height={220} viewBox="0 0 220 220" fill="none" aria-hidden>
        {paths.map((seg, i) =>
          seg.sweep >= 0.5 ? (
            <path key={i} d={arc(seg.start, seg.end)} fill={seg.color} />
          ) : null
        )}
      </svg>

      <div className="w-full space-y-2 px-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: seg.color }}
              />
              <span className="text-[var(--color-muted)]">{seg.label}</span>
            </div>
            <span className="font-semibold text-[var(--color-ink)] tabular-nums">
              {seg.value.toLocaleString("fr-FR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
