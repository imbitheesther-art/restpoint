import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, HardDrive, Clock, XCircle, Lock, TrendingUp, FileText, Users, ShieldCheck, Activity, Zap } from '../../utils/icons/icons';
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

const BereavementManagementGuide = () => {
    const navigate = useNavigate();
    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    const components = [
        { title: 'Member Registration', desc: 'Maintaining accurate records of members and their designated beneficiaries.' },
        { title: 'Contribution Tracking', desc: 'Monitoring regular payments to ensure eligibility for benefits.' },
        { title: 'Claims Processing', desc: 'Handling funeral assistance requests efficiently and compassionately.' },
        { title: 'Beneficiary Management', desc: 'Keeping beneficiary information current and verified.' },
        { title: 'Financial Disbursement', desc: 'Releasing funds promptly to support funeral expenses.' },
        { title: 'Reporting & Compliance', desc: 'Generating reports for leadership and ensuring regulatory compliance.' }
    ];

    const challenges = [
        { icon: Database, title: 'Data Silos', desc: 'Member information scattered across multiple spreadsheets and files, making it difficult to get a complete view.' },
        { icon: Clock, title: 'Slow Response Times', desc: 'Manual verification processes delay assistance to families when they need it most.' },
        { icon: XCircle, title: 'Human Error', desc: 'Data entry mistakes, lost records, and calculation errors lead to incorrect payouts or missed contributions.' },
        { icon: Lock, title: 'Security Concerns', desc: 'Sensitive member and financial data stored insecurely, risking privacy breaches.' },
        { icon: TrendingUp, title: 'Scalability Issues', desc: 'Manual systems become unmanageable as membership grows beyond 100-200 active members.' },
        { icon: FileText, title: 'Compliance Risks', desc: 'Difficulty maintaining audit trails and generating reports for leadership or regulators.' }
    ];

    const benefits = [
        { title: 'Faster Claims Processing', benefit: 'Reduce claim approval time from days to hours with automated verification workflows.' },
        { title: 'Improved Accuracy', benefit: 'Eliminate manual data entry errors with validated fields and automated calculations.' },
        { title: 'Better Member Experience', benefit: 'Provide transparent, real-time updates on contribution status and benefit eligibility.' },
        { title: 'Enhanced Security', benefit: 'Protect sensitive member data with role-based access controls and encrypted storage.' },
        { title: 'Scalable Operations', benefit: 'Manage thousands of members with the same efficiency as hundreds.' },
        { title: 'Data-Driven Decisions', benefit: 'Generate instant reports on fund health, claims trends, and member participation.' }
    ];

    const practices = [
        'Respond to bereavement notifications within 24 hours.',
        'Verify member status and contribution history promptly.',
        'Communicate clearly about the claims process and timeline.',
        'Disburse funds within 48-72 hours of approval.',
        'Follow up with the family after funeral to offer continued support.',
        'Maintain confidentiality and respect throughout the process.'
    ];

    return (
        <>
            <Helmet>
                <title>Bereavement Management Software Guide | RestPoint</title>
                <meta name="description" content="Learn how to streamline bereavement management for churches, SACCOs, and organizations. Digital solutions for managing funeral claims, member benefits, and welfare programs." />
                <link rel="canonical" href="https://restpoint.co.ke/blog/bereavement-management" />
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
        .blog-hero { background: ${C.ink}; color: ${C.bone}; padding: clamp(6rem, 10vw, 8rem) 0 5rem; position: relative; overflow: hidden; }
        .hero-grid-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; mask-image: linear-gradient(to bottom, black, transparent 80%); -webkit-mask-image: linear-gradient(to bottom, black, transparent 80%); }
        .hero-glow { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 20% 50%, rgba(61,79,71,0.3) 0%, transparent 60%); pointer-events: none; }
        .hero-content { max-width: 850px; margin: 0 auto; padding: 0 clamp(1.25rem, 5vw, 2.5rem); position: relative; z-index: 1; }
        .hero-meta { display: flex; gap: 2rem; font-size: 0.85rem; color: ${C.grayLight}; margin-top: 2rem; font-family: 'JetBrains Mono', monospace; }
        
        /* Content Layout */
        .blog-content { max-width: 850px; margin: 0 auto; padding: 5rem clamp(1.25rem, 5vw, 2.5rem); }
        .blog-section { margin-bottom: 5rem; }
        .lead-text { font-size: 1.2rem; line-height: 1.8; color: ${C.grayDark || C.gray}; margin-bottom: 2rem; }
        
        /* Cards */
        .card { background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 12px; padding: 2.5rem; transition: all 0.3s ease; }
        .card:hover { border-color: ${C.verdigrisLight}; box-shadow: 0 15px 30px rgba(21,23,26,0.06); }
        
        .component-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; }
        .component-item { display: flex; gap: 1rem; align-items: flex-start; background: ${C.bone2}; padding: 1.5rem; border-radius: 8px; border: 1px solid ${C.line}; }
        .component-num { width: 32px; height: 32px; border-radius: 50%; background: ${C.verdigris}; color: ${C.bone}; display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }
        
        .challenge-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .challenge-card { background: ${C.bone}; padding: 2rem; border-radius: 12px; border: 1px solid ${C.line}; transition: all 0.3s ease; }
        .challenge-card:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(21,23,26,0.06); }
        .challenge-icon { width: 48px; height: 48px; background: rgba(199,123,94,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${C.accent}; margin-bottom: 1.2rem; }
        
        .benefit-card { background: linear-gradient(135deg, ${C.bone2} 0%, ${C.bone} 100%); border: 1px solid ${C.line}; border-radius: 12px; padding: 3rem; }
        .benefit-item { display: flex; gap: 1rem; align-items: flex-start; padding: 1.5rem 0; border-bottom: 1px solid ${C.line}; }
        .benefit-item:last-child { border-bottom: none; }
        .benefit-check { width: 28px; height: 28px; border-radius: 50%; background: ${C.verdigrisTint}; color: ${C.verdigris}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        
        .practice-list { list-style: none; padding: 0; margin: 0; }
        .practice-item { display: flex; align-items: center; gap: 1rem; padding: 1.2rem 0; border-bottom: 1px solid ${C.line}; }
        .practice-item:last-child { border-bottom: none; }
        
        /* CTA Section */
        .cta-wrapper { background: ${C.bone}; padding: 0 0 clamp(4rem, 8vw, 7rem); }
        .cta-card { position: relative; background: linear-gradient(135deg, ${C.ink} 0%, ${C.verdigrisDark} 100%); border-radius: 24px; padding: clamp(3rem, 6vw, 5rem) 2rem; text-align: center; overflow: hidden; border: 1px solid ${C.lineDark}; box-shadow: 0 40px 80px -20px rgba(21,23,26,0.3); }
        .cta-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle at 50% 0%, rgba(139,115,85,0.15) 0%, transparent 50%), linear-gradient(rgba(250,248,244,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,248,244,0.03) 1px, transparent 1px); background-size: 100% 100%, 40px 40px, 40px 40px; pointer-events: none; }
        .cta-content { position: relative; z-index: 2; max-width: 700px; margin: 0 auto; }
        .cta-content h2 { color: ${C.bone}; margin-bottom: 1.5rem; font-size: clamp(2rem, 4.5vw, 3rem); line-height: 1.2; }
        .cta-content p { color: rgba(250,248,244,0.8); font-size: 1.1rem; line-height: 1.8; margin-bottom: 2.5rem; }
        .btn-brass { display: inline-flex; align-items: center; gap: 0.5rem; padding: 1.1rem 2.5rem; font-size: 1rem; font-weight: 600; font-family: 'Inter', sans-serif; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; background: ${C.brass}; color: ${C.bone}; }
        .btn-brass:hover { background: ${C.brassLight}; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(139,115,85,0.25); }
        
        @media (max-width: 768px) {
          .component-grid { grid-template-columns: 1fr; }
          .benefit-card { padding: 2rem; }
          .hero-meta { flex-direction: column; gap: 0.5rem; }
        }
      `}</style>

            <div className="blog-container">
                {/* Hero Section */}
                <div className="blog-hero">
                    <div className="hero-grid-bg"></div>
                    <div className="hero-glow"></div>
                    <div className="hero-content">
                        <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem', display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(139,115,85,0.1)', border: `1px solid ${C.lineDark}`, borderRadius: '20px' }}>
                            Management Guide
                        </div>
                        <h1>Bereavement Management: A Complete Guide for Organizations</h1>
                        <p style={{ fontSize: '1.2rem', lineHeight: 1.7, opacity: 0.9, maxWidth: '700px', color: C.grayLight }}>
                            Streamline funeral claims, member benefits, and welfare programs with modern bereavement management software. Best practices for churches, SACCOs, and chamas.
                        </p>
                        <div className="hero-meta">
                            <span>12 min read</span>
                            <span>Updated January 2026</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="blog-content">

                    {/* Section 1 */}
                    <section className="blog-section">
                        <h2>What is Bereavement Management?</h2>
                        <p className="lead-text">
                            Bereavement management is the systematic process of supporting individuals and families during times of loss. For organizations like churches, SACCOs, and chamas, this involves managing funeral welfare programs, processing claims, and providing timely financial assistance to bereaved members.
                        </p>

                        <div className="card">
                            <h3>Key Components of Bereavement Management</h3>
                            <div className="component-grid">
                                {components.map((component, idx) => (
                                    <div key={idx} className="component-item">
                                        <div className="component-num">{idx + 1}</div>
                                        <div>
                                            <h4>{component.title}</h4>
                                            <p style={{ fontSize: '0.95rem', margin: 0 }}>{component.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="blog-section">
                        <h2>Common Challenges in Manual Bereavement Management</h2>
                        <p className="lead-text">
                            Many organizations still rely on spreadsheets, paper records, or basic databases to manage bereavement programs. This approach creates several critical challenges:
                        </p>

                        <div className="challenge-grid">
                            {challenges.map((challenge, idx) => (
                                <div key={idx} className="challenge-card">
                                    <div className="challenge-icon">
                                        <challenge.icon size={24} />
                                    </div>
                                    <h4>{challenge.title}</h4>
                                    <p style={{ fontSize: '0.95rem', margin: 0 }}>{challenge.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="blog-section">
                        <h2>Benefits of Digital Bereavement Management</h2>

                        <div className="benefit-card">
                            {benefits.map((item, idx) => (
                                <div key={idx} className="benefit-item">
                                    <div className="benefit-check">
                                        <Check size={18} />
                                    </div>
                                    <div>
                                        <h4>{item.title}</h4>
                                        <p style={{ fontSize: '1rem', margin: 0 }}>{item.benefit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="blog-section">
                        <h2>Best Practices for Bereavement Support</h2>

                        <div className="card">
                            <h3>For Welfare Committee Members</h3>
                            <ul className="practice-list">
                                {practices.map((practice, idx) => (
                                    <li key={idx} className="practice-item">
                                        <Check size={20} color={C.verdigris} style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: '1rem', color: C.gray }}>{practice}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <div className="cta-wrapper">
                        <div className="cta-card">
                            <div className="cta-content">
                                <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Get Started Today</div>
                                <h2>Transform Your Bereavement Management</h2>
                                <p>Join organizations across Kenya using RestPoint to streamline bereavement management and provide better support to members.</p>
                                <button className="btn-brass" onClick={goStart}>
                                    Start Free Trial <ArrowRight size={18} />
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

export default BereavementManagementGuide;