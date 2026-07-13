import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowRight, ChevronRight, ExternalLink, Check, X, Star,
    Users, MessageSquare, Headphones, Zap, Shield
} from 'lucide-react';

const C = {
    ink: '#1A1A1A',
    bone: '#FAF8F4',
    white: '#FFFFFF',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    brassPale: 'rgba(139,115,85,0.08)',
    brassPaleBorder: 'rgba(139,115,85,0.15)',
    verdigris: '#3D4F47',
    verdigrisLight: '#4D6359',
    verdigrisPale: 'rgba(61,79,71,0.06)',
    accent: '#C77B5E',
    accentPale: 'rgba(199,123,94,0.08)',
    line: '#E8E4DD',
    lineLight: 'rgba(0,0,0,0.06)',
    lineMid: 'rgba(0,0,0,0.09)',
    text: '#1A1A1A',
    textSec: '#5C5C5C',
    textTer: '#8A8780',
    textQuat: '#AAAAAA',
};

const useInView = (threshold = 0.1) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
};

const FadeUp = ({ children, delay = 0, className = '' }) => {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(40px)',
                transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};

const SectionLabel = ({ children }) => (
    <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: C.brass, marginBottom: '1.25rem',
    }}>
        <span style={{ width: 24, height: 1, background: C.brass, display: 'inline-block' }} />
        {children}
    </div>
);

const SectionHeading = ({ children, sub }) => (
    <div style={{ marginBottom: '3.5rem' }}>
        <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: C.text, fontWeight: 500, lineHeight: 1.2,
            letterSpacing: '-0.02em', marginBottom: sub ? '1rem' : 0,
        }}>{children}</h2>
        {sub && <p style={{ fontSize: '1.05rem', color: C.textSec, lineHeight: 1.7, maxWidth: 620 }}>{sub}</p>}
    </div>
);

const PricingPage = () => {
    const plans = [
        {
            name: 'Starter',
            price: 'KES 9,200',
            period: '/month',
            desc: 'Perfect for small funeral homes & private mortuaries',
            featured: false,
            features: [
                'Up to 100 cases/month',
                'Basic mortuary management',
                'M-Pesa integration',
                'SMS notifications',
                'Up to 20 user accounts',
                'Standard Support (Email & Chat)',
            ],
            cta: 'Start Free Trial',
            link: '/register'
        },
        {
            name: 'Professional',
            price: 'KES 18,900',
            period: '/month',
            desc: 'For growing organizations & multi-branch operations',
            featured: true,
            features: [
                'Up to 500 cases/month',
                'Full mortuary management',
                'Hearse management & GPS',
                'Advanced billing & reports',
                'Up to 50 user accounts',
                'Standard Support (Email, Chat & Phone)',
                'Multi-branch support',
            ],
            cta: 'Start Free Trial',
            link: '/register'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            desc: 'For large hospitals, chains & government contracts',
            featured: false,
            features: [
                'Unlimited cases',
                'All features included',
                'Custom API integrations',
                'Dedicated account manager',
                'Unlimited user accounts',
                'Priority 24/7 Support',
                'On-premise deployment option',
            ],
            cta: 'Contact Sales',
            link: '/contact'
        }
    ];

    const comparisons = [
        { feature: 'Case Management', starter: 'Basic', pro: 'Advanced', enterprise: 'Full' },
        { feature: 'Billing & Invoicing', starter: true, pro: true, enterprise: true },
        { feature: 'M-Pesa Integration', starter: true, pro: true, enterprise: true },
        { feature: 'Hearse Management', starter: false, pro: true, enterprise: true },
        { feature: 'Multi-Branch Support', starter: false, pro: true, enterprise: true },
        { feature: 'Custom Reports', starter: false, pro: true, enterprise: true },
        { feature: 'API Access', starter: false, pro: false, enterprise: true },
        { feature: 'On-Premise Deployment', starter: false, pro: false, enterprise: true },
        { feature: 'User Accounts', starter: 'Up to 20', pro: 'Up to 50', enterprise: 'Unlimited' },
        { feature: 'Support Level', starter: 'Standard', pro: 'Standard', enterprise: 'Priority/Dedicated' },
    ];

    const faqs = [
        { q: 'How much does mortuary management software cost in Kenya?', a: 'Rest Point pricing starts from KES 9,200 per month for the Starter plan, KES 18,900 per month for the Professional plan, and custom pricing for Enterprise solutions. All plans include core features with no hidden fees.' },
        { q: 'Is there a free trial available?', a: 'Yes! We offer a 14-day free trial for all new customers. You can experience the full features of our Professional plan before making a commitment, no credit card required.' },
        { q: 'What payment methods do you accept?', a: 'We accept M-Pesa, credit cards, bank transfers, and annual payment options. Annual payments receive a 20% discount.' },
        { q: 'Can I upgrade or downgrade my plan?', a: 'Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the next billing cycle. We make it completely frictionless.' },
        { q: 'Do you offer discounts for non-profits?', a: 'Yes, we offer special pricing for churches, NGOs, and non-profit organizations. Contact our sales team for more information on our welfare and faith-based discounts.' },
        { q: 'How many users can I add to the Starter plan?', a: 'The Starter plan includes up to 20 user accounts at no extra cost. We believe even small teams need proper access controls without being penalized.' },
    ];

    const renderCell = (val) => {
        if (val === true) return <Check size={16} className="pr-icon-yes" />;
        if (val === false) return <X size={16} className="pr-icon-no" />;
        return <span style={{ color: C.text, fontWeight: 500 }}>{val}</span>;
    };

    return (
        <>
            <Helmet>
                <title>Mortuary Software Pricing Kenya | Funeral Home Software Cost & Plans</title>
                <meta name="description" content="Rest Point offers affordable mortuary software pricing for funeral homes and mortuaries in Kenya. Transparent funeral home software cost with flexible plans. Starting from KES 9,200/month. Get a quote today." />
                <meta name="keywords" content="mortuary software pricing, funeral home software cost, mortuary software kenya, funeral home management software price, mortuary billing software cost, hearse management software pricing, best funeral home software pricing" />
                <link rel="canonical" href="https://restpoint.co.ke/pricing" />
            </Helmet>

            <div className="pr-page">
                <style>{`
                    .pr-page {
                        background: ${C.white};
                        color: ${C.textSec};
                        font-family: 'Inter', sans-serif;
                        overflow-x: hidden;
                    }
                    .pr-page .pr-container {
                        max-width: 1180px;
                        margin: 0 auto;
                        padding: 0 clamp(1.25rem, 5vw, 2.5rem);
                    }
                    .pr-page a { text-decoration: none; }
                    .pr-divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.line} 20%, ${C.line} 80%, transparent);
                    }

                    /* Hero */
                    .pr-hero {
                        position: relative;
                        padding: clamp(5rem, 10vw, 8rem) 0 clamp(4rem, 8vw, 6rem);
                        overflow: hidden;
                        background: ${C.bone};
                        text-align: center;
                    }
                    .pr-hero-glow {
                        position: absolute; inset: 0;
                        background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,115,85,0.1) 0%, transparent 60%);
                        pointer-events: none;
                    }
                    .pr-hero-grid {
                        position: absolute; inset: 0;
                        background-image: linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
                        background-size: 48px 48px;
                        mask-image: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 60%);
                        pointer-events: none;
                    }
                    .pr-hero-content { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; }
                    .pr-hero h1 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(2.2rem, 5vw, 3.4rem);
                        color: ${C.text}; font-weight: 500;
                        line-height: 1.1; letter-spacing: '-0.03em';
                        margin-bottom: 1.25rem;
                    }
                    .pr-hero h1 span {
                        background: linear-gradient(135deg, ${C.brass}, ${C.accent});
                        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    .pr-hero-sub {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.85rem; color: ${C.brass};
                        margin-bottom: 1.5rem; letter-spacing: '0.04em';
                    }
                    .pr-hero-desc {
                        font-size: 1.05rem; color: ${C.textSec};
                        line-height: 1.8; margin-bottom: 2.5rem;
                    }
                    .pr-hero-desc strong { color: ${C.text}; font-weight: 600; }
                    .pr-hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    .pr-btn-primary {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: ${C.brass}; color: ${C.white}; border: none;
                        padding: 0.85rem 2rem; border-radius: 8px;
                        font-size: 0.9rem; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif; transition: all 0.25s ease;
                    }
                    .pr-btn-primary:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,115,85,0.25); }
                    
                    .pr-btn-outline {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.textSec};
                        border: 1px solid ${C.line}; padding: 0.85rem 2rem;
                        border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s ease;
                    }
                    .pr-btn-outline:hover { border-color: ${C.textTer}; color: ${C.text}; transform: translateY(-2px); }

                    /* Plans Grid */
                    .pr-plans { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .pr-plans-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.5rem;
                        align-items: stretch;
                    }
                    .pr-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 16px;
                        padding: 2.5rem 2rem;
                        display: flex; flex-direction: column;
                        transition: all 0.35s ease;
                        position: relative;
                    }
                    .pr-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.06); border-color: ${C.lineMid}; }
                    
                    .pr-card--featured {
                        background: ${C.ink};
                        border-color: ${C.brass};
                        color: ${C.bone};
                        box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                        z-index: 2;
                    }
                    .pr-card--featured:hover { box-shadow: 0 24px 60px rgba(0,0,0,0.2); border-color: ${C.brassLight}; }
                    
                    .pr-card-badge {
                        position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
                        background: ${C.brass}; color: ${C.white};
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase;
                        padding: 0.4rem 1rem; border-radius: 20px;
                        display: flex; align-items: center; gap: 0.4rem;
                        box-shadow: 0 4px 12px rgba(139,115,85,0.3);
                    }
                    
                    .pr-card h3 {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
                        color: ${C.textTer}; margin-bottom: 1rem;
                    }
                    .pr-card--featured h3 { color: ${C.brassLight}; }
                    
                    .pr-card-price {
                        font-family: 'Fraunces', serif;
                        font-size: 2.2rem; color: ${C.text};
                        font-weight: 500; line-height: 1; margin-bottom: 0.5rem;
                    }
                    .pr-card--featured .pr-card-price { color: ${C.bone}; }
                    .pr-card-price span { font-size: 1rem; font-weight: 400; color: ${C.textTer}; }
                    .pr-card--featured .pr-card-price span { color: ${C.textQuat}; }
                    
                    .pr-card-desc { font-size: 0.9rem; margin-bottom: 2rem; line-height: 1.5; padding-bottom: 2rem; border-bottom: 1px solid ${C.line}; }
                    .pr-card--featured .pr-card-desc { border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); }
                    
                    .pr-card-list { list-style: none; padding: 0; margin: 0 0 2rem 0; flex: 1; display: flex; flex-direction: column; gap: 0.85rem; }
                    .pr-card-list li {
                        display: flex; align-items: flex-start; gap: 0.75rem;
                        font-size: 0.9rem; line-height: 1.4;
                    }
                    .pr-card-list svg { flex-shrink: 0; margin-top: 2px; }
                    .pr-card--featured .pr-card-list li { color: rgba(255,255,255,0.8); }
                    
                    .pr-icon-yes { color: ${C.verdigris}; }
                    .pr-card--featured .pr-icon-yes { color: #6EE7B7; }
                    
                    .pr-card-btn {
                        display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                        width: 100%; padding: 0.9rem; border-radius: 8px;
                        font-size: 0.9rem; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif; transition: all 0.25s ease; border: none;
                    }
                    .pr-card-btn--primary { background: ${C.brass}; color: ${C.white}; }
                    .pr-card-btn--primary:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(139,115,85,0.3); }
                    .pr-card-btn--outline { background: transparent; color: ${C.textSec}; border: 1px solid ${C.line}; }
                    .pr-card-btn--outline:hover { border-color: ${C.textTer}; color: ${C.text}; }
                    .pr-card-btn--dark { background: ${C.white}; color: ${C.ink}; }
                    .pr-card-btn--dark:hover { background: ${C.bone}; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,255,255,0.1); }

                    /* Comparison */
                    .pr-comparison { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.bone}; }
                    .pr-table-wrap {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 14px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                        overflow-x: auto;
                    }
                    .pr-table { width: 100%; border-collapse: collapse; min-width: 600px; }
                    .pr-table thead { background: ${C.bone}; }
                    .pr-table th {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
                        color: ${C.textTer}; font-weight: 600;
                        padding: 1.1rem 1.5rem; text-align: left;
                        border-bottom: 1px solid ${C.line};
                    }
                    .pr-table th:not(:first-child) { text-align: center; }
                    .pr-table td {
                        padding: 1rem 1.5rem; font-size: 0.9rem;
                        border-bottom: 1px solid ${C.lineLight}; color: ${C.textSec};
                        transition: background 0.2s;
                    }
                    .pr-table tr:last-child td { border-bottom: none; }
                    .pr-table tr:hover td { background: rgba(139,115,85,0.03); }
                    .pr-table td:first-child { color: ${C.text}; font-weight: 500; }
                    .pr-table td:not(:first-child) { text-align: center; }
                    .pr-icon-no { color: ${C.textQuat}; opacity: 0.5; }

                    /* FAQ */
                    .pr-faq { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .pr-faq-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
                    .pr-faq-item {
                        background: ${C.bone}; border: 1px solid ${C.line};
                        border-radius: 12px; padding: 1.75rem;
                        transition: all 0.3s ease;
                    }
                    .pr-faq-item:hover { border-color: ${C.lineMid}; box-shadow: 0 4px 16px rgba(0,0,0,0.03); }
                    .pr-faq-item h3 {
                        font-size: 1rem; color: ${C.text}; font-weight: 600;
                        margin-bottom: 0.75rem; line-height: 1.4;
                    }
                    .pr-faq-item p { font-size: 0.9rem; color: ${C.textTer}; line-height: 1.7; }

                    /* CTA */
                    .pr-cta { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.bone}; }
                    .pr-cta-box {
                        position: relative; background: linear-gradient(135deg, ${C.white} 0%, ${C.bone} 100%);
                        border: 1px solid ${C.line}; border-radius: 20px;
                        padding: clamp(3rem, 6vw, 5rem); text-align: center; overflow: hidden;
                    }
                    .pr-cta-box::before {
                        content: ''; position: absolute; inset: 0;
                        background: radial-gradient(ellipse 60% 50% at 80% 20%, rgba(139,115,85,0.08) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .pr-cta-box::after {
                        content: ''; position: absolute; inset: 0;
                        background-image: linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
                        background-size: 32px 32px; pointer-events: none;
                        mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                    }
                    .pr-cta-content { position: relative; z-index: 2; }
                    .pr-cta-box h2 { font-family: 'Fraunces', serif; font-size: clamp(1.8rem, 4vw, 2.5rem); color: ${C.text}; font-weight: 500; margin-bottom: 1rem; }
                    .pr-cta-box p { font-size: 1.05rem; color: ${C.textSec}; line-height: 1.7; max-width: 560px; margin: 0 auto 2.5rem; }
                    .pr-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    @media (max-width: 900px) {
                        .pr-plans-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
                        .pr-faq-grid { grid-template-columns: 1fr; }
                    }
                `}</style>

                {/* ═══ HERO ═══ */}
                <section className="pr-hero">
                    <div className="pr-hero-glow" />
                    <div className="pr-hero-grid" />
                    <div className="pr-container">
                        <div className="pr-hero-content">
                            <FadeUp>
                                <h1><span>Mortuary Software</span> Pricing Kenya</h1>
                            </FadeUp>
                            <FadeUp delay={100}>
                                <div className="pr-hero-sub">Affordable Funeral Home Software Cost & Flexible Plans</div>
                            </FadeUp>
                            <FadeUp delay={200}>
                                <p className="pr-hero-desc">
                                    Rest Point offers transparent <strong>mortuary software pricing</strong> designed to fit
                                    organizations of all sizes. From small private mortuaries to large hospital morgues,
                                    our <strong>funeral home software cost</strong> is competitive with no hidden fees.
                                </p>
                            </FadeUp>
                            <FadeUp delay={300}>
                                <div className="pr-hero-buttons">
                                    <Link to="/register" className="pr-btn-primary">Start 14-Day Free Trial <ArrowRight size={16} /></Link>
                                    <Link to="/contact" className="pr-btn-outline">Get Custom Quote</Link>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <div className="pr-divider" />

                {/* ═══ PLANS ═══ */}
                <section className="pr-plans">
                    <div className="pr-container">
                        <FadeUp>
                            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                                <SectionLabel>Plans</SectionLabel>
                                <SectionHeading sub="Fair pricing, generous limits. Start small, scale effortlessly.">Choose Your Plan</SectionHeading>
                            </div>
                        </FadeUp>

                        <div className="pr-plans-grid">
                            {plans.map((plan, i) => (
                                <FadeUp key={i} delay={i * 120}>
                                    <div className={`pr-card ${plan.featured ? 'pr-card--featured' : ''}`}>
                                        {plan.featured && (
                                            <div className="pr-card-badge">
                                                <Star size={12} /> Most Popular
                                            </div>
                                        )}
                                        <h3>{plan.name}</h3>
                                        <div className="pr-card-price">
                                            {plan.price}<span>{plan.period}</span>
                                        </div>
                                        <p className="pr-card-desc">{plan.desc}</p>
                                        <ul className="pr-card-list">
                                            {plan.features.map((f, j) => (
                                                <li key={j}>
                                                    <Check size={16} className="pr-icon-yes" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link to={plan.link} className={`pr-card-btn ${plan.featured ? 'pr-card-btn--dark' : (plan.name === 'Enterprise' ? 'pr-card-btn--outline' : 'pr-card-btn--primary')}`}>
                                            {plan.cta} <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="pr-divider" />

                {/* ═══ COMPARISON ═══ */}
                <section className="pr-comparison">
                    <div className="pr-container">
                        <FadeUp>
                            <SectionLabel>Details</SectionLabel>
                            <SectionHeading sub="A transparent look at what’s included in every tier.">Compare Plans & Features</SectionHeading>
                        </FadeUp>

                        <FadeUp delay={150}>
                            <div className="pr-table-wrap">
                                <table className="pr-table">
                                    <thead>
                                        <tr>
                                            <th>Feature</th>
                                            <th>Starter</th>
                                            <th>Professional</th>
                                            <th>Enterprise</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisons.map((row, i) => (
                                            <tr key={i}>
                                                <td>{row.feature}</td>
                                                <td>{renderCell(row.starter)}</td>
                                                <td>{renderCell(row.pro)}</td>
                                                <td>{renderCell(row.enterprise)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                <div className="pr-divider" />

                {/* ═══ FAQ ═══ */}
                <section className="pr-faq">
                    <div className="pr-container">
                        <FadeUp>
                            <SectionLabel>FAQ</SectionLabel>
                            <SectionHeading sub="Everything you need to know about our pricing and plans.">Frequently Asked Questions</SectionHeading>
                        </FadeUp>

                        <div className="pr-faq-grid">
                            {faqs.map((faq, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <div className="pr-faq-item">
                                        <h3>{faq.q}</h3>
                                        <p>{faq.a}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="pr-divider" />

                {/* ═══ CTA ═══ */}
                <section className="pr-cta">
                    <div className="pr-container">
                        <FadeUp>
                            <div className="pr-cta-box">
                                <div className="pr-cta-content">
                                    <h2>Ready to Get Started?</h2>
                                    <p>
                                        Join 500+ organizations across Kenya that trust Rest Point. Start your
                                        free trial today or contact us for a custom quote.
                                    </p>
                                    <div className="pr-cta-buttons">
                                        <Link to="/register" className="pr-btn-primary">Start 14-Day Free Trial <ArrowRight size={16} /></Link>
                                        <Link to="/contact" className="pr-btn-outline">Contact Sales <ExternalLink size={14} /></Link>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>
            </div>
        </>
    );
};

export default PricingPage;