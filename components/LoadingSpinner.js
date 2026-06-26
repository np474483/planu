// components/LoadingSpinner.js

/**
 * LoadingSpinner — Teal animated spinner
 * Props:
 *   size   (number) — diameter in px, default 32
 *   label  (string) — optional text below spinner
 */
export default function LoadingSpinner({ size = 32, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `3px solid var(--accent-light)`,
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.75s linear infinite',
          flexShrink: 0,
        }}
      />
      {label && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ─── Skeleton variants ───────────────────────────────────────────

export function SkeletonLine({ width = '100%', height = 14 }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 6, flexShrink: 0 }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SkeletonLine width="60%" height={16} />
      <SkeletonLine width="40%" height={12} />
      <SkeletonLine height={6} />
      <SkeletonLine width="80%" height={11} />
    </div>
  );
}
