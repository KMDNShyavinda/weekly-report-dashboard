import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, getCharts } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getThemeTokens } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme-complete';

const palette = ['#4f46e5', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];

function StatCard({ title, value, icon, color, accent, trend, loading }) {
  return (
    <div className="dashboard-card" style={{
      padding: '1.25rem',
      borderRadius: '20px',
      background: accent,
      border: `1px solid ${color}20`,
      boxShadow: '0 16px 36px rgba(15, 23, 42, 0.06)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>+{trend}%</span>
      </div>
      {loading ? (
        <div style={{ height: '72px', borderRadius: '14px', background: 'rgba(255,255,255,0.5)' }} />
      ) : (
        <>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
          <div style={{ fontSize: '0.95rem', color: '#475569', marginTop: '0.25rem' }}>{title}</div>
        </>
      )}
    </div>
  );
}

export default function DashboardV2() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dark, toggle } = useTheme();
  const T = getTheme(dark);
  const theme = getThemeTokens(dark ? 'dark' : 'light');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [summaryRes, chartsRes] = await Promise.all([getSummary(), getCharts()]);
        if (active) {
          setSummary(summaryRes.data);
          setCharts(chartsRes.data);
          setLoading(false);
        }
      } catch (error) {
        if (active) {
          setLoading(false);
          console.error('Dashboard load failed', error);
        }
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('weekly-dashboard-theme', dark ? 'dark' : 'light');
    }
  }, [dark]);

  const trendData = charts?.trend || [];
  const workloadData = charts?.workloadByProject?.length ? charts?.workloadByProject : [{ name: 'No data', count: 1 }];
  const submissionData = charts?.submissionStatus || [];

  const statCards = [
    {
      title: 'Reports Submitted',
      value: summary?.submittedThisWeek ?? 0,
      icon: '📋',
      color: theme.primary,
      accent: theme.primarySoft,
      trend: 12
    },
    {
      title: 'Compliance Rate',
      value: `${summary?.complianceRate ?? 0}%`,
      icon: '✅',
      color: theme.success,
      accent: `${theme.success}16`,
      trend: 8
    },
    {
      title: 'Open Blockers',
      value: summary?.openBlockers ?? 0,
      icon: '⚠️',
      color: theme.warning,
      accent: `${theme.warning}16`,
      trend: 3
    },
    {
      title: 'Team Members',
      value: summary?.totalMembers ?? 0,
      icon: '👥',
      color: theme.secondary,
      accent: theme.secondarySoft,
      trend: 5
    }
  ];

  return (
    <div className="dashboard-shell" style={{ minHeight: '100vh', background: theme.background, color: theme.text, transition: 'background 300ms ease, color 300ms ease' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div className="dashboard-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.7rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, color: theme.primary, background: theme.primarySoft }}>
              <span>◉</span>
              <span>Operations Hub</span>
            </div>
            <h1 style={{ marginTop: '0.7rem', fontSize: 'clamp(1.6rem, 1.3rem + 1.2vw, 2.2rem)', fontWeight: 800 }}>Manager Dashboard</h1>
            <p style={{ marginTop: '0.45rem', color: theme.muted, maxWidth: '640px' }}>
              Welcome back, {user?.name || 'Manager'}. Track team momentum, report health, and delivery pace at a glance.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
            <button
              className="animated-button"
              onClick={toggle}
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                color: theme.text,
                borderRadius: '999px',
                padding: '0.65rem 0.95rem',
                cursor: 'pointer',
                boxShadow: theme.shadow
              }}
            >
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <Link className="animated-link" to="/team-reports" style={{ border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, borderRadius: '999px', padding: '0.65rem 0.95rem', boxShadow: theme.shadow }}>
              Team Reports
            </Link>
            <Link className="animated-link" to="/projects" style={{ border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, borderRadius: '999px', padding: '0.65rem 0.95rem', boxShadow: theme.shadow }}>
              Projects
            </Link>
            <button className="animated-button" onClick={logout} style={{ border: 'none', background: theme.gradient, color: '#fff', borderRadius: '999px', padding: '0.65rem 0.95rem', cursor: 'pointer', boxShadow: theme.shadow }}>
              Logout
            </button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.4rem' }}>
          {loading
            ? statCards.map((card, index) => (
                <div key={index} className="dashboard-card" style={{ padding: '1.25rem', borderRadius: '20px', background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                  <div style={{ height: '18px', width: '60%', background: theme.border, borderRadius: '999px' }} />
                  <div style={{ height: '34px', width: '40%', background: theme.border, borderRadius: '999px', marginTop: '0.9rem' }} />
                </div>
              ))
            : statCards.map((card) => <StatCard key={card.title} {...card} />)}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
          <section className="dashboard-card chart-shell" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '1.25rem', boxShadow: theme.shadow }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Submission trend</h3>
                <p style={{ color: theme.muted, fontSize: '0.92rem' }}>Reports submitted over the last six weeks.</p>
              </div>
              <span style={{ padding: '0.35rem 0.7rem', borderRadius: '999px', background: theme.primarySoft, color: theme.primary, fontSize: '0.8rem', fontWeight: 700 }}>
                Weekly pulse
              </span>
            </div>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid stroke={theme.border} vertical={false} />
                  <XAxis dataKey="_id" stroke={theme.muted} tickLine={false} axisLine={false} />
                  <YAxis stroke={theme.muted} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '14px' }} />
                  <Line type="monotone" dataKey="count" stroke={theme.chartStroke} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <section className="dashboard-card chart-shell" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '1.25rem', boxShadow: theme.shadow }}>
              <div style={{ marginBottom: '0.9rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Submission status</h3>
                <p style={{ color: theme.muted, fontSize: '0.92rem' }}>Each team member’s current report state.</p>
              </div>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer>
                  <BarChart data={submissionData}>
                    <CartesianGrid stroke={theme.border} vertical={false} />
                    <XAxis dataKey="name" stroke={theme.muted} tickLine={false} axisLine={false} />
                    <YAxis stroke={theme.muted} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '14px' }} />
                    <Bar dataKey="status" radius={[10, 10, 0, 0]} fill={theme.chartStroke} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-card chart-shell" style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '24px', padding: '1.25rem', boxShadow: theme.shadow }}>
              <div style={{ marginBottom: '0.9rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Project workload</h3>
                <p style={{ color: theme.muted, fontSize: '0.92rem' }}>Distribution across active projects.</p>
              </div>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={workloadData} dataKey="count" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                      {workloadData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={palette[index % palette.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '14px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
