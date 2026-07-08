import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Shield, Star, Users } from 'lucide-react';

const BestSACCOWelfareSoftware = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Best SACCO Funeral Welfare Software in Kenya 2026 | RestPoint</title>
                <meta name="description" content="Complete guide to choosing the best SACCO funeral welfare software in Kenya. Compare features, pricing, and benefits for SACCO funeral benefit management." />
                <link rel="canonical" href="https://restpoint.co.ke/compare/best-sacco-welfare-software" />
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
                            Software Guide
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Best SACCO Funeral Welfare Software in Kenya
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            A comprehensive comparison of funeral welfare management software for Kenyan SACCOs. Find the right solution to manage member benefits and contributions.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            fontSize: '0.85rem',
                            opacity: 0.8
                        }}>
                            <span>11 min read</span>
                            <span>Updated January 2026</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Introduction */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '1.5rem'
                        }}>
                            Why SACCOs Need Digital Funeral Welfare Management
                        </h2>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '1.5rem'
                        }}>
                            SACCOs (Savings and Credit Cooperative Societies) play a vital role in Kenya's financial landscape, providing not just savings and credit services but also welfare benefits to members. Funeral welfare programs are a key member benefit that helps families during difficult times.
                        </p>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '2rem'
                        }}>
                            As SACCOs grow and membership increases, managing funeral welfare programs manually becomes increasingly challenging. Digital funeral welfare software helps SACCOs streamline operations, improve transparency, and provide better service to members.
                        </p>

                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {[
                                    'Manage member contributions alongside savings accounts',
                                    'Process funeral claims faster with automated workflows',
                                    'Generate financial reports for SACCO audits',
                                    'Integrate with M-Pesa for seamless collections',
                                    'Provide member self-service portals',
                                    'Ensure compliance with SASRA regulations'
                                ].map((item, idx) => (
                                    <li key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        padding: '0.6rem 0',
                                        borderBottom: idx < 5 ? '1px solid #F3EFE6' : 'none'
                                    }}>
                                        <Check size={18} color="#3D4F47" />
                                        <span style={{ color: '#6B6862', fontSize: '0.95rem' }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Key Features */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            Essential Features for SACCO Welfare Software
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {[
                                {
                                    feature: 'Member Integration',
                                    importance: 'Critical',
                                    desc: 'Sync with existing SACCO member database. No duplicate data entry required.'
                                },
                                {
                                    feature: 'M-Pesa Integration',
                                    importance: 'Critical',
                                    desc: 'Collect contributions and disburse benefits via M-Pesa automatically.'
                                },
                                {
                                    feature: 'Payroll Deductions',
                                    importance: 'High',
                                    desc: 'Support for employer payroll deductions through SACCO arrangements.'
                                },
                                {
                                    feature: 'Claims Management',
                                    importance: 'Critical',
                                    desc: 'Digital claim submission, verification, and approval workflows.'
                                },
                                {
                                    feature: 'Financial Reports',
                                    importance: 'High',
                                    desc: 'Generate SASRA-compliant reports and member statements.'
                                },
                                {
                                    feature: 'Multi-Branch Support',
                                    importance: 'High',
                                    desc: 'Manage welfare across multiple SACCO branches from one system.'
                                },
                                {
                                    feature: 'SMS Notifications',
                                    importance: 'Medium',
                                    desc: 'Automated reminders for contributions and claim status updates.'
                                },
                                {
                                    feature: 'Audit Trail',
                                    importance: 'Critical',
                                    desc: 'Complete transaction history for regulatory compliance and transparency.'
                                }
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E3DDD0'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.8rem'
                                    }}>
                                        <h4 style={{
                                            fontSize: '1.05rem',
                                            color: '#15171A',
                                            margin: 0
                                        }}>{item.feature}</h4>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '4px',
                                            background: item.importance === 'Critical' ? '#3D4F47' : item.importance === 'High' ? '#8B7355' : '#6B6862',
                                            color: '#FAF8F4',
                                            fontWeight: 600
                                        }}>{item.importance}</span>
                                    </div>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: '#6B6862',
                                        lineHeight: 1.6,
                                        margin: 0
                                    }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Why RestPoint */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            Why Kenyan SACCOs Choose RestPoint
                        </h2>

                        <div style={{
                            background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                            color: '#FAF8F4',
                            padding: '2.5rem',
                            borderRadius: '12px',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                display: 'grid',
                                gap: '1.5rem'
                            }}>
                                {[
                                    {
                                        title: 'SACCO-Focused Design',
                                        desc: 'Built specifically for Kenyan SACCOs with understanding of welfare benefit structures, member categories, and regulatory requirements.'
                                    },
                                    {
                                        title: 'Seamless Integration',
                                        desc: 'Works alongside your existing SACCO management system. Import member data and start managing welfare benefits immediately.'
                                    },
                                    {
                                        title: 'M-Pesa Native',
                                        desc: 'Native M-Pesa integration for both collections and disbursements. Members can contribute and receive benefits through mobile money.'
                                    },
                                    {
                                        title: 'Compliance Ready',
                                        desc: 'Generate reports that meet SASRA requirements. Maintain complete audit trails for all welfare transactions.'
                                    },
                                    {
                                        title: 'Dedicated Support',
                                        desc: 'Kenyan support team that understands SACCO operations. Available via phone, WhatsApp, and email for quick assistance.'
                                    }
                                ].map((reason, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'flex-start'
                                    }}>
                                        <Star size={22} color="#FAF8F4" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{
                                                fontSize: '1.1rem',
                                                color: '#FAF8F4',
                                                marginBottom: '0.3rem'
                                            }}>{reason.title}</h4>
                                            <p style={{
                                                fontSize: '0.95rem',
                                                color: 'rgba(250,248,244,0.9)',
                                                margin: 0,
                                                lineHeight: 1.6
                                            }}>{reason.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <div style={{
                        background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                        color: '#FAF8F4',
                        padding: '3rem',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            marginBottom: '1rem'
                        }}>
                            Ready to Transform Your SACCO Welfare Program?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join leading SACCOs across Kenya using RestPoint to manage funeral welfare benefits more effectively.
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

export default BestSACCOWelfareSoftware;