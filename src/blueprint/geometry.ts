// Small, deterministic plan-geometry toolkit. Everything here is axis-aligned
// and authored in plan units (1 unit = 1 inch), then mapped into sheet space.

export type Pt = readonly [number, number];
export type WallLayer = 'ext' | 'int' | 'dem' | 'cor';

export interface Wall {
  a: Pt;
  b: Pt;
  t: number;
  layer: WallLayer;
}

/** Door: hinge at p0, closes onto p1, leaf swings toward `swing`. */
export interface Opening {
  kind: 'door' | 'window' | 'gap';
  p0: Pt;
  p1: Pt;
  swing?: Pt;
}

export type Prim =
  | { k: 'rect'; x: number; y: number; w: number; h: number; rx?: number; cls?: string }
  | { k: 'circle'; cx: number; cy: number; r: number; cls?: string }
  | { k: 'ellipse'; cx: number; cy: number; rx: number; ry: number; cls?: string }
  | { k: 'line'; a: Pt; b: Pt; cls?: string }
  | { k: 'poly'; pts: Pt[]; cls?: string };

export interface Label {
  at: Pt;
  text: string;
  sub?: string;
}

export interface Plan {
  walls: Wall[];
  openings: Opening[];
  fixtures: Prim[];
  labels: Label[];
}

/** p' = (k·sx·x + tx, k·sy·y + ty) */
export interface Xf {
  k?: number;
  sx?: 1 | -1;
  sy?: 1 | -1;
  tx?: number;
  ty?: number;
}

export function mapPt(p: Pt, f: Xf): Pt {
  const k = f.k ?? 1;
  return [k * (f.sx ?? 1) * p[0] + (f.tx ?? 0), k * (f.sy ?? 1) * p[1] + (f.ty ?? 0)];
}

export function mapPrim(p: Prim, f: Xf): Prim {
  const k = f.k ?? 1;
  switch (p.k) {
    case 'rect': {
      const a = mapPt([p.x, p.y], f);
      const b = mapPt([p.x + p.w, p.y + p.h], f);
      return {
        ...p,
        x: Math.min(a[0], b[0]),
        y: Math.min(a[1], b[1]),
        w: Math.abs(b[0] - a[0]),
        h: Math.abs(b[1] - a[1]),
        rx: p.rx === undefined ? undefined : p.rx * k,
      };
    }
    case 'circle': {
      const c = mapPt([p.cx, p.cy], f);
      return { ...p, cx: c[0], cy: c[1], r: p.r * k };
    }
    case 'ellipse': {
      const c = mapPt([p.cx, p.cy], f);
      return { ...p, cx: c[0], cy: c[1], rx: p.rx * k, ry: p.ry * k };
    }
    case 'line':
      return { ...p, a: mapPt(p.a, f), b: mapPt(p.b, f) };
    case 'poly':
      return { ...p, pts: p.pts.map((q) => mapPt(q, f)) };
  }
}

export function mapPlan(plan: Plan, f: Xf): Plan {
  const k = f.k ?? 1;
  return {
    walls: plan.walls.map((w) => ({ ...w, a: mapPt(w.a, f), b: mapPt(w.b, f), t: w.t * k })),
    openings: plan.openings.map((o) => ({
      ...o,
      p0: mapPt(o.p0, f),
      p1: mapPt(o.p1, f),
      swing: o.swing ? ([(f.sx ?? 1) * o.swing[0], (f.sy ?? 1) * o.swing[1]] as Pt) : undefined,
    })),
    fixtures: plan.fixtures.map((p) => mapPrim(p, f)),
    labels: plan.labels.map((l) => ({ ...l, at: mapPt(l.at, f) })),
  };
}

export function mergePlans(...plans: Plan[]): Plan {
  return {
    walls: plans.flatMap((p) => p.walls),
    openings: plans.flatMap((p) => p.openings),
    fixtures: plans.flatMap((p) => p.fixtures),
    labels: plans.flatMap((p) => p.labels),
  };
}

// ---------------------------------------------------------------------------
// Resolving walls + openings into drawable CAD geometry

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WallPiece extends Box {
  layer: WallLayer;
}

export interface DoorGeom {
  leaf: [Pt, Pt];
  arc: string;
}

export interface WindowGeom extends Box {
  horizontal: boolean;
}

export interface Resolved {
  pieces: WallPiece[];
  doors: DoorGeom[];
  windows: WindowGeom[];
}

const EPS = 0.5;

function onWall(w: Wall, o: Opening): [number, number] | null {
  const horizontal = Math.abs(w.a[1] - w.b[1]) < EPS;
  const axis = horizontal ? 0 : 1;
  const cross = horizontal ? 1 : 0;
  const line = w.a[cross];
  if (Math.abs(o.p0[cross] - line) > EPS || Math.abs(o.p1[cross] - line) > EPS) return null;
  const lo = Math.min(w.a[axis], w.b[axis]) - EPS;
  const hi = Math.max(w.a[axis], w.b[axis]) + EPS;
  const s0 = Math.min(o.p0[axis], o.p1[axis]);
  const s1 = Math.max(o.p0[axis], o.p1[axis]);
  if (s0 < lo || s1 > hi) return null;
  return [s0, s1];
}

export function resolvePlan(plan: Plan): Resolved {
  const pieces: WallPiece[] = [];
  const windows: WindowGeom[] = [];

  for (const w of plan.walls) {
    const horizontal = Math.abs(w.a[1] - w.b[1]) < EPS;
    const axis = horizontal ? 0 : 1;
    const line = horizontal ? w.a[1] : w.a[0];
    const start = Math.min(w.a[axis], w.b[axis]) - w.t / 2;
    const end = Math.max(w.a[axis], w.b[axis]) + w.t / 2;

    const cuts: [number, number][] = [];
    for (const o of plan.openings) {
      const span = onWall(w, o);
      if (!span) continue;
      cuts.push(span);
      if (o.kind === 'window') {
        windows.push(
          horizontal
            ? { x: span[0], y: line - w.t / 2, w: span[1] - span[0], h: w.t, horizontal }
            : { x: line - w.t / 2, y: span[0], w: w.t, h: span[1] - span[0], horizontal },
        );
      }
    }
    cuts.sort((p, q) => p[0] - q[0]);

    let cursor = start;
    const emit = (s0: number, s1: number) => {
      if (s1 - s0 < 0.25) return;
      pieces.push(
        horizontal
          ? { x: s0, y: line - w.t / 2, w: s1 - s0, h: w.t, layer: w.layer }
          : { x: line - w.t / 2, y: s0, w: w.t, h: s1 - s0, layer: w.layer },
      );
    };
    for (const [s0, s1] of cuts) {
      emit(cursor, s0);
      cursor = Math.max(cursor, s1);
    }
    emit(cursor, end);
  }

  const doors: DoorGeom[] = plan.openings
    .filter((o) => o.kind === 'door' && o.swing)
    .map((o) => {
      const [hx, hy] = o.p0;
      const r = Math.hypot(o.p1[0] - hx, o.p1[1] - hy);
      const s = o.swing!;
      const L: Pt = [hx + s[0] * r, hy + s[1] * r];
      const lx = L[0] - hx;
      const ly = L[1] - hy;
      const cx = o.p1[0] - hx;
      const cy = o.p1[1] - hy;
      const sweep = lx * cy - ly * cx > 0 ? 1 : 0;
      return {
        leaf: [o.p0, L] as [Pt, Pt],
        arc: `M${L[0]} ${L[1]} A${r} ${r} 0 0 ${sweep} ${o.p1[0]} ${o.p1[1]}`,
      };
    });

  return { pieces, doors, windows };
}

// ---------------------------------------------------------------------------
// Authoring helpers

export const hWall = (x0: number, x1: number, y: number, t: number, layer: WallLayer): Wall => ({
  a: [x0, y],
  b: [x1, y],
  t,
  layer,
});

export const vWall = (x: number, y0: number, y1: number, t: number, layer: WallLayer): Wall => ({
  a: [x, y0],
  b: [x, y1],
  t,
  layer,
});

/** Door in a horizontal wall: hinge at x0, closes to x1, swings toward dir (±1 on y). */
export const hDoor = (x0: number, x1: number, y: number, dir: 1 | -1): Opening => ({
  kind: 'door',
  p0: [x0, y],
  p1: [x1, y],
  swing: [0, dir],
});

export const vDoor = (x: number, y0: number, y1: number, dir: 1 | -1): Opening => ({
  kind: 'door',
  p0: [x, y0],
  p1: [x, y1],
  swing: [dir, 0],
});

export const hWin = (x0: number, x1: number, y: number): Opening => ({ kind: 'window', p0: [x0, y], p1: [x1, y] });
export const vWin = (x: number, y0: number, y1: number): Opening => ({ kind: 'window', p0: [x, y0], p1: [x, y1] });
export const hGap = (x0: number, x1: number, y: number): Opening => ({ kind: 'gap', p0: [x0, y], p1: [x1, y] });

export const rectPath = (b: Box) => `M${b.x} ${b.y}h${b.w}v${b.h}h${-b.w}Z`;

export const polyPath = (pts: readonly Pt[]) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${round(p[0])} ${round(p[1])}`).join('');

export const round = (n: number) => Math.round(n * 100) / 100;

/** Feet-inches label from inches. */
export function ftIn(inches: number): string {
  const total = Math.round(inches);
  const ft = Math.floor(total / 12);
  const inch = total % 12;
  return `${ft}'-${inch}"`;
}

// ---------------------------------------------------------------------------
// Deterministic randomness + hand-drawn strokes

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A pencil stroke from p to q: overshoots the ends and wobbles in the middle. */
export function sketchLine(p: Pt, q: Pt, rand: () => number, wobble = 2.2, overshoot = 9): string {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const o0 = (rand() - 0.2) * overshoot;
  const o1 = (rand() - 0.2) * overshoot;
  const j = () => (rand() - 0.5) * 2 * wobble;
  const a: Pt = [p[0] - ux * o0 + nx * j() * 0.5, p[1] - uy * o0 + ny * j() * 0.5];
  const b: Pt = [q[0] + ux * o1 + nx * j() * 0.5, q[1] + uy * o1 + ny * j() * 0.5];
  const m1: Pt = [p[0] + dx * 0.33 + nx * j(), p[1] + dy * 0.33 + ny * j()];
  const m2: Pt = [p[0] + dx * 0.66 + nx * j(), p[1] + dy * 0.66 + ny * j()];
  return `M${round(a[0])} ${round(a[1])}Q${round(m1[0])} ${round(m1[1])} ${round((m1[0] + m2[0]) / 2)} ${round(
    (m1[1] + m2[1]) / 2,
  )}T${round(b[0])} ${round(b[1])}`;
}

export function sketchRect(b: Box, rand: () => number, wobble = 1.6): string {
  const { x, y, w, h } = b;
  return [
    sketchLine([x, y], [x + w, y], rand, wobble, 6),
    sketchLine([x + w, y], [x + w, y + h], rand, wobble, 6),
    sketchLine([x + w, y + h], [x, y + h], rand, wobble, 6),
    sketchLine([x, y + h], [x, y], rand, wobble, 6),
  ].join('');
}

/** Revision cloud around a box. */
export function cloudPath(b: Box, bump = 18): string {
  const pts: Pt[] = [];
  const edge = (p: Pt, q: Pt) => {
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const n = Math.max(2, Math.round(len / (bump * 1.6)));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      pts.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  };
  const { x, y, w, h } = b;
  edge([x, y], [x + w, y]);
  edge([x + w, y], [x + w, y + h]);
  edge([x + w, y + h], [x, y + h]);
  edge([x, y + h], [x, y]);
  let d = `M${round(pts[0][0])} ${round(pts[0][1])}`;
  for (let i = 1; i <= pts.length; i++) {
    const q = pts[i % pts.length];
    const prev = pts[i - 1];
    const r = Math.hypot(q[0] - prev[0], q[1] - prev[1]) * 0.6;
    d += `A${round(r)} ${round(r)} 0 0 1 ${round(q[0])} ${round(q[1])}`;
  }
  return d;
}
