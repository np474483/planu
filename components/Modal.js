'use client';

import { X } from 'lucide-react';

/**
 * Modal — Slide-up bottom sheet
 * Props:
 *   open    (bool)
 *   onClose (fn)
 *   title   (string)
 *   children
 */
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop animate-fade-in"
      onClick={onClose}
    >
      <div
        className="modal-sheet animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-elevated)', border: 'none', borderRadius: '50%',
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
