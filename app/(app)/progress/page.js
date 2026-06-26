'use client';

import TopHeader from '@/components/TopHeader';
import ProgressRing from '@/components/ProgressRing';
import ProgressBar from '@/components/ProgressBar';
import StatCard from '@/components/StatCard';
import { Target, HelpCircle, CheckCircle2 } from 'lucide-react';
import {
  mockSubjects, getOverallProgress, getSubjectProgress,
} from '@/lib/mock/subjects';
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
  const overall = getOverallProgress();
  const avgScore = getOverallAverageScore();
  const quizCount = getTotalQuizzesTaken();
  const totalTopics = mockSubjects.flatMap((s) => s.topics).length;
  const completedTopics = mockSubjects.flatMap((s) => s.topics).filter((t) => t.status === 'completed').length;

  return (
    <>
      <TopHeader title="My Progress" />

      <div className="page-padding">
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mockSubjects.map((subject, i) => {
              const pct = getSubjectProgress(subject.id);
              const done = subject.topics.filter((t) => t.status === 'completed').length;
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
                      {done}/{subject.topics.length} topics
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
        </div>
      </div>
    </>
  );
}
