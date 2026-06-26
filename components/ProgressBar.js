// components/ProgressBar.js
// Filled teal progress bar with optional label

/**
 * ProgressBar
 * Props:
 *   percent  (0-100)
 *   showLabel (bool) — show "X%" text
 *   height   (number) — bar height in px, default 6
 */
export default function ProgressBar({ percent = 0, showLabel = false, height = 6 }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        className="progress-track"
        style={{ flex: 1, height }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', minWidth: 30, textAlign: 'right' }}>
          {clamped}%
        </span>
      )}
    </div>
  );
}
