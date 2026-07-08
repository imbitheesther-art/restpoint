import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Quote, Users, TrendingUp, CheckCircle } from 'lucide-react';

const CustomerStoriesPage = () => {
    const navigate = useNavigate();

    const stories = [
        {
            id: 1,
            organization: 'Nairobi Baptist Church',
            type: 'Church',
            location: 'Nairobi',
            members: 850,
            quote: 'RestPoint transformed how we manage our funeral welfare program. What used to take days now takes minutes. Our members love the SMS notifications and transparency.',
            author: 'Rev. James Mwangi',
            role: 'Senior Pastor',
            results: ['Reduced claims processing time by 80%', 'Increased member participation by 45%', 'Zero manual errors in 2 years']
        },
        {
            id: 2,
            organization: 'Mwalimu Cooperative SACCO',
            type: 'SACCO',
            location: 'Nairobi',
            members: 3200,
            quote: 'Managing welfare benefits for 3,200 members seemed impossible until we found RestPoint. The M-Pesa integration alone saved us countless hours every month.',
            author: 'Grace Wanjiku',
            role: 'Welfare Manager',
            results: ['Automated 95% of contribution tracking', 'Process claims 3x faster', 'Member satisfaction increased to 98%']
        },
        {
            id: 3,
            organization: 'Karen Community Chama',
            type: 'Chama',
            location: 'Karen, Nairobi',
            members: 120,
            quote: 'As a women\'s chama, we needed something simple yet powerful. RestPoint helped us maintain complete transparency and trust among our members.',
            author: 'Mary Njeri',
            role: 'Chairperson',
            results: ['100% transparency in fund management', 'Reduced meeting time by 60%', 'Grew membership by 50% in 1 year']
        },
        {
            id: 4,
            organization: 'St. Stephen\'s Catholic Church',
            type: 'Church',
            location: 'Nairobi',
            members: 1500,
            quote: 'The multi-branch support is exactly what we needed. We manage 5 different congregations from one dashboard. RestPoint understands Kenyan churches.',
            author: 'Father John Kamau',
            role: 'Parish Priest',
            results: ['Unified 5 branches in one system', 'Improved financial reporting', 'Better member engagement']
        }
    ];

    return (
        <>
            <Helmet>
                <title>Customer Stories - Funeral Welfare Success Stories | RestPoint</title>
                <meta name="description" content="Read success stories from Kenyan churches, SACCOs, and chamas using RestPoint for funeral welfare management. See real results and transformations." />
                <link rel="canonical" href="https://restpoint.co.ke/resources/customer-stories" />
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
                            Success Stories
                        </div>

                        <h1 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 500,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Real Results from Real Organizations
                        </h1>

                        <p style={{
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '700px',
                            marginBottom: '2rem'
                        }}>
                            Discover how Kenyan churches, SACCOs, and chamas are transforming their funeral welfare programs with RestPoint.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Stats Overview */}
                    <section style={{ marginBottom: '4rem' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {[
                                { icon: Users, number: '500+', label: 'Organizations' },
                                { icon: TrendingUp, number: '50K+', label: 'Members Served' },
                                { icon: CheckCircle, number: '10K+', label: 'Claims Processed' },
                                { icon: Quote, number: '98%', label: 'Satisfaction Rate' }
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

                    {/* Stories Grid */}
                    <section style={{ marginBottom: '4rem' }}>
                        <div style={{
                            display: 'grid',
                            gap: '2rem'
                        }}>
                            {stories.map((story, idx) => (
                                <div
                                    key={story.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        border: '1px solid #E3DDD0',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ padding: '2.5rem' }}>
                                        {/* Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '1.5rem',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}>
                                            <div>
                                                <h3 style={{
                                                    fontFamily: "'Fraunces', serif",
                                                    fontSize: '1.5rem',
                                                    color: '#15171A',
                                                    marginBottom: '0.5rem'
                                                }}>{story.organization}</h3>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    fontSize: '0.85rem',
                                                    color: '#6B6862'
                                                }}>
                                                    <span>{story.type}</span>
                                                    <span>|</span>
                                                    <span>{story.location}</span>
                                                    <span>|</span>
                                                    <span>{story.members.toLocaleString()} members</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quote */}
                                        <div style={{
                                            background: '#F3EFE6',
                                            padding: '1.5rem',
                                            borderRadius: '8px',
                                            marginBottom: '1.5rem',
                                            borderLeft: '4px solid #8B7355'
                                        }}>
                                            <Quote size={24} color="#8B7355" style={{ marginBottom: '0.8rem' }} />
                                            <p style={{
                                                fontSize: '1.05rem',
                                                lineHeight: 1.7,
                                                color: '#15171A',
                                                margin: 0,
                                                fontStyle: 'italic'
                                            }}>{story.quote}</p>
                                            <div style={{
                                                marginTop: '1rem',
                                                fontSize: '0.95rem',
                                                color: '#3D4F47',
                                                fontWeight: 600
                                            }}>
                                                {story.author} - {story.role}
                                            </div>
                                        </div>

                                        {/* Results */}
                                        <div>
                                            <h4 style={{
                                                fontSize: '0.85rem',
                                                color: '#6B6862',
                                                marginBottom: '0.8rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>Key Results</h4>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: '0.8rem'
                                            }}>
                                                {story.results.map((result, resultIdx) => (
                                                    <div
                                                        key={resultIdx}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            fontSize: '0.95rem',
                                                            color: '#15171A'
                                                        }}
                                                    >
                                                        <CheckCircle size={18} color="#3D4F47" />
                                                        {result}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
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
                            Ready to Write Your Success Story?
                        </h3>
                        <p style={{
                            fontSize: '1.05rem',
                            lineHeight: 1.7,
                            opacity: 0.9,
                            maxWidth: '600px',
                            margin: '0 auto 2rem'
                        }}>
                            Join hundreds of organizations already using RestPoint. Start your free trial today.
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
                            <Quote size={18} />
                        </button>
                    </div>
                </div>

                <Footer navigate={navigate} />
            </div>
        </>
    );
};

export default CustomerStoriesPage;