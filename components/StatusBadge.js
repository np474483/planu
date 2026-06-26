// components/StatusBadge.js
// Topic status badge — Not Started / In Progress / Completed

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', className: 'badge badge-not-started', dot: '#94A3B8' },
  in_progress: { label: 'In Progress', className: 'badge badge-in-progress', dot: '#F59E0B' },
  completed:   { label: 'Completed',   className: 'badge badge-completed',   dot: '#10B981' },
};

/**
 * StatusBadge
 * Props:
 *   status   ('not_started' | 'in_progress' | 'completed')
 *   onClick  (fn) — optional, makes it tappable to cycle status
 */
export default function StatusBadge({ status, onClick }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started;

  return (
    <span
      className={config.className}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent' } : {}}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dot, display: 'inline-block', flexShrink: 0 }} />
      {config.label}
    </span>
  );
}
