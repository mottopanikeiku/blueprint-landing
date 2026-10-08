import { describe, expect, it } from 'vitest';
import { archScale, deviceTarget, focusRect, MOBILE_BP, scaleBar, stationState, viewBox, type Station } from './camera';
import { SECTIONS } from '../content';

const VIEWPORTS: [number, number][] = [
  [1440, 900],
  [1280, 620],
  [390, 844],
];

describe('viewBox', () => {
  it.each(VIEWPORTS)('fits every section station inside its focus rect at %dx%d', (vw, vh) => {
    for (const station of SECTIONS.flatMap((s) => s.stations)) {
      const cam = stationState(station, vw, vh);
      const v = viewBox(cam, vw, vh);
      const [x, y, w, h] = station.rect;
      // Station corners in screen px.
      const left = (x - v.x) * v.s;
      const top = (y - v.y) * v.s;
      expect(left).toBeGreaterThanOrEqual(cam.fx - 1e-6);
      expect(top).toBeGreaterThanOrEqual(cam.fy - 1e-6);
      expect(left + w * v.s).toBeLessThanOrEqual(cam.fx + cam.fw + 1e-6);
      expect(top + h * v.s).toBeLessThanOrEqual(cam.fy + cam.fh + 1e-6);
      // And the binding dimension fills it.
      expect(Math.max((w * v.s) / cam.fw, (h * v.s) / cam.fh)).toBeCloseTo(1);
    }
  });

  it('maps the screen to the viewport aspect ratio', () => {
    const station: Station = { rect: [0, 0, 6000, 4000], mode: 'full' };
    const v = viewBox(stationState(station, 1440, 900), 1440, 900);
    expect(v.w / v.h).toBeCloseTo(1440 / 900);
  });
});

describe('focusRect', () => {
  it.each(['full', 'side', 'app'] as const)('stays positive and on screen in %s mode', (mode) => {
    for (const [vw, vh] of VIEWPORTS) {
      const [x, y, w, h] = focusRect(mode, vw, vh);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + w).toBeLessThanOrEqual(vw);
      expect(y + h).toBeLessThanOrEqual(vh);
    }
  });

  it('leaves the copy column free on desktop in side mode', () => {
    const [x] = focusRect('side', 1440, 900);
    expect(x).toBeGreaterThan(56 + 480);
  });
});

describe('deviceTarget', () => {
  it.each(VIEWPORTS)('keeps the scaled screen inside the viewport at %dx%d', (vw, vh) => {
    const t = deviceTarget(vw, vh);
    expect(t.scale).toBeGreaterThan(0);
    expect(t.scale).toBeLessThan(1);
    // The device scales about the viewport centre, then translates.
    const halfW = (vw * t.scale) / 2;
    const halfH = (vh * t.scale) / 2;
    const cx = vw / 2 + t.x;
    const cy = vh / 2 + t.y;
    expect(cx - halfW).toBeGreaterThanOrEqual(0);
    expect(cx + halfW).toBeLessThanOrEqual(vw);
    expect(cy - halfH).toBeGreaterThanOrEqual(0);
    expect(cy + halfH).toBeLessThanOrEqual(vh);
  });

  it('switches layout at the mobile breakpoint', () => {
    expect(deviceTarget(MOBILE_BP - 1, 800).x).toBe(0);
    expect(deviceTarget(MOBILE_BP, 800).x).not.toBe(0);
  });
});

describe('archScale', () => {
  // s = screen px per building inch; 96 px = 1 screen inch.
  it.each([
    [96 / 96, `1/8" = 1'-0"`], // 12 px per ft → 1/8" per ft
    [96 / 48, `1/4" = 1'-0"`],
    [96 / 12, `1" = 1'-0"`],
    [1000, `1" = 1'-0"`],
    [0.0001, `1/64" = 1'-0"`],
  ])('s = %f → %s', (s, label) => {
    expect(archScale(s)).toBe(label);
  });
});

describe('scaleBar', () => {
  it.each([0.01, 0.1, 0.25, 1, 4])('picks a 1/2/5 × 10ⁿ length that fits for s = %f', (s) => {
    const { ft, px } = scaleBar(s, 120);
    expect(px).toBeLessThanOrEqual(120);
    expect(px).toBeCloseTo(ft * 12 * s);
    const mantissa = ft / 10 ** Math.floor(Math.log10(ft));
    expect([1, 2, 5]).toContain(Math.round(mantissa));
    // Each 1/2/5 step is at most 2.5× the previous, so the longest bar that fits fills at least 40% of maxPx.
    expect(px).toBeGreaterThan(120 * 0.4 - 1e-9);
  });
});
