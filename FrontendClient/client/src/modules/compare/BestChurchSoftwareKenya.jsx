import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, TrendingUp, Shield, Star } from 'lucide-react';

const BestChurchSoftwareKenya = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Best Church Welfare Software in Kenya 2026 | RestPoint</title>
                <meta name="description" content="Comprehensive guide to choosing the best church welfare management software in Kenya. Compare features, pricing, and benefits of top funeral welfare solutions." />
                <link rel="canonical" href="https://restpoint.co.ke/compare/best-church-software-kenya" />
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
                            Best Church Welfare Software in Kenya
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            A comprehensive comparison of funeral welfare management software for Kenyan churches. Find the right solution for your congregation.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            fontSize: '0.85rem',
                            opacity: 0.8
                        }}>
                            <span>12 min read</span>
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
                            Why Churches Need Digital Welfare Management
                        </h2>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '1.5rem'
                        }}>
                            As Kenyan churches grow, managing funeral welfare programs manually becomes increasingly challenging. Spreadsheets, paper records, and manual processes can no longer keep up with the needs of modern congregations. Digital funeral welfare software helps churches:
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
                                    'Track member contributions accurately',
                                    'Process funeral claims faster',
                                    'Generate financial reports instantly',
                                    'Improve transparency and accountability',
                                    'Reduce administrative burden',
                                    'Scale operations as membership grows'
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
                            Essential Features for Church Welfare Software
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {[
                                {
                                    feature: 'Member Management',
                                    importance: 'Critical',
                                    desc: 'Maintain detailed member records with beneficiary information, contact details, and contribution history'
                                },
                                {
                                    feature: 'Contribution Tracking',
                                    importance: 'Critical',
                                    desc: 'Automatically record and track monthly contributions with receipt generation and balance tracking'
                                },
                                {
                                    feature: 'Claims Processing',
                                    importance: 'Critical',
                                    desc: 'Streamline funeral assistance requests with approval workflows and verification systems'
                                },
                                {
                                    feature: 'SMS Notifications',
                                    importance: 'High',
                                    desc: 'Send payment reminders, contribution confirmations, and bereavement notifications automatically'
                                },
                                {
                                    feature: 'Financial Reports',
                                    importance: 'High',
                                    desc: 'Generate instant reports on fund health, contributions, claims, and member participation'
                                },
                                {
                                    feature: 'Mobile Access',
                                    importance: 'High',
                                    desc: 'Access the system from smartphones and tablets for on-the-go management'
                                },
                                {
                                    feature: 'Multi-User Access',
                                    importance: 'Medium',
                                    desc: 'Allow multiple committee members to work simultaneously with role-based permissions'
                                },
                                {
                                    feature: 'Data Security',
                                    importance: 'Critical',
                                    desc: 'Protect sensitive member and financial data with encryption and secure access controls'
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

                    {/* Comparison Table */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            Top Church Welfare Software Options
                        </h2>

                        <div style={{
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #E3DDD0',
                            overflow: 'auto',
                            marginBottom: '2rem'
                        }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.95rem'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: '#3D4F47',
                                        color: '#FAF8F4'
                                    }}>
                                        <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 600 }}>Software</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 600 }}>Member Limit</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 600 }}>Mobile App</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 600 }}>SMS</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 600 }}>Support</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            name: 'RestPoint',
                                            members: 'Unlimited',
                                            mobile: true,
                                            sms: true,
                                            support: '24/7',
                                            recommended: true
                                        },
                                        {
                                            name: 'Excel/Sheets',
                                            members: '~200',
                                            mobile: false,
                                            sms: false,
                                            support: 'None',
                                            recommended: false
                                        },
                                        {
                                            name: 'Generic Accounting',
                                            members: 'Varies',
                                            mobile: 'partial',
                                            sms: false,
                                            support: 'Business hours',
                                            recommended: false
                                        }
                                    ].map((software, idx) => (
                                        <tr key={idx} style={{
                                            background: software.recommended ? '#F3EFE6' : (idx % 2 === 0 ? '#FAF8F4' : 'white'),
                                            borderBottom: '1px solid #E3DDD0'
                                        }}>
                                            <td style={{ padding: '1rem', fontWeight: 600, color: '#15171A' }}>
                                                {software.name}
                                                {software.recommended && <span style={{
                                                    marginLeft: '0.5rem',
                                                    fontSize: '0.75rem',
                                                    background: '#3D4F47',
                                                    color: '#FAF8F4',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px'
                                                }}>RECOMMENDED</span>}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: '#6B6862' }}>{software.members}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {software.mobile === true && <Check size={18} color="#3D4F47" style={{ margin: '0 auto' }} />}
                                                {software.mobile === 'partial' && <span style={{ color: '#8B7355', fontSize: '0.85rem' }}>Partial</span>}
                                                {software.mobile === false && <span style={{ color: '#C77B5E', fontSize: '0.85rem' }}>No</span>}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {software.sms === true && <Check size={18} color="#3D4F47" style={{ margin: '0 auto' }} />}
                                                {software.sms === false && <span style={{ color: '#C77B5E', fontSize: '0.85rem' }}>No</span>}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: '#6B6862' }}>{software.support}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                            Why Kenyan Churches Choose RestPoint
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
                                        title: 'Built for Kenya',
                                        desc: 'Designed specifically for Kenyan churches with M-Pesa integration, local payment methods, and understanding of local welfare program structures'
                                    },
                                    {
                                        title: 'Proven Track Record',
                                        desc: 'Trusted by 500+ churches across Kenya managing thousands of members in their funeral welfare programs'
                                    },
                                    {
                                        title: 'Affordable Pricing',
                                        desc: 'Transparent pricing starting from KES 2,500/month with no hidden fees. Includes all features and unlimited members'
                                    },
                                    {
                                        title: 'Local Support',
                                        desc: 'Kenyan-based support team that understands your context. Available via phone, WhatsApp, and email'
                                    },
                                    {
                                        title: 'Quick Setup',
                                        desc: 'Get started in under 2 hours. Import existing member data and start managing contributions digitally immediately'
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
                            Ready to Transform Your Church Welfare Program?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join leading churches across Kenya using RestPoint to manage funeral welfare more effectively.
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

export default BestChurchSoftwareKenya;