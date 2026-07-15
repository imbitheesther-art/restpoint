import React from 'react';

const ProductionStatCard = ({ label, value, unit, icon: Icon, accent, cardStyle = {}, textColor, labelColor, unitColor, iconColor }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        padding: '1.35rem',
        background: 'linear-gradient(180deg, #ffffff 0%, #eff7ff 100%)',
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.18)',
        transition: 'all 0.2s ease',
        ...cardStyle
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        }}>
            <span style={{
                fontSize: '0.85rem',
                color: labelColor || '#64748b',
                fontWeight: 500
            }}>
                {label}
            </span>
            <div style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: accent || 'rgba(20, 221, 60, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Icon size={18} style={{ color: iconColor || '#14DD3C' }} />
            </div>
        </div>
        <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.4rem'
        }}>
            <span style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: textColor || '#0f172a'
            }}>
                {value}
            </span>
            {unit && (
                <span style={{
                    fontSize: '0.85rem',
                    color: unitColor || '#94a3b8',
                    fontWeight: 500
                }}>
                    {unit}
                </span>
            )}
        </div>
    </div>
);

export default ProductionStatCard;