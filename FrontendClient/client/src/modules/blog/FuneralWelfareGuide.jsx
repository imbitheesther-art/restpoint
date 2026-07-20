import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Clock, AlertTriangle } from '../../utils/icons/icons';
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

const FuneralWelfareGuide = () => {
    const navigate = useNavigate();
    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    const tocItems = [
        'What is Funeral Welfare?',
        'How Churches Manage Bereavement Funds'
    ];

    const steps = [
        { title: 'Member Registration', desc: 'Members join the welfare program and provide beneficiary details.' },
        { title: 'Regular Contributions', desc: 'Members contribute monthly or as agreed (typically KES 200-1,000).' },
        { title: 'Fund Accumulation', desc: 'Contributions are pooled and managed by the welfare committee.' },
        { title: 'Bereavement Occurs', desc: 'When a member\'s family member passes away, a claim is initiated.' },
        { title: 'Claim Verification', desc: 'The committee verifies membership and contribution history.' },
        { title: 'Benefit Disbursement', desc: 'Financial assistance is provided to the bereaved family.' }
    ];

    const challenges = [
        'Lost or incomplete member records',
        'Difficulty tracking monthly contributions',
        'Delays in approving funeral assistance',
        'Manual financial reconciliation',
        'Limited visibility into welfare balances',
        'Time-consuming report preparation'
    ];

    const benefits = [
        'Maintain secure digital member records',
        'Track contributions automatically',
        'Manage beneficiaries in one place',
        'Process funeral assistance requests faster',
        'Generate financial reports instantly',
        'Improve transparency for church leadership'
    ];

    return (
        <>
            <Helmet>
                <title>Funeral Welfare Management Software Guide | RestPoint</title>
                <meta name="description" content="Complete guide to funeral welfare management. Learn how churches, SACCOs, and chamas can digitize member contributions, manage beneficiaries, and streamline claims processing." />
                <link rel="canonical" href="https://restpoint.co.ke/blog/funeral-welfare-management" />
            </Helmet>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone};-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}
        h1{font-size:clamp(2.2rem,5vw,3.5rem);line-height:1.1;margin-bottom:1.5rem}
        h2{font-size:clamp(1.8rem,4vw,2.4rem);line-height:1.2;margin-bottom:1.5rem}
        h3{font-size:1.3rem;margin-bottom:1rem}
        h4{font-size:1.1rem;margin-bottom:0.5rem}
        p{line-height:1.8;font-size:1.05rem;color:${C.gray}}
        
        .mono-label{font-family:'JetBrains Mono',monospace;font-size:0.75rem;letter-spacing:0.14em;text-transform:uppercase;color:${C.brass};font-weight:500}
        .blog-container { background: ${C.bone}; }
        
        /* Hero */
        .blog-hero { background: #000000; color: ${C.bone}; padding: clamp(6rem, 10vw, 8rem) 0 5rem; position: relative; overflow: hidden; }
        .hero-grid-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; mask-image: linear-gradient(to bottom, black, transparent 80%); -webkit-mask-image: linear-gradient(to bottom, black, transparent 80%); }
        .hero-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 20% 50%, rgba(61,79,71,0.3) 0%, transparent 60%); pointer-events: none; }
        .hero-content { max-width: 850px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); position: relative; z-index: 1; }
        .hero-meta { display: flex; gap: 2rem; font-size: 0.85rem; color: ${C.grayLight}; margin-top: 2rem; font-family: 'JetBrains Mono', monospace; align-items: center; }
        .hero-meta span { display: flex; align-items: center; gap: 0.4rem; }
        .blog-hero h1 { color: ${C.bone}; }
        
        /* Content Layout */
        .blog-content { max-width: 850px; margin: 0 auto; padding: 5rem clamp(1.25rem, 5vw, 2.5rem); }
        .blog-section { margin-bottom: 5rem; }
        .lead-text { font-size: 1.2rem; line-height: 1.8; color: ${C.gray}; margin-bottom: 2rem; }
        
        /* Table of Contents */
        .toc-card { background: ${C.bone2}; border: 1px solid ${C.line}; border-radius: 12px; padding: 2rem; margin-bottom: 4rem; }
        .toc-list { list-style: none; padding: 0; margin: 0; }
        .toc-item { padding: 0.8rem 0; border-bottom: 1px solid ${C.line}; }
        .toc-item:last-child { border-bottom: none; }
        .toc-link { color: ${C.verdigris}; text-decoration: none; font-size: 1rem; display: flex; align-items: center; gap: 0.8rem; transition: transform 0.2s ease; }
        .toc-link:hover { transform: translateX(4px); color: ${C.ink}; }
        .toc-num { font-family: 'JetBrains Mono', monospace; color: ${C.brass}; font-size: 0.85rem; }
        
        /* Insight Box */
        .insight-box { background: ${C.bone2}; padding: 1.5rem 2rem; border-radius: 8px; border-left: 4px solid ${C.brass}; margin-bottom: 3rem; }
        .insight-box p { font-size: 1rem; line-height: 1.7; color: ${C.ink}; margin: 0; }
        
        /* Steps Timeline */
        .steps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .step-card { background: ${C.bone}; border: 1px solid ${C.line}; padding: 1.5rem; border-radius: 8px; display: flex; gap: 1rem; align-items: flex-start; transition: all 0.3s ease; }
        .step-card:hover { border-color: ${C.verdigrisLight}; box-shadow: 0 10px 20px rgba(21,23,26,0.04); }
        .step-num { width: 32px; height: 32px; border-radius: 50%; background: ${C.verdigris}; color: ${C.bone}; display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }
        
        /* Challenges & Benefits */
        .list-card { background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 12px; padding: 2.5rem; }
        .list-item { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid ${C.line}; }
        .list-item:last-child { border-bottom: none; }
        .icon-box { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .text-sm { font-size: 0.95rem; color: ${C.gray}; }
        
        .benefits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .benefit-card { background: ${C.bone}; border: 1px solid ${C.line}; padding: 1.5rem; border-radius: 8px; display: flex; align-items: flex-start; gap: 0.8rem; transition: all 0.3s ease; }
        .benefit-card:hover { transform: translateY(-2px); border-color: ${C.verdigrisLight}; }
        
        /* CTA Section */
        .cta-wrapper { background: ${C.bone}; padding: 0 0 clamp(4rem, 8vw, 7rem); }
        .cta-card { position: relative; background: linear-gradient(135deg, #000000 0%, ${C.verdigrisDark} 100%); border-radius: 24px; padding: clamp(3rem, 6vw, 5rem) 2rem; text-align: center; overflow: hidden; border: 1px solid ${C.lineDark}; box-shadow: 0 40px 80px -20px rgba(21,23,26,0.3); }
        .cta-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 50% 0%, rgba(139,115,85,0.15) 0%, transparent 50%), linear-gradient(rgba(250,248,244,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,248,244,0.03) 1px, transparent 1px); background-size: 100% 100%, 40px 40px, 40px 40px; pointer-events: none; }
        .cta-content { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; }
        .cta-content h2 { color: ${C.bone}; margin-bottom: 1.5rem; font-size: clamp(2rem, 4.5vw, 3rem); line-height: 1.2; }
        .cta-content p { color: rgba(250,248,244,0.8); font-size: 1.1rem; line-height: 1.8; margin-bottom: 2.5rem; }
        .btn-brass { display: inline-flex; align-items: center; gap: 0.5rem; padding: 1.1rem 2.5rem; font-size: 1rem; font-weight: 600; font-family: 'Inter', sans-serif; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; background: ${C.brass}; color: ${C.bone}; }
        .btn-brass:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(139,115,85,0.25); }
        
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr; }
          .benefits-grid { grid-template-columns: 1fr; }
          .hero-meta { flex-direction: column; gap: 0.5rem; align-items: flex-start; }
        }
      `}</style>

            <div className="blog-container">
                {/* Hero Section */}
                <div className="blog-hero">
                    <div className="hero-grid-bg"></div>
                    <div className="hero-glow"></div>
                    <div className="hero-content">
                        <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem', display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(139,115,85,0.1)', border: `1px solid ${C.lineDark}`, borderRadius: '20px' }}>
                            Complete Guide
                        </div>
                        <h1>Funeral Welfare Management Software: The Complete Guide</h1>
                        <p style={{ fontSize: '1.2rem', lineHeight: 1.7, opacity: 0.9, maxWidth: '700px', color: C.grayLight }}>
                            Everything churches, SACCOs, and chamas need to know about digitizing funeral welfare programs, managing member contributions, and streamlining claims processing.
                        </p>
                        <div className="hero-meta">
                            <span><Clock size={16} /> 15 min read</span>
                            <span><Clock size={16} /> Updated January 2026</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="blog-content">

                    {/* Table of Contents */}
                    <div className="toc-card">
                        <div className="mono-label" style={{ marginBottom: '1rem', color: C.verdigris }}>Table of Contents</div>
                        <ul className="toc-list">
                            {tocItems.map((item, idx) => (
                                <li key={idx} className="toc-item">
                                    <a href={`#section-${idx}`} className="toc-link">
                                        <span className="toc-num">{String(idx + 1).padStart(2, '0')}</span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Section 1 */}
                    <section id="section-0" className="blog-section">
                        <h2>What is Funeral Welfare?</h2>
                        <p className="lead-text">
                            Funeral welfare is a community-based support system where members contribute regularly to a shared fund that provides financial assistance during bereavement. When a member's loved one passes away, the welfare program helps cover funeral expenses, reducing the financial burden on the family during a difficult time.
                        </p>

                        <div className="insight-box">
                            <p>
                                <strong>Key Insight:</strong> In Kenya, funeral welfare programs are most commonly run by churches, SACCOs, chamas (merry-go-rounds), and employers. These programs build community trust and provide essential financial security.
                            </p>
                        </div>

                        <h3>How Funeral Welfare Works</h3>
                        <div className="steps-grid">
                            {steps.map((step, idx) => (
                                <div key={idx} className="step-card">
                                    <div className="step-num">{idx + 1}</div>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{step.title}</h4>
                                        <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section id="section-1" className="blog-section">
                        <h2>How Churches Manage Bereavement Funds</h2>
                        <p className="lead-text">
                            Churches play a vital role in supporting members during times of loss. Many congregations operate funeral welfare programs where members contribute regularly to help families meet funeral expenses when a loved one passes away.
                        </p>

                        <h3>Common Challenges</h3>
                        <div className="list-card" style={{ marginBottom: '3rem' }}>
                            {challenges.map((challenge, idx) => (
                                <div key={idx} className="list-item">
                                    <div className="icon-box" style={{ color: C.accent }}>
                                        <AlertTriangle size={20} />
                                    </div>
                                    <span className="text-sm">{challenge}</span>
                                </div>
                            ))}
                        </div>

                        <h3>Benefits of Digital Management</h3>
                        <div className="benefits-grid">
                            {benefits.map((benefit, idx) => (
                                <div key={idx} className="benefit-card">
                                    <div className="icon-box" style={{ color: C.verdigris, marginTop: '2px' }}>
                                        <Check size={20} />
                                    </div>
                                    <span style={{ color: C.ink, fontSize: '0.95rem', lineHeight: 1.6 }}>{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <div className="cta-wrapper">
                        <div className="cta-card">
                            <div className="cta-content">
                                <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Get Started Today</div>
                                <h2>Ready to Modernize Your Funeral Welfare Program?</h2>
                                <p>Join churches, SACCOs, and chamas across Kenya using RestPoint to manage funeral welfare digitally.</p>
                                <button className="btn-brass" onClick={goStart}>
                                    Get Started Free <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                <Footer goTerms={goTerms} />
            </div>
        </>
    );
};

export default FuneralWelfareGuide;