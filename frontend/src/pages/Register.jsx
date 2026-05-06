import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus } from 'lucide-react';

export default function Register({ setUser }) {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }} className="glass-card">
      <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.8rem' }}>Create Account</h2>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" required className="input-field" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" required className="input-field" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" required className="input-field" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select className="input-field" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
            <option value="customer">Customer</option>
            <option value="technician">Technician</option>
            <option value="organization">Organization</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
          <UserPlus size={20} /> {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login here</Link>
      </p>
    </div>
  );
}
