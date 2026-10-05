import { useMemo } from 'react';
import { DetailTitle, PlanCad } from './cad';
import { AT, PARKING, PARKING_COLUMNS, PARKING_RAMP, parkingShell, parkingStalls, type Stall } from './plans';

const GRID_X = [0, 1, 2, 3, 4, 5, 6].map((k) => 60 + 324 * k);
const GRID_Y = [256, 544, 976, 1264];

function stallLines(s: Stall): string {
  // side stripes + back line; the open side faces the aisle
  const back = s.faceUp ? s.y + s.h : s.y;
  return `M${s.x} ${s.y}V${s.y + s.h}M${s.x + s.w} ${s.y}V${s.y + s.h}M${s.x} ${back}H${s.x + s.w}`;
}

export function ParkingLevel() {
  const { shell, stalls } = useMemo(() => ({ shell: parkingShell(), stalls: parkingStalls() }), []);
  const P = AT.parking;
  const R = PARKING_RAMP;
  return (
    <g id="d-parking" transform={`translate(${P.x} ${P.y})`}>
      {/* grid lines + bubbles are part of the sheet, always visible */}
      <g className="grid-lines">
        {GRID_X.map((x, i) => (
          <g key={x}>
            <path d={`M${x} -60V${PARKING.h + 30}`} className="gridline" />
            <circle cx={x} cy={-84} r={24} className="ln" />
            <text x={x} y={-77} textAnchor="middle" fontSize={20} className="t-mono">
              {String.fromCharCode(65 + i)}
            </text>
          </g>
        ))}
        {GRID_Y.map((y, i) => (
          <g key={y}>
            <path d={`M-60 ${y}H${PARKING.w + 30}`} className="gridline" />
            <circle cx={-84} cy={y} r={24} className="ln" />
            <text x={-84} y={y + 7} textAnchor="middle" fontSize={20} className="t-mono">
              {i + 1}
            </text>
          </g>
        ))}
      </g>

      {/* PDF underlay */}
      <g className="ghost">
        <PlanCad plan={shell} anim={false} labels={false} />
        <path d={stalls.map(stallLines).join('')} className="ghost-line" />
      </g>

      {/* output */}
      <PlanCad plan={shell} className="cad" labelSize={18} />
      <g className="pk-cols fd">
        {PARKING_COLUMNS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 13} y={y - 13} width={26} height={26} className="column" />
        ))}
      </g>
      <g className="pk-ramp fd">
        <rect x={R.x} y={R.y} width={R.w} height={R.h} className="ln" />
        <rect x={R.x} y={R.y} width={R.w} height={R.h} fill="url(#hatch-ramp)" />
        <path d={`M${R.x + 40} ${R.y + R.h / 2}H${R.x + R.w - 60}`} className="ln heavy" />
        <path d={`M${R.x + R.w - 78} ${R.y + R.h / 2 - 16}l20 16l-20 16`} className="ln heavy" />
        <text x={R.x + R.w / 2} y={R.y + R.h / 2 - 30} textAnchor="middle" fontSize={22} className="t-mono halo" letterSpacing="0.12em">
          RAMP UP · 5%
        </text>
      </g>
      <g className="layer-pkng">
      <g className="pk-stalls">
        {stalls.map((s) => (
          <path key={s.n} d={stallLines(s)} pathLength={1} className="dr stall" />
        ))}
      </g>
      <g className="pk-acc fd">
        {stalls
          .filter((s) => s.type === 'ACC')
          .map((s) => (
            <rect key={s.n} x={s.x + 6} y={s.y + 6} width={s.w - 12} height={s.h - 12} fill="url(#hatch-acc)" />
          ))}
      </g>
      <g className="pk-nums fd">
        {stalls.map((s) => (
          <text key={s.n} x={s.x + s.w / 2} y={s.y + s.h / 2 - 2} textAnchor="middle" fontSize={22} className="t-mono halo">
            {String(s.n).padStart(3, '0')}
          </text>
        ))}
      </g>
      <g className="pk-types fd">
        {stalls.map((s) => (
          <text
            key={s.n}
            x={s.x + s.w / 2}
            y={s.y + s.h / 2 + 30}
            textAnchor="middle"
            fontSize={15}
            className={`t-mono halo stall-type stall-${s.type}`}
            letterSpacing="0.1em"
          >
            {s.type}
          </text>
        ))}
      </g>
      </g>
      <g className="pk-flow fd">
        {[400, 1350].map((y) => (
          <g key={y}>
            {[500, 1100, 1700].map((x) => (
              <path key={x} d={`M${x - 70} ${y}H${x + 50}M${x + 30} ${y - 16}l22 16l-22 16`} className="ln flow" />
            ))}
          </g>
        ))}
        <text x={PARKING.w - 30} y={1128} textAnchor="end" fontSize={20} className="t-mono" letterSpacing="0.14em">
          ENTRY / EXIT →
        </text>
      </g>

      <DetailTitle x={0} y={PARKING.h + 140} n="3" sheet="P-101" title="Parking level P1" scale={`${stalls.length} STALLS · NUMBERED, TYPED · P1.DXF`} width={PARKING.w} />
    </g>
  );
}
