/**
 * Brand mark: a CAD endpoint-snap marker, the square cursor that locks onto
 * a line. It stands for the product's promise: snapped to the source, exact.
 */
export function BrandMark({ size = 20 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M0 10H4M16 10H20M10 0V4M10 16V20" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <rect x="4" y="4" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="8" y="8" width="4" height="4" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <>
      <span className="wordmark-name">
        <BrandMark />
        [Product]
      </span>
      <span className="wordmark-tag">Drafting, automated.</span>
    </>
  );
}
