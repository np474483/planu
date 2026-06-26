'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import {
  mockNotifications, formatRelativeTime, getUnreadCount, NOTIF_ICONS,
} from '@/lib/mock/notifications';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState(mockNotifications);

  const markRead = (id) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const clearAll = () => setNotifs([]);

  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <>
      <TopHeader
        title="Notifications"
        rightSlot={
          notifs.length > 0 ? (
            <button
              onClick={clearAll}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)',
              }}
              title="Clear all"
            >
              <CheckCheck size={16} />
            </button>
          ) : null
        }
      />

      <div className="page-padding">
        {unread > 0 && (
          <div
            className="badge badge-accent animate-fade-in"
            style={{ marginBottom: 16, fontSize: '0.75rem' }}
          >
            🔔 {unread} unread notification{unread > 1 ? 's' : ''}
          </div>
        )}

        {notifs.length === 0 ? (
          <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔕</div>
            <h2 style={{ marginBottom: 8 }}>All Caught Up!</h2>
            <p>No notifications right now. Keep studying! 📚</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifs.map((notif, i) => (
              <button
                key={notif.id}
                onClick={() => { markRead(notif.id); router.push(notif.related_route); }}
                className="animate-fade-in"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px', borderRadius: 'var(--radius-card)',
                  background: notif.is_read ? 'var(--bg-card)' : 'color-mix(in srgb, var(--accent) 6%, var(--bg-card))',
                  border: `1px solid ${notif.is_read ? 'var(--border)' : 'color-mix(in srgb, var(--accent) 25%, var(--border))'}`,
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.2s ease',
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  {NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.general}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: notif.is_read ? 500 : 700, color: 'var(--text-primary)' }}>
                      {notif.title}
                    </span>
                    {!notif.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 6px', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {formatRelativeTime(notif.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
