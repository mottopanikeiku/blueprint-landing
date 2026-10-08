import { describe, expect, it } from 'vitest';
import { ftIn, mergePlans, resolvePlan, type Opening, type Plan } from './geometry';
import { floorShell, floorUnits, FLOOR, HOUSE, housePlan, parkingShell, parkingStalls, unitStandalone } from './plans';

const PLANS: [string, Plan][] = [
  ['house', housePlan()],
  ['floor plate', mergePlans(floorShell(), ...floorUnits().map((u) => u.plan))],
  ['standalone unit', unitStandalone(300)],
  ['parking shell', parkingShell()],
];

/** Total wall length left after resolving `openings` into `plan`'s walls. */
const wallLength = (plan: Plan, openings: Opening[]) =>
  resolvePlan({ ...plan, openings }).pieces.reduce((s, p) => s + Math.max(p.w, p.h), 0);

describe.each(PLANS)('%s plan', (_name, plan) => {
  it('places every opening on a wall, so none silently disappears', () => {
    const solid = wallLength(plan, []);
    for (const o of plan.openings) {
      const width = Math.hypot(o.p1[0] - o.p0[0], o.p1[1] - o.p0[1]);
      expect(solid - wallLength(plan, [o]), JSON.stringify(o)).toBeGreaterThanOrEqual(width - 1e-6);
    }
  });

  it('gives every door a swing', () => {
    const doors = plan.openings.filter((o) => o.kind === 'door');
    expect(resolvePlan(plan).doors).toHaveLength(doors.length);
  });
});

describe('house plan', () => {
  it('matches the overall dimensions printed on the drawing', () => {
    const xs = housePlan().walls.flatMap((w) => [w.a[0], w.b[0]]);
    const ys = housePlan().walls.flatMap((w) => [w.a[1], w.b[1]]);
    expect(Math.max(...xs) - Math.min(...xs)).toBe(HOUSE.w);
    expect(Math.max(...ys) - Math.min(...ys)).toBe(HOUSE.h);
    expect([ftIn(HOUSE.w), ftIn(HOUSE.h)]).toEqual([`73'-4"`, `50'-0"`]);
  });

  it('labels the living room with its wall-centreline size', () => {
    const living = housePlan().labels.find((l) => l.text === 'LIVING')!;
    // Living room: exterior walls at x = 0 and y = 0, partition at x = 500, partition at y = 340.
    expect(living.sub).toBe(`${ftIn(500)} × ${ftIn(340)}`);
  });
});

describe('floor plate', () => {
  it('has the 6 type-B and 8 type-A units named on the process sheet', () => {
    const units = floorUnits();
    expect(units.filter((u) => u.type === 'B')).toHaveLength(6);
    expect(units.filter((u) => u.type === 'A')).toHaveLength(8);
    expect(new Set(units.map((u) => u.id)).size).toBe(units.length);
  });

  it(`sizes type-A units 25'-0" × 32'-6", as dimensioned in the process row`, () => {
    const a = floorUnits().find((u) => u.type === 'A')!;
    expect([ftIn(a.box.w), ftIn(a.box.h)]).toEqual([`25'-0"`, `32'-6"`]);
    expect(a.box.h).toBe(FLOOR.h - FLOOR.corridorBottom);
  });
});

describe('parking stalls', () => {
  it('numbers stalls 1..n without gaps and includes the stall named in the review list', () => {
    const stalls = parkingStalls();
    expect(stalls.map((s) => s.n)).toEqual(stalls.map((_, i) => i + 1));
    expect(stalls.some((s) => s.n === 24)).toBe(true);
  });
});
