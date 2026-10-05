import { useMemo } from 'react';
import { DetailTitle, PlanCad } from './cad';
import { cloudPath, mapPlan, mergePlans, resolvePlan, type Plan } from './geometry';
import { AT, floorShell, floorUnits, unitStandalone } from './plans';

export const STEPS = ['Read', 'Understand', 'Measure', 'Assemble', 'Check'] as const;

const K = 0.85;
const UW = 300;
const UH = 390;

function ReadFrame({ sheet }: { sheet: Plan }) {
  return (
    <g>
      <rect x={30} y={36} width={380} height={250} className="mini-sheet" />
      <rect x={350} y={36} width={60} height={250} className="mini-sheet" />
      <g transform="translate(40 92)">
        <PlanCad plan={sheet} anim={false} labels={false} className="ghost mini" />
      </g>
      <rect x={44} y={232} width={92} height={40} className="mini-sheet" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M52 ${242 + i * 11}h10M68 ${242 + i * 11}h56`} className="ln thin" />
      ))}
      <text x={190} y={264} fontSize={10} className="t-mono dim">
        SCALE 1/8" = 1'-0"
      </text>
      <text x={380} y={270} fontSize={10} className="t-mono dim" transform="rotate(-90 380 270)">
        M-301 LEVEL 3 MECH
      </text>
      <g className="rd-hl">
        <rect x={346} y={32} width={68} height={258} className="hl fd" />
        <rect x={184} y={250} width={110} height={20} className="hl fd" />
        <rect x={40} y={228} width={100} height={48} className="hl fd" />
        <rect x={40} y={154} width={41} height={50} className="hl fd" />
      </g>
      <path d="M30 60H410" className="scan" />
      <g className="rd-list" fontSize={14}>
        {['SHEET  M-301 · LEVEL 3', 'SCALE  1/8" = 1\'-0"', 'LEGEND 9 SYMBOLS', 'UNITS  TYPE A ×8 · TYPE B ×6'].map((t, i) => (
          <text key={t} x={34} y={322 + i * 26} className="t-mono fd" letterSpacing="0.06em">
            <tspan className="ok">✓ </tspan>
            {t}
          </text>
        ))}
      </g>
    </g>
  );
}

function Dims() {
  const w = UW * K;
  const h = UH * K;
  return (
    <g className="ms-dims fd">
      <path d={`M0 -26H${w}M0 -36V-16M${w} -36V-16`} className="ln thin" />
      <path d={`M-6 -20L6 -32M${w - 6} -20L${w + 6} -32`} className="ln" />
      <text x={w / 2} y={-34} textAnchor="middle" fontSize={12} className="t-mono">
        25'-0"
      </text>
      <path d={`M${w + 26} 0V${h}M${w + 16} 0H${w + 36}M${w + 16} ${h}H${w + 36}`} className="ln thin" />
      <path d={`M${w + 20} 6L${w + 32} -6M${w + 20} ${h + 6}L${w + 32} ${h - 6}`} className="ln" />
      <text x={w + 46} y={h / 2} textAnchor="middle" fontSize={12} className="t-mono" transform={`rotate(90 ${w + 46} ${h / 2})`}>
        32'-6"
      </text>
    </g>
  );
}

export function ProcessRow() {
  const data = useMemo(() => {
    const unit = mapPlan(unitStandalone(UW), { k: K });
    const units = floorUnits();
    const sheet = mapPlan(mergePlans(floorShell(), ...units.map((u) => u.plan)), { k: 0.128 });
    const snaps = resolvePlan(unit)
      .pieces.filter((p) => p.layer !== 'int')
      .flatMap((p) => [
        [p.x, p.y],
        [p.x + p.w, p.y + p.h],
      ]);
    const k2 = 0.4;
    const row: Plan[] = [];
    for (let i = 0; i < 3; i++) {
      const mirrored = i % 2 === 1;
      row.push(
        mapPlan(unitStandalone(UW), { k: k2, sx: mirrored ? -1 : 1, sy: -1, tx: (mirrored ? i + 1 : i) * UW * k2, ty: UH * k2 }),
      );
      row.push(
        mapPlan(unitStandalone(UW), {
          k: k2,
          sx: mirrored ? -1 : 1,
          tx: (mirrored ? i + 1 : i) * UW * k2,
          ty: UH * k2 + 24,
        }),
      );
    }
    return { unit, sheet, snaps, row, k2 };
  }, []);

  const { x: X, y: Y, size, gap } = AT.process;
  const ox = (size - UW * K) / 2;
  const oy = 46;
  const doorX = ox + 200 * K;
  const cloud = cloudPath({ x: doorX - 22, y: oy - 26, w: 50 * K + 44, h: 50 * K + 40 }, 9);

  return (
    <g id="d-process">
      {STEPS.map((step, i) => {
        const x = X + i * (size + gap);
        return (
          <g key={step} id={`pf-${i + 1}`} transform={`translate(${x} ${Y})`}>
            <rect width={size} height={size} className="frame" />
            <g className="pf-content">
              {i === 0 && <ReadFrame sheet={data.sheet} />}
              {i === 1 && (
                <g transform={`translate(${ox} ${oy})`}>
                  <PlanCad plan={data.unit} className="colorcoded" labels={false} />
                </g>
              )}
              {i === 2 && (
                <g transform={`translate(${ox} ${oy + 10})`}>
                  <g className="ghost">
                    <PlanCad plan={data.unit} anim={false} labels={false} />
                  </g>
                  <PlanCad plan={data.unit} className="cad" labels={false} />
                  <g className="ms-snaps fd">
                    {data.snaps.map(([sx, sy], j) => (
                      <rect key={j} x={sx - 4} y={sy - 4} width={8} height={8} className="snap" />
                    ))}
                  </g>
                  <Dims />
                </g>
              )}
              {i === 3 && (
                <g transform={`translate(${(size - 3 * UW * data.k2) / 2} 40)`}>
                  {data.row.map((p, j) => (
                    <g key={j} className="asm-unit" data-col={Math.floor(j / 2)}>
                      <PlanCad plan={p} anim={false} labels={false} className="cad asm" />
                    </g>
                  ))}
                  <g className="asm-merge fd">
                    {[1, 2].map((c) => (
                      <path key={c} d={`M${c * UW * data.k2} 0V${UH * data.k2 * 2 + 24}`} className="merge-line" />
                    ))}
                  </g>
                </g>
              )}
              {i === 4 && (
                <g>
                  <g transform={`translate(${ox} ${oy})`}>
                    <PlanCad plan={data.unit} anim={false} labels={false} className="cad" />
                  </g>
                  <path d={cloud} pathLength={1} className="dr redline" />
                  <g className="ck-flag fd">
                    <path d={`M${doorX + 70} ${oy - 34}l14 -24l14 24Z`} className="redline-fill" />
                    <text x={doorX + 84} y={oy - 39} textAnchor="middle" fontSize={12} className="t-mono">
                      1
                    </text>
                    <text x={doorX + 106} y={oy - 40} fontSize={12} className="t-mono redline-text">
                      SWING?
                    </text>
                  </g>
                </g>
              )}
            </g>
            <DetailTitle x={0} y={size + 70} n={String(i + 1)} sheet="G-501" title={step} size={0.72} width={size} />
          </g>
        );
      })}
    </g>
  );
}
