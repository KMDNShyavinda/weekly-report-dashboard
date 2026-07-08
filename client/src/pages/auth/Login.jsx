import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme-complete';
import ThemeSwitcher from '../../components/ThemeSwitcher';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const { dark } = useTheme();
  const T = getTheme(dark);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'manager' ? '/dashboard' : '/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
        <h2 style={{ ...styles.title, color: T.text }}>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input className="form-field" style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} name="email"    type="email"    placeholder="Email"    value={form.email}    onChange={handleChange} required />
          <input className="form-field" style={{ ...styles.input, background: T.surface2, color: T.text, border: `1px solid ${T.border}` }} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <button className="animated-button" style={{ ...styles.button, background: T.primary }} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ ...styles.link, color: T.muted }}>Don't have an account? <Link to="/register" style={{ color: T.primary }}>Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f6fa', padding: '1rem' },
  card:      { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '380px', maxWidth: '100%' },
  title:     { marginBottom: '1.5rem', textAlign: 'center', fontSize: '28px', fontWeight: '600' },
  input:     { width: '100%', padding: '0.85rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' },
  button:    { width: '100%', padding: '0.85rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  error:     { color: 'red', marginBottom: '1rem', fontSize: '15px' },
  link:      { textAlign: 'center', marginTop: '1rem', fontSize: '15px' }
};
