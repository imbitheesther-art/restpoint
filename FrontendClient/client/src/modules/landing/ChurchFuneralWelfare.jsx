import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Users, Heart, Shield, Phone, Mail, ChevronDown } from 'lucide-react';
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

export default function ChurchFuneralWelfare() {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [openFAQ, setOpenFAQ] = useState(null);

    useEffect(() => {
        document.title = 'Church Funeral Welfare Software | Rest Point Kenya';
        setTimeout(() => setLoaded(true), 60);
    }, []);

    const faqs = [
        {
            q: 'How can church funeral welfare software help our congregation?',
            a: 'Our church funeral welfare software automates contribution tracking, streamlines claims processing, and provides complete financial transparency. Churches using Rest Point reduce administration time by 70% and ensure every bereaved family receives timely support.'
        },
        {
            q: 'Does the software integrate with M-Pesa for church collections?',
            a: 'Yes! Rest Point fully integrates with M-Pesa, allowing church members to make funeral welfare contributions directly from their phones. The system automatically reconciles payments, sends SMS notifications, and updates member records in real-time.'
        },
        {
            q: 'How do we manage beneficiary information securely?',
            a: 'Rest Point provides secure beneficiary management with role-based access controls, AES-256 encryption, and comprehensive audit trails. Only authorized church leaders can access sensitive member and beneficiary information.'
        },
        {
            q: 'Can we generate financial reports for church leadership?',
            a: 'Absolutely. Rest Point includes comprehensive financial reporting with automated statements, contribution summaries, claims reports, and audit trails. All reports are available in real-time and can be exported to PDF or Excel.'
        },
        {
            q: 'How long does implementation take for a church?',
            a: 'Implementation typically takes 1-2 weeks for churches. We provide dedicated onboarding support, help migrate existing member data, and train your welfare committee on using the platform effectively.'
        },
        {
            q: 'Is the software affordable for small churches?',
            a: 'Yes, Rest Point offers flexible pricing starting from KES 9,200/month for single-tenant plans. We believe every church should have access to modern welfare management tools, regardless of size or budget.'
        }
    ];

    const benefits = [
        'Automated contribution tracking with M-Pesa integration',
        'Fast claims processing (24-48 hours)',
        'Real-time financial reporting and transparency',
        'SMS notifications to members and families',
        'Secure beneficiary and dependant management',
        'Committee approval workflows',
        'Member self-service portal',
        'Comprehensive audit trails',
        'Multi-branch support for large churches',
        '24/7 customer support'
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
                            🏛️ For Churches & Religious Organizations
                        </div>
                        <h1>Church Funeral Welfare Software</h1>
                        <p>Streamline your church's funeral welfare program with Kenya's #1 platform. Manage contributions, process claims, and support bereaved families with complete transparency and dignity.</p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <button className="btn btn-brass" onClick={() => navigate('/register')}>Start Free Trial</button>
                            <button className="btn btn-dark" style={{ background: 'transparent', color: C.bone, borderColor: C.bone }} onClick={() => navigate('/contact')}>Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="section">
                <div className="wrap">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Everything Your Church Needs</h2>
                        <p style={{ maxWidth: '600px', margin: '0 auto', color: C.gray }}>Purpose-built for churches managing funeral welfare programs</p>
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
            <section className="section section-alt">
                <div className="wrap">
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>1</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Register Members</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>Easily register church members, collect beneficiary information, and store dependant details in a secure, centralized database.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>2</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Track Contributions</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>Members contribute via M-Pesa or cash. Rest Point automatically tracks payments, sends reminders, and identifies arrears in real-time.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>3</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Process Claims</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>When a member passes away, submit claims digitally, get committee approvals, and disburse benefits to families within 24-48 hours.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="section">
                <div className="wrap">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Trusted by Churches Across Kenya</h2>
                        <p style={{ color: C.gray }}>Join 200+ churches already using Rest Point</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"Rest Point transformed how we manage our church's funeral welfare. The M-Pesa integration is seamless, and our members love the transparency."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Rev. John Kamau</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>Senior Pastor, Grace Community Church, Nairobi</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"We reduced claims processing time from 2 weeks to 48 hours. The financial reporting gives our church leadership complete confidence."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Mary Wanjiku</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>Welfare Committee Chair, St. Mary's Catholic Church</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"Finally, a system that understands church needs. Member registration, beneficiary management, and contribution tracking - all in one place."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Pastor David Mwangi</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>Administrative Pastor, Nairobi Baptist Church</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section section-alt">
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
                    <h2>Ready to Transform Your Church's Funeral Welfare Program?</h2>
                    <p>Join 200+ churches across Kenya using Rest Point to serve their communities with dignity and transparency.</p>
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