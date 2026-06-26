'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, HelpCircle } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import TopicItem from '@/components/TopicItem';
import ProgressBar from '@/components/ProgressBar';
import Modal from '@/components/Modal';
import {
  getSubjectById, getSubjectProgress, formatExamDate, cycleStatus,
} from '@/lib/mock/subjects';

export default function TopicsPage({ params }) {
  const { id } = use(params); // Next.js 16: params is a Promise
  const router = useRouter();

  const subject = getSubjectById(id);
  const [topics, setTopics] = useState(subject?.topics ?? []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  if (!subject) {
    return (
      <div className="page-padding" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>😕</div>
        <h2>Subject not found</h2>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => router.push('/subjects')}>
          Back to Subjects
        </button>
      </div>
    );
  }

  const completedCount = topics.filter((t) => t.status === 'completed').length;
  const progress = topics.length ? Math.round((completedCount / topics.length) * 100) : 0;

  const handleStatusChange = (topicId, newStatus) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, status: newStatus } : t))
    );
  };

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    const newTopic = {
      id: `top_${Date.now()}`,
      subject_id: subject.id,
      name: newTopicName.trim(),
      status: 'not_started',
    };
    setTopics((prev) => [...prev, newTopic]);
    setNewTopicName('');
    setShowAddModal(false);
  };

  const handleDeleteTopic = (topicId) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
  };

  return (
    <>
      <TopHeader
        title={subject.name}
        backHref="/subjects"
        rightSlot={
          <button
            onClick={() => setShowAddModal(true)}
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
        {/* Subject header card */}
        <div
          className="grad-header animate-fade-in"
          style={{ borderRadius: 'var(--radius-card)', padding: '16px', marginBottom: 16 }}
        >
          {/* Exam date chip */}
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#fff',
              marginBottom: 10,
            }}
          >
            📅 {formatExamDate(subject.exam_date)}
          </span>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
              {completedCount} of {topics.length} topics completed
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fff' }}>{progress}%</span>
          </div>

          {/* White progress bar on gradient bg */}
          <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 'var(--radius-full)', height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#fff', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Quick action buttons */}
        <div
          className="animate-fade-in"
          style={{ display: 'flex', gap: 10, marginBottom: 20, animationDelay: '0.05s' }}
        >
          <button
            className="btn btn-secondary"
            style={{ flex: 1, fontSize: '0.8125rem' }}
            onClick={() => router.push(`/chat?subject=${subject.id}&name=${encodeURIComponent(subject.name)}`)}
          >
            <BookOpen size={15} /> Ask AI
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1, fontSize: '0.8125rem' }}
            onClick={() => router.push(`/quiz/${topics[0]?.id ?? 'top_003'}`)}
          >
            <HelpCircle size={15} /> Take Quiz
          </button>
        </div>

        {/* Topics list */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
            Topics <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({topics.length})</span>
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Tap badge to cycle status
          </span>
        </div>

        {topics.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>📝</div>
            <h3 style={{ marginBottom: 6 }}>No topics yet</h3>
            <p style={{ marginBottom: 20 }}>Break down your subject into topics to track progress.</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add First Topic
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topics.map((topic, i) => (
              <div key={topic.id} style={{ animationDelay: `${i * 0.04}s` }} className="animate-fade-in">
                <TopicItem
                  topic={topic}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTopic}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowAddModal(true)} aria-label="Add topic">
        <Plus size={24} />
      </button>

      {/* Add Topic Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Topic">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Topic Name
            </label>
            <input
              className="input"
              placeholder="e.g. Dynamic Programming"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddTopic(); }}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={!newTopicName.trim()}
              onClick={handleAddTopic}
            >
              <Plus size={16} /> Add Topic
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
