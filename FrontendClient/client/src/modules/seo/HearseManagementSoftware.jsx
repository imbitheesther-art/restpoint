import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowRight, ChevronRight, ChevronLeft, ExternalLink, Navigation,
    MapPin, UserCheck, Settings, MessageSquare, FileText, Truck, Eye,
    Heart, ClipboardCheck, Building2, Shield, CalendarClock, CheckCircle,
    Play, Maximize2, Star, Zap, Clock, Wrench, Gauge
} from '../../utils/icons/icons';

const C = {
    ink: '#0A0C0B',
    inkSoft: '#111413',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    white: '#FFFFFF',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    brassPale: 'rgba(139,115,85,0.08)',
    brassPaleBorder: 'rgba(139,115,85,0.18)',
    verdigris: '#3D4F47',
    verdigrisDark: '#1A2420',
    verdigrisLight: '#4D6359',
    verdigrisPale: 'rgba(61,79,71,0.06)',
    verdigrisPaleBorder: 'rgba(61,79,71,0.15)',
    accent: '#C77B5E',
    accentPale: 'rgba(199,123,94,0.08)',
    line: '#E3DDD0',
    lineLight: 'rgba(250,248,244,0.06)',
    lineMid: 'rgba(250,248,244,0.1)',
    text: '#15171A',
    textSec: '#6B6862',
    textTer: '#8A8780',
};

/* ═══════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════ */
const useInView = (threshold = 0.12) => {
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
                transform: inView ? 'translateY(0)' : 'translateY(36px)',
                transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};

/* ═══════════════════════════════════════
   SHARED
   ═══════════════════════════════════════ */
const SectionLabel = ({ children, light }) => (
    <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: light ? C.brassLight : C.brass, marginBottom: '1.25rem',
    }}>
        <span style={{ width: 20, height: 1, background: light ? C.brassLight : C.brass, display: 'inline-block' }} />
        {children}
    </div>
);

const SectionHeading = ({ children, sub, light }) => (
    <div style={{ marginBottom: '3rem' }}>
        <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.7rem, 3.8vw, 2.6rem)',
            color: light ? C.bone : C.text, fontWeight: 500, lineHeight: 1.15,
            letterSpacing: '-0.02em', marginBottom: sub ? '0.9rem' : 0,
        }}>{children}</h2>
        {sub && <p style={{ fontSize: '1rem', color: light ? 'rgba(250,248,244,0.5)' : C.textSec, lineHeight: 1.75, maxWidth: 580 }}>{sub}</p>}
    </div>
);

/* ═══════════════════════════════════════
   VEHICLE SHOWCASE
   ═══════════════════════════════════════ */
const VehicleShowcase = () => {
    const [activeIdx, setActiveIdx] = useState(0);

    const vehicles = [
        { name: 'Executive Sedan', type: 'Standard Hearse', plate: 'KDG 345A', status: 'available' },
        { name: 'Premium Estate', type: 'Luxury Coach', plate: 'KDH 678B', status: 'dispatched' },
        { name: 'Urban Voyager', type: 'Compact Van', plate: 'KDJ 912C', status: 'available' },
        { name: 'Classic Limousine', type: 'Stretch Hearse', plate: 'KBA 104D', status: 'maintenance' },
    ];

    const active = vehicles[activeIdx];

    return (
        <div className="hms-showcase">
            {/* Main Display */}
            <div className="hms-showcase-main">
                <div className="hms-showcase-vehicle">
                    <div className="hms-showcase-vehicle-body">
                        {/* Abstract hearse silhouette using CSS */}
                        <div className="hms-hearse-silhouette">
                            <div className="hms-hearse-roof" />
                            <div className="hms-hearse-body" />
                            <div className="hms-hearse-hood" />
                            <div className="hms-hearse-window w1" />
                            <div className="hms-hearse-window w2" />
                            <div className="hms-hearse-window w3" />
                            <div className="hms-hearse-wheel wl" />
                            <div className="hms-hearse-wheel wr" />
                            <div className="hms-hearse-ground" />
                            <div className="hms-hearse-reflection" />
                        </div>
                        <div className="hms-showcase-spotlight" />
                    </div>

                    {/* Vehicle Info Overlay */}
                    <div className="hms-showcase-info">
                        <div className="hms-showcase-badge">{active.type}</div>
                        <h3 className="hms-showcase-name">{active.name}</h3>
                        <div className="hms-showcase-plate">{active.plate}</div>
                        <div className="hms-showcase-specs">
                            <div className="hms-showcase-spec">
                                <Gauge size={14} />
                                <span>Fleet Ready</span>
                            </div>
                            <div className="hms-showcase-spec">
                                <Wrench size={14} />
                                <span>Lowering Gear</span>
                            </div>
                            <div className="hms-showcase-spec">
                                <Star size={14} />
                                <span>Executive Trim</span>
                            </div>
                        </div>
                        <p className="hms-showcase-desc">
                            All our hearses come with standard lowering gear & grass mats,
                            backup P.A. system, gazebo & executive church trolley.
                        </p>
                        <button className="hms-showcase-cta">
                            View More Images <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Nav Arrows */}
                <button
                    className="hms-showcase-arrow left"
                    onClick={() => setActiveIdx(i => i === 0 ? vehicles.length - 1 : i - 1)}
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    className="hms-showcase-arrow right"
                    onClick={() => setActiveIdx(i => (i + 1) % vehicles.length)}
                >
                    <ChevronRight size={20} />
                </button>

                {/* Thumbnails */}
                <div className="hms-showcase-thumbs">
                    {vehicles.map((v, i) => (
                        <button
                            key={i}
                            className={`hms-showcase-thumb ${i === activeIdx ? 'active' : ''}`}
                            onClick={() => setActiveIdx(i)}
                        >
                            <div className="hms-showcase-thumb-vehicle">
                                <div className={`hms-hearse-mini ${v.status}`} />
                            </div>
                            <div className="hms-showcase-thumb-label">{v.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Live Status Panel */}
            <div className="hms-showcase-status">
                <div className="hms-showcase-status-header">
                    <div className="hms-showcase-dots">
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5F57' }} />
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FEBC2E' }} />
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28C840' }} />
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: C.textTer, letterSpacing: '0.12em' }}>FLEET LIVE</span>
                    <div className="hms-showcase-live-dot" />
                </div>

                <div className="hms-showcase-status-stats">
                    {[
                        { label: 'Available', value: '2', color: '#22c55e' },
                        { label: 'En Route', value: '1', color: C.accent },
                        { label: 'Service', value: '1', color: C.brass },
                    ].map((s, i) => (
                        <div key={i} className="hms-showcase-status-stat">
                            <span style={{ color: s.color, fontFamily: "'Fraunces', serif", fontSize: '1.4rem', fontWeight: 500, lineHeight: 1 }}>{s.value}</span>
                            <span style={{ fontSize: '0.6rem', color: C.textTer, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="hms-showcase-status-list">
                    {vehicles.map((v, i) => {
                        const sc = { available: { c: '#22c55e', l: 'Available' }, dispatched: { c: C.accent, l: 'En Route' }, maintenance: { c: C.brass, l: 'Service' } }[v.status];
                        return (
                            <div key={i} className="hms-showcase-status-row" style={{ borderColor: i < 3 ? C.line : 'transparent' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.c, flexShrink: 0, boxShadow: `0 0 6px ${sc.c}44` }} />
                                    <div>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: C.text }}>{v.name}</div>
                                        <div style={{ fontSize: '0.62rem', color: C.textTer, fontFamily: "'JetBrains Mono', monospace" }}>{v.plate}</div>
                                    </div>
                                </div>
                                <span className="hms-showcase-status-badge" style={{ color: sc.c, background: `${sc.c}10`, borderColor: `${sc.c}30` }}>{sc.l}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="hms-showcase-maint">
                    <CalendarClock size={12} color={C.brass} style={{ flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: C.text }}>Upcoming: Oil Change</div>
                        <div style={{ fontSize: '0.62rem', color: C.textTer }}>Classic Limousine · Jun 18</div>
                    </div>
                    <CheckCircle size={13} color="#22c55e" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
const HearseManagementSoftware = () => {
    const features = [
        { icon: <Navigation size={20} />, title: 'Intelligent Dispatch', desc: 'Auto-assign the nearest available hearse based on driver schedules, vehicle capacity, and service requirements.' },
        { icon: <Truck size={20} />, title: 'Fleet Availability', desc: 'Real-time visibility into which hearses are available, dispatched, or in maintenance across your fleet.' },
        { icon: <Wrench size={20} />, title: 'Maintenance Scheduling', desc: 'Preventive maintenance tracking to ensure zero unexpected breakdowns and full service history.' },
        { icon: <UserCheck size={20} />, title: 'Driver Management', desc: 'Track driver schedules, certifications, and availability with compliance and hours monitoring.' },
        { icon: <MessageSquare size={20} />, title: 'Family Communication', desc: 'Automated SMS notifications with driver details, estimated arrival times, and status updates.' },
        { icon: <FileText size={20} />, title: 'Billing & Docs', desc: 'Auto-generated transport invoices and service logs, integrated with mortuary billing.' },
    ];

    const benefits = [
        { icon: <Truck size={20} />, title: 'Optimized Fleet Utilization', desc: 'Reduce fuel costs and vehicle wear with better scheduling. Increase capacity without adding vehicles.', stat: '35%', statLabel: 'Fuel Saved', color: C.brassLight },
        { icon: <Eye size={20} />, title: 'Total Fleet Visibility', desc: 'Know exactly where every hearse is and its status from any device. No more radio calls.', stat: 'Live', statLabel: 'Tracking', color: '#4ADE80' },
        { icon: <Heart size={20} />, title: 'Family Satisfaction', desc: 'Proactive notifications and accurate ETAs reduce anxiety during transport.', stat: '<5min', statLabel: 'Dispatch', color: C.accent },
        { icon: <ClipboardCheck size={20} />, title: 'Complete Audit Trail', desc: 'Comprehensive records of all transports, maintenance, and assignments for compliance.', stat: '100%', statLabel: 'Records', color: C.verdigrisLight },
    ];

    const useCases = [
        { icon: <Building2 size={18} />, title: 'Funeral Homes', desc: 'Manage hearse fleets and coordinate with families for timely transportation.', tag: 'Direct' },
        { icon: <Building2 size={18} />, title: 'Hospital Morgues', desc: 'Coordinate body transfers to funeral homes and track inter-facility transports.', tag: 'Transfer' },
        { icon: <Shield size={18} />, title: 'Private Mortuaries', desc: 'Offer premium transportation services and compete with larger facilities.', tag: 'Premium' },
        { icon: <Settings size={18} />, title: 'County Networks', desc: 'Coordinate body transportation across multiple locations within county networks.', tag: 'Public' },
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
                <title>Hearse Management Software Kenya | Mortuary Transport & Fleet Management</title>
                <meta name="description" content="Rest Point is Kenya's leading hearse management software. Complete fleet management for funeral homes — dispatch, scheduling, and maintenance optimized for Kenyan operations." />
                <link rel="canonical" href="https://restpoint.co.ke/hearse-management" />
            </Helmet>

            <div className="hms-page">
                <style>{`
          /* ═══ GLOBAL ═══ */
          .hms-page { background: ${C.bone}; color: ${C.text}; font-family: 'Inter', sans-serif; overflow-x: hidden; }
          .hms-page .hms-container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }
          .hms-page a { text-decoration: none; }
          .hms-divider { height: 1px; background: linear-gradient(90deg, transparent, ${C.line} 20%, ${C.line} 80%, transparent); }

          /* ═══ HERO ═══ */
          .hms-hero {
            position: relative; padding: clamp(5rem, 11vw, 9rem) 0 clamp(4rem, 9vw, 7rem);
            overflow: hidden;
            background: linear-gradient(170deg, #0D1210 0%, ${C.ink} 40%, #060807 100%);
          }
          .hms-hero-atmosphere {
            position: absolute; inset: 0; pointer-events: none;
            background:
              radial-gradient(ellipse 50% 60% at 20% 30%, rgba(169,143,110,0.12) 0%, transparent 65%),
              radial-gradient(ellipse 35% 45% at 75% 75%, rgba(61,79,71,0.1) 0%, transparent 60%),
              radial-gradient(ellipse 80% 30% at 50% 100%, rgba(199,123,94,0.06) 0%, transparent 50%);
          }
          .hms-hero-grid {
            position: absolute; inset: 0; pointer-events: none;
            background-image:
              linear-gradient(rgba(250,248,244,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(250,248,244,0.018) 1px, transparent 1px);
            background-size: 56px 56px;
            mask-image: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 55%);
            -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 55%);
          }
          .hms-hero-floor {
            position: absolute; bottom: 0; left: 0; right: 0; height: 35%; pointer-events: none;
            background: linear-gradient(180deg, transparent 0%, rgba(169,143,110,0.03) 100%);
          }
          .hms-hero-content { position: relative; z-index: 2; max-width: 680px; }
          .hms-hero-breadcrumb {
            display: inline-flex; align-items: center; gap: 0.45rem;
            font-family: 'JetBrains Mono', monospace; font-size: '0.68rem';
            color: rgba(250,248,244,0.3); margin-bottom: 2.5rem; letter-spacing: 0.03em;
          }
          .hms-hero-breadcrumb a { color: ${C.brassLight}; transition: color 0.2s; }
          .hms-hero-breadcrumb a:hover { color: ${C.bone}; }
          .hms-hero h1 {
            font-family: 'Fraunces', serif; font-size: clamp(2.4rem, 6vw, 4rem);
            color: ${C.bone}; font-weight: 500; line-height: 1.05;
            letter-spacing: -0.035em; margin-bottom: 0.5rem;
          }
          .hms-hero h1 em {
            font-style: normal;
            background: linear-gradient(135deg, ${C.brassLight} 0%, ${C.brass} 60%, ${C.accent} 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          }
          .hms-hero-tagline {
            font-family: 'JetBrains Mono', monospace; font-size: '0.78rem';
            color: ${C.brassLight}; margin-bottom: 1.75rem;
            letter-spacing: '0.08em'; text-transform: uppercase;
            display: flex; align-items: center; gap: '0.5rem';
          }
          .hms-hero-tagline::before {
            content: ''; width: 32px; height: 1px; background: ${C.brassLight}; display: inline-block;
          }
          .hms-hero-desc {
            font-size: '1rem'; color: rgba(250,248,244,0.45);
            line-height: 1.85; margin-bottom: 2.5rem; max-width: 560px;
          }
          .hms-hero-desc strong { color: rgba(250,248,244,0.75); font-weight: 600; }
          .hms-hero-buttons { display: flex; gap: 0.85rem; flex-wrap: wrap; }
          .hms-btn-primary {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: ${C.brass}; color: ${C.ink}; border: none;
            padding: 0.8rem 1.8rem; border-radius: 8px;
            font-size: '0.88rem'; font-weight: 600; cursor: pointer;
            font-family: 'Inter', sans-serif; transition: all 0.3s ease;
          }
          .hms-btn-primary:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(139,115,85,0.3); }
          .hms-btn-ghost {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: transparent; color: ${C.bone};
            border: 1px solid ${C.lineMid}; padding: 0.8rem 1.8rem;
            border-radius: 8px; font-size: '0.88rem'; font-weight: 500;
            cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.3s ease;
          }
          .hms-btn-ghost:hover { border-color: rgba(250,248,244,0.3); transform: translateY(-2px); }
          .hms-btn-outline {
            display: inline-flex; align-items: center; gap: 0.5rem;
            background: transparent; color: ${C.text};
            border: 1px solid ${C.line}; padding: 0.8rem 1.8rem;
            border-radius: 8px; font-size: '0.88rem'; font-weight: 500;
            cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.3s ease;
          }
          .hms-btn-outline:hover { border-color: ${C.text}; background: ${C.ink}; color: ${C.bone}; transform: translateY(-2px); }

          /* Hero floating stats */
          .hms-hero-stats {
            position: absolute; right: clamp(1.5rem, 5vw, 3rem); top: 50%; transform: translateY(-50%);
            display: flex; flex-direction: column; gap: 0.85rem; z-index: 2;
          }
          .hms-hero-stat {
            background: rgba(10,12,11,0.7); backdrop-filter: blur(20px);
            border: 1px solid ${C.lineLight}; border-radius: 12px;
            padding: 0.85rem 1.1rem; text-align: right; min-width: 140px;
            box-shadow: 0 12px 40px rgba(0,0,0,0.3); transition: all 0.35s ease;
          }
          .hms-hero-stat:hover { border-color: ${C.brassPaleBorder}; transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
          .hms-hero-stat-value { font-family: 'Fraunces', serif; font-size: '1.5rem'; color: ${C.bone}; font-weight: 500; line-height: 1; }
          .hms-hero-stat-label { font-size: '0.62rem'; color: rgba(250,248,244,0.3); margin-top: 0.25rem; font-family: "'JetBrains Mono', monospace"; letter-spacing: '0.06em'; text-transform: uppercase; }

          /* ═══ SHOWCASE SECTION ═══ */
          .hms-showcase-section { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.white}; }
          .hms-showcase {
            display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.5rem; align-items: start;
          }

          /* Main vehicle display */
          .hms-showcase-main {
            background: linear-gradient(175deg, #0F1311 0%, #0A0D0C 60%, #080A09 100%);
            border: 1px solid ${C.lineLight}; border-radius: 16px; overflow: hidden;
            position: relative;
          }
          .hms-showcase-vehicle { position: relative; padding: 2.5rem 2rem 1.5rem; min-height: 340px; }
          .hms-showcase-vehicle-body { position: relative; width: 100%; height: 220px; }

          /* Hearse silhouette */
          .hms-hearse-silhouette { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); width: 380px; height: 140px; }
          .hms-hearse-body {
            position: absolute; bottom: 28px; left: 30px; right: 60px; height: 58px;
            background: linear-gradient(180deg, #1a1d1c 0%, #111413 100%);
            border-radius: 4px 12px 2px 2px;
            border: 1px solid rgba(250,248,244,0.06);
            box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(250,248,244,0.04);
          }
          .hms-hearse-roof {
            position: absolute; bottom: 84px; left: 35px; width: 220px; height: 38px;
            background: linear-gradient(180deg, #1e2120 0%, #171a19 100%);
            border-radius: 8px 8px 0 0;
            border: 1px solid rgba(250,248,244,0.05); border-bottom: none;
            box-shadow: 0 -2px 15px rgba(0,0,0,0.3);
          }
          .hms-hearse-hood {
            position: absolute; bottom: 30px; right: 20px; width: 75px; height: 50px;
            background: linear-gradient(180deg, #1c1f1e 0%, #121514 100%);
            border-radius: 2px 10px 2px 2px;
            border: 1px solid rgba(250,248,244,0.05);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          }
          .hms-hearse-window {
            position: absolute; bottom: 90px; height: 24px;
            background: linear-gradient(180deg, rgba(61,79,71,0.15) 0%, rgba(61,79,71,0.06) 100%);
            border: 1px solid rgba(250,248,244,0.04);
            border-radius: 2px;
          }
          .hms-hearse-window.w1 { left: 42px; width: 60px; }
          .hms-hearse-window.w2 { left: 110px; width: 60px; }
          .hms-hearse-window.w3 { left: 178px; width: 60px; border-radius: 2px 6px 2px 2px; }
          .hms-hearse-wheel {
            position: absolute; bottom: 18px; width: 32px; height: 32px;
            border-radius: 50%; background: #0a0c0b;
            border: 3px solid #1a1d1c;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.3);
          }
          .hms-hearse-wheel.wl { left: 60px; }
          .hms-hearse-wheel.wr { right: 85px; }
          .hms-hearse-ground {
            position: absolute; bottom: 12px; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(250,248,244,0.06) 20%, rgba(250,248,244,0.06) 80%, transparent);
          }
          .hms-hearse-reflection {
            position: absolute; bottom: 0; left: 60px; right: 80px; height: 18px;
            background: linear-gradient(180deg, rgba(250,248,244,0.015) 0%, transparent 100%);
            filter: blur(4px); border-radius: 50%;
          }

          .hms-showcase-spotlight {
            position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
            width: 300px; height: 200px;
            background: radial-gradient(ellipse at 50% 0%, rgba(169,143,110,0.08) 0%, transparent 70%);
            pointer-events: none;
          }

          /* Vehicle info */
          .hms-showcase-info { position: relative; z-index: 2; margin-top: 0.5rem; }
          .hms-showcase-badge {
            display: inline-block; font-family: "'JetBrains Mono', monospace";
            font-size: '0.6rem'; letter-spacing: '0.12em'; text-transform: uppercase;
            color: ${C.brassLight}; background: rgba(169,143,110,0.1);
            border: 1px solid rgba(169,143,110,0.2); padding: '0.2rem 0.6rem';
            border-radius: 4px; margin-bottom: 0.6rem;
          }
          .hms-showcase-name {
            font-family: 'Fraunces', serif; font-size: '1.4rem'; color: ${C.bone};
            font-weight: 500; margin-bottom: 0.2rem; letter-spacing: '-0.01em';
          }
          .hms-showcase-plate {
            font-family: "'JetBrains Mono', monospace"; font-size: '0.72rem';
            color: rgba(250,248,244,0.3); margin-bottom: 0.75rem; letter-spacing: '0.06em';
          }
          .hms-showcase-specs {
            display: flex; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap;
          }
          .hms-showcase-spec {
            display: flex; align-items: center; gap: 0.3rem;
            font-size: '0.68rem'; color: rgba(250,248,244,0.35);
          }
          .hms-showcase-desc {
            font-size: '0.82rem'; color: rgba(250,248,244,0.35);
            line-height: 1.65; margin-bottom: 1rem; max-width: 420px;
          }
          .hms-showcase-cta {
            display: inline-flex; align-items: center; gap: 0.4rem;
            background: none; border: 1px solid rgba(250,248,244,0.15);
            color: ${C.bone}; padding: '0.5rem 1rem'; border-radius: 6px;
            font-size: '0.75rem'; font-weight: 500; cursor: pointer;
            font-family: 'Inter', sans-serif; transition: all 0.25s ease;
          }
          .hms-showcase-cta:hover { border-color: ${C.brassLight}; color: ${C.brassLight}; }

          /* Arrows */
          .hms-showcase-arrow {
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 36px; height: 36px; border-radius: 50%;
            background: rgba(10,12,11,0.6); backdrop-filter: blur(10px);
            border: 1px solid rgba(250,248,244,0.08); color: ${C.bone};
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.25s ease; z-index: 3;
          }
          .hms-showcase-arrow:hover { background: rgba(139,115,85,0.2); border-color: ${C.brassPaleBorder}; }
          .hms-showcase-arrow.left { left: 0.75rem; }
          .hms-showcase-arrow.right { right: 0.75rem; }

          /* Thumbnails */
          .hms-showcase-thumbs {
            display: flex; gap: 0.5rem; padding: 0.75rem 1.25rem 1rem;
            border-top: 1px solid ${C.lineLight};
          }
          .hms-showcase-thumb {
            flex: 1; background: rgba(250,248,244,0.03); border: 1px solid transparent;
            border-radius: 8px; padding: 0.5rem; cursor: pointer; transition: all 0.25s ease;
            display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          }
          .hms-showcase-thumb:hover { background: rgba(250,248,244,0.06); }
          .hms-showcase-thumb.active { border-color: ${C.brassPaleBorder}; background: rgba(139,115,85,0.08); }
          .hms-showcase-thumb-vehicle { width: 100%; height: 32px; position: relative; }
          .hms-hearse-mini {
            position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
            width: 60px; height: 22px; background: #1a1d1c; border-radius: 2px 4px 1px 1px;
            border: 1px solid rgba(250,248,244,0.06);
          }
          .hms-hearse-mini::before {
            content: ''; position: absolute; top: -8px; left: 4px; width: 32px; height: 10px;
            background: #1e2120; border-radius: 4px 4px 0 0; border: 1px solid rgba(250,248,244,0.04); border-bottom: none;
          }
          .hms-hearse-mini.dispatched { opacity: 0.6; }
          .hms-hearse-mini.maintenance { opacity: 0.4; border-color: ${C.brassPaleBorder}; }
          .hms-showcase-thumb-label { font-size: '0.55rem'; color: rgba(250,248,244,0.3); font-family: "'JetBrains Mono', monospace"; letter-spacing: '0.04em'; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
          .hms-showcase-thumb.active .hms-showcase-thumb-label { color: ${C.brassLight}; }

          /* Status panel */
          .hms-showcase-status {
            background: ${C.white}; border: 1px solid ${C.line}; border-radius: 14px;
            overflow: hidden; box-shadow: 0 16px 40px -12px rgba(21,23,26,0.06);
            transition: all 0.4s ease;
          }
          .hms-showcase-status:hover { box-shadow: 0 20px 48px -12px rgba(21,23,26,0.1); transform: translateY(-3px); }
          .hms-showcase-status-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.6rem 0.9rem; background: ${C.bone2}; border-bottom: 1px solid ${C.line};
          }
          .hms-showcase-dots { display: flex; gap: 0.3rem; }
          .hms-showcase-live-dot {
            width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
            animation: livePulse 2s ease infinite;
          }
          @keyframes livePulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); } 50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(34,197,94,0); } }

          .hms-showcase-status-stats {
            display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: ${C.line}; border-bottom: 1px solid ${C.line};
          }
          .hms-showcase-status-stat {
            background: ${C.white}; padding: 0.85rem 0.75rem; text-align: center;
            display: flex; flex-direction: column; gap: 0.2rem;
          }
          .hms-showcase-status-list { padding: 0.4rem 0.9rem; }
          .hms-showcase-status-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.65rem 0; border-bottom: 1px solid ${C.line};
          }
          .hms-showcase-status-badge {
            display: inline-block; font-size: '0.6rem'; font-family: "'JetBrains Mono', monospace";
            font-weight: 500; padding: 0.18rem 0.45rem; border-radius: 4px;
            border: 1px solid; letter-spacing: '0.04em';
          }
          .hms-showcase-maint {
            display: flex; align-items: center; gap: 0.6rem; margin: 0.5rem 0.9rem 0.85rem;
            padding: 0.65rem; background: ${C.bone2}; border-radius: 8px; border: 1px solid ${C.line};
          }

          /* ═══ FEATURES ═══ */
          .hms-features { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.bone}; }
          .hms-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
          .hms-feature-card {
            background: ${C.white}; border: 1px solid ${C.line}; border-radius: 14px;
            padding: 1.6rem 1.4rem; transition: all 0.4s cubic-bezier(0.22,1,0.36,1);
            position: relative; overflow: hidden;
          }
          .hms-feature-card::after {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, ${C.brass}, transparent);
            opacity: 0; transition: opacity 0.4s ease;
          }
          .hms-feature-card:hover { border-color: ${C.brassPaleBorder}; transform: translateY(-6px); box-shadow: 0 20px 48px rgba(21,23,26,0.07); }
          .hms-feature-card:hover::after { opacity: 1; }
          .hms-feature-icon {
            width: 40px; height: 40px; border-radius: 10px; background: ${C.bone2};
            border: 1px solid ${C.line}; display: flex; align-items: center; justify-content: center;
            color: ${C.brass}; margin-bottom: 1rem; transition: all 0.35s ease;
          }
          .hms-feature-card:hover .hms-feature-icon { background: ${C.brass}; color: ${C.white}; border-color: ${C.brass}; box-shadow: 0 6px 16px rgba(139,115,85,0.25); }
          .hms-feature-card h3 { font-size: '0.92rem'; color: ${C.text}; font-weight: 600; margin-bottom: 0.45rem; font-family: 'Inter', sans-serif; }
          .hms-feature-card p { font-size: '0.82rem'; color: ${C.textSec}; line-height: 1.65; }

          /* ═══ BENEFITS (DARK) ═══ */
          .hms-benefits { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.ink}; position: relative; overflow: hidden; }
          .hms-benefits::before {
            content: ''; position: absolute; inset: 0; pointer-events: none;
            background: radial-gradient(ellipse 50% 50% at 80% 20%, rgba(169,143,110,0.06) 0%, transparent 60%);
          }
          .hms-benefits-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.1rem; position: relative; z-index: 1; }
          .hms-benefit-card {
            background: rgba(250,248,244,0.02); border: 1px solid ${C.lineLight}; border-radius: 16px;
            padding: 1.8rem; transition: all 0.4s cubic-bezier(0.22,1,0.36,1); position: relative; overflow: hidden;
          }
          .hms-benefit-card::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, var(--bc, ${C.brassLight}), transparent);
            opacity: 0; transition: opacity 0.4s ease;
          }
          .hms-benefit-card:hover { border-color: var(--bc, ${C.brassLight}); transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.35); }
          .hms-benefit-card:hover::before { opacity: 1; }
          .hms-benefit-stat-big { font-family: 'Fraunces', serif; font-size: '2.6rem'; color: ${C.bone}; font-weight: 500; line-height: 1; margin-bottom: 0.2rem; }
          .hms-benefit-stat-label { font-size: '0.62rem'; color: var(--bc, ${C.brassLight}); font-family: "'JetBrains Mono', monospace"; letter-spacing: '0.1em'; text-transform: uppercase; margin-bottom: 1.3rem; }
          .hms-benefit-card h3 { font-size: '0.98rem'; color: ${C.bone}; font-weight: 600; margin-bottom: 0.45rem; font-family: 'Inter', sans-serif; }
          .hms-benefit-card p { font-size: '0.82rem'; color: rgba(250,248,244,0.35); line-height: 1.7; transition: color 0.3s ease; }
          .hms-benefit-card:hover p { color: rgba(250,248,244,0.55); }

          /* ═══ USE CASES ═══ */
          .hms-usecases { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.white}; }
          .hms-usecases-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.1rem; }
          .hms-usecase-card {
            background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 14px;
            padding: 1.6rem 1.3rem; transition: all 0.35s ease; display: flex; flex-direction: column;
          }
          .hms-usecase-card:hover { border-color: ${C.brassPaleBorder}; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(21,23,26,0.06); }
          .hms-usecase-tag {
            display: inline-flex; align-self: flex-start; font-family: "'JetBrains Mono', monospace";
            font-size: '0.58rem'; letter-spacing: '0.1em'; text-transform: uppercase';
            color: ${C.verdigris}; background: ${C.verdigrisPale}; border: 1px solid ${C.verdigrisPaleBorder};
            padding: '0.2rem 0.5rem'; border-radius: 4px; margin-bottom: 1rem;
          }
          .hms-usecase-icon {
            width: 36px; height: 36px; border-radius: 8px; background: ${C.white};
            border: 1px solid ${C.line}; display: flex; align-items: center; justify-content: center;
            color: ${C.text}; margin-bottom: 0.85rem; transition: all 0.3s ease;
          }
          .hms-usecase-card:hover .hms-usecase-icon { background: ${C.brass}; color: ${C.white}; border-color: ${C.brass}; }
          .hms-usecase-card h3 { font-size: '0.95rem'; color: ${C.text}; font-weight: 600; margin-bottom: 0.45rem; font-family: 'Inter', sans-serif; }
          .hms-usecase-card p { font-size: '0.8rem'; color: ${C.textSec}; line-height: 1.65; flex: 1; }

          /* ═══ CTA ═══ */
          .hms-cta { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.bone}; }
          .hms-cta-box {
            position: relative; background: ${C.ink}; border: 1px solid ${C.lineLight};
            border-radius: 20px; padding: clamp(3rem, 6vw, 4.5rem); text-align: center; overflow: hidden;
          }
          .hms-cta-box::before {
            content: ''; position: absolute; inset: 0; pointer-events: none;
            background:
              radial-gradient(ellipse 55% 50% at 20% 20%, rgba(169,143,110,0.08) 0%, transparent 65%),
              radial-gradient(ellipse 40% 40% at 80% 80%, rgba(61,79,71,0.06) 0%, transparent 60%);
          }
          .hms-cta-content { position: relative; z-index: 2; }
          .hms-cta-box h2 { font-family: 'Fraunces', serif; font-size: clamp(1.7rem, 3.8vw, 2.4rem); color: ${C.bone}; font-weight: 500; margin-bottom: 0.85rem; letter-spacing: '-0.02em'; }
          .hms-cta-box p { font-size: '1rem'; color: rgba(250,248,244,0.45); line-height: 1.75; max-width: 500px; margin: 0 auto 2.25rem; }
          .hms-cta-buttons { display: flex; gap: 0.85rem; justify-content: center; flex-wrap: wrap; }

          /* ═══ RELATED ═══ */
          .hms-related { padding: clamp(3rem, 6vw, 4.5rem) 0; background: ${C.white}; border-top: 1px solid ${C.line}; }
          .hms-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem; }
          .hms-related-link {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1rem;
            background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 10px;
            font-size: '0.82rem'; color: ${C.textSec}; transition: all 0.25s ease; cursor: pointer;
          }
          .hms-related-link:hover { background: ${C.white}; border-color: ${C.text}; color: ${C.text}; transform: translateX(4px); box-shadow: 0 4px 12px rgba(21,23,26,0.04); }
          .hms-related-link svg { flex-shrink: 0; color: ${C.brass}; opacity: 0.4; transition: opacity 0.2s; }
          .hms-related-link:hover svg { opacity: 1; }

          /* ═══ RESPONSIVE ═══ */
          @media (max-width: 1024px) {
            .hms-features-grid { grid-template-columns: repeat(2, 1fr); }
            .hms-usecases-grid { grid-template-columns: repeat(2, 1fr); }
            .hms-hero-stats { display: none; }
            .hms-showcase { grid-template-columns: 1fr; }
          }
          @media (max-width: 768px) {
            .hms-benefits-grid { grid-template-columns: 1fr; }
            .hms-features-grid { grid-template-columns: 1fr; }
            .hms-usecases-grid { grid-template-columns: 1fr; }
            .hms-related-grid { grid-template-columns: 1fr; }
            .hms-showcase-thumbs { overflow-x: auto; }
            .hms-hearse-silhouette { transform: translateX(-50%) scale(0.75); }
          }
        `}</style>

                {/* ═══ HERO ═══ */}
                <section className="hms-hero">
                    <div className="hms-hero-atmosphere" />
                    <div className="hms-hero-grid" />
                    <div className="hms-hero-floor" />
                    <div className="hms-container">
                        <div className="hms-hero-content">
                            <FadeUp>
                                <div className="hms-hero-breadcrumb">
                                    <Link to="/">Home</Link><ChevronRight size={11} />
                                    <Link to="/mortuary-management-software">Solutions</Link><ChevronRight size={11} />
                                    <span>Hearse Management</span>
                                </div>
                            </FadeUp>
                            <FadeUp delay={80}>
                                <h1><em>Hearse</em> Management<br />Software Kenya</h1>
                            </FadeUp>
                            <FadeUp delay={160}>
                                <div className="hms-hero-tagline">Fleet · Dispatch · Operations</div>
                            </FadeUp>
                            <FadeUp delay={240}>
                                <p className="hms-hero-desc">
                                    Kenya's premier <strong>hearse management software</strong> — intelligent
                                    dispatch, real-time fleet availability, and automated maintenance
                                    for funeral homes and mortuaries.
                                </p>
                            </FadeUp>
                            <FadeUp delay={320}>
                                <div className="hms-hero-buttons">
                                    <Link to="/register" className="hms-btn-primary">Request Demo <ArrowRight size={15} /></Link>
                                    <Link to="/contact" className="hms-btn-ghost">Contact Sales</Link>
                                </div>
                            </FadeUp>
                        </div>
                        <div className="hms-hero-stats">
                            <FadeUp delay={400}><div className="hms-hero-stat"><div className="hms-hero-stat-value">35%</div><div className="hms-hero-stat-label">Fuel Saved</div></div></FadeUp>
                            <FadeUp delay={500}><div className="hms-hero-stat"><div className="hms-hero-stat-value">Live</div><div className="hms-hero-stat-label">Tracking</div></div></FadeUp>
                            <FadeUp delay={600}><div className="hms-hero-stat"><div className="hms-hero-stat-value">&lt;5min</div><div className="hms-hero-stat-label">Dispatch</div></div></FadeUp>
                        </div>
                    </div>
                </section>

                <div className="hms-divider" />

                {/* ═══ VEHICLE SHOWCASE ═══ */}
                <section className="hms-showcase-section">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Fleet Preview</SectionLabel>
                            <SectionHeading sub="See your fleet management in action — real-time status, vehicle details, and live operations.">
                                Your Fleet, Visualized
                            </SectionHeading>
                        </FadeUp>
                        <FadeUp delay={150}>
                            <VehicleShowcase />
                        </FadeUp>
                    </div>
                </section>

                <div className="hms-divider" />

                {/* ═══ FEATURES ═══ */}
                <section className="hms-features">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Capabilities</SectionLabel>
                            <SectionHeading sub="Six core modules purpose-built for hearse fleet operations.">
                                Key Features
                            </SectionHeading>
                        </FadeUp>
                        <div className="hms-features-grid">
                            {features.map((f, i) => (
                                <FadeUp key={i} delay={i * 70}>
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
                                <FadeUp key={i} delay={i * 90}>
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

                {/* ═══ USE CASES ═══ */}
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
                                <FadeUp key={i} delay={i * 90}>
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

                {/* ═══ CTA (DARK) ═══ */}
                <section className="hms-cta">
                    <div className="hms-container">
                        <FadeUp>
                            <div className="hms-cta-box">
                                <div className="hms-cta-content">
                                    <h2>Ready to Optimize Your Fleet?</h2>
                                    <p>Join funeral homes across Kenya that trust Rest Point for hearse management. Get started with a free demo.</p>
                                    <div className="hms-cta-buttons">
                                        <Link to="/register" className="hms-btn-primary">Get Free Demo <ArrowRight size={15} /></Link>
                                        <Link to="/pricing" className="hms-btn-ghost">View Pricing <ExternalLink size={13} /></Link>
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
                            <SectionHeading>Related Resources</SectionHeading>
                        </FadeUp>
                        <div className="hms-related-grid">
                            {relatedLinks.map((r, i) => (
                                <FadeUp key={i} delay={i * 70}>
                                    <Link to={r.to} className="hms-related-link">
                                        <ChevronRight size={13} /> {r.label}
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