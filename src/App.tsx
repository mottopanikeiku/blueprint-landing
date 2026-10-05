import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Blueprint } from './blueprint/Blueprint';
import { AccessForm } from './components/AccessForm';
import { AppChrome } from './components/AppChrome';
import { Wordmark } from './components/Brand';
import { SECTIONS, type SectionDef } from './content';
import { buildChoreography } from './stage/choreography';

function Card({ def, index }: { def: SectionDef; index: number }) {
  const List = def.numbered ? 'ol' : 'ul';
  return (
    <article className="card">
      <div className="card-tag">
        <span className="bubble">
          <b>{index}</b>
          <i>{def.sheet}</i>
        </span>
        <span className="kicker">{def.kicker}</span>
      </div>
      <h2>{def.title}</h2>
      {def.body && <p className="body">{def.body}</p>}
      {def.points && (
        <List className="points">
          {def.points.map((p) => (
            <li key={p.text}>
              {p.lead && <strong>{p.lead} </strong>}
              {p.text}
            </li>
          ))}
        </List>
      )}
      {def.footer && <p className="foot">{def.footer}</p>}
      {def.id === 'access' && <AccessForm />}
    </article>
  );
}

function Hero({ onJump }: { onJump: (id: string) => void }) {
  return (
    <div className="hero">
      <p className="hero-kicker">Sheet A-000 · Issued for early access</p>
      <h1>
        Drafting, <em>automated.</em>
      </h1>
      <p className="hero-lede">
        [Product] turns hand sketches and PDF drawing sets into clean, layered CAD. The drafting that takes a person
        days, done in minutes.
      </p>
      <div className="hero-ctas">
        <button className="btn primary" onClick={() => onJump('access')}>
          Request early access
        </button>
        <button className="btn outline" onClick={() => onJump('problem')}>
          Walk the sheet ↓
        </button>
      </div>
    </div>
  );
}

export function App() {
  const svgRef = useRef<SVGSVGElement>(null);
  const sectionRefs = useRef<HTMLElement[]>([]);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const scaleRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const barLabelRef = useRef<HTMLSpanElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis: Lenis | null = null;
    let raf: ((t: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
      lenis.on('scroll', ScrollTrigger.update);
      raf = (t) => lenis!.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      lenisRef.current = lenis;
    }
    const cleanup = buildChoreography(SECTIONS, {
      svg: svgRef.current!,
      sections: sectionRefs.current,
      hud: { coords: coordsRef.current!, scale: scaleRef.current!, bar: barRef.current!, barLabel: barLabelRef.current! },
      onActive: setActive,
    });
    return () => {
      cleanup();
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 2.4 });
    else el.scrollIntoView();
  };

  return (
    <>
      <div className="device">
        <div className="screen">
          <Blueprint ref={svgRef} />
          <div className="screen-shade" />
          <AppChrome />
          <div className="statusbar" aria-hidden="true">
            <span ref={coordsRef} className="sb-coords" />
            <span ref={scaleRef} className="sb-scale" />
            <span className="sb-bar">
              <span ref={barRef} className="bar" />
              <span ref={barLabelRef} />
            </span>
            <span className="status-extra">Snapped to source lines · 13 layers · DXF R2018</span>
          </div>
        </div>
        <div className="stand" aria-hidden="true">
          <div className="neck" />
          <div className="foot" />
        </div>
      </div>
      <div className="grain" aria-hidden="true" />

      <header className="nav">
        <button className="wordmark" onClick={() => jump('top')}>
          <Wordmark />
        </button>
        <button className="btn small" onClick={() => jump('access')}>
          Request early access
        </button>
      </header>

      <nav className="rail" aria-label="Sheet index">
        <div className="rail-h">Sheet index</div>
        <ol>
          {SECTIONS.map((s, i) => (
            <li key={s.id} className={i === active ? 'on' : undefined}>
              <button onClick={() => jump(s.id)}>
                <span className="rail-no">{s.sheet}</span>
                <span className="rail-name">{s.rail}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <main>
        {SECTIONS.map((def, i) => (
          <section
            key={def.id}
            id={def.id}
            data-section={def.id}
            ref={(el) => {
              if (el) sectionRefs.current[i] = el;
            }}
            style={{ height: `${def.vh}vh` }}
            className={i === 0 ? 'sec sec-hero' : 'sec'}
          >
            {i === 0 ? (
              <Hero onJump={jump} />
            ) : (
              <div className="card-wrap">
                <Card def={def} index={i} />
              </div>
            )}
          </section>
        ))}
      </main>
    </>
  );
}
