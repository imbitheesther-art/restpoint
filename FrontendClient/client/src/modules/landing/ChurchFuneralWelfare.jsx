import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Check, ArrowRight, ChevronDown, Users, Quote, ShieldCheck, Heart
} from 'lucide-react';
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
    verdigrisTint: '#EBEFEF',
    line: '#E3DDD0',
    lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    accent: '#C77B5E',
};

export default function ChurchFuneralWelfare() {
    const navigate = useNavigate();
    const [loaded, setLoaded] = useState(false);
    const [openFAQ, setOpenFAQ] = useState(null);

    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goContact = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/contact'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

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

    const steps = [
        { num: '1', title: 'Register Members', desc: 'Easily register church members, collect beneficiary information, and store dependant details in a secure, centralized database.' },
        { num: '2', title: 'Track Contributions', desc: 'Members contribute via M-Pesa or cash. Rest Point automatically tracks payments, sends reminders, and identifies arrears in real-time.' },
        { num: '3', title: 'Process Claims', desc: 'When a member passes away, submit claims digitally, get committee approvals, and disburse benefits to families within 24-48 hours.' }
    ];

    const testimonials = [
        { quote: 'Rest Point transformed how we manage our church\'s funeral welfare. The M-Pesa integration is seamless, and our members love the transparency.', name: 'Rev. John Kamau', role: 'Senior Pastor, Grace Community Church, Nairobi' },
        { quote: 'We reduced claims processing time from 2 weeks to 48 hours. The financial reporting gives our church leadership complete confidence.', name: 'Mary Wanjiku', role: 'Welfare Committee Chair, St. Mary\'s Catholic Church' },
        { quote: 'Finally, a system that understands church needs. Member registration, beneficiary management, and contribution tracking - all in one place.', name: 'Pastor David Mwangi', role: 'Administrative Pastor, Nairobi Baptist Church' }
    ];

    return (
        <div className="page-container">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        h1{font-size:clamp(2.2rem,5vw,3.5rem);line-height:1.1;margin-bottom:1.5rem}
        h2{font-size:clamp(1.8rem,4vw,2.5rem);line-height:1.2;margin-bottom:1.5rem}
        h3{font-size:1.2rem;margin-bottom:0.6rem;color:${C.ink}}
        p{line-height:1.75;font-size:1rem;color:${C.gray}}
        
        .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500;display:inline-flex;align-items:center;gap:0.5rem}
        
        .btn{display:inline-flex;align-items:center;gap:0.5rem;padding:1rem 1.9rem;font-size:0.9rem;font-weight:500;font-family:'Inter',sans-serif;border:1px solid transparent;border-radius:8px;cursor:pointer;transition:all 0.3s ease;white-space:nowrap}
        .btn-brass{background:${C.brass};color:${C.bone};border:none}
        .btn-brass:hover{background:${C.brassLight};transform:translateY(-2px);box-shadow:0 10px 20px rgba(139,115,85,0.25)}
        .btn-ghost{background:transparent;color:${C.bone};border:1px solid rgba(250,248,244,0.3)}
        .btn-ghost:hover{background:rgba(250,248,244,0.1);border-color:${C.bone}}
        
        .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(1.25rem,5vw,2.5rem)}
        .section{padding:clamp(4rem,8vw,6rem)0}
        .section-alt{background:${C.bone2}}
        
        /* Hero */
        .hero{padding-top:140px;padding-bottom:clamp(4rem,8vw,6rem);position:relative;overflow:hidden;background:#000000;color:${C.bone}}
        .hero-grid-bg{position:absolute;top:0;left:0;right:0;bottom:0;background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;mask-image:linear-gradient(to bottom,black,transparent 80%);-webkit-mask-image:linear-gradient(to bottom,black,transparent 80%)}
        .hero-glow{position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 20% 50%,rgba(61,79,71,0.3) 0%,transparent 60%);pointer-events:none}
        .hero-content{display:grid;grid-template-columns:1.2fr 0.8fr;gap:4rem;align-items:center;position:relative;z-index:1}
        .hero-desc{font-size:1.1rem;max-width:540px;margin-bottom:2rem;color:rgba(255,255,255,0.8);line-height:1.8}
        .hero-buttons{display:flex;gap:1rem;flex-wrap:wrap}
        .hero h1{color:${C.bone}}
        
        /* Hero Mockup */
        .hero-mockup{background:rgba(255,255,255,0.03);border:1px solid ${C.lineDark};border-radius:16px;padding:2rem;backdrop-filter:blur(10px);box-shadow:0 30px 60px rgba(0,0,0,0.3)}
        .mockup-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid ${C.lineDark}}
        .mockup-title{font-family:'Fraunces',serif;color:${C.bone};font-size:1.1rem}
        .mockup-badge{font-size:0.7rem;font-family:'JetBrains Mono',monospace;color:#4CAF50;background:rgba(40,200,64,0.1);padding:0.3rem 0.6rem;border-radius:4px;border:1px solid rgba(40,200,64,0.3)}
        .mockup-amount{font-size:2.2rem;font-family:'Fraunces',serif;color:${C.bone};margin-bottom:0.5rem}
        .mockup-label{font-size:0.75rem;color:rgba(255,255,255,0.5);font-family:'JetBrains Mono',monospace;margin-bottom:1.5rem}
        .mockup-row{display:flex;justify-content:space-between;padding:0.8rem 0;border-bottom:1px solid ${C.lineDark};font-size:0.85rem;color:rgba(255,255,255,0.8)}
        .mockup-row:last-child{border-bottom:none}
        .mockup-status{color:${C.brass};font-family:'JetBrains Mono',monospace;font-size:0.75rem}

        /* Benefits */
        .benefits-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-top:3rem}
        .benefit-card{background:${C.bone};padding:1.5rem;border-radius:12px;border:1px solid ${C.line};display:flex;gap:0.8rem;align-items:flex-start;transition:all 0.3s ease}
        .benefit-card:hover{border-color:${C.verdigrisLight};transform:translateY(-2px)}
        
        /* Steps */
        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:3rem}
        .step-card{text-align:center;padding:2.5rem 2rem;background:${C.bone};border:1px solid ${C.line};border-radius:12px;transition:all 0.3s ease}
        .step-card:hover{transform:translateY(-5px);border-color:${C.verdigrisLight};box-shadow:0 15px 30px rgba(21,23,26,0.06)}
        .step-num{width:56px;height:56px;border-radius:50%;background:${C.verdigris};color:${C.bone};display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-family:'Fraunces',serif;font-size:1.4rem;font-weight:600;box-shadow:0 8px 20px rgba(61,79,71,0.3)}
        .step-title{color:${C.verdigris};font-weight:600;margin-bottom:0.8rem}
        
        /* Testimonials */
        .testimonial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:3rem}
        .testimonial-card{background:${C.bone};padding:2.5rem;border-radius:12px;border:1px solid ${C.line};position:relative;transition:all 0.3s ease}
        .testimonial-card:hover{transform:translateY(-5px);box-shadow:0 15px 30px rgba(21,23,26,0.06)}
        .quote-icon{color:${C.bone2};position:absolute;top:20px;right:20px;opacity:0.5}
        .testimonial-text{font-style:italic;color:${C.gray};margin-bottom:1.5rem;font-size:0.95rem;line-height:1.7}
        .testimonial-name{font-weight:600;color:${C.ink};font-size:0.95rem}
        .testimonial-role{font-size:0.85rem;color:${C.gray};margin-top:0.25rem}
        
        /* FAQ */
        .faq-container{max-width:800px;margin:0 auto}
        .faq-item{border-bottom:1px solid ${C.line};padding:1.5rem 0}
        .faq-question{width:100%;text-align:left;background:none;border:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-family:'Fraunces',serif;font-size:1.1rem;color:${C.ink};padding:0.5rem 0;transition:color 0.2s}
        .faq-question:hover{color:${C.verdigris}}
        .faq-answer{max-height:0;overflow:hidden;transition:max-height 0.3s ease, padding 0.3s ease;color:${C.gray};line-height:1.7;font-size:0.95rem}
        .faq-item.active .faq-answer{max-height:200px;padding-top:1rem}
        
        /* CTA Section */
        .cta-wrapper{background:${C.bone};padding:0 0 clamp(4rem,8vw,7rem)}
        .cta-card{position:relative;background:linear-gradient(135deg,#000000 0%,${C.verdigrisDark} 100%);border-radius:24px;padding:clamp(3rem,6vw,5rem) 2rem;text-align:center;overflow:hidden;border:1px solid ${C.lineDark};box-shadow:0 40px 80px -20px rgba(21,23,26,0.3)}
        .cta-card::before{content:'';position:absolute;top:0;left:0;right:0;bottom:0;background-image:radial-gradient(circle at 50% 0%,rgba(139,115,85,0.15) 0%,transparent 50%),linear-gradient(rgba(250,248,244,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(250,248,244,0.03) 1px,transparent 1px);background-size:100% 100%,40px 40px,40px 40px;pointer-events:none}
        .cta-content{position:relative;z-index:2;max-width:700px;margin:0 auto}
        .cta-content h2{color:${C.bone};margin-bottom:1.5rem;font-size:clamp(2rem,4.5vw,3rem);line-height:1.2}
        .cta-content p{color:rgba(250,248,244,0.8);font-size:1.1rem;line-height:1.8;margin-bottom:2.5rem}
        .cta-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
        
        @media(max-width:900px){
          .hero-content{grid-template-columns:1fr;gap:3rem}
          .benefits-grid{grid-template-columns:1fr}
          .steps-grid{grid-template-columns:1fr}
          .testimonial-grid{grid-template-columns:1fr}
        }
        @media(max-width:480px){
          .hero-buttons{flex-direction:column;width:100%}
          .hero-buttons .btn{width:100%;justify-content:center}
          .cta-buttons{flex-direction:column;width:100%}
          .cta-buttons .btn{width:100%;justify-content:center}
        }
      `}</style>

            {/* Hero */}
            <section className="hero">
                <div className="hero-grid-bg"></div>
                <div className="hero-glow"></div>
                <div className="wrap hero-content">
                    <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
                        <div className="mono-label" style={{ marginBottom: '1.5rem', color: C.brass }}>
                            <Heart size={14} /> For Churches & Religious Organizations
                        </div>
                        <h1>Church Funeral Welfare Software</h1>
                        <p className="hero-desc">Streamline your church's funeral welfare program with Kenya's #1 platform. Manage contributions, process claims, and support bereaved families with complete transparency and dignity.</p>
                        <div className="hero-buttons">
                            <button className="btn btn-brass" onClick={goStart}>Start Free Trial <ArrowRight size={16} /></button>
                            <button className="btn btn-ghost" onClick={goContact}>Contact Sales</button>
                        </div>
                    </div>
                    <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 200ms' }}>
                        <div className="hero-mockup">
                            <div className="mockup-header">
                                <span className="mockup-title">Welfare Fund</span>
                                <span className="mockup-badge">Active</span>
                            </div>
                            <div className="mockup-amount">KES 1,240,000</div>
                            <div className="mockup-label">TOTAL CONTRIBUTIONS</div>
                            <div className="mockup-row">
                                <span>John Kamau</span>
                                <span className="mockup-status">Paid</span>
                            </div>
                            <div className="mockup-row">
                                <span>Mary Wanjiku</span>
                                <span className="mockup-status">Paid</span>
                            </div>
                            <div className="mockup-row">
                                <span>David Mwangi</span>
                                <span className="mockup-status" style={{ color: C.accent }}>Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="section">
                <div className="wrap">
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        <div className="mono-label" style={{ marginBottom: '1rem' }}>Features</div>
                        <h2>Everything Your Church Needs</h2>
                        <p>Purpose-built for churches managing funeral welfare programs</p>
                    </div>
                    <div className="benefits-grid">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="benefit-card">
                                <Check size={20} color={C.verdigris} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ fontSize: '0.95rem', color: C.gray }}>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section section-alt">
                <div className="wrap">
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        <div className="mono-label" style={{ marginBottom: '1rem' }}>How It Works</div>
                        <h2>Get started in 3 simple steps</h2>
                    </div>
                    <div className="steps-grid">
                        {steps.map((step, i) => (
                            <div key={i} className="step-card">
                                <div className="step-num">{step.num}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p style={{ fontSize: '0.95rem' }}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section">
                <div className="wrap">
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                        <div className="mono-label" style={{ marginBottom: '1rem' }}>Social Proof</div>
                        <h2>Trusted by Churches Across Kenya</h2>
                        <p>Join 200+ churches already using Rest Point</p>
                    </div>
                    <div className="testimonial-grid">
                        {testimonials.map((t, i) => (
                            <div key={i} className="testimonial-card">
                                <Quote className="quote-icon" size={40} />
                                <p className="testimonial-text">"{t.quote}"</p>
                                <div className="testimonial-name">{t.name}</div>
                                <div className="testimonial-role">{t.role}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section section-alt">
                <div className="wrap">
                    <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        <div className="mono-label" style={{ marginBottom: '1rem' }}>FAQ</div>
                        <h2>Frequently Asked Questions</h2>
                    </div>
                    <div className="faq-container">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`faq-item ${openFAQ === i ? 'active' : ''}`}>
                                <button className="faq-question" onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                                    <span>{faq.q}</span>
                                    <ChevronDown size={20} color={C.brass} style={{ transform: openFAQ === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }} />
                                </button>
                                <div className="faq-answer">{faq.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-wrapper">
                <div className="wrap">
                    <div className="cta-card">
                        <div className="cta-content">
                            <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Get Started Today</div>
                            <h2>Ready to Transform Your Church's Funeral Welfare Program?</h2>
                            <p>Join 200+ churches across Kenya using Rest Point to serve their communities with dignity and transparency.</p>
                            <div className="cta-buttons">
                                <button className="btn btn-brass" onClick={goStart}>Start Free Trial <ArrowRight size={18} /></button>
                                <button className="btn btn-ghost" onClick={goContact}>Schedule Demo</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer goTerms={goTerms} />
        </div>
    );
}