import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllReports } from '../../api/reportApi';
import { getProjects }   from '../../api/projectApi';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme-complete';

export default function TeamReports() {
  const [reports, setReports]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters]   = useState({ projectId: '', startDate: '', endDate: '' });
  const [loading, setLoading]   = useState(true);
  const { dark } = useTheme();
  const T = getTheme(dark);

  const fetchReports = async () => {
    setLoading(true);
    const params = {};
    if (filters.projectId) params.projectId = filters.projectId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate)   params.endDate   = filters.endDate;
    const res = await getAllReports(params);
    setReports(res.data);
    setLoading(false);
  };

  useEffect(() => { getProjects().then(r => setProjects(r.data)); fetchReports(); }, []);

  const statusColor = { draft: '#f59e0b', submitted: '#10b981', late: '#ef4444', pending: '#9ca3af' };

  return (
    <div style={{ ...styles.page, background: T.bg, color: T.text, minHeight: '100vh' }}>
      <div style={styles.header}>
        <h2 style={{ color: T.text }}>Team Reports</h2>
        <Link to="/dashboard" style={{ ...styles.back, color: T.primary }}>← Dashboard</Link>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} value={filters.projectId} onChange={e => setFilters({...filters, projectId: e.target.value})}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <input style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} placeholder="Start Date" />
        <input style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} type="date" value={filters.endDate}   onChange={e => setFilters({...filters, endDate:   e.target.value})} placeholder="End Date" />
        <button style={{ ...styles.btn, background: T.primary }} onClick={fetchReports}>Filter</button>
      </div>

      {loading ? <p style={{ color: T.muted }}>Loading...</p> : (
        <table style={{ ...styles.table, background: T.surface, boxShadow: T.shadowMd, border: `1px solid ${T.border}` }}>
          <thead>
            <tr><th>Member</th><th>Week</th><th>Project</th><th>Status</th><th>Hours</th><th>Blockers</th></tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r._id}>
                <td style={{ color: T.text }}>{r.userId?.name}</td>
                <td style={{ color: T.text }}>{new Date(r.weekStart).toLocaleDateString()}</td>
                <td style={{ color: T.text }}>{r.projectId?.name}</td>
                <td><span style={{ ...styles.badge, background: statusColor[r.status] }}>{r.status}</span></td>
                <td style={{ color: T.text }}>{r.hoursWorked || '—'}</td>
                <td style={{ color: T.text }}>{r.blockers || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  page:    { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  input:   { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  btn:     { padding: '0.5rem 1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  back:    { color: '#4f46e5', textDecoration: 'none' },
  table:   { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  badge:   { padding: '2px 10px', borderRadius: '12px', color: '#fff', fontSize: '12px' },
};
