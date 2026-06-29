import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Shield, Lock, Eye, FileText, AlertTriangle } from 'lucide-react';

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    line: '#E3DDD0',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
};

export default function SecurityPolicy() {
    const navigate = useNavigate();
    const [openSection, setOpenSection] = useState(null);

    const goHome = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/'); };
    const goPrivacy = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/privacy'); };
    const goTerms = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/terms'); };

    const sections = [
        {
            id: 'encryption',
            title: 'Data Encryption',
            icon: <Lock size={20} />,
            content: 'All data is encrypted using AES-256 encryption at rest and TLS 1.3 for data in transit. This ensures that your sensitive funeral home data remains protected from unauthorized access.'
        },
        {
            id: 'access',
            title: 'Access Controls',
            icon: <Shield size={20} />,
            content: 'We implement role-based access controls (RBAC) to ensure that only authorized personnel can access specific data. Multi-factor authentication is available for all user accounts.'
        },
        {
            id: 'monitoring',
            title: 'Security Monitoring',
            icon: <Eye size={20} />,
            content: 'Our systems are monitored 24/7 for suspicious activities. We employ advanced threat detection systems and conduct regular security audits to identify and address vulnerabilities.'
        },
        {
            id: 'compliance',
            title: 'Compliance Standards',
            icon: <FileText size={20} />,
            content: 'Rest Point is ISO 27001 compliant and follows GDPR guidelines. We undergo regular third-party security assessments to maintain the highest standards of data protection.'
        },
        {
            id: 'incident',
            title: 'Incident Response',
            icon: <AlertTriangle size={20} />,
            content: 'We have a comprehensive incident response plan in place. In the unlikely event of a security incident, we will notify affected parties within 72 hours and take immediate corrective action.'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: C.bone }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: ${C.gray}; background: ${C.bone}; }
        h1, h2, h3 { font-family: 'Fraunces', serif; font-weight: 500; color: ${C.ink}; }
      `}</style>

            {/* Navigation */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                background: 'rgba(250,248,244,0.96)', backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${C.line}`, padding: '1.2rem 0',
            }}>
                <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', fontFamily: "'Fraunces', serif", fontSize: '1.25rem', fontWeight: 500, color: C.ink, cursor: 'pointer' }} onClick={goHome}>
                        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14.5" stroke={C.verdigris} strokeWidth="1" />
                            <path d="M16 8.5V23.5M9.5 16H22.5" stroke={C.verdigris} strokeWidth="1" />
                            <circle cx="16" cy="16" r="2.5" fill={C.verdigris} />
                        </svg>
                        <span>Rest Point</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <button onClick={goPrivacy} style={{ background: 'none', border: 'none', color: C.gray, cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>Privacy</button>
                        <button onClick={goTerms} style={{ background: 'none', border: 'none', color: C.gray, cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}>Terms</button>
                    </div>
                </div>
            </nav>

            <main style={{ paddingTop: '100px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-block', padding: '0.6rem 1rem',
                            background: 'rgba(61, 79, 71, 0.1)', border: `1px solid ${C.verdigrisLight}`,
                            borderRadius: '20px', marginBottom: '1.5rem'
                        }}>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.74rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.verdigris }}>
                                Security & Compliance
                            </span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', lineHeight: 1.2 }}>
                            Security & Compliance Policy
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: C.gray, maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Introduction */}
                    <div style={{
                        background: C.bone2, border: `1px solid ${C.line}`, padding: '2rem',
                        borderRadius: '4px', marginBottom: '3rem'
                    }}>
                        <p style={{ fontSize: '1rem', lineHeight: 1.8, color: C.gray }}>
                            At Rest Point, we take the security of your funeral home data seriously. This policy outlines our comprehensive security measures and compliance standards designed to protect your information and ensure business continuity.
                        </p>
                    </div>

                    {/* Security Sections */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                        {sections.map((section) => (
                            <div
                                key={section.id}
                                style={{
                                    background: 'white', border: `1px solid ${C.line}`, borderRadius: '4px',
                                    overflow: 'hidden', transition: 'all 0.3s ease'
                                }}
                            >
                                <button
                                    onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                                    style={{
                                        width: '100%', padding: '1.5rem', background: 'none', border: 'none',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                                        textAlign: 'left', transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = C.bone2}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'rgba(61, 79, 71, 0.1)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: C.verdigris, flexShrink: 0
                                    }}>
                                        {section.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{section.title}</h3>
                                    </div>
                                    <ChevronDown
                                        size={20}
                                        style={{
                                            color: C.brass,
                                            transform: openSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    />
                                </button>
                                {openSection === section.id && (
                                    <div style={{
                                        padding: '0 1.5rem 1.5rem', borderTop: `1px solid ${C.line}`,
                                        background: C.bone2
                                    }}>
                                        <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: C.gray, marginTop: '1rem' }}>
                                            {section.content}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Key Security Features */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'center' }}>Key Security Features</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            {[
                                { title: 'End-to-End Encryption', desc: 'All data encrypted in transit and at rest' },
                                { title: 'Regular Backups', desc: 'Daily automated backups with geo-redundancy' },
                                { title: 'Access Logs', desc: 'Complete audit trail of all system access' },
                                { title: 'Secure Infrastructure', desc: 'Enterprise-grade cloud with 99.9% uptime' },
                            ].map((feature, idx) => (
                                <div key={idx} style={{
                                    background: 'white', border: `1px solid ${C.line}`, padding: '1.5rem',
                                    borderRadius: '4px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <Check size={18} color={C.verdigris} />
                                        <h3 style={{ fontSize: '1rem' }}>{feature.title}</h3>
                                    </div>
                                    <p style={{ fontSize: '0.88rem', color: C.gray, lineHeight: 1.6 }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div style={{
                        background: C.verdigrisDark, color: C.bone, padding: '2.5rem',
                        borderRadius: '4px', textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: C.bone }}>Questions about security?</h2>
                        <p style={{ fontSize: '1rem', color: 'rgba(250,248,244,0.75)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                            Our security team is available to address any concerns you may have.
                        </p>
                        <a href="mailto:security@restpoint.co.ke" style={{
                            display: 'inline-block', padding: '0.75rem 1.5rem',
                            background: C.brass, color: C.bone, textDecoration: 'none',
                            borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500,
                            transition: 'background 0.2s'
                        }}
                            onMouseEnter={(e) => e.target.style.background = C.brassLight}
                            onMouseLeave={(e) => e.target.style.background = C.brass}
                        >
                            Contact Security Team
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                background: C.ink, color: C.grayLight, padding: '3rem 0 2rem',
                borderTop: `2px solid ${C.verdigrisLight}`
            }}>
                <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.25rem', color: C.bone }}>
                            Rest Point
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
                            <button onClick={goPrivacy} style={{ background: 'none', border: 'none', color: C.grayLight, cursor: 'pointer', fontSize: '0.85rem' }}>Privacy Policy</button>
                            <button onClick={goTerms} style={{ background: 'none', border: 'none', color: C.grayLight, cursor: 'pointer', fontSize: '0.85rem' }}>Terms of Service</button>
                        </div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>
                            © {new Date().getFullYear()} Rest Point. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}