import {
  hDoor,
  hGap,
  hWall,
  hWin,
  mapPlan,
  mapPt,
  mergePlans,
  vDoor,
  vWall,
  vWin,
  type Label,
  type Plan,
  type Prim,
  type Pt,
  type Xf,
} from './geometry';

// ---------------------------------------------------------------------------
// Sheet layout (world units). The whole sheet is 6000 × 4000.

export const WORLD = { w: 6000, h: 4000 };

export const AT = {
  sketchPaper: { x: 240, y: 330, w: 1000, h: 800 },
  sketchCad: { x: 1430, y: 400 },
  floor: { x: 2700, y: 420 },
  parking: { x: 240, y: 1720 },
  process: { x: 2700, y: 1650, size: 440, gap: 50 },
  schedules: { x: 2700, y: 2420 },
  legend: { x: 2700, y: 3470 },
  notes: { x: 240, y: 3530 },
  titleBlock: { x: 5300, y: 140, w: 560, h: 3720 },
};

// ---------------------------------------------------------------------------
// 1. The sketched house (880 × 600)

export const HOUSE = { w: 880, h: 600 };

export function housePlan(): Plan {
  const E = 14;
  const I = 8;
  const walls = [
    hWall(0, 880, 0, E, 'ext'),
    vWall(880, 0, 600, E, 'ext'),
    hWall(0, 880, 600, E, 'ext'),
    vWall(0, 0, 600, E, 'ext'),
    vWall(500, 0, 260, I, 'int'),
    hWall(500, 880, 260, I, 'int'),
    hWall(0, 560, 340, I, 'int'),
    vWall(380, 340, 600, I, 'int'),
    vWall(560, 260, 600, I, 'int'),
    hWall(380, 560, 420, I, 'int'),
  ];
  const openings = [
    hWin(120, 260, 0),
    hWin(640, 760, 0),
    vWin(880, 90, 180),
    vWin(880, 380, 500),
    hWin(130, 250, 600),
    hWin(440, 500, 600),
    hWin(660, 780, 600),
    vDoor(0, 140, 210, 1),
    vWin(0, 250, 320),
    vWin(0, 420, 520),
    { kind: 'gap' as const, p0: [500, 110] as Pt, p1: [500, 230] as Pt },
    hDoor(150, 220, 340, 1),
    hGap(395, 545, 340),
    vDoor(560, 350, 410, 1),
    hDoor(400, 460, 420, 1),
  ];
  const burners: Prim[] = [
    [715, 25],
    [745, 25],
    [715, 50],
    [745, 50],
  ].map(([cx, cy]) => ({ k: 'circle', cx, cy, r: 9 }));
  const fixtures: Prim[] = [
    // kitchen
    { k: 'rect', x: 507, y: 7, w: 366, h: 60 },
    { k: 'rect', x: 813, y: 67, w: 60, h: 186 },
    { k: 'rect', x: 600, y: 15, w: 70, h: 44, rx: 6 },
    { k: 'rect', x: 700, y: 10, w: 60, h: 54 },
    ...burners,
    { k: 'rect', x: 508, y: 190, w: 62, h: 62 },
    { k: 'line', a: [508, 190], b: [570, 252] },
    // living
    { k: 'rect', x: 60, y: 262, w: 220, h: 70, rx: 8 },
    { k: 'rect', x: 60, y: 312, w: 220, h: 20 },
    { k: 'rect', x: 120, y: 180, w: 100, h: 50, rx: 6 },
    { k: 'rect', x: 340, y: 70, w: 90, h: 140, rx: 4 },
    { k: 'rect', x: 308, y: 90, w: 26, h: 26, rx: 4 },
    { k: 'rect', x: 308, y: 160, w: 26, h: 26, rx: 4 },
    { k: 'rect', x: 436, y: 90, w: 26, h: 26, rx: 4 },
    { k: 'rect', x: 436, y: 160, w: 26, h: 26, rx: 4 },
    // bedroom 2
    { k: 'rect', x: 50, y: 410, w: 160, h: 183 },
    { k: 'rect', x: 62, y: 560, w: 64, h: 24, rx: 6 },
    { k: 'rect', x: 134, y: 560, w: 64, h: 24, rx: 6 },
    { k: 'rect', x: 222, y: 556, w: 36, h: 36 },
    { k: 'rect', x: 312, y: 470, w: 62, h: 120 },
    // bath
    { k: 'rect', x: 388, y: 522, w: 166, h: 72, rx: 4 },
    { k: 'rect', x: 398, y: 530, w: 146, h: 56, rx: 22 },
    { k: 'rect', x: 490, y: 426, w: 62, h: 38, rx: 4 },
    { k: 'ellipse', cx: 521, cy: 445, rx: 17, ry: 11 },
    { k: 'rect', x: 534, y: 470, w: 18, h: 46 },
    { k: 'ellipse', cx: 510, cy: 493, rx: 22, ry: 16 },
    // bedroom 1
    { k: 'rect', x: 690, y: 360, w: 182, h: 160 },
    { k: 'rect', x: 836, y: 372, w: 28, h: 64, rx: 6 },
    { k: 'rect', x: 836, y: 444, w: 28, h: 64, rx: 6 },
    { k: 'rect', x: 600, y: 266, w: 150, h: 40 },
    { k: 'line', a: [600, 266], b: [750, 306] },
    { k: 'rect', x: 580, y: 524, w: 100, h: 68 },
  ];
  const labels: Label[] = [
    { at: [230, 110], text: 'LIVING', sub: '41\'-8" × 28\'-4"' },
    { at: [385, 240], text: 'DINING' },
    { at: [690, 150], text: 'KITCHEN' },
    { at: [190, 380], text: 'BEDROOM 2' },
    { at: [720, 560], text: 'BEDROOM 1' },
    { at: [470, 380], text: 'HALL' },
    { at: [440, 505], text: 'BATH' },
  ];
  return { walls, openings, fixtures, labels };
}

/** The hand-lettered labels on the paper sketch. */
export const HOUSE_SKETCH_LABELS: { at: Pt; text: string; rot: number }[] = [
  { at: [215, 150], text: 'living', rot: -3 },
  { at: [690, 140], text: 'kitchen', rot: 2 },
  { at: [130, 470], text: 'bed 2', rot: -2 },
  { at: [760, 560], text: 'bed', rot: 1 },
  { at: [440, 500], text: 'bath', rot: -4 },
  { at: [380, 120], text: 'dining?', rot: 4 },
];

// ---------------------------------------------------------------------------
// 2. Residential floor plate (2400 × 900): double-loaded corridor, 14 units

export const FLOOR = { w: 2400, h: 900, corridorTop: 390, corridorBottom: 510 };

/**
 * Unit template in unit-local coordinates: corridor wall at y = 0, exterior
 * wall at y = 390, unit spans x 0..w. Demising, corridor and exterior walls
 * belong to the floor; the template only adds what is inside the unit plus
 * the openings it punches through the shared walls.
 */
function unitTemplate(w: number): Plan {
  const P = 5;
  const walls = [
    vWall(110, 0, 150, P, 'int'),
    hWall(0, 110, 150, P, 'int'),
    vWall(190, 0, 80, P, 'int'),
    hWall(110, 190, 80, P, 'int'),
    hWall(0, 150, 220, P, 'int'),
    vWall(150, 220, 390, P, 'int'),
  ];
  const openings = [
    hDoor(54, 104, 150, -1),
    hDoor(122, 180, 80, 1),
    hDoor(100, 146, 220, 1),
    hDoor(200, 250, 0, 1),
    hWin(36, 112, 390),
    hWin(178, Math.min(w - 20, 272), 390),
  ];
  const range: Prim[] = [
    [w - 50, 180],
    [w - 24, 180],
    [w - 50, 202],
    [w - 24, 202],
  ].map(([cx, cy]) => ({ k: 'circle', cx, cy, r: 6 }));
  const fixtures: Prim[] = [
    // bath
    { k: 'rect', x: 6, y: 6, w: 100, h: 40, rx: 3 },
    { k: 'rect', x: 12, y: 11, w: 88, h: 30, rx: 12 },
    { k: 'rect', x: 6, y: 64, w: 16, h: 36 },
    { k: 'ellipse', cx: 36, cy: 82, rx: 15, ry: 11 },
    { k: 'rect', x: 70, y: 52, w: 34, h: 30, rx: 3 },
    // kitchen
    { k: 'rect', x: w - 64, y: 70, w: 58, h: 160 },
    { k: 'rect', x: w - 56, y: 96, w: 42, h: 32, rx: 4 },
    ...range,
    // bedroom
    { k: 'rect', x: 8, y: 266, w: 90, h: 116 },
    { k: 'rect', x: 14, y: 358, w: 36, h: 18, rx: 4 },
    { k: 'rect', x: 56, y: 358, w: 36, h: 18, rx: 4 },
    // living
    { k: 'rect', x: 172, y: 342, w: 104, h: 38, rx: 6 },
    { k: 'rect', x: 196, y: 286, w: 56, h: 30, rx: 4 },
    { k: 'circle', cx: 222, cy: 200, r: 20 },
  ];
  return { walls, openings, fixtures, labels: [] };
}

/** One unit with its own perimeter, for the small process diagrams. */
export function unitStandalone(w: number): Plan {
  return mergePlans(unitTemplate(w), {
    walls: [
      hWall(0, w, 0, 8, 'cor'),
      hWall(0, w, 390, 12, 'ext'),
      vWall(0, 0, 390, 8, 'dem'),
      vWall(w, 0, 390, 8, 'dem'),
    ],
    openings: [],
    fixtures: [],
    labels: [],
  });
}

export interface Duct {
  pts: Pt[];
  w: number;
  sys: 'sup' | 'exh' | 'oa';
}

export interface UnitMech {
  ducts: Duct[];
  fc: { x: number; y: number; w: number; h: number };
  ef: Pt;
  grilles: Pt[];
  dampers: { at: Pt; horizontal: boolean }[];
  cap: Pt;
  tags: { at: Pt; text: string }[];
}

function unitMech(): UnitMech {
  return {
    ducts: [
      { pts: [[150, 72], [150, 175], [60, 175], [60, 289]], w: 10, sys: 'sup' },
      { pts: [[150, 175], [232, 175], [232, 249]], w: 10, sys: 'sup' },
      { pts: [[60, 120], [18, 120], [18, 384]], w: 6, sys: 'exh' },
      { pts: [[150, -60], [150, 8]], w: 8, sys: 'oa' },
    ],
    fc: { x: 120, y: 10, w: 60, h: 60 },
    ef: [60, 120],
    grilles: [
      [60, 300],
      [232, 260],
    ],
    dampers: [{ at: [150, -28], horizontal: false }],
    cap: [18, 390],
    tags: [
      { at: [196, 168], text: '8×6' },
      { at: [86, 238], text: '6×6' },
    ],
  };
}

export interface UnitInstance {
  id: string;
  type: 'A' | 'B';
  xf: Xf;
  box: { x: number; y: number; w: number; h: number };
  center: Pt;
  plan: Plan;
  mech: UnitMech;
}

function mapMech(m: UnitMech, f: Xf): UnitMech {
  const a = mapPt([m.fc.x, m.fc.y], f);
  const b = mapPt([m.fc.x + m.fc.w, m.fc.y + m.fc.h], f);
  return {
    ducts: m.ducts.map((d) => ({ ...d, pts: d.pts.map((p) => mapPt(p, f)) })),
    fc: { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: m.fc.w, h: m.fc.h },
    ef: mapPt(m.ef, f),
    grilles: m.grilles.map((p) => mapPt(p, f)),
    dampers: m.dampers.map((d) => ({ ...d, at: mapPt(d.at, f) })),
    cap: mapPt(m.cap, f),
    tags: m.tags.map((t) => ({ ...t, at: mapPt(t.at, f) })),
  };
}

/** Units in floor-plate coordinates (origin = top-left of the plate). */
export function floorUnits(): UnitInstance[] {
  const units: UnitInstance[] = [];
  const topX = [180, 490, 800, 1290, 1600, 1910];
  topX.forEach((x, j) => {
    const w = 310;
    const mirrored = j % 2 === 1;
    const xf: Xf = { sx: mirrored ? -1 : 1, sy: -1, tx: mirrored ? x + w : x, ty: FLOOR.corridorTop };
    units.push({
      id: String(301 + j),
      type: 'B',
      xf,
      box: { x, y: 0, w, h: FLOOR.corridorTop },
      center: [x + w / 2, FLOOR.corridorTop / 2],
      plan: mapPlan(unitTemplate(w), xf),
      mech: mapMech(unitMech(), xf),
    });
  });
  for (let i = 0; i < 8; i++) {
    const w = 300;
    const x = i * w;
    const mirrored = i % 2 === 1;
    const xf: Xf = { sx: mirrored ? -1 : 1, tx: mirrored ? x + w : x, ty: FLOOR.corridorBottom };
    units.push({
      id: String(307 + i),
      type: 'A',
      xf,
      box: { x, y: FLOOR.corridorBottom, w, h: FLOOR.h - FLOOR.corridorBottom },
      center: [x + w / 2, (FLOOR.corridorBottom + FLOOR.h) / 2],
      plan: mapPlan(unitTemplate(w), xf),
      mech: mapMech(unitMech(), xf),
    });
  }
  return units;
}

function stairCore(x: number, mirrored: boolean): Plan {
  const fixtures: Prim[] = [];
  for (let y = 70; y <= 300; y += 23) {
    fixtures.push({ k: 'line', a: [x + 16, y], b: [x + 84, y] });
    fixtures.push({ k: 'line', a: [x + 96, y], b: [x + 164, y] });
  }
  fixtures.push({ k: 'rect', x: x + 84, y: 70, w: 12, h: 230 });
  fixtures.push({ k: 'poly', pts: [[x + 50, 290], [x + 50, 40], [x + 130, 40], [x + 130, 290]] });
  const door = mirrored ? hDoor(x + 140, x + 80, FLOOR.corridorTop, -1) : hDoor(x + 40, x + 100, FLOOR.corridorTop, -1);
  return {
    walls: [],
    openings: [door],
    fixtures,
    labels: [{ at: [x + 90, 342], text: 'STAIR', sub: mirrored ? 'B' : 'A' }],
  };
}

export function floorShell(): Plan {
  const E = 12;
  const D = 8;
  const walls = [
    hWall(0, FLOOR.w, 0, E, 'ext'),
    hWall(0, FLOOR.w, FLOOR.h, E, 'ext'),
    vWall(0, 0, FLOOR.h, E, 'ext'),
    vWall(FLOOR.w, 0, FLOOR.h, E, 'ext'),
    hWall(0, FLOOR.w, FLOOR.corridorTop, D, 'cor'),
    hWall(0, FLOOR.w, FLOOR.corridorBottom, D, 'cor'),
    ...[180, 490, 800, 1110, 1290, 1600, 1910, 2220].map((x) => vWall(x, 0, FLOOR.corridorTop, D, 'dem')),
    ...[300, 600, 900, 1200, 1500, 1800, 2100].map((x) => vWall(x, FLOOR.corridorBottom, FLOOR.h, D, 'dem')),
    // elevator core
    hWall(1110, 1290, 120, D, 'int'),
    vWall(1200, 0, 120, D, 'int'),
  ];
  const openings = [
    vWin(0, 420, 480),
    vWin(FLOOR.w, 420, 480),
    hGap(1128, 1182, 120),
    hGap(1218, 1272, 120),
    hGap(1140, 1260, FLOOR.corridorTop),
    hWin(40, 140, 0),
    hWin(2260, 2360, 0),
  ];
  const fixtures: Prim[] = [
    { k: 'rect', x: 1120, y: 12, w: 72, h: 96 },
    { k: 'line', a: [1120, 12], b: [1192, 108] },
    { k: 'line', a: [1192, 12], b: [1120, 108] },
    { k: 'rect', x: 1208, y: 12, w: 72, h: 96 },
    { k: 'line', a: [1208, 12], b: [1280, 108] },
    { k: 'line', a: [1280, 12], b: [1208, 108] },
  ];
  const core = stairCore(0, false);
  const coreB = stairCore(2220, true);
  return mergePlans(
    { walls, openings, fixtures, labels: [{ at: [1200, 250], text: 'ELEV. LOBBY' }] },
    core,
    coreB,
  );
}

/** Main corridor ductwork and the ERV that feeds it. */
export const FLOOR_MAIN = {
  duct: { pts: [[150, 450], [2250, 450]] as Pt[], w: 22 },
  erv: { x: 1150, y: 410, w: 100, h: 80 },
  tags: [
    { at: [560, 432], text: '16×10' },
    { at: [1700, 432], text: '16×10' },
  ],
};

// ---------------------------------------------------------------------------
// 3. Parking level (2300 × 1540)

export const PARKING = { w: 2300, h: 1540, stall: 108, depth: 216, x0: 60 };

export type StallType = 'M' | 'S' | 'EV' | 'ACC';

export interface Stall {
  n: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: StallType;
  /** stall faces aisle at the top (true) or bottom */
  faceUp: boolean;
}

export function parkingStalls(): Stall[] {
  const { stall, depth, x0 } = PARKING;
  const rows: { y: number; faceUp: boolean; skip: (i: number) => boolean }[] = [
    { y: 40, faceUp: false, skip: () => false },
    { y: 544, faceUp: true, skip: (i) => i < 3 || i >= 16 },
    { y: 760, faceUp: false, skip: (i) => i < 3 || i >= 16 },
    { y: 1264, faceUp: true, skip: () => false },
  ];
  const stalls: Stall[] = [];
  let n = 1;
  rows.forEach((row, r) => {
    for (let i = 0; i < 20; i++) {
      if (row.skip(i)) continue;
      let type: StallType = 'M';
      if (r === 0 && i >= 15) type = 'EV';
      else if (r === 1 && (i === 3 || i === 4)) type = 'ACC';
      else if (r === 3 && i % 5 === 2) type = 'S';
      else if (r === 2 && i === 15) type = 'EV';
      stalls.push({ n: n++, x: x0 + i * stall, y: row.y, w: stall, h: depth, type, faceUp: row.faceUp });
    }
  });
  return stalls;
}

export const PARKING_COLUMNS: Pt[] = (() => {
  const pts: Pt[] = [];
  for (let k = 0; k <= 6; k++) {
    for (const y of [256, 544, 976, 1264]) pts.push([60 + 324 * k, y]);
  }
  return pts;
})();

export function parkingShell(): Plan {
  const T = 16;
  return {
    walls: [
      hWall(0, PARKING.w, 0, T, 'ext'),
      hWall(0, PARKING.w, PARKING.h, T, 'ext'),
      vWall(0, 0, PARKING.h, T, 'ext'),
      vWall(PARKING.w, 0, PARKING.h, T, 'ext'),
      // stair + elevator core
      hWall(60, 384, 544, 10, 'int'),
      hWall(60, 384, 976, 10, 'int'),
      vWall(384, 544, 976, 10, 'int'),
      vWall(222, 544, 976, 10, 'int'),
    ],
    openings: [
      vDoor(384, 700, 760, 1),
      vDoor(222, 840, 900, 1),
      { kind: 'gap', p0: [PARKING.w, 1000], p1: [PARKING.w, 1240] },
    ],
    fixtures: [],
    labels: [
      { at: [141, 760], text: 'STAIR' },
      { at: [303, 760], text: 'ELEV.' },
    ],
  };
}

export const PARKING_RAMP = { x: 1788, y: 560, w: 432, h: 400 };
