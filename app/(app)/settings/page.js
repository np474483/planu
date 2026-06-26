'use client';

import { useState } from 'react';
import { Bell, Moon, Sun, Smartphone, Info, ChevronRight } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTheme } from '@/components/ThemeProvider';

export default function SettingsPage() {
  const { mode, toggleMode } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const Toggle = ({ value, onToggle }) => (
    <button
      onClick={onToggle}
      style={{
        background: value ? 'var(--accent)' : 'var(--bg-elevated)',
        border: `1.5px solid ${value ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-full)',
        width: 44, height: 24, cursor: 'pointer',
        position: 'relative', flexShrink: 0, transition: 'all 0.25s ease',
      }}
    >
      <div style={{
        position: 'absolute', top: 2,
        left: value ? 22 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.25s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );

  const SettingRow = ({ icon: Icon, label, sublabel, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color="var(--accent)" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{sublabel}</div>}
      </div>
      {right}
    </div>
  );

  return (
    <>
      <TopHeader title="Settings" backHref="/profile" rightSlot={<ThemeSwitcher />} />

      <div className="page-padding">
        {/* Appearance */}
        <div className="card animate-fade-in" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 4 }}>Appearance</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 14 }}>Customize how PlanU looks.</p>

          <SettingRow
            icon={mode === 'dark' ? Moon : Sun}
            label="Dark Mode"
            sublabel={mode === 'dark' ? 'Currently dark theme' : 'Currently light theme'}
            right={<Toggle value={mode === 'dark'} onToggle={toggleMode} />}
          />
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Color Theme
            </div>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Notifications */}
        <div className="card animate-fade-in" style={{ marginBottom: 16, animationDelay: '0.05s' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 4 }}>Notifications</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 14 }}>Manage your push notification preferences.</p>

          <SettingRow
            icon={Bell}
            label="Push Notifications"
            sublabel="Study reminders and exam alerts"
            right={<Toggle value={pushEnabled} onToggle={() => setPushEnabled((v) => !v)} />}
          />
          <SettingRow
            icon={Smartphone}
            label="Vibration"
            sublabel="Vibrate on reminder trigger"
            right={<Toggle value={vibrationEnabled} onToggle={() => setVibrationEnabled((v) => !v)} />}
          />
          <SettingRow
            icon={Bell}
            label="Daily Digest"
            sublabel="Summary notification every morning"
            right={<Toggle value={dailyDigest} onToggle={() => setDailyDigest((v) => !v)} />}
          />
        </div>

        {/* About */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: 14 }}>About</h3>
          {[
            { label: 'App Version', value: 'v1.0.0 (Beta)' },
            { label: 'Platform', value: 'Progressive Web App' },
            { label: 'AI Engine', value: 'Google Gemini' },
            { label: 'Built by', value: 'Nikhil Uttam Patil' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
