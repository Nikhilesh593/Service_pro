import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

// ---- Inline SVG icons to avoid extra deps ----
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const GoogleSVG = () => (
  <svg className="google-icon" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth redirect – update this URL with your backend's Google auth route
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="auth-page">
      {/* ---- Left Hero Panel ---- */}
      <div className="auth-hero">
        <div className="hero-logo">
          <div className="hero-logo-icon">🔧</div>
          <div className="hero-logo-text">Service<span>Pro</span></div>
        </div>

        <div className="hero-content">
          <p className="hero-tagline">Trusted Home Services</p>
          <h1 className="hero-title">
            Your Home,<br />
            <span>Our Expertise</span>
          </h1>
          <p className="hero-subtitle">
            Connect with certified technicians and service providers for all your home service needs — fast, reliable, and affordable.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">10K+</span>
              <span className="hero-stat-label">Happy Customers</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">500+</span>
              <span className="hero-stat-label">Experts Available</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">50+</span>
              <span className="hero-stat-label">Services Offered</span>
            </div>
          </div>
        </div>

        <div className="hero-floating-cards">
          <div className="hero-float-card">
            <div className="float-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>✅</div>
            <div className="float-text">
              <strong>Booking Confirmed!</strong>
              AC Service – Today 2pm
            </div>
          </div>
          <div className="hero-float-card">
            <div className="float-icon" style={{ background: 'rgba(255, 107, 43, 0.15)' }}>⭐</div>
            <div className="float-text">
              <strong>5.0 Rating</strong>
              Rahul – Technician
            </div>
          </div>
          <div className="hero-float-card">
            <div className="float-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>🚀</div>
            <div className="float-text">
              <strong>Instant Visit</strong>
              2-4 hr response time
            </div>
          </div>
        </div>
      </div>

      {/* ---- Right Form Panel ---- */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <h1>Welcome Back 👋</h1>
            <p>Sign in to access your ServicePro account</p>
          </div>

          {/* Google Sign-In */}
          <div className="social-auth">
            <button
              id="btn-google-login"
              type="button"
              className="btn-google"
              onClick={handleGoogleLogin}
            >
              <GoogleSVG />
              Continue with Google
            </button>
          </div>

          <div className="divider">
            <span>or sign in with email</span>
          </div>

          {error && (
            <div className="sp-error-banner">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="sp-form-group">
              <label className="sp-label" htmlFor="login-email">Email Address</label>
              <div className="sp-input-wrap">
                <span className="sp-input-icon"><IconMail /></span>
                <input
                  id="login-email"
                  type="email"
                  className="sp-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="sp-form-group">
              <label className="sp-label" htmlFor="login-password">Password</label>
              <div className="sp-input-wrap">
                <span className="sp-input-icon"><IconLock /></span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="sp-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="sp-input-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            <div className="forgot-link">
              <a href="#">Forgot password?</a>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="btn-sp-primary"
              disabled={loading}
            >
              {loading ? <span className="sp-spinner" /> : '→'}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer-link">
            New to ServicePro? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
