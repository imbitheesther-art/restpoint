import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <>
            <SEOHead
                title="RestPoint - Professional Funeral Management System"
                description="Streamline funeral home operations with RestPoint. Manage bookings, deceased records, invoices, and family communications all in one comprehensive platform."
                keywords="funeral home software, funeral management, memorial services, bereavement management, funeral home CRM"
                url="/"
                type="website"
            />

            <div className="landing-page">
                {/* Hero Section */}
                <section className="hero">
                    <div className="container">
                        <h1>Professional Funeral Management Made Simple</h1>
                        <p className="hero-subtitle">
                            RestPoint helps funeral homes streamline operations, manage bookings,
                            and provide compassionate care to families during difficult times.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/login" className="btn btn-primary">
                                Get Started
                            </Link>
                            <Link to="/about" className="btn btn-secondary">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features">
                    <div className="container">
                        <h2>Everything You Need in One Platform</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <h3>📋 Deceased Management</h3>
                                <p>Complete digital records with document management and family communications</p>
                            </div>
                            <div className="feature-card">
                                <h3>📅 Smart Scheduling</h3>
                                <p>Manage bookings, hearse services, and chapel availability with ease</p>
                            </div>
                            <div className="feature-card">
                                <h3>💰 Billing & Invoicing</h3>
                                <p>Automated invoicing, M-Pesa integration, and financial tracking</p>
                            </div>
                            <div className="feature-card">
                                <h3>👥 Staff Management</h3>
                                <p>Employee scheduling, leave management, and performance tracking</p>
                            </div>
                            <div className="feature-card">
                                <h3>📊 Analytics & Reports</h3>
                                <p>Real-time insights into operations, revenue, and service quality</p>
                            </div>
                            <div className="feature-card">
                                <h3>🔒 Secure & Compliant</h3>
                                <p>Enterprise-grade security with multi-tenant data isolation</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta">
                    <div className="container">
                        <h2>Ready to Transform Your Funeral Home Operations?</h2>
                        <p>Join funeral homes across Kenya using RestPoint to deliver better service</p>
                        <Link to="/contact" className="btn btn-primary btn-large">
                            Contact Us Today
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer">
                    <div className="container">
                        <p>&copy; 2024 RestPoint. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingPage;