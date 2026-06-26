'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, BookOpen, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { cycleStatus } from '@/lib/mock/subjects';

/**
 * TopicItem
 * Props:
 *   topic      (object)   — { id, name, status }
 *   onStatusChange (fn)   — called with (topicId, newStatus)
 *   onEdit     (fn)
 *   onDelete   (fn)
 *   showActions (bool)    — show "Ask AI" / "Quiz" quick links
 */
export default function TopicItem({ topic, onStatusChange, onEdit, onDelete, showActions = false }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStatusClick = () => {
    const next = cycleStatus(topic.status);
    onStatusChange?.(topic.id, next);
  };

  return (
    <div
      className="card animate-fade-in"
      style={{ padding: '12px 14px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Status badge (tappable) */}
        <StatusBadge status={topic.status} onClick={handleStatusClick} />

        {/* Topic name */}
        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          {topic.name}
        </span>

        {/* 3-dot menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            style={{
              background: 'none', border: 'none', borderRadius: '50%',
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
              <div
                className="card animate-scale-in"
                style={{
                  position: 'absolute', right: 0, top: 32,
                  minWidth: 140, padding: 6, zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                <Link
                  href={`/chat?topic=${topic.id}`}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 6, textDecoration: 'none',
                    color: 'var(--accent)', fontSize: '0.8125rem', fontWeight: 500,
                  }}
                >
                  <BookOpen size={14} /> Ask AI
                </Link>
                <Link
                  href={`/quiz/${topic.id}`}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 6, textDecoration: 'none',
                    color: 'var(--text-primary)', fontSize: '0.8125rem', fontWeight: 500,
                  }}
                >
                  <HelpCircle size={14} /> Take Quiz
                </Link>
                <hr className="divider" />
                <button
                  onClick={() => { setMenuOpen(false); onEdit?.(topic); }}
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
                  onClick={() => { setMenuOpen(false); onDelete?.(topic.id); }}
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
