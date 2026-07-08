import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Users, Shield, BookOpen, Heart, Clock, AlertTriangle } from 'lucide-react';

const FuneralWelfareGuide = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Funeral Welfare Management Software Guide | RestPoint</title>
                <meta name="description" content="Complete guide to funeral welfare management. Learn how churches, SACCOs, and chamas can digitize member contributions, manage beneficiaries, and streamline claims processing." />
                <link rel="canonical" href="https://restpoint.co.ke/blog/funeral-welfare-management" />
            </Helmet>

            <div style={{ minHeight: '100vh', background: '#FAF8F4' }}>
                {/* Hero Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #15171A 0%, #2E3F37 100%)',
                    color: '#FAF8F4',
                    padding: '5rem 2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 50%, rgba(61,79,71,0.3) 0%, transparent 60%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(61,79,71,0.4)',
                            color: '#EBEFEF',
                            padding: '0.5rem 1rem',
                            borderRadius: '2px',
                            fontSize: '0.75rem',
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            marginBottom: '1.5rem'
                        }}>
                            Complete Guide
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Funeral Welfare Management Software: The Complete Guide
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            Everything churches, SACCOs, and chamas need to know about digitizing funeral welfare programs, managing member contributions, and streamlining claims processing.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            fontSize: '0.85rem',
                            opacity: 0.8,
                            alignItems: 'center'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={16} /> 15 min read
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={16} /> Updated January 2026
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Table of Contents */}
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '8px',
                        border: '1px solid #E3DDD0',
                        marginBottom: '3rem'
                    }}>
                        <h2 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#3D4F47',
                            marginBottom: '1rem'
                        }}>
                            Table of Contents
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {[
                                'What is Funeral Welfare?',
                                'How Churches Manage Bereavement Funds',
                                'How SACCO Funeral Benefits Work',
                                'Funeral Claims Process',
                                'Managing Member Contributions',
                                'Digital Welfare Management',
                                'Welfare Scheme Compliance',
                                'Best Funeral Welfare Software in Kenya'
                            ].map((item, idx) => (
                                <li key={idx} style={{
                                    padding: '0.5rem 0',
                                    borderBottom: idx < 7 ? '1px solid #F3EFE6' : 'none'
                                }}>
                                    <a href={`#section-${idx}`} style={{
                                        color: '#3D4F47',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{ color: '#8B7355' }}>{String(idx + 1).padStart(2, '0')}</span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Section 1 */}
                    <section id="section-0" style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '1.5rem'
                        }}>
                            What is Funeral Welfare?
                        </h2>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '1.5rem'
                        }}>
                            Funeral welfare is a community-based support system where members contribute regularly to a shared fund that provides financial assistance during bereavement. When a member's loved one passes away, the welfare program helps cover funeral expenses, reducing the financial burden on the family during a difficult time.
                        </p>

                        <div style={{
                            background: '#F3EFE6',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            borderLeft: '4px solid #8B7355',
                            marginBottom: '1.5rem'
                        }}>
                            <p style={{
                                fontSize: '1rem',
                                lineHeight: 1.7,
                                color: '#15171A',
                                margin: 0
                            }}>
                                <strong>Key Insight:</strong> In Kenya, funeral welfare programs are most commonly run by churches, SACCOs, chamas (merry-go-rounds), and employers. These programs build community trust and provide essential financial security.
                            </p>
                        </div>

                        <h3 style={{
                            fontSize: '1.3rem',
                            color: '#15171A',
                            marginTop: '2rem',
                            marginBottom: '1rem'
                        }}>
                            How Funeral Welfare Works
                        </h3>

                        <div style={{
                            display: 'grid',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }}>
                            {[
                                { title: 'Member Registration', desc: 'Members join the welfare program and provide beneficiary details' },
                                { title: 'Regular Contributions', desc: 'Members contribute monthly or as agreed (typically KES 200-1,000)' },
                                { title: 'Fund Accumulation', desc: 'Contributions are pooled and managed by the welfare committee' },
                                { title: 'Bereavement Occurs', desc: 'When a member\'s family member passes away, a claim is initiated' },
                                { title: 'Claim Verification', desc: 'The committee verifies membership and contribution history' },
                                { title: 'Benefit Disbursement', desc: 'Financial assistance is provided to the bereaved family' }
                            ].map((step, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start',
                                    padding: '1rem',
                                    background: 'white',
                                    borderRadius: '6px',
                                    border: '1px solid #E3DDD0'
                                }}>
                                    <div style={{
                                        background: '#3D4F47',
                                        color: '#FAF8F4',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        flexShrink: 0
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 style={{
                                            fontSize: '1rem',
                                            color: '#15171A',
                                            marginBottom: '0.3rem'
                                        }}>{step.title}</h4>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#6B6862',
                                            margin: 0,
                                            lineHeight: 1.6
                                        }}>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section id="section-1" style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '1.5rem'
                        }}>
                            How Churches Manage Bereavement Funds
                        </h2>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '1.5rem'
                        }}>
                            Churches play a vital role in supporting members during times of loss. Many congregations operate funeral welfare programs where members contribute regularly to help families meet funeral expenses when a loved one passes away.
                        </p>

                        <h3 style={{
                            fontSize: '1.3rem',
                            color: '#15171A',
                            marginTop: '2rem',
                            marginBottom: '1rem'
                        }}>
                            Common Challenges
                        </h3>

                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {[
                                    'Lost or incomplete member records',
                                    'Difficulty tracking monthly contributions',
                                    'Delays in approving funeral assistance',
                                    'Manual financial reconciliation',
                                    'Limited visibility into welfare balances',
                                    'Time-consuming report preparation'
                                ].map((challenge, idx) => (
                                    <li key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        padding: '0.8rem 0',
                                        borderBottom: idx < 5 ? '1px solid #F3EFE6' : 'none'
                                    }}>
                                        <AlertTriangle size={20} color="#C77B5E" />
                                        <span style={{ color: '#6B6862', fontSize: '0.95rem' }}>{challenge}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <h3 style={{
                            fontSize: '1.3rem',
                            color: '#15171A',
                            marginTop: '2rem',
                            marginBottom: '1rem'
                        }}>
                            Benefits of Digital Management
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem'
                        }}>
                            {[
                                'Maintain secure digital member records',
                                'Track contributions automatically',
                                'Manage beneficiaries in one place',
                                'Process funeral assistance requests faster',
                                'Generate financial reports instantly',
                                'Improve transparency for church leadership'
                            ].map((benefit, idx) => (
                                <div key={idx} style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E3DDD0',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.8rem'
                                }}>
                                    <Check size={20} color="#3D4F47" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span style={{ color: '#15171A', fontSize: '0.95rem', lineHeight: 1.6 }}>{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                        color: '#FAF8F4',
                        padding: '3rem',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginTop: '4rem'
                    }}>
                        <h3 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            marginBottom: '1rem'
                        }}>
                            Ready to Modernize Your Funeral Welfare Program?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join churches, SACCOs, and chamas across Kenya using RestPoint to manage funeral welfare digitally.
                        </p>
                        <button
                            onClick={() => navigate('/register')}
                            style={{
                                background: '#FAF8F4',
                                color: '#3D4F47',
                                border: 'none',
                                padding: '1rem 2.5rem',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            Get Started Free
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default FuneralWelfareGuide;