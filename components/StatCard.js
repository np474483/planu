// components/StatCard.js
// Small stat card: icon + label + value

/**
 * StatCard
 * Props:
 *   icon    (lucide component or emoji string)
 *   label   (string)
 *   value   (string | number)
 *   accent  (bool) — use accent color for value
 */
export default function StatCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div
      className="card"
      style={{ textAlign: 'center', padding: '12px 8px', flex: 1 }}
    >
      <div style={{ marginBottom: 6, color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
        {typeof Icon === 'string'
          ? <span style={{ fontSize: '1.25rem' }}>{Icon}</span>
          : <Icon size={20} />
        }
      </div>
      <div
        style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          color: accent ? 'var(--accent)' : 'var(--text-primary)',
          lineHeight: 1.2,
        }}
      >
        {value ?? '—'}
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
