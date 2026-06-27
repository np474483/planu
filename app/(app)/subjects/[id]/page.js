'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, BookOpen, HelpCircle } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import TopicItem from '@/components/TopicItem';
import ProgressBar from '@/components/ProgressBar';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth } from '@/lib/firebase';
import { formatExamDate } from '@/lib/mock/subjects';

export default function TopicsPage() {
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.id;

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const loadData = async () => {
    if (!subjectId) return;
    try {
      setLoading(true);
      setError('');
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();

      // 1. Fetch subjects list to find details for this subject (name, exam_date)
      const subjectsRes = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const subjectsData = await subjectsRes.json();
      if (!subjectsRes.ok || !subjectsData.success) {
        throw new Error(subjectsData.error || 'Failed to fetch subject details');
      }

      const foundSubject = subjectsData.data.subjects.find(
        (s) => String(s.id) === String(subjectId)
      );
      if (!foundSubject) {
        setSubject(null);
        return;
      }
      setSubject(foundSubject);

      // 2. Fetch topics under this subject
      const topicsRes = await fetch(`/api/subjects/${subjectId}/topics`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const topicsData = await topicsRes.json();
      if (!topicsRes.ok || !topicsData.success) {
        throw new Error(topicsData.error || 'Failed to fetch topics');
      }

      setTopics(topicsData.data.topics || []);
    } catch (err) {
      console.error('[topics] Load error:', err);
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
  }, [subjectId, router]);

  const completedCount = topics.filter((t) => t.status === 'completed').length;
  const progress = topics.length ? Math.round((completedCount / topics.length) * 100) : 0;

  const handleStatusChange = async (topicId, newStatus) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`/api/topics/${topicId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update topic status');
      }

      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`/api/subjects/${subjectId}/topics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTopicName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create topic');
      }

      setTopics((prev) => [...prev, data.data.topic]);
      setNewTopicName('');
      setShowAddModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`/api/topics/${topicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete topic');
      }

      setTopics((prev) => prev.filter((t) => t.id !== topicId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <>
        <TopHeader title="Loading..." backHref="/subjects" />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50dvh' }}>
          <LoadingSpinner label="Loading topics..." />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopHeader title="Error" backHref="/subjects" />
        <div className="page-padding">
          <div className="card" style={{ textAlign: 'center', padding: 24, borderColor: 'var(--error)' }}>
            <p style={{ color: 'var(--error)', fontWeight: 600, marginBottom: 12 }}>{error}</p>
            <button className="btn btn-secondary btn-full" onClick={loadData}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  if (!subject) {
    return (
      <>
        <TopHeader title="Not Found" backHref="/subjects" />
        <div className="page-padding" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>😕</div>
          <h2>Subject not found</h2>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => router.push('/subjects')}>
            Back to Subjects
          </button>
        </div>
      </>
    );
  }

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
