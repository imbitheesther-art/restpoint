import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, X, ChevronRight, ExternalLink, Briefcase, Users, Calendar, CreditCard, Package, BookOpen, UserCog, ShieldCheck, Target, Heart, BarChart3, Building2, Link2, Sparkles, Phone } from '../../utils/icons/icons';

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

const FuneralHomeManagementSoftware = () => {
    const features = [
        { icon: <Briefcase size={22} />, title: 'Case Management', desc: 'Track every case from initial call to final service. Manage deceased details, next of kin information, service preferences, and documentation in one place.' },
        { icon: <Users size={22} />, title: 'Family Services Portal', desc: 'Provide families with online access to plan services, view obituaries, make payments, and communicate with your team through a secure portal.' },
        { icon: <Calendar size={22} />, title: 'Scheduling & Calendar', desc: 'Manage funeral services, viewings, and appointments with an intelligent scheduling system that prevents conflicts and optimizes resource allocation.' },
        { icon: <CreditCard size={22} />, title: 'Billing & Payments', desc: 'Generate accurate invoices for funeral packages, merchandise, and services. Accept payments via M-Pesa, credit cards, and bank transfers.' },
        { icon: <Package size={22} />, title: 'Inventory Management', desc: 'Track caskets, urns, flowers, and other merchandise. Monitor stock levels, manage suppliers, and automate reordering when supplies run low.' },
        { icon: <BookOpen size={22} />, title: 'Obituary & Memorial', desc: 'Create and publish obituaries, manage online memorial pages, and coordinate with newspapers for death announcements across Kenya.' },
        { icon: <UserCog size={22} />, title: 'Staff Management', desc: 'Schedule staff, assign roles for each service, track certifications, and manage payroll integration for your funeral home team.' },
        { icon: <ShieldCheck size={22} />, title: 'Compliance & Reporting', desc: 'Generate death certificates, burial permits, and compliance reports. Ensure adherence to Kenyan funeral industry regulations and health standards.' },
    ];

    const benefits = [
        { icon: <Target size={24} />, title: 'Purpose-Built for Funeral Homes', desc: 'Unlike generic business software, Rest Point is designed specifically for funeral homes with features that understand the unique needs of the industry.', stat: '100%', statLabel: 'Funeral-focused' },
        { icon: <Heart size={24} />, title: 'Kenyan-Made, Kenyan-Tested', desc: 'Built in Kenya for Kenyan funeral homes. We understand local customs, regulations, payment methods (M-Pesa), and the importance of dignified service.', stat: 'M-Pesa', statLabel: 'Native payments' },
        { icon: <Sparkles size={24} />, title: 'Compassionate Technology', desc: 'Our software helps you focus on families, not paperwork. Automate routine tasks so you can spend more time providing compassionate care.', stat: '70%', statLabel: 'Less admin time' },
        { icon: <BarChart3 size={24} />, title: 'Complete Business Insights', desc: 'Get real-time dashboards showing revenue, case volume, inventory status, and staff performance. Make informed decisions to grow your business.', stat: 'Live', statLabel: 'Dashboard data' },
    ];

    const useCases = [
        { icon: <Building2 size={20} />, title: 'Independent Funeral Homes', desc: 'Single-location funeral homes across Kenya use Rest Point to modernize operations, reduce paperwork, and provide better service to families.', tag: 'Single Site' },
        { icon: <Link2 size={20} />, title: 'Funeral Home Chains', desc: 'Multi-location funeral home operators manage all branches from a central dashboard with consistent standards and shared resources.', tag: 'Multi-Branch' },
        { icon: <Building2 size={20} />, title: 'Hospital-Based Mortuaries', desc: 'Hospital mortuaries that also provide funeral services use our integrated platform to manage both mortuary operations and funeral arrangements.', tag: 'Hybrid' },
        { icon: <Phone size={20} />, title: 'Memorial Service Providers', desc: 'Companies specializing in memorial services, cremations, and celebration of life events use Rest Point to coordinate complex service logistics.', tag: 'Specialist' },
    ];

    const comparisons = [
        { feature: 'Funeral-Specific Features', us: true, them: false },
        { feature: 'M-Pesa Integration', us: true, them: false },
        { feature: 'Obituary Management', us: true, them: false },
        { feature: 'Local Support in Kenya', us: true, them: false },
        { feature: 'Funeral Industry Compliance', us: true, them: false },
        { feature: 'Multi-Branch Management', us: true, them: false },
        { feature: 'Family Self-Service Portal', us: true, them: false },
    ];

    const relatedLinks = [
        { to: '/blog/best-funeral-home-software', label: 'What is the Best Funeral Home Software?' },
        { to: '/blog/how-to-manage-funeral-home', label: 'How to Manage a Funeral Home' },
        { to: '/blog/funeral-home-manager-skills', label: 'Funeral Home Manager Skills' },
        { to: '/blog/innovations-in-funeral-industry', label: 'Innovations in Funeral Industry' },
    ];

    return (
        <>
            <Helmet>
                <title>Funeral Home Management Software Kenya | Best Funeral Home ERP System</title>
                <meta name="description" content="Rest Point is Kenya's best funeral home management software and ERP system. Complete funeral home management solution with case tracking, billing, family services, and compliance management. Free demo available." />
                <meta name="keywords" content="funeral home management software, best funeral home software, funeral home ERP, funeral home management system, free funeral home management software, funeral home management companies, erp for funeral homes, Funeral home management software free download, funeral home technology, funeral management system kenya" />
                <link rel="canonical" href="https://restpoint.co.ke/funeral-home-management-software" />
            </Helmet>

            <div className="fhms-page">
                <style>{`
                    .fhms-page {
                        background: ${C.white};
                        color: ${C.textSec};
                        font-family: 'Inter', sans-serif;
                        overflow-x: hidden;
                    }
                    .fhms-page .fhms-container {
                        max-width: 1180px;
                        margin: 0 auto;
                        padding: 0 clamp(1.25rem, 5vw, 2.5rem);
                    }
                    .fhms-page a { text-decoration: none; }

                    /* ── Divider ── */
                    .fhms-divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.line} 20%, ${C.line} 80%, transparent);
                    }

                    /* ── Hero ── */
                    .fhms-hero {
                        position: relative;
                        padding: clamp(6rem, 12vw, 10rem) 0 clamp(5rem, 10vw, 8rem);
                        overflow: hidden;
                        background: ${C.bone};
                    }
                    .fhms-hero-glow {
                        position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 70% 60% at 80% 20%, rgba(139,115,85,0.12) 0%, transparent 60%),
                            radial-gradient(ellipse 50% 40% at 10% 90%, rgba(61,79,71,0.08) 0%, transparent 60%);
                        pointer-events: none;
                    }
                    .fhms-hero-grid {
                        position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                        background-size: 48px 48px;
                        mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .fhms-hero-content {
                        position: relative; z-index: 2;
                        max-width: 800px;
                    }
                    .fhms-hero-breadcrumb {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.72rem; color: ${C.textTer}; 
                        margin-bottom: 2rem; letter-spacing: 0.02em;
                    }
                    .fhms-hero-breadcrumb a { color: ${C.brass}; transition: color 0.2s; }
                    .fhms-hero-breadcrumb a:hover { color: ${C.text}; }
                    .fhms-hero h1 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(2.2rem, 5.5vw, 3.6rem);
                        color: ${C.text};
                        font-weight: 500;
                        line-height: 1.1;
                        letter-spacing: -0.03em;
                        margin-bottom: 1.25rem;
                    }
                    .fhms-hero h1 span {
                        background: linear-gradient(135deg, ${C.brass}, ${C.accent});
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    .fhms-hero-subtitle {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.85rem;
                        color: ${C.verdigris};
                        margin-bottom: 1.5rem;
                        letter-spacing: 0.04em;
                    }
                    .fhms-hero-desc {
                        font-size: 1.05rem;
                        color: ${C.textSec};
                        line-height: 1.8;
                        margin-bottom: 2.5rem;
                        max-width: 640px;
                    }
                    .fhms-hero-desc strong { color: ${C.text}; font-weight: 600; }
                    .fhms-hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

                    .fhms-btn-primary {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: ${C.brass}; color: ${C.white}; border: none;
                        padding: 0.85rem 2rem; border-radius: 8px;
                        font-size: 0.9rem; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .fhms-btn-primary:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,115,85,0.25); }

                    .fhms-btn-outline {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.textSec};
                        border: 1px solid ${C.line}; padding: 0.85rem 2rem;
                        border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .fhms-btn-outline:hover { border-color: ${C.textTer}; color: ${C.text}; transform: translateY(-2px); }

                    /* Hero floating stats */
                    .fhms-hero-stats {
                        position: absolute;
                        right: clamp(1.25rem, 5vw, 2.5rem);
                        top: 50%; transform: translateY(-50%);
                        display: flex; flex-direction: column; gap: 1.25rem;
                        z-index: 2;
                    }
                    .fhms-hero-stat {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 10px;
                        padding: 1rem 1.25rem;
                        text-align: right;
                        min-width: 160px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                        transition: all 0.3s ease;
                    }
                    .fhms-hero-stat:hover { border-color: ${C.lineMid}; box-shadow: 0 8px 30px rgba(0,0,0,0.07); transform: translateY(-2px); }
                    .fhms-hero-stat-value {
                        font-family: 'Fraunces', serif;
                        font-size: 1.6rem; color: ${C.text};
                        font-weight: 500; line-height: 1;
                    }
                    .fhms-hero-stat-label {
                        font-size: 0.72rem; color: ${C.textTer};
                        margin-top: 0.3rem;
                    }

                    /* ── What Is ── */
                    .fhms-what { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .fhms-what-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 4rem;
                        align-items: start;
                    }
                    .fhms-what-text p {
                        font-size: 1rem; line-height: 1.8;
                        color: ${C.textSec}; 
                        margin-bottom: 1.25rem;
                    }
                    .fhms-what-text p strong { color: ${C.text}; font-weight: 600; }
                    .fhms-what-visual {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 14px;
                        padding: 2rem;
                        position: relative; overflow: hidden;
                    }
                    .fhms-what-visual::before {
                        content: '';
                        position: absolute; top: -50%; left: -50%;
                        width: 200%; height: 200%;
                        background: radial-gradient(circle at 30% 30%, rgba(139,115,85,0.06) 0%, transparent 50%);
                        pointer-events: none;
                    }
                    .fhms-what-visual-item {
                        display: flex; align-items: flex-start; gap: 1rem;
                        padding: 1rem 0;
                        border-bottom: 1px solid ${C.line};
                        position: relative;
                    }
                    .fhms-what-visual-item:last-child { border-bottom: none; }
                    .fhms-what-visual-num {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.7rem; color: ${C.brass};
                        background: ${C.brassPale};
                        border: 1px solid ${C.brassPaleBorder};
                        width: 28px; height: 28px; border-radius: 6px;
                        display: flex; align-items: center; justify-content: center;
                        flex-shrink: 0; margin-top: 2px;
                    }
                    .fhms-what-visual-title {
                        font-size: 0.9rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.25rem;
                    }
                    .fhms-what-visual-desc {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.6;
                    }

                    /* ── Features ── */
                    .fhms-features { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.bone}; }
                    .fhms-features-glow {
                        position: absolute;
                        top: 30%; left: 40%; transform: translate(-50%, -50%);
                        width: 700px; height: 500px;
                        background: radial-gradient(ellipse, rgba(139,115,85,0.06) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .fhms-features-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .fhms-feature-card {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
                        position: relative; overflow: hidden;
                    }
                    .fhms-feature-card::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 2px;
                        background: linear-gradient(90deg, transparent, ${C.brass}, transparent);
                        opacity: 0; transition: opacity 0.35s ease;
                    }
                    .fhms-feature-card:hover {
                        border-color: ${C.brassPaleBorder};
                        transform: translateY(-4px);
                        box-shadow: 0 12px 32px rgba(0,0,0,0.06);
                    }
                    .fhms-feature-card:hover::before { opacity: 1; }
                    .fhms-feature-icon {
                        width: 40px; height: 40px; border-radius: 9px;
                        background: ${C.brassPale};
                        border: 1px solid ${C.brassPaleBorder};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.brass};
                        margin-bottom: 1.1rem;
                        transition: all 0.35s ease;
                    }
                    .fhms-feature-card:hover .fhms-feature-icon {
                        background: rgba(139,115,85,0.14);
                    }
                    .fhms-feature-card h3 {
                        font-size: 0.95rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                        line-height: 1.3;
                    }
                    .fhms-feature-card p {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.65;
                    }

                    /* ── Benefits ── */
                    .fhms-benefits { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .fhms-benefits-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                    }
                    .fhms-benefit-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 2rem;
                        display: flex; gap: 1.5rem;
                        align-items: flex-start;
                        transition: all 0.35s ease;
                    }
                    .fhms-benefit-card:hover {
                        border-color: ${C.lineMid};
                        box-shadow: 0 8px 28px rgba(0,0,0,0.04);
                    }
                    .fhms-benefit-left { flex-shrink: 0; }
                    .fhms-benefit-icon {
                        width: 48px; height: 48px; border-radius: 12px;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.brass}; margin-bottom: 0.75rem;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                    }
                    .fhms-benefit-stat {
                        font-family: 'Fraunces', serif;
                        font-size: 1.4rem; color: ${C.text};
                        font-weight: 500; line-height: 1;
                    }
                    .fhms-benefit-stat-label {
                        font-size: 0.7rem; color: ${C.textTer};
                        margin-top: 0.2rem;
                        font-family: 'JetBrains Mono', monospace;
                        letter-spacing: 0.04em;
                    }
                    .fhms-benefit-right { flex: 1; }
                    .fhms-benefit-card h3 {
                        font-size: 1.05rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .fhms-benefit-card p {
                        font-size: 0.88rem; color: ${C.textSec};
                        line-height: 1.7;
                    }

                    /* ── Use Cases ── */
                    .fhms-usecases { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.white}; }
                    .fhms-usecases-glow {
                        position: absolute;
                        bottom: 15%; left: 5%;
                        width: 400px; height: 400px;
                        background: radial-gradient(circle, rgba(61,79,71,0.05) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .fhms-usecases-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .fhms-usecase-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s ease;
                        display: flex; flex-direction: column;
                    }
                    .fhms-usecase-card:hover {
                        border-color: ${C.lineMid};
                        background: ${C.white};
                        transform: translateY(-3px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    }
                    .fhms-usecase-tag {
                        display: inline-flex; align-self: flex-start;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.65rem; letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: ${C.verdigris};
                        background: ${C.verdigrisPale};
                        border: 1px solid ${C.verdigrisPaleBorder};
                        padding: 0.25rem 0.6rem;
                        border-radius: 4px;
                        margin-bottom: 1.25rem;
                    }
                    .fhms-usecase-icon {
                        width: 40px; height: 40px; border-radius: 8px;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.text}; margin-bottom: 1rem;
                    }
                    .fhms-usecase-card h3 {
                        font-size: 1rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .fhms-usecase-card p {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.65;
                        flex: 1;
                    }

                    /* ── Comparison ── */
                    .fhms-comparison { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.bone}; }
                    .fhms-comparison-glow {
                        position: absolute;
                        top: 40%; right: 10%;
                        width: 500px; height: 400px;
                        background: radial-gradient(circle, rgba(61,79,71,0.05) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .fhms-comparison-table-wrap {
                        position: relative; z-index: 2;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 14px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    }
                    .fhms-comparison-table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .fhms-comparison-table thead {
                        background: ${C.bone};
                    }
                    .fhms-comparison-table th {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.72rem;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: ${C.textTer};
                        font-weight: 600;
                        padding: 1.1rem 1.5rem;
                        text-align: left;
                        border-bottom: 1px solid ${C.line};
                    }
                    .fhms-comparison-table th:nth-child(2) {
                        color: ${C.brass};
                        text-align: center;
                    }
                    .fhms-comparison-table th:nth-child(3) {
                        text-align: center;
                        opacity: 0.5;
                    }
                    .fhms-comparison-table td {
                        padding: 1rem 1.5rem;
                        font-size: 0.9rem;
                        border-bottom: 1px solid ${C.lineLight};
                        transition: background 0.2s;
                    }
                    .fhms-comparison-table tr:last-child td { border-bottom: none; }
                    .fhms-comparison-table tr:hover td { background: rgba(139,115,85,0.03); }
                    .fhms-comparison-table td:nth-child(1) {
                        color: ${C.text}; font-weight: 500;
                    }
                    .fhms-comparison-table td:nth-child(2),
                    .fhms-comparison-table td:nth-child(3) {
                        text-align: center;
                    }
                    .fhms-check {
                        display: inline-flex; align-items: center; justify-content: center;
                        width: 26px; height: 26px; border-radius: 6px;
                    }
                    .fhms-check-yes {
                        background: ${C.verdigrisPale};
                        color: ${C.verdigris};
                    }
                    .fhms-check-no {
                        background: ${C.accentPale};
                        color: ${C.accent};
                        opacity: 0.6;
                    }

                    /* ── CTA ── */
                    .fhms-cta { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .fhms-cta-box {
                        position: relative;
                        background: linear-gradient(135deg, ${C.bone} 0%, #F0EDE5 100%);
                        border: 1px solid ${C.line};
                        border-radius: 20px;
                        padding: clamp(3rem, 6vw, 5rem);
                        text-align: center;
                        overflow: hidden;
                    }
                    .fhms-cta-box::before {
                        content: ''; position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 60% 50% at 70% 20%, rgba(139,115,85,0.1) 0%, transparent 70%),
                            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(61,79,71,0.06) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .fhms-cta-box::after {
                        content: ''; position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
                        background-size: 32px 32px;
                        pointer-events: none;
                        mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                        -webkit-mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                    }
                    .fhms-cta-content { position: relative; z-index: 2; }
                    .fhms-cta-box h2 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(1.8rem, 4vw, 2.5rem);
                        color: ${C.text}; font-weight: 500;
                        margin-bottom: 1rem; letter-spacing: '-0.02em';
                    }
                    .fhms-cta-box p {
                        font-size: 1.05rem; color: ${C.textSec};
                        line-height: 1.7;
                        max-width: 560px; margin: 0 auto 2.5rem;
                    }
                    .fhms-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    /* ── Related ── */
                    .fhms-related { padding: clamp(3rem, 6vw, 5rem) 0; background: ${C.white}; }
                    .fhms-related-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1rem;
                    }
                    .fhms-related-link {
                        display: flex; align-items: center; gap: 0.6rem;
                        padding: 1rem 1.25rem;
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 10px;
                        font-size: 0.85rem; color: ${C.textSec};
                        transition: all 0.25s ease;
                        cursor: pointer;
                    }
                    .fhms-related-link:hover {
                        background: ${C.white};
                        border-color: ${C.brassPaleBorder};
                        color: ${C.text};
                        transform: translateX(4px);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    }
                    .fhms-related-link svg { flex-shrink: 0; color: ${C.brass}; opacity: 0.5; transition: opacity 0.2s; }
                    .fhms-related-link:hover svg { opacity: 1; }

                    /* ── Responsive ── */
                    @media (max-width: 1024px) {
                        .fhms-features-grid { grid-template-columns: repeat(2, 1fr); }
                        .fhms-usecases-grid { grid-template-columns: repeat(2, 1fr); }
                        .fhms-hero-stats { display: none; }
                    }
                    @media (max-width: 768px) {
                        .fhms-what-grid { grid-template-columns: 1fr; gap: 2.5rem; }
                        .fhms-benefits-grid { grid-template-columns: 1fr; }
                        .fhms-features-grid { grid-template-columns: 1fr; }
                        .fhms-usecases-grid { grid-template-columns: 1fr; }
                        .fhms-related-grid { grid-template-columns: 1fr; }
                        .fhms-benefit-card { flex-direction: column; gap: 1rem; }
                        .fhms-benefit-left { display: flex; align-items: center; gap: 1rem; }
                        .fhms-benefit-icon { margin-bottom: 0; }
                        .fhms-comparison-table th,
                        .fhms-comparison-table td { padding: 0.75rem 1rem; font-size: 0.82rem; }
                        .fhms-comparison-table th:nth-child(3),
                        .fhms-comparison-table td:nth-child(3) { display: none; }
                    }
                `}</style>

                {/* ═══ HERO ═══ */}
                <section className="fhms-hero">
                    <div className="fhms-hero-glow" />
                    <div className="fhms-hero-grid" />

                    <div className="fhms-container">
                        <div className="fhms-hero-content">
                            <FadeUp>
                                <div className="fhms-hero-breadcrumb">
                                    <Link to="/">Home</Link>
                                    <ChevronRight size={12} />
                                    <Link to="/mortuary-management-software">Solutions</Link>
                                    <ChevronRight size={12} />
                                    <span>Funeral Home ERP</span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={80}>
                                <h1>
                                    <span>Funeral Home Management</span><br />
                                    Software Kenya
                                </h1>
                            </FadeUp>

                            <FadeUp delay={160}>
                                <div className="fhms-hero-subtitle">Complete ERP Solution for Modern Funeral Homes</div>
                            </FadeUp>

                            <FadeUp delay={240}>
                                <p className="fhms-hero-desc">
                                    Rest Point is Kenya's premier <strong>funeral home management software</strong>, providing a
                                    comprehensive <strong>funeral home ERP</strong> system that streamlines every aspect of your
                                    operations. From case management to family services, our <strong>funeral home management system</strong>
                                    helps you serve families with dignity while improving operational efficiency.
                                </p>
                            </FadeUp>

                            <FadeUp delay={320}>
                                <div className="fhms-hero-buttons">
                                    <Link to="/register" className="fhms-btn-primary">
                                        Request Demo <ArrowRight size={16} />
                                    </Link>
                                    <Link to="/contact" className="fhms-btn-outline">Contact Sales</Link>
                                </div>
                            </FadeUp>
                        </div>

                        <div className="fhms-hero-stats">
                            <FadeUp delay={400}>
                                <div className="fhms-hero-stat">
                                    <div className="fhms-hero-stat-value">8-in-1</div>
                                    <div className="fhms-hero-stat-label">Unified Modules</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={500}>
                                <div className="fhms-hero-stat">
                                    <div className="fhms-hero-stat-value">M-Pesa</div>
                                    <div className="fhms-hero-stat-label">Native Payments</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={600}>
                                <div className="fhms-hero-stat">
                                    <div className="fhms-hero-stat-value">24/7</div>
                                    <div className="fhms-hero-stat-label">Family Portal</div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <div className="fhms-divider" />

                {/* ═══ WHAT IS ═══ */}
                <section className="fhms-what">
                    <div className="fhms-container">
                        <div className="fhms-what-grid">
                            <div className="fhms-what-text">
                                <FadeUp>
                                    <SectionLabel>Overview</SectionLabel>
                                    <SectionHeading sub="The evolution from paper ledgers to intelligent, integrated funeral home operations.">
                                        What is Funeral Home Management Software?
                                    </SectionHeading>
                                </FadeUp>
                                <FadeUp delay={100}>
                                    <p>
                                        <strong>Funeral home management software</strong> is an integrated platform designed to help
                                        funeral directors and their teams manage all aspects of funeral service operations. Modern
                                        <strong> funeral home technology</strong> has evolved beyond simple record-keeping to become
                                        a complete enterprise resource planning (ERP) solution for funeral homes.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={200}>
                                    <p>
                                        The <strong>best funeral home software</strong> like Rest Point combines case management,
                                        family communication, billing, inventory control, and compliance reporting into one seamless
                                        system. Whether you're a small independent funeral home or a large multi-location operation
                                        in Kenya, our software adapts to your needs.
                                    </p>
                                </FadeUp>
                            </div>

                            <div className="fhms-what-visual">
                                <FadeUp delay={200}>
                                    {[
                                        { num: '01', title: 'Case Intake & Tracking', desc: 'From first call to final disposition' },
                                        { num: '02', title: 'Family Communication', desc: 'Secure portal for service planning' },
                                        { num: '03', title: 'Financial Management', desc: 'Invoicing, M-Pesa, and reporting' },
                                        { num: '04', title: 'Inventory & Merchandise', desc: 'Caskets, urns, flowers tracking' },
                                        { num: '05', title: 'Regulatory Compliance', desc: 'Certificates, permits, audits' },
                                        { num: '06', title: 'Staff & Resource Planning', desc: 'Scheduling, roles, certifications' },
                                    ].map((item, i) => (
                                        <div className="fhms-what-visual-item" key={i}>
                                            <div className="fhms-what-visual-num">{item.num}</div>
                                            <div>
                                                <div className="fhms-what-visual-title">{item.title}</div>
                                                <div className="fhms-what-visual-desc">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </FadeUp>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="fhms-divider" />

                {/* ═══ FEATURES ═══ */}
                <section className="fhms-features">
                    <div className="fhms-features-glow" />
                    <div className="fhms-container">
                        <FadeUp>
                            <SectionLabel>Capabilities</SectionLabel>
                            <SectionHeading sub="Eight integrated modules covering every dimension of funeral home operations.">
                                Complete Funeral Home Management System Features
                            </SectionHeading>
                        </FadeUp>

                        <div className="fhms-features-grid">
                            {features.map((f, i) => (
                                <FadeUp key={i} delay={i * 70}>
                                    <div className="fhms-feature-card">
                                        <div className="fhms-feature-icon">{f.icon}</div>
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="fhms-divider" />

                {/* ═══ BENEFITS ═══ */}
                <section className="fhms-benefits">
                    <div className="fhms-container">
                        <FadeUp>
                            <SectionLabel>Advantages</SectionLabel>
                            <SectionHeading sub="Why Kenyan funeral homes choose Rest Point over generic alternatives.">
                                Why Choose Rest Point for Your Funeral Home?
                            </SectionHeading>
                        </FadeUp>

                        <div className="fhms-benefits-grid">
                            {benefits.map((b, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="fhms-benefit-card">
                                        <div className="fhms-benefit-left">
                                            <div className="fhms-benefit-icon">{b.icon}</div>
                                            <div>
                                                <div className="fhms-benefit-stat">{b.stat}</div>
                                                <div className="fhms-benefit-stat-label">{b.statLabel}</div>
                                            </div>
                                        </div>
                                        <div className="fhms-benefit-right">
                                            <h3>{b.title}</h3>
                                            <p>{b.desc}</p>
                                        </div>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="fhms-divider" />

                {/* ═══ USE CASES ═══ */}
                <section className="fhms-usecases">
                    <div className="fhms-usecases-glow" />
                    <div className="fhms-container">
                        <FadeUp>
                            <SectionLabel>Deployments</SectionLabel>
                            <SectionHeading sub="From single-location independents to multi-branch funeral enterprises.">
                                Who Uses Our Funeral Home Management Software?
                            </SectionHeading>
                        </FadeUp>

                        <div className="fhms-usecases-grid">
                            {useCases.map((u, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="fhms-usecase-card">
                                        <span className="fhms-usecase-tag">{u.tag}</span>
                                        <div className="fhms-usecase-icon">{u.icon}</div>
                                        <h3>{u.title}</h3>
                                        <p>{u.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="fhms-divider" />

                {/* ═══ COMPARISON ═══ */}
                <section className="fhms-comparison">
                    <div className="fhms-comparison-glow" />
                    <div className="fhms-container">
                        <FadeUp>
                            <SectionLabel>Comparison</SectionLabel>
                            <SectionHeading sub="See how purpose-built software compares to generic business tools.">
                                Why Rest Point is the Best Funeral Home Software in Kenya
                            </SectionHeading>
                        </FadeUp>

                        <FadeUp delay={150}>
                            <div className="fhms-comparison-table-wrap">
                                <table className="fhms-comparison-table">
                                    <thead>
                                        <tr>
                                            <th>Feature</th>
                                            <th>Rest Point</th>
                                            <th>Generic Software</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisons.map((row, i) => (
                                            <tr key={i}>
                                                <td>{row.feature}</td>
                                                <td>
                                                    <span className="fhms-check fhms-check-yes">
                                                        <CheckCircle2 size={16} />
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="fhms-check fhms-check-no">
                                                        <X size={16} />
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                <div className="fhms-divider" />

                {/* ═══ CTA ═══ */}
                <section className="fhms-cta">
                    <div className="fhms-container">
                        <FadeUp>
                            <div className="fhms-cta-box">
                                <div className="fhms-cta-content">
                                    <h2>Ready to Transform Your Funeral Home Operations?</h2>
                                    <p>
                                        Join Kenya's leading funeral homes that trust Rest Point. Schedule a free
                                        demo and see how we can help you serve families better.
                                    </p>
                                    <div className="fhms-cta-buttons">
                                        <Link to="/register" className="fhms-btn-primary">
                                            Get Free Demo <ArrowRight size={16} />
                                        </Link>
                                        <Link to="/pricing" className="fhms-btn-outline">
                                            View Pricing Plans <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                <div className="fhms-divider" />

                {/* ═══ RELATED ═══ */}
                <section className="fhms-related">
                    <div className="fhms-container">
                        <FadeUp>
                            <SectionLabel>Explore</SectionLabel>
                            <SectionHeading sub="">Learn More About Funeral Home Management</SectionHeading>
                        </FadeUp>

                        <div className="fhms-related-grid">
                            {relatedLinks.map((r, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <Link to={r.to} className="fhms-related-link">
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

export default FuneralHomeManagementSoftware;