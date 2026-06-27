'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import { auth } from '@/lib/firebase';

export default function QuizHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params?.topic_id;

  const [scores, setScores] = useState([]);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistoryData = async () => {
    if (!topicId) return;
    try {
      setLoading(true);
      setError('');
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();

      // 1. Fetch scores history for this topic
      const scoresRes = await fetch(`/api/quiz/scores/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const scoresData = await scoresRes.json();
      if (!scoresRes.ok || !scoresData.success) {
        throw new Error(scoresData.error || 'Failed to fetch score history');
      }
      
      // Store sorted oldest to newest to match chart trend drawing mapping
      const sortedOldestToNewest = (scoresData.data.scores || []).slice().reverse();
      setScores(sortedOldestToNewest);

      // 2. Fetch subjects list to extract topic & subject name context
      const subjectsRes = await fetch('/api/subjects', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      const subjectsData = await subjectsRes.json();
      if (!subjectsRes.ok || !subjectsData.success) {
        throw new Error(subjectsData.error || 'Failed to fetch subject details');
      }

      let foundTopic = null;
      let foundSubject = null;
      for (const s of (subjectsData.data.subjects || [])) {
        const t = (s.topics || []).find((x) => String(x.id) === String(topicId));
        if (t) {
          foundTopic = t;
          foundSubject = s;
          break;
        }
      }

      if (foundTopic) {
        setTopic({
          id: foundTopic.id,
          name: foundTopic.name,
          subject_id: foundSubject.id,
          subjectName: foundSubject.name,
        });
      } else {
        setTopic({
          id: topicId,
          name: 'Topic',
          subject_id: '',
          subjectName: 'Subject',
        });
      }

    } catch (err) {
      console.error('[quiz-history] Load error:', err);
      setError(err.message || 'Something went wrong while loading history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadHistoryData();
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [topicId, router]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <>
        <TopHeader title="Quiz History" backHref={topic?.subject_id ? `/subjects/${topic.subject_id}` : '/subjects'} />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50dvh' }}>
          <LoadingSpinner label="Loading score history..." />
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
            <button className="btn btn-secondary btn-full" onClick={loadHistoryData}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader
        title="Quiz History"
        backHref={`/quiz/${topicId}`}
      />

      <div className="page-padding">
        {/* Topic context */}
        <div className="card animate-fade-in" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Topic</div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {topic?.name ?? topicId}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {topic?.subjectName}
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '6px 12px', minHeight: 'unset', height: 36, flexShrink: 0 }}
            onClick={() => router.push(`/quiz/${topicId}`)}
          >
            <RotateCcw size={13} /> Retake
          </button>
        </div>

        {/* Score history */}
        {scores.length === 0 ? (
          <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📊</div>
            <h3 style={{ marginBottom: 8 }}>No Quiz History</h3>
            <p style={{ marginBottom: 20 }}>Take the quiz to see your scores here!</p>
            <button className="btn btn-primary" onClick={() => router.push(`/quiz/${topicId}`)}>
              Start Quiz
            </button>
          </div>
        ) : (
          <>
            {/* Trend bar chart (CSS-based) */}
            <div className="card animate-fade-in" style={{ marginBottom: 16, animationDelay: '0.05s' }}>
              <h3 style={{ fontSize: '0.875rem', marginBottom: 14 }}>Score Trend</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 80 }}>
                {scores.map((s, i) => {
                  const pct = (s.score / s.total) * 100;
                  return (
                    <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {s.score}/{s.total}
                      </span>
                      <div
                        style={{
                          width: '100%', borderRadius: 4,
                          height: `${(pct / 100) * 56}px`,
                          background: pct === 100 ? 'var(--success)' : pct >= 60 ? 'var(--accent)' : 'var(--warning)',
                          transition: 'height 0.5s ease',
                          minHeight: 4,
                        }}
                      />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>#{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score list */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 style={{ fontSize: '0.875rem', marginBottom: 12 }}>All Attempts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...scores].reverse().map((s, i) => {
                  const pct = Math.round((s.score / s.total) * 100);
                  return (
                    <div
                      key={s.id}
                      className="card"
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}
                    >
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                          background: pct === 100 ? 'color-mix(in srgb, var(--success) 15%, transparent)'
                            : pct >= 60 ? 'var(--accent-light)'
                            : 'color-mix(in srgb, var(--warning) 15%, transparent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: pct === 100 ? 'var(--success)' : pct >= 60 ? 'var(--accent)' : 'var(--warning)' }}>
                          {s.score}/{s.total}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Attempt #{scores.length - i} · {pct}%
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {formatDate(s.taken_at)}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>
                        {pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '📚'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
