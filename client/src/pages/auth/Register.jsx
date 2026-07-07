import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input  style={styles.input} name="name"     type="text"     placeholder="Full Name" value={form.name}     onChange={handleChange} required />
          <input  style={styles.input} name="email"    type="email"    placeholder="Email"     value={form.email}    onChange={handleChange} required />
          <input  style={styles.input} name="password" type="password" placeholder="Password"  value={form.password} onChange={handleChange} required />
          <select style={styles.input} name="role" value={form.role} onChange={handleChange}>
            <option value="member">Team Member</option>
            <option value="manager">Manager</option>
          </select>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={styles.link}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f6fa' },
  card:      { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '360px' },
  title:     { marginBottom: '1.5rem', textAlign: 'center' },
  input:     { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  button:    { width: '100%', padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  error:     { color: 'red', marginBottom: '1rem', fontSize: '14px' },
  link:      { textAlign: 'center', marginTop: '1rem', fontSize: '14px' }
};
