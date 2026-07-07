import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, getCharts } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts]   = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    getSummary().then(res => setSummary(res.data));
    getCharts().then(res => setCharts(res.data));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Manager Dashboard — {user?.name}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/team-reports" style={styles.navBtn}>Team Reports</Link>
          <Link to="/projects"     style={styles.navBtn}>Projects</Link>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={styles.cards}>
          <div style={styles.card}><h3>{summary.submittedThisWeek}</h3><p>Submitted This Week</p></div>
          <div style={styles.card}><h3>{summary.complianceRate}%</h3><p>Compliance Rate</p></div>
          <div style={styles.card}><h3>{summary.openBlockers}</h3><p>Open Blockers</p></div>
          <div style={styles.card}><h3>{summary.totalMembers}</h3><p>Total Members</p></div>
        </div>
      )}

      {/* Charts */}
      {charts && (
        <div style={styles.chartsGrid}>
          <div style={styles.chartBox}>
            <h4>Submission Status by Member</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.submissionStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="status" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartBox}>
            <h4>Workload by Project</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={charts.workloadByProject} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {charts.workloadByProject.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ ...styles.chartBox, gridColumn: '1 / -1' }}>
            <h4>Reports Submitted — Trend</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={charts.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:      { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  navBtn:    { background: '#e0e7ff', color: '#4f46e5', padding: '0.4rem 1rem', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' },
  logoutBtn: { background: '#e5e7eb', color: '#333', padding: '0.4rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' },
  cards:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' },
  card:      { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', textAlign: 'center' },
  chartsGrid:{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  chartBox:  { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
};
