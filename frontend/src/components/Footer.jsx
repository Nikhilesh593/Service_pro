import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Main Footer Content */}
                <div className="footer-content">
                    {/* Company Section */}
                    <div className="footer-section">
                        <h3 className="footer-title">Company</h3>
                        <ul className="footer-links">
                            <li><a href="#about">About us</a></li>
                            <li><a href="#investor">Investor Relations</a></li>
                            <li><a href="#terms">Terms & conditions</a></li>
                            <li><a href="#privacy">Privacy policy</a></li>
                            <li><a href="#discrimination">Anti-discrimination policy</a></li>
                            <li><a href="#careers">Careers</a></li>
                        </ul>
                    </div>

                    {/* For Customers Section */}
                    <div className="footer-section">
                        <h3 className="footer-title">For customers</h3>
                        <ul className="footer-links">
                            <li><a href="#reviews">Service reviews</a></li>
                            <li><a href="#categories">Categories near you</a></li>
                            <li><a href="#contact">Contact us</a></li>
                        </ul>
                    </div>

                    {/* For Professionals Section */}
                    <div className="footer-section">
                        <h3 className="footer-title">For professionals</h3>
                        <ul className="footer-links">
                            <li><a href="#register">Register as a professional</a></li>
                        </ul>
                    </div>

                    {/* Social Links & Downloads */}
                    <div className="footer-section">
                        <h3 className="footer-title">Social links</h3>
                        <div className="social-links">
                            <a href="#twitter" className="social-icon" title="Twitter">
                                <Mail size={20} />
                            </a>
                            <a href="#info" className="social-icon" title="Info">
                                <Phone size={20} />
                            </a>
                            <a href="#github" className="social-icon" title="GitHub">
                                <MapPin size={20} />
                            </a>
                            <a href="#linkedin" className="social-icon" title="LinkedIn">
                                <ArrowRight size={20} />
                            </a>
                        </div>
                        <div className="app-downloads">
                            <a href="#appstore" className="app-store-badge">
                                <svg viewBox="0 0 100 40" width="120" height="48">
                                    <rect width="100" height="40" fill="#000" rx="4" />
                                    <text x="50" y="24" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="600">
                                        App Store
                                    </text>
                                </svg>
                            </a>
                            <a href="#googleplay" className="google-play-badge">
                                <svg viewBox="0 0 100 40" width="120" height="48">
                                    <rect width="100" height="40" fill="#000" rx="4" />
                                    <text x="50" y="24" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="600">
                                        Google Play
                                    </text>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <p className="footer-date">* As on December 31, 2024</p>
                    <p className="footer-copyright">
                        © Copyright 2026 Service Pro Limited. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
