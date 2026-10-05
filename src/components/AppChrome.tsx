import { LAYERS, REVIEW } from '../blueprint/Schedules';

/**
 * The product UI that appears around the drawing once we pull back out of the
 * blueprint and see it on a monitor. Purely presentational.
 */
export function AppChrome() {
  return (
    <div className="chrome" aria-hidden="true">
      <header className="chrome-top">
        <div className="chrome-brand">
          <span className="chrome-mark" />
          [Product]
        </div>
        <div className="chrome-crumbs">
          <span>Residential · 186 units</span>
          <span className="sep">/</span>
          <span>Level 3</span>
          <span className="sep">/</span>
          <span className="file">M-301.pdf</span>
          <span className="arrow">→</span>
          <span className="file out">L3.dxf</span>
        </div>
        <div className="chrome-actions">
          <span className="chrome-btn">Review · 3</span>
          <span className="chrome-btn primary">Download DXF</span>
        </div>
      </header>

      <aside className="chrome-left">
        <div className="chrome-h">Layers</div>
        <ul>
          {LAYERS.map(([name, desc, , color]) => (
            <li key={name}>
              <span className="sw" style={{ background: color }} />
              <span className="ln-name">{name}</span>
              <span className="ln-desc">{desc}</span>
            </li>
          ))}
        </ul>
      </aside>

      <aside className="chrome-right">
        <div className="chrome-h">Review</div>
        {REVIEW.map((r) => (
          <div key={r.n} className="chrome-card">
            <div className="chrome-card-title">
              <span className="tri">{r.n}</span>
              {r.what}
            </div>
            <div className="chrome-card-sub">{r.where}</div>
            <div className="chrome-thumbs">
              <span className="thumb before" />
              <span className="thumb after" />
            </div>
          </div>
        ))}
        <div className="chrome-h">Exports</div>
        <ul className="chrome-files">
          <li>L3.dxf</li>
          <li>TAKEOFF_L3.xlsx</li>
          <li>REVIEW_L3.pdf</li>
        </ul>
      </aside>
      <footer className="chrome-bottom" />
    </div>
  );
}
