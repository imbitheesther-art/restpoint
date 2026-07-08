import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Users, Shield, Phone, Mail, ChevronDown, Smartphone } from 'lucide-react';
import Footer from '../../components/layout/Footer';

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    line: '#E3DDD0',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
};

export default function ChamaWelfareManagement() {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [openFAQ, setOpenFAQ] = useState(null);

    useEffect(() => {
        document.title = 'Chama Welfare Management Software | Digital Chama Management Kenya | Rest Point';
        setTimeout(() => setLoaded(true), 60);
    }, []);

    const faqs = [
        {
            q: 'How can chama management software help our group?',
            a: 'Our chama welfare management software digitizes contribution tracking, ensures complete transparency, and automates financial reporting. Chamas using Rest Point reduce bookkeeping time by 70% and build member trust through visible, accountable financial management.'
        },
        {
            q: 'Does it work with M-Pesa for chama collections?',
            a: 'Yes! Rest Point integrates seamlessly with M-Pesa, allowing chama members to contribute directly from their phones. The system automatically tracks payments, sends reminders for arrears, and provides real-time balance updates to all members.'
        },
        {
            q: 'How do you ensure transparency in chama finances?',
            a: 'Rest Point provides complete financial transparency with real-time dashboards, automated member statements, audit trails for all transactions, and role-based access controls. Every member can see their contribution history, and leaders can generate instant financial reports.'
        },
        {
            q: 'Is the software affordable for small chamas?',
            a: 'Yes, Rest Point offers affordable pricing starting from KES 9,200/month. We believe every chama deserves modern financial management tools. Our transparent pricing means no hidden fees, and you can start with a single-tenant plan that fits your budget.'
        },
        {
            q: 'Can members access their contribution records?',
            a: 'Absolutely. Rest Point includes a member self-service portal where each member can view their contribution history, download statements, check their balance, and see upcoming payment dates - all from their phone or computer.'
        },
        {
            q: 'How long does it take to set up for our chama?',
            a: 'Setup takes just 1-2 weeks. We help you import existing member data, configure your contribution rules, and train your chama leadership. Most chamas are fully operational within a few days of signing up.'
        }
    ];

    const benefits = [
        'Digital contribution tracking with M-Pesa integration',
        'Complete financial transparency for all members',
        'Automated payment reminders and arrears tracking',
        'Real-time financial statements and reports',
        'Member self-service portal (mobile-friendly)',
        'Welfare fund management and disbursement',
        'Beneficiary and dependant management',
        'Audit trails for all transactions',
        'SMS notifications for payments and meetings',
        'Affordable pricing for chamas of all sizes'
    ];

    const stats = [
        { num: '300+', label: 'Chamas using Rest Point' },
        { num: '70%', label: 'Reduction in bookkeeping time' },
        { num: '100%', label: 'Financial transparency' },
        { num: 'KES 500', label: 'Starting price per month' }
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; }
        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; color: ${C.ink}; }
        h1 { font-size: clamp(2.5rem, 5vw, 3.5rem); line-height: 1.1; }
        h2 { font-size: clamp(1.8rem, 3.5vw, 2.5rem); line-height: 1.2; }
        p { line-height: 1.7; }
        .wrap { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }
        .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.9rem 1.9rem; font-size: 0.85rem; font-weight: 500; border: 1px solid transparent; border-radius: 2px; cursor: pointer; transition: all 0.2s; }
        .btn-dark { background: ${C.ink}; color: ${C.bone}; }
        .btn-dark:hover { background: ${C.verdigris}; }
        .btn-brass { background: ${C.brass}; color: ${C.bone}; }
        .btn-brass:hover { background: ${C.brassLight}; }
        .hero { padding: 140px 0 80px; background: linear-gradient(135deg, ${C.verdigrisDark} 0%, ${C.verdigris} 100%); color: ${C.bone}; }
        .hero h1 { color: ${C.bone}; margin-bottom: 1.5rem; }
        .hero p { color: rgba(250,248,244,0.85); font-size: 1.1rem; margin-bottom: 2rem; max-width: 700px; }
        .section { padding: 80px 0; }
        .section-alt { background: ${C.bone2}; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin: 3rem 0; }
        .stat-card { text-align: center; padding: 2rem; background: white; border-radius: 4px; border: 1px solid ${C.line}; }
        .stat-num { font-size: 2.5rem; font-weight: 700; color: ${C.verdigris}; font-family: 'Fraunces', serif; margin-bottom: 0.5rem; }
        .stat-label { font-size: 0.9rem; color: ${C.gray}; }
        .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 3rem; }
        .benefit-card { background: white; padding: 1.5rem; border-radius: 4px; border: 1px solid ${C.line}; }
        .benefit-card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: ${C.verdigris}; }
        .faq-item { border-top: 1px solid ${C.line}; padding: 1.2rem 0; }
        .faq-question { width: 100%; text-align: left; background: none; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: 'Fraunces', serif; font-size: 1.1rem; color: ${C.ink}; }
        .faq-answer { margin-top: 1rem; color: ${C.gray}; line-height: 1.7; }
        .cta-section { background: ${C.verdigrisDark}; padding: 80px 0; text-align: center; color: ${C.bone}; }
        .cta-section h2 { color: ${C.bone}; margin-bottom: 1rem; }
        .cta-section p { color: rgba(250,248,244,0.85); margin-bottom: 2rem; }
      `}</style>

            {/* Hero */}
            <section className="hero">
                <div className="wrap">
                    <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
                        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(250,248,244,0.1)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                            💰 For Chamas & Investment Groups
                        </div>
                        <h1>Chama Welfare Management Software</h1>
                        <p>Empower your chama with smart digital financial management. Track contributions, ensure transparency, and build member trust with Kenya's #1 chama management platform.</p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn btn-brass" onClick={() => navigate('/register')}>Start Free Trial</button>
                            <button className="btn btn-dark" style={{ background: 'transparent', color: C.bone, borderColor: C.bone }} onClick={() => navigate('/contact')}>Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="section">
                <div className="wrap">
                    <div className="stats-grid">
                        {stats.map((stat, i) => (
                            <div key={i} className="stat-card">
                                <div className="stat-num">{stat.num}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="section section-alt">
                <div className="wrap">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Complete Chama Financial Management</h2>
                        <p style={{ maxWidth: '600px', margin: '0 auto', color: C.gray }}>Everything you need to manage your chama's finances, welfare, and member engagement</p>
                    </div>
                    <div className="benefits-grid">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="benefit-card">
                                <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
                                    <Check size={22} color={C.verdigris} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span style={{ fontSize: '0.95rem', color: C.gray }}>{benefit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="section">
                <div className="wrap">
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>1</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Register Members</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>Add chama members with their contact details, next of kin, and beneficiary information. Import from Excel in one click.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>2</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Track Contributions</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>Members contribute via M-Pesa or cash. Rest Point automatically tracks all payments, sends reminders, and shows real-time balances.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>3</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Manage Welfare</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>Process welfare requests, manage beneficiary payouts, and generate financial reports. Complete transparency for all members.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="section section-alt">
                <div className="wrap">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Trusted by Chamas Across Kenya</h2>
                        <p style={{ color: C.gray }}>Join 300+ chamas already using Rest Point</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"Rest Point brought transparency to our chama. Members can now see their contributions in real-time, and we've eliminated disputes about finances."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Jane Muthoni</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>Chairperson, Mwanzo Investment Chama, Nairobi</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"The M-Pesa integration is a game-changer. Our members love being able to contribute from their phones, and we love the automatic reconciliation."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Samuel Kariuki</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>Treasurer, Umoja Women's Chama, Nakuru</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"We reduced bookkeeping from 10 hours per week to 2 hours. The automated reports save us so much time during meetings."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Grace Njeri</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>Secretary, Jamii Savings Chama, Mombasa</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section">
                <div className="wrap">
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {faqs.map((faq, i) => (
                            <div key={i} className="faq-item">
                                <button className="faq-question" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                                    <span>{faq.q}</span>
                                    <ChevronDown size={20} color={C.brass} style={{ transform: openFAQ === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
                                </button>
                                {openFAQ === i && <div className="faq-answer">{faq.a}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="wrap">
                    <h2>Ready to Transform Your Chama's Financial Management?</h2>
                    <p>Join 300+ chamas across Kenya using Rest Point to manage finances with transparency and accountability.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-brass" onClick={() => navigate('/register')}>Start Free Trial</button>
                        <button className="btn btn-dark" style={{ background: 'transparent', color: C.bone, borderColor: C.bone }} onClick={() => navigate('/contact')}>Schedule Demo</button>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}