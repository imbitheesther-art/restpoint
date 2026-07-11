import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PricingPage = () => {
    return (
        <>
            <Helmet>
                <title>Mortuary Software Pricing Kenya | Funeral Home Software Cost & Plans</title>
                <meta name="description" content="Rest Point offers affordable mortuary software pricing for funeral homes and mortuaries in Kenya. Transparent funeral home software cost with flexible plans. Starting from KES 9,200/month. Get a quote today." />
                <meta name="keywords" content="mortuary software pricing, funeral home software cost, mortuary software kenya, funeral home management software price, mortuary billing software cost, hearse management software pricing, best funeral home software pricing" />
                <link rel="canonical" href="https://restpoint.co.ke/pricing" />
            </Helmet>

            <div className="page-container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <h1>Mortuary Software Pricing Kenya</h1>
                        <p className="hero-subtitle">
                            Affordable Funeral Home Software Cost & Flexible Plans
                        </p>
                        <p className="hero-description">
                            Rest Point offers transparent <strong>mortuary software pricing</strong> designed to fit
                            organizations of all sizes. From small private mortuaries to large hospital morgues,
                            our <strong>funeral home software cost</strong> is competitive with no hidden fees.
                            Choose the plan that works best for you.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register" className="btn btn-primary">Start Free Trial</Link>
                            <Link to="/contact" className="btn btn-secondary">Get Custom Quote</Link>
                        </div>
                    </div>
                </section>

                {/* Pricing Plans */}
                <section className="pricing-section">
                    <div className="container">
                        <h2>Choose Your Plan</h2>
                        <div className="pricing-grid">
                            <div className="pricing-card">
                                <div className="pricing-header">
                                    <h3>Starter</h3>
                                    <p className="price">KES 9,200<span>/month</span></p>
                                    <p className="description">Perfect for small funeral homes</p>
                                </div>
                                <div className="pricing-features">
                                    <ul>
                                        <li>✅ Up to 100 cases/month</li>
                                        <li>✅ Basic mortuary management</li>
                                        <li>✅ M-Pesa integration</li>
                                        <li>✅ SMS notifications</li>
                                        <li>✅ Email support</li>
                                        <li>✅ 1 user account</li>
                                    </ul>
                                </div>
                                <Link to="/register" className="btn btn-primary btn-block">Get Started</Link>
                            </div>

                            <div className="pricing-card featured">
                                <div className="pricing-header">
                                    <h3>Professional</h3>
                                    <p className="price">KES 18,900<span>/month</span></p>
                                    <p className="description">For growing organizations</p>
                                </div>
                                <div className="pricing-features">
                                    <ul>
                                        <li>✅ Up to 500 cases/month</li>
                                        <li>✅ Full mortuary management</li>
                                        <li>✅ Hearse management</li>
                                        <li>✅ Advanced billing & reports</li>
                                        <li>✅ Priority support</li>
                                        <li>✅ 5 user accounts</li>
                                        <li>✅ Multi-branch support</li>
                                    </ul>
                                </div>
                                <Link to="/register" className="btn btn-primary btn-block">Start Free Trial</Link>
                            </div>

                            <div className="pricing-card">
                                <div className="pricing-header">
                                    <h3>Enterprise</h3>
                                    <p className="price">Custom</p>
                                    <p className="description">For large hospitals & chains</p>
                                </div>
                                <div className="pricing-features">
                                    <ul>
                                        <li>✅ Unlimited cases</li>
                                        <li>✅ All features included</li>
                                        <li>✅ Custom integrations</li>
                                        <li>✅ Dedicated account manager</li>
                                        <li>✅ 24/7 phone support</li>
                                        <li>✅ Unlimited users</li>
                                        <li>✅ On-premise option</li>
                                    </ul>
                                </div>
                                <Link to="/contact" className="btn btn-outline btn-block">Contact Sales</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Comparison */}
                <section className="comparison-section">
                    <div className="container">
                        <h2>Compare Plans & Features</h2>
                        <div className="comparison-table-wrapper">
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th>Feature</th>
                                        <th>Starter</th>
                                        <th>Professional</th>
                                        <th>Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Case Management</td>
                                        <td>Basic</td>
                                        <td>Advanced</td>
                                        <td>Full</td>
                                    </tr>
                                    <tr>
                                        <td>Billing & Invoicing</td>
                                        <td>✅</td>
                                        <td>✅</td>
                                        <td>✅</td>
                                    </tr>
                                    <tr>
                                        <td>M-Pesa Integration</td>
                                        <td>✅</td>
                                        <td>✅</td>
                                        <td>✅</td>
                                    </tr>
                                    <tr>
                                        <td>Hearse Management</td>
                                        <td>❌</td>
                                        <td>✅</td>
                                        <td>✅</td>
                                    </tr>
                                    <tr>
                                        <td>Multi-Branch</td>
                                        <td>❌</td>
                                        <td>✅</td>
                                        <td>✅</td>
                                    </tr>
                                    <tr>
                                        <td>Custom Reports</td>
                                        <td>❌</td>
                                        <td>✅</td>
                                        <td>✅</td>
                                    </tr>
                                    <tr>
                                        <td>API Access</td>
                                        <td>❌</td>
                                        <td>❌</td>
                                        <td>✅</td>
                                    </tr>
                                    <tr>
                                        <td>On-Premise Deployment</td>
                                        <td>❌</td>
                                        <td>❌</td>
                                        <td>✅</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="faq-section">
                    <div className="container">
                        <h2>Frequently Asked Questions</h2>
                        <div className="faq-list">
                            <div className="faq-item">
                                <h3>How much does mortuary management software cost in Kenya?</h3>
                                <p>
                                    Rest Point pricing starts from KES 9,200 per month for the Starter plan,
                                    KES 18,900 per month for the Professional plan, and custom pricing for
                                    Enterprise solutions. All plans include core features with no hidden fees.
                                </p>
                            </div>
                            <div className="faq-item">
                                <h3>Is there a free trial available?</h3>
                                <p>
                                    Yes! We offer a 14-day free trial for all new customers. Experience the
                                    full features of our Professional plan before making a commitment.
                                </p>
                            </div>
                            <div className="faq-item">
                                <h3>What payment methods do you accept?</h3>
                                <p>
                                    We accept M-Pesa, credit cards, bank transfers, and annual payment options.
                                    Annual payments receive a 20% discount.
                                </p>
                            </div>
                            <div className="faq-item">
                                <h3>Can I upgrade or downgrade my plan?</h3>
                                <p>
                                    Yes, you can change your plan at any time. Upgrades take effect immediately,
                                    and downgrades apply at the next billing cycle.
                                </p>
                            </div>
                            <div className="faq-item">
                                <h3>Do you offer discounts for non-profits?</h3>
                                <p>
                                    Yes, we offer special pricing for churches, NGOs, and non-profit organizations.
                                    Contact our sales team for more information.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="container">
                        <h2>Ready to Get Started?</h2>
                        <p>
                            Join 500+ organizations across Kenya that trust Rest Point. Start your
                            free trial today or contact us for a custom quote.
                        </p>
                        <div className="cta-buttons">
                            <Link to="/register" className="btn btn-primary btn-large">Start Free Trial</Link>
                            <Link to="/contact" className="btn btn-outline">Contact Sales</Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default PricingPage;