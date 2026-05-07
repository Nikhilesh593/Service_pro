import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const LandingPage = ({ user }) => {
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);

  const openBooking = () => {
    if (!user) {
      navigate('/login');
    } else {
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
          <Link to="/login" className="login-btn">Log In</Link>
          <button className="btn-orange" onClick={() => navigate('/register')}>Get Started</button>
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
            <button className="btn-orange" style={{ padding: '16px 32px' }}>Search</button>
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
          {[
            { icon: <Zap size={24} />, title: "Electrical", desc: "Wiring, repairs, installations & more", count: "120+ providers", colorClass: "icon-yellow" },
            { icon: <Droplet size={24} />, title: "Plumbing", desc: "Pipes, fixtures, drainage solutions", count: "95+ providers", colorClass: "icon-blue" },
            { icon: <Sparkles size={24} />, title: "Home Cleaning", desc: "Deep cleaning, regular maintenance", count: "200+ providers", colorClass: "icon-green" },
            { icon: <Settings size={24} />, title: "Appliance Repair", desc: "AC, fridge, washing machine fixes", count: "85+ providers", colorClass: "icon-gray" },
            { icon: <Scissors size={24} />, title: "Beauty Services", desc: "Salon at home, makeup, styling", count: "150+ providers", colorClass: "icon-pink" },
            { icon: <BookOpen size={24} />, title: "Tutoring", desc: "Academic, music, language lessons", count: "110+ providers", colorClass: "icon-purple" },
            { icon: <Car size={24} />, title: "Vehicle Repair", desc: "Mechanics, detailing, breakdown", count: "75+ providers", colorClass: "icon-red" },
            { icon: <Bug size={24} />, title: "Pest Control", desc: "Termites, rodents, insect removal", count: "60+ providers", colorClass: "icon-lime" }
          ].map((cat, idx) => (
            <div className="category-card lp-clickable" key={idx} onClick={openBooking}>
              <div className={`category-icon ${cat.colorClass}`}>
                {cat.icon}
              </div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
              <div className="category-stats">{cat.count}</div>
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
      />
    </div>
  );
};

export default LandingPage;
