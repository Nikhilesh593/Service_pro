import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FASTLANE_SERVICES } from '../components/BookingWizard';
import { 
  Wrench, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Droplet, 
  Sparkles, 
  Settings, 
  Scissors, 
  BookOpen, 
  Car, 
  Bug,
  UserCheck,
  Calendar,
  CreditCard,
  Star,
  Quote,
  ArrowRight,
  Clock,
  MapPin as MapPinIcon
} from 'lucide-react';
import BookingWizard from '../components/BookingWizard';
import '../components/BookingWizard.css';
import './LandingPage.css';

const LandingPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);

  const [selectedService, setSelectedService] = useState(null);

  const openBooking = (service = null) => {
    if (!user) {
      navigate('/login');
    } else {
      setSelectedService(service);
      setWizardOpen(true);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-navbar">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Wrench size={24} />
          </div>
          ServiConnect
        </Link>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#providers">Providers</a>
          <a href="#reviews">Reviews</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="lp-user-greeting">👋 {user.name}</span>
              <Link to={`/${user.role}-dashboard`} className="lp-dashboard-btn">My Dashboard</Link>
              <button className="btn-orange lp-book-now-btn" onClick={openBooking}>Book a Service</button>
              <button className="lp-logout-btn" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">Log In</Link>
              <button className="btn-orange" onClick={() => navigate('/register')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="trust-badge">
            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
            Trusted by 50,000+ customers
          </div>
          <h1 className="hero-title">
            Find Local <br />
            <span>Service Experts</span> <br />
            Near You
          </h1>
          <p className="hero-subtitle">
            Connect with verified professionals for all your home and personal service needs. 
            Book instantly, pay securely, and get things done.
          </p>
          
          <div className="search-bar">
            <div className="search-input-group">
              <Search size={20} />
              <input type="text" placeholder="What service do you need?" />
            </div>
            <div className="search-input-group">
              <MapPin size={20} />
              <input type="text" placeholder="Your location" />
            </div>
            <button className="btn-orange" style={{ padding: '16px 32px' }} onClick={openBooking}>Book Now</button>
          </div>
        </div>
        
        <div className="hero-images">
          <div className="hero-image-card img-1">
            <div className="image-placeholder" style={{ backgroundColor: '#fed7aa' }}></div>
            <div className="hero-card-content">
              <h4>Electrical Services</h4>
              <p><Star size={14} fill="currentColor" /> 4.9 • 120+ providers</p>
            </div>
          </div>
          <div className="hero-image-card img-2">
            <div className="image-placeholder" style={{ backgroundColor: '#e2e8f0' }}></div>
            <div className="hero-card-content">
              <h4>Beauty & Wellness</h4>
              <p><Star size={14} fill="currentColor" /> 4.8 • 85+ providers</p>
            </div>
          </div>
          <div className="verified-badge-card">
            <div className="verified-icon">
              <ShieldCheck size={24} />
            </div>
            <div className="verified-text">
              <h4>100% Verified</h4>
              <p>Background checked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="services" className="section bg-gray">
        <span className="section-badge">Our Services</span>
        <h2 className="section-title">Browse by Category</h2>
        <p className="section-subtitle">
          Find the perfect professional for any job. From home repairs to personal care, we've got you covered.
        </p>

        <div className="categories-grid">
          {FASTLANE_SERVICES.map((svc) => (
            <div className="category-card lp-clickable" key={svc.id} onClick={() => openBooking(svc)}>
              <div className={`category-icon icon-gray`}>
                <span style={{ fontSize: '1.5rem' }}>{svc.icon}</span>
              </div>
              <h3>{svc.name}</h3>
              <p style={{ color: 'var(--primary-teal)', fontWeight: 'bold' }}>{svc.price}</p>
              <div className="category-stats"><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> {svc.time}</div>
              <div className="lp-book-hint">Tap to Book →</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section how-it-works-container">
        <span className="section-badge" style={{ background: '#ffedd5', color: '#ea580c' }}>How It Works</span>
        <h2 className="section-title">Book Services in 4 Easy Steps</h2>
        <p className="section-subtitle">
          Getting help has never been easier. Our streamlined process ensures you find the right professional quickly.
        </p>

        <div className="steps-grid">
          {[
            { num: "01", icon: <Search size={24} />, title: "Search Service", desc: "Browse through our categories or search for the specific service you need in your area." },
            { num: "02", icon: <UserCheck size={24} />, title: "Choose Provider", desc: "Compare verified professionals based on ratings, reviews, prices, and availability." },
            { num: "03", icon: <Calendar size={24} />, title: "Book Appointment", desc: "Select a convenient time slot and confirm your booking instantly with the provider." },
            { num: "04", icon: <CreditCard size={24} />, title: "Pay & Review", desc: "Make secure payments after service completion and share your experience." }
          ].map((step, idx) => (
            <div className="step-card" key={idx}>
              <div className="step-number">{step.num}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Providers Section */}
      <section id="providers" className="section bg-gray">
        <div className="providers-header">
          <div>
            <span className="section-badge" style={{ margin: '0 0 16px 0' }}>Top Rated</span>
            <h2 className="section-title">Featured Service Providers</h2>
            <p className="section-subtitle" style={{ margin: 0 }}>
              Work with the best. Our top-rated professionals are ready to help you.
            </p>
          </div>
          <button className="btn-outline">View All Providers <ArrowRight size={16} /></button>
        </div>

        <div className="providers-grid">
          {[
            { name: "Michael Chen", role: "Master Electrician", rating: 4.9, reviews: 234, location: "Downtown", exp: "8+ years", price: "$45", initial: "M" },
            { name: "Sarah Williams", role: "Professional Cleaner", rating: 4.8, reviews: 189, location: "Midtown", exp: "5+ years", price: "$35", initial: "S" },
            { name: "David Kumar", role: "Licensed Plumber", rating: 4.9, reviews: 312, location: "Westside", exp: "12+ years", price: "$50", initial: "D" },
            { name: "Emily Parker", role: "Beauty Specialist", rating: 5.0, reviews: 156, location: "Uptown", exp: "6+ years", price: "$55", initial: "E" }
          ].map((provider, idx) => (
            <div className="provider-card" key={idx}>
              <div className="provider-avatar-container">
                <div className="provider-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#94a3b8' }}>
                  {provider.initial}
                </div>
                <div className="provider-verified"><ShieldCheck size={14} /></div>
              </div>
              <h3>{provider.name}</h3>
              <div className="provider-role">{provider.role}</div>
              <div className="provider-rating">
                <Star size={16} fill="currentColor" />
                {provider.rating} <span>({provider.reviews} reviews)</span>
              </div>
              <div className="provider-meta">
                <span><MapPinIcon size={14} /> {provider.location}</span>
                <span><Clock size={14} /> {provider.exp}</span>
              </div>
              <div className="provider-footer">
                <div className="provider-price">{provider.price}<span>/hr</span></div>
                <button className="btn-teal" onClick={openBooking}>Book Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="section testimonials-container">
        <span className="section-badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>Testimonials</span>
        <h2 className="section-title">What Our Customers Say</h2>
        <p className="section-subtitle">
          Join thousands of satisfied customers who found their perfect service providers.
        </p>

        <div className="testimonials-grid">
          {[
            { text: "ServiConnect made finding a reliable electrician so easy. The booking process was smooth, and the professional arrived on time. Highly recommend!", name: "Jennifer Martinez", role: "Homeowner", initial: "J" },
            { text: "I use ServiConnect for all my office maintenance needs. The quality of service providers here is exceptional. It's saved me so much time and hassle.", name: "Robert Thompson", role: "Business Owner", initial: "R" },
            { text: "As someone with a busy schedule, having beauty services come to my home is a game-changer. The professionals are talented and punctual.", name: "Priya Sharma", role: "Working Professional", initial: "P" }
          ].map((review, idx) => (
            <div className="testimonial-card" key={idx}>
              <Quote className="quote-icon" />
              <div className="testimonial-rating">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="testimonial-text">"{review.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: '#94a3b8' }}>
                  {review.initial}
                </div>
                <div className="author-info">
                  <h4>{review.name}</h4>
                  <p>{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Booking Wizard — works from landing page */}
      <BookingWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => setWizardOpen(false)}
        user={user}
        initialService={selectedService}
      />
    </div>
  );
};

export default LandingPage;
