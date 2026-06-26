'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * TopHeader — Fixed 56px top header for all app screens.
 *
 * Props:
 *   title       (string)  — Page title
 *   backHref    (string)  — If set, shows a back arrow linking to this href
 *   onBack      (fn)      — If set (and no backHref), shows back arrow that calls fn
 *   rightSlot   (node)    — Optional right-side content (icon buttons, etc.)
 *   transparent (bool)    — If true, bg is transparent (for screens with gradient headers)
 */
export default function TopHeader({ title, backHref, onBack, rightSlot, transparent = false }) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-h)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: transparent ? 'transparent' : 'var(--bg-card)',
        borderBottom: transparent ? 'none' : '1px solid var(--border)',
        zIndex: 90,
        gap: 12,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Left: back arrow or spacer */}
      <div style={{ width: 36, flexShrink: 0 }}>
        {backHref ? (
          <Link
            href={backHref}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              border: '1px solid var(--border)',
            }}
          >
            <ArrowLeft size={18} />
          </Link>
        ) : onBack ? (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}
      </div>

      {/* Center: title */}
      <h1
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: 700,
          color: transparent ? '#fff' : 'var(--text-primary)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </h1>

      {/* Right: slot for action icons */}
      <div style={{ width: 36, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
        {rightSlot ?? null}
      </div>
    </header>
  );
}
