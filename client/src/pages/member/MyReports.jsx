import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyReports, submitReport } from '../../api/reportApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme-complete';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const T = getTheme(dark);
  const navigate = useNavigate();

  useEffect(() => {
    getMyReports()
      .then(res => setReports(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (id) => {
    await submitReport(id);
    setReports(prev => prev.map(r => r._id === id ? { ...r, status: 'submitted' } : r));
  };

  const statusColor = { draft: '#f59e0b', submitted: '#10b981', late: '#ef4444' };

  return (
    <div style={{ ...styles.page, background: T.bg, color: T.text, minHeight: '100vh' }}>
      <div style={{ ...styles.header, color: T.text }}>
        <h2 style={{ color: T.text }}>My Reports — {user?.name}</h2>
        <div>
          <Link className="animated-link" to="/reports/new" style={{ ...styles.btnPrimary, background: T.primary }}>+ New Report</Link>
          <button className="animated-button" onClick={logout} style={{ ...styles.btnSecondary, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }}>Logout</button>
        </div>
      </div>

      {loading ? <p style={{ color: T.muted }}>Loading...</p> : reports.length === 0 ? (
        <p style={{ color: T.muted }}>No reports yet. <Link to="/reports/new" style={{ color: T.primary }}>Create your first report.</Link></p>
      ) : (
        <table style={{ ...styles.table, background: T.surface, boxShadow: T.shadowMd, border: `1px solid ${T.border}` }}>
          <thead>
            <tr>
              <th>Week</th><th>Project</th><th>Status</th><th>Hours</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r._id}>
                <td style={{ color: T.text }}>{new Date(r.weekStart).toLocaleDateString()} – {new Date(r.weekEnd).toLocaleDateString()}</td>
                <td style={{ color: T.text }}>{r.projectId?.name || '—'}</td>
                <td><span style={{ ...styles.badge, background: statusColor[r.status] }}>{r.status}</span></td>
                <td style={{ color: T.text }}>{r.hoursWorked || '—'}</td>
                <td>
                  <Link className="animated-link" to={`/reports/edit/${r._id}`} style={{ marginRight: '0.5rem', color: T.primary }}>Edit</Link>
                  {r.status === 'draft' && (
                    <button className="animated-button" onClick={() => handleSubmit(r._id)} style={{ ...styles.submitBtn, background: T.success }}>Submit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  page:        { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  btnPrimary:  { background: '#4f46e5', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', marginRight: '0.5rem' },
  btnSecondary:{ background: '#e5e7eb', color: '#333', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' },
  table:       { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  badge:       { padding: '2px 10px', borderRadius: '12px', color: '#fff', fontSize: '12px' },
  linkBtn:     { marginRight: '0.5rem', color: '#4f46e5' },
  submitBtn:   { background: '#10b981', color: '#fff', border: 'none', padding: '2px 10px', borderRadius: '4px', cursor: 'pointer' },
};
