import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Building, CheckCircle } from 'lucide-react';

const NairobiFuneralWelfare = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Funeral Welfare Management in Nairobi | RestPoint</title>
                <meta name="description" content="Leading funeral welfare management software for Nairobi churches, SACCOs, and chamas. Streamline member contributions, claims processing, and fund management." />
                <link rel="canonical" href="https://restpoint.co.ke/locations/nairobi" />
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
                            Nairobi
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Funeral Welfare Management in Nairobi
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            Trusted by Nairobi's leading churches, SACCOs, and community organizations. Manage funeral welfare programs with Kenya's most comprehensive digital platform.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            fontSize: '0.85rem',
                            opacity: 0.8
                        }}>
                            <span>8 min read</span>
                            <span>Updated January 2026</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Stats Section */}
                    <section style={{ marginBottom: '4rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {[
                                { icon: Users, number: '150+', label: 'Nairobi Organizations' },
                                { icon: Building, number: '25K+', label: 'Members Managed' },
                                { icon: CheckCircle, number: '5K+', label: 'Claims Processed' },
                                { icon: MapPin, number: 'KES 50M+', label: 'Benefits Disbursed' }
                            ].map((stat, idx) => {
                                const IconComponent = stat.icon;
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
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem'
                                        }}>
                                            <IconComponent size={24} />
                                        </div>
                                        <div style={{
                                            fontSize: '2rem',
                                            fontWeight: 700,
                                            color: '#3D4F47',
                                            marginBottom: '0.5rem',
                                            fontFamily: "'Fraunces', serif"
                                        }}>{stat.number}</div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: '#6B6862'
                                        }}>{stat.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Why Nairobi Organizations Choose RestPoint */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem'
                        }}>
                            Why Nairobi Organizations Choose RestPoint
                        </h2>

                        <div style={{
                            background: 'white',
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
                                        title: 'M-Pesa Integration',
                                        desc: 'Seamless M-Pesa integration for collecting contributions and disbursing benefits. Nairobi organizations can process payments instantly with the mobile money platform Kenyans trust.'
                                    },
                                    {
                                        title: 'Multi-Branch Support',
                                        desc: 'Manage multiple church locations or SACCO branches across Nairobi from a single dashboard. Perfect for organizations with congregations in Westlands, Karen, CBD, and beyond.'
                                    },
                                    {
                                        title: 'SMS Notifications',
                                        desc: 'Send automated SMS reminders for contributions, confirmations for payments, and notifications for bereavement. Keep members informed across all Nairobi neighborhoods.'
                                    },
                                    {
                                        title: 'Local Support Team',
                                        desc: 'Our Nairobi-based support team understands the unique needs of Kenyan organizations. Get help via phone, WhatsApp, or in-person visits when needed.'
                                    },
                                    {
                                        title: 'Compliance Ready',
                                        desc: 'Built to comply with Kenyan regulations for welfare organizations. Generate audit-ready reports for the Registrar of Societies and other regulatory bodies.'
                                    }
                                ].map((reason, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        alignItems: 'flex-start',
                                        paddingBottom: '1.5rem',
                                        borderBottom: idx < 4 ? '1px solid #F3EFE6' : 'none'
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
                                            flexShrink: 0,
                                            fontWeight: 700
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 style={{
                                                fontSize: '1.1rem',
                                                color: '#15171A',
                                                marginBottom: '0.5rem'
                                            }}>{reason.title}</h4>
                                            <p style={{
                                                fontSize: '0.95rem',
                                                color: '#6B6862',
                                                lineHeight: 1.7,
                                                margin: 0
                                            }}>{reason.desc}</p>
                                        </div>
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
                            Perfect for Nairobi Organizations
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {[
                                {
                                    type: 'Churches',
                                    desc: 'From small congregations to large ministries with multiple locations across Nairobi',
                                    examples: 'Nairobi Baptist Church, St. Stephen\'s, JCC'
                                },
                                {
                                    type: 'SACCOs',
                                    desc: 'Manage member welfare benefits alongside savings and loan services',
                                    examples: 'Mwalimu Cooperative, Harambee SACCO'
                                },
                                {
                                    type: 'Chamas',
                                    desc: 'Streamline merry-go-round contributions and benefit disbursements',
                                    examples: 'Women groups, youth chamas, family welfare groups'
                                },
                                {
                                    type: 'Employers',
                                    desc: 'Provide funeral cover as an employee benefit with automated management',
                                    examples: 'NGOs, corporate organizations, government agencies'
                                }
                            ].map((useCase, idx) => (
                                <div key={idx} style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid #E3DDD0'
                                }}>
                                    <h4 style={{
                                        fontSize: '1.1rem',
                                        color: '#3D4F47',
                                        marginBottom: '0.8rem',
                                        fontFamily: "'Fraunces', serif"
                                    }}>{useCase.type}</h4>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: '#6B6862',
                                        lineHeight: 1.6,
                                        marginBottom: '1rem'
                                    }}>{useCase.desc}</p>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: '#8B7355',
                                        fontStyle: 'italic'
                                    }}>
                                        Examples: {useCase.examples}
                                    </div>
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
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            marginBottom: '1rem'
                        }}>
                            Join Nairobi's Leading Organizations
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Start managing your funeral welfare program digitally. Get started in under 2 hours with free onboarding support.
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
                            <MapPin size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default NairobiFuneralWelfare;