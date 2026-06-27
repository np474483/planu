'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Bell, BellOff, Trash2, Clock } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatReminderTime } from '@/lib/mock/reminders';
import { auth } from '@/lib/firebase';

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newSubjectId, setNewSubjectId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();

      // 1. Fetch reminders list
      const remindersRes = await fetch('/api/reminders', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const remindersData = await remindersRes.json();
      if (!remindersRes.ok || !remindersData.success) {
        throw new Error(remindersData.error || 'Failed to fetch reminders');
      }

      // 2. Fetch subjects list to link reminders
      const subjectsRes = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const subjectsData = await subjectsRes.json();
      if (!subjectsRes.ok || !subjectsData.success) {
        throw new Error(subjectsData.error || 'Failed to fetch subjects');
      }

      setReminders(remindersData.data.reminders || []);
      setSubjects(subjectsData.data.subjects || []);
    } catch (err) {
      console.error('[reminders] Load error:', err);
      setError(err.message || 'Something went wrong while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadData();
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const toggleActive = async (id) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    const targetStatus = !reminder.is_active;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: targetStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update reminder status');
      }

      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: targetStatus } : r))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteReminder = async (id) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete reminder');
      }

      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const addReminder = async () => {
    if (!newLabel.trim()) return;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: newLabel.trim(),
          reminder_time: newTime,
          subject_id: newSubjectId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add reminder');
      }

      setReminders((prev) => [...prev, data.data.reminder]);
      setNewLabel('');
      setNewTime('08:00');
      setNewSubjectId('');
      setShowAdd(false);
    } catch (err) {
      alert(err.message);
    }
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
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50dvh' }}>
            <LoadingSpinner label="Loading reminders..." />
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: 24, borderColor: 'var(--error)' }}>
            <p style={{ color: 'var(--error)', fontWeight: 600, marginBottom: 12 }}>{error}</p>
            <button className="btn btn-secondary btn-full" onClick={loadData}>Retry</button>
          </div>
        ) : reminders.length === 0 ? (
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
                className="card animate-fade-in"
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
              {subjects.map((s) => (
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
