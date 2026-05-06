import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './Auth.css';

/* =================== SVG Icon Components =================== */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 2.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconCheck = () => <span style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1 }}>✓</span>;

const GoogleSVG = () => (
  <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* =================== Service Options =================== */
const SERVICE_OPTIONS = [
  { id: 1, name: 'A.C Jet Machine Service' },
  { id: 2, name: 'Watertank Clean by Machine' },
  { id: 3, name: 'Air Cooler Service' },
  { id: 4, name: 'Washing Machine Service' },
  { id: 5, name: 'Generator/Inverter Rentals' },
  { id: 6, name: 'Chimney Services' },
  { id: 7, name: 'Aquaguard Service' },
  { id: 8, name: 'Janitorial Services' },
  { id: 9, name: '2 Wheeler Services @ Doorstep' },
  { id: 10, name: 'Others' },
];

/* =================== Component =================== */
export default function Register({ setUser }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'customer',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [othersText, setOthersText] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const isProfessional = formData.role === 'technician' || formData.role === 'organization';

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setDocFile(file);
  };

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name.trim()) return setError('Please enter your full name.');
    if (!formData.email.trim()) return setError('Please enter your email address.');
    if (!formData.phone.trim()) return setError('Please enter your phone number.');
    if (!formData.address.trim()) return setError('Please enter your address.');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.');

    if (isProfessional) {
      if (!docFile) return setError('Please upload a valid certification or licence document.');
      if (selectedServices.length === 0) return setError('Please select at least one service you provide.');
      const hasOthers = selectedServices.includes(12);
      if (hasOthers && !othersText.trim()) return setError('Please specify the "Others" service details.');
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));

      if (isProfessional) {
        data.append('document', docFile);
        const servicesPayload = selectedServices.map(id => {
          const s = SERVICE_OPTIONS.find(o => o.id === id);
          return id === 12 ? { id, name: 'Others', details: othersText } : { id, name: s?.name, price: s?.price };
        });
        data.append('services', JSON.stringify(servicesPayload));
      }

      const res = await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Account created successfully! Redirecting…');
      setTimeout(() => setUser(res.data), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <p className="hero-tagline">Join the Community</p>
          <h1 className="hero-title">
            Start Your<br />
            <span>Journey Today</span>
          </h1>
          <p className="hero-subtitle">
            Whether you're looking for reliable home services or want to grow your service business — ServicePro is the platform for you.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">12+</span>
              <span className="hero-stat-label">Service Types</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">₹200</span>
              <span className="hero-stat-label">Starting at</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">24/7</span>
              <span className="hero-stat-label">Support</span>
            </div>
          </div>
        </div>

        <div className="hero-floating-cards">
          <div className="hero-float-card">
            <div className="float-icon" style={{ background: 'rgba(255, 107, 43, 0.15)' }}>🧰</div>
            <div className="float-text">
              <strong>Technician</strong>
              Earn on your schedule
            </div>
          </div>
          <div className="hero-float-card">
            <div className="float-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>🏠</div>
            <div className="float-text">
              <strong>Customer</strong>
              Book in seconds
            </div>
          </div>
          <div className="hero-float-card">
            <div className="float-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>🏢</div>
            <div className="float-text">
              <strong>Organisation</strong>
              Manage your team
            </div>
          </div>
        </div>
      </div>

      {/* ---- Right Form Panel ---- */}
      <div className="auth-form-panel register-panel">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <h1>Create Account ✨</h1>
            <p>Fill in the details below to get started</p>
          </div>

          {/* Google Sign-Up */}
          <div className="social-auth">
            <button
              id="btn-google-register"
              type="button"
              className="btn-google"
              onClick={handleGoogleRegister}
            >
              <GoogleSVG />
              Sign up with Google
            </button>
          </div>

          <div className="divider"><span>or register with email</span></div>

          {error && <div className="sp-error-banner">⚠️ {error}</div>}
          {success && <div className="sp-success-banner">✅ {success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Row: Name + Phone */}
            <div className="sp-form-row">
              <div className="sp-form-group">
                <label className="sp-label" htmlFor="reg-name">Full Name</label>
                <div className="sp-input-wrap">
                  <span className="sp-input-icon"><IconUser /></span>
                  <input
                    id="reg-name"
                    type="text"
                    className="sp-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="sp-form-group">
                <label className="sp-label" htmlFor="reg-phone">Phone Number</label>
                <div className="sp-input-wrap">
                  <span className="sp-input-icon"><IconPhone /></span>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="sp-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="sp-form-group">
              <label className="sp-label" htmlFor="reg-email">Email Address</label>
              <div className="sp-input-wrap">
                <span className="sp-input-icon"><IconMail /></span>
                <input
                  id="reg-email"
                  type="email"
                  className="sp-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Address */}
            <div className="sp-form-group">
              <label className="sp-label" htmlFor="reg-address">Address</label>
              <div className="sp-input-wrap">
                <span className="sp-input-icon"><IconMapPin /></span>
                <input
                  id="reg-address"
                  type="text"
                  className="sp-input"
                  placeholder="123, Street Name, City, State"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="sp-form-group">
              <label className="sp-label" htmlFor="reg-password">Password</label>
              <div className="sp-input-wrap">
                <span className="sp-input-icon"><IconLock /></span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="sp-input"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  autoComplete="new-password"
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

            {/* Account Type */}
            <div className="sp-form-group">
              <label className="sp-label" htmlFor="reg-role">Account Type</label>
              <div className="sp-input-wrap sp-select-wrap">
                <span className="sp-input-icon"><IconUser /></span>
                <select
                  id="reg-role"
                  className="sp-select"
                  value={formData.role}
                  onChange={(e) => {
                    handleChange('role', e.target.value);
                    setSelectedServices([]);
                    setDocFile(null);
                  }}
                >
                  <option value="customer">👤 User / Customer</option>
                  <option value="technician">🔧 Technician</option>
                  <option value="organization">🏢 Service Provider Organisation</option>
                </select>
                <span className="sp-select-caret"><IconChevron /></span>
              </div>
            </div>

            {/* ====== Expanded Section for Technician / Organisation ====== */}
            {isProfessional && (
              <div className="expanded-section">
                {/* Document Upload */}
                <div className="section-divider">
                  <div className="section-divider-line" />
                  <span className="section-divider-label">📄 Verification Documents</span>
                  <div className="section-divider-line" />
                </div>

                <div className="sp-form-group">
                  <label className="sp-label">
                    Upload Licence / Certification
                    <span style={{ color: 'var(--sp-primary)', marginLeft: 4 }}>*</span>
                  </label>
                  <div
                    className={`file-upload-area ${docFile ? 'has-file' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="file-input-hidden"
                      onChange={handleFileChange}
                      id="doc-upload"
                    />
                    <span className="file-upload-icon">
                      <IconUpload />
                    </span>
                    {docFile ? (
                      <>
                        <p className="file-upload-text">Document selected</p>
                        <span className="file-name-tag">✅ {docFile.name}</span>
                      </>
                    ) : (
                      <>
                        <p className="file-upload-text">
                          <strong>Click to upload</strong> or drag & drop
                        </p>
                        <p className="file-upload-hint">PDF, JPG, PNG, DOC — Max 10MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Services Selection */}
                <div className="section-divider">
                  <div className="section-divider-line" />
                  <span className="section-divider-label">🛠️ Services You Provide</span>
                  <div className="section-divider-line" />
                </div>

                <div className="sp-form-group">
                  <label className="sp-label">
                    Select All Applicable Services
                    {selectedServices.length > 0 && (
                      <span style={{
                        marginLeft: 8,
                        background: 'var(--sp-primary)',
                        color: 'white',
                        borderRadius: '100px',
                        padding: '1px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>
                        {selectedServices.length} selected
                      </span>
                    )}
                  </label>

                  <div className="services-grid">
                    {SERVICE_OPTIONS.map((service) => {
                      const isChecked = selectedServices.includes(service.id);
                      return (
                        <label
                          key={service.id}
                          className={`service-checkbox-item ${isChecked ? 'checked' : ''}`}
                          htmlFor={`service-${service.id}`}
                        >
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={isChecked}
                            onChange={() => toggleService(service.id)}
                          />
                          <div className="service-check-box">
                            <span className="service-check-mark"><IconCheck /></span>
                          </div>
                          <div className="service-info">
                            <span className="service-name">
                              {service.name}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* "Others" text area */}
                  {selectedServices.includes(10) && (
                    <textarea
                      id="others-specify"
                      className="others-textarea"
                      placeholder="Please describe the service(s) you provide…"
                      value={othersText}
                      onChange={(e) => setOthersText(e.target.value)}
                      rows={3}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-register-submit"
              type="submit"
              className="btn-sp-primary"
              disabled={loading}
              style={{ marginTop: '12px' }}
            >
              {loading ? <span className="sp-spinner" /> : '🚀'}
              {loading ? 'Creating your account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
