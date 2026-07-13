import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowRight, ChevronRight, ExternalLink,
    Navigation, MapPin, UserCheck, Wrench, MessageSquare, FileText,
    Truck, Eye, Heart, ClipboardCheck,
    Building2, Shield, Landmark
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

const HearseManagementSoftware = () => {
    const features = [
        { icon: <Navigation size={22} />, title: 'Intelligent Dispatch', desc: 'Automatically assign the nearest available hearse and driver based on location, vehicle capacity, and special requirements like refrigeration or escort vehicles.' },
        { icon: <MapPin size={22} />, title: 'GPS Tracking & Routing', desc: 'Track all hearses in real-time with GPS. Optimize routes considering traffic, distance, and urgency to ensure timely and dignified transportation.' },
        { icon: <UserCheck size={22} />, title: 'Driver Management', desc: 'Manage driver schedules, certifications, and availability. Track driving hours and ensure compliance with Kenyan transport regulations.' },
        { icon: <Wrench size={22} />, title: 'Vehicle Maintenance', desc: 'Monitor vehicle health, schedule maintenance, track service history, and manage insurance and documentation for your entire fleet.' },
        { icon: <MessageSquare size={22} />, title: 'Family Communication', desc: 'Send automated SMS notifications to families with driver details, estimated arrival times, and real-time tracking links.' },
        { icon: <FileText size={22} />, title: 'Billing & Documentation', desc: 'Generate transport invoices, maintain service logs, and integrate with mortuary billing for seamless financial management.' },
    ];

    const benefits = [
        { icon: <Truck size={24} />, title: 'Optimized Fleet Utilization', desc: 'Reduce fuel costs and vehicle wear with intelligent route optimization. Increase fleet capacity by 30-40% with better scheduling and dispatch.', stat: '35%', statLabel: 'Fuel saved' },
        { icon: <Eye size={24} />, title: 'Real-Time Visibility', desc: 'Monitor all transports in real-time. Know exactly where each hearse is, its status, and estimated completion time from any device.', stat: 'Live', statLabel: 'GPS tracking' },
        { icon: <Heart size={24} />, title: 'Family Satisfaction', desc: 'Keep families informed with proactive notifications. Reduce anxiety with accurate ETAs and transparent communication throughout the transport.', stat: '<5min', statLabel: 'Avg. dispatch' },
        { icon: <ClipboardCheck size={24} />, title: 'Complete Audit Trail', desc: 'Maintain comprehensive records of all transports for compliance, billing, and quality assurance purposes. Never lose track of a service.', stat: '100%', statLabel: 'Record keeping' },
    ];

    const useCases = [
        { icon: <Building2 size={20} />, title: 'Funeral Homes', desc: 'Funeral homes across Kenya use Rest Point to manage their hearse fleets, coordinate with families, and ensure timely body transportation.', tag: 'Direct' },
        { icon: <Building2 size={20} />, title: 'Hospital Morgues', desc: 'Hospital mortuaries use our software to manage body transfers to funeral homes, coordinate with families, and track inter-county transports.', tag: 'Transfer' },
        { icon: <Shield size={20} />, title: 'Private Mortuaries', desc: 'Independent mortuary operators rely on Rest Point to offer premium transportation services and compete with larger facilities.', tag: 'Premium' },
        { icon: <Landmark size={20} />, title: 'County Governments', desc: 'County mortuary services use our fleet management system to coordinate body transportation across multiple locations within the county.', tag: 'Public' },
    ];

    const relatedLinks = [
        { to: '/mortuary-management-software', label: 'Mortuary Management Software' },
        { to: '/blog/innovations-in-funeral-industry', label: 'Innovations in Funeral Industry' },
        { to: '/mortuary-billing', label: 'Mortuary Billing Software' },
        { to: '/blog/how-to-manage-funeral-home', label: 'How to Manage a Funeral Home' },
    ];

    return (
        <>
            <Helmet>
                <title>Hearse Management Software Kenya | Mortuary Transport Software & Fleet Management</title>
                <meta name="description" content="Rest Point is Kenya's leading hearse management software and mortuary transport software. Complete fleet management system for funeral homes and mortuaries. Dispatch, routing, and scheduling optimized for Kenyan operations." />
                <meta name="keywords" content="hearse management software, mortuary transport software, fleet management, hearse dispatch software, mortuary hearse management, funeral transport software, hearse scheduling system, mortuary vehicle management" />
                <link rel="canonical" href="https://restpoint.co.ke/hearse-management" />
            </Helmet>

            <div className="hms-page">
                <style>{`
                    .hms-page {
                        background: ${C.white};
                        color: ${C.textSec};
                        font-family: 'Inter', sans-serif;
                        overflow-x: hidden;
                    }
                    .hms-page .hms-container {
                        max-width: 1180px;
                        margin: 0 auto;
                        padding: 0 clamp(1.25rem, 5vw, 2.5rem);
                    }
                    .hms-page a { text-decoration: none; }

                    .hms-divider {
                        height: 1px;
                        background: linear-gradient(90deg, transparent, ${C.line} 20%, ${C.line} 80%, transparent);
                    }

                    /* ── Hero ── */
                    .hms-hero {
                        position: relative;
                        padding: clamp(6rem, 12vw, 10rem) 0 clamp(5rem, 10vw, 8rem);
                        overflow: hidden;
                        background: ${C.bone};
                    }
                    .hms-hero-glow {
                        position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 70% 60% at 20% 15%, rgba(61,79,71,0.1) 0%, transparent 60%),
                            radial-gradient(ellipse 50% 40% at 85% 85%, rgba(139,115,85,0.1) 0%, transparent 60%);
                        pointer-events: none;
                    }
                    .hms-hero-grid {
                        position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                        background-size: 48px 48px;
                        mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-hero-content {
                        position: relative; z-index: 2;
                        max-width: 800px;
                    }
                    .hms-hero-breadcrumb {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.72rem; color: ${C.textTer};
                        margin-bottom: 2rem; letter-spacing: 0.02em;
                    }
                    .hms-hero-breadcrumb a { color: ${C.brass}; transition: color 0.2s; }
                    .hms-hero-breadcrumb a:hover { color: ${C.text}; }
                    .hms-hero h1 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(2.2rem, 5.5vw, 3.6rem);
                        color: ${C.text};
                        font-weight: 500;
                        line-height: 1.1;
                        letter-spacing: -0.03em;
                        margin-bottom: 1.25rem;
                    }
                    .hms-hero h1 span {
                        background: linear-gradient(135deg, ${C.verdigris}, ${C.verdigrisLight});
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                    }
                    .hms-hero-subtitle {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.85rem;
                        color: ${C.verdigris};
                        margin-bottom: 1.5rem;
                        letter-spacing: 0.04em;
                    }
                    .hms-hero-desc {
                        font-size: 1.05rem;
                        color: ${C.textSec};
                        line-height: 1.8;
                        margin-bottom: 2.5rem;
                        max-width: 640px;
                    }
                    .hms-hero-desc strong { color: ${C.text}; font-weight: 600; }
                    .hms-hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

                    .hms-btn-primary {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: ${C.verdigris}; color: ${C.white}; border: none;
                        padding: 0.85rem 2rem; border-radius: 8px;
                        font-size: 0.9rem; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .hms-btn-primary:hover { background: ${C.verdigrisLight}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(61,79,71,0.3); }

                    .hms-btn-outline {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.textSec};
                        border: 1px solid ${C.line}; padding: 0.85rem 2rem;
                        border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif;
                        transition: all 0.25s ease;
                    }
                    .hms-btn-outline:hover { border-color: ${C.textTer}; color: ${C.text}; transform: translateY(-2px); }

                    /* Hero floating stats */
                    .hms-hero-stats {
                        position: absolute;
                        right: clamp(1.25rem, 5vw, 2.5rem);
                        top: 50%; transform: translateY(-50%);
                        display: flex; flex-direction: column; gap: 1.25rem;
                        z-index: 2;
                    }
                    .hms-hero-stat {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 10px;
                        padding: 1rem 1.25rem;
                        text-align: right;
                        min-width: 160px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                        transition: all 0.3s ease;
                    }
                    .hms-hero-stat:hover { border-color: ${C.lineMid}; box-shadow: 0 8px 30px rgba(0,0,0,0.07); transform: translateY(-2px); }
                    .hms-hero-stat-value {
                        font-family: 'Fraunces', serif;
                        font-size: 1.6rem; color: ${C.text};
                        font-weight: 500; line-height: 1;
                    }
                    .hms-hero-stat-label {
                        font-size: 0.72rem; color: ${C.textTer};
                        margin-top: 0.3rem;
                    }

                    /* ── What Is ── */
                    .hms-what { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .hms-what-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 4rem;
                        align-items: start;
                    }
                    .hms-what-text p {
                        font-size: 1rem; line-height: 1.8;
                        color: ${C.textSec};
                        margin-bottom: 1.25rem;
                    }
                    .hms-what-text p strong { color: ${C.text}; font-weight: 600; }
                    .hms-what-visual {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 14px;
                        padding: 2rem;
                        position: relative; overflow: hidden;
                    }
                    .hms-what-visual::before {
                        content: '';
                        position: absolute; top: -50%; right: -50%;
                        width: 200%; height: 200%;
                        background: radial-gradient(circle at 70% 30%, rgba(61,79,71,0.06) 0%, transparent 50%);
                        pointer-events: none;
                    }
                    .hms-what-visual-item {
                        display: flex; align-items: flex-start; gap: 1rem;
                        padding: 1rem 0;
                        border-bottom: 1px solid ${C.line};
                        position: relative;
                    }
                    .hms-what-visual-item:last-child { border-bottom: none; }
                    .hms-what-visual-num {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.7rem; color: ${C.verdigris};
                        background: ${C.verdigrisPale};
                        border: 1px solid ${C.verdigrisPaleBorder};
                        width: 28px; height: 28px; border-radius: 6px;
                        display: flex; align-items: center; justify-content: center;
                        flex-shrink: 0; margin-top: 2px;
                    }
                    .hms-what-visual-title {
                        font-size: 0.9rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.25rem;
                    }
                    .hms-what-visual-desc {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.6;
                    }

                    /* ── Features ── */
                    .hms-features { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.bone}; }
                    .hms-features-glow {
                        position: absolute;
                        top: 30%; left: 40%; transform: translate(-50%, -50%);
                        width: 700px; height: 500px;
                        background: radial-gradient(ellipse, rgba(61,79,71,0.06) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-features-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .hms-feature-card {
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
                        position: relative; overflow: hidden;
                    }
                    .hms-feature-card::before {
                        content: ''; position: absolute;
                        top: 0; left: 0; right: 0; height: 2px;
                        background: linear-gradient(90deg, transparent, ${C.verdigris}, transparent);
                        opacity: 0; transition: opacity 0.35s ease;
                    }
                    .hms-feature-card:hover {
                        border-color: ${C.verdigrisPaleBorder};
                        transform: translateY(-4px);
                        box-shadow: 0 12px 32px rgba(0,0,0,0.06);
                    }
                    .hms-feature-card:hover::before { opacity: 1; }
                    .hms-feature-icon {
                        width: 40px; height: 40px; border-radius: 9px;
                        background: ${C.verdigrisPale};
                        border: 1px solid ${C.verdigrisPaleBorder};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.verdigris};
                        margin-bottom: 1.1rem;
                        transition: all 0.35s ease;
                    }
                    .hms-feature-card:hover .hms-feature-icon {
                        background: rgba(61,79,71,0.12);
                    }
                    .hms-feature-card h3 {
                        font-size: 0.95rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                        line-height: 1.3;
                    }
                    .hms-feature-card p {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.65;
                    }

                    /* ── Benefits ── */
                    .hms-benefits { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .hms-benefits-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                    }
                    .hms-benefit-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 2rem;
                        display: flex; gap: 1.5rem;
                        align-items: flex-start;
                        transition: all 0.35s ease;
                    }
                    .hms-benefit-card:hover {
                        border-color: ${C.lineMid};
                        box-shadow: 0 8px 28px rgba(0,0,0,0.04);
                    }
                    .hms-benefit-left { flex-shrink: 0; }
                    .hms-benefit-icon {
                        width: 48px; height: 48px; border-radius: 12px;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.verdigris}; margin-bottom: 0.75rem;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                    }
                    .hms-benefit-stat {
                        font-family: 'Fraunces', serif;
                        font-size: 1.4rem; color: ${C.text};
                        font-weight: 500; line-height: 1;
                    }
                    .hms-benefit-stat-label {
                        font-size: 0.7rem; color: ${C.textTer};
                        margin-top: 0.2rem;
                        font-family: 'JetBrains Mono', monospace;
                        letter-spacing: 0.04em;
                    }
                    .hms-benefit-right { flex: 1; }
                    .hms-benefit-card h3 {
                        font-size: 1.05rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .hms-benefit-card p {
                        font-size: 0.88rem; color: ${C.textSec};
                        line-height: 1.7;
                    }

                    /* ── Use Cases ── */
                    .hms-usecases { padding: clamp(4rem, 8vw, 7rem) 0; position: relative; background: ${C.white}; }
                    .hms-usecases-glow {
                        position: absolute;
                        bottom: 15%; right: 5%;
                        width: 400px; height: 400px;
                        background: radial-gradient(circle, rgba(139,115,85,0.05) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-usecases-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1.25rem;
                        position: relative; z-index: 2;
                    }
                    .hms-usecase-card {
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 12px;
                        padding: 1.75rem 1.5rem;
                        transition: all 0.35s ease;
                        display: flex; flex-direction: column;
                    }
                    .hms-usecase-card:hover {
                        border-color: ${C.lineMid};
                        background: ${C.white};
                        transform: translateY(-3px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    }
                    .hms-usecase-tag {
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
                    .hms-usecase-icon {
                        width: 40px; height: 40px; border-radius: 8px;
                        background: ${C.white};
                        border: 1px solid ${C.line};
                        display: flex; align-items: center; justify-content: center;
                        color: ${C.text}; margin-bottom: 1rem;
                    }
                    .hms-usecase-card h3 {
                        font-size: 1rem; color: ${C.text};
                        font-weight: 600; margin-bottom: 0.6rem;
                    }
                    .hms-usecase-card p {
                        font-size: 0.82rem; color: ${C.textTer};
                        line-height: 1.65;
                        flex: 1;
                    }

                    /* ── CTA ── */
                    .hms-cta { padding: clamp(4rem, 8vw, 7rem) 0; background: ${C.white}; }
                    .hms-cta-box {
                        position: relative;
                        background: linear-gradient(135deg, ${C.bone} 0%, #EFECE3 100%);
                        border: 1px solid ${C.line};
                        border-radius: 20px;
                        padding: clamp(3rem, 6vw, 5rem);
                        text-align: center;
                        overflow: hidden;
                    }
                    .hms-cta-box::before {
                        content: ''; position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 60% 50% at 25% 20%, rgba(61,79,71,0.08) 0%, transparent 70%),
                            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(139,115,85,0.06) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-cta-box::after {
                        content: ''; position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
                        background-size: 32px 32px;
                        pointer-events: none;
                        mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                        -webkit-mask-image: radial-gradient(ellipse 70% 70% at center, black, transparent);
                    }
                    .hms-cta-content { position: relative; z-index: 2; }
                    .hms-cta-box h2 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(1.8rem, 4vw, 2.5rem);
                        color: ${C.text}; font-weight: 500;
                        margin-bottom: 1rem; letter-spacing: '-0.02em';
                    }
                    .hms-cta-box p {
                        font-size: 1.05rem; color: ${C.textSec};
                        line-height: 1.7;
                        max-width: 560px; margin: 0 auto 2.5rem;
                    }
                    .hms-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    /* ── Related ── */
                    .hms-related { padding: clamp(3rem, 6vw, 5rem) 0; background: ${C.white}; }
                    .hms-related-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 1rem;
                    }
                    .hms-related-link {
                        display: flex; align-items: center; gap: 0.6rem;
                        padding: 1rem 1.25rem;
                        background: ${C.bone};
                        border: 1px solid ${C.line};
                        border-radius: 10px;
                        font-size: 0.85rem; color: ${C.textSec};
                        transition: all 0.25s ease;
                        cursor: pointer;
                    }
                    .hms-related-link:hover {
                        background: ${C.white};
                        border-color: ${C.verdigrisPaleBorder};
                        color: ${C.text};
                        transform: translateX(4px);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                    }
                    .hms-related-link svg { flex-shrink: 0; color: ${C.verdigris}; opacity: 0.5; transition: opacity 0.2s; }
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

                    <div className="hms-container">
                        <div className="hms-hero-content">
                            <FadeUp>
                                <div className="hms-hero-breadcrumb">
                                    <Link to="/">Home</Link>
                                    <ChevronRight size={12} />
                                    <Link to="/mortuary-management-software">Solutions</Link>
                                    <ChevronRight size={12} />
                                    <span>Hearse Management</span>
                                </div>
                            </FadeUp>

                            <FadeUp delay={80}>
                                <h1>
                                    <span>Hearse Management</span><br />
                                    Software Kenya
                                </h1>
                            </FadeUp>

                            <FadeUp delay={160}>
                                <div className="hms-hero-subtitle">Complete Mortuary Transport Software & Fleet Management System</div>
                            </FadeUp>

                            <FadeUp delay={240}>
                                <p className="hms-hero-desc">
                                    Rest Point is Kenya's premier <strong>hearse management software</strong>, providing a comprehensive
                                    <strong> mortuary transport software</strong> solution for funeral homes and mortuaries. Our
                                    intelligent <strong>fleet management</strong> system optimizes hearse dispatch, routing, and scheduling
                                    to ensure dignified and efficient transportation services.
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

                        <div className="hms-hero-stats">
                            <FadeUp delay={400}>
                                <div className="hms-hero-stat">
                                    <div className="hms-hero-stat-value">35%</div>
                                    <div className="hms-hero-stat-label">Fuel Saved</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={500}>
                                <div className="hms-hero-stat">
                                    <div className="hms-hero-stat-value">Live</div>
                                    <div className="hms-hero-stat-label">GPS Tracking</div>
                                </div>
                            </FadeUp>
                            <FadeUp delay={600}>
                                <div className="hms-hero-stat">
                                    <div className="hms-hero-stat-value">&lt;5min</div>
                                    <div className="hms-hero-stat-label">Avg. Dispatch</div>
                                </div>
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <div className="hms-divider" />

                {/* ═══ WHAT IS ═══ */}
                <section className="hms-what">
                    <div className="hms-container">
                        <div className="hms-what-grid">
                            <div className="hms-what-text">
                                <FadeUp>
                                    <SectionLabel>Overview</SectionLabel>
                                    <SectionHeading sub="From manual dispatch logs to intelligent, real-time fleet coordination.">
                                        What is Hearse Management Software?
                                    </SectionHeading>
                                </FadeUp>
                                <FadeUp delay={100}>
                                    <p>
                                        <strong>Hearse management software</strong> is a specialized fleet management solution designed
                                        for funeral homes, mortuaries, and funeral service providers. Modern <strong>mortuary transport
                                            software</strong> goes beyond simple vehicle tracking to provide intelligent dispatch, route
                                        optimization, and coordinated scheduling for sensitive body transportation.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={200}>
                                    <p>
                                        The <strong>best hearse management software</strong> like Rest Point integrates with your mortuary
                                        management system to coordinate body releases, schedule transports, manage driver assignments,
                                        and maintain complete service records. Whether you operate one hearse or a fleet of vehicles
                                        across Kenya, our software scales with your needs.
                                    </p>
                                </FadeUp>
                            </div>

                            <div className="hms-what-visual">
                                <FadeUp delay={200}>
                                    {[
                                        { num: '01', title: 'Dispatch & Assignment', desc: 'Nearest hearse, right driver, right time' },
                                        { num: '02', title: 'Real-Time GPS Tracking', desc: 'Live location for every vehicle' },
                                        { num: '03', title: 'Route Optimization', desc: 'Traffic-aware, urgency-ranked paths' },
                                        { num: '04', title: 'Family Notifications', desc: 'SMS with driver info & ETA' },
                                        { num: '05', title: 'Maintenance Scheduling', desc: 'Preventive care, no breakdowns' },
                                        { num: '06', title: 'Billing Integration', desc: 'Auto-invoice on transport complete' },
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

                <div className="hms-divider" />

                {/* ═══ FEATURES ═══ */}
                <section className="hms-features">
                    <div className="hms-features-glow" />
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Capabilities</SectionLabel>
                            <SectionHeading sub="Six core modules purpose-built for mortuary fleet operations.">
                                Key Features of Our Hearse Management System
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

                <div className="hms-divider" />

                {/* ═══ BENEFITS ═══ */}
                <section className="hms-benefits">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Advantages</SectionLabel>
                            <SectionHeading sub="Measurable impact on fleet performance, family experience, and operational control.">
                                Why Choose Rest Point Hearse Management Software?
                            </SectionHeading>
                        </FadeUp>

                        <div className="hms-benefits-grid">
                            {benefits.map((b, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="hms-benefit-card">
                                        <div className="hms-benefit-left">
                                            <div className="hms-benefit-icon">{b.icon}</div>
                                            <div>
                                                <div className="hms-benefit-stat">{b.stat}</div>
                                                <div className="hms-benefit-stat-label">{b.statLabel}</div>
                                            </div>
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

                <div className="hms-divider" />

                {/* ═══ USE CASES ═══ */}
                <section className="hms-usecases">
                    <div className="hms-usecases-glow" />
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Deployments</SectionLabel>
                            <SectionHeading sub="From single-vehicle operators to county-wide fleet networks.">
                                Who Uses Our Hearse Management Software?
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

                <div className="hms-divider" />

                {/* ═══ CTA ═══ */}
                <section className="hms-cta">
                    <div className="hms-container">
                        <FadeUp>
                            <div className="hms-cta-box">
                                <div className="hms-cta-content">
                                    <h2>Ready to Optimize Your Hearse Fleet Operations?</h2>
                                    <p>
                                        Join funeral homes and mortuaries across Kenya that trust Rest Point for
                                        their hearse management needs. Get started with a free demo today.
                                    </p>
                                    <div className="hms-cta-buttons">
                                        <Link to="/register" className="hms-btn-primary">
                                            Get Free Demo <ArrowRight size={16} />
                                        </Link>
                                        <Link to="/pricing" className="hms-btn-outline">
                                            View Pricing <ExternalLink size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                <div className="hms-divider" />

                {/* ═══ RELATED ═══ */}
                <section className="hms-related">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Explore</SectionLabel>
                            <SectionHeading sub="">Learn More About Mortuary Transport</SectionHeading>
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

export default HearseManagementSoftware;