import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Clock, FileText, Users, TrendingUp, ArrowRight, Mail, Phone, MapPin, ChevronDown, Lock, Box, Zap, Wallet, Calendar, PieChart, Building2, UserPlus, RefreshCw } from '../../utils/icons/icons';

/* ============================================================
   INSURANCE PAGE — Rest Point Insurance System
   A full insurance platform for funeral homes to sell policies,
   manage contributions, track claims, and integrate seamlessly.
   ============================================================ */

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    verdigrisTint: '#EBEFEF',
    line: '#E3DDD0',
    lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    accent: '#C77B5E',
};

const Mark = ({ size = 28, color = C.verdigris }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14.5" stroke={color} strokeWidth="1" />
        <path d="M16 8.5V23.5M9.5 16H22.5" stroke={color} strokeWidth="1" />
        <circle cx="16" cy="16" r="2.5" fill={color} />
    </svg>
);

const PolicyDropdown = ({ navigate, goTerms }) => {
    const [open, setOpen] = useState(false);

    const policies = [
        { label: 'Terms of Service', onClick: goTerms },
        { label: 'Privacy Policy', onClick: () => navigate('/privacy') },
        { label: 'Data Migration Policy', onClick: () => navigate('/data-migration') },
        { label: 'Security & Compliance', onClick: () => navigate('/security') },
        { label: 'Release Notes', onClick: () => navigate('/releases') },
    ];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                className="nav-link"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.85rem',
                    color: C.gray,
                    transition: 'color 0.2s',
                }}
            >
                Policies
                <ChevronDown
                    size={14}
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                    }}
                />
            </button>
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: C.ink,
                        border: `1px solid ${C.line}`,
                        borderRadius: '2px',
                        minWidth: '240px',
                        marginTop: '0.5rem',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(21,23,26,0.2)',
                    }}
                >
                    {policies.map((policy, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                policy.onClick();
                                setOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1.1rem',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                borderBottom: idx < policies.length - 1 ? `1px solid ${C.lineDark}` : 'none',
                                transition: 'background 0.2s, color 0.2s',
                                fontFamily: "'Inter', sans-serif",
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = `rgba(250,248,244,0.08)`;
                                e.target.style.color = C.bone;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'none';
                                e.target.style.color = C.grayLight;
                            }}
                        >
                            {policy.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function InsurancePage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const goLogin = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/login'); };
    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    // System stats
    const stats = [
        { number: 'KES 250k–900k', label: 'Average funeral cover gap' },
        { number: '85%', label: 'Families underinsured' },
        { number: '15+', label: 'Insurance partners integrated' },
        { number: '98%', label: 'Claim approval rate' },
    ];

    // Core features of the insurance system
    const features = [
        {
            icon: <Shield size={28} />,
            title: 'Policy Management',
            desc: 'Create, manage, and offer funeral insurance policies directly to families. Set coverage amounts, premiums, and terms in minutes.',
        },
        {
            icon: <Wallet size={28} />,
            title: 'Contribution Tracking',
            desc: 'Track every contribution made by policyholders. Get real-time visibility into premium payments, outstanding balances, and payment history.',
        },
        {
            icon: <Users size={28} />,
            title: 'Family Portal',
            desc: 'Families can view their policies, make payments, and track contributions through a secure, branded portal. No more paper statements.',
        },
        {
            icon: <RefreshCw size={28} />,
            title: 'Seamless Integration',
            desc: 'Full integration with existing insurance providers in 1-2 months. Connect to Old Mutual, Britam, Jubilee, and more.',
        },
        {
            icon: <FileText size={28} />,
            title: 'Automated Claims',
            desc: 'Submit claims directly from the case file. All documents attached automatically. Track approval status in real time.',
        },
        {
            icon: <PieChart size={28} />,
            title: 'Revenue & Analytics',
            desc: 'See how much commission you\'re earning. Track policy sales, claim success rates, and identify new opportunities.',
        },
    ];

    // Integration partners
    const partners = [
        { name: 'Old Mutual', description: 'Funeral cover up to KES 500,000' },
        { name: 'Britam', description: 'Comprehensive funeral plans' },
        { name: 'Jubilee Insurance', description: 'Burial expense insurance' },
        { name: 'AAR Insurance', description: 'Funeral benefit plans' },
        { name: 'CIC Group', description: 'Family funeral cover' },
        { name: 'Heritage Insurance', description: 'Funeral expense protection' },
    ];

    // Integration timeline
    const timeline = [
        {
            phase: 'Phase 1: Discovery & Planning',
            duration: 'Week 1-2',
            tasks: [
                'Understand your existing insurance offerings',
                'Map out integration requirements',
                'Define policy types and contribution structures',
                'Setup integration environment'
            ]
        },
        {
            phase: 'Phase 2: Integration Development',
            duration: 'Week 3-6',
            tasks: [
                'Connect to partner insurance APIs',
                'Build policy management interface',
                'Implement contribution tracking system',
                'Create family portal for policyholders'
            ]
        },
        {
            phase: 'Phase 3: Testing & Deployment',
            duration: 'Week 7-8',
            tasks: [
                'End-to-end testing of all insurance workflows',
                'User acceptance testing with your team',
                'Train your staff on the new system',
                'Go-live with full insurance integration'
            ]
        }
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; -webkit-font-smoothing: antialiased; }

        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; letter-spacing: -0.01em; color: ${C.ink}; }
        h1 { font-size: clamp(2.8rem, 6.5vw, 4.2rem); line-height: 1.05; margin-bottom: 1.4rem; }
        h2 { font-size: clamp(1.9rem, 4vw, 2.5rem); line-height: 1.2; }
        h3 { font-size: 1.3rem; }
        p { line-height: 1.7; font-size: 1rem; }

        a { color: inherit; text-decoration: none; }

        .label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.74rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.brass};
        }

        .btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.9rem 1.9rem; font-size: 0.85rem; font-weight: 500;
          font-family: 'Inter', sans-serif;
          border: 1px solid transparent; border-radius: 2px;
          cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .btn-dark { background: ${C.ink}; color: ${C.bone}; }
        .btn-dark:hover { background: ${C.verdigris}; }
        .btn-line { background: transparent; color: ${C.ink}; border-color: ${C.ink}; }
        .btn-line:hover { background: ${C.ink}; color: ${C.bone}; }
        .btn-brass { background: ${C.brass}; color: ${C.bone}; border: none; }
        .btn-brass:hover { background: ${C.brassLight}; }

        .wrap { max-width: 1140px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }

        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(250,248,244,0.96); backdrop-filter: blur(12px);
          border-bottom: 1px solid ${C.line};
          padding: 1.2rem 0;
        }
        .nav-wrap { display: flex; justify-content: space-between; align-items: center; }
        .logo { display: flex; align-items: center; gap: 0.7rem; font-family: 'Fraunces', serif; font-size: 1.25rem; font-weight: 500; color: ${C.ink}; cursor: pointer; }
        .nav-links { display: flex; gap: 2.2rem; align-items: center; }
        .nav-link {
          font-size: 0.85rem;
          color: ${C.gray};
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
          background: transparent;
          border: none;
          font-family: 'Inter', sans-serif;
        }
        .nav-link:hover { color: ${C.verdigris}; }
        .nav-cta { display: flex; gap: 0.75rem; }
        @media (max-width: 800px) { .nav-links { display: none; } }

        .page-hero {
          padding-top: 160px;
          padding-bottom: 4rem;
          background: ${C.verdigrisDark};
          border-bottom: 1px solid ${C.verdigrisLight};
        }
        .page-hero h1 { color: ${C.bone}; }
        .page-hero p { color: rgba(250,248,244,0.75); font-size: 1.1rem; max-width: 700px; line-height: 1.8; }
        .page-hero .label { color: ${C.brass}; margin-bottom: 1rem; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 3rem;
          padding: 2rem 0;
          border-top: 1px solid rgba(250,248,244,0.1);
        }
        .stat-item .number { font-family: 'Fraunces', serif; font-size: 2.2rem; color: ${C.bone}; font-weight: 600; }
        .stat-item .label { font-size: 0.85rem; color: rgba(250,248,244,0.6); margin-top: 0.2rem; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        }

        .section { padding: clamp(4rem, 8vw, 6rem) 0; }
        .section-alt { background: ${C.bone2}; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2.5rem;
        }
        .feature-card {
          padding: 2rem;
          border: 1px solid ${C.line};
          border-radius: 4px;
          background: ${C.bone};
          transition: all 0.25s;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(21,23,26,0.08);
        }
        .feature-card .icon {
          color: ${C.verdigris};
          margin-bottom: 1rem;
        }
        .feature-card h3 { margin-bottom: 0.5rem; font-size: 1.1rem; }
        .feature-card p { color: ${C.gray}; font-size: 0.92rem; line-height: 1.6; }

        @media (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; }
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 2.5rem;
        }
        .partner-card {
          padding: 1.5rem;
          border: 1px solid ${C.line};
          border-radius: 4px;
          text-align: center;
          background: ${C.bone};
          transition: all 0.25s;
        }
        .partner-card:hover {
          border-color: ${C.verdigris};
          transform: translateY(-2px);
        }
        .partner-card h4 { font-family: 'Fraunces', serif; color: ${C.ink}; font-size: 1.1rem; margin-bottom: 0.3rem; }
        .partner-card p { color: ${C.gray}; font-size: 0.85rem; }

        @media (max-width: 700px) {
          .partners-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .partners-grid { grid-template-columns: 1fr; }
        }

        .timeline-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
          margin-top: 2.5rem;
        }
        .timeline-card {
          padding: 2rem;
          border: 1px solid ${C.line};
          border-radius: 4px;
          background: ${C.bone};
          border-top: 4px solid ${C.verdigris};
        }
        .timeline-card .phase { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: ${C.verdigris}; font-weight: 600; }
        .timeline-card .duration { font-size: 0.85rem; color: ${C.gray}; margin: 0.3rem 0 1rem; }
        .timeline-card ul { list-style: none; padding: 0; }
        .timeline-card li { 
          padding: 0.4rem 0; 
          font-size: 0.88rem; 
          color: ${C.gray}; 
          border-bottom: 1px solid ${C.line}; 
          display: flex; 
          align-items: center; 
          gap: 0.5rem;
        }
        .timeline-card li:last-child { border-bottom: none; }
        .timeline-card li::before { content: '✓'; color: ${C.verdigris}; font-weight: bold; }

        @media (max-width: 800px) {
          .timeline-grid { grid-template-columns: 1fr; }
        }

        .cta-section {
          background: ${C.ink};
          padding: 4rem 0;
          border-top: 1px solid ${C.verdigrisLight};
          border-bottom: 1px solid ${C.verdigrisLight};
        }
        .cta-content { max-width: 640px; }
        .cta-content h2 { color: ${C.bone}; margin-bottom: 1rem; }
        .cta-content p { color: ${C.grayLight}; font-size: 1.05rem; line-height: 1.8; margin-bottom: 2rem; }

        .mock-dashboard {
          width: 100%;
          background: linear-gradient(135deg, ${C.verdigrisDark} 0%, ${C.verdigris} 100%);
          border: 1px solid ${C.verdigrisLight};
          border-radius: 8px;
          padding: 2.5rem;
          margin-top: 2rem;
          color: ${C.bone};
        }
        .mock-dashboard .row { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 0; border-bottom: 1px solid rgba(250,248,244,0.1); }
        .mock-dashboard .row:last-child { border-bottom: none; }
        .mock-dashboard .label { color: rgba(250,248,244,0.6); font-size: 0.82rem; }
        .mock-dashboard .value { font-family: 'Fraunces', serif; font-size: 1.2rem; }

        footer {
          background: ${C.ink};
          color: ${C.grayLight};
          padding: 5.5rem 0 2rem;
          border-top: 2px solid ${C.verdigrisLight};
          position: relative;
          overflow: hidden;
        }
        footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 50%, rgba(61,79,71,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
          position: relative;
          z-index: 1;
        }
        @media (max-width: 1000px) {
          .footer-content { grid-template-columns: 2fr 1fr 1fr; gap: 3rem; }
        }
        @media (max-width: 700px) {
          .footer-content { grid-template-columns: 1fr; gap: 2.5rem; }
        }
        .footer-col h4 {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${C.verdigrisTint};
          margin-bottom: 1.5rem;
          font-weight: 600;
          opacity: 0.8;
        }
        .footer-col a,
        .footer-col button {
          display: block;
          font-size: 0.88rem;
          color: ${C.grayLight};
          text-decoration: none;
          margin-bottom: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s, transform 0.2s;
          text-align: left;
          padding: 0;
          line-height: 1.5;
          font-family: 'Inter', sans-serif;
        }
        .footer-col a:hover,
        .footer-col button:hover {
          color: ${C.verdigrisTint};
          transform: translateX(4px);
        }
        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          font-size: 0.88rem;
          color: ${C.grayLight};
          transition: color 0.2s;
        }
        .footer-contact-item:hover { color: ${C.verdigrisTint}; }
        .footer-contact-item svg {
          flex-shrink: 0;
          color: ${C.verdigrisTint};
          margin-top: 2px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .footer-contact-item:hover svg { opacity: 1; }
        .footer-contact-item a {
          color: ${C.verdigrisTint};
          text-decoration: none;
          margin: 0;
          transition: color 0.2s;
        }
        .footer-contact-item a:hover { color: ${C.brass}; }
        .footer-divider {
          height: 1px;
          background: ${C.lineDark};
          margin: 3rem 0;
          position: relative;
          z-index: 1;
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          color: ${C.grayLight};
          padding-top: 2rem;
          border-top: 1px solid ${C.lineDark};
          position: relative;
          z-index: 1;
        }
        @media (max-width: 600px) {
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
        .footer-brand {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          color: ${C.bone};
          font-weight: 500;
          margin-bottom: 0.6rem;
          letter-spacing: -0.02em;
        }
        .footer-desc {
          font-size: 0.9rem;
          color: ${C.grayLight};
          line-height: 1.7;
          max-width: 320px;
          opacity: 0.8;
        }
        .footer-desc:hover { opacity: 1; }
      `}</style>

            {/* Navigation */}
            <nav>
                <div className="wrap nav-wrap">
                    <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <Mark size={24} />
                        <span>Rest Point</span>
                    </div>
                    <div className="nav-links">
                        <a href="/#features" className="nav-link">Features</a>
                        <a href="/#pricing" className="nav-link">Pricing</a>
                        <PolicyDropdown navigate={navigate} goTerms={goTerms} />
                    </div>
                    <div className="nav-cta">
                        <button className="btn btn-line" onClick={goLogin} style={{ padding: '0.65rem 1.4rem', fontSize: '0.8rem' }}>Log in</button>
                        <button className="btn btn-dark" onClick={goStart} style={{ padding: '0.65rem 1.4rem', fontSize: '0.8rem' }}>Request access</button>
                    </div>
                </div>
            </nav>

            {/* Page Hero */}
            <section className="page-hero">
                <div className="wrap">
                    <div className="label">Insurance System</div>
                    <h1>Funeral insurance, built for funeral homes.</h1>
                    <p>
                        Rest Point Insurance System is a complete platform that lets you offer, manage, and track funeral insurance
                        policies. Families can buy policies, make contributions, and track everything through a secure portal.
                        Full integration with all major insurance providers in 1-2 months.
                    </p>

                    <div className="stats-grid">
                        {stats.map((stat, idx) => (
                            <div className="stat-item" key={idx}>
                                <div className="number">{stat.number}</div>
                                <div className="label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section">
                <div className="wrap">
                    <div className="label" style={{ marginBottom: '0.5rem' }}>Complete insurance platform</div>
                    <h2 style={{ marginBottom: '1rem' }}>Everything you need to offer funeral insurance</h2>
                    <p style={{ maxWidth: '600px', color: C.gray, fontSize: '1.05rem', marginBottom: '1rem' }}>
                        From policy creation to contribution tracking to claims management  all in one system.
                    </p>

                    <div className="features-grid">
                        {features.map((feature, idx) => (
                            <div className="feature-card" key={idx}>
                                <div className="icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mock Dashboard Preview */}
            <section className="section section-alt">
                <div className="wrap">
                    <div className="label" style={{ marginBottom: '0.5rem' }}>Dashboard preview</div>
                    <h2 style={{ marginBottom: '1.5rem' }}>See your insurance business at a glance</h2>

                    <div className="mock-dashboard">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6, fontFamily: "'JetBrains Mono', monospace" }}>INSURANCE DASHBOARD</div>
                                <div style={{ fontSize: '1.2rem', fontFamily: "'Fraunces', serif" }}>Policyholder Overview</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{ background: 'rgba(250,248,244,0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem' }}>Active policies: 142</span>
                            </div>
                        </div>
                        <div className="row">
                            <span className="label">Total contributions</span>
                            <span className="value">KES 2,840,000</span>
                        </div>
                        <div className="row">
                            <span className="label">Active policyholders</span>
                            <span className="value">142 families</span>
                        </div>
                        <div className="row">
                            <span className="label">Outstanding claims</span>
                            <span className="value">3 (KES 320,000)</span>
                        </div>
                        <div className="row">
                            <span className="label">Your commission (MTD)</span>
                            <span className="value">KES 184,600</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integration Timeline */}
            <section className="section">
                <div className="wrap">
                    <div className="label" style={{ marginBottom: '0.5rem' }}>Integration timeline</div>
                    <h2 style={{ marginBottom: '1rem' }}>Full integration in 1 - 2 months</h2>
                    <p style={{ maxWidth: '600px', color: C.gray, fontSize: '1.05rem', marginBottom: '2rem' }}>
                        We work with you to connect to your existing insurance partners and get your insurance system up and running.
                    </p>

                    <div className="timeline-grid">
                        {timeline.map((phase, idx) => (
                            <div className="timeline-card" key={idx}>
                                <div className="phase">{phase.phase}</div>
                                <div className="duration">{phase.duration}</div>
                                <ul>
                                    {phase.tasks.map((task, i) => (
                                        <li key={i}>{task}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="section section-alt">
                <div className="wrap">
                    <div className="label" style={{ marginBottom: '0.5rem' }}>Insurance partners</div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Already integrated</h2>
                    <p style={{ maxWidth: '600px', color: C.gray, fontSize: '1.05rem', marginBottom: '2rem' }}>
                        Rest Point works with leading funeral insurance providers across East Africa. We can connect to any provider you work with.
                    </p>

                    <div className="partners-grid">
                        {partners.map((partner, idx) => (
                            <div className="partner-card" key={idx}>
                                <h4>{partner.name}</h4>
                                <p>{partner.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="wrap">
                    <div className="cta-content">
                        <h2>Ready to offer funeral insurance through your funeral home?</h2>
                        <p>
                            Rest Point Insurance System lets you become a full service funeral provider. Sell policies, track contributions,
                            manage claims, and earn commission  all from one platform. Integration takes 1-2 months.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn btn-brass" onClick={goStart}>
                                Get started <ArrowRight size={18} />
                            </button>
                            <button className="btn btn-line" onClick={goLogin} style={{ borderColor: C.bone, color: C.bone }}>
                                Schedule a demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="wrap">
                    <div className="footer-content">
                        <div>
                            <div className="footer-brand">Rest Point</div>
                            <p className="footer-desc">
                                The operating system for mortuaries and funeral homes across East Africa. Case files, billing, dispatch, insurance, and family care  all in one system.
                            </p>
                        </div>

                        <div className="footer-col">
                            <h4>Product</h4>
                            <a href="/#features">Features</a>
                            <a href="/#pricing">Pricing</a>
                            <button onClick={goStart}>Request demo</button>
                        </div>

                        <div className="footer-col">
                            <h4>Policies</h4>
                            <button onClick={goTerms}>Terms of service</button>
                            <button onClick={() => navigate('/privacy')}>Privacy policy</button>
                            <button onClick={() => navigate('/data-migration')}>Data migration</button>
                            <button onClick={() => navigate('/security')}>Security & compliance</button>
                        </div>

                        <div className="footer-col">
                            <h4>Contact</h4>
                            <div className="footer-contact">
                                <div className="footer-contact-item">
                                    <Mail size={16} />
                                    <a href="mailto:hello@restpoint.co.ke">hello@restpoint.co.ke</a>
                                </div>
                                <div className="footer-contact-item">
                                    <Phone size={16} />
                                    <a href="tel:+254712345678">+254 740 045 355</a>
                                </div>
                                <div className="footer-contact-item">
                                    <MapPin size={16} />
                                    <span>Nairobi, Kenya</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer-divider" />

                    <div className="footer-bottom">
                        <span>&copy; {new Date().getFullYear()} Rest Point. All rights reserved.</span>
                        <span>Designed in Nairobi · Built on the cloud</span>
                    </div>
                </div>
            </footer>
        </>
    );
}