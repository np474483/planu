'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/firebase';

const EDUCATION_LEVELS = [
  {
    key: 'school',
    emoji: '🏫',
    title: 'School',
    subtitle: 'Class 6 – 12',
    description: 'Simple explanations with relatable examples',
  },
  {
    key: 'undergraduate',
    emoji: '🎓',
    title: 'Undergraduate',
    subtitle: 'Diploma / B.E. / B.Sc. / BCA & more',
    description: 'Intermediate level with technical terms explained',
  },
  {
    key: 'postgraduate',
    emoji: '🔬',
    title: 'Postgraduate',
    subtitle: 'MCA / MBA / M.Sc. / M.Tech & more',
    description: 'Advanced depth with domain-specific nuance',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [classYear, setClassYear] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFinish = async () => {
    if (!classYear.trim()) return;
    setSaving(true);
    setError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user session found. Please sign in again.');
      }

      // Map UI selectedLevel keys to database constraints: school, ug, pg
      const levelMap = {
        school: 'school',
        undergraduate: 'ug',
        postgraduate: 'pg',
      };
      const education_level = levelMap[selectedLevel];

      if (!education_level) {
        throw new Error('Please select a valid education level.');
      }

      // Retrieve Firebase ID token for Authorization header
      const idToken = await currentUser.getIdToken();

      // Call profile update API
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          education_level,
          class_or_year: classYear,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save onboarding details');
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('[onboarding] Error:', err);
      setError(err.message || 'Something went wrong while setting up profile');
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--grad-page)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px 40px',
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, marginBottom: 32 }}>
        {step === 2 ? (
          <button
            onClick={() => setStep(1)}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
            }}
          >
            <ArrowLeft size={18} />
          </button>
        ) : <div style={{ width: 36 }} />}

        {/* Step dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? 24 : 8,
                height: 8,
                borderRadius: 'var(--radius-full)',
                background: s <= step ? 'var(--accent)' : 'var(--border)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <div style={{ width: 36 }} />
      </div>

      {/* ─── Step 1: Education Level ─── */}
      {step === 1 && (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.3px' }}>
              What level are you<br />studying at? 📚
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Your AI study experience adapts to your level.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {EDUCATION_LEVELS.map((level) => {
              const isSelected = selectedLevel === level.key;
              return (
                <button
                  key={level.key}
                  onClick={() => setSelectedLevel(level.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px',
                    borderRadius: 'var(--radius-card)',
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--accent-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)` : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: isSelected ? 'var(--grad-button)' : 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem', flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {level.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                      {level.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                      {level.subtitle}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {level.description}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={20} color="var(--accent)" />}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 28 }}>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedLevel}
              className="btn btn-primary btn-full"
              style={{ fontSize: '0.9375rem' }}
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Class/Year ─── */}
      {step === 2 && (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>✏️</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.3px' }}>
              Which class or year<br />are you in?
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              This helps AI tailor content specifically for your curriculum.
            </p>
          </div>

          <div style={{ flex: 1 }}>
            <input
              className="input"
              placeholder={
                selectedLevel === 'school'
                  ? 'e.g. Class 10, Class 12'
                  : selectedLevel === 'undergraduate'
                  ? 'e.g. Second Year B.Tech, Third Year BCA'
                  : 'e.g. Second Year MCA, First Year MBA'
              }
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
              autoFocus
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              You can update this later from Profile settings.
            </p>

            {/* Summary card */}
            <div
              className="card-elevated"
              style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{ fontSize: '1.5rem' }}>
                {EDUCATION_LEVELS.find((l) => l.key === selectedLevel)?.emoji}
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {EDUCATION_LEVELS.find((l) => l.key === selectedLevel)?.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {classYear || 'Enter your class/year above'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            {error && (
              <p style={{
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: '#F43F5E',
                marginBottom: 12,
                padding: '8px 12px',
                background: 'color-mix(in srgb, #F43F5E 8%, transparent)',
                borderRadius: 8,
              }}>
                {error}
              </p>
            )}
            <button
              onClick={handleFinish}
              disabled={!classYear.trim() || saving}
              className="btn btn-primary btn-full"
              style={{ fontSize: '0.9375rem' }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Setting up PlanU…
                </>
              ) : (
                <>🚀 Let's Start!</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
