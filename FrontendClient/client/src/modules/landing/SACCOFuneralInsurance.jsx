import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Building2, Shield, Phone, Mail, ChevronDown, TrendingUp } from 'lucide-react';
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

export default function SACCOFuneralInsurance() {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [openFAQ, setOpenFAQ] = useState(null);

    useEffect(() => {
        document.title = 'SACCO Funeral Insurance Software | SASRA Compliant | Rest Point Kenya';
        setTimeout(() => setLoaded(true), 60);
    }, []);

    const faqs = [
        {
            q: 'How does SACCO funeral insurance software work?',
            a: 'Our SACCO funeral insurance software automates premium collection, member registration, claims processing, and benefit disbursement. It integrates with M-Pesa for seamless payments and provides SASRA-compliant reporting for regulatory compliance.'
        },
        {
            q: 'Is the software SASRA compliant?',
            a: 'Yes! Rest Point is designed to meet SASRA (Sacco Societies Regulatory Authority) requirements. We provide comprehensive audit trails, financial reporting, member data protection, and transaction records that satisfy regulatory standards.'
        },
        {
            q: 'Can we manage multiple branches?',
            a: 'Absolutely. Rest Point supports multi-branch SACCOs with centralized control and local autonomy. Each branch can manage its members and transactions while headquarters gets unified reporting and oversight.'
        },
        {
            q: 'How does M-Pesa integration work for SACCO collections?',
            a: 'Rest Point integrates seamlessly with M-Pesa for premium collection, loan offsetting, and benefit disbursement. Members can pay via M-Pesa Paybill or Lipa Na M-Pesa, and the system automatically reconciles payments in real-time.'
        },
        {
            q: 'What about member eligibility tracking?',
            a: 'The software automatically tracks member eligibility based on contribution history, waiting periods, and membership status. It sends alerts for arrears and generates eligibility reports for management decisions.'
        },
        {
            q: 'Can we customize benefit calculations?',
            a: 'Yes, Rest Point allows you to configure benefit calculation rules based on contribution amount, membership duration, and other criteria. The system automatically calculates benefits when claims are approved.'
        }
    ];

    const benefits = [
        'SASRA-compliant reporting and audit trails',
        'Automated premium collection via M-Pesa',
        'Multi-branch management with centralized control',
        'Member eligibility tracking and alerts',
        'Streamlined claims processing (24-48 hours)',
        'Loan offset for funeral benefits',
        'Comprehensive financial reporting',
        'Member self-service portal',
        'Beneficiary and dependant management',
        '24/7 priority support for enterprise clients'
    ];

    const stats = [
        { num: '150+', label: 'SACCOs using Rest Point' },
        { num: '70%', label: 'Reduction in admin time' },
        { num: '48hrs', label: 'Average claims processing' },
        { num: '100%', label: 'SASRA compliance' }
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
                            🏦 For SACCOs & Credit Cooperatives
                        </div>
                        <h1>SACCO Funeral Insurance Software</h1>
                        <p>Streamline your SACCO's funeral insurance and welfare management with SASRA-compliant software. Automate premium collection, process claims faster, and serve your members with transparency.</p>
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
                        <h2 style={{ marginBottom: '1rem' }}>Complete SACCO Funeral Management</h2>
                        <p style={{ maxWidth: '600px', margin: '0 auto', color: C.gray }}>Everything you need to manage funeral insurance and welfare schemes for your members</p>
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
                    <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Built for SACCO Success</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>1</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Member Registration</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>Register members with complete details, beneficiary designations, and dependant information. Bulk import from Excel supported.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>2</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Premium Collection</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>Automated M-Pesa integration for premium collection. Track payments, send reminders, and manage arrears in real-time.</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.verdigris, color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, margin: '0 auto 1.5rem' }}>3</div>
                            <h3 style={{ marginBottom: '0.8rem', color: C.verdigris }}>Claims Processing</h3>
                            <p style={{ color: C.gray, fontSize: '0.95rem' }}>Fast claims processing with automated verification, committee approvals, and benefit disbursement within 24-48 hours.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="section section-alt">
                <div className="wrap">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Trusted by Leading SACCOs</h2>
                        <p style={{ color: C.gray }}>Join 150+ SACCOs across Kenya</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"Rest Point transformed our funeral insurance management. M-Pesa integration works flawlessly, and SASRA compliance is now effortless."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>James Kipchoge</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>CEO, Uwezo SACCO, Nairobi</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"We reduced claims processing from 2 weeks to 2 days. Member satisfaction has increased dramatically with faster benefit disbursement."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Grace Wanjiru</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>Operations Manager, Jamii SACCO, Kisumu</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '4px', border: `1px solid ${C.line}` }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: C.gray }}>"Multi-branch management is seamless. We now have complete visibility across all our 12 branches with unified reporting."</p>
                            <p style={{ fontWeight: 600, color: C.ink }}>Peter Mwangi</p>
                            <p style={{ fontSize: '0.85rem', color: C.gray }}>Finance Director, Mwalimu SACCO, Mombasa</p>
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
                    <h2>Ready to Transform Your SACCO's Funeral Insurance Management?</h2>
                    <p>Join 150+ SACCOs across Kenya using Rest Point to serve their members with efficiency and transparency.</p>
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