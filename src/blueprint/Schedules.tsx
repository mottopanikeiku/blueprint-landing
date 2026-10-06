import type { ReactNode } from 'react';
import { DetailTitle } from './cad';
import { cloudPath, ftIn, type Pt } from './geometry';
import { AT, FLOOR_MAIN, floorUnits } from './plans';

/** [name, contents, lineweight, display colour] */
export const LAYERS: [string, string, string, string][] = [
  ['A-WALL-EXTR', 'Exterior walls', '0.50', '#ffffff'],
  ['A-WALL-DEMS', 'Walls between units', '0.35', '#d9e6ff'],
  ['A-WALL-INTR', 'Interior partitions', '0.25', '#aecaf5'],
  ['A-DOOR', 'Doors and swings', '0.18', '#8fe3ff'],
  ['A-GLAZ', 'Windows', '0.18', '#6fc9ff'],
  ['A-FLOR-STRS', 'Stairs, elevator cores', '0.18', '#c4b5ff'],
  ['A-FURN', 'Furniture', '0.13', '#9db4d8'],
  ['P-FIXT', 'Plumbing fixtures', '0.13', '#ffacd6'],
  ['A-ANNO-TEXT', 'Room names, unit tags', '0.18', '#eef4ff'],
  ['M-HVAC-SUPP', 'Supply ductwork', '0.35', '#ffc56b'],
  ['M-HVAC-EXHS', 'Exhaust ductwork', '0.35', '#ff9a6e'],
  ['M-HVAC-EQPM', 'Fans, fan coils, ERV', '0.25', '#ffe39a'],
  ['A-PKNG-STRP', 'Parking stalls', '0.25', '#a9efbf'],
];

function runLength(pts: readonly Pt[]): number {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return total;
}

function takeoffRows(): string[][] {
  const u = floorUnits().find((x) => x.id === '308')!;
  const [b1, b2, ex, oa] = u.mech.ducts;
  return [
    ['D-101', 'Supply main', '16×10', ftIn(runLength(FLOOR_MAIN.duct.pts)), '—'],
    ['D-308A', 'Supply branch', '8×6', ftIn(runLength(b1.pts)), '300'],
    ['D-308B', 'Supply branch', '6×6', ftIn(runLength(b2.pts)), '150'],
    ['D-308C', 'Outside air', '6"Ø', ftIn(runLength(oa.pts)), '45'],
    ['E-308', 'Bath exhaust', '4"Ø', ftIn(runLength(ex.pts)), '80'],
    ['FC-308', 'Fan coil', '—', '1 EA', '450'],
    ['EF-308', 'Exhaust fan', '—', '1 EA', '80'],
    ['WC-308', 'Wall cap', '4"Ø', '1 EA', '—'],
    ['ERV-1', 'Energy recovery', '—', '1 EA', '2,100'],
  ];
}

const ROW = 40;

function Table({
  x,
  y,
  title,
  cols,
  widths,
  rows,
  footer,
  rowClass,
}: {
  x: number;
  y: number;
  title: string;
  cols: string[];
  widths: number[];
  rows: ReactNode[][];
  footer?: string;
  rowClass: string;
}) {
  const w = widths.reduce((a, b) => a + b, 0);
  const xs = widths.map((_, i) => widths.slice(0, i).reduce((a, b) => a + b, 0));
  const h = 96 + rows.length * ROW;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} className="ln heavy" />
      <path d={`M0 56H${w}M0 96H${w}`} className="ln" />
      <text x={18} y={38} fontSize={22} className="t-mono" letterSpacing="0.16em">
        {title}
      </text>
      {cols.map((c, i) => (
        <text key={c} x={xs[i] + 14} y={82} fontSize={14} className="t-mono dim" letterSpacing="0.12em">
          {c}
        </text>
      ))}
      {xs.slice(1).map((cx) => (
        <path key={cx} d={`M${cx} 56V${h}`} className="ln thin" />
      ))}
      {rows.map((r, j) => (
        <g key={j} className={`${rowClass} fd`}>
          <path d={`M0 ${96 + (j + 1) * ROW}H${w}`} className="ln thin" />
          {r.map((cell, i) => (
            <text key={i} x={xs[i] + 14} y={96 + j * ROW + 27} fontSize={15} className="t-mono">
              {cell}
            </text>
          ))}
        </g>
      ))}
      {footer && (
        <text x={0} y={h + 34} fontSize={14} className="t-mono dim" letterSpacing="0.14em">
          {footer}
        </text>
      )}
    </g>
  );
}

export const REVIEW = [
  { n: '1', what: 'Door swing unclear', where: 'Unit 308 · entry' },
  { n: '2', what: 'Duct size illegible', where: 'Corridor · grid C/4' },
  { n: '3', what: 'Stall type ambiguous', where: 'P1 · stall 024' },
];

function Thumb({ x, y, after }: { x: number; y: number; after: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={120} height={84} className={after ? 'ln' : 'ln thin'} />
      <path
        d="M14 70V18H70M70 18V44M14 70H106V40"
        className={after ? 'ln heavy' : 'ghost-line wobble'}
        transform={after ? undefined : 'rotate(1.5 60 42)'}
      />
      <path d="M70 44a26 26 0 0 1 26 26" className={after ? 'ln thin' : 'ghost-line'} />
      <text x={6} y={-8} fontSize={11} className="t-mono dim" letterSpacing="0.12em">
        {after ? 'AFTER' : 'BEFORE'}
      </text>
    </g>
  );
}

export function Schedules() {
  const { x, y } = AT.schedules;
  const rows = takeoffRows();
  return (
    <g id="d-schedules">
      <Table
        x={x}
        y={y}
        title="EXAMPLE LAYERS"
        cols={['LAYER', 'CONTENTS', 'LW']}
        widths={[250, 430, 120]}
        rows={LAYERS.map(([n, d, lw, color]) => [
          <tspan key="n">
            <tspan style={{ fill: color }}>■ </tspan>
            {n}
          </tspan>,
          d,
          lw,
        ])}
        rowClass="tb-layer"
        footer="SVG DISPLAY GROUPS · NO DXF GENERATED"
      />
      <Table
        x={x + 860}
        y={y}
        title="SYNTHETIC TAKE-OFF"
        cols={['TAG', 'ITEM', 'SIZE', 'LEN/QTY', 'CFM']}
        widths={[130, 230, 110, 140, 90]}
        rows={rows}
        rowClass="tb-take"
        footer="LENGTHS FROM AUTHORED PATHS · OTHER VALUES ILLUSTRATIVE"
      />
      <g transform={`translate(${x + 1620} ${y})`}>
        <rect width={780} height={616} className="ln heavy" />
        <path d="M0 56H780" className="ln" />
        <text x={18} y={38} fontSize={22} className="t-mono" letterSpacing="0.16em">
          EXAMPLE REVIEW ITEMS
        </text>
        {REVIEW.map((r, i) => (
          <g key={r.n} className="tb-review fd" transform={`translate(0 ${80 + i * 178})`}>
            <path d="M24 0l14 -24l14 24Z" transform="translate(0 30)" className="redline-fill" />
            <text x={38} y={25} textAnchor="middle" fontSize={13} className="t-mono">
              {r.n}
            </text>
            <text x={70} y={22} fontSize={18} className="t-mono">
              {r.what.toUpperCase()}
            </text>
            <text x={70} y={48} fontSize={14} className="t-mono dim" letterSpacing="0.08em">
              {r.where.toUpperCase()}
            </text>
            <Thumb x={70} y={76} after={false} />
            <Thumb x={210} y={76} after />
            <path d={cloudPath({ x: 250, y: 100, w: 54, h: 48 }, 7)} className="redline" />
            {i < 2 && <path d="M18 168H762" className="ln thin" />}
          </g>
        ))}
        <text x={0} y={650} fontSize={14} className="t-mono dim" letterSpacing="0.14em">
          SCRIPTED EXCEPTIONS · NOT DETECTED FROM A FILE
        </text>
      </g>
      <DetailTitle x={x} y={y + 780} n="4" sheet="G-601" title="Output concept" scale="SYNTHETIC LAYERS · TAKE-OFFS · REVIEW" width={2400} />
    </g>
  );
}

export function Legend() {
  const { x, y } = AT.legend;
  const items: [string, ReactNode][] = [
    ['DOOR + SWING', <g key="d"><path d="M0 40H10M50 40H60M10 40V0" className="ln" /><path d="M10 0A40 40 0 0 1 50 40" className="ln thin" /></g>],
    ['WINDOW', <g key="w"><rect y={16} width={60} height={14} className="ln" /><path d="M0 23H60" className="ln thin" /></g>],
    ['SUPPLY GRILLE', <g key="g"><rect x={14} y={4} width={32} height={32} className="mech-box" /><path d="M14 4l32 32M46 4l-32 32" className="mech-line" /></g>],
    ['DAMPER', <g key="dm"><path d="M0 20H60" strokeWidth={14} className="duct duct-sup" /><path d="M0 20H60" strokeWidth={11} className="duct-core" /><path d="M30 6V34" className="mech-line heavy" /></g>],
    ['FAN COIL', <g key="fc"><rect x={6} y={2} width={48} height={36} className="mech-box" /><path d="M6 2l48 36M54 2l-48 36" className="mech-line" /></g>],
    ['REVISION CLOUD', <path key="rc" d={cloudPath({ x: 4, y: 4, w: 52, h: 32 }, 7)} className="redline" />],
    ['SNAP POINT', <g key="sn"><path d="M0 20H60M30 0V40" className="ln thin" /><rect x={25} y={15} width={10} height={10} className="snap" /></g>],
  ];
  return (
    <g id="d-legend" transform={`translate(${x} ${y})`}>
      <text y={0} fontSize={22} className="t-mono" letterSpacing="0.16em">
        LEGEND
      </text>
      <path d="M0 18H2400" className="ln" />
      {items.map(([label, glyph], i) => (
        <g key={label} transform={`translate(${(i % 4) * 600} ${60 + Math.floor(i / 4) * 110})`}>
          {glyph}
          <text x={90} y={28} fontSize={16} className="t-mono" letterSpacing="0.1em">
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

export const NOTES = [
  'THIS LANDING PAGE ILLUSTRATES A PROPOSED SKETCH AND PDF TO CAD WORKFLOW. NO AI MODEL RUNS HERE.',
  'ALL DRAWINGS COME FROM AUTHORED PLAN GEOMETRY: THE SKETCH, UNDERLAY AND CLEAN DRAWING SHARE THE SAME SOURCE.',
  'EQUIPMENT SPECIFICATIONS AND REVIEW EXCEPTIONS ARE SYNTHETIC EXAMPLES, NOT CLIENT-PROJECT RESULTS.',
  'THE DASHBOARD CURSOR AND EXPORT NOTIFICATION ARE SCRIPTED. NO CAD OR SPREADSHEET FILE IS GENERATED.',
];

function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if ((line + ' ' + word).trim().length > max) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

export function GeneralNotes() {
  const { x, y } = AT.notes;
  let cursor = 56;
  return (
    <g id="d-notes" transform={`translate(${x} ${y})`}>
      <text fontSize={22} className="t-mono" letterSpacing="0.16em">
        GENERAL NOTES · CONCEPT
      </text>
      <path d="M0 18H2280" className="ln" />
      {NOTES.map((n, i) => {
        const lines = wrap(n, 104);
        const top = cursor;
        cursor += lines.length * 30 + 16;
        return (
          <g key={i} className="note fd">
            <text x={0} y={top} fontSize={20} className="t-mono">
              {i + 1}.
            </text>
            {lines.map((l, j) => (
              <text key={j} x={44} y={top + j * 30} fontSize={20} className="t-mono" letterSpacing="0.04em">
                {l}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}
