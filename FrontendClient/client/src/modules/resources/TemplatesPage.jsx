import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, Users, ClipboardList, CheckCircle } from 'lucide-react';

const TemplatesPage = () => {
    const navigate = useNavigate();

    const templates = [
        {
            icon: FileText,
            title: 'Member Registration Form',
            description: 'Complete template for registering new welfare members with all necessary fields for beneficiary information.',
            category: 'Registration',
            downloads: '2.5K'
        },
        {
            icon: ClipboardList,
            title: 'Contribution Tracking Sheet',
            description: 'Monthly contribution tracking template with columns for member ID, amount, date, and balance.',
            category: 'Finance',
            downloads: '3.1K'
        },
        {
            icon: Users,
            title: 'Beneficiary Details Form',
            description: 'Template for collecting next-of-kin and beneficiary information from welfare members.',
            category: 'Registration',
            downloads: '1.8K'
        },
        {
            icon: FileText,
            title: 'Funeral Claim Application',
            description: 'Standardized form for submitting funeral assistance claims with verification checklist.',
            category: 'Claims',
            downloads: '2.2K'
        },
        {
            icon: ClipboardList,
            title: 'Welfare Committee Minutes',
            description: 'Template for recording welfare committee meetings, decisions, and action items.',
            category: 'Administration',
            downloads: '1.5K'
        },
        {
            icon: CheckCircle,
            title: 'Financial Audit Checklist',
            description: 'Comprehensive checklist for conducting quarterly or annual welfare fund audits.',
            category: 'Finance',
            downloads: '1.9K'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Free Funeral Welfare Templates & Forms | RestPoint</title>
                <meta name="description" content="Download free funeral welfare management templates including member registration forms, contribution tracking sheets, claim forms, and committee minutes templates." />
                <link rel="canonical" href="https://restpoint.co.ke/resources/templates" />
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
                            Free Resources
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Funeral Welfare Templates & Forms
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            Download free, professionally designed templates for managing funeral welfare programs. Ready-to-use forms for registration, contributions, claims, and administration.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Templates Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '2rem',
                        marginBottom: '4rem'
                    }}>
                        {templates.map((template, idx) => {
                            const IconComponent = template.icon;
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'white',
                                        padding: '2rem',
                                        borderRadius: '12px',
                                        border: '1px solid #E3DDD0',
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
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #3D4F47 0%, #2E3F37 100%)',
                                            color: '#FAF8F4',
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <IconComponent size={24} />
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.3rem 0.7rem',
                                            borderRadius: '4px',
                                            background: '#F3EFE6',
                                            color: '#8B7355',
                                            fontWeight: 600
                                        }}>{template.category}</span>
                                    </div>

                                    <h3 style={{
                                        fontFamily: "'Fraunces', serif",
                                        fontSize: '1.2rem',
                                        color: '#15171A',
                                        marginBottom: '0.8rem'
                                    }}>
                                        {template.title}
                                    </h3>

                                    <p style={{
                                        fontSize: '0.95rem',
                                        color: '#6B6862',
                                        lineHeight: 1.6,
                                        marginBottom: '1.5rem',
                                        flex: 1
                                    }}>
                                        {template.description}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid #F3EFE6'
                                    }}>
                                        <span style={{
                                            fontSize: '0.85rem',
                                            color: '#6B6862'
                                        }}>{template.downloads} downloads</span>
                                        <button style={{
                                            background: '#3D4F47',
                                            color: '#FAF8F4',
                                            border: 'none',
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem'
                                        }}>
                                            <Download size={16} />
                                            Download
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Benefits Section */}
                    <section style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '12px',
                        border: '1px solid #E3DDD0',
                        marginBottom: '4rem'
                    }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            Why Use Our Templates?
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '2rem'
                        }}>
                            {[
                                {
                                    title: 'Professionally Designed',
                                    desc: 'Created by welfare management experts with years of experience in Kenyan church and SACCO programs.'
                                },
                                {
                                    title: 'Ready to Use',
                                    desc: 'Download and start using immediately. No customization needed - just fill in your organization details.'
                                },
                                {
                                    title: 'Comprehensive Coverage',
                                    desc: 'From member registration to financial audits, we have templates for every aspect of welfare management.'
                                },
                                {
                                    title: 'Regularly Updated',
                                    desc: 'Templates are updated regularly to comply with current regulations and best practices.'
                                }
                            ].map((benefit, idx) => (
                                <div key={idx} style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
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
                            Need More Than Templates?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            RestPoint provides a complete digital system with all these forms built-in, automated workflows, and real-time reporting.
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
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default TemplatesPage;