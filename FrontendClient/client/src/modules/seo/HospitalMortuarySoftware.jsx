import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const HospitalMortuarySoftware = () => {
    return (
        <>
            <Helmet>
                <title>Hospital Mortuary Software Kenya | Modern Morgue Management System</title>
                <meta name="description" content="Rest Point is Kenya's leading hospital mortuary software and morgue management system. Purpose-built for hospital morgues with mortuary technology, case tracking, and compliance management. Trusted by major hospitals in Nairobi, Mombasa, Kisumu." />
                <meta name="keywords" content="hospital mortuary software, hospital morgue software, mortuary technology, morgue management system, mortuary software, mortuary case management, hospital mortuary system, best mortuary software kenya, mortuary information system" />
                <link rel="canonical" href="https://restpoint.co.ke/hospital-mortuary-software" />
            </Helmet>

            <div className="page-container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <h1>Hospital Mortuary Software Kenya</h1>
                        <p className="hero-subtitle">
                            Modern Morgue Management System for Healthcare Facilities
                        </p>
                        <p className="hero-description">
                            Rest Point is Kenya's premier <strong>hospital mortuary software</strong>, designed specifically
                            for hospital morgues and healthcare facilities. Our comprehensive <strong>morgue management system</strong>
                            combines mortuary technology with healthcare compliance to deliver a complete
                            <strong> mortuary information system</strong> that meets the unique demands of hospital operations.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register" className="btn btn-primary">Request Demo</Link>
                            <Link to="/contact" className="btn btn-secondary">Contact Sales</Link>
                        </div>
                    </div>
                </section>

                {/* What is Hospital Mortuary Software */}
                <section className="content-section">
                    <div className="container">
                        <h2>What is Hospital Mortuary Software?</h2>
                        <p>
                            <strong>Hospital mortuary software</strong> is a specialized digital solution designed to manage
                            the unique requirements of hospital-based morgues. Unlike generic mortuary software,
                            <strong> hospital morgue software</strong> must integrate with hospital systems, handle high-volume
                            cases, manage multiple cold rooms, and comply with healthcare regulations.
                        </p>
                        <p>
                            Modern <strong>mortuary technology</strong> for hospitals includes features like integration with
                            hospital information systems (HIS), electronic health records (EHR), pathology lab systems,
                            and billing departments. Rest Point's <strong>mortuary case management</strong> capabilities
                            ensure seamless coordination between the mortuary and other hospital departments.
                        </p>
                    </div>
                </section>

                {/* Key Features */}
                <section className="features-section">
                    <div className="container">
                        <h2>Key Features of Our Hospital Mortuary Management System</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <h3>HIS Integration</h3>
                                <p>
                                    Seamlessly integrate with hospital information systems for automatic patient
                                    data transfer, reducing manual entry and ensuring data accuracy across departments.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>Multi-Cold Room Management</h3>
                                <p>
                                    Monitor and manage multiple cold rooms with different temperature zones.
                                    Track body locations, storage duration, and capacity in real-time.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>Autopsy & Pathology Tracking</h3>
                                <p>
                                    Manage autopsy requests, track pathology samples, and coordinate with
                                    laboratory systems for comprehensive case documentation.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>High-Volume Case Handling</h3>
                                <p>
                                    Handle peak loads during emergencies, epidemics, or disasters with
                                    batch processing, queue management, and priority case handling.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>Identity Verification</h3>
                                <p>
                                    Implement robust identification protocols with biometric verification,
                                    photo documentation, and next-of-kin confirmation workflows.
                                </p>
                            </div>
                            <div className="feature-card">
                                <h3>Compliance & Reporting</h3>
                                <p>
                                    Generate mandatory reports for health authorities, track notifiable diseases,
                                    and maintain compliance with Kenyan healthcare regulations.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="benefits-section">
                    <div className="container">
                        <h2>Why Choose Rest Point for Hospital Morgues?</h2>
                        <div className="benefits-list">
                            <div className="benefit-item">
                                <h3>🏥 Healthcare-Focused</h3>
                                <p>
                                    Purpose-built for hospital environments with integration capabilities
                                    for HIS, EHR, and laboratory information management systems.
                                </p>
                            </div>
                            <div className="benefit-item">
                                <h3>⚡ High Performance</h3>
                                <p>
                                    Handle thousands of cases annually with our robust, scalable platform
                                    designed for high-volume hospital mortuary operations.
                                </p>
                            </div>
                            <div className="benefit-item">
                                <h3>🔒 HIPAA & Data Protection Compliant</h3>
                                <p>
                                    Meet healthcare data protection requirements with end-to-end encryption,
                                    audit trails, and role-based access controls.
                                </p>
                            </div>
                            <div className="benefit-item">
                                <h3>📊 Real-Time Dashboards</h3>
                                <p>
                                    Give hospital administrators real-time visibility into mortuary operations,
                                    capacity, and performance metrics.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section className="use-cases-section">
                    <div className="container">
                        <h2>Trusted by Leading Healthcare Facilities</h2>
                        <div className="use-cases-grid">
                            <div className="use-case-card">
                                <h3>National Hospitals</h3>
                                <p>
                                    Kenyatta National Hospital, Moi Teaching and Referral Hospital, and other
                                    major hospitals use Rest Point to manage complex mortuary operations.
                                </p>
                            </div>
                            <div className="use-case-card">
                                <h3>County Hospitals</h3>
                                <p>
                                    County referral hospitals across Kenya rely on our software to standardize
                                    mortuary operations and improve service delivery.
                                </p>
                            </div>
                            <div className="use-case-card">
                                <h3>Private Hospitals</h3>
                                <p>
                                    Private healthcare facilities use Rest Point to provide premium mortuary
                                    services while maintaining operational efficiency.
                                </p>
                            </div>
                            <div className="use-case-card">
                                <h3>Mission Hospitals</h3>
                                <p>
                                    Faith-based and mission hospitals trust Rest Point for affordable,
                                    reliable mortuary management that aligns with their service mission.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="container">
                        <h2>Upgrade Your Hospital Mortuary Operations</h2>
                        <p>
                            Join leading hospitals across Kenya that trust Rest Point for their mortuary
                            management needs. Schedule a demo to see our hospital mortuary software in action.
                        </p>
                        <div className="cta-buttons">
                            <Link to="/register" className="btn btn-primary btn-large">Schedule Demo</Link>
                            <Link to="/mortuary-management-software" className="btn btn-outline">Learn More</Link>
                        </div>
                    </div>
                </section>

                {/* Related Articles */}
                <section className="related-section">
                    <div className="container">
                        <h2>Related Resources</h2>
                        <div className="related-links">
                            <Link to="/mortuary-management-software">Mortuary Management Software</Link>
                            <Link to="/blog/functions-of-mortuary-department">Functions of Mortuary Department</Link>
                            <Link to="/hearse-management">Hearse Management Software</Link>
                            <Link to="/blog/what-is-mortuary-management-system">What is a Mortuary Management System?</Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default HospitalMortuarySoftware;