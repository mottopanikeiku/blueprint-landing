import { useMemo } from 'react';
import { DetailTitle, PlanCad } from './cad';
import { ftIn, mergePlans, polyPath } from './geometry';
import { AT, FLOOR, FLOOR_MAIN, floorShell, floorUnits, type Duct } from './plans';

function DuctRuns({ ducts }: { ducts: Duct[] }) {
  // Outer strokes first, inner (sheet-coloured) strokes second: junctions read as one duct.
  return (
    <>
      {ducts.map((d, i) => (
        <path key={`o${i}`} d={polyPath(d.pts)} strokeWidth={d.w} pathLength={1} className={`dr duct duct-${d.sys}`} />
      ))}
      {ducts.map((d, i) => (
        <path key={`i${i}`} d={polyPath(d.pts)} strokeWidth={d.w - 2.6} pathLength={1} className="dr duct-core" />
      ))}
    </>
  );
}

export function FloorPlate() {
  const { units, full } = useMemo(() => {
    const units = floorUnits();
    const full = mergePlans(floorShell(), ...units.map((u) => u.plan));
    return { units, full };
  }, []);
  const F = AT.floor;
  const fc = units.find((u) => u.id === '308')!.mech.fc;
  const allDucts = [{ pts: FLOOR_MAIN.duct.pts, w: FLOOR_MAIN.duct.w, sys: 'sup' as const }, ...units.flatMap((u) => u.mech.ducts)];
  const mainLen = FLOOR_MAIN.duct.pts[1][0] - FLOOR_MAIN.duct.pts[0][0];

  return (
    <g id="d-floor" transform={`translate(${F.x} ${F.y})`}>
      {/* the PDF underlay */}
      <g className="ghost">
        <PlanCad plan={full} anim={false} labels={false} />
      </g>
      <text x={0} y={-36} fontSize={18} className="t-mono dim" letterSpacing="0.14em">
        SOURCE · PERMIT SET · SHEET M-301 · LEVEL 3 (PDF, VECTOR)
      </text>

      {/* type recognition: one unit recognised, then placed on every copy */}
      <g className="instances">
        {units.map((u) => {
          const firstOfType = u.id === '301' || u.id === '307';
          return (
            <g key={u.id} className={firstOfType ? 'inst inst-first' : 'inst inst-copy'}>
              <rect x={u.box.x + 10} y={u.box.y + 10} width={u.box.w - 20} height={u.box.h - 20} className="inst-box" />
              <text x={u.box.x + 22} y={u.box.y + 40} fontSize={17} className="t-mono" letterSpacing="0.1em">
                {firstOfType ? `TYPE ${u.type} · FOUND` : `TYPE ${u.type}`}
              </text>
            </g>
          );
        })}
      </g>

      {/* the CAD output */}
      <PlanCad plan={full} className="cad" labelSize={15} />
      <g className="unit-lbl fd">
        {units.map((u) => (
          <g key={u.id}>
            <text x={u.center[0]} y={u.center[1] + (u.type === 'A' ? 40 : -10)} textAnchor="middle" fontSize={26} className="t-display">
              {u.id}
            </text>
            <text x={u.center[0]} y={u.center[1] + (u.type === 'A' ? 62 : 12)} textAnchor="middle" fontSize={13} className="t-mono dim" letterSpacing="0.12em">
              TYPE {u.type}
            </text>
          </g>
        ))}
        <text x={820} y={456} fontSize={15} className="t-mono dim" letterSpacing="0.3em">
          CORRIDOR
        </text>
      </g>

      {/* mechanical */}
      <g id="d-mech">
        <g className="mech-ducts">
          <DuctRuns ducts={allDucts} />
        </g>
        <g className="mech-eqpm fd">
          {units.map((u) => {
            const m = u.mech;
            return (
              <g key={u.id}>
                <rect x={m.fc.x} y={m.fc.y} width={m.fc.w} height={m.fc.h} className="mech-box" />
                <path d={`M${m.fc.x} ${m.fc.y}l${m.fc.w} ${m.fc.h}M${m.fc.x + m.fc.w} ${m.fc.y}l${-m.fc.w} ${m.fc.h}`} className="mech-line" />
                <circle cx={m.ef[0]} cy={m.ef[1]} r={10} className="mech-box" />
                <path d={`M${m.ef[0] - 7} ${m.ef[1]}h14M${m.ef[0]} ${m.ef[1] - 7}v14`} className="mech-line" />
                {m.grilles.map((g, i) => (
                  <g key={i}>
                    <rect x={g[0] - 12} y={g[1] - 12} width={24} height={24} className="mech-box" />
                    <path d={`M${g[0] - 12} ${g[1] - 12}l24 24M${g[0] + 12} ${g[1] - 12}l-24 24`} className="mech-line" />
                  </g>
                ))}
                {m.dampers.map((d, i) => (
                  <g key={i}>
                    <path d={`M${d.at[0] - 9} ${d.at[1]}h18`} className="mech-line heavy" />
                    <circle cx={d.at[0]} cy={d.at[1]} r={3} className="mech-dot" />
                  </g>
                ))}
                <rect x={m.cap[0] - 9} y={m.cap[1] - 9} width={18} height={18} className="mech-box" />
              </g>
            );
          })}
          <rect {...{ x: FLOOR_MAIN.erv.x, y: FLOOR_MAIN.erv.y, width: FLOOR_MAIN.erv.w, height: FLOOR_MAIN.erv.h }} className="mech-box heavy" />
          <text x={FLOOR_MAIN.erv.x + FLOOR_MAIN.erv.w / 2} y={FLOOR_MAIN.erv.y + 46} textAnchor="middle" fontSize={16} className="t-mono mech-text">
            ERV-1
          </text>
        </g>
        <g className="mech-tags fd">
          {units.map((u) => (
            <g key={u.id}>
              <text x={u.mech.fc.x + u.mech.fc.w / 2} y={u.mech.fc.y + u.mech.fc.h / 2 + 5} textAnchor="middle" fontSize={11} className="t-mono mech-text halo">
                FC-{u.id}
              </text>
              {u.mech.tags.map((t, i) => (
                <text key={i} x={t.at[0]} y={t.at[1]} textAnchor="middle" fontSize={12} className="t-mono mech-text halo">
                  {t.text}
                </text>
              ))}
            </g>
          ))}
          {FLOOR_MAIN.tags.map((t, i) => (
            <text key={i} x={t.at[0]} y={t.at[1]} textAnchor="middle" fontSize={14} className="t-mono mech-text halo">
              {t.text}
            </text>
          ))}
        </g>

        {/* smart objects */}
        <g className="mech-callouts fd">
          <path d={`M${fc.x + fc.w / 2} ${fc.y + fc.h}V${FLOOR.h + 120}H${330}`} className="leader" />
          <circle cx={fc.x + fc.w / 2} cy={fc.y + fc.h / 2} r={42} className="leader" />
          <g transform={`translate(20 ${FLOOR.h + 80})`}>
            <rect width={310} height={154} className="callout" />
            <text x={18} y={34} fontSize={20} className="t-mono mech-text" letterSpacing="0.08em">
              FC-308 · FAN COIL
            </text>
            {[
              ['TYPE', 'FCU, HORIZONTAL'],
              ['AIRFLOW', '450 CFM'],
              ['LAYER', 'M-HVAC-EQPM'],
            ].map(([k, v], i) => (
              <g key={k}>
                <text x={18} y={70 + i * 28} fontSize={15} className="t-mono dim">
                  {k}
                </text>
                <text x={128} y={70 + i * 28} fontSize={15} className="t-mono">
                  {v}
                </text>
              </g>
            ))}
          </g>
          <path d={`M${1000} ${FLOOR_MAIN.duct.pts[0][1] + 11}V${FLOOR.h + 120}H${690}`} className="leader" />
          <g transform={`translate(380 ${FLOOR.h + 80})`}>
            <rect width={310} height={154} className="callout" />
            <text x={18} y={34} fontSize={20} className="t-mono mech-text" letterSpacing="0.08em">
              DUCT · SUPPLY MAIN
            </text>
            {[
              ['SIZE', '16" × 10"'],
              ['LENGTH', ftIn(mainLen)],
              ['LAYER', 'M-HVAC-SUPP'],
            ].map(([k, v], i) => (
              <g key={k}>
                <text x={18} y={70 + i * 28} fontSize={15} className="t-mono dim">
                  {k}
                </text>
                <text x={128} y={70 + i * 28} fontSize={15} className="t-mono">
                  {v}
                </text>
              </g>
            ))}
          </g>
        </g>
      </g>

      <DetailTitle x={1400} y={FLOOR.h + 150} n="2" sheet="A-201" title="Level 3 · PDF → CAD" scale={'ARCHITECTURE + MECHANICAL · L3.DXF'} width={1000} />
    </g>
  );
}
