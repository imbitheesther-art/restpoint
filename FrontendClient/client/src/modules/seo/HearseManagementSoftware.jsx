import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowRight, ChevronRight, ExternalLink, Navigation,
    MapPin, UserCheck, Settings, MessageSquare, FileText, Truck, Eye,
    Heart, ClipboardCheck, Building2, Shield, CalendarClock, CheckCircle,
    Play, Maximize2, Star, Zap, Clock, Wrench, Gauge, ChevronDown, X
} from '../../utils/icons/icons';

const C = {
    ink: '#07090A',
    inkSoft: '#0E1210',
    white: '#FFFFFF',
    bg: '#F7F8F6',
    bgSoft: '#EEF0EC',
    border: '#D4D9D2',
    borderDark: 'rgba(255,255,255,0.06)',
    text: '#0A0C0B',
    textSec: '#525B52',
    textTer: '#8B9489',
    accent: '#15803D', // Deep premium green
    accentLight: '#22C55E', // Bright live green
    accentDark: '#14532D',
    accentSoft: 'rgba(21, 128, 61, 0.08)',
    accentBorder: 'rgba(21, 128, 61, 0.25)',
    live: '#22C55E',
};

/* ═══════════════════════════════════════
   HOOKS & ANIMATION
   ═══════════════════════════════════════ */
const useInView = (threshold = 0.12) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } }, { threshold });
        obs.observe(el); return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
};

const FadeUp = ({ children, delay = 0, className = '' }) => {
    const [ref, inView] = useInView();
    return (
        <div ref={ref} className={className} style={{
            opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        }}>{children}</div>
    );
};

const SectionLabel = ({ children, light }) => (
    <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', fontWeight: 600,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: light ? C.accentLight : C.accent, marginBottom: '1.25rem',
    }}>
        <span style={{ width: 20, height: 2, background: light ? C.accentLight : C.accent, display: 'inline-block', borderRadius: 2 }} />
        {children}
    </div>
);

const SectionHeading = ({ children, sub, light }) => (
    <div style={{ marginBottom: '3rem' }}>
        <h2 style={{
            fontFamily: "'Inter', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            color: light ? C.white : C.text, fontWeight: 700, lineHeight: 1.15,
            letterSpacing: '-0.03em', marginBottom: sub ? '0.9rem' : 0,
        }}>{children}</h2>
        {sub && <p style={{ fontSize: '1.05rem', color: light ? C.textTer : C.textSec, lineHeight: 1.75, maxWidth: 580, fontWeight: 400 }}>{sub}</p>}
    </div>
);

/* ═══════════════════════════════════════
   ADVANCED CALENDAR & DRIVER ASSIGNMENT MOCKUP
   ═══════════════════════════════════════ */
const AdvancedCalendarMockup = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dates = [14, 15, 16, 17, 18, 19, 20];
    
    const [assignments, setAssignments] = useState({});
    const [activeDropdown, setActiveDropdown] = useState(null);

    const bookings = [
        { id: 'b1', date: 15, time: '08:00 AM', location: 'Langata Cemetery', client: 'Family Mwangi' },
        { id: 'b2', date: 17, time: '10:30 AM', location: 'Nairobi Hosp Mortuary', client: 'Family Ochieng' },
        { id: 'b3', date: 18, time: '07:00 AM', location: 'Holy Cross Church', client: 'Family Kariuki' },
    ];

    const drivers = ['James M.', 'Peter O.', 'John K.', 'Samuel L.'];

    const handleAssign = (bookingId, driverName) => {
        setAssignments(prev => ({ ...prev, [bookingId]: driverName }));
        setActiveDropdown(null);
    };

    return (
        <div className="hms-mockup-wrapper">
            {/* Main Calendar View */}
            <div className="hms-mockup-main">
                <div className="hms-mockup-header">
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text }}>Fleet Schedule</div>
                        <div style={{ fontSize: '0.7rem', color: C.textTer, marginTop: 2 }}>June 2024 · Advanced View</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.live, boxShadow: `0 0 8px ${C.live}` }}></span>
                        <span style={{ fontSize: '0.65rem', color: C.live, fontWeight: 700 }}>LIVE</span>
                    </div>
                </div>

                <div className="hms-mockup-calendar-grid">
                    {days.map((day, i) => {
                        const dayBooking = bookings.find(b => b.date === dates[i]);
                        return (
                            <div key={i} className={`hms-cal-day ${dayBooking ? 'has-booking' : ''}`}>
                                <div className="hms-cal-day-head">
                                    <span style={{ fontSize: '0.65rem', color: C.textTer, fontWeight: 500 }}>{day}</span>
                                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text }}>{dates[i]}</span>
                                </div>
                                
                                {dayBooking ? (
                                    <div className="hms-cal-booking-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: C.accentDark }}>{dayBooking.time}</span>
                                            <MapPin size={10} color={C.textTer} />
                                        </div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: C.text, marginBottom: 2, lineHeight: 1.2 }}>
                                            {dayBooking.location}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', color: C.textTer, marginBottom: 8 }}>
                                            {dayBooking.client}
                                        </div>

                                        {assignments[dayBooking.id] ? (
                                            <div className="hms-assigned-badge">
                                                <UserCheck size={10} />
                                                <span>{assignments[dayBooking.id]}</span>
                                                <button onClick={(e) => { e.stopPropagation(); handleAssign(dayBooking.id, null); }} className="hms-unassign-btn"><X size={10}/></button>
                                            </div>
                                        ) : (
                                            <div style={{ position: 'relative' }}>
                                                <button 
                                                    className="hms-assign-btn"
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === dayBooking.id ? null : dayBooking.id); }}
                                                >
                                                    Assign Driver <ChevronDown size={10} />
                                                </button>
                                                {activeDropdown === dayBooking.id && (
                                                    <div className="hms-dropdown-menu">
                                                        {drivers.map((d, idx) => (
                                                            <button key={idx} className="hms-dropdown-item" onClick={() => handleAssign(dayBooking.id, d)}>
                                                                {d}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="hms-cal-empty">
                                        <span style={{ fontSize: '1.2rem', color: C.border, fontWeight: 300 }}>+</span>
                                        <span style={{ fontSize: '0.6rem', color: C.textTer }}>Available</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Driver Portal Sidebar */}
            <div className="hms-mockup-sidebar">
                <div className="hms-mockup-sidebar-header">
                    <UserCheck size={14} color={C.textSec} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: C.text }}>Driver Portal</span>
                </div>

                <div className="hms-mockup-drivers">
                    {drivers.map((d, i) => {
                        const isAssigned = Object.values(assignments).includes(d);
                        const statusClass = isAssigned ? 'assigned' : (i === 0 ? 'online' : 'offline');
                        const statusText = isAssigned ? 'On Trip' : (i === 0 ? 'Standby' : 'Off Duty');
                        return (
                            <div key={i} className={`hms-mockup-driver ${isAssigned ? 'is-assigned' : ''}`}>
                                <div className="hms-mockup-driver-avatar" style={{ background: isAssigned ? C.accentSoft : C.bgSoft }}>
                                    <span style={{ color: isAssigned ? C.accent : C.textTer, fontWeight: 700, fontSize: '0.75rem' }}>{d.charAt(0)}</span>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: C.text }}>{d}</div>
                                    <div style={{ fontSize: '0.65rem', color: isAssigned ? C.accent : C.textTer, fontWeight: 500 }}>{statusText}</div>
                                </div>
                                <span className={`hms-driver-dot ${statusClass}`}></span>
                            </div>
                        );
                    })}
                </div>

                <div className="hms-mockup-sync-row">
                    <Zap size={12} color={C.accent} />
                    <span style={{ fontSize: '0.7rem', color: C.textSec, lineHeight: 1.4 }}>Portal synced. Assigned drivers received route details instantly.</span>
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
        { icon: <CalendarClock size={20} />, title: 'Advanced Calendar View', desc: 'See your entire week at a glance. Bookings appear directly on the calendar dates so staff know exactly when hearses are free.' },
        { icon: <UserCheck size={20} />, title: 'Direct Driver Assignment', desc: 'Click a booking and assign a specific driver from your roster. They get notified instantly via the driver portal.' },
        { icon: <Eye size={20} />, title: 'Real-Time Sync', desc: 'When a driver is assigned or a day is booked, the calendar locks out that slot for everyone else immediately.' },
        { icon: <MessageSquare size={20} />, title: 'Accurate Client Communication', desc: 'Families get exact details—driver name, vehicle, and ETA—eliminating guesswork during difficult times.' },
        { icon: <Navigation size={20} />, title: 'Instant Dispatching', desc: 'Once assigned, the driver receives routing and client details directly on their portal app. No radio calls needed.' },
        { icon: <FileText size={20} />, title: 'Complete Audit Trail', desc: 'Every calendar action, assignment, and completion is logged automatically for management and compliance.' },
    ];

    const benefits = [
        { icon: <Clock size={20} />, title: 'Zero Double-Bookings', desc: 'The calendar acts as the single source of truth. If a slot is taken, it\'s gone for everyone.', stat: '0', statLabel: 'Conflicts', color: C.live },
        { icon: <Zap size={20} />, title: 'Instant Client Responses', desc: 'Staff look at the calendar and confidently tell families exactly what days are open.', stat: '<10s', statLabel: 'Response Time', color: C.accentLight },
        { icon: <Truck size={20} />, title: 'Maximum Fleet Usage', desc: 'Easily spot gaps in your schedule and fill them. Ensure no hearse sits idle.', stat: '40%', statLabel: 'Utilization Up', color: C.white },
        { icon: <CheckCircle size={20} />, title: 'Seamless Driver Sync', desc: 'Drivers get instant push notifications for new trips directly to their portal.', stat: 'Live', statLabel: 'Portal Sync', color: C.textTer },
    ];

    const useCases = [
        { icon: <Building2 size={18} />, title: 'Funeral Homes', desc: 'Give front desk staff the power to book days ahead and assign specific drivers seamlessly.', tag: 'Primary' },
        { icon: <Truck size={18} />, title: 'Hearse Fleets', desc: 'Manage multiple vehicles and drivers from a calendar dashboard.', tag: 'Fleet Ops' },
        { icon: <Building2 size={18} />, title: 'Hospital Morgues', desc: 'Schedule transfers days out and assign external drivers through the portal.', tag: 'Transfers' },
        { icon: <Shield size={18} />, title: 'County Networks', desc: 'Coordinate multiple homes sharing a fleet with transparent, real-time calendar booking.', tag: 'Enterprise' },
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
                <title>Hearse Management Software Kenya | Real-Time Booking & Driver Portal</title>
                <meta name="description" content="Rest Point is Kenya's leading hearse management software. Advanced calendar booking, assign specific drivers, and connect directly to your drivers' portal." />
                <link rel="canonical" href="https://restpoint.co.ke/hearse-management" />
            </Helmet>

            <div className="hms-page">
                <style>{`
                    /* ═══ GLOBAL ═══ */
                    .hms-page { background: ${C.white}; color: ${C.text}; font-family: 'Inter', sans-serif; overflow-x: hidden; }
                    .hms-page .hms-container { max-width: 1200px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); }
                    .hms-page a { text-decoration: none; }
                    
                    /* ═══ HERO ═══ */
                    .hms-hero {
                        position: relative; padding: clamp(5rem, 11vw, 9rem) 0 clamp(4rem, 9vw, 7rem);
                        background: ${C.ink}; overflow: hidden;
                    }
                    .hms-hero-grid {
                        position: absolute; inset: 0; pointer-events: none;
                        background-image: linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px);
                        background-size: 64px 64px;
                        mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                        -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 70%);
                    }
                    .hms-hero-glow {
                        position: absolute; top: -20%; right: -10%; width: 600px; height: 600px; border-radius: 50%;
                        background: radial-gradient(circle, rgba(21, 128, 61, 0.15) 0%, transparent 70%);
                        pointer-events: none;
                    }
                    .hms-hero-content { position: relative; z-index: 2; max-width: 720px; }
                    .hms-hero-breadcrumb {
                        display: inline-flex; align-items: center; gap: 0.45rem;
                        font-size: '0.72rem'; color: ${C.textTer}; margin-bottom: 2.5rem; font-weight: 500;
                    }
                    .hms-hero-breadcrumb a { color: ${C.textTer}; transition: color 0.2s; }
                    .hms-hero-breadcrumb a:hover { color: ${C.white}; }
                    .hms-hero h1 {
                        font-family: 'Inter', sans-serif; font-size: clamp(2.4rem, 6vw, 3.8rem);
                        color: ${C.white}; font-weight: 700; line-height: 1.08;
                        letter-spacing: '-0.04em'; margin-bottom: 1.5rem;
                    }
                    .hms-hero h1 span { color: ${C.accentLight}; }
                    .hms-hero-desc {
                        font-size: '1.05rem'; color: ${C.textTer}; line-height: 1.8; margin-bottom: 2.5rem; max-width: 580px; font-weight: 400;
                    }
                    .hms-hero-desc strong { color: ${C.white}; font-weight: 600; }
                    .hms-hero-buttons { display: flex; gap: 1rem; flex-wrap: wrap; }
                    .hms-btn-primary {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: ${C.accent}; color: ${C.white}; border: none;
                        padding: 0.85rem 1.8rem; border-radius: 8px;
                        font-size: '0.9rem'; font-weight: 600; cursor: pointer;
                        font-family: 'Inter', sans-serif; transition: all 0.3s ease;
                    }
                    .hms-btn-primary:hover { background: ${C.accentLight}; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(34,197,94,0.3); }
                    .hms-btn-ghost {
                        display: inline-flex; align-items: center; gap: 0.5rem;
                        background: transparent; color: ${C.white};
                        border: 1px solid rgba(255,255,255,0.15); padding: 0.85rem 1.8rem;
                        border-radius: 8px; font-size: '0.9rem'; font-weight: 500;
                        cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.3s ease;
                    }
                    .hms-btn-ghost:hover { border-color: rgba(255,255,255,0.4); transform: translateY(-2px); }

                    .hms-hero-stats {
                        position: absolute; right: clamp(1.5rem, 5vw, 3rem); top: 50%; transform: translateY(-50%);
                        display: flex; flex-direction: column; gap: 0.85rem; z-index: 2;
                    }
                    .hms-hero-stat {
                        background: rgba(255,255,255,0.04); backdrop-filter: blur(20px);
                        border: 1px solid rgba(255,255,255,0.06); border-radius: 12px;
                        padding: 0.85rem 1.1rem; text-align: right; min-width: 130px; transition: all 0.3s ease;
                    }
                    .hms-hero-stat:hover { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.05); }
                    .hms-hero-stat-value { font-size: '1.5rem'; color: ${C.white}; font-weight: 700; line-height: 1; }
                    .hms-hero-stat-label { font-size: '0.62rem'; color: ${C.textTer}; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: '0.05em'; font-weight: 500; }

                    /* ═══ MOCKUP SECTION ═══ */
                    .hms-mockup-section { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.bg}; }
                    .hms-mockup-wrapper {
                        display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.5rem; align-items: stretch;
                    }
                    .hms-mockup-main, .hms-mockup-sidebar {
                        background: ${C.white}; border: 1px solid ${C.border}; border-radius: 16px; overflow: hidden;
                    }
                    .hms-mockup-header, .hms-mockup-sidebar-header {
                        display: flex; align-items: center; justify-content: space-between;
                        padding: 1rem 1.25rem; border-bottom: 1px solid ${C.border};
                    }
                    
                    /* Calendar Grid */
                    .hms-mockup-calendar-grid {
                        display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; padding: 1.25rem;
                    }
                    .hms-cal-day {
                        background: ${C.bgSoft}; border-radius: 10px; padding: 0.75rem; border: 1px solid transparent;
                        display: flex; flex-direction: column; min-height: 180px; transition: all 0.2s;
                    }
                    .hms-cal-day.has-booking { border-color: ${C.accentBorder}; background: ${C.white}; }
                    .hms-cal-day-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid ${C.border}; }
                    
                    .hms-cal-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; opacity: 0.6; }
                    
                    .hms-cal-booking-card { flex: 1; display: flex; flex-direction: column; }
                    .hms-assign-btn {
                        display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%;
                        background: ${C.accentSoft}; color: ${C.accent}; border: 1px dashed ${C.accentBorder};
                        padding: 4px; border-radius: 4px; font-size: '0.6rem'; font-weight: 600; cursor: pointer;
                        margin-top: auto; transition: all 0.2s; font-family: 'Inter', sans-serif;
                    }
                    .hms-assign-btn:hover { background: ${C.accent}; color: ${C.white}; border-style: solid; }
                    
                    .hms-assigned-badge {
                        display: flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 4px;
                        background: ${C.accentDark}; color: ${C.white}; font-size: '0.6rem'; font-weight: 600; margin-top: auto;
                    }
                    .hms-unassign-btn {
                        background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; padding: 0; margin-left: auto; display: flex;
                    }
                    .hms-unassign-btn:hover { color: ${C.white}; }

                    .hms-dropdown-menu {
                        position: absolute; top: 100%; left: 0; right: 0; background: ${C.white}; border: 1px solid ${C.border};
                        border-radius: 6px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 50; margin-top: 4px; overflow: hidden;
                    }
                    .hms-dropdown-item {
                        display: block; width: 100%; text-align: left; padding: 8px 10px; background: none; border: none;
                        font-size: '0.75rem'; color: ${C.text}; cursor: pointer; font-family: 'Inter', sans-serif; transition: background 0.15s;
                    }
                    .hms-dropdown-item:hover { background: ${C.bgSoft}; color: ${C.accent}; }

                    /* Driver Sidebar */
                    .hms-mockup-sidebar { display: flex; flex-direction: column; }
                    .hms-mockup-drivers { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; flex: 1; }
                    .hms-mockup-driver {
                        display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem; border-radius: 8px; background: ${C.bgSoft}; border: 1px solid transparent; transition: all 0.2s;
                    }
                    .hms-mockup-driver.is-assigned { background: ${C.accentSoft}; border-color: ${C.accentBorder}; }
                    .hms-mockup-driver-avatar {
                        width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                    }
                    .hms-driver-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
                    .hms-driver-dot.online { background: ${C.live}; box-shadow: 0 0 6px ${C.live}; }
                    .hms-driver-dot.assigned { background: ${C.accent}; box-shadow: 0 0 6px ${C.accent}; animation: none; }
                    .hms-driver-dot.offline { background: ${C.border}; }
                    
                    .hms-mockup-sync-row {
                        display: flex; align-items: flex-start; gap: 0.6rem; margin: 0.75rem 1.25rem 1rem;
                        padding: 0.75rem; background: ${C.accentSoft}; border-radius: 8px; border: 1px solid ${C.accentBorder};
                        font-size: '0.7rem'; color: ${C.textSec};
                    }

                    /* ═══ FEATURES ═══ */
                    .hms-features { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.white}; }
                    .hms-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
                    .hms-feature-card {
                        background: ${C.white}; border: 1px solid ${C.border}; border-radius: 14px;
                        padding: 1.6rem 1.4rem; transition: all 0.4s ease; position: relative;
                    }
                    .hms-feature-card:hover { border-color: ${C.accent}; transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
                    .hms-feature-icon {
                        width: 42px; height: 42px; border-radius: 10px; background: ${C.bgSoft};
                        border: 1px solid ${C.border}; display: flex; align-items: center; justify-content: center;
                        color: ${C.text}; margin-bottom: 1rem; transition: all 0.3s ease;
                    }
                    .hms-feature-card:hover .hms-feature-icon { background: ${C.accent}; color: ${C.white}; border-color: ${C.accent}; }
                    .hms-feature-card h3 { font-size: '0.95rem'; color: ${C.text}; font-weight: 700; margin-bottom: 0.5rem; }
                    .hms-feature-card p { font-size: '0.85rem'; color: ${C.textSec}; line-height: 1.7; }

                    /* ═══ BENEFITS (DARK) ═══ */
                    .hms-benefits { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.inkSoft}; position: relative; overflow: hidden; }
                    .hms-benefits::before {
                        content: ''; position: absolute; top: -50%; left: -20%; width: 600px; height: 600px; border-radius: 50%;
                        background: radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%); pointer-events: none;
                    }
                    .hms-benefits-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; position: relative; z-index: 1; }
                    .hms-benefit-card {
                        background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px;
                        padding: 1.8rem; transition: all 0.4s ease; position: relative; overflow: hidden;
                    }
                    .hms-benefit-card::before {
                        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
                        background: var(--bc, ${C.accentLight}); opacity: 0; transition: opacity 0.4s ease;
                    }
                    .hms-benefit-card:hover { border-color: rgba(255,255,255,0.1); transform: translateY(-4px); }
                    .hms-benefit-card:hover::before { opacity: 0.6; }
                    .hms-benefit-stat-big { font-size: '2.8rem'; color: ${C.white}; font-weight: 800; line-height: 1; margin-bottom: 0.3rem; letter-spacing: '-0.03em'; }
                    .hms-benefit-stat-label { font-size: '0.65rem'; color: var(--bc, ${C.accentLight}); text-transform: uppercase; letter-spacing: '0.1em'; margin-bottom: 1.3rem; font-weight: 600; }
                    .hms-benefit-card h3 { font-size: '1rem'; color: ${C.white}; font-weight: 700; margin-bottom: 0.5rem; }
                    .hms-benefit-card p { font-size: '0.85rem'; color: ${C.textTer}; line-height: 1.7; }

                    /* ═══ USE CASES ═══ */
                    .hms-usecases { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.white}; border-top: 1px solid ${C.border}; }
                    .hms-usecases-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
                    .hms-usecase-card {
                        background: ${C.bg}; border: 1px solid ${C.border}; border-radius: 14px;
                        padding: 1.6rem 1.3rem; transition: all 0.3s ease; display: flex; flex-direction: column;
                    }
                    .hms-usecase-card:hover { border-color: ${C.accent}; transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
                    .hms-usecase-tag {
                        display: inline-flex; align-self: flex-start; font-size: '0.6rem'; font-weight: 700;
                        letter-spacing: '0.08em'; text-transform: uppercase; color: ${C.accentDark};
                        background: ${C.accentSoft}; border: 1px solid ${C.accentBorder}; padding: '0.2rem 0.5rem'; border-radius: 4px; margin-bottom: 1rem;
                    }
                    .hms-usecase-icon {
                        width: 38px; height: 38px; border-radius: 8px; background: ${C.white};
                        border: 1px solid ${C.border}; display: flex; align-items: center; justify-content: center;
                        color: ${C.text}; margin-bottom: 0.85rem; transition: all 0.3s ease;
                    }
                    .hms-usecase-card:hover .hms-usecase-icon { background: ${C.accent}; color: ${C.white}; border-color: ${C.accent}; }
                    .hms-usecase-card h3 { font-size: '0.95rem'; color: ${C.text}; font-weight: 700; margin-bottom: 0.45rem; }
                    .hms-usecase-card p { font-size: '0.82rem'; color: ${C.textSec}; line-height: 1.65; flex: 1; }

                    /* ═══ CTA ═══ */
                    .hms-cta { padding: clamp(4rem, 8vw, 6rem) 0; background: ${C.bg}; }
                    .hms-cta-box {
                        position: relative; background: ${C.ink}; border: 1px solid rgba(34,197,94,0.1);
                        border-radius: 20px; padding: clamp(3rem, 6vw, 4.5rem); text-align: center; overflow: hidden;
                    }
                    .hms-cta-box::before {
                        content: ''; position: absolute; top: -50%; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; border-radius: 50%;
                        background: radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 60%); pointer-events: none;
                    }
                    .hms-cta-content { position: relative; z-index: 2; }
                    .hms-cta-box h2 { font-size: clamp(1.8rem, 4vw, 2.5rem); color: ${C.white}; font-weight: 700; margin-bottom: 0.85rem; letter-spacing: '-0.03em'; }
                    .hms-cta-box p { font-size: '1.05rem'; color: ${C.textTer}; line-height: 1.75; max-width: 520px; margin: 0 auto 2.25rem; }
                    .hms-cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

                    /* ═══ RELATED ═══ */
                    .hms-related { padding: clamp(3rem, 6vw, 4.5rem) 0; background: ${C.white}; border-top: 1px solid ${C.border}; }
                    .hms-related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
                    .hms-related-link {
                        display: flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1rem;
                        background: ${C.bg}; border: 1px solid ${C.border}; border-radius: 10px;
                        font-size: '0.82rem'; color: ${C.textSec}; transition: all 0.25s ease; cursor: pointer;
                    }
                    .hms-related-link:hover { background: ${C.white}; border-color: ${C.accent}; color: ${C.accent}; transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
                    .hms-related-link svg { flex-shrink: 0; color: ${C.textTer}; transition: color 0.2s; }
                    .hms-related-link:hover svg { color: ${C.accent}; }

                    /* ═══ RESPONSIVE ═══ */
                    @media (max-width: 1024px) {
                        .hms-features-grid { grid-template-columns: repeat(2, 1fr); }
                        .hms-usecases-grid { grid-template-columns: repeat(2, 1fr); }
                        .hms-hero-stats { display: none; }
                        .hms-mockup-wrapper { grid-template-columns: 1fr; }
                    }
                    @media (max-width: 768px) {
                        .hms-benefits-grid { grid-template-columns: 1fr; }
                        .hms-features-grid { grid-template-columns: 1fr; }
                        .hms-usecases-grid { grid-template-columns: 1fr; }
                        .hms-related-grid { grid-template-columns: 1fr; }
                        .hms-mockup-calendar-grid { grid-template-columns: repeat(2, 1fr); }
                        .hms-cal-day { min-height: 140px; }
                    }
                `}</style>

                {/* ═══ HERO ═══ */}
                <section className="hms-hero">
                    <div className="hms-hero-grid" />
                    <div className="hms-hero-glow" />
                    <div className="hms-container">
                        <div className="hms-hero-content">
                            <FadeUp>
                                <div className="hms-hero-breadcrumb">
                                    <Link to="/">Home</Link><ChevronRight size={12} />
                                    <Link to="/mortuary-management-software">Solutions</Link><ChevronRight size={12} />
                                    <span>Hearse Management</span>
                                </div>
                            </FadeUp>
                            <FadeUp delay={80}>
                                <h1>Advanced <span>Calendar Booking</span> & Driver Assignment</h1>
                            </FadeUp>
                            <FadeUp delay={160}>
                                <p className="hms-hero-desc">
                                    View your fleet days in advance on a live calendar. Assign specific drivers to 
                                    specific bookings instantly, and sync it directly to their portal.
                                </p>
                            </FadeUp>
                            <FadeUp delay={240}>
                                <div className="hms-hero-buttons">
                                    <Link to="/register" className="hms-btn-primary">Request Demo <ArrowRight size={15} /></Link>
                                    <Link to="/contact" className="hms-btn-ghost">Contact Sales</Link>
                                </div>
                            </FadeUp>
                        </div>
                        <div className="hms-hero-stats">
                            <FadeUp delay={400}><div className="hms-hero-stat"><div className="hms-hero-stat-value">0</div><div className="hms-hero-stat-label">Conflicts</div></div></FadeUp>
                            <FadeUp delay={500}><div className="hms-hero-stat"><div className="hms-hero-stat-value">Live</div><div className="hms-hero-stat-label">Driver Sync</div></div></FadeUp>
                            <FadeUp delay={600}><div className="hms-hero-stat"><div className="hms-hero-stat-value">Days</div><div className="hms-hero-stat-label">In Advance</div></div></FadeUp>
                        </div>
                    </div>
                </section>

                {/* ═══ CALENDAR & PORTAL UI ═══ */}
                <section className="hms-mockup-section">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>System Interface</SectionLabel>
                            <SectionHeading sub="Click a booking on the calendar to assign a driver. Watch the driver portal update instantly.">
                                Calendar & Driver Sync
                            </SectionHeading>
                        </FadeUp>
                        <FadeUp delay={150}>
                            <AdvancedCalendarMockup />
                        </FadeUp>
                    </div>
                </section>

                {/* ═══ FEATURES ═══ */}
                <section className="hms-features">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel>Capabilities</SectionLabel>
                            <SectionHeading sub="Built for funeral homes that need absolute certainty in their scheduling.">
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

                {/* ═══ BENEFITS (DARK) ═══ */}
                <section className="hms-benefits">
                    <div className="hms-container">
                        <FadeUp>
                            <SectionLabel light>Impact</SectionLabel>
                            <SectionHeading light sub="Measurable results for your scheduling accuracy and driver coordination.">
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

                {/* ═══ CTA (DARK) ═══ */}
                <section className="hms-cta">
                    <div className="hms-container">
                        <FadeUp>
                            <div className="hms-cta-box">
                                <div className="hms-cta-content">
                                    <h2>Ready to Sync Your Fleet?</h2>
                                    <p>Stop manual booking errors. Give your staff the power to assign drivers directly from the calendar.</p>
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
                            <SectionLabel>Explore More</SectionLabel>
                        </FadeUp>
                        <div className="hms-related-grid">
                            {relatedLinks.map((link, i) => (
                                <FadeUp key={i} delay={i * 60}>
                                    <Link to={link.to} className="hms-related-link">
                                        <ArrowRight size={14} />
                                        {link.label}
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