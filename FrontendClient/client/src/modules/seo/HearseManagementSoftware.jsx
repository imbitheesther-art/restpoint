import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const HearseManagementSoftware = () => {
    return (
        <>
            <Helmet>
                <title>Hearse Management Software Kenya | Mortuary Transport Software & Fleet Management</title>
                <meta name="description" content="Rest Point is Kenya's leading hearse management software and mortuary transport software. Complete fleet management system for funeral homes and mortuaries. Dispatch, routing, and scheduling optimized for Kenyan operations." />
                <meta name="keywords" content="hearse management software, mortuary transport software, fleet management, hearse dispatch software, mortuary hearse management, funeral transport software, hearse scheduling system, mortuary vehicle management" />
                <link rel="canonical" href="https://restpoint.co.ke/hearse-management" />
            </Helmet>

            <div className="page-container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <h1>Hearse Management Software Kenya</h1>
                        <p className="hero-subtitle">
                            Complete Mortuary Transport Software & Fleet Management System
                        </p>
                        <p className="hero-description">
                            Rest Point is Kenya's premier <strong>hearse management software</strong>, providing a comprehensive
                            <strong> mortuary transport software</strong> solution for funeral homes and mortuaries. Our
                            intelligent <strong>fleet management</strong> system optimizes hearse dispatch, routing, and scheduling
                            to ensure dignified and efficient transportation services.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register" className="btn btn-primary">Request Demo</Link>
                            <Link to="/contact" className="btn btn-secondary">Contact Sales</Link>
                        </div>
                    </div>
                </section>

                {/* What is Hearse Management Software */}
                <section className="content-section">
                    <div className="container">
                        <h2>What is Hearse Management Software?</h2>
                        <p>
                            <strong>Hearse management software</strong> is a specialized fleet management solution designed
                            for funeral homes, mortuaries, and funeral service providers. Modern <strong>mortuary transport
                                software</strong> goes beyond simple vehicle tracking to provide intelligent dispatch, route
                            optimization, and coordinated scheduling for sensitive body transportation.
                        </p>
                        <p>
                            The <strong>best hearse management software</strong> like Rest Point integrates with your mortuary
                            management system to coordinate body releases, schedule transports, manage driver assignments,
                            and maintain complete service records. Whether you operate one hearse or a fleet of vehicles
                            across Kenya, our software scales with your needs.
                        </p>
                    </div>
                </section>

                {/* Key Features */}
                <section className="features-section">
                    <div className="container">
                        <h2>Key Features of Our Hearse Management System</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <h3>Intelligent Dispatch</h3>
                                <p>
                                    Automatically assign the nearest available hearse and driver based on location,
                                    vehicle capacity, and special requirements (refrigeration, escort vehicles, etc.).
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>GPS Tracking & Route Optimization</h3>
                                <p>
                                    Track all hearses in real-time with GPS. Optimize routes considering traffic,
                                    distance, and urgency to ensure timely and dignified transportation.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>Driver Management</h3>
                                <p>
                                    Manage driver schedules, certifications, and availability. Track driving hours
                                    and ensure compliance with Kenyan transport regulations.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>Vehicle Maintenance Tracking</h3>
                                <p>
                                    Monitor vehicle health, schedule maintenance, track service history, and
                                    manage insurance and documentation for your fleet.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>Family Communication</h3>
                                <p>
                                    Send automated SMS notifications to families with driver details, estimated
                                    arrival times, and real-time tracking links.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>Billing & Documentation</h3>
                                <p>
                                    Generate transport invoices, maintain service logs, and integrate with
                                    mortuary billing for seamless financial management.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="benefits-section">
                    <div className="container">
                        <h2>Why Choose Rest Point Hearse Management Software?</h2>
                        <div className="benefits-list">
                            <div className="benefit-item">
                                <h3>🚗 Optimized Fleet Utilization</h3>
                                <p>
                                    Reduce fuel costs and vehicle wear with intelligent route optimization.
                                    Increase fleet capacity by 30-40% with better scheduling.
                                </p>
                            </div>
                            <div className="benefit-item">
                                <h3>📍 Real-Time Visibility</h3>
                                <p>
                                    Monitor all transports in real-time. Know exactly where each hearse is,
                                    its status, and estimated completion time.
                                </p>
                            </div>
                            <div className="benefit-item">
                                <h3>👨‍👩‍👧 Family Satisfaction</h3>
                                <p>
                                    Keep families informed with proactive notifications. Reduce anxiety with
                                    accurate ETAs and transparent communication.
                                </p>
                            </div>
                            <div className="benefit-item">
                                <h3>📊 Complete Audit Trail</h3>
                                <p>
                                    Maintain comprehensive records of all transports for compliance, billing,
                                    and quality assurance purposes.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section className="use-cases-section">
                    <div className="container">
                        <h2>Who Uses Our Hearse Management Software?</h2>
                        <div className="use-cases-grid">
                            <div className="use-case-card">
                                <h3>Funeral Homes</h3>
                                <p>
                                    Funeral homes across Kenya use Rest Point to manage their hearse fleets,
                                    coordinate with families, and ensure timely body transportation.
                                </p>
                            </div>
                            <div className="use-case-card">
                                <h3>Hospital Morgues</h3>
                                <p>
                                    Hospital mortuaries use our software to manage body transfers to funeral
                                    homes, coordinate with families, and track inter-county transports.
                                </p>
                            </div>
                            <div className="use-case-card">
                                <h3>Private Mortuaries</h3>
                                <p>
                                    Independent mortuary operators rely on Rest Point to offer premium
                                    transportation services and compete with larger facilities.
                                </p>
                            </div>
                            <div className="use-case-card">
                                <h3>County Governments</h3>
                                <p>
                                    County mortuary services use our fleet management system to coordinate
                                    body transportation across multiple locations within the county.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="container">
                        <h2>Ready to Optimize Your Hearse Fleet Operations?</h2>
                        <p>
                            Join funeral homes and mortuaries across Kenya that trust Rest Point for
                            their hearse management needs. Get started with a free demo today.
                        </p>
                        <div className="cta-buttons">
                            <Link to="/register" className="btn btn-primary btn-large">Get Free Demo</Link>
                            <Link to="/pricing" className="btn btn-outline">View Pricing</Link>
                        </div>
                    </div>
                </section>

                {/* Related Articles */}
                <section className="related-section">
                    <div className="container">
                        <h2>Learn More About Mortuary Transport</h2>
                        <div className="related-links">
                            <Link to="/mortuary-management-software">Mortuary Management Software</Link>
                            <Link to="/blog/innovations-in-funeral-industry">Innovations in Funeral Industry</Link>
                            <Link to="/mortuary-billing">Mortuary Billing Software</Link>
                            <Link to="/blog/how-to-manage-funeral-home">How to Manage a Funeral Home</Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default HearseManagementSoftware;