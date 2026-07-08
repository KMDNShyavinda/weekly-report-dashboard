export const lightTheme = {
  primary: '#4f46e5',
  primarySoft: '#eef2ff',
  secondary: '#06b6d4',
  secondarySoft: '#ecfeff',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  shadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
  gradient: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
  chartStroke: '#4f46e5'
};

export const darkTheme = {
  primary: '#818cf8',
  primarySoft: 'rgba(129, 140, 248, 0.16)',
  secondary: '#22d3ee',
  secondarySoft: 'rgba(34, 211, 238, 0.16)',
  success: '#4ade80',
  warning: '#fb923c',
  danger: '#f87171',
  background: '#020617',
  surface: '#111827',
  surfaceMuted: '#1f2937',
  text: '#f8fafc',
  muted: '#94a3b8',
  border: '#334155',
  shadow: '0 24px 60px rgba(2, 6, 23, 0.45)',
  gradient: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
  chartStroke: '#818cf8'
};

export const getThemeTokens = (mode = 'light') => (mode === 'dark' ? darkTheme : lightTheme);
