import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, X, TrendingUp, Shield, Zap } from 'lucide-react';

const RestPointVsExcel = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>RestPoint vs Excel for Funeral Welfare Management | RestPoint</title>
                <meta name="description" content="Compare RestPoint funeral welfare management software with Excel spreadsheets. Discover why organizations are switching from manual spreadsheets to digital solutions." />
                <link rel="canonical" href="https://restpoint.co.ke/compare/restpoint-vs-excel" />
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
                            Software Comparison
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            RestPoint vs Excel: Funeral Welfare Management Compared
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            Why thousands of churches, SACCOs, and chamas are switching from Excel spreadsheets to dedicated funeral welfare management software.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            fontSize: '0.85rem',
                            opacity: 0.8
                        }}>
                            <span>📅 8 min read</span>
                            <span>📅 Updated January 2026</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Quick Comparison Table */}
                    <div style={{
                        background: 'white',
                        padding: '2.5rem',
                        borderRadius: '12px',
                        border: '1px solid #E3DDD0',
                        marginBottom: '3rem'
                    }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            At a Glance: RestPoint vs Excel
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '2rem'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                                color: '#FAF8F4',
                                padding: '2rem',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: '1.5rem',
                                    marginBottom: '1rem'
                                }}>RestPoint</h3>
                                <p style={{
                                    fontSize: '0.95rem',
                                    opacity: 0.9,
                                    marginBottom: '1.5rem'
                                }}>Dedicated Funeral Welfare Software</p>
                                <div style={{
                                    display: 'inline-block',
                                    background: 'rgba(250,248,244,0.2)',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>Recommended</div>
                            </div>

                            <div style={{
                                background: '#FAF8F4',
                                padding: '2rem',
                                borderRadius: '8px',
                                textAlign: 'center',
                                border: '2px solid #E3DDD0'
                            }}>
                                <h3 style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: '1.5rem',
                                    color: '#15171A',
                                    marginBottom: '1rem'
                                }}>Excel</h3>
                                <p style={{
                                    fontSize: '0.95rem',
                                    color: '#6B6862',
                                    marginBottom: '1.5rem'
                                }}>Spreadsheet Software</p>
                                <div style={{
                                    display: 'inline-block',
                                    background: '#E3DDD0',
                                    color: '#6B6862',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>Basic Solution</div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Comparison */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            Detailed Feature Comparison
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
                                        <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 600 }}>Feature</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 600 }}>RestPoint</th>
                                        <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 600 }}>Excel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            feature: 'Member Management',
                                            restpoint: true,
                                            excel: 'partial',
                                            note: 'Excel requires manual setup'
                                        },
                                        {
                                            feature: 'Contribution Tracking',
                                            restpoint: true,
                                            excel: 'partial',
                                            note: 'Excel prone to errors'
                                        },
                                        {
                                            feature: 'Automated Receipts',
                                            restpoint: true,
                                            excel: false,
                                            note: 'Excel requires manual receipts'
                                        },
                                        {
                                            feature: 'SMS Reminders',
                                            restpoint: true,
                                            excel: false,
                                            note: 'Not available in Excel'
                                        },
                                        {
                                            feature: 'Mobile Access',
                                            restpoint: true,
                                            excel: false,
                                            note: 'Limited mobile Excel apps'
                                        },
                                        {
                                            feature: 'Multi-User Access',
                                            restpoint: true,
                                            excel: 'partial',
                                            note: 'Excel requires file sharing'
                                        },
                                        {
                                            feature: 'Real-time Reports',
                                            restpoint: true,
                                            excel: false,
                                            note: 'Excel requires manual updates'
                                        },
                                        {
                                            feature: 'Claims Processing',
                                            restpoint: true,
                                            excel: 'partial',
                                            note: 'Excel requires custom setup'
                                        },
                                        {
                                            feature: 'Beneficiary Management',
                                            restpoint: true,
                                            excel: 'partial',
                                            note: 'Excel requires manual tracking'
                                        },
                                        {
                                            feature: 'Audit Trail',
                                            restpoint: true,
                                            excel: 'partial',
                                            note: 'Excel has limited tracking'
                                        },
                                        {
                                            feature: 'Data Security',
                                            restpoint: true,
                                            excel: 'partial',
                                            note: 'Excel files easily lost'
                                        },
                                        {
                                            feature: 'Scalability',
                                            restpoint: 'unlimited',
                                            excel: 'limited',
                                            note: 'Excel slows with 500+ rows'
                                        },
                                        {
                                            feature: 'Backup & Recovery',
                                            restpoint: true,
                                            excel: 'partial',
                                            note: 'Excel requires manual backups'
                                        },
                                        {
                                            feature: 'Support & Training',
                                            restpoint: true,
                                            excel: false,
                                            note: 'No dedicated support'
                                        }
                                    ].map((row, idx) => (
                                        <tr key={idx} style={{
                                            background: idx % 2 === 0 ? '#FAF8F4' : 'white',
                                            borderBottom: '1px solid #E3DDD0'
                                        }}>
                                            <td style={{ padding: '1rem', fontWeight: 600, color: '#15171A' }}>{row.feature}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {row.restpoint === true && <Check size={20} color="#3D4F47" style={{ margin: '0 auto' }} />}
                                                {row.restpoint === 'partial' && <span style={{ color: '#8B7355', fontSize: '0.85rem' }}>Partial</span>}
                                                {row.restpoint === 'unlimited' && <span style={{ color: '#3D4F47', fontWeight: 600 }}>Unlimited</span>}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                {row.excel === true && <Check size={20} color="#3D4F47" style={{ margin: '0 auto' }} />}
                                                {row.excel === 'partial' && <span style={{ color: '#8B7355', fontSize: '0.85rem' }}>Partial</span>}
                                                {row.excel === 'limited' && <span style={{ color: '#C77B5E', fontSize: '0.85rem' }}>Limited</span>}
                                                {row.excel === false && <X size={20} color="#C77B5E" style={{ margin: '0 auto' }} />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Key Differences */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            Why Organizations Switch from Excel to RestPoint
                        </h2>

                        <div style={{
                            display: 'grid',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {[
                                {
                                    icon: '⏱️',
                                    title: 'Save 10+ Hours Per Week',
                                    desc: 'Automate contribution tracking, receipt generation, and reporting. What takes hours in Excel takes minutes in RestPoint.'
                                },
                                {
                                    icon: '🔒',
                                    title: 'Enterprise-Grade Security',
                                    desc: 'RestPoint uses bank-level encryption and automated backups. Excel files stored on local computers are vulnerable to loss, theft, and corruption.'
                                },
                                {
                                    icon: '📱',
                                    title: 'Access Anywhere, Anytime',
                                    desc: 'RestPoint works on phones, tablets, and computers. Excel requires specific software and file transfers between devices.'
                                },
                                {
                                    icon: '👥',
                                    title: 'Team Collaboration',
                                    desc: 'Multiple committee members can work simultaneously in RestPoint. Excel requires emailing files back and forth, creating version control issues.'
                                },
                                {
                                    icon: '📊',
                                    title: 'Real-Time Insights',
                                    desc: 'RestPoint dashboards show fund health, contribution trends, and claims status instantly. Excel reports require manual data compilation.'
                                },
                                {
                                    icon: '💬',
                                    title: 'Automated Communication',
                                    desc: 'Send SMS reminders, payment confirmations, and notifications automatically. Excel requires manual communication for every interaction.'
                                }
                            ].map((benefit, idx) => (
                                <div key={idx} style={{
                                    background: 'white',
                                    padding: '2rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E3DDD0',
                                    display: 'flex',
                                    gap: '1.5rem',
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                                        color: '#FAF8F4',
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        flexShrink: 0
                                    }}>
                                        {benefit.icon}
                                    </div>
                                    <div>
                                        <h3 style={{
                                            fontSize: '1.2rem',
                                            color: '#15171A',
                                            marginBottom: '0.5rem'
                                        }}>{benefit.title}</h3>
                                        <p style={{
                                            fontSize: '0.95rem',
                                            color: '#6B6862',
                                            lineHeight: 1.7,
                                            margin: 0
                                        }}>{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Real Costs */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            The Hidden Costs of Excel
                        </h2>

                        <div style={{
                            background: 'linear-gradient(135deg, #F3EFE6 0%, #FAF8F4 100%)',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <p style={{
                                fontSize: '1.05rem',
                                lineHeight: 1.8,
                                color: '#15171A',
                                marginBottom: '1.5rem'
                            }}>
                                While Excel appears free, the true cost includes:
                            </p>

                            <div style={{
                                display: 'grid',
                                gap: '1rem'
                            }}>
                                {[
                                    { item: 'Time spent on manual data entry', cost: '10+ hours/week' },
                                    { item: 'Errors and corrections', cost: '2-5 hours/week' },
                                    { item: 'File corruption or data loss', cost: 'Irreplaceable' },
                                    { item: 'Manual receipt printing', cost: 'KES 2,000-5,000/month' },
                                    { item: 'Multiple Excel licenses', cost: 'KES 5,000-10,000/month' },
                                    { item: 'Training new committee members', cost: '3-5 hours/person' }
                                ].map((item, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #E3DDD0'
                                    }}>
                                        <span style={{ color: '#15171A', fontSize: '0.95rem' }}>{item.item}</span>
                                        <span style={{ color: '#C77B5E', fontWeight: 600, fontSize: '0.9rem' }}>{item.cost}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Use Cases */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            When Excel Might Work (And When It Doesn't)
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            <div style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '8px',
                                border: '2px solid #3D4F47'
                            }}>
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    color: '#3D4F47',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Check size={20} /> Excel Might Work
                                </h3>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0
                                }}>
                                    {[
                                        'Under 50 active members',
                                        'Single person managing everything',
                                        'No need for mobile access',
                                        'Basic contribution tracking only',
                                        'No claims processing needed'
                                    ].map((item, idx) => (
                                        <li key={idx} style={{
                                            padding: '0.5rem 0',
                                            color: '#6B6862',
                                            fontSize: '0.95rem',
                                            borderBottom: idx < 4 ? '1px solid #F3EFE6' : 'none'
                                        }}>
                                            • {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '8px',
                                border: '2px solid #C77B5E'
                            }}>
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    color: '#C77B5E',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <TrendingUp size={20} /> Switch to RestPoint
                                </h3>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0
                                }}>
                                    {[
                                        '100+ active members',
                                        'Multiple committee members',
                                        'Need mobile access',
                                        'Claims processing required',
                                        'Want automated reminders',
                                        'Need professional reports'
                                    ].map((item, idx) => (
                                        <li key={idx} style={{
                                            padding: '0.5rem 0',
                                            color: '#6B6862',
                                            fontSize: '0.95rem',
                                            borderBottom: idx < 5 ? '1px solid #F3EFE6' : 'none'
                                        }}>
                                            • {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Migration Guide */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            Migrating from Excel to RestPoint
                        </h2>

                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            border: '1px solid #E3DDD0',
                            marginBottom: '2rem'
                        }}>
                            <p style={{
                                fontSize: '1.05rem',
                                lineHeight: 1.8,
                                color: '#6B6862',
                                marginBottom: '2rem'
                            }}>
                                Switching from Excel to RestPoint is straightforward. Most organizations complete the migration in under 2 hours:
                            </p>

                            <div style={{
                                display: 'grid',
                                gap: '1.5rem'
                            }}>
                                {[
                                    {
                                        step: '1',
                                        title: 'Export Your Excel Data',
                                        desc: 'Export member lists, contribution records, and beneficiary information from Excel to CSV format.'
                                    },
                                    {
                                        step: '2',
                                        title: 'Create Your RestPoint Account',
                                        desc: 'Sign up for a free trial and set up your organization profile in 5 minutes.'
                                    },
                                    {
                                        step: '3',
                                        title: 'Import Your Data',
                                        desc: 'Use RestPoint\'s import tool to upload your CSV files. The system automatically maps fields.'
                                    },
                                    {
                                        step: '4',
                                        title: 'Configure Settings',
                                        desc: 'Set contribution amounts, payment methods, and notification preferences.'
                                    },
                                    {
                                        step: '5',
                                        title: 'Train Your Team',
                                        desc: 'Our 30-minute video tutorial gets your committee up and running immediately.'
                                    },
                                    {
                                        step: '6',
                                        title: 'Go Live',
                                        desc: 'Start using RestPoint for new contributions while maintaining Excel for historical records.'
                                    }
                                ].map((step, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div style={{
                                            background: '#3D4F47',
                                            color: '#FAF8F4',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            flexShrink: 0
                                        }}>
                                            {step.step}
                                        </div>
                                        <div>
                                            <h4 style={{
                                                fontSize: '1.1rem',
                                                color: '#15171A',
                                                marginBottom: '0.3rem'
                                            }}>{step.title}</h4>
                                            <p style={{
                                                fontSize: '0.95rem',
                                                color: '#6B6862',
                                                margin: 0,
                                                lineHeight: 1.6
                                            }}>{step.desc}</p>
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
                            Ready to Upgrade from Excel?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join 500+ organizations that have already made the switch to RestPoint. Start your free trial today.
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

export default RestPointVsExcel;