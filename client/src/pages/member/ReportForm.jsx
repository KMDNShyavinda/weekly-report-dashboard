import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createReport, updateReport, getMyReports } from '../../api/reportApi';
import { getProjects } from '../../api/projectApi';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme-complete';

const INITIAL = { weekStart: '', weekEnd: '', projectId: '', tasksCompleted: '', tasksPlanned: '', blockers: '', hoursWorked: '', notes: '' };

export default function ReportForm() {
  const [form, setForm]         = useState(INITIAL);
  const [projects, setProjects] = useState([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { id }   = useParams();
  const { dark } = useTheme();
  const T = getTheme(dark);

  useEffect(() => {
    getProjects().then(res => setProjects(res.data));
    if (id) {
      getMyReports().then(res => {
        const report = res.data.find(r => r._id === id);
        if (report) setForm({
          weekStart:      report.weekStart?.slice(0, 10) || '',
          weekEnd:        report.weekEnd?.slice(0, 10) || '',
          projectId:      report.projectId?._id || '',
          tasksCompleted: report.tasksCompleted || '',
          tasksPlanned:   report.tasksPlanned   || '',
          blockers:       report.blockers       || '',
          hoursWorked:    report.hoursWorked    || '',
          notes:          report.notes          || ''
        });
      });
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (id) await updateReport(id, form);
      else    await createReport(form);
      navigate('/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.page, background: T.bg, color: T.text, minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '1.5rem', color: T.text }}>{id ? 'Edit Report' : 'New Weekly Report'}</h2>
      {error && <p style={{ ...styles.error, color: T.danger }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ ...styles.form, background: T.surface, boxShadow: T.shadowMd, border: `1px solid ${T.border}` }}>
        <label style={{ ...styles.label, color: T.text }}>Week Start</label>
        <input style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} type="date" name="weekStart" value={form.weekStart} onChange={handleChange} required />

        <label style={{ ...styles.label, color: T.text }}>Week End</label>
        <input style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} type="date" name="weekEnd" value={form.weekEnd} onChange={handleChange} required />

        <label style={{ ...styles.label, color: T.text }}>Project / Category</label>
        <select style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} name="projectId" value={form.projectId} onChange={handleChange} required>
          <option value="">Select a project</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>

        <label style={{ ...styles.label, color: T.text }}>Tasks Completed</label>
        <textarea style={{ ...styles.textarea, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} name="tasksCompleted" value={form.tasksCompleted} onChange={handleChange} placeholder="What did you complete this week?" required />

        <label style={{ ...styles.label, color: T.text }}>Tasks Planned for Next Week</label>
        <textarea style={{ ...styles.textarea, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} name="tasksPlanned" value={form.tasksPlanned} onChange={handleChange} placeholder="What do you plan to work on next week?" required />

        <label style={{ ...styles.label, color: T.text }}>Blockers / Challenges</label>
        <textarea style={{ ...styles.textarea, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} name="blockers" value={form.blockers} onChange={handleChange} placeholder="Any blockers? (optional)" />

        <label style={{ ...styles.label, color: T.text }}>Hours Worked (optional)</label>
        <input style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} type="number" name="hoursWorked" value={form.hoursWorked} onChange={handleChange} min="0" placeholder="e.g. 40" />

        <label style={{ ...styles.label, color: T.text }}>Notes / Links (optional)</label>
        <textarea style={{ ...styles.textarea, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional notes or links" />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button style={{ ...styles.btnPrimary, background: T.primary }} type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button style={{ ...styles.btnSecondary, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} type="button" onClick={() => navigate('/my-reports')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page:        { padding: '2rem', maxWidth: '600px', margin: '0 auto' },
  form:        { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  label:       { display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '14px' },
  input:       { width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  textarea:    { width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', minHeight: '80px', resize: 'vertical' },
  btnPrimary:  { padding: '0.6rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnSecondary:{ padding: '0.6rem 1.5rem', background: '#e5e7eb', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error:       { color: 'red', marginBottom: '1rem' }
};
