import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { SectionDef } from '../content';
import {
  archScale,
  deviceTarget,
  MOBILE_BP,
  scaleBar,
  stationState,
  viewBox,
  type CamState,
  type Station,
} from './camera';
import { createDashboardDemo } from './dashboardDemo';

gsap.registerPlugin(ScrollTrigger);

interface Refs {
  svg: SVGSVGElement;
  sections: HTMLElement[];
  hud: { coords: HTMLElement; scale: HTMLElement; bar: HTMLElement; barLabel: HTMLElement };
  onActive: (index: number) => void;
}

type Tl = gsap.core.Timeline;
type Sel = (q: string) => Element[];
/** Schedule a camera move from station a to b over [pos, pos + dur] of the section clock. */
type Move = (a: Station, b: Station, pos: number, dur: number) => void;

const SCRUB = 0.6;
const vw = () => window.innerWidth;
const vh = () => window.innerHeight;
const easeMove = gsap.parseEase('power2.inOut');
const easeZoom = gsap.parseEase('sine.inOut');

/**
 * The camera is a pure function of scroll position: one ordered list of
 * segments, each interpolating between two stations. Long hops pull back
 * halfway ("dolly") so you keep your bearings on the sheet.
 */
interface CamSegment {
  st: ScrollTrigger;
  pos: number;
  dur: number;
  a: Station;
  b: Station;
}

function interpolate(a: Station, b: Station, t: number, w: number, h: number): CamState {
  const A = stationState(a, w, h);
  const B = stationState(b, w, h);
  const p = easeMove(t);
  const mix = (x: number, y: number, k: number) => x + (y - x) * k;
  const dx = Math.abs(B.cx - A.cx);
  const dy = Math.abs(B.cy - A.cy);
  const far = dx > Math.max(A.w, B.w) * 0.7 || dy > Math.max(A.h, B.h) * 0.7;
  let cw: number;
  let ch: number;
  if (!far) {
    cw = mix(A.w, B.w, p);
    ch = mix(A.h, B.h, p);
  } else {
    const midW = (dx + (A.w + B.w) / 2) * 1.08;
    const midH = (dy + (A.h + B.h) / 2) * 1.08;
    const k = t < 0.5 ? easeZoom(t * 2) : easeZoom((t - 0.5) * 2);
    cw = t < 0.5 ? mix(A.w, midW, k) : mix(midW, B.w, k);
    ch = t < 0.5 ? mix(A.h, midH, k) : mix(midH, B.h, k);
  }
  return {
    cx: mix(A.cx, B.cx, p),
    cy: mix(A.cy, B.cy, p),
    w: cw,
    h: ch,
    fx: mix(A.fx, B.fx, p),
    fy: mix(A.fy, B.fy, p),
    fw: mix(A.fw, B.fw, p),
    fh: mix(A.fh, B.fh, p),
  };
}

function draw(tl: Tl, targets: Element[], pos: number, dur: number) {
  if (targets.length) tl.to(targets, { strokeDashoffset: 0, duration: dur, stagger: { amount: dur * 0.6 } }, pos);
}

function fade(tl: Tl, targets: Element[], pos: number, dur: number) {
  if (targets.length) tl.to(targets, { opacity: 1, duration: dur, stagger: { amount: dur * 0.5 } }, pos);
}

type Builder = (tl: Tl, $: Sel, move: Move, def: SectionDef) => void;

/** Per-section reveal timelines, each on a 0..1 clock. */
const BUILDERS: Record<string, Builder> = {
  problem(tl, $, move, def) {
    const items = $('[data-section="problem"] .points li');
    const clouds = $('#d-problem .problem');
    for (let i = 0; i < 3; i++) {
      const t0 = i * 0.33;
      if (i > 0) move(def.stations[i - 1], def.stations[i], t0, 0.14);
      tl.to(items[i], { opacity: 1, duration: 0.04 }, t0);
      if (i < 2) tl.to(items[i], { opacity: 0.32, duration: 0.04 }, t0 + 0.3);
      draw(tl, [clouds[i].querySelector('.redline')!], t0 + 0.06, 0.16);
      fade(tl, [clouds[i].querySelector('.redline-text')!], t0 + 0.14, 0.08);
    }
  },

  sketch(tl, $, move, def) {
    const s = '#d-sketch';
    tl.to($('#d-problem'), { opacity: 0, duration: 0.08 }, 0);
    fade(tl, $(`${s} .sk-arrow`), 0, 0.1);
    move(def.stations[0], def.stations[1], 0.1, 0.3);
    draw(tl, $(`${s} .cad-wall-ol path`), 0.22, 0.25);
    fade(tl, $(`${s} .cad-wall-fill`), 0.45, 0.08);
    draw(tl, $(`${s} .cad-win path, ${s} .cad-door path`), 0.5, 0.15);
    draw(tl, $(`${s} .cad-fix path`), 0.62, 0.18);
    fade(tl, $(`${s} .cad-label, ${s} .sk-dims`), 0.76, 0.1);
    fade(tl, $(`${s} .sk-layers`), 0.86, 0.1);
  },

  pdf(tl, $, move, def) {
    const s = '#d-floor';
    fade(tl, $(`${s} .inst-first`), 0, 0.08);
    fade(tl, $(`${s} .inst-copy`), 0.1, 0.2);
    move(def.stations[0], def.stations[1], 0.22, 0.2);
    draw(tl, $(`${s} > .cad .cad-wall-ol path`), 0.3, 0.28);
    fade(tl, $(`${s} > .cad .cad-wall-fill`), 0.52, 0.08);
    tl.to($(`${s} .inst`), { opacity: 0, duration: 0.08 }, 0.6);
    draw(tl, $(`${s} > .cad .cad-win path, ${s} > .cad .cad-door path`), 0.58, 0.18);
    draw(tl, $(`${s} > .cad .cad-fix path`), 0.72, 0.18);
    fade(tl, $(`${s} > .cad .cad-label, ${s} .unit-lbl`), 0.86, 0.1);
  },

  mech(tl, $, move, def) {
    const s = '#d-mech';
    draw(tl, $(`${s} .mech-ducts path`), 0, 0.4);
    fade(tl, $(`${s} .mech-eqpm`), 0.25, 0.15);
    fade(tl, $(`${s} .mech-tags`), 0.38, 0.12);
    fade(tl, $(`${s} .mech-callouts`), 0.48, 0.12);
    move(def.stations[0], def.stations[1], 0.66, 0.3);
  },

  parking(tl, $) {
    const s = '#d-parking';
    draw(tl, $(`${s} > .cad .cad-wall-ol path`), 0, 0.2);
    fade(tl, $(`${s} > .cad .cad-wall-fill, ${s} .pk-cols`), 0.15, 0.1);
    draw(tl, $(`${s} > .cad .cad-door path`), 0.2, 0.08);
    draw(tl, $(`${s} .pk-stalls path`), 0.22, 0.35);
    fade(tl, $(`${s} .pk-ramp, ${s} .pk-flow`), 0.45, 0.12);
    fade(tl, $(`${s} .pk-nums`), 0.55, 0.15);
    fade(tl, $(`${s} .pk-types, ${s} .pk-acc, ${s} > .cad .cad-label`), 0.72, 0.15);
  },

  how(tl, $, move, def) {
    const steps = $('[data-section="how"] .points li');
    for (let i = 0; i < 5; i++) {
      const t0 = i * 0.2;
      const f = `#pf-${i + 1}`;
      move(def.stations[i], def.stations[i + 1], t0, 0.07);
      tl.to(steps[i], { opacity: 1, duration: 0.03 }, t0);
      if (i < 4) tl.to(steps[i], { opacity: 0.32, duration: 0.03 }, t0 + 0.19);
      const at = t0 + 0.05;
      if (i === 0) {
        fade(tl, $(`${f} .rd-hl rect`), at, 0.08);
        tl.fromTo($(`${f} .scan`), { y: 0, opacity: 1 }, { y: 220, duration: 0.12, immediateRender: false }, at);
        tl.to($(`${f} .scan`), { opacity: 0, duration: 0.02 }, at + 0.12);
        fade(tl, $(`${f} .rd-list text`), at + 0.04, 0.08);
      }
      if (i === 1 || i === 2) {
        draw(tl, $(`${f} .cad-wall-ol path`), at, 0.06);
        fade(tl, $(`${f} .cad-wall-fill`), at + 0.05, 0.03);
        draw(tl, $(`${f} .cad-win path, ${f} .cad-door path, ${f} .cad-fix path`), at + 0.06, 0.06);
        fade(tl, $(`${f} .ms-snaps, ${f} .ms-dims`), at + 0.09, 0.04);
      }
      if (i === 3) {
        tl.to($(`${f} .asm-unit`), { opacity: 1, x: 0, duration: 0.08, stagger: 0.008, ease: 'power2.out' }, at);
        fade(tl, $(`${f} .asm-merge`), at + 0.09, 0.03);
      }
      if (i === 4) {
        draw(tl, $(`${f} .redline`), at, 0.06);
        fade(tl, $(`${f} .ck-flag`), at + 0.06, 0.04);
      }
    }
  },

  output(tl, $, move, def) {
    fade(tl, $('.tb-layer'), 0.04, 0.24);
    move(def.stations[0], def.stations[1], 0.3, 0.12);
    fade(tl, $('.tb-take'), 0.4, 0.22);
    move(def.stations[1], def.stations[2], 0.64, 0.12);
    fade(tl, $('.tb-review'), 0.74, 0.22);
  },

  who(tl, $) {
    draw(tl, $('#d-title .check'), 0.1, 0.6);
  },

  status(tl, $, move, def) {
    fade(tl, $('#d-notes .note'), 0, 0.25);
    move(def.stations[0], def.stations[1], 0.35, 0.28);
    fade(tl, $('#d-title .tb-rev'), 0.6, 0.32);
  },

  dashboard(tl, $) {
    tl.fromTo(
      $('.device'),
      { scale: 1, x: 0, y: 0 },
      {
        scale: () => deviceTarget(vw(), vh()).scale,
        x: () => deviceTarget(vw(), vh()).x,
        y: () => deviceTarget(vw(), vh()).y,
        duration: 0.6,
        ease: 'power2.inOut',
        immediateRender: false,
      },
      0,
    );
    tl.fromTo(
      $('.screen'),
      { borderRadius: 0 },
      { borderRadius: () => (vw() < MOBILE_BP ? 40 : 10), duration: 0.6, ease: 'power2.inOut', immediateRender: false },
      0,
    );
    tl.to($('.chrome, .status-extra'), { opacity: 1, duration: 0.3 }, 0.3);
    // autoAlpha also sets visibility: hidden at 0, so the invisible rail stops taking clicks and focus.
    tl.to($('.rail'), { autoAlpha: 0, duration: 0.15 }, 0);
  },

  access(tl, $) {
    fade(tl, $('#d-title .tb-stamp'), 0.1, 0.3);
  },
};

export function buildChoreography(sections: SectionDef[], refs: Refs): () => void {
  const doc = (q: string) => gsap.utils.toArray<Element>(q);
  const segments: CamSegment[] = [];
  const cover = sections[0].stations[0];
  let stopDemo = () => {};

  const ctx = gsap.context(() => {
    gsap.set(doc('.asm-unit'), { opacity: 0, x: (_i: number, el: HTMLElement) => (Number(el.dataset.col) - 1) * 40 });

    sections.forEach((def, i) => {
      const el = refs.sections[i];
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => self.isActive && refs.onActive(i),
      });
      if (i === 0) return;

      const arrive = ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'top top' });
      segments.push({ st: arrive, pos: 0, dur: 1, a: sections[i - 1].stations.at(-1)!, b: def.stations[0] });

      const build = BUILDERS[def.id];
      if (!build) return;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: SCRUB, invalidateOnRefresh: true },
      });
      const st = tl.scrollTrigger!;
      build(tl, doc, (a, b, pos, dur) => segments.push({ st, pos, dur, a, b }), def);
      tl.to({}, { duration: 0 }, 1);
    });

    // Once the monitor has settled, the dashboard runs its demo loop (desktop only: no side panels on phones).
    const demo = createDashboardDemo(refs.svg);
    stopDemo = demo.stop;
    const dash = refs.sections[sections.findIndex((s) => s.id === 'dashboard')];
    ScrollTrigger.create({
      trigger: dash,
      start: () => `top+=${(dash.offsetHeight - vh()) * 0.65} top`,
      endTrigger: refs.sections.at(-1),
      end: 'bottom bottom',
      onToggle: (self) => (self.isActive && vw() >= MOBILE_BP ? demo.play() : demo.stop()),
    });

    // Intro: the sheet "prints" in.
    gsap.from(doc('.frame-layer, .sheet-grid, #d-title, .blueprint .ghost, .paper, .pencil'), {
      opacity: 0,
      duration: 1.4,
      stagger: 0.06,
      ease: 'power2.out',
      delay: 0.15,
    });
  });

  // Camera + HUD, every frame, straight from the scroll position.
  let last = '';
  const tick = () => {
    const w = vw();
    const h = vh();
    const y = window.scrollY;
    let cam = stationState(cover, w, h);
    for (const s of segments) {
      const len = s.st.end - s.st.start;
      const start = s.st.start + s.pos * len;
      if (y < start) break;
      const t = Math.min(1, (y - start) / Math.max(1, s.dur * len));
      cam = t >= 1 ? stationState(s.b, w, h) : interpolate(s.a, s.b, t, w, h);
    }
    const v = viewBox(cam, w, h);
    const box = `${v.x.toFixed(1)} ${v.y.toFixed(1)} ${v.w.toFixed(1)} ${v.h.toFixed(1)}`;
    if (box === last) return;
    last = box;
    refs.svg.setAttribute('viewBox', box);
    const ft = (n: number) => (n / 12).toFixed(1).padStart(6, ' ');
    refs.hud.coords.textContent = `X ${ft(cam.cx)}'  Y ${ft(cam.cy)}'`;
    refs.hud.scale.textContent = archScale(v.s);
    const bar = scaleBar(v.s, 120);
    refs.hud.bar.style.width = `${bar.px}px`;
    refs.hud.barLabel.textContent = `${bar.ft}'`;
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    stopDemo();
    ctx.revert();
  };
}
