'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Firebase Google OAuth popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Get Firebase ID token
      const idToken = await user.getIdToken();

      // 3. Call backend to check/create user in PostgreSQL
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // 4. Route based on new vs existing user
      if (data.data.isNewUser) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('[login] Error:', err);

      // Don't show error if user simply closed the popup
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }

      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--grad-page)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Theme switcher — top right */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <ThemeSwitcher />
      </div>

      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 250, height: 250, borderRadius: '50%',
        background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 100, left: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />

      {/* Hero section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 80 }}>
        <div className="animate-fade-in">
          {/* Logo */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '10px 18px',
                boxShadow: '0 4px 20px color-mix(in srgb, var(--accent) 12%, transparent)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--grad-button)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)',
                }}
              >
                📚
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                Plan<span style={{ color: 'var(--accent)' }}>U</span>
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.5px' }}>
            Study Smarter.<br />
            <span style={{ color: 'var(--accent)' }}>Plan Better.</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0, maxWidth: 320 }}>
            Your AI-powered study companion — personalised plans, instant explanations, and smart quizzes for every level.
          </p>
        </div>

        {/* Feature chips */}
        <div
          className="animate-fade-in"
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 28, marginBottom: 40, animationDelay: '0.1s' }}
        >
          {['🤖 AI Study Plans', '💬 Topic Explainer', '🎯 Smart Quizzes', '📈 Progress Tracker'].map((chip) => (
            <span
              key={chip}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Sign in section */}
      <div
        className="animate-fade-in"
        style={{ paddingBottom: 48, animationDelay: '0.15s' }}
      >
        {/* Google Sign-In button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '15px 24px',
            borderRadius: 'var(--radius-card)',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 14,
          }}
        >
          {loading ? (
            <div
              style={{
                width: 20, height: 20, borderRadius: '50%',
                border: '2px solid var(--border)',
                borderTopColor: 'var(--accent)',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          ) : (
            // Google SVG logo
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

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

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          For students from School to Master's level 🎓
          <br />
          By signing in, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
