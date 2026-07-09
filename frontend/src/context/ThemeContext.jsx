import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;

    const saved = window.localStorage.getItem('theme');
    if (saved) return saved === 'dark';

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', dark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    }
  }, [dark]);

  const value = useMemo(() => ({ dark, toggle: () => setDark((prev) => !prev) }), [dark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return context;
}
