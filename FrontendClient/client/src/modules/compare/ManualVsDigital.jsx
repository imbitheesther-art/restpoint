import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, X, Clock, Users, DollarSign, Shield } from 'lucide-react';

const ManualVsDigital = () => {
    const navigate = useNavigate();

    const comparisons = [
        {
            category: 'Member Management',
            manual: 'Paper files, spreadsheets, physical records',
            digital: 'Digital profiles with search, filter, and auto-complete',
            advantage: 'digital'
        },
        {
            category: 'Contribution Tracking',
            manual: 'Manual receipt books, Excel sheets, monthly reconciliation',
            digital: 'Automated M-Pesa integration, real-time tracking, instant receipts',
            advantage: 'digital'
        },
        {
            category: 'Claims Processing',
            manual: 'Paper forms, committee meetings, 2-4 weeks processing',
            digital: 'Online submissions, digital approvals, 24-48 hour processing',
            advantage: 'digital'
        },
        {
            category: 'Financial Reporting',
            manual: 'Manual calculations, Excel reports, hours of work',
            digital: 'One-click reports, real-time dashboards, instant insights',
            advantage: 'digital'
        },
        {
            category: 'Communication',
            manual: 'Phone calls, SMS individually, church announcements',
            digital: 'Bulk SMS, automated reminders, multi-channel notifications',
            advantage: 'digital'
        },
        {
            category: 'Data Security',
            manual: 'Physical filing cabinet, risk of loss/damage',
            digital: 'Encrypted cloud storage, automated backups, access controls',
            advantage: 'digital'
        },
        {
            category: 'Scalability',
            manual: 'Limited by physical space and manual capacity',
            digital: 'Unlimited members, branches, and locations',
            advantage: 'digital'
        },
        {
            category: 'Cost',
            manual: 'Paper, printing, storage, staff time (KES 5,000-15,000/month)',
            digital: 'Software subscription (from KES 2,500/month), less staff time',
            advantage: 'digital'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Manual vs Digital Funeral Welfare Management | RestPoint</title>
                <meta name="description" content="Compare manual vs digital funeral welfare management. Discover why Kenyan churches and SACCOs are switching to digital systems for better efficiency and transparency." />
                <link rel="canonical" href="https://restpoint.co.ke/compare/manual-vs-digital" />
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
                            Comparison Guide
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Manual vs Digital Funeral Welfare Management
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            An honest comparison of traditional manual methods versus modern digital systems for managing funeral welfare programs in Kenya.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            fontSize: '0.85rem',
                            opacity: 0.8
                        }}>
                            <span>10 min read</span>
                            <span>Updated January 2026</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Introduction */}
                    <section style={{ marginBottom: '4rem' }}>
                        <div style={{
                            background: 'white',
                            padding: '2.5rem',
                            borderRadius: '12px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <h2 style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: '2rem',
                                color: '#15171A',
                                marginBottom: '1.5rem'
                            }}>
                                The Digital Transformation of Funeral Welfare
                            </h2>
                            <p style={{
                                fontSize: '1.05rem',
                                lineHeight: 1.8,
                                color: '#6B6862',
                                marginBottom: '1.5rem'
                            }}>
                                For decades, Kenyan churches, SACCOs, and chamas have managed funeral welfare programs using paper records, Excel spreadsheets, and manual processes. While these methods have served their purpose, the digital revolution is transforming how organizations manage member contributions, process claims, and maintain transparency.
                            </p>
                            <p style={{
                                fontSize: '1.05rem',
                                lineHeight: 1.8,
                                color: '#6B6862'
                            }}>
                                This comprehensive comparison will help you understand the differences between manual and digital funeral welfare management, and why over 500 Kenyan organizations have made the switch to digital systems like RestPoint.
                            </p>
                        </div>
                    </section>

                    {/* Comparison Table */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            Side-by-Side Comparison
                        </h2>

                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
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
                                        <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 600, width: '20%' }}>Aspect</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 600, width: '40%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <X size={18} />
                                                Manual Method
                                            </div>
                                        </th>
                                        <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 600, width: '40%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Check size={18} />
                                                Digital System
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisons.map((item, idx) => (
                                        <tr key={idx} style={{
                                            background: idx % 2 === 0 ? '#FAF8F4' : 'white',
                                            borderBottom: '1px solid #E3DDD0'
                                        }}>
                                            <td style={{ padding: '1.2rem', fontWeight: 600, color: '#15171A' }}>{item.category}</td>
                                            <td style={{ padding: '1.2rem', color: '#6B6862' }}>{item.manual}</td>
                                            <td style={{ padding: '1.2rem', color: '#3D4F47', fontWeight: 500 }}>{item.digital}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Key Benefits */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            Why Organizations Switch to Digital
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {[
                                {
                                    icon: Clock,
                                    title: 'Save 15+ Hours Weekly',
                                    desc: 'Automate contribution tracking, receipt generation, and report preparation. Focus on members, not paperwork.'
                                },
                                {
                                    icon: DollarSign,
                                    title: 'Reduce Operational Costs',
                                    desc: 'Eliminate paper, printing, and storage costs. Digital systems cost less than manual operations over time.'
                                },
                                {
                                    icon: Shield,
                                    title: 'Improve Transparency',
                                    desc: 'Members can view their contribution history online. Build trust with real-time financial visibility.'
                                },
                                {
                                    icon: Users,
                                    title: 'Scale Without Limits',
                                    desc: 'Manage 50 or 5,000 members with the same ease. Digital systems grow with your organization.'
                                }
                            ].map((benefit, idx) => {
                                const IconComponent = benefit.icon;
                                return (
                                    <div key={idx} style={{
                                        background: 'white',
                                        padding: '2rem',
                                        borderRadius: '12px',
                                        border: '1px solid #E3DDD0',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                                            color: '#FAF8F4',
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem'
                                        }}>
                                            <IconComponent size={28} />
                                        </div>
                                        <h4 style={{
                                            fontSize: '1.15rem',
                                            color: '#15171A',
                                            marginBottom: '0.8rem'
                                        }}>{benefit.title}</h4>
                                        <p style={{
                                            fontSize: '0.95rem',
                                            color: '#6B6862',
                                            lineHeight: 1.6,
                                            margin: 0
                                        }}>{benefit.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Real-World Impact */}
                    <section style={{ marginBottom: '4rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                            color: '#FAF8F4',
                            padding: '3rem',
                            borderRadius: '12px'
                        }}>
                            <h2 style={{
                                fontFamily: "'Fraunces', serif",
                                fontSize: '2rem',
                                marginBottom: '2rem',
                                textAlign: 'center'
                            }}>
                                Real Impact: Before vs After Digital
                            </h2>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '2rem'
                            }}>
                                {[
                                    { metric: 'Claims Processing', before: '2-4 weeks', after: '24-48 hours', improvement: '75% faster' },
                                    { metric: 'Member Registration', before: '1-2 hours', after: '15 minutes', improvement: '87% faster' },
                                    { metric: 'Financial Reports', before: '1-2 days', after: '1 click', improvement: '95% faster' },
                                    { metric: 'Error Rate', before: '15-20%', after: '< 2%', improvement: '90% reduction' }
                                ].map((stat, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(250,248,244,0.1)',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <h4 style={{
                                            fontSize: '1rem',
                                            color: '#EBEFEF',
                                            marginBottom: '1rem',
                                            opacity: 0.9
                                        }}>{stat.metric}</h4>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '0.8rem',
                                            fontSize: '0.9rem'
                                        }}>
                                            <span style={{ opacity: 0.7 }}>Before</span>
                                            <span style={{ fontWeight: 600 }}>{stat.before}</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1rem',
                                            fontSize: '0.9rem'
                                        }}>
                                            <span style={{ opacity: 0.9 }}>After</span>
                                            <span style={{ fontWeight: 700, color: '#FAF8F4' }}>{stat.after}</span>
                                        </div>
                                        <div style={{
                                            background: 'rgba(250,248,244,0.2)',
                                            padding: '0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600
                                        }}>
                                            {stat.improvement}
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
                            Ready to Go Digital?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join 500+ Kenyan organizations that have transformed their funeral welfare management with RestPoint. Start your free trial today.
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

export default ManualVsDigital;