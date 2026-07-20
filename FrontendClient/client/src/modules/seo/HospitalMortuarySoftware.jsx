import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Thermometer, FileText, Activity, Fingerprint, BarChart3, Zap, Lock, Server, ChevronRight, CheckCircle, Building2, Heart, Cross, ExternalLink } from '../../utils/icons/icons';

const C = {
    ink: '#000000',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    verdigrisTint: '#EBEFEF',
    line: '#E3DDD0',
    lineDark: 'rgba(255,255,255,0.08)',
    lineDarkHover: 'rgba(255,255,255,0.15)',
    gray: '#8A8780',
    grayLight: 'rgba(255,255,255,0.6)',
    accent: '#C77B5E',
};

const Mark = ({ size = 24, color = C.bone }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
        <path d="M16 8V24M8 16H24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3.5" fill={color} />
    </svg>
);

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
        color: C.brassLight, marginBottom: '1.25rem',
    }}>
        <span style={{ width: 24, height: 1, background: C.brass, display: 'inline-block' }} />
        {children}
    </div>
);

const SectionHeading = ({ children, sub }) => (
    <div style={{ marginBottom: '3.5rem' }}>
        <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: C.bone, fontWeight: 500, lineHeight: 1.2,
            letterSpacing: '-0.02em', marginBottom: sub ? '1rem' : 0,
        }}>{children}</h2>
        {sub && <p style={{ fontSize: '1.05rem', color: C.grayLight, lineHeight: 1.7, maxWidth: 620, opacity: 0.8 }}>{sub}</p>}
    </div>
);

const HospitalMortuarySoftware = () => {
    const features = [
        { icon: <Activity size={22} />, title: 'HIS Integration', desc: 'Seamlessly integrate with hospital information systems for automatic patient data transfer, reducing manual entry and ensuring data accuracy across departments.' },
        { icon: <Thermometer size={22} />, title: 'Multi-Cold Room Management', desc: 'Monitor and manage multiple cold rooms with different temperature zones. Track body locations, storage duration, and capacity in real-time.' },
        { icon: <FileText size={22} />, title: 'Autopsy & Pathology Tracking', desc: 'Manage autopsy requests, track pathology samples, and coordinate with laboratory systems for comprehensive case documentation.' },
        { icon: <Zap size={22} />, title: 'High-Volume Case Handling', desc: 'Handle peak loads during emergencies, epidemics, or disasters with batch processing, queue management, and priority case handling.' },
        { icon: <Fingerprint size={22} />, title: 'Identity Verification', desc: 'Implement robust identification protocols with biometric verification, photo documentation, and next-of-kin confirmation workflows.' },
        { icon: <BarChart3 size={22} />, title: 'Compliance & Reporting', desc: 'Generate mandatory reports for health authorities, track notifiable diseases, and maintain compliance with Kenyan healthcare regulations.' },
    ];

    const benefits = [
        { icon: <Building2 size={24} />, title: 'Healthcare-Focused', desc: 'Purpose-built for hospital environments with integration capabilities for HIS, EHR, and laboratory information management systems.', stat: '12+', statLabel: 'HIS integrations' },
        { icon: <Zap size={24} />, title: 'High Performance', desc: 'Handle thousands of cases annually with our robust, scalable platform designed for high-volume hospital mortuary operations.', stat: '50K+', statLabel: 'Cases managed' },
        { icon: <Lock size={24} />, title: 'HIPAA & Data Protection', desc: 'Meet healthcare data protection requirements with end-to-end encryption, audit trails, and role-based access controls.', stat: '256-bit', statLabel: 'Encryption' },
        { icon: <Monitor size={24} />, title: 'Real-Time Dashboards', desc: 'Give hospital administrators real-time visibility into mortuary operations, capacity, and performance metrics.', stat: '<2s', statLabel: 'Data refresh' },
    ];

    const useCases = [
        { icon: <Building2 size={20} />, title: 'National Hospitals', desc: 'Kenyatta National Hospital, Moi Teaching and Referral Hospital, and other major hospitals use Rest Point to manage complex mortuary operations.', tag: 'Level 6' },
        { icon: <Heart size={20} />, title: 'County Hospitals', desc: 'County referral hospitals across Kenya rely on our software to standardize mortuary operations and improve service delivery.', tag: 'Level 5' },
        { icon: <Shield size={20} />, title: 'Private Hospitals', desc: 'Private healthcare facilities use Rest Point to provide premium mortuary services while maintaining operational efficiency.', tag: 'Private' },
        { icon: <Cross size={20} />, title: 'Mission Hospitals', desc: 'Faith-based and mission hospitals trust Rest Point for affordable, reliable mortuary management that aligns with their service mission.', tag: 'Faith-Based' },
    ];

    const relatedLinks = [
        { to: '/mortuary-management-software', label: 'Mortuary Management Software' },
        { to: '/blog/functions-of-mortuary-department', label: 'Functions of Mortuary Department' },
        { to: '/hearse-management', label: 'Hearse Management Software' },
        { to: '/blog/what-is-mortuary-management-system', label: 'What is a Mortuary Management System?' },
    ];

    return (
        <>
            <Helmet>
                <title>Hospital Mortuary Software Kenya | Modern Morgue Management System</title>
                <meta name="description" content="Rest Point is Kenya's leading hospital mortuary software and morgue management system. Purpose-built for hospital morgues with mortuary technology, case tracking, and compliance management. Trusted by major hospitals in Nairobi, Mombasa, Kisumu." />
                <meta name="keywords" content="hospital mortuary software, hospital morgue software, mortuary technology, morgue management system, mortuary software, mortuary case management, hospital mortuary system, best mortuary software kenya, mortuary information system" />
                <link rel="canonical" href="https://restpoint.co.ke/hospital-mortuary-software" />
            </Helmet>

            <div className="hms-page">
                <style>{`
                    /* ── Base ── */
                    .hms-page {
                        background: #000;
                        color: ${C.grayLight};
                        font-family: 'Inter', sans-serif;
                        overflow-x: hidden;
                    }
                    .hms-page .hms-container {
                        max-width: 1180px;
                        margin: 0 auto;
                        padding: 0 clamp(1.25rem, 5vw, 2.5rem);
                    }
                    .hms-page a { text-decoration: none; }

                    /* ── Hero ── */
                    .hms-hero {
                        position: relative;
                        padding: clamp(6rem, 12vw, 10rem) 0 clamp(5rem, 10vw, 8rem);
                        overflow: hidden;
                    }
                    .hms-hero-glow {
                        position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(61,79,71,0.35) 0%, transparent 70%),
                            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(139,115,85,0.12) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-hero-grid {
                        position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
                        background-size: 48px 48px;
                        mask-image: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 70%);
                        -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-hero-line {
                        position: absolute;
                        bottom: 0; left: 0; right: 0;
                        height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.lineDark} 20%, ${C.lineDark} 80%, transparent);
                    }
                    .hms-hero-content {
                        position: relative; z-index: 2;
                        max-width: 800px;
                    }
                    .hms-hero-breadcrumb {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.72rem; color: ${C.grayLight}; opacity: 0.6;
                        margin-bottom: 2rem; letter-spacing: 0.02em;
                    }
                    .hms-hero-breadcrumb a { color: ${C.brassLight}; transition: color 0.2s; }
                    .hms-hero-breadcrumb a:hover { color: ${C.bone}; }
                    .hms-hero h1 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(2.2rem, 5.5vw, 3.6rem);
                        color: ${C.bone};
                        font-weight: 500;
                        line-height: 1.1;
                        letter-spacing: -0.03em;
                        margin-bottom: 1.25rem;
                    }
                    .hms-hero h1 span {
                        background: linear-gradient(135deg, ${C.brassLight}, ${C.accent});
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    .hms-hero-subtitle {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.85rem;
                        color: ${C.verdigrisLight};
                        margin-bottom: 1.5rem;
                        letter-spacing: 0.04em;
                    }
                    .hms-hero-desc {
                        font-size: 1.05rem;
                        color: ${C.grayLight};
                        line-height: 1.8;
                        opacity: 0.8;
                        margin-bottom: 2.5rem;
                        max-width: 640px;
                    }
                    .hms-hero-desc strong { color: ${C.bone}; font-weight: 500; }
                    .hms-hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

                    .hms-btn-primary {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: ${C.brass}; color: ${C.bone}; border: none;
                        padding: 0.85rem 2rem; border-radius: 8px;
                        font-size: 0.9rem; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .hms-btn-primary:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,115,85,0.3); }

                    .hms-btn-outline {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.grayLight};
                        border: 1px solid ${C.lineDark}; padding: 0.85rem 2rem;
                        border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .hms-btn-outline:hover { border-color: ${C.grayLight}; color: ${C.bone}; transform: translateY(-2px); }

                    /* ── Floating stats in hero ── */
                    .hms-hero-stats {
                        position: absolute;
                        right: clamp(1.25rem, 5vw, 2.5rem);
                        top: 50%; transform: translateY(-50%);
                        display: flex; flex-direction: column; gap: 1.25rem;
                        z-index: 2;
                    }
                    .hms-hero-stat {
                        background: rgba(255,255,255,0.03);
                        border: 1px solid ${C.lineDark};
                        border-radius: 10px;
                        padding: 1rem 1.25rem;
                        text-align: right;
                        min-width: 160px;
                        backdrop-filter: blur(8px);
                        transition: all 0.3s ease;
                    }
                    .hms-hero-stat:hover { border-color: ${C.lineDarkHover}; background: rgba(255,255,255,0.05); }
                    .hms-hero-stat-value {
                        font-family: 'Fraunces', serif;
                        font-size: 1.6rem; color: ${C.bone};
                        font-weight: 500; line-height: 1;
                    }
                    .hms-hero-stat-label {
                        font-size: 0.72rem; color: ${C.grayLight};
                        opacity: 0.6; margin-top: 0.3rem;
                    }

                    /* ── What Is Section ── */
                    .hms-what {
                        padding: clamp(4rem, 8vw, 7rem) 0;
                        position: relative;
                    }
                    .hms-what-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 4rem;
                        align-items: start;
                    }
                    .hms-what-text p {
                        font-size: 1rem; line-height: 1.8;
                        color: ${C.grayLight}; opacity: 0.8;
                        margin-bottom: 1.25rem;
                    }
                    .hms-what-text p strong { color: ${C.bone}; font-weight: 500; }
                    .hms-what-visual {
                        background: rgba(255,255,255,0.02);
                        border: 1px solid ${C.lineDark};
                        border-radius: 14px;
                        padding: 2rem;
                        position: relative;
                        overflow: hidden;
                    }
                    .hms-what-visual::before {
                        content: '';
                        position: absolute; top: -50%; right: -50%;
                        width: 200%; height: 200%;
                        background: radial-gradient(circle at 70% 30%, rgba(61,79,71,0.12) 0%, transparent 50%);
                        pointer-events: none;
                    }
                    .hms-what-visual-item {
                        display: flex; align-items: flex-start; gap: 1rem;
                        padding: 1rem 0;
                        border-bottom: 1px solid ${C.lineDark};
                        position: relative;
                    }
                    .hms-what-visual-item:last-child { border-bottom: none; }
                    .hms-what-visual-num {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.7rem; color: ${C.brassLight};
                        background: rgba(139,115,85,0.12);
                        border: 1px solid rgba(139,115,85,0.2);
                        width: 28px; height: 28px; border-radius: 6px;
                        display: flex; align-items: center; justify-content: center;
                        flex-shrink: 0; margin-top: 2px;
                    }
                    .hms-what-visual-title {
                        font-size: 0.9rem; color: ${C.bone};
                        font-weight: 500; margin-bottom: 0.25rem;
                    }
                    .hms-what-visual-desc {
                        font-size: 0.82rem; color: ${C.grayLight};
                        opacity: 0.7; line-height: 1.6;
                    }

                    /* ── Features ── */
                    .hms-features {
                        padding: clamp(4rem, 8vw, 7rem) 0;
                        position: relative;
                    }
                    .hms-features::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.lineDark} 20%, ${C.lineDark} 80%, transparent);
                    }
                    .hms-features-glow {
                        position: absolute;
                        top: 20%; left: 50%; transform: translateX(-50%);
                        width: 600px; height: 400px;
                        background: radial-gradient(ellipse, rgba(61,79,71,0.15) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-features-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.5rem;
                        position: relative; z-index: 2;
                    }
                    .hms-feature-card {
                        background: rgba(255,255,255,0.02);
                        border: 1px solid ${C.lineDark};
                        border-radius: 12px;
                        padding: 2rem;
                        transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
                        position: relative;
                        overflow: hidden;
                    }
                    .hms-feature-card::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 2px;
                        background: linear-gradient(90deg, transparent, ${C.verdigrisLight}, transparent);
                        opacity: 0; transition: opacity 0.35s ease;
                    }
                    .hms-feature-card:hover {
                        background: rgba(255,255,255,0.04);
                        border-color: ${C.lineDarkHover};
                        transform: translateY(-4px);
                    }
                    .hms-feature-card:hover::before { opacity: 1; }
                    .hms-feature-icon {
                        width: 44px; height: 44px; border-radius: 10px;
                        background: rgba(77,99,89,0.15);
                        border: 1px solid rgba(77,99,89,0.25);
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.verdigrisLight};
                        margin-bottom: 1.25rem;
                        transition: all 0.35s ease;
                    }
                    .hms-feature-card:hover .hms-feature-icon {
                        background: rgba(77,99,89,0.25);
                        box-shadow: 0 0 20px rgba(77,99,89,0.2);
                    }
                    .hms-feature-card h3 {
                        font-family: 'Inter', sans-serif;
                        font-size: 1rem; color: ${C.bone};
                        font-weight: 600; margin-bottom: 0.75rem;
                    }
                    .hms-feature-card p {
                        font-size: 0.88rem; color: ${C.grayLight};
                        line-height: 1.7; opacity: 0.75;
                    }

                    /* ── Benefits ── */
                    .hms-benefits {
                        padding: clamp(4rem, 8vw, 7rem) 0;
                        position: relative;
                    }
                    .hms-benefits::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.lineDark} 20%, ${C.lineDark} 80%, transparent);
                    }
                    .hms-benefits-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                    }
                    .hms-benefit-card {
                        background: rgba(255,255,255,0.02);
                        border: 1px solid ${C.lineDark};
                        border-radius: 12px;
                        padding: 2rem;
                        display: flex; gap: 1.5rem;
                        align-items: flex-start;
                        transition: all 0.35s ease;
                    }
                    .hms-benefit-card:hover {
                        border-color: ${C.lineDarkHover};
                        background: rgba(255,255,255,0.035);
                    }
                    .hms-benefit-left { flex-shrink: 0; }
                    .hms-benefit-icon {
                        width: 48px; height: 48px; border-radius: 12px;
                        background: rgba(139,115,85,0.1);
                        border: 1px solid rgba(139,115,85,0.2);
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.brassLight}; margin-bottom: 0.75rem;
                    }
                    .hms-benefit-stat {
                        font-family: 'Fraunces', serif;
                        font-size: 1.4rem; color: ${C.bone};
                        font-weight: 500; line-height: 1;
                    }
                    .hms-benefit-stat-label {
                        font-size: 0.7rem; color: ${C.grayLight};
                        opacity: 0.6; margin-top: 0.2rem;
                        font-family: 'JetBrains Mono', monospace;
                        letter-spacing: 0.04em;
                    }
                    .hms-benefit-right { flex: 1; }
                    .hms-benefit-card h3 {
                        font-size: 1.05rem; color: ${C.bone};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .hms-benefit-card p {
                        font-size: 0.88rem; color: ${C.grayLight};
                        line-height: 1.7; opacity: 0.75;
                    }

                    /* ── Use Cases ── */
                    .hms-usecases {
                        padding: clamp(4rem, 8vw, 7rem) 0;
                        position: relative;
                    }
                    .hms-usecases::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.lineDark} 20%, ${C.lineDark} 80%, transparent);
                    }
                    .hms-usecases-glow {
                        position: absolute;
                        bottom: 10%; right: 10%;
                        width: 400px; height: 400px;
                        background: radial-gradient(circle, rgba(139,115,85,0.1) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-usecases-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .hms-usecase-card {
                        background: rgba(255,255,255,0.02);
                        border: 1px solid ${C.lineDark};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s ease;
                        position: relative;
                        overflow: hidden;
                        display: flex; flex-direction: column;
                    }
                    .hms-usecase-card:hover {
                        border-color: ${C.lineDarkHover};
                        background: rgba(255,255,255,0.04);
                        transform: translateY(-3px);
                    }
                    .hms-usecase-tag {
                        display: inline-flex; align-self: flex-start;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.65rem; letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: ${C.verdigrisLight};
                        background: rgba(77,99,89,0.12);
                        border: 1px solid rgba(77,99,89,0.2);
                        padding: 0.25rem 0.6rem;
                        border-radius: 4px;
                        margin-bottom: 1.25rem;
                    }
                    .hms-usecase-icon {
                        width: 40px; height: 40px; border-radius: 8px;
                        background: rgba(255,255,255,0.04);
                        border: 1px solid ${C.lineDark};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.bone}; margin-bottom: 1rem;
                    }
                    .hms-usecase-card h3 {
                        font-size: 1rem; color: ${C.bone};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .hms-usecase-card p {
                        font-size: 0.82rem; color: ${C.grayLight};
                        line-height: 1.65; opacity: 0.7;
                        flex: 1;
                    }

                    /* ── CTA ── */
                    .hms-cta {
                        padding: clamp(4rem, 8vw, 7rem) 0;
                        position: relative;
                    }
                    .hms-cta::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.lineDark} 20%, ${C.lineDark} 80%, transparent);
                    }
                    .hms-cta-box {
                        position: relative;
                        background: linear-gradient(135deg, rgba(61,79,71,0.2) 0%, rgba(139,115,85,0.1) 100%);
                        border: 1px solid ${C.lineDark};
                        border-radius: 20px;
                        padding: clamp(3rem, 6vw, 5rem);
                        text-align: center;
                        overflow: hidden;
                    }
                    .hms-cta-box::before {
                        content: ''; position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 60% 50% at 30% 20%, rgba(77,99,89,0.2) 0%, transparent 70%),
                            radial-gradient(ellipse 40% 40% at 70% 80%, rgba(139,115,85,0.12) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-cta-box::after {
                        content: ''; position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
                        background-size: 32px 32px;
                        pointer-events: none;
                        mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                        -webkit-mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                    }
                    .hms-cta-content { position: relative; z-index: 2; }
                    .hms-cta-box h2 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(1.8rem, 4vw, 2.5rem);
                        color: ${C.bone}; font-weight: 500;
                        margin-bottom: 1rem; letter-spacing: -0.02em;
                    }
                    .hms-cta-box p {
                        font-size: 1.05rem; color: ${C.grayLight};
                        line-height: 1.7; opacity: 0.8;
                        max-width: 560px; margin: 0 auto 2.5rem;
                    }
                    .hms-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    /* ── Related ── */
                    .hms-related {
                        padding: clamp(3rem, 6vw, 5rem) 0;
                        position: relative;
                    }
                    .hms-related::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.lineDark} 20%, ${C.lineDark} 80%, transparent);
                    }
                    .hms-related-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1rem;
                    }
                    .hms-related-link {
                        display: flex; align-items: center; gap: 0.6rem;
                        padding: 1rem 1.25rem;
                        background: rgba(255,255,255,0.02);
                        border: 1px solid ${C.lineDark};
                        border-radius: 10px;
                        font-size: 0.85rem; color: ${C.grayLight};
                        transition: all 0.25s ease;
                        cursor: pointer;
                    }
                    .hms-related-link:hover {
                        background: rgba(255,255,255,0.05);
                        border-color: ${C.lineDarkHover};
                        color: ${C.bone};
                        transform: translateX(4px);
                    }
                    .hms-related-link svg { flex-shrink: 0; opacity: 0.5; transition: opacity 0.2s; }
                    .hms-related-link:hover svg { opacity: 1; }

                    /* ── Responsive ── */
                    @media (max-width: 1024px) {
                        .hms-features-grid { grid-template-columns: repeat(2, 1fr); }
                        .hms-usecases-grid { grid-template-columns: repeat(2, 1fr); }
                        .hms-hero-stats { display: none; }
                    }
                    @media (max-width: 768px) {
                        .hms-what-grid { grid-template-columns: 1fr; gap: 2.5rem; }
                        .hms-benefits-grid { grid-template-columns: 1fr; }
                        .hms-features-grid { grid-template-columns: 1fr; }
                        .hms-usecases-grid { grid-template-columns: 1fr; }
                        .hms-related-grid { grid-template-columns: 1fr; }
                        .hms-benefit-card { flex-direction: column; gap: 1rem; }
                        .hms-benefit-left { display: flex; align-items: center; gap: 1rem; }
                        .hms-benefit-icon { margin-bottom: 0; }
                    }
                `}</style>

                {/* ═══ HERO ═══ */}
                <section className="hms-hero">
                    <div className="hms-hero-glow" />
                    <div className="hms-hero-grid" />
                    <div className="hms-hero-line" />

                    <div className="hms-container">
                        <div className="hms-hero-content">
                            <FadeUp>
                                <div className="hms-hero-breadcrumb">
                                    <Link to="/">Home</Link>
                                    <ChevronRight size={12} />
                                    <Link to="/mortuary-management-software">Mortuary Software</Link>
                                    <ChevronRight size={12} />
                                    <span>Hospital</span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={80}>
                                <h1>
                                    <span>Hospital Mortuary</span><br />
                                    Software Kenya
                                </h1>
                            </FadeUp>

                            <FadeUp delay={160}>
                                <div className="hms-hero-subtitle">Modern Morgue Management System for Healthcare Facilities</div>
                            </FadeUp>

                            <FadeUp delay={240}>
                                <p className="hms-hero-desc">
                                    Rest Point is Kenya's premier <strong>hospital mortuary software</strong>, designed specifically
                                    for hospital morgues and healthcare facilities. Our comprehensive <strong>morgue management system</strong>
                                    combines mortuary technology with healthcare compliance to deliver a complete
                                    <strong> mortuary information system</strong> that meets the unique demands of hospital operations.
                                </p>
                            </FadeUp>

                            <FadeUp delay={320}>
                                <div className="hms-hero-buttons">
                                    <Link to="/register" className="hms-btn-primary">
                                        Request Demo <ArrowRight size={16} />
                                    </Link>
                                    <Link to="/contact" className="hms-btn-outline">Contact Sales</Link>
                                </div>
                            </FadeUp>
                        </div>

                        {/* Floating stats */}
                        <div className="hms-hero-stats">
                            <FadeUp delay={400}>
                                <div className="hms-hero-stat">
                                    <div className="hms-hero-stat-value">98.7%</div>
                                    <div className="hms-hero-stat-label">Uptime SLA</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={500}>
                                <div className="hms-hero-stat">
                                    <div className="hms-hero-stat-value">4.2s</div>
                                    <div className="hms-hero-stat-label">Avg. Admission</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={600}>
                                <div className="hms-hero-stat">
                                    <div className="hms-hero-stat-value">0</div>
                                    <div className="hms-hero-stat-label">Identity Errors</div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                {/* ═══ WHAT IS ═══ */}
                <section className="hms-what">
                    <div className="hms-container">
                        <div className="hms-what-grid">
                            <div className="hms-what-text">
                                <FadeUp>
                                    <SectionLabel>Overview</SectionLabel>
                                    <SectionHeading sub="Purpose-built for the complexity of hospital-based mortuary operations across Kenya.">
                                        What is Hospital Mortuary Software?
                                    </SectionHeading>
                                </FadeUp>
                                <FadeUp delay={100}>
                                    <p>
                                        <strong>Hospital mortuary software</strong> is a specialized digital solution designed to manage
                                        the unique requirements of hospital-based morgues. Unlike generic mortuary software,
                                        <strong> hospital morgue software</strong> must integrate with hospital systems, handle high-volume
                                        cases, manage multiple cold rooms, and comply with healthcare regulations.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={200}>
                                    <p>
                                        Modern <strong>mortuary technology</strong> for hospitals includes features like integration with
                                        hospital information systems (HIS), electronic health records (EHR), pathology lab systems,
                                        and billing departments. Rest Point's <strong>mortuary case management</strong> capabilities
                                        ensure seamless coordination between the mortuary and other hospital departments.
                                    </p>
                                </FadeUp>
                            </div>

                            <div className="hms-what-visual">
                                <FadeUp delay={200}>
                                    {[
                                        { num: '01', title: 'HIS / EHR Integration', desc: 'Bidirectional data sync with hospital systems' },
                                        { num: '02', title: 'Cold Room IoT Monitoring', desc: 'Real-time temperature & capacity tracking' },
                                        { num: '03', title: 'Pathology Lab Coordination', desc: 'Sample tracking & autopsy workflow' },
                                        { num: '04', title: 'Regulatory Compliance', desc: 'Automated reports for health authorities' },
                                        { num: '05', title: 'Multi-Department Billing', desc: 'Unified invoicing across hospital units' },
                                    ].map((item, i) => (
                                        <div className="hms-what-visual-item" key={i}>
                                            <div className="hms-what-visual-num">{item.num}</div>
                                            <div>
                                                <div className="hms-what-visual-title">{item.title}</div>
                                                <div className="hms-what-visual-desc">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </FadeUp>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ FEATURES ═══ */}
                <section className="hms-features">
                    <div className="hms-features-glow" />
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Capabilities</SectionLabel>
                            <SectionHeading sub="Every feature designed around the realities of hospital mortuary operations.">
                                Key Features of Our Hospital Mortuary Management System
                            </SectionHeading>
                        </FadeUp>

                        <div className="hms-features-grid">
                            {features.map((f, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <div className="hms-feature-card">
                                        <div className="hms-feature-icon">{f.icon}</div>
                                        <h3>{f.title}</h3>
                                        <p>{f.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ BENEFITS ═══ */}
                <section className="hms-benefits">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Advantages</SectionLabel>
                            <SectionHeading sub="Four pillars that set Rest Point apart for healthcare facilities.">
                                Why Choose Rest Point for Hospital Morgues?
                            </SectionHeading>
                        </FadeUp>

                        <div className="hms-benefits-grid">
                            {benefits.map((b, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="hms-benefit-card">
                                        <div className="hms-benefit-left">
                                            <div className="hms-benefit-icon">{b.icon}</div>
                                            <div className="hms-benefit-stat">{b.stat}</div>
                                            <div className="hms-benefit-stat-label">{b.statLabel}</div>
                                        </div>
                                        <div className="hms-benefit-right">
                                            <h3>{b.title}</h3>
                                            <p>{b.desc}</p>
                                        </div>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ USE CASES ═══ */}
                <section className="hms-usecases">
                    <div className="hms-usecases-glow" />
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Deployments</SectionLabel>
                            <SectionHeading sub="Trusted across every tier of Kenya's healthcare system.">
                                Trusted by Leading Healthcare Facilities
                            </SectionHeading>
                        </FadeUp>

                        <div className="hms-usecases-grid">
                            {useCases.map((u, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="hms-usecase-card">
                                        <span className="hms-usecase-tag">{u.tag}</span>
                                        <div className="hms-usecase-icon">{u.icon}</div>
                                        <h3>{u.title}</h3>
                                        <p>{u.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ CTA ═══ */}
                <section className="hms-cta">
                    <div className="hms-container">
                        <FadeUp>
                            <div className="hms-cta-box">
                                <div className="hms-cta-content">
                                    <h2>Upgrade Your Hospital Mortuary Operations</h2>
                                    <p>
                                        Join leading hospitals across Kenya that trust Rest Point for their mortuary
                                        management needs. Schedule a demo to see our hospital mortuary software in action.
                                    </p>
                                    <div className="hms-cta-buttons">
                                        <Link to="/register" className="hms-btn-primary">
                                            Schedule Demo <ArrowRight size={16} />
                                        </Link>
                                        <Link to="/mortuary-management-software" className="hms-btn-outline">
                                            Learn More <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ═══ RELATED ═══ */}
                <section className="hms-related">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Explore</SectionLabel>
                            <SectionHeading sub="">Related Resources</SectionHeading>
                        </FadeUp>

                        <div className="hms-related-grid">
                            {relatedLinks.map((r, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <Link to={r.to} className="hms-related-link">
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

export default HospitalMortuarySoftware;