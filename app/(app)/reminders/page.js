'use client';

import { useState } from 'react';
import { Plus, Bell, BellOff, Trash2, Clock } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import Modal from '@/components/Modal';
import { mockReminders, formatReminderTime } from '@/lib/mock/reminders';
import { mockSubjects } from '@/lib/mock/subjects';

export default function RemindersPage() {
  const [reminders, setReminders] = useState(mockReminders);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newSubjectId, setNewSubjectId] = useState('');

  const toggleActive = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const deleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const addReminder = () => {
    if (!newLabel.trim()) return;
    const sub = mockSubjects.find((s) => s.id === newSubjectId);
    setReminders((prev) => [
      ...prev,
      {
        id: `rem_${Date.now()}`,
        user_id: 'user_001',
        label: newLabel.trim(),
        reminder_time: newTime,
        subject_id: newSubjectId || null,
        subject_name: sub?.name || null,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ]);
    setNewLabel('');
    setNewTime('08:00');
    setNewSubjectId('');
    setShowAdd(false);
  };

  return (
    <>
      <TopHeader
        title="Reminders"
        rightSlot={
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: 'var(--grad-button)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <Plus size={18} />
          </button>
        }
      />

      <div className="page-padding">
        {reminders.length === 0 ? (
          <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏰</div>
            <h2 style={{ marginBottom: 8 }}>No Reminders Yet</h2>
            <p style={{ marginBottom: 24 }}>Set up study reminders to stay consistent every day.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add Reminder
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reminders.map((rem, i) => (
              <div
                key={rem.id}
                className={`card animate-fade-in${!rem.is_active ? '' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  animationDelay: `${i * 0.04}s`,
                  opacity: rem.is_active ? 1 : 0.55,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Time */}
                <div
                  style={{
                    minWidth: 60, textAlign: 'center', padding: '6px 8px',
                    background: rem.is_active ? 'var(--accent-light)' : 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-btn)',
                  }}
                >
                  <Clock size={13} style={{ color: rem.is_active ? 'var(--accent)' : 'var(--text-muted)', display: 'block', margin: '0 auto 2px' }} />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: rem.is_active ? 'var(--accent-dark)' : 'var(--text-muted)' }}>
                    {formatReminderTime(rem.reminder_time)}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {rem.label}
                  </div>
                  {rem.subject_name && (
                    <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                      📚 {rem.subject_name}
                    </span>
                  )}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleActive(rem.id)}
                  style={{
                    background: rem.is_active ? 'var(--accent)' : 'var(--bg-elevated)',
                    border: `1.5px solid ${rem.is_active ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-full)',
                    width: 44, height: 24, cursor: 'pointer',
                    position: 'relative', flexShrink: 0, transition: 'all 0.25s ease',
                  }}
                  aria-label={rem.is_active ? 'Disable reminder' : 'Enable reminder'}
                >
                  <div style={{
                    position: 'absolute', top: 2,
                    left: rem.is_active ? 22 : 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.25s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteReminder(rem.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, borderRadius: 6,
                    display: 'flex', alignItems: 'center', flexShrink: 0,
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add reminder">
        <Plus size={24} />
      </button>

      {/* Add Reminder Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Reminder">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Label</label>
            <input className="input" placeholder="e.g. Evening Revision" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Time</label>
            <input className="input" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Link to Subject <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <select
              className="input"
              value={newSubjectId}
              onChange={(e) => setNewSubjectId(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">No subject</option>
              {mockSubjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 2 }} disabled={!newLabel.trim()} onClick={addReminder}>
              <Bell size={15} /> Add Reminder
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
