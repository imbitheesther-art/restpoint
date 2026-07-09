import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    verdigris: '#3D4F47',
    verdigrisLight: '#4D6359',
    grayLight: 'rgba(250,248,244,0.62)',
};

const WeltTallisAbout = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: C.ink,
            color: C.bone,
        }}>
            {/* Hero Section */}
            <div style={{
                padding: '8rem 0 4rem',
                background: 'radial-gradient(circle at 30% 50%, rgba(61,79,71,0.2) 0%, transparent 70%)',
            }}>
                <div className="wrap" style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    textAlign: 'center',
                }}>
                    <h1 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: '3rem',
                        fontWeight: 500,
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.02em',
                    }}>
                        About Welt Tallis
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: C.grayLight,
                        lineHeight: 1.8,
                        opacity: 0.9,
                    }}>
                        Transforming human life through technology
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div style={{
                padding: '4rem 0',
                background: C.ink,
            }}>
                <div className="wrap" style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                }}>
                    <div style={{
                        background: 'rgba(61,79,71,0.1)',
                        border: `1px solid ${C.verdigrisLight}`,
                        borderRadius: '4px',
                        padding: '3rem',
                        marginBottom: '2rem',
                    }}>
                        <h2 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '1.5rem',
                            color: C.bone,
                            marginBottom: '1.5rem',
                            fontWeight: 600,
                        }}>
                            Our Mission
                        </h2>
                        <p style={{
                            fontSize: '1rem',
                            color: C.grayLight,
                            lineHeight: 1.8,
                            marginBottom: '1rem',
                        }}>
                            We are a team of technologists dedicated to transforming human life through innovative software solutions.
                            We believe technology should serve humanity, making complex processes simpler and more accessible.
                        </p>
                        <p style={{
                            fontSize: '1rem',
                            color: C.grayLight,
                            lineHeight: 1.8,
                        }}>
                            Through our products, we impact lives by creating tools that empower organizations to focus on what truly matters -
                            serving their communities with dignity and compassion.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(61,79,71,0.1)',
                        border: `1px solid ${C.verdigrisLight}`,
                        borderRadius: '4px',
                        padding: '3rem',
                        marginBottom: '2rem',
                    }}>
                        <h2 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '1.5rem',
                            color: C.bone,
                            marginBottom: '1.5rem',
                            fontWeight: 600,
                        }}>
                            Our Impact
                        </h2>
                        <p style={{
                            fontSize: '1rem',
                            color: C.grayLight,
                            lineHeight: 1.8,
                            marginBottom: '1rem',
                        }}>
                            Every product we create is designed with a single purpose: to make a positive difference in people's lives.
                            From funeral homes to welfare organizations, we provide the technological foundation that allows our clients
                            to focus on what truly matters - caring for their communities.
                        </p>
                        <p style={{
                            fontSize: '1rem',
                            color: C.grayLight,
                            lineHeight: 1.8,
                        }}>
                            We measure our success not by the complexity of our code, but by the simplicity we bring to the people we serve.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(61,79,71,0.1)',
                        border: `1px solid ${C.verdigrisLight}`,
                        borderRadius: '4px',
                        padding: '3rem',
                    }}>
                        <h2 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '1.5rem',
                            color: C.bone,
                            marginBottom: '1.5rem',
                            fontWeight: 600,
                        }}>
                            Our Values
                        </h2>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                        }}>
                            {[
                                'Technology should serve humanity, not the other way around',
                                'Simplicity is the ultimate sophistication',
                                'Every organization deserves access to powerful, affordable tools',
                                'Compassion and dignity are at the heart of everything we build',
                            ].map((value, idx) => (
                                <li key={idx} style={{
                                    fontSize: '1rem',
                                    color: C.grayLight,
                                    lineHeight: 1.8,
                                    paddingLeft: '2rem',
                                    position: 'relative',
                                    marginBottom: '1rem',
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: 0,
                                        color: C.verdigrisLight,
                                        fontSize: '1.2rem',
                                    }}>▸</span>
                                    {value}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <Footer goTerms={() => navigate('/terms')} />
        </div>
    );
};

export default WeltTallisAbout;