import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../styles/theme';

export default function Layout({ children }) {
  const { dark } = useTheme();
  const { user } = useAuth();
  const T = getTheme(dark ? 'dark' : 'light');

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, transition: 'all 300ms ease' }}>
      {children}
      {user?.role === 'manager' && (
        <Link
          to="/assistant"
          style={{
            position: 'fixed',
            right: '1.5rem',
            bottom: '1.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: T.primary,
            color: '#fff',
            textDecoration: 'none',
            boxShadow: '0 16px 32px rgba(0,0,0,0.16)',
            zIndex: 1000
          }}
        >
          AI
        </Link>
      )}
    </div>
  );
}
