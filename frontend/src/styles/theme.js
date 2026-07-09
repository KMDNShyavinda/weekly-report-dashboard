export const lightTheme = {
  primary: '#4f46e5',
  primaryLight: '#6366f1',
  primaryDark: '#4338ca',
  primarySoft: '#eef2ff',
  secondary: '#06b6d4',
  secondarySoft: '#ecfeff',
  accent: '#f59e0b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#f8fafc',
  bg: '#f8fafc',
  surface: '#ffffff',
  surface2: '#f1f5f9',
  surfaceMuted: '#f8fafc',
  text: '#1f2937',
  text2: '#4b5563',
  muted: '#6b7280',
  border: '#e2e8f0',
  shadow: '0 1px 3px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.08)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.10)',
  gradient: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
  chartStroke: '#4f46e5'
};

export const darkTheme = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  primarySoft: 'rgba(129, 140, 248, 0.16)',
  secondary: '#06b6d4',
  secondarySoft: 'rgba(34, 211, 238, 0.16)',
  accent: '#fbbf24',
  success: '#34d399',
  warning: '#fb923c',
  danger: '#f87171',
  background: '#0f172a',
  bg: '#0f172a',
  surface: '#111827',
  surface2: '#1f2937',
  surfaceMuted: '#1f2937',
  text: '#f8fafc',
  text2: '#cbd5e1',
  muted: '#94a3b8',
  border: '#334155',
  shadow: '0 1px 3px rgba(0,0,0,0.35)',
  shadowMd: '0 4px 12px rgba(0,0,0,0.45)',
  shadowLg: '0 8px 24px rgba(0,0,0,0.55)',
  gradient: 'linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)',
  chartStroke: '#818cf8'
};

export const getTheme = (mode = 'light') => {
  const useDark = mode === 'dark' || mode === true;
  return useDark ? darkTheme : lightTheme;
};
export const getThemeTokens = getTheme;
