'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, MessageCircle, BarChart2, UserCircle } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home',     href: '/dashboard', icon: LayoutDashboard },
  { label: 'Plan',     href: '/plan',      icon: Calendar },
  { label: 'Chat',     href: '/chat',      icon: MessageCircle },
  { label: 'Progress', href: '/progress',  icon: BarChart2 },
  { label: 'Profile',  href: '/profile',   icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-h)',
        background: 'var(--nav-bg)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              textDecoration: 'none',
              color: isActive ? 'var(--nav-active)' : 'var(--nav-text)',
              transition: 'color 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              paddingTop: 4,
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 28,
              }}
            >
              {/* Active pill indicator behind icon */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--radius-full)',
                    background: 'color-mix(in srgb, var(--nav-active) 15%, transparent)',
                  }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ position: 'relative' }}
              />
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 600 : 400, lineHeight: 1 }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
