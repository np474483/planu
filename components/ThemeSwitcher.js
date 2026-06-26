'use client';

import { useState } from 'react';
import { Sun, Moon, Palette, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { THEMES, THEME_KEYS } from '@/lib/themes';

// Gradient preview circles for each theme
const THEME_PREVIEWS = {
  ocean:    'linear-gradient(135deg, #38BDF8 0%, #0369A1 100%)',
  midnight: 'linear-gradient(135deg, #A78BFA 0%, #6D28D9 100%)',
  forest:   'linear-gradient(135deg, #34D399 0%, #059669 100%)',
  sunset:   'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
  rose:     'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)',
};

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { theme, mode, setTheme, toggleMode } = useTheme();

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Change theme"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <Palette size={18} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="modal-backdrop animate-fade-in"
          onClick={() => setOpen(false)}
        >
          {/* Panel */}
          <div
            className="modal-sheet animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-handle" />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Appearance</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Choose your theme & mode</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'var(--bg-elevated)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Dark / Light Toggle */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Mode
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['light', 'dark'].map((m) => (
                  <button
                    key={m}
                    onClick={() => { if (mode !== m) toggleMode(); }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '10px 0',
                      borderRadius: 'var(--radius-btn)',
                      border: `2px solid ${mode === m ? 'var(--accent)' : 'var(--border)'}`,
                      background: mode === m ? 'var(--accent-light)' : 'var(--bg-elevated)',
                      color: mode === m ? 'var(--accent-dark)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {m === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                    {m === 'light' ? 'Light' : 'Dark'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Palette Picker */}
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Color Theme
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {THEME_KEYS.map((key) => {
                  const info = THEMES[key];
                  const isActive = theme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-card)',
                        border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        background: isActive ? 'var(--accent-light)' : 'var(--bg-elevated)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                      }}
                    >
                      {/* Gradient circle */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: THEME_PREVIEWS[key],
                          flexShrink: 0,
                          boxShadow: isActive ? `0 0 0 3px var(--accent)` : 'none',
                          transition: 'box-shadow 0.2s ease',
                        }}
                      />
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {info.emoji} {info.name}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {key === 'ocean' ? 'Default · Electric Teal'
                           : key === 'midnight' ? 'Deep Violet Purple'
                           : key === 'forest' ? 'Calm Emerald Green'
                           : key === 'sunset' ? 'Warm Vibrant Orange'
                           : 'Soft Rose Pink'}
                        </p>
                      </div>
                      {isActive && (
                        <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
