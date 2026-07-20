import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Building2, CheckCircle } from '../../utils/icons/icons';

const LocationPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Funeral Welfare Management Software | RestPoint</title>
                <meta name="description" content="Leading funeral welfare management software for Kenyan churches, SACCOs, and chamas. Streamline member contributions, claims processing, and fund management." />
                <link rel="canonical" href="https://restpoint.co.ke/locations" />
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
                            Locations
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Funeral Welfare Management Across Kenya
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            RestPoint serves funeral welfare programs nationwide. Find resources and support for your city or region.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Locations Grid */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            Our Service Areas
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {[
                                {
                                    city: 'Nairobi',
                                    organizations: '150+',
                                    members: '25K+',
                                    desc: 'Leading funeral welfare management in Nairobi with M-Pesa integration and multi-branch support.'
                                },
                                {
                                    city: 'Mombasa',
                                    organizations: '45+',
                                    members: '8K+',
                                    desc: 'Supporting coastal Kenya SACCOs and churches with Swahili language support and local payment methods.'
                                },
                                {
                                    city: 'Kisumu',
                                    organizations: '35+',
                                    members: '6K+',
                                    desc: 'Serving Nyanza region with tailored solutions for chamas and community welfare groups.'
                                },
                                {
                                    city: 'Eldoret',
                                    organizations: '28+',
                                    members: '4.5K+',
                                    desc: 'Supporting Rift Valley SACCOs with multi-branch management and livestock payment integration.'
                                }
                            ].map((location, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate(`/locations/${location.city.toLowerCase()}`)}
                                    style={{
                                        background: 'white',
                                        padding: '2rem',
                                        borderRadius: '12px',
                                        border: '1px solid #E3DDD0',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{
                                        background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                                        color: '#FAF8F4',
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1rem'
                                    }}>
                                        <MapPin size={24} />
                                    </div>
                                    <h3 style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: '1.3rem',
                                        color: '#15171A',
                                        marginBottom: '0.5rem'
                                    }}>{location.city}</h3>
                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: '#6B6862',
                                        lineHeight: 1.6,
                                        marginBottom: '1rem'
                                    }}>{location.desc}</p>
                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        fontSize: '0.85rem',
                                        color: '#3D4F47',
                                        fontWeight: 600
                                    }}>
                                        <span>{location.organizations} organizations</span>
                                        <span>|</span>
                                        <span>{location.members} members</span>
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
                            Ready to Modernize Your Welfare Program?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join organizations across Kenya using RestPoint. Start your free trial today.
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
                            <MapPin size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default LocationPage;