import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, ExternalLink, GitBranch, Thermometer, Receipt, BarChart3, MessageSquare, Flag, ShieldCheck, Smartphone, Zap, Building2, Heart, Users } from '../../utils/icons/icons';

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

const MortuaryManagementSoftware = () => {
    const features = [
        { icon: <Users size={22} />, title: 'Deceased Records Management', desc: 'Maintain comprehensive digital records for all deceased individuals. Track personal information, cause of death, next of kin details, and case status securely.' },
        { icon: <GitBranch size={22} />, title: 'Case Tracking & Workflow', desc: 'Monitor each case from admission to release. Track the complete lifecycle including preservation, autopsy, identification, and release processes.' },
        { icon: <Thermometer size={22} />, title: 'Cold Room Management', desc: 'Monitor storage capacity across multiple cold rooms. Track body locations, storage duration, and receive alerts when capacity approaches limits.' },
        { icon: <Receipt size={22} />, title: 'Billing & Payment Processing', desc: 'Generate accurate bills for mortuary services, storage, and additional procedures. Integrate with M-Pesa for seamless payment collection.' },
        { icon: <BarChart3 size={22} />, title: 'Reporting & Analytics', desc: 'Generate detailed reports on mortuary operations, capacity utilization, revenue, and compliance metrics to make data-driven decisions.' },
        { icon: <MessageSquare size={22} />, title: 'Family Communication Portal', desc: 'Keep families informed with automated notifications via SMS. Provide online access to case updates, documents, and payment receipts.' },
    ];

    const benefits = [
        { icon: <Flag size={24} />, title: 'Built for Kenya', desc: 'Designed specifically for Kenyan mortuaries with local compliance requirements, M-Pesa integration, and support for Swahili and English languages.', stat: 'KE', statLabel: 'Local compliance' },
        { icon: <ShieldCheck size={24} />, title: 'Secure & Compliant', desc: 'Bank-grade security with AES-256 encryption. Compliant with Kenyan health regulations and data protection laws.', stat: '256-bit', statLabel: 'Encryption' },
        { icon: <Smartphone size={24} />, title: 'Mobile Access', desc: 'Access mortuary records from anywhere using our mobile-responsive platform. Update case information on-the-go with our dedicated app.', stat: '100%', statLabel: 'Responsive' },
        { icon: <Zap size={24} />, title: 'Fast Implementation', desc: 'Get up and running in 1-2 weeks. Our team provides data migration, training, and 24/7 support to ensure smooth adoption.', stat: '1-2 Wks', statLabel: 'Setup time' },
    ];

    const useCases = [
        { icon: <Building size={20} />, title: 'Hospital Morgues', desc: 'Large hospitals in Nairobi, Mombasa, and Kisumu use Rest Point to manage high-volume mortuary operations with multiple cold rooms.', tag: 'High-Volume' },
        { icon: <Building2 size={20} />, title: 'Private Mortuaries', desc: 'Independent mortuary operators rely on our software to streamline operations, reduce paperwork, and provide better service to families.', tag: 'Independent' },
        { icon: <Landmark size={20} />, title: 'County Facilities', desc: 'County-run mortuaries use Rest Point to improve transparency, accountability, and service delivery while maintaining regulatory compliance.', tag: 'Government' },
        { icon: <Heart size={20} />, title: 'Funeral Homes', desc: 'Funeral homes integrate with our system to coordinate body transfers, manage pre-burial arrangements, and maintain complete documentation.', tag: 'End-to-End' },
    ];

    const relatedLinks = [
        { to: '/blog/what-is-mortuary-management-system', label: 'What is a Mortuary Management System?' },
        { to: '/blog/functions-of-mortuary-department', label: 'Functions of a Mortuary Department' },
        { to: '/hospital-mortuary-software', label: 'Hospital Mortuary Software' },
        { to: '/hearse-management', label: 'Hearse Management Software' },
    ];

    return (
        <>
            <Helmet>
                <title>Mortuary Management Software Kenya | Best Mortuary Information Management System</title>
                <meta name="description" content="Rest Point is Kenya's #1 mortuary management software and mortuary information management system. Streamline mortuary operations, manage deceased records, and improve mortuary technology. Trusted by 500+ facilities across Kenya." />
                <meta name="keywords" content="mortuary management software, mortuary information management system, mortuary kenya, mortuary technology, morgue management system, mortuary software, mortuary information system, best mortuary software kenya" />
                <link rel="canonical" href="https://restpoint.co.ke/mortuary-management-software" />
            </Helmet>

            <div className="mms-page">
                <style>{`
                    .mms-page {
                        background: ${C.white};
                        color: ${C.textSec};
                        font-family: 'Inter', sans-serif;
                        overflow-x: hidden;
                    }
                    .mms-page .mms-container {
                        max-width: 1180px;
                        margin: 0 auto;
                        padding: 0 clamp(1.25rem, 5vw, 2.5rem);
                    }
                    .mms-page a { text-decoration: none; }

                    .mms-divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.line} 20%, ${C.line} 80%, transparent);
                    }

                    /* ── Hero ── */
                    .mms-hero {
                        position: relative;
                        padding: clamp(6rem, 12vw, 10rem) 0 clamp(5rem, 10vw, 8rem);
                        overflow: hidden;
                        background: ${C.bone};
                    }
                    .mms-hero-glow {
                        position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 60% 50% at 25% 15%, rgba(139,115,85,0.12) 0%, transparent 60%),
                            radial-gradient(ellipse 40% 40% at 80% 85%, rgba(61,79,71,0.08) 0%, transparent 60%);
                        pointer-events: none;
                    }
                    .mms-hero-grid {
                        position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                        background-size: 48px 48px;
                        mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mms-hero-content {
                        position: relative; z-index: 2;
                        max-width: 800px;
                    }
                    .mms-hero-breadcrumb {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.72rem; color: ${C.textTer};
                        margin-bottom: 2rem; letter-spacing: 0.02em;
                    }
                    .mms-hero-breadcrumb a { color: ${C.brass}; transition: color 0.2s; }
                    .mms-hero-breadcrumb a:hover { color: ${C.text}; }
                    .mms-hero h1 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(2.2rem, 5.5vw, 3.6rem);
                        color: ${C.text};
                        font-weight: 500;
                        line-height: 1.1;
                        letter-spacing: -0.03em;
                        margin-bottom: 1.25rem;
                    }
                    .mms-hero h1 span {
                        background: linear-gradient(135deg, ${C.brass}, ${C.accent});
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    .mms-hero-subtitle {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.85rem;
                        color: ${C.brass};
                        margin-bottom: 1.5rem;
                        letter-spacing: 0.04em;
                    }
                    .mms-hero-desc {
                        font-size: 1.05rem;
                        color: ${C.textSec};
                        line-height: 1.8;
                        margin-bottom: 2.5rem;
                        max-width: 640px;
                    }
                    .mms-hero-desc strong { color: ${C.text}; font-weight: 600; }
                    .mms-hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

                    .mms-btn-primary {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: ${C.brass}; color: ${C.white}; border: none;
                        padding: 0.85rem 2rem; border-radius: 8px;
                        font-size: 0.9rem; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .mms-btn-primary:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,115,85,0.25); }

                    .mms-btn-outline {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.textSec};
                        border: 1px solid ${C.line}; padding: 0.85rem 2rem;
                        border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .mms-btn-outline:hover { border-color: ${C.textTer}; color: ${C.text}; transform: translateY(-2px); }

                    /* Hero Stats */
                    .mms-hero-stats {
                        position: absolute;
                        right: clamp(1.25rem, 5vw, 2.5rem);
                        top: 50%; transform: translateY(-50%);
                        display: flex; flex-direction: column; gap: 1.25rem;
                        z-index: 2;
                    }
                    .mms-hero-stat {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 10px;
                        padding: 1rem 1.25rem;
                        text-align: right;
                        min-width: 160px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                        transition: all 0.3s ease;
                    }
                    .mms-hero-stat:hover { border-color: ${C.lineMid}; box-shadow: 0 8px 30px rgba(0,0,0,0.07); transform: translateY(-2px); }
                    .mms-hero-stat-value {
                        font-family: 'Fraunces', serif;
                        font-size: 1.6rem; color: ${C.text};
                        font-weight: 500; line-height: 1;
                    }
                    .mms-hero-stat-label {
                        font-size: 0.72rem; color: ${C.textTer};
                        margin-top: 0.3rem;
                    }

                    /* ── What Is ── */
                    .mms-what { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .mms-what-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 4rem;
                        align-items: start;
                    }
                    .mms-what-text p {
                        font-size: 1rem; line-height: 1.8;
                        color: ${C.textSec};
                        margin-bottom: 1.25rem;
                    }
                    .mms-what-text p strong { color: ${C.text}; font-weight: 600; }
                    .mms-what-visual {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 14px;
                        padding: 2rem;
                        position: relative; overflow: hidden;
                    }
                    .mms-what-visual::before {
                        content: '';
                        position: absolute; top: -50%; left: -50%;
                        width: 200%; height: 200%;
                        background: radial-gradient(circle at 30% 30%, rgba(139,115,85,0.06) 0%, transparent 50%);
                        pointer-events: none;
                    }
                    .mms-what-visual-item {
                        display: flex; align-items: flex-start; gap: 1rem;
                        padding: 1rem 0;
                        border-bottom: 1px solid ${C.line};
                        position: relative;
                    }
                    .mms-what-visual-item:last-child { border-bottom: none; }
                    .mms-what-visual-num {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.7rem; color: ${C.brass};
                        background: ${C.brassPale};
                        border: 1px solid ${C.brassPaleBorder};
                        width: 28px; height: 28px; border-radius: 6px;
                        display: flex; align-items: center; justify-content: center;
                        flex-shrink: 0; margin-top: 2px;
                    }
                    .mms-what-visual-title {
                        font-size: 0.9rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.25rem;
                    }
                    .mms-what-visual-desc {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.6;
                    }

                    /* ── Features ── */
                    .mms-features { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.bone}; }
                    .mms-features-glow {
                        position: absolute;
                        top: 30%; left: 40%; transform: translate(-50%, -50%);
                        width: 700px; height: 500px;
                        background: radial-gradient(ellipse, rgba(139,115,85,0.06) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mms-features-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .mms-feature-card {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
                        position: relative; overflow: hidden;
                    }
                    .mms-feature-card::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 2px;
                        background: linear-gradient(90deg, transparent, ${C.brass}, transparent);
                        opacity: 0; transition: opacity 0.35s ease;
                    }
                    .mms-feature-card:hover {
                        border-color: ${C.brassPaleBorder};
                        transform: translateY(-4px);
                        box-shadow: 0 12px 32px rgba(0,0,0,0.06);
                    }
                    .mms-feature-card:hover::before { opacity: 1; }
                    .mms-feature-icon {
                        width: 40px; height: 40px; border-radius: 9px;
                        background: ${C.brassPale};
                        border: 1px solid ${C.brassPaleBorder};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.brass};
                        margin-bottom: 1.1rem;
                        transition: all 0.35s ease;
                    }
                    .mms-feature-card:hover .mms-feature-icon {
                        background: rgba(139,115,85,0.14);
                    }
                    .mms-feature-card h3 {
                        font-size: 0.95rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                        line-height: 1.3;
                    }
                    .mms-feature-card p {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.65;
                    }

                    /* ── Benefits ── */
                    .mms-benefits { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .mms-benefits-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                    }
                    .mms-benefit-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 2rem;
                        display: flex; gap: 1.5rem;
                        align-items: flex-start;
                        transition: all 0.35s ease;
                    }
                    .mms-benefit-card:hover {
                        border-color: ${C.lineMid};
                        box-shadow: 0 8px 28px rgba(0,0,0,0.04);
                    }
                    .mms-benefit-left { flex-shrink: 0; }
                    .mms-benefit-icon {
                        width: 48px; height: 48px; border-radius: 12px;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.brass}; margin-bottom: 0.75rem;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                    }
                    .mms-benefit-stat {
                        font-family: 'Fraunces', serif;
                        font-size: 1.4rem; color: ${C.text};
                        font-weight: 500; line-height: 1;
                    }
                    .mms-benefit-stat-label {
                        font-size: 0.7rem; color: ${C.textTer};
                        margin-top: 0.2rem;
                        font-family: 'JetBrains Mono', monospace;
                        letter-spacing: 0.04em;
                    }
                    .mms-benefit-right { flex: 1; }
                    .mms-benefit-card h3 {
                        font-size: 1.05rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .mms-benefit-card p {
                        font-size: 0.88rem; color: ${C.textSec};
                        line-height: 1.7;
                    }

                    /* ── Use Cases ── */
                    .mms-usecases { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.white}; }
                    .mms-usecases-glow {
                        position: absolute;
                        bottom: 15%; right: 5%;
                        width: 400px; height: 400px;
                        background: radial-gradient(circle, rgba(61,79,71,0.05) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mms-usecases-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .mms-usecase-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s ease;
                        display: flex; flex-direction: column;
                    }
                    .mms-usecase-card:hover {
                        border-color: ${C.lineMid};
                        background: ${C.white};
                        transform: translateY(-3px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    }
                    .mms-usecase-tag {
                        display: inline-flex; align-self: flex-start;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.65rem; letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: ${C.brass};
                        background: ${C.brassPale};
                        border: 1px solid ${C.brassPaleBorder};
                        padding: 0.25rem 0.6rem;
                        border-radius: 4px;
                        margin-bottom: 1.25rem;
                    }
                    .mms-usecase-icon {
                        width: 40px; height: 40px; border-radius: 8px;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.text}; margin-bottom: 1rem;
                    }
                    .mms-usecase-card h3 {
                        font-size: 1rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .mms-usecase-card p {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.65;
                        flex: 1;
                    }

                    /* ── CTA ── */
                    .mms-cta { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .mms-cta-box {
                        position: relative;
                        background: linear-gradient(135deg, ${C.bone} 0%, #F0ECE3 100%);
                        border: 1px solid ${C.line};
                        border-radius: 20px;
                        padding: clamp(3rem, 6vw, 5rem);
                        text-align: center;
                        overflow: hidden;
                    }
                    .mms-cta-box::before {
                        content: ''; position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 60% 50% at 30% 20%, rgba(139,115,85,0.08) 0%, transparent 70%),
                            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(61,79,71,0.06) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .mms-cta-box::after {
                        content: ''; position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
                        background-size: 32px 32px;
                        pointer-events: none;
                        mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                        -webkit-mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                    }
                    .mms-cta-content { position: relative; z-index: 2; }
                    .mms-cta-box h2 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(1.8rem, 4vw, 2.5rem);
                        color: ${C.text}; font-weight: 500;
                        margin-bottom: 1rem; letter-spacing: '-0.02em';
                    }
                    .mms-cta-box p {
                        font-size: 1.05rem; color: ${C.textSec};
                        line-height: 1.7;
                        max-width: 560px; margin: 0 auto 2.5rem;
                    }
                    .mms-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    /* ── Related ── */
                    .mms-related { padding: clamp(3rem, 6vw, 5rem) 0; background: ${C.white}; }
                    .mms-related-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1rem;
                    }
                    .mms-related-link {
                        display: flex; align-items: center; gap: 0.6rem;
                        padding: 1rem 1.25rem;
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 10px;
                        font-size: 0.85rem; color: ${C.textSec};
                        transition: all 0.25s ease;
                        cursor: pointer;
                    }
                    .mms-related-link:hover {
                        background: ${C.white};
                        border-color: ${C.brassPaleBorder};
                        color: ${C.text};
                        transform: translateX(4px);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    }
                    .mms-related-link svg { flex-shrink: 0; color: ${C.brass}; opacity: 0.5; transition: opacity 0.2s; }
                    .mms-related-link:hover svg { opacity: 1; }

                    /* ── Responsive ── */
                    @media (max-width: 1024px) {
                        .mms-features-grid { grid-template-columns: repeat(2, 1fr); }
                        .mms-usecases-grid { grid-template-columns: repeat(2, 1fr); }
                        .mms-hero-stats { display: none; }
                    }
                    @media (max-width: 768px) {
                        .mms-what-grid { grid-template-columns: 1fr; gap: 2.5rem; }
                        .mms-benefits-grid { grid-template-columns: 1fr; }
                        .mms-features-grid { grid-template-columns: 1fr; }
                        .mms-usecases-grid { grid-template-columns: 1fr; }
                        .mms-related-grid { grid-template-columns: 1fr; }
                        .mms-benefit-card { flex-direction: column; gap: 1rem; }
                        .mms-benefit-left { display: flex; align-items: center; gap: 1rem; }
                        .mms-benefit-icon { margin-bottom: 0; }
                    }
                `}</style>

                {/* ═══ HERO ═══ */}
                <section className="mms-hero">
                    <div className="mms-hero-glow" />
                    <div className="mms-hero-grid" />

                    <div className="mms-container">
                        <div className="mms-hero-content">
                            <FadeUp>
                                <div className="mms-hero-breadcrumb">
                                    <Link to="/">Home</Link>
                                    <ChevronRight size={12} />
                                    <span>Mortuary Management</span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={80}>
                                <h1>
                                    <span>Mortuary Management</span><br />
                                    Software Kenya
                                </h1>
                            </FadeUp>

                            <FadeUp delay={160}>
                                <div className="mms-hero-subtitle">Complete Mortuary Information Management System for Modern Facilities</div>
                            </FadeUp>

                            <FadeUp delay={240}>
                                <p className="mms-hero-desc">
                                    Rest Point is Kenya's leading <strong>mortuary management software</strong>, designed to streamline
                                    mortuary operations, enhance record-keeping, and improve service delivery. Our comprehensive
                                    <strong> mortuary information management system</strong> helps facilities manage deceased records,
                                    track cases, and maintain compliance with Kenyan regulations.
                                </p>
                            </FadeUp>

                            <FadeUp delay={320}>
                                <div className="mms-hero-buttons">
                                    <Link to="/register" className="mms-btn-primary">
                                        Request Demo <ArrowRight size={16} />
                                    </Link>
                                    <Link to="/contact" className="mms-btn-outline">Contact Sales</Link>
                                </div>
                            </FadeUp>
                        </div>

                        <div className="mms-hero-stats">
                            <FadeUp delay={400}>
                                <div className="mms-hero-stat">
                                    <div className="mms-hero-stat-value">500+</div>
                                    <div className="mms-hero-stat-label">Trusted Facilities</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={500}>
                                <div className="mms-hero-stat">
                                    <div className="mms-hero-stat-value">AES-256</div>
                                    <div className="mms-hero-stat-label">Data Encryption</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={600}>
                                <div className="mms-hero-stat">
                                    <div className="mms-hero-stat-value">1-2 Wks</div>
                                    <div className="mms-hero-stat-label">Avg. Setup Time</div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <div className="mms-divider" />

                {/* ═══ WHAT IS ═══ */}
                <section className="mms-what">
                    <div className="mms-container">
                        <div className="mms-what-grid">
                            <div className="mms-what-text">
                                <FadeUp>
                                    <SectionLabel>Overview</SectionLabel>
                                    <SectionHeading sub="The evolution from paper ledgers to intelligent, compliant mortuary operations.">
                                        What is Mortuary Management Software?
                                    </SectionHeading>
                                </FadeUp>
                                <FadeUp delay={100}>
                                    <p>
                                        <strong>Mortuary management software</strong> is a specialized digital solution designed to help
                                        mortuary facilities, hospital morgues, and funeral homes manage their daily operations efficiently.
                                        Modern <strong>mortuary technology</strong> has transformed how facilities in Kenya handle deceased
                                        records, case management, billing, and family communications.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={200}>
                                    <p>
                                        A comprehensive <strong>mortuary information management system</strong> like Rest Point provides
                                        tools for tracking deceased individuals, managing autopsy records, coordinating with funeral
                                        directors, and ensuring compliance with health regulations. Whether you're operating a small
                                        private mortuary or a large hospital morgue in Kenya, our software scales to meet your needs.
                                    </p>
                                </FadeUp>
                            </div>

                            <div className="mms-what-visual">
                                <FadeUp delay={200}>
                                    {[
                                        { num: '01', title: 'Admission & Intake', desc: 'Digital registration with next-of-kin' },
                                        { num: '02', title: 'Preservation & Storage', desc: 'Cold room assignment & monitoring' },
                                        { num: '03', title: 'Identification & Autopsy', desc: 'Track procedures and documentation' },
                                        { num: '04', title: 'Billing & Payments', desc: 'Automated invoicing & M-Pesa' },
                                        { num: '05', title: 'Release & Transfer', desc: 'Verification, documentation & handoff' },
                                        { num: '06', title: 'Reporting & Compliance', desc: 'Audit trails & regulatory reports' },
                                    ].map((item, i) => (
                                        <div className="mms-what-visual-item" key={i}>
                                            <div className="mms-what-visual-num">{item.num}</div>
                                            <div>
                                                <div className="mms-what-visual-title">{item.title}</div>
                                                <div className="mms-what-visual-desc">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </FadeUp>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mms-divider" />

                {/* ═══ FEATURES ═══ */}
                <section className="mms-features">
                    <div className="mms-features-glow" />
                    <div className="mms-container">
                        <FadeUp>
                            <SectionLabel>Capabilities</SectionLabel>
                            <SectionHeading sub="Six core modules powering modern mortuary operations.">
                                Key Features of Our Mortuary Management System
                            </SectionHeading>
                        </FadeUp>

                        <div className="mms-features-grid">
                            {features.map((f, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <div className="mms-feature-card">
                                        <div className="mms-feature-icon">{f.icon}</div>
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mms-divider" />

                {/* ═══ BENEFITS ═══ */}
                <section className="mms-benefits">
                    <div className="mms-container">
                        <FadeUp>
                            <SectionLabel>Advantages</SectionLabel>
                            <SectionHeading sub="Why Kenyan facilities choose Rest Point over generic systems.">
                                Why Choose Rest Point Mortuary Software?
                            </SectionHeading>
                        </FadeUp>

                        <div className="mms-benefits-grid">
                            {benefits.map((b, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="mms-benefit-card">
                                        <div className="mms-benefit-left">
                                            <div className="mms-benefit-icon">{b.icon}</div>
                                            <div>
                                                <div className="mms-benefit-stat">{b.stat}</div>
                                                <div className="mms-benefit-stat-label">{b.statLabel}</div>
                                            </div>
                                        </div>
                                        <div className="mms-benefit-right">
                                            <h3>{b.title}</h3>
                                            <p>{b.desc}</p>
                                        </div>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mms-divider" />

                {/* ═══ USE CASES ═══ */}
                <section className="mms-usecases">
                    <div className="mms-usecases-glow" />
                    <div className="mms-container">
                        <FadeUp>
                            <SectionLabel>Deployments</SectionLabel>
                            <SectionHeading sub="From private facilities to county-wide healthcare networks.">
                                Who Uses Our Mortuary Management System?
                            </SectionHeading>
                        </FadeUp>

                        <div className="mms-usecases-grid">
                            {useCases.map((u, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="mms-usecase-card">
                                        <span className="mms-usecase-tag">{u.tag}</span>
                                        <div className="mms-usecase-icon">{u.icon}</div>
                                        <h3>{u.title}</h3>
                                        <p>{u.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mms-divider" />

                {/* ═══ CTA ═══ */}
                <section className="mms-cta">
                    <div className="mms-container">
                        <FadeUp>
                            <div className="mms-cta-box">
                                <div className="mms-cta-content">
                                    <h2>Ready to Modernize Your Mortuary Operations?</h2>
                                    <p>
                                        Join 500+ organizations across Kenya that trust Rest Point for their mortuary
                                        management needs. Get started with a free demo today.
                                    </p>
                                    <div className="mms-cta-buttons">
                                        <Link to="/register" className="mms-btn-primary">
                                            Get Free Demo <ArrowRight size={16} />
                                        </Link>
                                        <Link to="/pricing" className="mms-btn-outline">
                                            View Pricing <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                <div className="mms-divider" />

                {/* ═══ RELATED ═══ */}
                <section className="mms-related">
                    <div className="mms-container">
                        <FadeUp>
                            <SectionLabel>Explore</SectionLabel>
                            <SectionHeading sub="">Learn More About Mortuary Management</SectionHeading>
                        </FadeUp>

                        <div className="mms-related-grid">
                            {relatedLinks.map((r, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <Link to={r.to} className="mms-related-link">
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

export default MortuaryManagementSoftware;