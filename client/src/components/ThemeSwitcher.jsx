import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { dark, toggle } = useTheme();

  return (
    <button
      className="animated-button"
      onClick={toggle}
      style={{
        border: '1px solid rgba(148, 163, 184, 0.35)',
        background: dark ? '#111827' : '#ffffff',
        color: dark ? '#f8fafc' : '#0f172a',
        borderRadius: '999px',
        padding: '0.55rem 0.8rem',
        cursor: 'pointer',
        transition: 'all 250ms ease'
      }}
      type="button"
    >
      {dark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
