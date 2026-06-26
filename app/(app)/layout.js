import BottomNav from '@/components/BottomNav';

/**
 * App Layout — wraps all protected routes under (app)/
 * Renders the fixed BottomNav. Each page manages its own TopHeader.
 */
export default function AppLayout({ children }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-page)' }}>
      <main className="app-content">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
