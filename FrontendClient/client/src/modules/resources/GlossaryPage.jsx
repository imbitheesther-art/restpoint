import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search } from '../../utils/icons/icons';

const GlossaryPage = () => {
    const navigate = useNavigate();

    const terms = [
        {
            term: 'Bereavement',
            definition: 'The period of mourning and adjustment following the death of a loved one. In funeral welfare contexts, it refers to the time when a member\'s family member has passed away and is eligible for welfare benefits.'
        },
        {
            term: 'Chama',
            definition: 'A Kenyan term for a self-help group or merry-go-round savings circle. Chamas are common in Kenya where members contribute regular amounts and take turns receiving the pooled funds, often used for funeral expenses.'
        },
        {
            term: 'Claims Processing',
            definition: 'The workflow of verifying and approving funeral welfare benefit requests. This includes validating membership, checking contribution history, and disbursing funds to bereaved families.'
        },
        {
            term: 'Contribution',
            definition: 'Regular payments made by welfare members, typically monthly. Contributions form the fund from which funeral benefits are paid. Common amounts range from KES 200 to KES 1,000 per month.'
        },
        {
            term: 'Funeral Welfare',
            definition: 'A community-based support system where members contribute to a shared fund that provides financial assistance during bereavement. Common in churches, SACCOs, and community groups.'
        },
        {
            term: 'Beneficiary',
            definition: 'A person designated by a welfare member to receive funeral benefits in the event of the member\'s death. Usually a spouse, child, or next of kin.'
        },
        {
            term: 'Next of Kin',
            definition: 'The closest living relative of a person, typically a spouse, child, or parent. In funeral welfare, this is the person who receives benefits and makes decisions on behalf of the deceased.'
        },
        {
            term: 'SACCO',
            definition: 'Savings and Credit Cooperative Society. A member-owned financial cooperative that provides savings, loans, and other financial services. Many SACCOs in Kenya offer funeral welfare benefits to members.'
        },
        {
            term: 'Welfare Committee',
            definition: 'A group of elected or appointed members responsible for managing a funeral welfare program. Duties include collecting contributions, verifying claims, and approving benefit disbursements.'
        },
        {
            term: 'Benefit Disbursement',
            definition: 'The process of paying out funeral welfare funds to beneficiaries. This can be done via M-Pesa, bank transfer, or cash, depending on the organization\'s policies.'
        },
        {
            term: 'Member Registration',
            definition: 'The process of enrolling new members into a funeral welfare program. This includes collecting personal details, beneficiary information, and agreeing to contribution terms.'
        },
        {
            term: 'Fund Balance',
            definition: 'The total amount of money available in a funeral welfare fund at any given time. Calculated as total contributions received minus benefits paid out and administrative expenses.'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Funeral Welfare Glossary | RestPoint</title>
                <meta name="description" content="Comprehensive glossary of funeral welfare management terms. Learn about chamas, SACCOs, contributions, beneficiaries, claims processing, and more." />
                <link rel="canonical" href="https://restpoint.co.ke/resources/glossary" />
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
                            Reference Guide
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Funeral Welfare Glossary
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            A comprehensive reference guide to funeral welfare management terminology. Understand key terms used in church welfare, SACCO benefits, and chama programs.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Terms List */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #E3DDD0',
                        overflow: 'hidden',
                        marginBottom: '4rem'
                    }}>
                        {terms.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '2rem',
                                    borderBottom: idx < terms.length - 1 ? '1px solid #F3EFE6' : 'none',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#FAF8F4'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <h3 style={{
                                    fontFamily: "'Fraunces', serif",
                                    fontSize: '1.3rem',
                                    color: '#3D4F47',
                                    marginBottom: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <BookOpen size={20} color="#8B7355" />
                                    {item.term}
                                </h3>
                                <p style={{
                                    fontSize: '1rem',
                                    color: '#6B6862',
                                    lineHeight: 1.7,
                                    margin: 0,
                                    paddingLeft: '28px'
                                }}>
                                    {item.definition}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Related Resources */}
                    <section style={{ marginBottom: '4rem' }}>
                        <h2 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '2rem',
                            color: '#15171A',
                            marginBottom: '2rem',
                            textAlign: 'center'
                        }}>
                            Related Resources
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {[
                                {
                                    title: 'Funeral Welfare Guide',
                                    desc: 'Complete guide to managing funeral welfare programs',
                                    path: '/blog/funeral-welfare-management'
                                },
                                {
                                    title: 'Templates & Forms',
                                    desc: 'Download free welfare management templates',
                                    path: '/resources/templates'
                                },
                                {
                                    title: 'Calculators',
                                    desc: 'Plan contributions and benefits with our tools',
                                    path: '/calculators'
                                },
                                {
                                    title: 'Best Practices',
                                    desc: 'Learn from successful welfare programs',
                                    path: '/blog/best-practices'
                                }
                            ].map((resource, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => navigate(resource.path)}
                                    style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #E3DDD0',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <h4 style={{
                                        fontSize: '1.1rem',
                                        color: '#15171A',
                                        marginBottom: '0.5rem'
                                    }}>{resource.title}</h4>
                                    <p style={{
                                        fontSize: '0.9rem',
                                        color: '#6B6862',
                                        margin: 0
                                    }}>{resource.desc}</p>
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
                            Ready to Start Managing Welfare?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            RestPoint makes funeral welfare management simple. Get started today with our comprehensive platform.
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
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default GlossaryPage;