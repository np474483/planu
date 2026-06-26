'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Bell, BookOpen, Target, Calendar } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import SubjectCard from '@/components/SubjectCard';
import ProgressRing from '@/components/ProgressRing';
import StatCard from '@/components/StatCard';
import Modal from '@/components/Modal';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import {
  mockSubjects, getOverallProgress, getDashboardStats,
} from '@/lib/mock/subjects';
import { mockUser, getGreeting } from '@/lib/mock/user';

export default function DashboardPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState(mockSubjects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  const overall = getOverallProgress();
  const stats = getDashboardStats();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const handleAddSubject = () => {
    if (!newSubjectName.trim() || !newExamDate) return;
    const newSub = {
      id: `sub_${Date.now()}`,
      user_id: 'user_001',
      name: newSubjectName.trim(),
      exam_date: newExamDate,
      created_at: new Date().toISOString(),
      topics: [],
    };
    setSubjects((prev) => [...prev, newSub]);
    setNewSubjectName('');
    setNewExamDate('');
    setShowAddModal(false);
  };

  const handleDeleteSubject = (id) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

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
        {/* Greeting */}
        <div className="animate-fade-in" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{today}</p>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
            {getGreeting()}, {mockUser.name.split(' ')[0]}! 👋
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
