import { LAYERS, REVIEW } from '../blueprint/Schedules';
import { BrandMark } from './Brand';

/** Which drawing layer group a layer-panel row toggles in the dashboard demo. */
function layerGroup(name: string): string | undefined {
  if (name.startsWith('M-HVAC')) return 'mech';
  if (name.startsWith('A-PKNG')) return 'pkng';
  if (name === 'A-FURN' || name === 'P-FIXT') return 'furn';
  return undefined;
}

/**
 * The product UI that appears around the drawing once we pull back out of the
 * blueprint and see it on a monitor. Static markup; `dashboardDemo` animates it.
 */
export function AppChrome() {
  return (
    <div className="chrome" aria-hidden="true">
      <header className="chrome-top">
        <div className="chrome-brand">
          <BrandMark size={24} />
          [Product]
        </div>
        <div className="chrome-crumbs">
          <span>Synthetic residential example</span>
          <span className="sep">/</span>
          <span>Level 3</span>
          <span className="sep">/</span>
          <span className="file">M-301.pdf</span>
          <span className="arrow">→</span>
          <span className="file out">L3.dxf</span>
        </div>
        <div className="chrome-actions">
          <span className="chrome-btn">Illustrated review</span>
          <span className="chrome-btn primary" data-demo="download">
            Export concept
          </span>
        </div>
      </header>

      <aside className="chrome-left">
        <div className="chrome-h">Layers</div>
        <ul>
          {LAYERS.map(([name, desc, , color]) => (
            <li key={name} data-group={layerGroup(name)}>
              <span className="sw" style={{ background: color }} />
              <span className="ln-name">{name}</span>
              <span className="eye" />
              <span className="ln-desc">{desc}</span>
            </li>
          ))}
        </ul>
      </aside>

      <aside className="chrome-right">
        <div className="chrome-h">Review</div>
        {REVIEW.map((r, i) => (
          <div key={r.n} className="chrome-card" data-demo={i === 0 ? 'review' : undefined}>
            <div className="chrome-card-title">
              <span className="tri">{r.n}</span>
              {r.what}
              <span className="ok">✓</span>
            </div>
            <div className="chrome-card-sub">{r.where}</div>
            <div className="chrome-thumbs">
              <span className="thumb before" />
              <span className="thumb after" />
            </div>
          </div>
        ))}
        <div className="chrome-h">Example filenames · not generated</div>
        <ul className="chrome-files">
          <li>L3.dxf</li>
          <li>TAKEOFF_L3.xlsx</li>
          <li>REVIEW_L3.pdf</li>
        </ul>
      </aside>
      <footer className="chrome-bottom" />

      <div className="chrome-toast">Export illustration · no file downloaded</div>
      <svg className="chrome-cursor" width="30" height="30" viewBox="0 0 30 30">
        <path d="M4 3L4 24L10 18L14 27L18 25L14 16L22 16Z" />
      </svg>
    </div>
  );
}
