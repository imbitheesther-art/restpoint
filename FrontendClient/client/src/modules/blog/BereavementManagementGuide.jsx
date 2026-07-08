import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Users, Shield, Heart } from 'lucide-react';

const BereavementManagementGuide = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Bereavement Management Software Guide | RestPoint</title>
                <meta name="description" content="Learn how to streamline bereavement management for churches, SACCOs, and organizations. Digital solutions for managing funeral claims, member benefits, and welfare programs." />
                <link rel="canonical" href="https://restpoint.co.ke/blog/bereavement-management" />
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
                            Management Guide
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Bereavement Management: A Complete Guide for Organizations
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            Streamline funeral claims, member benefits, and welfare programs with modern bereavement management software. Best practices for churches, SACCOs, and chamas.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            fontSize: '0.85rem',
                            opacity: 0.8
                        }}>
                            <span>📅 12 min read</span>
                            <span>📅 Updated January 2026</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '1.5rem'
                        }}>
                            What is Bereavement Management?
                        </h2>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '1.5rem'
                        }}>
                            Bereavement management is the systematic process of supporting individuals and families during times of loss. For organizations like churches, SACCOs, and chamas, this involves managing funeral welfare programs, processing claims, and providing timely financial assistance to bereaved members.
                        </p>

                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.3rem',
                                color: '#15171A',
                                marginBottom: '1rem'
                            }}>
                                Key Components of Bereavement Management
                            </h3>

                            <div style={{
                                display: 'grid',
                                gap: '1rem'
                            }}>
                                {[
                                    { title: 'Member Registration', desc: 'Maintaining accurate records of members and their designated beneficiaries' },
                                    { title: 'Contribution Tracking', desc: 'Monitoring regular payments to ensure eligibility for benefits' },
                                    { title: 'Claims Processing', desc: 'Handling funeral assistance requests efficiently and compassionately' },
                                    { title: 'Beneficiary Management', desc: 'Keeping beneficiary information current and verified' },
                                    { title: 'Financial Disbursement', desc: 'Releasing funds promptly to support funeral expenses' },
                                    { title: 'Reporting & Compliance', desc: 'Generating reports for leadership and ensuring regulatory compliance' }
                                ].map((component, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'flex-start',
                                        padding: '1rem',
                                        background: '#FAF8F4',
                                        borderRadius: '6px'
                                    }}>
                                        <div style={{
                                            background: '#3D4F47',
                                            color: '#FAF8F4',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            flexShrink: 0
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 style={{
                                                fontSize: '1rem',
                                                color: '#15171A',
                                                marginBottom: '0.3rem'
                                            }}>{component.title}</h4>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: '#6B6862',
                                                margin: 0,
                                                lineHeight: 1.6
                                            }}>{component.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '1.5rem'
                        }}>
                            Common Challenges in Manual Bereavement Management
                        </h2>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '2rem'
                        }}>
                            Many organizations still rely on spreadsheets, paper records, or basic databases to manage bereavement programs. This approach creates several critical challenges:
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {[
                                {
                                    icon: '📊',
                                    title: 'Data Silos',
                                    desc: 'Member information scattered across multiple spreadsheets and files, making it difficult to get a complete view'
                                },
                                {
                                    icon: '⏱️',
                                    title: 'Slow Response Times',
                                    desc: 'Manual verification processes delay assistance to families when they need it most'
                                },
                                {
                                    icon: '❌',
                                    title: 'Human Error',
                                    desc: 'Data entry mistakes, lost records, and calculation errors lead to incorrect payouts or missed contributions'
                                },
                                {
                                    icon: '🔒',
                                    title: 'Security Concerns',
                                    desc: 'Sensitive member and financial data stored insecurely, risking privacy breaches'
                                },
                                {
                                    icon: '📈',
                                    title: 'Scalability Issues',
                                    desc: 'Manual systems become unmanageable as membership grows beyond 100-200 active members'
                                },
                                {
                                    icon: '📋',
                                    title: 'Compliance Risks',
                                    desc: 'Difficulty maintaining audit trails and generating reports for leadership or regulators'
                                }
                            ].map((challenge, idx) => (
                                <div key={idx} style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E3DDD0'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{challenge.icon}</div>
                                    <h4 style={{
                                        fontSize: '1.05rem',
                                        color: '#15171A',
                                        marginBottom: '0.5rem'
                                    }}>{challenge.title}</h4>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: '#6B6862',
                                        lineHeight: 1.6,
                                        margin: 0
                                    }}>{challenge.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '1.5rem'
                        }}>
                            Benefits of Digital Bereavement Management
                        </h2>

                        <div style={{
                            background: 'linear-gradient(135deg, #F3EFE6 0%, #FAF8F4 100%)',
                            padding: '2.5rem',
                            borderRadius: '12px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                display: 'grid',
                                gap: '1.5rem'
                            }}>
                                {[
                                    {
                                        title: 'Faster Claims Processing',
                                        benefit: 'Reduce claim approval time from days to hours with automated verification workflows'
                                    },
                                    {
                                        title: 'Improved Accuracy',
                                        benefit: 'Eliminate manual data entry errors with validated fields and automated calculations'
                                    },
                                    {
                                        title: 'Better Member Experience',
                                        benefit: 'Provide transparent, real-time updates on contribution status and benefit eligibility'
                                    },
                                    {
                                        title: 'Enhanced Security',
                                        benefit: 'Protect sensitive member data with role-based access controls and encrypted storage'
                                    },
                                    {
                                        title: 'Scalable Operations',
                                        benefit: 'Manage thousands of members with the same efficiency as hundreds'
                                    },
                                    {
                                        title: 'Data-Driven Decisions',
                                        benefit: 'Generate instant reports on fund health, claims trends, and member participation'
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'flex-start'
                                    }}>
                                        <Check size={22} color="#3D4F47" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{
                                                fontSize: '1.05rem',
                                                color: '#15171A',
                                                marginBottom: '0.3rem'
                                            }}>{item.title}</h4>
                                            <p style={{
                                                fontSize: '0.95rem',
                                                color: '#6B6862',
                                                margin: 0,
                                                lineHeight: 1.6
                                            }}>{item.benefit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '1.5rem'
                        }}>
                            Best Practices for Bereavement Support
                        </h2>

                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                color: '#15171A',
                                marginBottom: '1rem'
                            }}>
                                For Welfare Committee Members
                            </h3>

                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                            }}>
                                {[
                                    'Respond to bereavement notifications within 24 hours',
                                    'Verify member status and contribution history promptly',
                                    'Communicate clearly about the claims process and timeline',
                                    'Disburse funds within 48-72 hours of approval',
                                    'Follow up with the family after funeral to offer continued support',
                                    'Maintain confidentiality and respect throughout the process'
                                ].map((practice, idx) => (
                                    <li key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        padding: '0.8rem 0',
                                        borderBottom: idx < 5 ? '1px solid #F3EFE6' : 'none'
                                    }}>
                                        <span style={{ color: '#3D4F47', fontSize: '1.2rem' }}>✓</span>
                                        <span style={{ color: '#6B6862', fontSize: '0.95rem' }}>{practice}</span>
                                    </li>
                                ))}
                            </ul>
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
                            Transform Your Bereavement Management
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join organizations across Kenya using RestPoint to streamline bereavement management and provide better support to members.
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
                            Start Free Trial
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default BereavementManagementGuide;