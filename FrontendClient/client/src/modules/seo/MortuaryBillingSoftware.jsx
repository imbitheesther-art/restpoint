import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ExternalLink, Receipt, Smartphone, ListChecks, ShieldCheck, BarChart3, Wallet, Zap, Eye, Lock, Sparkles, Building2, Link2, Users, FileText, CreditCard, TrendingUp, CheckCircle } from '../../utils/icons/icons';

const C = {
    ink: '#1A1A1A',
    bone: '#FAF8F4',
    white: '#FFFFFF',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    brassPale: 'rgba(139,115,85,0.08)',
    brassPaleBorder: 'rgba(139,115,85,0.15)',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    verdigrisPale: 'rgba(61,79,71,0.06)',
    verdigrisPaleBorder: 'rgba(61,79,71,0.15)',
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

const useInView = (threshold = 0.15) => {
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
    <div
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.brass,
            marginBottom: "1.25rem",
        }}
    >
        <span
            style={{
                width: 24,
                height: 1,
                background: C.brass,
                display: "inline-block",
            }}
        />
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

const MortuaryBillingSoftware = () => {
    const features = [
        { icon: <Receipt size={22} />, title: 'Automated Invoicing', desc: 'Generate professional invoices automatically for mortuary services, storage fees, autopsy charges, and funeral packages. Customize templates to match your brand.' },
        { icon: <Smartphone size={22} />, title: 'M-Pesa Integration', desc: 'Accept mobile payments directly through M-Pesa. Automatic reconciliation, instant payment confirmation, and digital receipts sent via SMS.' },
        { icon: <ListChecks size={22} />, title: 'Service Catalog', desc: 'Maintain a comprehensive catalog of services with standard pricing. Create custom packages for different client needs and adjust pricing dynamically.' },
        { icon: <ShieldCheck size={22} />, title: 'Insurance & Welfare Claims', desc: 'Process funeral insurance claims, verify coverage, submit claims to insurance companies, and track claim status through to payment.' },
        { icon: <BarChart3 size={22} />, title: 'Financial Reporting', desc: 'Generate detailed financial reports including revenue by service type, payment methods, outstanding balances, and trends over time.' },
        { icon: <Wallet size={22} />, title: 'Multi-Payment Options', desc: 'Support various payment methods: cash, M-Pesa, credit cards, bank transfers, insurance claims, and installment plans for families in need.' },
    ];

    const benefits = [
        { icon: <Zap size={24} />, title: 'Faster Payment Collection', desc: 'Reduce payment processing time from days to minutes with M-Pesa integration. Improve cash flow and reduce outstanding receivables by 60%.', stat: '60%', statLabel: 'Less receivables' },
        { icon: <Eye size={24} />, title: 'Complete Financial Visibility', desc: 'Get real-time dashboards showing revenue, pending payments, insurance claims status, and financial performance metrics at a glance.', stat: 'Live', statLabel: 'Dashboard' },
        { icon: <Lock size={24} />, title: 'Secure & Compliant', desc: 'PCI-DSS compliant payment processing. Secure handling of financial data with encryption and audit trails for regulatory compliance.', stat: '256-bit', statLabel: 'Encryption' },
        { icon: <Sparkles size={24} />, title: 'Reduced Administrative Work', desc: 'Automate invoice generation, payment reminders, and reconciliation. Free up your team to focus on serving families instead of paperwork.', stat: '80%', statLabel: 'Less manual work' },
    ];

    const useCases = [
        { icon: <Building2 size={20} />, title: 'Private Mortuaries', desc: 'Independent mortuary operators use Rest Point to streamline billing, reduce payment delays, and improve financial management.', tag: 'Independent' },
        { icon: <Building size={20} />, title: 'Hospital Morgues', desc: 'Hospital mortuaries integrate our billing system with hospital finance departments for seamless payment processing and claims management.', tag: 'Integrated' },
        { icon: <Link2 size={20} />, title: 'Funeral Home Chains', desc: 'Multi-location funeral home operators use our centralized billing system to manage finances across all branches from one dashboard.', tag: 'Multi-Branch' },
        { icon: <Users size={20} />, title: 'Welfare Organizations', desc: 'Churches, SACCOs, and welfare groups use our software to manage member benefits, process claims, and track contributions for funeral expenses.', tag: 'Group' },
    ];

    const relatedLinks = [
        { to: '/mortuary-management-software', label: 'Mortuary Management Software' },
        { to: '/funeral-home-management-software', label: 'Funeral Home Management Software' },
        { to: '/blog/funeral-cost-kenya', label: 'How Much Does a Funeral Cost in Kenya?' },
        { to: '/blog/last-expense-insurance-kenya', label: 'Last Expense Insurance Kenya' },
    ];

    return (
        <>
            <Helmet>
                <title>Mortuary Billing Software Kenya | ERP for Funeral Homes & Billing System</title>
                <meta name="description" content="Rest Point is Kenya's leading mortuary billing software and ERP for funeral homes. Complete billing system with M-Pesa integration, invoice management, and financial reporting. Streamline mortuary and funeral home billing operations." />
                <meta name="keywords" content="mortuary billing software, erp for funeral homes, mortuary billing system, funeral home billing software, mortuary payment processing, funeral home financial management, mortuary invoice system, billing software kenya" />
                <link rel="canonical" href="https://restpoint.co.ke/mortuary-billing" />
            </Helmet>

            <div className="mbs-page">
                <style>{`
                    .mbs-page {
                        background: ${C.white};
                        color: ${C.textSec};
                        font-family: 'Inter', sans-serif;
                        overflow-x: hidden;
                    }
                    .mbs-page .mbs-container {
                        max-width: 1180px;
                        margin: 0 auto;
                        padding: 0 clamp(1.25rem, 5vw, 2.5rem);
                    }
                    .mbs-page a { text-decoration: none; }

                    .mbs-divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.line} 20%, ${C.line} 80%, transparent);
                    }

                    /* ── Hero ── */
                    .mbs-hero {
                        position: relative;
                        padding: clamp(6rem, 12vw, 10rem) 0 clamp(5rem, 10vw, 8rem);
                        overflow: hidden;
                        background: ${C.bone};
                    }
                    .mbs-hero-glow {
                        position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(199,123,94,0.1) 0%, transparent 60%),
                            radial-gradient(ellipse 50% 40% at 15% 80%, rgba(139,115,85,0.08) 0%, transparent 60%);
                        pointer-events: none;
                    }
                    .mbs-hero-grid {
                        position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                        background-size: 48px 48px;
                        mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mbs-hero-content {
                        position: relative; z-index: 2;
                        max-width: 800px;
                    }
                    .mbs-hero-breadcrumb {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.72rem; color: ${C.textTer};
                        margin-bottom: 2rem; letter-spacing: 0.02em;
                    }
                    .mbs-hero-breadcrumb a { color: ${C.brass}; transition: color 0.2s; }
                    .mbs-hero-breadcrumb a:hover { color: ${C.text}; }
                    .mbs-hero h1 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(2.2rem, 5.5vw, 3.6rem);
                        color: ${C.text};
                        font-weight: 500;
                        line-height: 1.1;
                        letter-spacing: -0.03em;
                        margin-bottom: 1.25rem;
                    }
                    .mbs-hero h1 span {
                        background: linear-gradient(135deg, ${C.accent}, ${C.brassLight});
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    .mbs-hero-subtitle {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.85rem;
                        color: ${C.brass};
                        margin-bottom: 1.5rem;
                        letter-spacing: 0.04em;
                    }
                    .mbs-hero-desc {
                        font-size: 1.05rem;
                        color: ${C.textSec};
                        line-height: 1.8;
                        margin-bottom: 2.5rem;
                        max-width: 640px;
                    }
                    .mbs-hero-desc strong { color: ${C.text}; font-weight: 600; }
                    .mbs-hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

                    .mbs-btn-primary {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: ${C.accent}; color: ${C.white}; border: none;
                        padding: 0.85rem 2rem; border-radius: 8px;
                        font-size: 0.9rem; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .mbs-btn-primary:hover { background: #D48E72; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(199,123,94,0.35); }

                    .mbs-btn-outline {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.textSec};
                        border: 1px solid ${C.line}; padding: 0.85rem 2rem;
                        border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .mbs-btn-outline:hover { border-color: ${C.textTer}; color: ${C.text}; transform: translateY(-2px); }

                    /* Hero floating stats */
                    .mbs-hero-stats {
                        position: absolute;
                        right: clamp(1.25rem, 5vw, 2.5rem);
                        top: 50%; transform: translateY(-50%);
                        display: flex; flex-direction: column; gap: 1.25rem;
                        z-index: 2;
                    }
                    .mbs-hero-stat {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 10px;
                        padding: 1rem 1.25rem;
                        text-align: right;
                        min-width: 160px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                        transition: all 0.3s ease;
                    }
                    .mbs-hero-stat:hover { border-color: ${C.lineMid}; box-shadow: 0 8px 30px rgba(0,0,0,0.07); transform: translateY(-2px); }
                    .mbs-hero-stat-value {
                        font-family: 'Fraunces', serif;
                        font-size: 1.6rem; color: ${C.text};
                        font-weight: 500; line-height: 1;
                    }
                    .mbs-hero-stat-label {
                        font-size: 0.72rem; color: ${C.textTer};
                        margin-top: 0.3rem;
                    }

                    /* ── What Is ── */
                    .mbs-what { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .mbs-what-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 4rem;
                        align-items: start;
                    }
                    .mbs-what-text p {
                        font-size: 1rem; line-height: 1.8;
                        color: ${C.textSec};
                        margin-bottom: 1.25rem;
                    }
                    .mbs-what-text p strong { color: ${C.text}; font-weight: 600; }
                    .mbs-what-visual {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 14px;
                        padding: 2rem;
                        position: relative; overflow: hidden;
                    }
                    .mbs-what-visual::before {
                        content: '';
                        position: absolute; top: -50%; right: -40%;
                        width: 200%; height: 200%;
                        background: radial-gradient(circle at 65% 35%, rgba(199,123,94,0.06) 0%, transparent 50%);
                        pointer-events: none;
                    }
                    .mbs-what-visual-item {
                        display: flex; align-items: flex-start; gap: 1rem;
                        padding: 1rem 0;
                        border-bottom: 1px solid ${C.line};
                        position: relative;
                    }
                    .mbs-what-visual-item:last-child { border-bottom: none; }
                    .mbs-what-visual-num {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.7rem; color: ${C.accent};
                        background: ${C.accentPale};
                        border: 1px solid rgba(199,123,94,0.15);
                        width: 28px; height: 28px; border-radius: 6px;
                        display: flex; align-items: center; justify-content: center;
                        flex-shrink: 0; margin-top: 2px;
                    }
                    .mbs-what-visual-title {
                        font-size: 0.9rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.25rem;
                    }
                    .mbs-what-visual-desc {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.6;
                    }

                    /* ── Features ── */
                    .mbs-features { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.bone}; }
                    .mbs-features-glow {
                        position: absolute;
                        top: 30%; left: 40%; transform: translate(-50%, -50%);
                        width: 700px; height: 500px;
                        background: radial-gradient(ellipse, rgba(199,123,94,0.05) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mbs-features-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .mbs-feature-card {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
                        position: relative; overflow: hidden;
                    }
                    .mbs-feature-card::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 2px;
                        background: linear-gradient(90deg, transparent, ${C.accent}, transparent);
                        opacity: 0; transition: opacity 0.35s ease;
                    }
                    .mbs-feature-card:hover {
                        border-color: rgba(199,123,94,0.2);
                        transform: translateY(-4px);
                        box-shadow: 0 12px 32px rgba(0,0,0,0.06);
                    }
                    .mbs-feature-card:hover::before { opacity: 1; }
                    .mbs-feature-icon {
                        width: 40px; height: 40px; border-radius: 9px;
                        background: ${C.accentPale};
                        border: 1px solid rgba(199,123,94,0.15);
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.accent};
                        margin-bottom: 1.1rem;
                        transition: all 0.35s ease;
                    }
                    .mbs-feature-card:hover .mbs-feature-icon {
                        background: rgba(199,123,94,0.14);
                    }
                    .mbs-feature-card h3 {
                        font-size: 0.95rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                        line-height: 1.3;
                    }
                    .mbs-feature-card p {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.65;
                    }

                    /* ── Benefits ── */
                    .mbs-benefits { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .mbs-benefits-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                    }
                    .mbs-benefit-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 2rem;
                        display: flex; gap: 1.5rem;
                        align-items: flex-start;
                        transition: all 0.35s ease;
                    }
                    .mbs-benefit-card:hover {
                        border-color: ${C.lineMid};
                        box-shadow: 0 8px 28px rgba(0,0,0,0.04);
                    }
                    .mbs-benefit-left { flex-shrink: 0; }
                    .mbs-benefit-icon {
                        width: 48px; height: 48px; border-radius: 12px;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.accent}; margin-bottom: 0.75rem;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                    }
                    .mbs-benefit-stat {
                        font-family: 'Fraunces', serif;
                        font-size: 1.4rem; color: ${C.text};
                        font-weight: 500; line-height: 1;
                    }
                    .mbs-benefit-stat-label {
                        font-size: 0.7rem; color: ${C.textTer};
                        margin-top: 0.2rem;
                        font-family: 'JetBrains Mono', monospace;
                        letter-spacing: 0.04em;
                    }
                    .mbs-benefit-right { flex: 1; }
                    .mbs-benefit-card h3 {
                        font-size: 1.05rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .mbs-benefit-card p {
                        font-size: 0.88rem; color: ${C.textSec};
                        line-height: 1.7;
                    }

                    /* ── Use Cases ── */
                    .mbs-usecases { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.white}; }
                    .mbs-usecases-glow {
                        position: absolute;
                        bottom: 15%; left: 5%;
                        width: 400px; height: 400px;
                        background: radial-gradient(circle, rgba(139,115,85,0.05) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mbs-usecases-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .mbs-usecase-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s ease;
                        display: flex; flex-direction: column;
                    }
                    .mbs-usecase-card:hover {
                        border-color: ${C.lineMid};
                        background: ${C.white};
                        transform: translateY(-3px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    }
                    .mbs-usecase-tag {
                        display: inline-flex; align-self: flex-start;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.65rem; letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: ${C.accent};
                        background: ${C.accentPale};
                        border: 1px solid rgba(199,123,94,0.15);
                        padding: 0.25rem 0.6rem;
                        border-radius: 4px;
                        margin-bottom: 1.25rem;
                    }
                    .mbs-usecase-icon {
                        width: 40px; height: 40px; border-radius: 8px;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.text}; margin-bottom: 1rem;
                    }
                    .mbs-usecase-card h3 {
                        font-size: 1rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .mbs-usecase-card p {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.65;
                        flex: 1;
                    }

                    /* ── CTA ── */
                    .mbs-cta { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .mbs-cta-box {
                        position: relative;
                        background: linear-gradient(135deg, ${C.bone} 0%, #F0ECE3 100%);
                        border: 1px solid ${C.line};
                        border-radius: 20px;
                        padding: clamp(3rem, 6vw, 5rem);
                        text-align: center;
                        overflow: hidden;
                    }
                    .mbs-cta-box::before {
                        content: ''; position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 60% 50% at 75% 20%, rgba(199,123,94,0.08) 0%, transparent 70%),
                            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(139,115,85,0.06) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mbs-cta-box::after {
                        content: ''; position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
                        background-size: 32px 32px;
                        pointer-events: none;
                        mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                        -webkit-mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                    }
                    .mbs-cta-content { position: relative; z-index: 2; }
                    .mbs-cta-box h2 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(1.8rem, 4vw, 2.5rem);
                        color: ${C.text}; font-weight: 500;
                        margin-bottom: 1rem; letter-spacing: '-0.02em';
                    }
                    .mbs-cta-box p {
                        font-size: 1.05rem; color: ${C.textSec};
                        line-height: 1.7;
                        max-width: 560px; margin: 0 auto 2.5rem;
                    }
                    .mbs-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    /* ── Related ── */
                    .mbs-related { padding: clamp(3rem, 6vw, 5rem) 0; background: ${C.white}; }
                    .mbs-related-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1rem;
                    }
                    .mbs-related-link {
                        display: flex; align-items: center; gap: 0.6rem;
                        padding: 1rem 1.25rem;
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 10px;
                        font-size: 0.85rem; color: ${C.textSec};
                        transition: all 0.25s ease;
                        cursor: pointer;
                    }
                    .mbs-related-link:hover {
                        background: ${C.white};
                        border-color: rgba(199,123,94,0.2);
                        color: ${C.text};
                        transform: translateX(4px);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    }
                    .mbs-related-link svg { flex-shrink: 0; color: ${C.accent}; opacity: 0.5; transition: opacity 0.2s; }
                    .mbs-related-link:hover svg { opacity: 1; }

                    /* ── Responsive ── */
                    @media (max-width: 1024px) {
                        .mbs-features-grid { grid-template-columns: repeat(2, 1fr); }
                        .mbs-usecases-grid { grid-template-columns: repeat(2, 1fr); }
                        .mbs-hero-stats { display: none; }
                    }
                    @media (max-width: 768px) {
                        .mbs-what-grid { grid-template-columns: 1fr; gap: 2.5rem; }
                        .mbs-benefits-grid { grid-template-columns: 1fr; }
                        .mbs-features-grid { grid-template-columns: 1fr; }
                        .mbs-usecases-grid { grid-template-columns: 1fr; }
                        .mbs-related-grid { grid-template-columns: 1fr; }
                        .mbs-benefit-card { flex-direction: column; gap: 1rem; }
                        .mbs-benefit-left { display: flex; align-items: center; gap: 1rem; }
                        .mbs-benefit-icon { margin-bottom: 0; }
                    }
                `}</style>

                {/* ═══ HERO ═══ */}
                <section className="mbs-hero">
                    <div className="mbs-hero-glow" />
                    <div className="mbs-hero-grid" />

                    <div className="mbs-container">
                        <div className="mbs-hero-content">
                            <FadeUp>
                                <div className="mbs-hero-breadcrumb">
                                    <Link to="/">Home</Link>
                                    <ChevronRight size={12} />
                                    <Link to="/mortuary-management-software">Solutions</Link>
                                    <ChevronRight size={12} />
                                    <span>Mortuary Billing</span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={80}>
                                <h1>
                                    <span>Mortuary Billing</span><br />
                                    Software Kenya
                                </h1>
                            </FadeUp>

                            <FadeUp delay={160}>
                                <div className="mbs-hero-subtitle">Complete ERP & Billing Solution for Funeral Homes</div>
                            </FadeUp>

                            <FadeUp delay={240}>
                                <p className="mbs-hero-desc">
                                    Rest Point is Kenya's premier <strong>mortuary billing software</strong>, providing a comprehensive
                                    <strong> ERP for funeral homes</strong> that streamlines financial operations. Our powerful
                                    <strong> mortuary billing system</strong> handles everything from basic service charges to complex
                                    funeral packages, with seamless M-Pesa integration and automated invoicing.
                                </p>
                            </FadeUp>

                            <FadeUp delay={320}>
                                <div className="mbs-hero-buttons">
                                    <Link to="/register" className="mbs-btn-primary">
                                        Request Demo <ArrowRight size={16} />
                                    </Link>
                                    <Link to="/contact" className="mbs-btn-outline">Contact Sales</Link>
                                </div>
                            </FadeUp>
                        </div>

                        <div className="mbs-hero-stats">
                            <FadeUp delay={400}>
                                <div className="mbs-hero-stat">
                                    <div className="mbs-hero-stat-value">M-Pesa</div>
                                    <div className="mbs-hero-stat-label">Native Payments</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={500}>
                                <div className="mbs-hero-stat">
                                    <div className="mbs-hero-stat-value">60%</div>
                                    <div className="mbs-hero-stat-label">Less Receivables</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={600}>
                                <div className="mbs-hero-stat">
                                    <div className="mbs-hero-stat-value">Auto</div>
                                    <div className="mbs-hero-stat-label">Invoice Generation</div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <div className="mbs-divider" />

                {/* ═══ WHAT IS ═══ */}
                <section className="mbs-what">
                    <div className="mbs-container">
                        <div className="mbs-what-grid">
                            <div className="mbs-what-text">
                                <FadeUp>
                                    <SectionLabel>Overview</SectionLabel>
                                    <SectionHeading sub="From manual ledgers and spreadsheets to automated, M-Pesa-powered financial operations.">
                                        What is Mortuary Billing Software?
                                    </SectionHeading>
                                </FadeUp>
                                <FadeUp delay={100}>
                                    <p>
                                        <strong>Mortuary billing software</strong> is a specialized financial management solution designed
                                        for mortuaries, funeral homes, and bereavement service providers. Modern <strong>funeral home
                                            billing software</strong> goes beyond simple invoicing to provide comprehensive ERP capabilities
                                        that manage the entire revenue cycle.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={200}>
                                    <p>
                                        The <strong>best mortuary billing software</strong> like Rest Point integrates with your mortuary
                                        management system to automatically generate bills for storage, services, and merchandise.
                                        With built-in M-Pesa integration, families can pay conveniently while your team tracks
                                        payments and manages accounts receivable in real-time.
                                    </p>
                                </FadeUp>
                            </div>

                            <div className="mbs-what-visual">
                                <FadeUp delay={200}>
                                    {[
                                        { num: '01', title: 'Service Capture', desc: 'Auto-populate from case record' },
                                        { num: '02', title: 'Invoice Generation', desc: 'Branded, itemized, instant' },
                                        { num: '03', title: 'M-Pesa Collection', desc: 'STK push, auto-reconcile' },
                                        { num: '04', title: 'Insurance Claims', desc: 'Verify, submit, track status' },
                                        { num: '05', title: 'Payment Matching', desc: 'Auto-match across methods' },
                                        { num: '06', title: 'Financial Reports', desc: 'Revenue, receivables, trends' },
                                    ].map((item, i) => (
                                        <div className="mbs-what-visual-item" key={i}>
                                            <div className="mbs-what-visual-num">{item.num}</div>
                                            <div>
                                                <div className="mbs-what-visual-title">{item.title}</div>
                                                <div className="mbs-what-visual-desc">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </FadeUp>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mbs-divider" />

                {/* ═══ FEATURES ═══ */}
                <section className="mbs-features">
                    <div className="mbs-features-glow" />
                    <div className="mbs-container">
                        <FadeUp>
                            <SectionLabel>Capabilities</SectionLabel>
                            <SectionHeading sub="Six core modules covering the complete mortuary revenue cycle.">
                                Key Features of Our Mortuary Billing System
                            </SectionHeading>
                        </FadeUp>

                        <div className="mbs-features-grid">
                            {features.map((f, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <div className="mbs-feature-card">
                                        <div className="mbs-feature-icon">{f.icon}</div>
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mbs-divider" />

                {/* ═══ BENEFITS ═══ */}
                <section className="mbs-benefits">
                    <div className="mbs-container">
                        <FadeUp>
                            <SectionLabel>Advantages</SectionLabel>
                            <SectionHeading sub="Tangible financial impact from day one.">
                                Why Choose Rest Point for Mortuary Billing?
                            </SectionHeading>
                        </FadeUp>

                        <div className="mbs-benefits-grid">
                            {benefits.map((b, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="mbs-benefit-card">
                                        <div className="mbs-benefit-left">
                                            <div className="mbs-benefit-icon">{b.icon}</div>
                                            <div>
                                                <div className="mbs-benefit-stat">{b.stat}</div>
                                                <div className="mbs-benefit-stat-label">{b.statLabel}</div>
                                            </div>
                                        </div>
                                        <div className="mbs-benefit-right">
                                            <h3>{b.title}</h3>
                                            <p>{b.desc}</p>
                                        </div>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mbs-divider" />

                {/* ═══ USE CASES ═══ */}
                <section className="mbs-usecases">
                    <div className="mbs-usecases-glow" />
                    <div className="mbs-container">
                        <FadeUp>
                            <SectionLabel>Deployments</SectionLabel>
                            <SectionHeading sub="From independent operators to multi-branch networks and welfare groups.">
                                Who Uses Our Mortuary Billing Software?
                            </SectionHeading>
                        </FadeUp>

                        <div className="mbs-usecases-grid">
                            {useCases.map((u, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="mbs-usecase-card">
                                        <span className="mbs-usecase-tag">{u.tag}</span>
                                        <div className="mbs-usecase-icon">{u.icon}</div>
                                        <h3>{u.title}</h3>
                                        <p>{u.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mbs-divider" />

                {/* ═══ CTA ═══ */}
                <section className="mbs-cta">
                    <div className="mbs-container">
                        <FadeUp>
                            <div className="mbs-cta-box">
                                <div className="mbs-cta-content">
                                    <h2>Ready to Streamline Your Billing Operations?</h2>
                                    <p>
                                        Join mortuaries and funeral homes across Kenya that trust Rest Point for
                                        their billing and financial management. Get started with a free demo today.
                                    </p>
                                    <div className="mbs-cta-buttons">
                                        <Link to="/register" className="mbs-btn-primary">
                                            Get Free Demo <ArrowRight size={16} />
                                        </Link>
                                        <Link to="/pricing" className="mbs-btn-outline">
                                            View Pricing Plans <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                <div className="mbs-divider" />

                {/* ═══ RELATED ═══ */}
                <section className="mbs-related">
                    <div className="mbs-container">
                        <FadeUp>
                            <SectionLabel>Explore</SectionLabel>
                            <SectionHeading sub="">Related Resources</SectionHeading>
                        </FadeUp>

                        <div className="mbs-related-grid">
                            {relatedLinks.map((r, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <Link to={r.to} className="mbs-related-link">
                                        <ChevronRight size={14} />
                                        {r.label}
                                    </Link>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default MortuaryBillingSoftware;