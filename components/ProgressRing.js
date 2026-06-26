// components/ProgressRing.js
// Circular SVG ring chart for overall progress

/**
 * ProgressRing
 * Props:
 *   percent  (0-100)
 *   size     (px)   — diameter, default 120
 *   stroke   (px)   — ring thickness, default 10
 *   label    (string) — inner label line 1 (defaults to "X%")
 *   sublabel (string) — inner label line 2 (e.g. "Overall")
 */
export default function ProgressRing({ percent = 0, size = 120, stroke = 10, label, sublabel = 'Overall' }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (clamped / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={stroke}
        />
        {/* Progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>

      {/* Center text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <span style={{ fontSize: size * 0.18 + 'px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
          {label ?? `${clamped}%`}
        </span>
        {sublabel && (
          <span style={{ fontSize: size * 0.11 + 'px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
