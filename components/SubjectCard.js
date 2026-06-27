'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';
import { formatExamDate, getSubjectProgress } from '@/lib/mock/subjects';

/**
 * SubjectCard
 * Props:
 *   subject    (object)  — full subject with topics[]
 *   onEdit     (fn)      — called with subject
 *   onDelete   (fn)      — called with subject.id
 */
export default function SubjectCard({ subject, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const topicCount = subject.topics?.length ?? 0;
  const done = subject.topics?.filter((t) => t.status === 'completed').length ?? 0;
  const progress = topicCount === 0 ? 0 : Math.round((done / topicCount) * 100);

  return (
    <div
      className="card animate-fade-in"
      style={{ position: 'relative', overflow: 'visible' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        {/* Subject info — tappable area to navigate */}
        <Link
          href={`/subjects/${subject.id}`}
          style={{ flex: 1, textDecoration: 'none', display: 'block' }}
        >
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {subject.name}
          </h3>
          <span
            className="badge badge-accent"
            style={{ fontSize: '0.68rem', marginBottom: 10, display: 'inline-flex' }}
          >
            📅 {formatExamDate(subject.exam_date)}
          </span>

          <ProgressBar percent={progress} showLabel height={6} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {done}/{topicCount} topics done
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: progress === 100 ? 'var(--success)' : progress > 0 ? 'var(--warning)' : 'var(--text-muted)',
              }}
            >
              {progress === 100 ? '✓ Complete' : progress > 0 ? 'In progress' : 'Not started'}
            </span>
          </div>
        </Link>

        {/* 3-dot menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            style={{
              background: 'var(--bg-elevated)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <>
              {/* Click-away backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="card animate-scale-in"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 36,
                  minWidth: 130,
                  padding: 6,
                  zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit?.(subject); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 10px', borderRadius: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 500,
                  }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete?.(subject.id); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 10px', borderRadius: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--error)', fontSize: '0.8125rem', fontWeight: 500,
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
