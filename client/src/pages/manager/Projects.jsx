import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projectApi';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme-complete';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm]         = useState({ name: '', description: '' });
  const [editId, setEditId]     = useState(null);
  const [error, setError]       = useState('');
  const { dark } = useTheme();
  const T = getTheme(dark);

  useEffect(() => { getProjects().then(r => setProjects(r.data)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        const res = await updateProject(editId, form);
        setProjects(prev => prev.map(p => p._id === editId ? res.data : p));
        setEditId(null);
      } else {
        const res = await createProject(form);
        setProjects(prev => [...prev, res.data]);
      }
      setForm({ name: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleEdit   = (p) => { setEditId(p._id); setForm({ name: p.name, description: p.description }); };
  const handleDelete = async (id) => {
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div style={{ ...styles.page, background: T.bg, color: T.text, minHeight: '100vh' }}>
      <div style={styles.header}>
        <h2 style={{ color: T.text }}>Manage Projects</h2>
        <Link to="/dashboard" style={{ ...styles.back, color: T.primary }}>← Dashboard</Link>
      </div>

      <form onSubmit={handleSubmit} style={{ ...styles.form, background: T.surface, boxShadow: T.shadowMd, border: `1px solid ${T.border}` }}>
        <h4 style={{ marginBottom: '1rem', color: T.text }}>{editId ? 'Edit Project' : 'Add New Project'}</h4>
        {error && <p style={{ ...styles.error, color: T.danger }}>{error}</p>}
        <input style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} placeholder="Project name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <button className="animated-button" style={{ ...styles.btn, background: T.primary }} type="submit">{editId ? 'Update' : 'Add Project'}</button>
        {editId && <button className="animated-button" style={{ ...styles.cancelBtn, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '' }); }}>Cancel</button>}
      </form>

      <div style={styles.list}>
        {projects.map(p => (
          <div key={p._id} style={{ ...styles.item, background: T.surface, boxShadow: T.shadowMd, border: `1px solid ${T.border}` }}>
            <div><strong style={{ color: T.text }}>{p.name}</strong><p style={{ fontSize: '13px', color: T.muted }}>{p.description}</p></div>
            <div>
              <button className="animated-button" style={{ ...styles.editBtn, background: T.primarySoft || T.surface2, color: T.primary }}   onClick={() => handleEdit(p)}>Edit</button>
              <button className="animated-button" style={{ ...styles.deleteBtn, background: `${T.danger}20`, color: T.danger }} onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:      { padding: '2rem', maxWidth: '700px', margin: '0 auto' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  form:      { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  input:     { width: '100%', padding: '0.6rem', marginBottom: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  btn:       { padding: '0.5rem 1.2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' },
  cancelBtn: { padding: '0.5rem 1rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  back:      { color: '#4f46e5', textDecoration: 'none' },
  list:      { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  item:      { background: '#fff', padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  editBtn:   { padding: '4px 12px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' },
  deleteBtn: { padding: '4px 12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  error:     { color: 'red', marginBottom: '0.5rem', fontSize: '14px' }
};
