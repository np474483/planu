'use client';

import { useState } from 'react';
import { RefreshCw, Clock, BookOpen } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import LoadingSpinner, { SkeletonCard } from '@/components/LoadingSpinner';
import { getStudyPlan, formatPlanDate, getPlanTotalHours } from '@/lib/mock/plan';

const SUBJECT_COLORS = [
  'linear-gradient(102deg, #38BDF8 0%, #0369A1 100%)',
  'linear-gradient(102deg, #A78BFA 0%, #6D28D9 100%)',
  'linear-gradient(102deg, #34D399 0%, #059669 100%)',
  'linear-gradient(102deg, #FB923C 0%, #EA580C 100%)',
  'linear-gradient(102deg, #FB7185 0%, #E11D48 100%)',
];

let colorMap = {};
let colorIndex = 0;
function getSubjectColor(subjectId) {
  if (!colorMap[subjectId]) {
    colorMap[subjectId] = SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length];
    colorIndex++;
  }
  return colorMap[subjectId];
}

export default function PlanPage() {
  const [plan, setPlan] = useState(getStudyPlan());
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPlan(getStudyPlan()); // Mock: same data, just simulates regeneration
    setLoading(false);
  };

  const lastGenerated = plan?.generated_at
    ? new Date(plan.generated_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      <TopHeader
        title="Study Plan"
        rightSlot={
          plan && !loading ? (
            <button
              onClick={handleGenerate}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--accent)',
              }}
              title="Regenerate Plan"
            >
              <RefreshCw size={16} />
            </button>
          ) : null
        }
      />

      <div className="page-padding">
        {/* Loading skeleton */}
        {loading ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <LoadingSpinner size={40} label="AI is building your study plan…" />
            </div>
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : !plan ? (
          /* Empty state */
          <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤖</div>
            <h2 style={{ marginBottom: 8 }}>No Study Plan Yet</h2>
            <p style={{ marginBottom: 24 }}>
              Let AI create a personalised day-by-day study schedule based on your subjects, topics, and exam dates.
            </p>
            <button className="btn btn-primary" onClick={handleGenerate}>
              ✨ Generate My Plan
            </button>
          </div>
        ) : (
          /* Plan content */
          <div className="animate-fade-in">
            {/* Meta info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Updated {lastGenerated}
                </p>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Clock size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  {getPlanTotalHours()}h total · {plan.days.length} days
                </p>
              </div>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 12px', minHeight: 'unset', height: 32 }}
                onClick={handleGenerate}
              >
                <RefreshCw size={13} /> Regenerate
              </button>
            </div>

            {/* Day cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {plan.days.map((day, i) => {
                const isExpanded = expandedDay === i;
                const totalMins = day.sessions.reduce((s, sess) => s + sess.duration_mins, 0);
                return (
                  <div
                    key={day.date}
                    className="card animate-fade-in"
                    style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Day header — gradient */}
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : i)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', background: 'var(--grad-card)', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 2 }}>
                          {formatPlanDate(day.date)}
                        </div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9375rem' }}>
                          {day.day_label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                          {day.sessions.length} session{day.sessions.length > 1 ? 's' : ''} · {totalMins} mins
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: -6 }}>
                        {day.sessions.slice(0, 3).map((sess, si) => (
                          <div
                            key={si}
                            style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: getSubjectColor(sess.subject_id),
                              border: '2px solid rgba(255,255,255,0.3)',
                              marginLeft: si > 0 ? -8 : 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.65rem', color: '#fff', fontWeight: 700,
                            }}
                          >
                            {sess.subject[0]}
                          </div>
                        ))}
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginLeft: 4 }}>
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </button>

                    {/* Sessions (expanded) */}
                    {isExpanded && (
                      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {day.sessions.map((sess, si) => (
                          <div
                            key={si}
                            style={{
                              display: 'flex', gap: 12, padding: '10px 12px',
                              borderRadius: 'var(--radius-btn)',
                              background: 'var(--bg-elevated)',
                            }}
                          >
                            <div
                              style={{
                                width: 4, borderRadius: 2,
                                background: getSubjectColor(sess.subject_id),
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {sess.subject}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  <Clock size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                                  {sess.duration_mins} min
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                                {sess.topics.map((t) => (
                                  <span key={t} className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                                    <BookOpen size={10} /> {t}
                                  </span>
                                ))}
                              </div>
                              {sess.note && (
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                  💡 {sess.note}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
