'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopHeader from '@/components/TopHeader';
import ProgressRing from '@/components/ProgressRing';
import ProgressBar from '@/components/ProgressBar';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Target, HelpCircle, CheckCircle2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getOverallAverageScore, getTotalQuizzesTaken } from '@/lib/mock/quiz';

const MOTIVATIONAL = [
  { max: 20,  text: "Every journey starts with a single step. You've got this! 💪" },
  { max: 40,  text: "Good start! Keep the momentum going. 🔥" },
  { max: 60,  text: "Halfway there! You're doing great. 📈" },
  { max: 80,  text: "Almost there! The finish line is in sight. 🏁" },
  { max: 100, text: "Outstanding! You're crushing your goals! 🏆" },
];

function getMotivation(percent) {
  return MOTIVATIONAL.find((m) => percent <= m.max)?.text ?? MOTIVATIONAL.at(-1).text;
}

export default function ProgressPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProgressData = async () => {
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
        throw new Error(data.error || 'Failed to load progress data');
      }
    } catch (err) {
      console.error('[progress] Fetch error:', err);
      setError(err.message || 'Something went wrong while loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProgressData();
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const avgScore = getOverallAverageScore();
  const quizCount = getTotalQuizzesTaken();
  
  const allTopics = subjects.flatMap((s) => s.topics || []);
  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter((t) => t.status === 'completed').length;
  const overall = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  return (
    <>
      <TopHeader title="My Progress" />

      <div className="page-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50dvh' }}>
            <LoadingSpinner label="Loading progress data..." />
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: 24, borderColor: 'var(--error)' }}>
            <p style={{ color: 'var(--error)', fontWeight: 600, marginBottom: 12 }}>{error}</p>
            <button className="btn btn-secondary btn-full" onClick={fetchProgressData}>Retry</button>
          </div>
        ) : (
          <>
            {/* Overall ring + motivation */}
            <div
              className="card animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                padding: '24px 16px',
                background: 'var(--grad-header)',
                border: 'none',
                color: '#fff',
                marginBottom: 16,
              }}
            >
              <ProgressRing percent={overall} size={120} stroke={10} sublabel="Overall" />
              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', maxWidth: 260 }}>
                {getMotivation(overall)}
              </p>
            </div>

            {/* Stats row */}
            <div
              className="animate-fade-in"
              style={{ display: 'flex', gap: 10, marginBottom: 20, animationDelay: '0.06s' }}
            >
              <StatCard icon={CheckCircle2} label="Done" value={`${completedTopics}/${totalTopics}`} accent />
              <StatCard icon={HelpCircle} label="Quizzes" value={quizCount} />
              <StatCard icon={Target} label="Avg Score" value={avgScore ? `${avgScore}%` : '—'} accent />
            </div>

            {/* Per-subject progress */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Subject Breakdown</h2>
              {subjects.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                  <p style={{ color: 'var(--text-muted)' }}>No subjects found. Add subjects to see breakdown progress!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {subjects.map((subject, i) => {
                    const topicsList = subject.topics || [];
                    const done = topicsList.filter((t) => t.status === 'completed').length;
                    const pct = topicsList.length === 0 ? 0 : Math.round((done / topicsList.length) * 100);
                    return (
                      <div
                        key={subject.id}
                        className="card animate-fade-in"
                        style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {subject.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--accent)' : 'var(--text-muted)',
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <ProgressBar percent={pct} height={8} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {done}/{topicsList.length} topics
                          </span>
                          {pct === 100 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>
                              ✓ Complete
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
