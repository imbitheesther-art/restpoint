import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from 'lucide-react';

// Elegant color palette
const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  verdigrisDark: '#2E3F37',
  line: '#E3DDD0',
  lineDark: 'rgba(250,248,244,0.14)',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
};

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();

  // Get tenant slug from URL params or localStorage
  const getTenantSlug = () => {
    return slug ||
      localStorage.getItem('tenantSlug') ||
      localStorage.getItem('tenant_slug') ||
      (() => {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          return user.tenantSlug || user.tenant?.slug || 'default';
        } catch {
          return 'default';
        }
      })();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${C.bone} 0%, ${C.bone2} 100%)`,
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '520px',
        width: '100%',
        padding: '3.5rem',
        background: C.bone,
        borderRadius: '20px',
        boxShadow: `0 20px 60px rgba(21, 23, 26, 0.08), 0 0 0 1px ${C.line}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative top accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${C.brass} 0%, ${C.brassLight} 50%, ${C.brass} 100%)`
        }} />

        {/* Icon with elegant styling */}
        <div style={{
          width: '120px',
          height: '120px',
          margin: '0 auto 2.5rem',
          background: `linear-gradient(135deg, ${C.verdigris} 0%, ${C.verdigrisDark} 100%)`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 12px 32px rgba(61, 79, 71, 0.25)`,
          border: `3px solid ${C.bone}`
        }}>
          <AlertTriangle size={52} color={C.bone} strokeWidth={1.5} />
        </div>

        {/* 404 Number */}
        <h1 style={{
          fontSize: '7rem',
          fontWeight: '700',
          color: C.ink,
          margin: '0 0 0.75rem',
          lineHeight: 1,
          letterSpacing: '-0.02em'
        }}>
          404
        </h1>

        {/* Title */}
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '600',
          color: C.ink,
          margin: '0 0 1.25rem',
          letterSpacing: '-0.01em'
        }}>
          Page Not Found
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '1.05rem',
          color: C.gray,
          marginBottom: '2.5rem',
          lineHeight: 1.7,
          maxWidth: '400px',
          margin: '0 auto 2.5rem'
        }}>
          Oops! The page you're looking for doesn't exist or has been moved.
          {location.pathname && (
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: C.grayLight }}>
              Requested: <code style={{
                background: C.bone2,
                padding: '4px 10px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                color: C.brass,
                border: `1px solid ${C.line}`
              }}>{location.pathname}</code>
            </div>
          )}
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Go Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              background: C.bone,
              border: `1.5px solid ${C.line}`,
              borderRadius: '10px',
              color: C.ink,
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              boxShadow: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.bone2;
              e.currentTarget.style.borderColor = C.brass;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.bone;
              e.currentTarget.style.borderColor = C.line;
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          {/* Home Button */}
          <button
            onClick={() => {
              const tenantSlug = getTenantSlug();
              navigate(`/tenant/${tenantSlug}/all-deceased`);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              background: `linear-gradient(135deg, ${C.verdigris} 0%, ${C.verdigrisDark} 100%)`,
              border: 'none',
              borderRadius: '10px',
              color: C.bone,
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              boxShadow: `0 4px 12px rgba(61, 79, 71, 0.25)`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 16px rgba(61, 79, 71, 0.35)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px rgba(61, 79, 71, 0.25)`;
            }}
          >
            <Home size={18} />
            Home
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.5rem',
              background: `linear-gradient(135deg, ${C.brass} 0%, ${C.brassLight} 100%)`,
              border: 'none',
              borderRadius: '10px',
              color: C.bone,
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem',
              boxShadow: `0 4px 12px rgba(139, 115, 85, 0.25)`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 6px 16px rgba(139, 115, 85, 0.35)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px rgba(139, 115, 85, 0.25)`;
            }}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: `1px solid ${C.line}`
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: C.grayLight,
            margin: 0
          }}>
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;