import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight, Users, DollarSign, TrendingUp } from '../../utils/icons/icons';

const CalculatorsPage = () => {
    const navigate = useNavigate();

    const calculators = [
        {
            icon: Calculator,
            title: 'Funeral Contribution Calculator',
            description: 'Calculate optimal monthly contributions based on member count, expected benefits, and fund sustainability goals.',
            path: '/calculators/contribution',
            color: '#3D4F47'
        },
        {
            icon: DollarSign,
            title: 'Welfare Fund Calculator',
            description: 'Estimate total fund growth over time with different contribution amounts and member participation rates.',
            path: '/calculators/fund-growth',
            color: '#8B7355'
        },
        {
            icon: Users,
            title: 'Benefit Calculator',
            description: 'Determine fair benefit amounts for members based on contribution history and fund availability.',
            path: '/calculators/benefits',
            color: '#3D4F47'
        },
        {
            icon: TrendingUp,
            title: 'Premium Calculator',
            description: 'Calculate insurance premiums for group funeral cover and welfare benefit plans.',
            path: '/calculators/premiums',
            color: '#8B7355'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Funeral Welfare Calculators | RestPoint</title>
                <meta name="description" content="Free calculators for funeral welfare management. Calculate contributions, fund growth, benefits, and premiums for churches, SACCOs, and chamas." />
                <link rel="canonical" href="https://restpoint.co.ke/calculators" />
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
                            Free Tools
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Funeral Welfare Calculators
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            Free interactive tools to help churches, SACCOs, and chamas plan and optimize their funeral welfare programs.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Calculators Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2rem',
                        marginBottom: '4rem'
                    }}>
                        {calculators.map((calc, idx) => {
                            const IconComponent = calc.icon;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => navigate(calc.path)}
                                    style={{
                                        background: 'white',
                                        padding: '2rem',
                                        borderRadius: '12px',
                                        border: '1px solid #E3DDD0',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column'
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
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <IconComponent size={28} />
                                    </div>

                                    <h3 style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: '1.3rem',
                                        color: '#15171A',
                                        marginBottom: '0.8rem'
                                    }}>
                                        {calc.title}
                                    </h3>

                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: '#6B6862',
                                        lineHeight: 1.6,
                                        marginBottom: '1.5rem',
                                        flex: 1
                                    }}>
                                        {calc.description}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#3D4F47',
                                        fontSize: '0.9rem',
                                        fontWeight: 600
                                    }}>
                                        Use Calculator
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Benefits Section */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            Why Use Our Calculators?
                        </h2>

                        <div style={{
                            background: 'white',
                            padding: '2.5rem',
                            borderRadius: '12px',
                            border: '1px solid #E3DDD0'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '2rem'
                            }}>
                                {[
                                    {
                                        title: 'Accurate Planning',
                                        desc: 'Make informed decisions about contribution rates and benefit amounts based on real calculations.'
                                    },
                                    {
                                        title: 'Save Time',
                                        desc: 'Get instant results without manual calculations. Adjust variables and see outcomes immediately.'
                                    },
                                    {
                                        title: 'Free to Use',
                                        desc: 'All calculators are completely free. No registration or payment required.'
                                    },
                                    {
                                        title: 'Expert Insights',
                                        desc: 'Built with best practices from funeral welfare management experts across Kenya.'
                                    }
                                ].map((benefit, idx) => (
                                    <div key={idx} style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                                            color: '#FAF8F4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem',
                                            fontSize: '1.5rem',
                                            fontWeight: 700
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <h4 style={{
                                            fontSize: '1.1rem',
                                            color: '#15171A',
                                            marginBottom: '0.5rem'
                                        }}>{benefit.title}</h4>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#6B6862',
                                            lineHeight: 1.6,
                                            margin: 0
                                        }}>{benefit.desc}</p>
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
                            Need More Advanced Tools?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            RestPoint includes all these calculators and more, integrated directly into your welfare management dashboard.
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
                            Try RestPoint Free
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default CalculatorsPage;