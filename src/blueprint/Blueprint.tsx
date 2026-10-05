import { forwardRef, memo } from 'react';
import { cloudPath } from './geometry';
import { FloorPlate } from './Floor';
import { ParkingLevel } from './Parking';
import { WORLD } from './plans';
import { ProcessRow } from './Process';
import { GeneralNotes, Legend, Schedules } from './Schedules';
import { SketchDetail } from './Sketch';
import { TitleBlock } from './TitleBlock';

const PROBLEMS = [
  { box: { x: 200, y: 290, w: 1080, h: 880 }, tag: '1 · REDRAWN BY HAND', at: [220, 250] },
  { box: { x: 2650, y: 370, w: 2470, h: 450 }, tag: '2 · ONLY A PDF', at: [2670, 330] },
  { box: { x: 2650, y: 880, w: 2470, h: 470 }, tag: '3 · COPY WORK · 14 UNITS, 2 TYPES', at: [3700, 1400] },
] as const;

function SheetFrame() {
  const zonesX = 8;
  const zonesY = 6;
  return (
    <g className="frame-layer">
      <rect x={60} y={60} width={WORLD.w - 120} height={WORLD.h - 120} className="ln" />
      <rect x={100} y={100} width={WORLD.w - 200} height={WORLD.h - 200} className="ln heavy" />
      {Array.from({ length: zonesX }, (_, i) => {
        const x = 100 + ((WORLD.w - 200) / zonesX) * (i + 0.5);
        return (
          <g key={`x${i}`}>
            <text x={x} y={88} textAnchor="middle" fontSize={20} className="t-mono dim">
              {i + 1}
            </text>
            <text x={x} y={WORLD.h - 70} textAnchor="middle" fontSize={20} className="t-mono dim">
              {i + 1}
            </text>
            {i > 0 && <path d={`M${x - (WORLD.w - 200) / zonesX / 2} 60V100M${x - (WORLD.w - 200) / zonesX / 2} ${WORLD.h - 100}V${WORLD.h - 60}`} className="ln" />}
          </g>
        );
      })}
      {Array.from({ length: zonesY }, (_, i) => {
        const y = 100 + ((WORLD.h - 200) / zonesY) * (i + 0.5);
        const letter = String.fromCharCode(65 + i);
        return (
          <g key={`y${i}`}>
            <text x={80} y={y + 7} textAnchor="middle" fontSize={20} className="t-mono dim">
              {letter}
            </text>
            <text x={WORLD.w - 80} y={y + 7} textAnchor="middle" fontSize={20} className="t-mono dim">
              {letter}
            </text>
            {i > 0 && <path d={`M60 ${y - (WORLD.h - 200) / zonesY / 2}H100M${WORLD.w - 100} ${y - (WORLD.h - 200) / zonesY / 2}H${WORLD.w - 60}`} className="ln" />}
          </g>
        );
      })}
      {/* north arrow */}
      <g transform="translate(5130 1640)">
        <circle r={56} className="ln" />
        <path d="M0 -70L18 30L0 16L-18 30Z" className="north" />
        <text y={-82} textAnchor="middle" fontSize={22} className="t-mono">
          N
        </text>
      </g>
    </g>
  );
}

function Redlines() {
  return (
    <g id="d-problem">
      {PROBLEMS.map((p) => (
        <g key={p.tag} className="problem">
          <path d={cloudPath(p.box, 34)} pathLength={1} className="dr redline heavy" />
          <text x={p.at[0]} y={p.at[1]} fontSize={34} className="t-mono redline-text fd" letterSpacing="0.1em">
            {p.tag}
          </text>
        </g>
      ))}
    </g>
  );
}

/** The whole drawing. Static after first render: GSAP drives everything else. */
export const Blueprint = memo(
  forwardRef<SVGSVGElement>(function Blueprint(_props, ref) {
    return (
      <svg
        ref={ref}
        className="blueprint"
        viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="An architectural blueprint sheet showing a sketch converted to CAD, a residential floor plan with mechanical ductwork, a parking level, the five-step process, and output schedules."
      >
        <defs>
          <pattern id="grid-minor" width={50} height={50} patternUnits="userSpaceOnUse">
            <path d="M50 0H0V50" className="grid-minor" />
          </pattern>
          <pattern id="grid-major" width={250} height={250} patternUnits="userSpaceOnUse">
            <rect width={250} height={250} fill="url(#grid-minor)" />
            <path d="M250 0H0V250" className="grid-major" />
          </pattern>
          <pattern id="hatch-ext" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={7} height={7} className="hatch-bg" />
            <path d="M0 0V7" className="hatch-line" />
          </pattern>
          <pattern id="hatch-dem" width={5} height={5} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <rect width={5} height={5} className="hatch-bg" />
            <path d="M0 0V5" className="hatch-line faint" />
          </pattern>
          <pattern id="hatch-ramp" width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0V22" className="hatch-line faint" />
          </pattern>
          <pattern id="hatch-acc" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M0 0V14" className="hatch-acc" />
          </pattern>
        </defs>

        <rect x={-4000} y={-4000} width={WORLD.w + 8000} height={WORLD.h + 8000} className="sheet-bg" />
        <rect width={WORLD.w} height={WORLD.h} fill="url(#grid-major)" className="sheet-grid" />
        <SheetFrame />
        <SketchDetail />
        <FloorPlate />
        <ParkingLevel />
        <ProcessRow />
        <Schedules />
        <Legend />
        <GeneralNotes />
        <TitleBlock />
        <Redlines />
      </svg>
    );
  }),
);
