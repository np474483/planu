'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Bell, BookOpen, Target, Calendar } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import SubjectCard from '@/components/SubjectCard';
import ProgressRing from '@/components/ProgressRing';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth } from '@/lib/firebase';
import { getGreeting } from '@/lib/mock/user';

export default function DashboardPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubjects(data.data.subjects || []);
      } else {
        throw new Error(data.error || 'Failed to fetch subjects');
      }
    } catch (err) {
      console.error('[dashboard] Fetch error:', err);
      setError(err.message || 'Something went wrong while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchSubjects();
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !newExamDate) return;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSubjectName.trim(),
          exam_date: newExamDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create subject');
      }
      setSubjects((prev) => [...prev, data.data.subject]);
      setNewSubjectName('');
      setNewExamDate('');
      setShowAddModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete subject');
      }
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Compute dynamic stats based on real subjects
  const allTopics = subjects.flatMap((s) => s.topics || []);
  const overall = allTopics.length === 0 ? 0 : Math.round((allTopics.filter((t) => t.status === 'completed').length / allTopics.length) * 100);

  const completed = allTopics.filter((t) => t.status === 'completed').length;
  const now = new Date();
  const upcomingExams = subjects
    .map((s) => ({ name: s.name, date: new Date(s.exam_date) }))
    .filter((s) => s.date > now)
    .sort((a, b) => a.date - b.date);
  const daysToNearestExam = upcomingExams.length > 0
    ? Math.ceil((upcomingExams[0].date - now) / (1000 * 60 * 60 * 24))
    : null;

  const stats = {
    totalSubjects: subjects.length,
    totalTopics: allTopics.length,
    topicsDone: completed,
    daysToNearestExam,
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <TopHeader
        title=""
        rightSlot={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ThemeSwitcher />
            <button
              onClick={() => router.push('/notifications')}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)',
              }}
            >
              <Bell size={18} />
            </button>
          </div>
        }
      />

      <div className="page-padding" style={{ paddingBottom: 24 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50dvh' }}>
            <LoadingSpinner label="Loading dashboard data..." />
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: 24, borderColor: 'var(--error)' }}>
            <p style={{ color: 'var(--error)', fontWeight: 600, marginBottom: 12 }}>{error}</p>
            <button className="btn btn-secondary btn-full" onClick={fetchSubjects}>Retry</button>
          </div>
        ) : (
          <>
            {/* Greeting */}
            <div className="animate-fade-in" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{today}</p>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                {getGreeting()}, {auth.currentUser?.displayName?.split(' ')[0] || 'Student'}! 👋
              </h1>
            </div>

            {/* Progress + Stats row */}
            <div
              className="card animate-fade-in"
              style={{
                marginBottom: 20,
                background: 'var(--grad-header)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 16px',
              }}
            >
              <ProgressRing percent={overall} size={88} stroke={8} sublabel="Overall" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: 6 }}>Your Progress</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ opacity: 0.8 }}>Topics Done</span>
                    <span style={{ fontWeight: 700 }}>{stats.topicsDone}/{stats.totalTopics}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ opacity: 0.8 }}>Subjects</span>
                    <span style={{ fontWeight: 700 }}>{stats.totalSubjects}</span>
                  </div>
                  {stats.daysToNearestExam !== null && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ opacity: 0.8 }}>Next Exam</span>
                      <span style={{ fontWeight: 700, color: stats.daysToNearestExam <= 7 ? '#FBBF24' : '#fff' }}>
                        {stats.daysToNearestExam}d left
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick action cards */}
            <div
              className="animate-fade-in"
              style={{ display: 'flex', gap: 10, marginBottom: 20, animationDelay: '0.05s' }}
            >
              <StatCard icon={BookOpen} label="Subjects" value={stats.totalSubjects} />
              <StatCard icon={Target} label="Done" value={`${stats.topicsDone}/${stats.totalTopics}`} accent />
              <StatCard icon={Calendar} label="Days Left" value={stats.daysToNearestExam ?? '—'} />
            </div>

            {/* Subjects section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>My Subjects</h2>
                <button
                  onClick={() => router.push('/subjects')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600,
                  }}
                >
                  See all →
                </button>
              </div>

              {subjects.length === 0 ? (
                <div
                  className="card"
                  style={{ textAlign: 'center', padding: 32 }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📚</div>
                  <h3 style={{ marginBottom: 6 }}>No subjects yet</h3>
                  <p style={{ marginBottom: 20 }}>Add your first subject to get started!</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus size={16} /> Add Subject
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {subjects.slice(0, 3).map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onDelete={handleDeleteSubject}
                    />
                  ))}
                  {subjects.length > 3 && (
                    <button
                      onClick={() => router.push('/subjects')}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 'var(--radius-card)',
                        border: '1.5px dashed var(--border)', background: 'none',
                        color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      +{subjects.length - 3} more subjects
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        className="fab"
        onClick={() => setShowAddModal(true)}
        aria-label="Add subject"
      >
        <Plus size={24} />
      </button>

      {/* Add Subject Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Subject">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Subject Name
            </label>
            <input
              className="input"
              placeholder="e.g. Advanced Algorithms"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Exam Date
            </label>
            <input
              className="input"
              type="date"
              value={newExamDate}
              onChange={(e) => setNewExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={!newSubjectName.trim() || !newExamDate}
              onClick={handleAddSubject}
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
