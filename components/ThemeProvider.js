'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME, DEFAULT_MODE } from '@/lib/themes';

// ─── Context ─────────────────────────────────────────────────────

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  mode: DEFAULT_MODE,
  setTheme: () => {},
  setMode: () => {},
  toggleMode: () => {},
  currentPalette: THEMES[DEFAULT_THEME],
});

// ─── Provider ────────────────────────────────────────────────────

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [mode, setModeState] = useState(DEFAULT_MODE);

  // Apply theme vars to <html> element
  const applyTheme = (themeKey, modeKey) => {
    const palette = THEMES[themeKey]?.[modeKey];
    if (!palette) return;

    const html = document.documentElement;
    // Smooth transition class
    html.classList.add('theme-transitioning');
    setTimeout(() => html.classList.remove('theme-transitioning'), 350);

    // Set data attributes for debugging
    html.setAttribute('data-theme', themeKey);
    html.setAttribute('data-mode', modeKey);

    // Inject CSS custom properties
    Object.entries(palette).forEach(([key, value]) => {
      html.style.setProperty(key, value);
    });
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('planu-theme') || DEFAULT_THEME;
    const savedMode  = localStorage.getItem('planu-mode')  || DEFAULT_MODE;
    setThemeState(savedTheme);
    setModeState(savedMode);
    applyTheme(savedTheme, savedMode);
  }, []);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('planu-theme', newTheme);
    applyTheme(newTheme, mode);
  };

  const setMode = (newMode) => {
    setModeState(newMode);
    localStorage.setItem('planu-mode', newMode);
    applyTheme(theme, newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        setTheme,
        setMode,
        toggleMode,
        currentPalette: THEMES[theme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useTheme() {
  return useContext(ThemeContext);
}
