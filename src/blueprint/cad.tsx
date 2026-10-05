import { useMemo } from 'react';
import { polyPath, rectPath, resolvePlan, round, type Plan, type Prim } from './geometry';

/** Every drawable is emitted as a <path> so `pathLength` works in all browsers. */
export function primPath(p: Prim): string {
  switch (p.k) {
    case 'rect': {
      const r = Math.min(p.rx ?? 0, p.w / 2, p.h / 2);
      if (!r) return rectPath(p);
      const { x, y, w, h } = p;
      return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${
        x + w - r
      } ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
    }
    case 'circle':
      return `M${p.cx - p.r} ${p.cy}A${p.r} ${p.r} 0 1 0 ${p.cx + p.r} ${p.cy}A${p.r} ${p.r} 0 1 0 ${p.cx - p.r} ${p.cy}Z`;
    case 'ellipse':
      return `M${p.cx - p.rx} ${p.cy}A${p.rx} ${p.ry} 0 1 0 ${p.cx + p.rx} ${p.cy}A${p.rx} ${p.ry} 0 1 0 ${
        p.cx - p.rx
      } ${p.cy}Z`;
    case 'line':
      return `M${round(p.a[0])} ${round(p.a[1])}L${round(p.b[0])} ${round(p.b[1])}`;
    case 'poly':
      return polyPath(p.pts);
  }
}

interface PlanCadProps {
  plan: Plan;
  className?: string;
  /** Hide everything until scroll-driven reveal (adds .dr / .fd hooks). */
  anim?: boolean;
  labelSize?: number;
  labels?: boolean;
}

/**
 * Renders a plan the way CAD would: wall outlines are stroked at double width
 * and then covered by the wall fills, so overlapping wall pieces read as one
 * cleanly joined outline.
 */
export function PlanCad({ plan, className, anim = true, labelSize = 14, labels = true }: PlanCadProps) {
  const r = useMemo(() => resolvePlan(plan), [plan]);
  const dr = anim ? 'dr' : undefined;
  return (
    <g className={className}>
      <g className="cad-wall-ol">
        {r.pieces.map((p, i) => (
          <path key={i} d={rectPath(p)} pathLength={1} className={dr} />
        ))}
      </g>
      <g className={anim ? 'cad-wall-fill fd' : 'cad-wall-fill'}>
        {r.pieces.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} className={`wf wf-${p.layer}`} />
        ))}
      </g>
      <g className="cad-win">
        {r.windows.map((w, i) => {
          const mid = w.horizontal
            ? `M${w.x} ${w.y + w.h / 2}h${w.w}`
            : `M${w.x + w.w / 2} ${w.y}v${w.h}`;
          return (
            <g key={i}>
              <path d={rectPath(w)} pathLength={1} className={dr} />
              <path d={mid} pathLength={1} className={dr} />
            </g>
          );
        })}
      </g>
      <g className="cad-door">
        {r.doors.map((d, i) => (
          <g key={i}>
            <path d={`M${d.leaf[0][0]} ${d.leaf[0][1]}L${d.leaf[1][0]} ${d.leaf[1][1]}`} pathLength={1} className={dr} />
            <path d={d.arc} pathLength={1} className={anim ? 'dr arc' : 'arc'} />
          </g>
        ))}
      </g>
      <g className="cad-fix">
        {plan.fixtures.map((p, i) => (
          <path key={i} d={primPath(p)} pathLength={1} className={dr} />
        ))}
      </g>
      {labels && plan.labels.length > 0 && (
        <g className={anim ? 'cad-label fd' : 'cad-label'} fontSize={labelSize}>
          {plan.labels.map((l, i) => (
            <text key={i} x={l.at[0]} y={l.at[1]} textAnchor="middle">
              {l.text}
              {l.sub && (
                <tspan x={l.at[0]} dy={labelSize * 1.35} className="sub" fontSize={labelSize * 0.78}>
                  {l.sub}
                </tspan>
              )}
            </text>
          ))}
        </g>
      )}
    </g>
  );
}

interface DetailTitleProps {
  x: number;
  y: number;
  n: string;
  sheet: string;
  title: string;
  scale?: string;
  size?: number;
  width?: number;
}

/** The classic drawing title: numbered bubble over sheet ref, underlined title. */
export function DetailTitle({ x, y, n, sheet, title, scale, size = 1, width = 900 }: DetailTitleProps) {
  const r = 34 * size;
  return (
    <g className="detail-title" transform={`translate(${x} ${y})`}>
      <circle cx={r} cy={0} r={r} className="ln" />
      <path d={`M0 0H${2 * r}`} className="ln" />
      <text x={r} y={-r * 0.22} textAnchor="middle" fontSize={26 * size} className="t-mono">
        {n}
      </text>
      <text x={r} y={r * 0.62} textAnchor="middle" fontSize={15 * size} className="t-mono dim">
        {sheet}
      </text>
      <text x={2 * r + 22 * size} y={-10 * size} fontSize={30 * size} className="t-display">
        {title}
      </text>
      <path d={`M${2 * r} 0H${width}`} className="ln heavy" />
      {scale && (
        <text x={2 * r + 22 * size} y={28 * size} fontSize={15 * size} className="t-mono dim" letterSpacing="0.12em">
          {scale}
        </text>
      )}
    </g>
  );
}
