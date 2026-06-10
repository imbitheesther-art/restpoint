import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Check, Shield, Zap, BarChart3, Users, Lock, Globe } from 'lucide-react';

const ProductionLandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // SEO - Update meta tags
    document.title = 'REST POINT - Mortuary Management OS for Africa | Kenya | Uganda';
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      'All-in-one mortuary operating system with deceased management, billing, dispatch, and family portal. Trusted across Kenya and East Africa.');

    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (token && user?.id) {
      setIsLoggedIn(true);
      setUserRole(user.role);
    }

    // Scroll listener
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart redirect based on auth status
  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      {/* ===== HEADER/NAV ===== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'white',
        borderBottom: scrolled ? '1px solid #e5e7eb' : 'none',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <nav style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/'}
          >
            REST POINT
          </div>

          {/* Desktop Nav */}
          <div style={{ display: 'none', '@media (min-width: 900px)': { display: 'flex' }, gap: '2rem', alignItems: 'center' }}>
            {[
              { label: 'Features', href: '#features' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'About', href: '#about' }
            ].map(link => (
              <a key={link.label} href={link.href} style={{
                color: '#374151',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.color = '#059669'}
              onMouseLeave={(e) => e.target.style.color = '#374151'}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <button onClick={() => navigate('/dashboard')} style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
                >
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button onClick={handleLoginClick} style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#059669',
                  border: '2px solid #059669',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0fdf4';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
                >
                  Login
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button style={{ display: 'none', '@media (max-width: 900px)': { display: 'block' }, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} color="#374151" /> : <Menu size={24} color="#374151" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem' }}>
            {[
              { label: 'Features', href: '#features' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'About', href: '#about' }
            ].map(link => (
              <a key={link.label} href={link.href} style={{
                display: 'block',
                padding: '0.75rem 0',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ===== HERO SECTION ===== */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '6rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{
            backgroundColor: '#f0fdf4',
            color: '#059669',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            🎯 The Operating System For Modern Mortuaries
          </span>
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#1f2937',
          lineHeight: '1.2',
          marginBottom: '1.5rem',
          maxWidth: '800px',
          margin: '0 auto 1.5rem'
        }}>
          Streamline Your Mortuary Operations Across Africa
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          maxWidth: '700px',
          margin: '0 auto 2rem',
          lineHeight: '1.6'
        }}>
          Complete deceased management, real-time billing, family portal, and compliance tracking. Built for Kenya. Trusted across East Africa.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <button onClick={handleGetStarted} style={{
            padding: '1rem 2rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#047857';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#059669';
            e.target.style.transform = 'translateY(0)';
          }}
          >
            {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight size={18} />
          </button>
          <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} style={{
            padding: '1rem 2rem',
            backgroundColor: 'white',
            color: '#059669',
            border: '2px solid #059669',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '1rem'
          }}>
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          {[
            { number: '2500+', label: 'Daily Admissions Processed' },
            { number: '99.9%', label: 'Uptime SLA' },
            { number: '15+', label: 'Countries Across Africa' },
            { number: '24/7', label: 'Support Available' }
          ].map((stat, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>{stat.number}</div>
              <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" style={{
        backgroundColor: '#f9fafb',
        padding: '4rem 2rem',
        marginTop: '2rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              Everything You Need
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
              All essential tools to run a modern mortuary operation
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: <Users size={32} />,
                title: 'Deceased Management',
                description: 'Digital admission forms, QR tracking, and complete deceased records in seconds'
              },
              {
                icon: <Zap size={32} />,
                title: 'Smart Dispatch',
                description: 'Real-time GPS dispatch, route optimization, and live family updates'
              },
              {
                icon: <BarChart3 size={32} />,
                title: 'Automated Billing',
                description: 'Daily billing, M-PESA integration, invoicing, and financial reports'
              },
              {
                icon: <Globe size={32} />,
                title: 'Family Portal',
                description: 'Families track status, view documents, and pay via SMS link (no app needed)'
              },
              {
                icon: <Shield size={32} />,
                title: 'Compliance Ready',
                description: 'Kenyan regulations built-in, burial permits, and compliance tracking'
              },
              {
                icon: <Lock size={32} />,
                title: 'Enterprise Security',
                description: 'Multi-tenant isolation, role-based access, and encrypted storage'
              }
            ].map((feature, idx) => (
              <div key={idx} style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <div style={{ color: '#059669', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '4rem 2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
            No hidden fees. Cancel anytime.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {[
            {
              name: 'Standard',
              price: 'KES 7,500/mo',
              features: [
                'Up to 50 deceased/month',
                'Family Portal SMS',
                'Basic Billing',
                'WhatsApp Support',
                'Single Branch'
              ]
            },
            {
              name: 'Enterprise',
              price: 'KES 18,000/mo',
              features: [
                'Unlimited deceased',
                'Multi-branch Management',
                'Advanced Analytics',
                'Custom Compliance',
                'GPS Dispatch',
                '24/7 Priority Support',
                'Dedicated Account Manager'
              ],
              highlighted: true
            }
          ].map((plan, idx) => (
            <div key={idx} style={{
              backgroundColor: plan.highlighted ? '#059669' : 'white',
              color: plan.highlighted ? 'white' : '#1f2937',
              padding: '2rem',
              borderRadius: '1rem',
              border: plan.highlighted ? 'none' : '1px solid #e5e7eb',
              position: 'relative'
            }}>
              {plan.highlighted && (
                <span style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  MOST POPULAR
                </span>
              )}
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                {plan.price}
              </p>
              <ul style={{ marginBottom: '2rem', listStyle: 'none', padding: 0 }}>
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    color: plan.highlighted ? 'rgba(255,255,255,0.9)' : '#6b7280'
                  }}>
                    <Check size={18} style={{ flexShrink: 0 }} /> {feature}
                  </li>
                ))}
              </ul>
              <button onClick={handleGetStarted} style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: plan.highlighted ? 'white' : '#059669',
                color: plan.highlighted ? '#059669' : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section style={{
        backgroundColor: '#059669',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
        marginTop: '2rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Ready to Transform Your Operations?
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '2rem',
          opacity: 0.95
        }}>
          Join 100+ mortuaries across Kenya and East Africa
        </p>
        <button onClick={handleGetStarted} style={{
          padding: '1rem 2rem',
          backgroundColor: 'white',
          color: '#059669',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
        >
          {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial Today'}
        </button>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '0.5rem' }}>© 2026 REST POINT. All rights reserved.</p>
        <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
          Empowering mortuaries across Africa with modern operations software.
        </p>
      </footer>
    </div>
  );
};

export default ProductionLandingPage;
