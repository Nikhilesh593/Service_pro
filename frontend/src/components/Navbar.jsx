import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const logout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Service<span style={{ color: 'var(--primary)' }}>Pro</span> AI
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ color: 'var(--text-muted)' }}>
          Welcome, <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong> 
          <span className="badge" style={{ marginLeft: '8px', background: 'rgba(79,70,229,0.2)', color: 'var(--primary)' }}>{user.role}</span>
        </span>
        <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}
