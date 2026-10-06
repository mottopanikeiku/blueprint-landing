import { useMemo } from 'react';
import { DetailTitle, PlanCad } from './cad';
import { resolvePlan, rng, round, sketchLine, sketchRect, type Prim } from './geometry';
import { AT, HOUSE, HOUSE_SKETCH_LABELS, housePlan } from './plans';
import { LAYERS } from './Schedules';

const LAYER_CHIPS = ['A-WALL-EXTR', 'A-WALL-INTR', 'A-DOOR', 'A-GLAZ', 'A-FURN', 'P-FIXT', 'A-ANNO-TEXT'].map(
  (name) => [name, LAYERS.find((l) => l[0] === name)![3]] as const,
);

function sketchPrim(p: Prim, rand: () => number): string {
  switch (p.k) {
    case 'rect':
      return sketchRect(p, rand);
    case 'line':
      return sketchLine(p.a, p.b, rand, 1.4, 4);
    case 'circle':
    case 'ellipse': {
      const rx = (p.k === 'circle' ? p.r : p.rx) * (0.94 + rand() * 0.1);
      const ry = (p.k === 'circle' ? p.r : p.ry) * (0.94 + rand() * 0.1);
      const gap = 0.3 + rand() * 0.5;
      return `M${round(p.cx - rx)} ${round(p.cy)}A${round(rx)} ${round(ry)} 0 1 0 ${round(p.cx + rx)} ${round(
        p.cy,
      )}A${round(rx)} ${round(ry)} 0 0 0 ${round(p.cx - rx + gap * 6)} ${round(p.cy - gap * 4)}`;
    }
    case 'poly':
      return p.pts
        .slice(1)
        .map((q, i) => sketchLine(p.pts[i], q, rand, 1.4, 4))
        .join('');
  }
}

/** Pencil version of the house, generated from the same plan the CAD comes from. */
function PencilHouse() {
  const d = useMemo(() => {
    const plan = housePlan();
    const r = resolvePlan(plan);
    const rand = rng(7);
    const walls: string[] = [];
    const faint: string[] = [];
    for (const p of r.pieces) {
      const horizontal = p.w >= p.h;
      if (horizontal) {
        walls.push(sketchLine([p.x, p.y], [p.x + p.w, p.y], rand));
        walls.push(sketchLine([p.x, p.y + p.h], [p.x + p.w, p.y + p.h], rand));
        faint.push(sketchLine([p.x, p.y + p.h / 2], [p.x + p.w, p.y + p.h / 2], rand, 3, 12));
      } else {
        walls.push(sketchLine([p.x, p.y], [p.x, p.y + p.h], rand));
        walls.push(sketchLine([p.x + p.w, p.y], [p.x + p.w, p.y + p.h], rand));
        faint.push(sketchLine([p.x + p.w / 2, p.y], [p.x + p.w / 2, p.y + p.h], rand, 3, 12));
      }
    }
    for (const w of r.windows) {
      walls.push(
        w.horizontal
          ? sketchLine([w.x, w.y + w.h / 2], [w.x + w.w, w.y + w.h / 2], rand, 1, 3)
          : sketchLine([w.x + w.w / 2, w.y], [w.x + w.w / 2, w.y + w.h], rand, 1, 3),
      );
    }
    const doors = r.doors.map(
      (dg) => sketchLine(dg.leaf[0], dg.leaf[1], rand, 1, 3) + dg.arc.replace(/A(\S+) (\S+)/, (_m, a) => {
        const rr = round(Number(a) * (1 + (rand() - 0.5) * 0.12));
        return `A${rr} ${rr}`;
      }),
    );
    const furniture = plan.fixtures.filter((_, i) => i % 3 !== 1).map((p) => sketchPrim(p, rand));
    const notes = [
      sketchLine([0, -40], [880, -40], rand, 2, 10),
      sketchLine([0, -52], [0, -28], rand, 1, 2),
      sketchLine([880, -52], [880, -28], rand, 1, 2),
    ];
    return { walls: walls.join(''), faint: faint.join(''), doors: doors.join(''), furniture: furniture.join(''), notes: notes.join('') };
  }, []);

  return (
    <g className="pencil">
      <path d={d.faint} className="pencil-faint" />
      <path d={d.walls} className="pencil-wall" />
      <path d={d.doors} className="pencil-thin" />
      <path d={d.furniture} className="pencil-thin" />
      <path d={d.notes} className="pencil-thin" />
      <text x={440} y={-56} textAnchor="middle" className="t-hand" fontSize={34}>
        approx 73'
      </text>
      {HOUSE_SKETCH_LABELS.map((l) => (
        <text key={l.text} x={l.at[0]} y={l.at[1]} className="t-hand" fontSize={36} transform={`rotate(${l.rot} ${l.at[0]} ${l.at[1]})`}>
          {l.text}
        </text>
      ))}
      <text x={560} y={668} className="t-hand" fontSize={30} transform="rotate(-2 560 668)">
        swap bath + closet? — J.
      </text>
    </g>
  );
}

export function SketchDetail() {
  const plan = useMemo(() => housePlan(), []);
  const P = AT.sketchPaper;
  const C = AT.sketchCad;
  return (
    <g id="d-sketch">
      {/* the photo of the paper sketch */}
      <g transform={`rotate(-1.6 ${P.x + P.w / 2} ${P.y + P.h / 2})`}>
        <rect x={P.x + 16} y={P.y + 22} width={P.w} height={P.h} className="paper-shadow" />
        <rect x={P.x} y={P.y} width={P.w} height={P.h} className="paper" />
        <rect x={P.x + P.w * 0.38} y={P.y - 22} width={180} height={50} className="tape" transform={`rotate(3 ${P.x + P.w * 0.38} ${P.y})`} />
        <rect x={P.x - 30} y={P.y + P.h - 60} width={150} height={46} className="tape" transform={`rotate(-38 ${P.x} ${P.y + P.h})`} />
        <g transform={`translate(${P.x + 60} ${P.y + 104})`}>
          <PencilHouse />
        </g>
      </g>
      <text x={P.x} y={P.y + P.h + 70} className="t-mono dim" fontSize={18} letterSpacing="0.14em">
        AUTHORED SKETCH · GENERATED PENCIL STROKES · NOT A PHOTO
      </text>

      {/* the hand-off arrow */}
      <g className="sk-arrow fd">
        <path d={`M${P.x + P.w + 40} ${C.y + 300}H${C.x - 40}`} className="ln" />
        <path d={`M${C.x - 58} ${C.y + 288}L${C.x - 38} ${C.y + 300}L${C.x - 58} ${C.y + 312}`} className="ln" />
        <text x={(P.x + P.w + C.x) / 2} y={C.y + 282} textAnchor="middle" fontSize={16} className="t-mono" letterSpacing="0.14em">
          SAME PLAN
        </text>
      </g>

      {/* the CAD output */}
      <g transform={`translate(${C.x} ${C.y})`}>
        <PlanCad plan={plan} className="cad" labelSize={15} />
        <g className="sk-dims fd">
          <path d={`M0 -52H${HOUSE.w}M0 -64V-40M${HOUSE.w} -64V-40`} className="ln thin" />
          <path d={`M-8 -44L8 -60M${HOUSE.w - 8} -44L${HOUSE.w + 8} -60`} className="ln" />
          <text x={HOUSE.w / 2} y={-62} textAnchor="middle" fontSize={16} className="t-mono">
            73'-4"
          </text>
          <path d={`M${HOUSE.w + 52} 0V${HOUSE.h}M${HOUSE.w + 40} 0H${HOUSE.w + 64}M${HOUSE.w + 40} ${HOUSE.h}H${HOUSE.w + 64}`} className="ln thin" />
          <path d={`M${HOUSE.w + 44} 8L${HOUSE.w + 60} -8M${HOUSE.w + 44} ${HOUSE.h + 8}L${HOUSE.w + 60} ${HOUSE.h - 8}`} className="ln" />
          <text x={HOUSE.w + 76} y={HOUSE.h / 2} fontSize={16} className="t-mono" transform={`rotate(90 ${HOUSE.w + 76} ${HOUSE.h / 2})`} textAnchor="middle">
            50'-0"
          </text>
        </g>
        <g className="sk-layers fd" transform={`translate(0 ${HOUSE.h + 70})`}>
          {LAYER_CHIPS.map(([name, color], i) => (
            <g key={name} transform={`translate(${(i % 4) * 222} ${Math.floor(i / 4) * 40})`}>
              <rect width={16} height={16} y={-13} style={{ fill: color }} />
              <text x={26} fontSize={15} className="t-mono" letterSpacing="0.08em">
                {name}
              </text>
            </g>
          ))}
        </g>
      </g>
      <DetailTitle x={C.x} y={C.y + HOUSE.h + 210} n="1" sheet="A-101" title="Sketch + clean drawing" scale={'AUTHORED SVG · NO DXF EXPORT'} width={HOUSE.w} />
    </g>
  );
}
