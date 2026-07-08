import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme-complete';

export default function Layout({ children }) {
  const { dark } = useTheme();
  const T = getTheme(dark);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, transition: 'all 300ms ease' }}>
      {children}
    </div>
  );
}
