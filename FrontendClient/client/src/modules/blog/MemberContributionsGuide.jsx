import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Clock, DollarSign, FileText, BarChart2, Users, Search, Smartphone, Target, Trophy, MessageSquare, TrendingUp } from '../../utils/icons/icons';
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

const MemberContributionsGuide = () => {
    const navigate = useNavigate();
    const goStart = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/register'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    const amounts = [
        { type: 'Chamas', range: 'KES 200 - 500', note: 'Per member / month' },
        { type: 'Small Churches', range: 'KES 300 - 700', note: 'Per family / month' },
        { type: 'Medium Churches', range: 'KES 500 - 1,000', note: 'Per family / month' },
        { type: 'SACCOs', range: 'KES 500 - 2,000', note: 'Per member / month' },
        { type: 'Large Organizations', range: 'KES 1,000 - 5,000', note: 'Per member / month' }
    ];

    const components = [
        {
            title: 'Clear Contribution Policy',
            items: ['Define monthly contribution amount', 'Set payment due dates and grace periods', 'Establish penalties for late payments (if applicable)', 'Document acceptable payment methods']
        },
        {
            title: 'Member Registration',
            items: ['Collect complete member information', 'Record beneficiary details', 'Capture contact information', 'Assign unique member ID']
        },
        {
            title: 'Payment Tracking',
            items: ['Record each contribution with date and amount', 'Maintain running balance for each member', 'Generate receipts for all payments', 'Track payment methods (cash, M-Pesa, bank transfer)']
        },
        {
            title: 'Reporting System',
            items: ['Monthly contribution summaries', 'Defaulters list with outstanding amounts', 'Total fund balance and growth', 'Member participation rates']
        }
    ];

    const challenges = [
        { icon: DollarSign, title: 'Cash Handling Issues', desc: 'Physical cash collections are prone to loss, theft, and counting errors. Lack of transparency can lead to mistrust among members.' },
        { icon: FileText, title: 'Manual Record Keeping', desc: 'Paper-based systems make it difficult to track who has paid, generate receipts, and maintain accurate financial records.' },
        { icon: Clock, title: 'Late Payments', desc: 'Without automated reminders and tracking, members forget payment dates, leading to inconsistent fund flow.' },
        { icon: BarChart2, title: 'No Real-Time Visibility', desc: 'Committee members cannot access up-to-date contribution data, making planning and decision-making difficult.' },
        { icon: Users, title: 'Member Defaulters', desc: 'Identifying and managing defaulters manually is time-consuming and often leads to confrontations.' },
        { icon: Search, title: 'Audit Difficulties', desc: 'Reconciling contributions with expenses manually is error-prone and time-intensive during audits.' }
    ];

    const practices = [
        { title: 'Communicate Clearly', desc: 'Ensure all members understand contribution amounts, due dates, and payment methods. Post this information prominently and share it regularly.' },
        { title: 'Automate Reminders', desc: 'Send payment reminders via SMS or WhatsApp 3 days before the due date and follow up with defaulters within 48 hours.' },
        { title: 'Offer Multiple Payment Options', desc: 'Accept M-Pesa, bank transfers, and cash. Provide clear instructions for each method with account details.' },
        { title: 'Provide Instant Receipts', desc: 'Issue receipts immediately after payment. Digital receipts are easier to track and harder to lose.' },
        { title: 'Publish Transparency Reports', desc: 'Share monthly contribution summaries with members. Show total collected, expenses, and current fund balance.' },
        { title: 'Celebrate Milestones', desc: 'Recognize consistent contributors and celebrate when the fund reaches significant milestones. This builds engagement.' }
    ];

    const tableData = [
        { aspect: 'Payment Recording', manual: 'Paper receipts, ledgers', digital: 'Automated digital records' },
        { aspect: 'Member Tracking', manual: 'Manual spreadsheets', digital: 'Real-time dashboards' },
        { aspect: 'Receipt Generation', manual: 'Handwritten or printed', digital: 'Instant SMS/email receipts' },
        { aspect: 'Defaulters Mgmt', manual: 'Manual follow-up calls', digital: 'Automated reminders' },
        { aspect: 'Reporting', manual: 'Hours of manual work', digital: 'One-click reports' },
        { aspect: 'Data Security', manual: 'Physical storage risks', digital: 'Encrypted cloud storage' },
        { aspect: 'Scalability', manual: 'Limited to ~200 members', digital: 'Unlimited members' }
    ];

    const strategies = [
        { icon: Smartphone, title: 'Mobile Money Integration', desc: 'Enable M-Pesa payments directly through the system. Members can contribute with one click from their phones.' },
        { icon: BarChart2, title: 'Transparent Reporting', desc: 'Show members exactly how their contributions are used. Publish quarterly financial reports.' },
        { icon: Target, title: 'Clear Benefits', desc: 'Regularly remind members of the benefits they receive. Share success stories of families who received support.' },
        { icon: Award, title: 'Recognition Programs', desc: 'Acknowledge consistent contributors publicly. Create tiers or badges for different participation levels.' },
        { icon: MessageSquare, title: 'Regular Communication', desc: 'Send monthly updates about fund status, upcoming events, and reminders. Keep the community engaged.' },
        { icon: TrendingUp, title: 'Show Impact', desc: 'Track and share metrics like total families helped, average claim processing time, and fund growth.' }
    ];

    return (
        <>
            <Helmet>
                <title>Member Contribution Management for Funeral Welfare | RestPoint</title>
                <meta name="description" content="Learn how to effectively manage member contributions for funeral welfare programs. Best practices for churches, SACCOs, and chamas to track and optimize welfare fund collections." />
                <link rel="canonical" href="https://restpoint.co.ke/blog/member-contributions" />
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
        .hero-meta { display: flex; gap: 2rem; font-size: 0.85rem; color: ${C.grayLight}; margin-top: 2rem; font-family: 'JetBrains Mono', monospace; align-items: center; flex-wrap: wrap; }
        .hero-meta span { display: flex; align-items: center; gap: 0.4rem; }
        .blog-hero h1 { color: ${C.bone}; }
        
        /* Content Layout */
        .blog-content { max-width: 850px; margin: 0 auto; padding: 5rem clamp(1.25rem, 5vw, 2.5rem); }
        .blog-section { margin-bottom: 5rem; }
        .lead-text { font-size: 1.2rem; line-height: 1.8; color: ${C.gray}; margin-bottom: 2rem; }
        
        /* Cards */
        .card { background: ${C.bone}; border: 1px solid ${C.line}; border-radius: 12px; padding: 2.5rem; transition: all 0.3s ease; }
        .card:hover { border-color: ${C.verdigrisLight}; box-shadow: 0 15px 30px rgba(21,23,26,0.06); }
        
        /* Amount Grid */
        .amount-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 2rem; }
        .amount-card { background: ${C.bone}; border: 1px solid ${C.line}; padding: 1.5rem; border-radius: 8px; transition: all 0.3s ease; }
        .amount-card:hover { transform: translateY(-4px); border-color: ${C.verdigris}; }
        .amount-type { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: ${C.verdigris}; text-transform: uppercase; margin-bottom: 0.5rem; }
        .amount-value { font-family: 'Fraunces', serif; font-size: 1.4rem; color: ${C.ink}; font-weight: 600; margin-bottom: 0.25rem; }
        .amount-note { font-size: 0.8rem; color: ${C.gray}; }
        
        /* Component List */
        .component-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; }
        .component-item { background: ${C.bone2}; padding: 1.5rem; border-radius: 8px; border-left: 3px solid ${C.verdigris}; }
        .component-list { list-style: none; padding: 0; margin: 0; }
        .component-list li { display: flex; gap: 0.6rem; padding: 0.4rem 0; font-size: 0.95rem; color: ${C.gray}; }
        .component-list li::before { content: '•'; color: ${C.verdigris}; font-weight: bold; }
        
        /* Challenge Grid */
        .challenge-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .challenge-card { background: ${C.bone}; padding: 2rem; border-radius: 12px; border: 1px solid ${C.line}; transition: all 0.3s ease; }
        .challenge-card:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(21,23,26,0.06); }
        .challenge-icon { width: 48px; height: 48px; background: rgba(199,123,94,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${C.accent}; margin-bottom: 1.2rem; }
        
        /* Steps List */
        .steps-list { display: grid; gap: 1.5rem; margin-top: 2rem; }
        .step-card { display: flex; gap: 1rem; align-items: flex-start; background: ${C.bone2}; padding: 1.5rem; border-radius: 8px; border: 1px solid ${C.line}; }
        .step-num { width: 32px; height: 32px; border-radius: 50%; background: ${C.verdigris}; color: ${C.bone}; display: flex; align-items: center; justify-content: center; font-family: 'Fraunces', serif; font-weight: 600; font-size: 0.9rem; flex-shrink: 0; }
        
        /* Table */
        .table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 2rem; border-radius: 12px; border: 1px solid ${C.line}; }
        table { width: 100%; border-collapse: collapse; font-size: 0.95rem; min-width: 500px; }
        thead tr { background: ${C.ink}; color: ${C.bone}; }
        th { padding: 1rem 1.5rem; text-align: left; font-weight: 600; font-family: 'Inter', sans-serif; }
        td { padding: 1rem 1.5rem; border-bottom: 1px solid ${C.line}; }
        tr:last-child td { border-bottom: none; }
        tbody tr:nth-child(even) { background: ${C.bone2}; }
        
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
          .component-grid { grid-template-columns: 1fr; }
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
                            Contribution Management
                        </div>
                        <h1>Member Contribution Management for Funeral Welfare Programs</h1>
                        <p style={{ fontSize: '1.2rem', lineHeight: 1.7, opacity: 0.9, maxWidth: '700px', color: C.grayLight }}>
                            A comprehensive guide to collecting, tracking, and managing member contributions for churches, SACCOs, and chamas. Learn best practices for sustainable welfare fund management.
                        </p>
                        <div className="hero-meta">
                            <span><Clock size={16} /> 10 min read</span>
                            <span><Clock size={16} /> Updated January 2026</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="blog-content">

                    {/* Section 1 */}
                    <section className="blog-section">
                        <h2>Why Member Contributions Matter</h2>
                        <p className="lead-text">
                            Consistent member contributions are the lifeblood of any funeral welfare program. When members contribute regularly, the fund remains sustainable and capable of providing meaningful support when families need it most. Effective contribution management ensures transparency, builds trust, and strengthens community bonds.
                        </p>

                        <div className="card" style={{ background: `linear-gradient(135deg, ${C.bone2} 0%, ${C.bone} 100%)` }}>
                            <h3>Typical Contribution Amounts in Kenya</h3>
                            <div className="amount-grid">
                                {amounts.map((item, idx) => (
                                    <div key={idx} className="amount-card">
                                        <div className="amount-type">{item.type}</div>
                                        <div className="amount-value">{item.range}</div>
                                        <div className="amount-note">{item.note}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="blog-section">
                        <h2>Setting Up a Contribution System</h2>

                        <div className="card">
                            <h3>Essential Components</h3>
                            <div className="component-grid">
                                {components.map((component, idx) => (
                                    <div key={idx} className="component-item">
                                        <h4 style={{ marginBottom: '0.8rem' }}>{component.title}</h4>
                                        <ul className="component-list">
                                            {component.items.map((item, itemIdx) => (
                                                <li key={itemIdx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="blog-section">
                        <h2>Common Contribution Management Challenges</h2>

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

                    {/* Section 5 */}
                    <section className="blog-section">
                        <h2>Digital vs Manual Contribution Management</h2>

                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Aspect</th>
                                        <th>Manual System</th>
                                        <th>Digital System</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600, color: C.ink }}>{row.aspect}</td>
                                            <td style={{ color: C.gray }}>{row.manual}</td>
                                            <td style={{ color: C.verdigris, fontWeight: 500 }}>{row.digital}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="blog-section">
                        <h2>Maximizing Member Participation</h2>
                        <p className="lead-text">
                            High participation rates are critical for a sustainable welfare fund. Here are strategies to encourage consistent contributions:
                        </p>

                        <div className="challenge-grid">
                            {strategies.map((strategy, idx) => (
                                <div key={idx} className="challenge-card">
                                    <div className="challenge-icon" style={{ background: C.verdigrisTint, color: C.verdigris }}>
                                        <strategy.icon size={24} />
                                    </div>
                                    <h4>{strategy.title}</h4>
                                    <p style={{ fontSize: '0.95rem', margin: 0 }}>{strategy.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <div className="cta-wrapper">
                        <div className="cta-card">
                            <div className="cta-content">
                                <div className="mono-label" style={{ color: C.brass, marginBottom: '1.5rem' }}>Get Started Today</div>
                                <h2>Streamline Your Contribution Management</h2>
                                <p>Join churches, SACCOs, and chamas across Kenya using RestPoint to automate member contributions and improve welfare fund management.</p>
                                <button className="btn-brass" onClick={goStart}>
                                    Get Started Today <ArrowRight size={18} />
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

export default MemberContributionsGuide;