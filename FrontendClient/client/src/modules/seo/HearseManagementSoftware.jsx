import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowRight, ChevronRight, ExternalLink,
    Navigation, MapPin, UserCheck, Wrench, MessageSquare, FileText,
    Truck, Eye, Heart, ClipboardCheck,
    Building2, Shield, Landmark, CalendarClock, CheckCircle2
} from 'lucide-react';

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
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
    line: '#E3DDD0',
    lineLight: 'rgba(250,248,244,0.08)',
    lineMid: 'rgba(250,248,244,0.12)',
    text: '#15171A',
    textSec: '#6B6862',
    textTer: '#8A8780',
};

/* ═══════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════ */
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

/* ═══════════════════════════════════════
   ANIMATION
   ═══════════════════════════════════════ */
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

/* ═══════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════ */
const SectionLabel = ({ children, light }) => (
    <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: light ? C.brassLight : C.brass, marginBottom: '1.25rem',
    }}>
        <span style={{ width: 24, height: 1, background: light ? C.brassLight : C.brass, display: 'inline-block' }} />
        {children}
    </div>
);

const SectionHeading = ({ children, sub, light }) => (
    <div style={{ marginBottom: '3.5rem' }}>
        <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: light ? C.bone : C.text, fontWeight: 500, lineHeight: 1.2,
            letterSpacing: '-0.02em', marginBottom: sub ? '1rem' : 0,
        }}>{children}</h2>
        {sub && <p style={{ fontSize: '1.05rem', color: light ? 'rgba(250,248,244,0.6)' : C.textSec, lineHeight: 1.7, maxWidth: 620 }}>{sub}</p>}
    </div>
);

/* ═══════════════════════════════════════
   FLEET OPS MOCK (LIGHT THEME)
   ═══════════════════════════════════════ */
const FleetOpsMock = () => {
    const vehicles = [
        { id: 'HSV-001', plate: 'KDG 345A', status: 'available', driver: 'Unassigned' },
        { id: 'HSV-002', plate: 'KDH 678B', status: 'dispatched', driver: 'Kamau J.' },
        { id: 'HSV-003', plate: 'KDJ 912C', status: 'maintenance', driver: 'Workshop' },
    ];

    const statusStyles = {
        available: { color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)', label: 'Available' },
        dispatched: { color: C.accent, bg: C.accentPale, label: 'Dispatched' },
        maintenance: { color: C.brass, bg: C.brassPale, label: 'Maintenance' },
    };

    return (
        <div className="hms-mock-light">
            <div className="hms-mock-light-header">
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FEBC2E' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28C840' }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: C.textTer, letterSpacing: '0.1em' }}>FLEET OPERATIONS</span>
            </div>

            <div className="hms-mock-light-stats">
                <div className="hms-mock-light-stat-box">
                    <span className="hms-mock-light-stat-num" style={{ color: '#16a34a' }}>2</span>
                    <span className="hms-mock-light-stat-lab">Available</span>
                </div>
                <div className="hms-mock-light-stat-box">
                    <span className="hms-mock-light-stat-num" style={{ color: C.accent }}>1</span>
                    <span className="hms-mock-light-stat-lab">Dispatched</span>
                </div>
                <div className="hms-mock-light-stat-box">
                    <span className="hms-mock-light-stat-num" style={{ color: C.brass }}>1</span>
                    <span className="hms-mock-light-stat-lab">Maintenance</span>
                </div>
            </div>

            <div className="hms-mock-light-list">
                {vehicles.map((v, i) => {
                    const s = statusStyles[v.status];
                    return (
                        <div key={i} className="hms-mock-light-row" style={{ borderBottom: i < 2 ? `1px solid ${C.line}` : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="hms-mock-light-dot" style={{ background: s.color }} />
                                <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: C.text }}>{v.id}</div>
                                    <div style={{ fontSize: '0.68rem', color: C.textTer, fontFamily: "'JetBrains Mono', monospace" }}>{v.plate}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className="hms-mock-light-badge" style={{ color: s.color, background: s.bg, borderColor: s.color }}>{s.label}</span>
                                <div style={{ fontSize: '0.68rem', color: C.textTer, marginTop: '0.2rem' }}>{v.driver}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="hms-mock-light-maint">
                <CalendarClock size={13} color={C.brass} style={{ flexShrink: 0 }} />
                <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: C.text }}>Upcoming: Oil Change</div>
                    <div style={{ fontSize: '0.68rem', color: C.textTer }}>HSV-003 · Scheduled for Jun 18</div>
                </div>
                <CheckCircle2 size={14} color="#16a34a" style={{ marginLeft: 'auto' }} />
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
const HearseManagementSoftware = () => {
    const features = [
        { icon: <Navigation size={22} />, title: 'Intelligent Dispatch', desc: 'Auto-assign the nearest available hearse based on driver schedules, vehicle capacity, and specific service requirements.' },
        { icon: <Truck size={22} />, title: 'Fleet Availability', desc: 'Real-time visibility into which hearses are available, dispatched, or in maintenance across your entire fleet.' },
        { icon: <Wrench size={22} />, title: 'Maintenance Scheduling', desc: 'Preventive maintenance tracking to ensure zero unexpected breakdowns. Log service history and manage vehicle documentation.' },
        { icon: <UserCheck size={22} />, title: 'Driver Management', desc: 'Track driver schedules, certifications, and availability. Ensure compliance with transport regulations and hours limits.' },
        { icon: <MessageSquare size={22} />, title: 'Family Communication', desc: 'Automated SMS notifications to families with driver details, estimated arrival times, and service status updates.' },
        { icon: <FileText size={22} />, title: 'Billing & Documentation', desc: 'Auto-generated transport invoices and service logs, fully integrated with your mortuary billing system.' },
    ];

    const benefits = [
        { icon: <Truck size={22} />, title: 'Optimized Fleet Utilization', desc: 'Reduce fuel costs and vehicle wear with better scheduling and dispatch. Increase capacity without adding vehicles.', stat: '35%', statLabel: 'Fuel saved', color: C.brassLight },
        { icon: <Eye size={22} />, title: 'Total Fleet Visibility', desc: 'Know exactly where every hearse is and its status from any device. No more radio calls to find your vehicles.', stat: 'Live', statLabel: 'Status tracking', color: '#4ADE80' },
        { icon: <Heart size={22} />, title: 'Family Satisfaction', desc: 'Proactive notifications and accurate ETAs reduce anxiety and improve the family experience during transport.', stat: '<5min', statLabel: 'Avg. dispatch', color: C.accent },
        { icon: <ClipboardCheck size={22} />, title: 'Complete Audit Trail', desc: 'Comprehensive records of all transports, maintenance, and assignments for compliance and quality assurance.', stat: '100%', statLabel: 'Record keeping', color: C.verdigrisLight },
    ];

    const useCases = [
        { icon: <Building2 size={20} />, title: 'Funeral Homes', desc: 'Manage hearse fleets, coordinate with families, and ensure timely body transportation.', tag: 'Direct' },
        { icon: <Building2 size={20} />, title: 'Hospital Morgues', desc: 'Coordinate body transfers to funeral homes and track inter-facility transports.', tag: 'Transfer' },
        { icon: <Shield size={20} />, title: 'Private Mortuaries', desc: 'Offer premium transportation services and compete effectively with larger facilities.', tag: 'Premium' },
        { icon: <Landmark size={20} />, title: 'County Governments', desc: 'Coordinate body transportation across multiple locations within county mortuary networks.', tag: 'Public' },
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
                <meta name="description" content="Rest Point is Kenya's leading hearse management software and mortuary transport software. Complete fleet management system for funeral homes and mortuaries. Dispatch, scheduling, and maintenance optimized for Kenyan operations." />
                <meta name="keywords" content="hearse management software, mortuary transport software, fleet management, hearse dispatch software, mortuary hearse management, funeral transport software, hearse scheduling system, mortuary vehicle management" />
                <link rel="canonical" href="https://restpoint.co.ke/hearse-management" />
            </Helmet>

            <div className="hms-page">
                <style>{`
                    /* ═══ GLOBAL PAGE ═══ */
                    .hms-page {
                        background: ${C.bone};
                        color: ${C.text};
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

                    /* ═══ HERO (DARK) ═══ */
                    .hms-hero {
                        position: relative;
                        padding: clamp(6rem, 12vw, 10rem) 0 clamp(5rem, 10vw, 8rem);
                        overflow: hidden;
                        background: linear-gradient(160deg, ${C.verdigrisDark} 0%, ${C.ink} 50%, #0A0E0D 100%);
                    }
                    .hms-hero-glow {
                        position: absolute; inset: 0;
                        background:
                            radial-gradient(ellipse 60% 50% at 15% 20%, rgba(169,143,110,0.18) 0%, transparent 60%),
                            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(61,79,71,0.15) 0%, transparent 60%);
                        pointer-events: none;
                    }
                    .hms-hero-grid {
                        position: absolute; inset: 0;
                        background-image:
                            linear-gradient(rgba(250,248,244,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(250,248,244,0.025) 1px, transparent 1px);
                        background-size: 48px 48px;
                        mask-image: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 65%);
                        -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 65%);
                        pointer-events: none;
                    }
                    .hms-hero-content { position: relative; z-index: 2; max-width: 780px; }
                    .hms-hero-breadcrumb {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.72rem; color: ${C.textTer};
                        margin-bottom: 2rem; letter-spacing: 0.02em;
                    }
                    .hms-hero-breadcrumb a { color: ${C.brassLight}; transition: color 0.2s; }
                    .hms-hero-breadcrumb a:hover { color: ${C.bone}; }
                    .hms-hero h1 {
                        font-family: 'Fraunces', serif;
                        font-size: clamp(2.2rem, 5.5vw, 3.6rem);
                        color: ${C.bone}; font-weight: 500; line-height: 1.1;
                        letter-spacing: -0.03em; margin-bottom: 1.25rem;
                    }
                    .hms-hero h1 span {
                        background: linear-gradient(135deg, ${C.brassLight} 0%, ${C.brass} 100%);
                        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                    }
                    .hms-hero-subtitle {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.82rem; color: ${C.brassLight};
                        margin-bottom: 1.5rem; letter-spacing: 0.06em; text-transform: uppercase;
                    }
                    .hms-hero-desc {
                        font-size: 1.05rem; color: rgba(250,248,244,0.6);
                        line-height: 1.8; margin-bottom: 2.5rem; max-width: 620px;
                    }
                    .hms-hero-desc strong { color: ${C.bone}; font-weight: 600; }
                    .hms-hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }

                    .hms-btn-primary {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: ${C.brass}; color: ${C.ink}; border: none;
                        padding: 0.85rem 2rem; border-radius: 8px;
                        font-size: 0.9rem; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif; transition: all 0.25s ease;
                    }
                    .hms-btn-primary:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139,115,85,0.3); }

                    .hms-btn-outline-dark {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.bone};
                        border: 1px solid ${C.lineMid}; padding: 0.85rem 2rem;
                        border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s ease;
                    }
                    .hms-btn-outline-dark:hover { border-color: rgba(250,248,244,0.35); transform: translateY(-2px); }

                    .hms-btn-outline-light {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.text};
                        border: 1px solid ${C.line}; padding: 0.85rem 2rem;
                        border-radius: 8px; font-size: 0.9rem; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.25s ease;
                    }
                    .hms-btn-outline-light:hover { border-color: ${C.text}; background: ${C.ink}; color: ${C.bone}; transform: translateY(-2px); }

                    .hms-hero-stats {
                        position: absolute; right: clamp(1.25rem, 5vw, 2.5rem);
                        top: 50%; transform: translateY(-50%);
                        display: flex; flex-direction: column; gap: 1rem; z-index: 2;
                    }
                    .hms-hero-stat {
                        background: rgba(10,12,11,0.75); backdrop-filter: blur(16px);
                        border: 1px solid ${C.lineMid}; border-radius: 10px;
                        padding: 0.9rem 1.2rem; text-align: right; min-width: 150px;
                        box-shadow: 0 8px 32px rgba(0,0,0,0.3); transition: all 0.3s ease;
                    }
                    .hms-hero-stat:hover { border-color: ${C.brassPaleBorder}; box-shadow: 0 12px 40px rgba(0,0,0,0.4); transform: translateY(-3px); }
                    .hms-hero-stat-value { font-family: 'Fraunces', serif; font-size: 1.5rem; color: ${C.bone}; font-weight: 500; line-height: 1; }
                    .hms-hero-stat-label { font-size: 0.68rem; color: ${C.textTer}; margin-top: 0.3rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em; }

                    /* ═══ WHAT IS (LIGHT) ═══ */
                    .hms-what { padding: clamp(4.5rem, 9vw, 7rem) 0; background: ${C.bone}; }
                    .hms-what-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
                    .hms-what-text p { font-size: 1rem; line-height: 1.8; color: ${C.textSec}; margin-bottom: 1.25rem; }
                    .hms-what-text p strong { color: ${C.text}; font-weight: 600; }

                    /* ═══ FLEET MOCK (LIGHT) ═══ */
                    .hms-mock-light {
                        background: ${C.white}; border: 1px solid ${C.line}; border-radius: 14px;
                        overflow: hidden; box-shadow: 0 20px 40px -12px rgba(21,23,26,0.08);
                        transition: transform 0.4s ease, box-shadow 0.4s ease;
                    }
                    .hms-mock-light:hover { transform: translateY(-6px); box-shadow: 0 28px 50px -12px rgba(21,23,26,0.12); }
                    .hms-mock-light-header {
                        display: flex; align-items: center; justify-content: space-between;
                        padding: 0.7rem 1rem; background: ${C.bone2}; border-bottom: 1px solid ${C.line};
                    }
                    .hms-mock-light-stats {
                        display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px;
                        background: ${C.line}; border-bottom: 1px solid ${C.line};
                    }
                    .hms-mock-light-stat-box {
                        background: ${C.white}; padding: 0.9rem 1rem; text-align: center;
                    }
                    .hms-mock-light-stat-num { display: block; font-family: 'Fraunces', serif; font-size: 1.6rem; font-weight: 500; line-height: 1; }
                    .hms-mock-light-stat-lab { display: block; font-size: 0.68rem; color: ${C.textTer}; margin-top: 0.25rem; font-family: "'JetBrains Mono', monospace"; letter-spacing: 0.06em; text-transform: uppercase; }
                    .hms-mock-light-list { padding: 0.5rem 1.15rem; }
                    .hms-mock-light-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; }
                    .hms-mock-light-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }
                    .hms-mock-light-badge {
                        display: inline-block; font-size: 0.65rem; font-family: "'JetBrains Mono', monospace";
                        font-weight: 500; padding: 0.2rem 0.5rem; border-radius: 4px;
                        border: 1px solid; letter-spacing: 0.04em;
                    }
                    .hms-mock-light-maint {
                        display: flex; align-items: center; gap: 0.75rem; margin: 0.5rem 1.15rem 1rem;
                        padding: 0.75rem; background: ${C.bone2}; border-radius: 8px;
                        border: 1px solid ${C.line};
                    }

                    /* ═══ FEATURES (LIGHT) ═══ */
                    .hms-features { padding: clamp(4.5rem, 9vw, 7rem) 0; background: ${C.white}; }
                    .hms-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
                    .hms-feature-card {
                        background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 12px;
                        padding: 1.75rem 1.5rem; transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
                        position: relative; overflow: hidden;
                    }
                    .hms-feature-card::before {
                        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
                        background: linear-gradient(90deg, transparent, ${C.brass}, transparent);
                        opacity: 0; transition: opacity 0.35s ease;
                    }
                    .hms-feature-card:hover { border-color: ${C.brassPaleBorder}; transform: translateY(-5px); box-shadow: 0 16px 40px rgba(21,23,26,0.06); }
                    .hms-feature-card:hover::before { opacity: 1; }
                    .hms-feature-icon {
                        width: 42px; height: 42px; border-radius: 9px; background: ${C.white};
                        border: 1px solid ${C.line}; display: flex; align-items: center; justify-content: center;
                        color: ${C.brass}; margin-bottom: 1.1rem; transition: all 0.35s ease;
                    }
                    .hms-feature-card:hover .hms-feature-icon { background: ${C.brass}; color: ${C.white}; border-color: ${C.brass}; box-shadow: 0 4px 12px rgba(139,115,85,0.2); }
                    .hms-feature-card h3 { font-size: 0.95rem; color: ${C.text}; font-weight: 600; margin-bottom: 0.55rem; line-height: 1.3; font-family: 'Inter', sans-serif; }
                    .hms-feature-card p { font-size: 0.84rem; color: ${C.textSec}; line-height: 1.65; }

                    /* ═══ BENEFITS (DARK CONTRAST) ═══ */
                    .hms-benefits { padding: clamp(4.5rem, 9vw, 7rem) 0; background: ${C.ink}; }
                    .hms-benefits-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
                    .hms-benefit-card {
                        background: rgba(250,248,244,0.025); border: 1px solid ${C.lineMid}; border-radius: 14px;
                        padding: 2rem; transition: all 0.4s cubic-bezier(0.22,1,0.36,1); position: relative; overflow: hidden;
                    }
                    .hms-benefit-card::before {
                        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
                        background: linear-gradient(90deg, transparent, var(--bc, ${C.brassLight}), transparent);
                        opacity: 0; transition: opacity 0.4s ease;
                    }
                    .hms-benefit-card:hover { border-color: var(--bc, ${C.brassLight}); transform: translateY(-5px); box-shadow: 0 16px 44px rgba(0,0,0,0.35); }
                    .hms-benefit-card:hover::before { opacity: 1; }
                    .hms-benefit-stat-big { font-family: 'Fraunces', serif; font-size: 2.8rem; color: ${C.bone}; font-weight: 500; line-height: 1; margin-bottom: 0.3rem; }
                    .hms-benefit-stat-label { font-size: 0.68rem; color: var(--bc, ${C.brassLight}); font-family: "'JetBrains Mono', monospace"; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.5rem; }
                    .hms-benefit-card h3 { font-size: 1.02rem; color: ${C.bone}; font-weight: 600; margin-bottom: 0.5rem; font-family: 'Inter', sans-serif; }
                    .hms-benefit-card p { font-size: 0.84rem; color: rgba(250,248,244,0.4); line-height: 1.7; }
                    .hms-benefit-card:hover p { color: rgba(250,248,244,0.6); }

                    /* ═══ USE CASES (LIGHT) ═══ */
                    .hms-usecases { padding: clamp(4.5rem, 9vw, 7rem) 0; background: ${C.bone}; }
                    .hms-usecases-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
                    .hms-usecase-card {
                        background: ${C.white}; border: 1px solid ${C.line}; border-radius: 12px;
                        padding: 1.75rem 1.5rem; transition: all 0.35s ease; display: flex; flex-direction: column;
                    }
                    .hms-usecase-card:hover { border-color: ${C.brassPaleBorder}; transform: translateY(-4px); box-shadow: 0 14px 36px rgba(21,23,26,0.06); }
                    .hms-usecase-tag {
                        display: inline-flex; align-self: flex-start; font-family: "'JetBrains Mono', monospace";
                        font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase;
                        color: ${C.verdigris}; background: ${C.verdigrisPale}; border: 1px solid ${C.verdigrisPaleBorder};
                        padding: 0.22rem 0.55rem; border-radius: 4px; margin-bottom: 1.2rem;
                    }
                    .hms-usecase-icon {
                        width: 38px; height: 38px; border-radius: 8px; background: ${C.bone2};
                        border: 1px solid ${C.line}; display: flex; align-items: center; justify-content: center;
                        color: ${C.text}; margin-bottom: 1rem; transition: all 0.3s ease;
                    }
                    .hms-usecase-card:hover .hms-usecase-icon { background: ${C.brass}; color: ${C.white}; border-color: ${C.brass}; }
                    .hms-usecase-card h3 { font-size: 1rem; color: ${C.text}; font-weight: 600; margin-bottom: 0.55rem; font-family: 'Inter', sans-serif; }
                    .hms-usecase-card p { font-size: 0.82rem; color: ${C.textSec}; line-height: 1.65; flex: 1; }

                    /* ═══ CTA (LIGHT) ═══ */
                    .hms-cta { padding: clamp(4.5rem, 9vw, 7rem) 0; background: ${C.bone}; }
                    .hms-cta-box {
                        position: relative; background: ${C.white}; border: 1px solid ${C.line};
                        border-radius: 20px; padding: clamp(3rem, 6vw, 5rem); text-align: center; overflow: hidden;
                    }
                    .hms-cta-box::before {
                        content: ''; position: absolute; inset: 0;
                        background: radial-gradient(ellipse 60% 50% at 25% 20%, ${C.verdigrisPale} 0%, transparent 70%),
                            radial-gradient(ellipse 40% 40% at 80% 80%, ${C.brassPale} 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-cta-content { position: relative; z-index: 2; }
                    .hms-cta-box h2 { font-family: 'Fraunces', serif; font-size: clamp(1.8rem, 4vw, 2.5rem); color: ${C.text}; font-weight: 500; margin-bottom: 1rem; letter-spacing: '-0.02em'; }
                    .hms-cta-box p { font-size: 1.05rem; color: ${C.textSec}; line-height: 1.7; max-width: 540px; margin: 0 auto 2.5rem; }
                    .hms-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    /* ═══ RELATED (LIGHT) ═══ */
                    .hms-related { padding: clamp(3rem, 6vw, 5rem) 0; background: ${C.white}; border-top: 1px solid ${C.line}; }
                    .hms-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
                    .hms-related-link {
                        display: flex; align-items: center; gap: 0.6rem; padding: 1rem 1.2rem;
                        background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 10px;
                        font-size: 0.84rem; color: ${C.textSec}; transition: all 0.25s ease; cursor: pointer;
                    }
                    .hms-related-link:hover { background: ${C.white}; border-color: ${C.text}; color: ${C.text}; transform: translateX(4px); box-shadow: 0 4px 12px rgba(21,23,26,0.04); }
                    .hms-related-link svg { flex-shrink: 0; color: ${C.brass}; opacity: 0.5; transition: opacity 0.2s; }
                    .hms-related-link:hover svg { opacity: 1; }

                    /* ═══ RESPONSIVE ═══ */
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
                                    <Link to="/">Home</Link><ChevronRight size={12} />
                                    <Link to="/mortuary-management-software">Solutions</Link><ChevronRight size={12} />
                                    <span>Hearse Management</span>
                                </div>
                            </FadeUp>
                            <FadeUp delay={80}><h1><span>Hearse Management</span><br />Software Kenya</h1></FadeUp>
                            <FadeUp delay={160}><div className="hms-hero-subtitle">Fleet Availability, Maintenance & Operations</div></FadeUp>
                            <FadeUp delay={240}>
                                <p className="hms-hero-desc">
                                    Kenya's premier <strong>hearse management software</strong> — intelligent
                                    dispatch, real-time availability tracking, and automated maintenance scheduling
                                    for funeral homes and mortuaries.
                                </p>
                            </FadeUp>
                            <FadeUp delay={320}>
                                <div className="hms-hero-buttons">
                                    <Link to="/register" className="hms-btn-primary">Request Demo <ArrowRight size={16} /></Link>
                                    <Link to="/contact" className="hms-btn-outline-dark">Contact Sales</Link>
                                </div>
                            </FadeUp>
                        </div>
                        <div className="hms-hero-stats">
                            <FadeUp delay={400}><div className="hms-hero-stat"><div className="hms-hero-stat-value">35%</div><div className="hms-hero-stat-label">Fuel Saved</div></div></FadeUp>
                            <FadeUp delay={500}><div className="hms-hero-stat"><div className="hms-hero-stat-value">Live</div><div className="hms-hero-stat-label">Status Tracking</div></div></FadeUp>
                            <FadeUp delay={600}><div className="hms-hero-stat"><div className="hms-hero-stat-value">&lt;5min</div><div className="hms-hero-stat-label">Avg. Dispatch</div></div></FadeUp>
                        </div>
                    </div>
                </section>

                <div className="hms-divider" />

                {/* ═══ WHAT IS (LIGHT) ═══ */}
                <section className="hms-what">
                    <div className="hms-container">
                        <div className="hms-what-grid">
                            <div className="hms-what-text">
                                <FadeUp>
                                    <SectionLabel>Overview</SectionLabel>
                                    <SectionHeading sub="From manual dispatch logs to intelligent fleet coordination.">
                                        What is Hearse Management Software?
                                    </SectionHeading>
                                </FadeUp>
                                <FadeUp delay={100}>
                                    <p>
                                        <strong>Hearse management software</strong> is a specialized solution for
                                        funeral homes and mortuaries to manage <strong>fleet availability</strong>,
                                        schedule preventive <strong>maintenance</strong>, and streamline daily
                                        fleet operations without the chaos of manual logs.
                                    </p>
                                </FadeUp>
                                <FadeUp delay={200}>
                                    <p>
                                        It ensures you always know which hearse is available, when the next service
                                        is due, and who is scheduled to drive — keeping your operations running
                                        smoothly and your fleet road-ready.
                                    </p>
                                </FadeUp>
                            </div>
                            <FadeUp delay={250}>
                                <FleetOpsMock />
                            </FadeUp>
                        </div>
                    </div>
                </section>

                <div className="hms-divider" />

                {/* ═══ FEATURES (LIGHT) ═══ */}
                <section className="hms-features">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Capabilities</SectionLabel>
                            <SectionHeading sub="Six core modules purpose-built for fleet operations.">
                                Key Features
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

                {/* ═══ BENEFITS (DARK) ═══ */}
                <section className="hms-benefits">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel light>Impact</SectionLabel>
                            <SectionHeading light sub="Measurable results on fleet performance, family experience, and operational control.">
                                Why Rest Point?
                            </SectionHeading>
                        </FadeUp>
                        <div className="hms-benefits-grid">
                            {benefits.map((b, i) => (
                                <FadeUp key={i} delay={i * 100}>
                                    <div className="hms-benefit-card" style={{ '--bc': b.color }}>
                                        <div className="hms-benefit-stat-big">{b.stat}</div>
                                        <div className="hms-benefit-stat-label">{b.statLabel}</div>
                                        <h3>{b.title}</h3>
                                        <p>{b.desc}</p>
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="hms-divider" />

                {/* ═══ USE CASES (LIGHT) ═══ */}
                <section className="hms-usecases">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Deployments</SectionLabel>
                            <SectionHeading sub="From single-vehicle operators to county-wide fleet networks.">
                                Who Uses This?
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

                {/* ═══ CTA (LIGHT) ═══ */}
                <section className="hms-cta">
                    <div className="hms-container">
                        <FadeUp>
                            <div className="hms-cta-box">
                                <div className="hms-cta-content">
                                    <h2>Ready to Optimize Your Fleet?</h2>
                                    <p>Join funeral homes and mortuaries across Kenya that trust Rest Point for hearse management. Get started with a free demo.</p>
                                    <div className="hms-cta-buttons">
                                        <Link to="/register" className="hms-btn-primary">Get Free Demo <ArrowRight size={16} /></Link>
                                        <Link to="/pricing" className="hms-btn-outline-light">View Pricing <ExternalLink size={14} /></Link>
                                    </div>
                                </div>
                            </div>
                        </FadeUp>
                    </div>
                </section>

                {/* ═══ RELATED (LIGHT) ═══ */}
                <section className="hms-related">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Explore</SectionLabel>
                            <SectionHeading>Related Resources</SectionHeading>
                        </FadeUp>
                        <div className="hms-related-grid">
                            {relatedLinks.map((r, i) => (
                                <FadeUp key={i} delay={i * 80}>
                                    <Link to={r.to} className="hms-related-link">
                                        <ChevronRight size={14} /> {r.label}
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