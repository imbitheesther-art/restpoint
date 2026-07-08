import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Users, Shield, TrendingUp } from 'lucide-react';

const MemberContributionsGuide = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Member Contribution Management for Funeral Welfare | RestPoint</title>
                <meta name="description" content="Learn how to effectively manage member contributions for funeral welfare programs. Best practices for churches, SACCOs, and chamas to track and optimize welfare fund collections." />
                <link rel="canonical" href="https://restpoint.co.ke/blog/member-contributions" />
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
                            Contribution Management
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Member Contribution Management for Funeral Welfare Programs
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            A comprehensive guide to collecting, tracking, and managing member contributions for churches, SACCOs, and chamas. Learn best practices for sustainable welfare fund management.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            fontSize: '0.85rem',
                            opacity: 0.8
                        }}>
                            <span>📅 10 min read</span>
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
                            Why Member Contributions Matter
                        </h2>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '1.5rem'
                        }}>
                            Consistent member contributions are the lifeblood of any funeral welfare program. When members contribute regularly, the fund remains sustainable and capable of providing meaningful support when families need it most. Effective contribution management ensures transparency, builds trust, and strengthens community bonds.
                        </p>

                        <div style={{
                            background: 'linear-gradient(135deg, #F3EFE6 0%, #FAF8F4 100%)',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                color: '#15171A',
                                marginBottom: '1rem'
                            }}>
                                Typical Contribution Amounts in Kenya
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                            }}>
                                {[
                                    { type: 'Chamas', range: 'KES 200 - 500/month', note: 'Per member' },
                                    { type: 'Small Churches', range: 'KES 300 - 700/month', note: 'Per family' },
                                    { type: 'Medium Churches', range: 'KES 500 - 1,000/month', note: 'Per family' },
                                    { type: 'SACCOs', range: 'KES 500 - 2,000/month', note: 'Per member' },
                                    { type: 'Large Organizations', range: 'KES 1,000 - 5,000/month', note: 'Per member' }
                                ].map((item, idx) => (
                                    <div key={idx} style={{
                                        background: 'white',
                                        padding: '1rem',
                                        borderRadius: '6px',
                                        border: '1px solid #E3DDD0'
                                    }}>
                                        <div style={{
                                            fontSize: '0.85rem',
                                            color: '#3D4F47',
                                            fontWeight: 600,
                                            marginBottom: '0.3rem'
                                        }}>{item.type}</div>
                                        <div style={{
                                            fontSize: '1.1rem',
                                            color: '#15171A',
                                            fontWeight: 700,
                                            marginBottom: '0.2rem'
                                        }}>{item.range}</div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: '#6B6862'
                                        }}>{item.note}</div>
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
                            Setting Up a Contribution System
                        </h2>

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
                                marginBottom: '1.5rem'
                            }}>
                                Essential Components
                            </h3>

                            <div style={{
                                display: 'grid',
                                gap: '1.5rem'
                            }}>
                                {[
                                    {
                                        title: 'Clear Contribution Policy',
                                        items: [
                                            'Define monthly contribution amount',
                                            'Set payment due dates and grace periods',
                                            'Establish penalties for late payments (if applicable)',
                                            'Document acceptable payment methods'
                                        ]
                                    },
                                    {
                                        title: 'Member Registration',
                                        items: [
                                            'Collect complete member information',
                                            'Record beneficiary details',
                                            'Capture contact information',
                                            'Assign unique member ID'
                                        ]
                                    },
                                    {
                                        title: 'Payment Tracking',
                                        items: [
                                            'Record each contribution with date and amount',
                                            'Maintain running balance for each member',
                                            'Generate receipts for all payments',
                                            'Track payment methods (cash, M-Pesa, bank transfer)'
                                        ]
                                    },
                                    {
                                        title: 'Reporting System',
                                        items: [
                                            'Monthly contribution summaries',
                                            'Defaulters list with outstanding amounts',
                                            'Total fund balance and growth',
                                            'Member participation rates'
                                        ]
                                    }
                                ].map((component, idx) => (
                                    <div key={idx} style={{
                                        padding: '1.5rem',
                                        background: '#FAF8F4',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #3D4F47'
                                    }}>
                                        <h4 style={{
                                            fontSize: '1.1rem',
                                            color: '#15171A',
                                            marginBottom: '0.8rem'
                                        }}>{component.title}</h4>
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0
                                        }}>
                                            {component.items.map((item, itemIdx) => (
                                                <li key={itemIdx} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.6rem',
                                                    padding: '0.4rem 0',
                                                    color: '#6B6862',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    <span style={{ color: '#3D4F47' }}>•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
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
                            Common Contribution Management Challenges
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {[
                                {
                                    icon: '💰',
                                    title: 'Cash Handling Issues',
                                    desc: 'Physical cash collections are prone to loss, theft, and counting errors. Lack of transparency can lead to mistrust among members.'
                                },
                                {
                                    icon: '📝',
                                    title: 'Manual Record Keeping',
                                    desc: 'Paper-based systems make it difficult to track who has paid, generate receipts, and maintain accurate financial records.'
                                },
                                {
                                    icon: '⏰',
                                    title: 'Late Payments',
                                    desc: 'Without automated reminders and tracking, members forget payment dates, leading to inconsistent fund flow.'
                                },
                                {
                                    icon: '📊',
                                    title: 'No Real-Time Visibility',
                                    desc: 'Committee members cannot access up-to-date contribution data, making planning and decision-making difficult.'
                                },
                                {
                                    icon: '👥',
                                    title: 'Member Defaulters',
                                    desc: 'Identifying and managing defaulters manually is time-consuming and often leads to confrontations.'
                                },
                                {
                                    icon: '🔍',
                                    title: 'Audit Difficulties',
                                    desc: 'Reconciling contributions with expenses manually is error-prone and time-intensive during audits.'
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
                            Best Practices for Contribution Management
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
                                marginBottom: '1.5rem'
                            }}>
                                For Welfare Committee Members
                            </h3>

                            <div style={{
                                display: 'grid',
                                gap: '1.5rem'
                            }}>
                                {[
                                    {
                                        title: 'Communicate Clearly',
                                        desc: 'Ensure all members understand contribution amounts, due dates, and payment methods. Post this information prominently and share it regularly.'
                                    },
                                    {
                                        title: 'Automate Reminders',
                                        desc: 'Send payment reminders via SMS or WhatsApp 3 days before the due date and follow up with defaulters within 48 hours.'
                                    },
                                    {
                                        title: 'Offer Multiple Payment Options',
                                        desc: 'Accept M-Pesa, bank transfers, and cash. Provide clear instructions for each method with account details.'
                                    },
                                    {
                                        title: 'Provide Instant Receipts',
                                        desc: 'Issue receipts immediately after payment. Digital receipts are easier to track and harder to lose.'
                                    },
                                    {
                                        title: 'Publish Transparency Reports',
                                        desc: 'Share monthly contribution summaries with members. Show total collected, expenses, and current fund balance.'
                                    },
                                    {
                                        title: 'Celebrate Milestones',
                                        desc: 'Recognize consistent contributors and celebrate when the fund reaches significant milestones. This builds engagement.'
                                    }
                                ].map((practice, idx) => (
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
                                                fontSize: '1.05rem',
                                                color: '#15171A',
                                                marginBottom: '0.3rem'
                                            }}>{practice.title}</h4>
                                            <p style={{
                                                fontSize: '0.95rem',
                                                color: '#6B6862',
                                                margin: 0,
                                                lineHeight: 1.6
                                            }}>{practice.desc}</p>
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
                            Digital vs Manual Contribution Management
                        </h2>

                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem',
                            overflow: 'auto'
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
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Aspect</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Manual System</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Digital System</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            aspect: 'Payment Recording',
                                            manual: 'Paper receipts, ledgers',
                                            digital: 'Automated digital records'
                                        },
                                        {
                                            aspect: 'Member Tracking',
                                            manual: 'Manual spreadsheets',
                                            digital: 'Real-time dashboards'
                                        },
                                        {
                                            aspect: 'Receipt Generation',
                                            manual: 'Handwritten or printed',
                                            digital: 'Instant SMS/email receipts'
                                        },
                                        {
                                            aspect: 'Defaulters Management',
                                            manual: 'Manual follow-up calls',
                                            digital: 'Automated reminders'
                                        },
                                        {
                                            aspect: 'Reporting',
                                            manual: 'Hours of manual work',
                                            digital: 'One-click reports'
                                        },
                                        {
                                            aspect: 'Data Security',
                                            manual: 'Physical storage risks',
                                            digital: 'Encrypted cloud storage'
                                        },
                                        {
                                            aspect: 'Scalability',
                                            manual: 'Limited to ~200 members',
                                            digital: 'Unlimited members'
                                        }
                                    ].map((row, idx) => (
                                        <tr key={idx} style={{
                                            background: idx % 2 === 0 ? '#FAF8F4' : 'white',
                                            borderBottom: '1px solid #E3DDD0'
                                        }}>
                                            <td style={{ padding: '1rem', fontWeight: 600, color: '#15171A' }}>{row.aspect}</td>
                                            <td style={{ padding: '1rem', color: '#6B6862' }}>{row.manual}</td>
                                            <td style={{ padding: '1rem', color: '#3D4F47', fontWeight: 500 }}>{row.digital}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '1.5rem'
                        }}>
                            Maximizing Member Participation
                        </h2>

                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.8,
                            color: '#6B6862',
                            marginBottom: '2rem'
                        }}>
                            High participation rates are critical for a sustainable welfare fund. Here are strategies to encourage consistent contributions:
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {[
                                {
                                    icon: '📱',
                                    title: 'Mobile Money Integration',
                                    desc: 'Enable M-Pesa payments directly through the system. Members can contribute with one click from their phones.'
                                },
                                {
                                    icon: '📊',
                                    title: 'Transparent Reporting',
                                    desc: 'Show members exactly how their contributions are used. Publish quarterly financial reports.'
                                },
                                {
                                    icon: '🎯',
                                    title: 'Clear Benefits',
                                    desc: 'Regularly remind members of the benefits they receive. Share success stories of families who received support.'
                                },
                                {
                                    icon: '🏆',
                                    title: 'Recognition Programs',
                                    desc: 'Acknowledge consistent contributors publicly. Create tiers or badges for different participation levels.'
                                },
                                {
                                    icon: '💬',
                                    title: 'Regular Communication',
                                    desc: 'Send monthly updates about fund status, upcoming events, and reminders. Keep the community engaged.'
                                },
                                {
                                    icon: '📈',
                                    title: 'Show Impact',
                                    desc: 'Track and share metrics like total families helped, average claim processing time, and fund growth.'
                                }
                            ].map((strategy, idx) => (
                                <div key={idx} style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E3DDD0'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{strategy.icon}</div>
                                    <h4 style={{
                                        fontSize: '1.05rem',
                                        color: '#15171A',
                                        marginBottom: '0.5rem'
                                    }}>{strategy.title}</h4>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: '#6B6862',
                                        lineHeight: 1.6,
                                        margin: 0
                                    }}>{strategy.desc}</p>
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
                            Streamline Your Contribution Management
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join churches, SACCOs, and chamas across Kenya using RestPoint to automate member contributions and improve welfare fund management.
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
                            Get Started Today
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default MemberContributionsGuide;