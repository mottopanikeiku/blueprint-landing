// Camera math. A station is a rectangle of the sheet (world units) that has to
// fit inside the part of the viewport left free by the copy ("focus rect").

export type Mode = 'full' | 'side' | 'app';

export interface Station {
  rect: readonly [number, number, number, number];
  mode: Mode;
}

/** Tweened by GSAP, read every frame. World centre + size, focus rect in px. */
export interface CamState {
  cx: number;
  cy: number;
  w: number;
  h: number;
  fx: number;
  fy: number;
  fw: number;
  fh: number;
}

export const MOBILE_BP = 820;

/** Dashboard chrome inside the monitor (px, before the monitor is scaled). */
export const CHROME = { top: 64, left: 290, right: 310, bottom: 40 };

export const BEZEL = 26;
export const STAND = 260;

export function cardRight(vw: number): number {
  return 56 + Math.min(480, vw * 0.4);
}

export function focusRect(mode: Mode, vw: number, vh: number): [number, number, number, number] {
  const mobile = vw < MOBILE_BP;
  if (mode === 'full') return [32, 96, vw - 64, vh - 180];
  if (mode === 'app') {
    if (mobile) return [12, CHROME.top + 12, vw - 24, vh - CHROME.top - CHROME.bottom - 24];
    return [
      CHROME.left + 24,
      CHROME.top + 24,
      vw - CHROME.left - CHROME.right - 48,
      vh - CHROME.top - CHROME.bottom - 48,
    ];
  }
  if (mobile) return [12, 64, vw - 24, vh * 0.4];
  const left = cardRight(vw) + 48;
  return [left, 96, vw - left - 140, vh - 200];
}

export function stationState(s: Station, vw: number, vh: number): CamState {
  const [x, y, w, h] = s.rect;
  const [fx, fy, fw, fh] = focusRect(s.mode, vw, vh);
  return { cx: x + w / 2, cy: y + h / 2, w, h, fx, fy, fw, fh };
}

export function viewBox(c: CamState, vw: number, vh: number) {
  const s = Math.min(c.fw / c.w, c.fh / c.h);
  const x = c.cx - (c.fx + c.fw / 2) / s;
  const y = c.cy - (c.fy + c.fh / 2) / s;
  return { s, x, y, w: vw / s, h: vh / s };
}

/** Where the monitor (or, on phones, the phone) ends up once we pull back out of the drawing. */
export function deviceTarget(vw: number, vh: number) {
  if (vw < MOBILE_BP) {
    const fullH = vh + 2 * BEZEL;
    const s = Math.min((vw - 32) / (vw + 2 * BEZEL), (vh * 0.34) / fullH);
    const top = 76;
    return { scale: s, x: 0, y: top + (fullH * s) / 2 - vh / 2 };
  }
  const fullW = vw + 2 * BEZEL;
  const fullH = vh + 2 * BEZEL + STAND;
  const left = cardRight(vw) + 40;
  const avail = vw - left - 48;
  const s = Math.min(avail / fullW, (vh * 0.8) / fullH);
  const top = (vh - fullH * s) / 2;
  return { scale: s, x: left + avail / 2 - vw / 2, y: top + ((vh + 2 * BEZEL) * s) / 2 - vh / 2 };
}

const SCALES: [number, string][] = [
  [1 / 64, '1/64"'],
  [1 / 32, '1/32"'],
  [1 / 16, '1/16"'],
  [3 / 32, '3/32"'],
  [1 / 8, '1/8"'],
  [3 / 16, '3/16"'],
  [1 / 4, '1/4"'],
  [3 / 8, '3/8"'],
  [1 / 2, '1/2"'],
  [3 / 4, '3/4"'],
  [1, '1"'],
];

/**
 * Nearest architectural scale for `s` screen px per inch of building
 * (96 px = 1 screen inch; building units are inches).
 */
export function archScale(s: number): string {
  const screenInPerFt = (s * 12) / 96;
  let best = SCALES[0];
  for (const c of SCALES) if (Math.abs(Math.log(c[0] / screenInPerFt)) < Math.abs(Math.log(best[0] / screenInPerFt))) best = c;
  return `${best[1]} = 1'-0"`;
}

/** A "nice" scale-bar length in feet that is at most `maxPx` long on screen. */
export function scaleBar(s: number, maxPx: number): { ft: number; px: number } {
  const maxFt = maxPx / (s * 12);
  const pow = 10 ** Math.floor(Math.log10(maxFt));
  const ft = [5, 2, 1].map((m) => m * pow).find((v) => v <= maxFt) ?? pow;
  return { ft, px: ft * 12 * s };
}
