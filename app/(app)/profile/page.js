'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Edit2, LogOut, Bell, Settings, ChevronRight } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import ProgressBar from '@/components/ProgressBar';
import { mockUser, getUserInitials } from '@/lib/mock/user';
import { getOverallProgress, getDashboardStats } from '@/lib/mock/subjects';

const EDUCATION_LABELS = {
  school: 'School',
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(mockUser);
  const [editing, setEditing] = useState(false);
  const [editLevel, setEditLevel] = useState(user.education_level);
  const [editYear, setEditYear] = useState(user.class_or_year);

  const overall = getOverallProgress();
  const stats = getDashboardStats();
  const initials = getUserInitials(user.name);

  const saveEdit = () => {
    setUser((prev) => ({ ...prev, education_level: editLevel, class_or_year: editYear }));
    setEditing(false);
  };

  return (
    <>
      <TopHeader
        title="Profile"
        rightSlot={<ThemeSwitcher />}
      />

      <div style={{ paddingBottom: 24 }}>
        {/* Profile header banner */}
        <div
          className="grad-header animate-fade-in"
          style={{ padding: '24px 16px 32px', textAlign: 'center' }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 800, color: '#fff',
              }}
            >
              {user.profile_photo_url ? (
                <img src={user.profile_photo_url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <button
              style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 28, height: 28, borderRadius: '50%',
                background: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Camera size={14} />
            </button>
          </div>

          <h2 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 700, marginBottom: 4 }}>{user.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{user.email}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', padding: '4px 12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 600 }}>
              🎓 {EDUCATION_LABELS[user.education_level]} · {user.class_or_year}
            </span>
          </div>
        </div>

        {/* Progress summary */}
        <div className="page-padding">
          <div className="card animate-fade-in" style={{ marginBottom: 16, marginTop: -16, position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Overall Progress</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent)' }}>{overall}%</span>
            </div>
            <ProgressBar percent={overall} height={8} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {stats.topicsDone}/{stats.totalTopics} topics
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {stats.totalSubjects} subjects
              </span>
            </div>
          </div>

          {/* Edit Profile section */}
          <div className="card animate-fade-in" style={{ marginBottom: 16, animationDelay: '0.05s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editing ? 16 : 0 }}>
              <h3 style={{ fontSize: '0.875rem' }}>Study Profile</h3>
              <button
                onClick={() => editing ? saveEdit() : setEditing(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: editing ? 'var(--accent)' : 'var(--bg-elevated)',
                  border: `1px solid ${editing ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-btn)', padding: '5px 10px',
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                  color: editing ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {editing ? '✓ Save' : <><Edit2 size={12} /> Edit</>}
              </button>
            </div>

            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Education Level
                  </label>
                  <select
                    className="input"
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="school">School (Class 6-12)</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Class / Year
                  </label>
                  <input
                    className="input"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    placeholder="e.g. Second Year MCA"
                  />
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                {[
                  { label: 'Education Level', value: EDUCATION_LABELS[user.education_level] },
                  { label: 'Class / Year', value: user.class_or_year },
                  { label: 'Member Since', value: 'June 2026' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings links */}
          <div className="card animate-fade-in" style={{ marginBottom: 16, padding: 0, overflow: 'hidden', animationDelay: '0.1s' }}>
            {[
              { icon: Bell, label: 'Reminders & Notifications', href: '/reminders' },
              { icon: Settings, label: 'App Settings', href: '/settings' },
            ].map(({ icon: Icon, label, href }, i) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '14px 16px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color="var(--accent)" />
                </div>
                <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            ))}
          </div>

          {/* Log out */}
          <button
            className="btn btn-danger btn-full animate-fade-in"
            style={{ animationDelay: '0.15s' }}
            onClick={() => router.push('/')}
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>
    </>
  );
}
