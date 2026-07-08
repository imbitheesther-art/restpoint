import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    verdigrisTint: '#EBEFEF',
    line: '#E3DDD0',
    lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    accent: '#C77B5E',
};

const PolicyDropdown = ({ goTerms }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const policies = [
        { label: 'Terms of Service', path: '/terms', action: goTerms },
        { label: 'Privacy Policy', path: '/privacy', action: () => navigate('/privacy') },
        { label: 'Data Migration Policy', path: '/data-migration', action: () => navigate('/data-migration') },
        { label: 'SLA Policy', path: '/sla', action: () => navigate('/sla') },
        { label: 'Release Notes', path: '/releases', action: () => navigate('/releases') },
        { label: 'Account Deletion', path: '/account-deletion', action: () => navigate('/account-deletion') },
    ];

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: C.grayLight,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    padding: 0,
                    transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.color = C.bone}
                onMouseLeave={(e) => e.target.style.color = C.grayLight}
            >
                Policies
                <ChevronDown
                    size={14}
                    style={{
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                    }}
                />
            </button>
            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        background: C.ink,
                        border: `1px solid ${C.line}`,
                        borderRadius: '2px',
                        minWidth: '240px',
                        marginTop: '0.5rem',
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(21,23,26,0.2)',
                    }}
                >
                    {policies.map((policy, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (policy.action) {
                                    policy.action();
                                }
                                setOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '0.8rem 1.1rem',
                                background: 'none',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                borderBottom: idx < policies.length - 1 ? `1px solid ${C.lineDark}` : 'none',
                                transition: 'background 0.2s, color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = `rgba(250,248,244,0.08)`;
                                e.target.style.color = C.bone;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'none';
                                e.target.style.color = C.grayLight;
                            }}
                        >
                            {policy.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Footer = ({ goTerms }) => {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            background: C.ink,
            color: C.grayLight,
            padding: '5rem 0 2rem',
            borderTop: `2px solid ${C.verdigrisLight}`,
            position: 'relative',
            overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 50%, rgba(61,79,71,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
                <div className="footer-content" style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
                    gap: '3rem',
                    marginBottom: '4rem',
                }}>
                    <div>
                        <div className="footer-brand" style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '1.5rem',
                            color: C.bone,
                            fontWeight: 500,
                            marginBottom: '0.6rem',
                            letterSpacing: '-0.02em',
                        }}>
                            Rest Point
                        </div>
                        <p className="footer-desc" style={{
                            fontSize: '0.88rem',
                            color: C.grayLight,
                            lineHeight: 1.7,
                            maxWidth: '300px',
                            opacity: 0.8,
                        }}>
                            The operating system for funeral homes that take their reputation seriously. Built by Welt Tallis Technologies.
                        </p>
                        <div className="footer-status" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            fontSize: '0.78rem',
                            color: C.grayLight,
                            marginTop: '0.5rem',
                            opacity: 0.7,
                        }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#4CAF50',
                                display: 'inline-block',
                                animation: 'pulse 2s infinite',
                            }} />
                            All systems operational
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.7rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: C.verdigrisTint,
                            marginBottom: '1.2rem',
                            fontWeight: 600,
                            opacity: 0.7,
                        }}>
                            Software Solutions
                        </h4>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.bone,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                                fontWeight: 600,
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.bone; e.target.style.transform = 'translateX(0)'; }}
                        >
                            RestPoint Complete Software
                        </button>
                        <button
                            onClick={() => navigate('/solutions/churches')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Church Welfare Software
                        </button>
                        <button
                            onClick={() => navigate('/solutions/saccos')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            SACCO Funeral Software
                        </button>
                        <button
                            onClick={() => navigate('/solutions/chamas')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Chama Digital Management
                        </button>
                        <button
                            onClick={() => navigate('/solutions/funeral-homes')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Funeral Home Software
                        </button>
                    </div>

                    <div className="footer-col">
                        <h4 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.7rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: C.verdigrisTint,
                            marginBottom: '1.2rem',
                            fontWeight: 600,
                            opacity: 0.7,
                        }}>
                            Resources
                        </h4>
                        <button
                            onClick={() => navigate('/blog/funeral-welfare-management')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Funeral Welfare Guide
                        </button>
                        <button
                            onClick={() => navigate('/blog/bereavement-management')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Bereavement Management
                        </button>
                        <button
                            onClick={() => navigate('/blog/member-contributions')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Member Contributions
                        </button>
                        <button
                            onClick={() => navigate('/templates')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Free Templates
                        </button>
                        <button
                            onClick={() => navigate('/calculators')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Calculators
                        </button>
                    </div>

                    <div className="footer-col">
                        <h4 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.7rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: C.verdigrisTint,
                            marginBottom: '1.2rem',
                            fontWeight: 600,
                            opacity: 0.7,
                        }}>
                            Compare
                        </h4>
                        <button
                            onClick={() => navigate('/compare/restpoint-vs-excel')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            RestPoint vs Excel
                        </button>
                        <button
                            onClick={() => navigate('/compare/manual-vs-digital')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Manual vs Digital
                        </button>
                        <button
                            onClick={() => navigate('/compare/best-church-software-kenya')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Best Church Software Kenya
                        </button>
                        <button
                            onClick={() => navigate('/compare/best-sacco-welfare-software')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Best SACCO Welfare Software
                        </button>
                    </div>

                    <div className="footer-col">
                        <h4 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.7rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: C.verdigrisTint,
                            marginBottom: '1.2rem',
                            fontWeight: 600,
                            opacity: 0.7,
                        }}>
                            Resources
                        </h4>
                        <button
                            onClick={() => navigate('/resources/logs')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Logs
                        </button>
                        <button
                            onClick={() => navigate('/glossary')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Glossary
                        </button>
                        <button
                            onClick={() => navigate('/locations/nairobi')}
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                color: C.grayLight,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'color 0.2s, transform 0.2s',
                                textAlign: 'left',
                                padding: 0,
                                marginBottom: '0.6rem',
                            }}
                            onMouseEnter={(e) => { e.target.style.color = C.verdigrisTint; e.target.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.target.style.color = C.grayLight; e.target.style.transform = 'translateX(0)'; }}
                        >
                            Nairobi
                        </button>
                    </div>
                </div>

                <div style={{
                    height: '1px',
                    background: C.lineDark,
                    margin: '2.5rem 0',
                    position: 'relative',
                    zIndex: 1,
                }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.78rem',
                    color: C.grayLight,
                    paddingTop: '1.5rem',
                    borderTop: `1px solid ${C.lineDark}`,
                    position: 'relative',
                    zIndex: 1,
                }}>
                    <span>&copy; {currentYear} Rest Point. All rights reserved.</span>
                    <span>Built for African funeral professionals</span>
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @media (max-width: 1200px) {
          .footer-content { grid-template-columns: 2fr 1fr 1fr 1fr !important; gap: 2rem !important; }
        }
        @media (max-width: 1000px) {
          .footer-content { grid-template-columns: 2fr 1fr 1fr !important; gap: 2.5rem !important; }
        }
        @media (max-width: 700px) {
          .footer-content { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
        @media (max-width: 600px) {
          .footer-bottom { flex-direction: column !important; gap: 1rem !important; text-align: center !important; }
        }
      `}</style>
        </footer>
    );
};

export default Footer;