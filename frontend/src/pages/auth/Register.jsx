import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme';
import ThemeSwitcher from '../../components/ThemeSwitcher';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const { dark } = useTheme();
  const T = getTheme(dark);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerUser(form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'manager' ? '/dashboard' : '/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, background: T.bg }}>
      <div style={{ ...styles.card, background: T.surface, boxShadow: T.shadowMd, border: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <ThemeSwitcher />
        </div>
        <h2 style={{ ...styles.title, color: T.text }}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            className="form-field"
            style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }}
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className="form-field"
            style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="form-field"
            style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }}
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <div style={styles.roleSection}>
            <div style={{ marginBottom: '0.5rem', color: T.text, fontWeight: 700 }}>Select your role</div>
            <div style={styles.roleGroup}>
              <label style={{ ...styles.roleCard, ...(form.role === 'client' ? styles.roleCardActive : {}), background: dark ? '#111827' : '#f8fafc', borderColor: form.role === 'client' ? T.primary : T.border, color: T.text }}>
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={form.role === 'client'}
                  onChange={handleChange}
                  style={styles.hiddenInput}
                />
                <div style={styles.roleIcon}>👤</div>
                <div style={styles.roleTitle}>Client</div>
                <p style={{ ...styles.roleDescription, color: dark ? '#cbd5e1' : T.muted }}>Submit reports, track your weekly progress, and stay aligned with your manager.</p>
              </label>
              <label style={{ ...styles.roleCard, ...(form.role === 'manager' ? styles.roleCardActive : {}), background: dark ? '#111827' : '#f8fafc', borderColor: form.role === 'manager' ? T.primary : T.border, color: T.text }}>
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={form.role === 'manager'}
                  onChange={handleChange}
                  style={styles.hiddenInput}
                />
                <div style={styles.roleIcon}>🛠️</div>
                <div style={styles.roleTitle}>Manager (Admin)</div>
                <p style={{ ...styles.roleDescription, color: dark ? '#cbd5e1' : T.muted }}>Manage teams, review reports, and access the manager dashboard with administrative tools.</p>
              </label>
            </div>
          </div>

          <button className="animated-button" style={{ ...styles.button, background: T.primary }} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ ...styles.link, color: T.muted }}>Already have an account? <Link to="/login" style={{ color: T.primary }}>Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'transparent' },
  card:      { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
  title:     { marginBottom: '1.5rem', textAlign: 'center' },
  input:     { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  button:    { width: '100%', padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  error:     { color: 'red', marginBottom: '1rem', fontSize: '14px' },
  link:      { textAlign: 'center', marginTop: '1rem', fontSize: '14px' },
  roleSection: { marginBottom: '1rem' },
  roleGroup: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' },
  roleCard: { display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', borderRadius: '14px', border: '1px solid', cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' },
  roleCardActive: { transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(79, 70, 229, 0.15)' },
  hiddenInput: { position: 'absolute', opacity: 0, pointerEvents: 'none' },
  roleIcon: { fontSize: '1.75rem' },
  roleTitle: { fontSize: '0.95rem', fontWeight: 700 },
  roleDescription: { margin: 0, fontSize: '0.85rem', lineHeight: 1.4 }
};
