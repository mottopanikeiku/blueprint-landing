import { describe, expect, it } from 'vitest';
import {
  cloudPath,
  ftIn,
  hDoor,
  hGap,
  hWall,
  hWin,
  mapPlan,
  mapPrim,
  mergePlans,
  resolvePlan,
  rng,
  sketchLine,
  vDoor,
  vWall,
  type Plan,
} from './geometry';

const plan = (p: Partial<Plan>): Plan => ({ walls: [], openings: [], fixtures: [], labels: [], ...p });

describe('resolvePlan', () => {
  it('extends a wall by half its thickness at both ends', () => {
    const { pieces } = resolvePlan(plan({ walls: [hWall(0, 100, 50, 10, 'ext')] }));
    expect(pieces).toEqual([{ x: -5, y: 45, w: 110, h: 10, layer: 'ext' }]);
  });

  it('cuts a horizontal wall around a door and keeps both remaining pieces', () => {
    const { pieces, doors } = resolvePlan(plan({ walls: [hWall(0, 100, 0, 10, 'int')], openings: [hDoor(30, 60, 0, 1)] }));
    expect(pieces).toEqual([
      { x: -5, y: -5, w: 35, h: 10, layer: 'int' },
      { x: 60, y: -5, w: 45, h: 10, layer: 'int' },
    ]);
    expect(doors).toHaveLength(1);
  });

  it('cuts a vertical wall and fills a window across the full wall thickness', () => {
    const { pieces, windows } = resolvePlan(plan({ walls: [vWall(0, 0, 200, 12, 'ext')], openings: [{ kind: 'window', p0: [0, 40], p1: [0, 100] }] }));
    expect(pieces.map((p) => [p.y, p.h])).toEqual([
      [-6, 46],
      [100, 106],
    ]);
    expect(windows).toEqual([{ x: -6, y: 40, w: 12, h: 60, horizontal: false }]);
  });

  it('applies several openings in order, regardless of authoring order', () => {
    const { pieces } = resolvePlan(
      plan({ walls: [hWall(0, 300, 0, 4, 'ext')], openings: [hWin(200, 250, 0), hGap(50, 100, 0)] }),
    );
    expect(pieces.map((p) => [p.x, p.x + p.w])).toEqual([
      [-2, 50],
      [100, 200],
      [250, 302],
    ]);
  });

  it('ignores openings that are not on the wall line or extend past its ends', () => {
    const wall = hWall(0, 100, 0, 10, 'ext');
    const offLine = hWin(20, 40, 30);
    const pastEnd = hWin(80, 140, 0);
    const { pieces, windows } = resolvePlan(plan({ walls: [wall], openings: [offLine, pastEnd] }));
    expect(pieces).toHaveLength(1);
    expect(windows).toHaveLength(0);
  });

  it('drops slivers shorter than a quarter unit', () => {
    const { pieces } = resolvePlan(plan({ walls: [hWall(0, 100, 0, 0.2, 'int')], openings: [hGap(0, 100, 0)] }));
    expect(pieces).toEqual([]);
  });

  it('draws a door leaf of door width along the swing and an arc back to the closed position', () => {
    const { doors } = resolvePlan(plan({ walls: [hWall(0, 100, 0, 10, 'int')], openings: [hDoor(30, 60, 0, 1)] }));
    expect(doors[0].leaf).toEqual([
      [30, 0],
      [30, 30],
    ]);
    // Leaf tip (30, 30) → closed point (60, 0) around the hinge: counter-clockwise on screen, sweep 0.
    expect(doors[0].arc).toBe('M30 30 A30 30 0 0 0 60 0');
  });

  it('flips the arc sweep when the door swings the other way', () => {
    const { doors } = resolvePlan(plan({ walls: [vWall(0, 0, 100, 10, 'int')], openings: [vDoor(0, 20, 60, 1)] }));
    expect(doors[0].leaf[1]).toEqual([40, 20]);
    expect(doors[0].arc).toBe('M40 20 A40 40 0 0 1 0 60');
  });

  it('skips doors without a swing direction', () => {
    const { doors } = resolvePlan(plan({ openings: [{ kind: 'door', p0: [0, 0], p1: [10, 0] }] }));
    expect(doors).toEqual([]);
  });
});

describe('mapPlan', () => {
  const door = plan({ walls: [hWall(0, 100, 0, 10, 'int')], openings: [hDoor(30, 60, 0, 1)] });

  it('scales wall thickness with k', () => {
    expect(mapPlan(door, { k: 0.5 }).walls[0]).toMatchObject({ a: [0, 0], b: [50, 0], t: 5 });
  });

  it('mirrors door swings with the plan so the arc stays inside the mirrored room', () => {
    const mirrored = mapPlan(door, { sy: -1, ty: 100 });
    expect(mirrored.openings[0].swing).toEqual([0, -1]);
    const { doors } = resolvePlan(mirrored);
    expect(doors[0].leaf[1]).toEqual([30, 70]);
  });

  it('scales resolved wall area by k² under a mirrored, translated transform', () => {
    const [original, mapped] = [door, mapPlan(door, { k: 2, sx: -1, tx: 400, ty: 10 })].map((p) =>
      resolvePlan(p).pieces.reduce((s, b) => s + b.w * b.h, 0),
    );
    expect(mapped).toBeCloseTo(original * 4);
  });
});

describe('mapPrim', () => {
  it('normalises a mirrored rect to a positive width and height', () => {
    expect(mapPrim({ k: 'rect', x: 10, y: 20, w: 30, h: 40, rx: 2 }, { sx: -1, sy: -1, k: 2 })).toEqual({
      k: 'rect',
      x: -80,
      y: -120,
      w: 60,
      h: 80,
      rx: 4,
    });
  });

  it('scales circle radii and ellipse axes', () => {
    expect(mapPrim({ k: 'circle', cx: 1, cy: 2, r: 3 }, { k: 2, tx: 1 })).toEqual({ k: 'circle', cx: 3, cy: 4, r: 6 });
    expect(mapPrim({ k: 'ellipse', cx: 0, cy: 0, rx: 3, ry: 4 }, { k: 0.5 })).toMatchObject({ rx: 1.5, ry: 2 });
  });
});

describe('mergePlans', () => {
  it('concatenates every part of every plan', () => {
    const a = plan({ walls: [hWall(0, 1, 0, 1, 'ext')], labels: [{ at: [0, 0], text: 'A' }] });
    const b = plan({ walls: [vWall(0, 0, 1, 1, 'int')], openings: [hGap(0, 1, 0)] });
    const m = mergePlans(a, b);
    expect(m.walls).toHaveLength(2);
    expect(m.openings).toHaveLength(1);
    expect(m.labels.map((l) => l.text)).toEqual(['A']);
  });
});

describe('ftIn', () => {
  it.each([
    [0, `0'-0"`],
    [11, `0'-11"`],
    [12, `1'-0"`],
    [500, `41'-8"`],
    [880, `73'-4"`],
    [11.6, `1'-0"`],
  ])('%d in → %s', (inches, label) => {
    expect(ftIn(inches)).toBe(label);
  });
});

describe('rng', () => {
  it('is deterministic per seed and stays in [0, 1)', () => {
    const a = rng(7);
    const b = rng(7);
    const xs = Array.from({ length: 1000 }, () => a());
    expect(Array.from({ length: 1000 }, () => b())).toEqual(xs);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
    expect(rng(8)()).not.toBe(rng(7)());
  });
});

describe('sketch strokes', () => {
  it('produces the same pencil path for the same seed', () => {
    expect(sketchLine([0, 0], [100, 0], rng(3))).toBe(sketchLine([0, 0], [100, 0], rng(3)));
  });

  it('closes a revision cloud back on its first point', () => {
    const d = cloudPath({ x: 0, y: 0, w: 100, h: 60 }, 10);
    const start = d.match(/^M([\d.-]+) ([\d.-]+)/)!.slice(1);
    const end = d.match(/ (\S+) (\S+)$/)!.slice(1);
    expect(end).toEqual(start);
    expect(d).not.toMatch(/NaN/);
  });
});
