import { AT } from './plans';

export const TB_ROWS = {
  product: [140, 660],
  project: [660, 1180],
  issued: [1180, 1800],
  revisions: [1800, 2760],
  access: [2760, 3300],
  sheet: [3300, 3860],
} as const;

export const AUDIENCE: [string, string][] = [
  ['ARCHITECTURE FIRMS', 'Concept sketch to CAD, existing conditions'],
  ['MEP + HVAC ENGINEERS', 'Mechanical layers and take-offs from PDF sets'],
  ['CONTRACTORS + ESTIMATORS', 'Quantities straight from the drawings'],
  ['DEVELOPERS + OWNERS', 'Digitising PDF-only buildings'],
  ['CAD DRAFTING SERVICES', 'The same work at a fraction of the hours'],
];

export const REVISIONS: { rev: string; title: string; detail: string; status: string; tone: 'done' | 'wip' | 'next' }[] = [
  { rev: 'A', title: 'SKETCH → CAD', detail: 'END TO END ON REAL CLIENT SKETCHES', status: 'WORKING', tone: 'done' },
  { rev: 'B', title: 'PDF → CAD · ONE FULL FLOOR', detail: 'WALLS, DOORS, WINDOWS, MECHANICAL', status: 'BUILT', tone: 'done' },
  { rev: 'C', title: 'PDF → CAD · 3 PARKING LEVELS', detail: 'EVERY STALL NUMBERED AND TYPED', status: 'BUILT', tone: 'done' },
  { rev: 'D', title: 'EVERY FLOOR OF THE BUILDING', detail: 'EXTENDING FROM ONE FLOOR TO ALL', status: 'IN PROGRESS', tone: 'wip' },
  { rev: 'E', title: 'ELECTRICAL, PLUMBING, MORE TYPES', detail: 'PLUS A WEB DASHBOARD', status: 'NEXT', tone: 'next' },
];

function Head({ y, text }: { y: number; text: string }) {
  return (
    <>
      <path d={`M0 ${y}H560`} className="ln heavy" />
      <text x={20} y={y + 34} fontSize={15} className="t-mono dim" letterSpacing="0.2em">
        {text}
      </text>
    </>
  );
}

export function TitleBlock() {
  const { x, y, w, h } = AT.titleBlock;
  const R = TB_ROWS;
  const top = (r: readonly [number, number]) => r[0] - y;
  return (
    <g id="d-title" transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} className="ln heavy" />

      <text x={24} y={150} fontSize={88} className="t-serif">
        [Product]
      </text>
      <text x={26} y={222} fontSize={46} className="t-serif italic">
        Drafting, automated.
      </text>
      {['AI THAT TURNS SKETCHES AND DRAWING', 'SETS INTO CLEAN, LAYERED CAD. THE', 'DRAFTING THAT TAKES DAYS, IN MINUTES.'].map(
        (l, i) => (
          <text key={l} x={26} y={300 + i * 30} fontSize={17} className="t-mono" letterSpacing="0.06em">
            {l}
          </text>
        ),
      )}

      <Head y={top(R.project)} text="PROJECT DATA · TESTED ON" />
      {[
        ['SKETCHES', 'FROM WORKING ARCHITECTS'],
        ['PERMIT SET', '20 SHEETS · MECHANICAL'],
        ['BUILDING', '186 UNITS · RESIDENTIAL'],
        ['LEVELS', '7 RESIDENTIAL + 3 PARKING'],
      ].map(([k, v], i) => (
        <g key={k}>
          <text x={24} y={top(R.project) + 104 + i * 88} fontSize={14} className="t-mono dim" letterSpacing="0.14em">
            {k}
          </text>
          <text x={24} y={top(R.project) + 134 + i * 88} fontSize={20} className="t-mono" letterSpacing="0.04em">
            {v}
          </text>
        </g>
      ))}

      <Head y={top(R.issued)} text="ISSUED FOR" />
      {AUDIENCE.map(([who, what], i) => {
        const ry = top(R.issued) + 70 + i * 106;
        return (
          <g key={who}>
            <rect x={24} y={ry} width={28} height={28} className="ln" />
            <path d={`M29 ${ry + 15}l7 8l13 -18`} pathLength={1} className="dr check" />
            <text x={70} y={ry + 22} fontSize={19} className="t-mono" letterSpacing="0.06em">
              {who}
            </text>
            <text x={70} y={ry + 50} fontSize={15} className="t-sans dim">
              {what}
            </text>
          </g>
        );
      })}

      <Head y={top(R.revisions)} text="REVISIONS · STATUS" />
      {REVISIONS.map((r, i) => {
        const ry = top(R.revisions) + 76 + i * 172;
        return (
          <g key={r.rev} className="tb-rev fd">
            <path d={`M20 ${ry + 32}l20 -36l20 36Z`} className="ln" />
            <text x={40} y={ry + 26} textAnchor="middle" fontSize={16} className="t-mono">
              {r.rev}
            </text>
            <text x={78} y={ry + 16} fontSize={18} className="t-mono" letterSpacing="0.04em">
              {r.title}
            </text>
            <text x={78} y={ry + 44} fontSize={14} className="t-mono dim" letterSpacing="0.06em">
              {r.detail}
            </text>
            <rect x={78} y={ry + 64} width={r.status.length * 11 + 28} height={30} rx={15} className={`status status-${r.tone}`} />
            <text x={92} y={ry + 84} fontSize={14} className={`t-mono status-text status-text-${r.tone}`} letterSpacing="0.12em">
              {r.status}
            </text>
          </g>
        );
      })}

      <Head y={top(R.access)} text="EARLY ACCESS · REQUEST" />
      {['NAME', 'FIRM', 'ROLE', 'DRAWINGS'].map((f, i) => {
        const ry = top(R.access) + 100 + i * 96;
        return (
          <g key={f}>
            <text x={24} y={ry} fontSize={14} className="t-mono dim" letterSpacing="0.16em">
              {f}
            </text>
            <path d={`M24 ${ry + 44}H536`} className="ln thin" />
          </g>
        );
      })}
      <g className="tb-stamp fd" transform={`translate(380 ${top(R.access) + 250}) rotate(-12)`}>
        <rect x={-110} y={-40} width={220} height={80} rx={8} className="stamp" />
        <text textAnchor="middle" y={-4} fontSize={22} className="t-mono stamp-text" letterSpacing="0.16em">
          OPEN
        </text>
        <text textAnchor="middle" y={24} fontSize={13} className="t-mono stamp-text" letterSpacing="0.16em">
          EARLY ACCESS
        </text>
      </g>

      <Head y={top(R.sheet)} text="SHEET" />
      <text x={22} y={top(R.sheet) + 220} fontSize={190} className="t-serif">
        A-000
      </text>
      <text x={24} y={top(R.sheet) + 300} fontSize={17} className="t-mono" letterSpacing="0.12em">
        DRAFTING, AUTOMATED.
      </text>
      <text x={24} y={top(R.sheet) + 340} fontSize={14} className="t-mono dim" letterSpacing="0.12em">
        SCALE AS NOTED · REV E · 2026
      </text>
      <text x={24} y={top(R.sheet) + 380} fontSize={14} className="t-mono dim" letterSpacing="0.12em">
        SHEET 1 OF 1
      </text>
    </g>
  );
}
