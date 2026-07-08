import { Helmet } from 'react-helmet-async';
import Footer from '../../components/layout/Footer';
import { useNavigate } from 'react-router-dom';
import { Activity, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LogsPage = () => {
    const navigate = useNavigate();

    const logs = [
        {
            id: 1,
            timestamp: '2026-01-15 14:32:45',
            level: 'info',
            module: 'Authentication',
            message: 'User login successful',
            user: 'admin@restpoint.co.ke',
            ip: '192.168.1.105'
        },
        {
            id: 2,
            timestamp: '2026-01-15 14:28:12',
            level: 'success',
            module: 'Deceased Registration',
            message: 'New deceased record created',
            user: 'staff@restpoint.co.ke',
            ip: '192.168.1.108'
        },
        {
            id: 3,
            timestamp: '2026-01-15 14:15:33',
            level: 'warning',
            module: 'Billing',
            message: 'Invoice payment overdue - INV-2026-001',
            user: 'system',
            ip: 'localhost'
        },
        {
            id: 4,
            timestamp: '2026-01-15 13:45:21',
            level: 'error',
            module: 'Database',
            message: 'Failed to connect to tenant database - retrying',
            user: 'system',
            ip: 'localhost'
        },
        {
            id: 5,
            timestamp: '2026-01-15 13:30:00',
            level: 'info',
            module: 'Coffin Inventory',
            message: 'Coffin stock updated - 15 units added',
            user: 'manager@restpoint.co.ke',
            ip: '192.168.1.112'
        },
        {
            id: 6,
            timestamp: '2026-01-15 12:22:18',
            level: 'success',
            module: 'Hearse Booking',
            message: 'Booking confirmed for John Doe - Jan 16, 2026',
            user: 'staff@restpoint.co.ke',
            ip: '192.168.1.108'
        },
        {
            id: 7,
            timestamp: '2026-01-15 11:55:42',
            level: 'info',
            module: 'Document Generation',
            message: 'Death certificate generated successfully',
            user: 'admin@restpoint.co.ke',
            ip: '192.168.1.105'
        },
        {
            id: 8,
            timestamp: '2026-01-15 10:18:33',
            level: 'warning',
            module: 'Leave Management',
            message: 'Staff leave request pending approval',
            user: 'system',
            ip: 'localhost'
        }
    ];

    const getLevelIcon = (level) => {
        switch (level) {
            case 'success':
                return <CheckCircle size={18} color="#10b981" />;
            case 'error':
                return <XCircle size={18} color="#ef4444" />;
            case 'warning':
                return <AlertCircle size={18} color="#f59e0b" />;
            default:
                return <Activity size={18} color="#3b82f6" />;
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'success':
                return '#10b981';
            case 'error':
                return '#ef4444';
            case 'warning':
                return '#f59e0b';
            default:
                return '#3b82f6';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#FAF8F4' }}>
            <Helmet>
                <title>System Logs | RestPoint</title>
                <meta name="description" content="View system activity logs and audit trail" />
            </Helmet>

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #15171A 0%, #2E3F37 100%)',
                color: '#FAF8F4',
                padding: '3rem 2rem',
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

                <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
                        marginBottom: '1rem'
                    }}>
                        System Monitoring
                    </div>

                    <h1 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 500,
                        lineHeight: 1.1,
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em'
                    }}>
                        System Logs
                    </h1>

                    <p style={{
                        fontSize: '1.05rem',
                        lineHeight: 1.7,
                        opacity: 0.9,
                        maxWidth: '600px'
                    }}>
                        Monitor system activity, track changes, and maintain audit trail across all operations.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }}>
                    {[
                        { label: 'Total Logs', value: '1,234', icon: FileText, color: '#3D4F47' },
                        { label: 'Info', value: '856', icon: Activity, color: '#3b82f6' },
                        { label: 'Success', value: '312', icon: CheckCircle, color: '#10b981' },
                        { label: 'Warnings', value: '45', icon: AlertCircle, color: '#f59e0b' },
                        { label: 'Errors', value: '21', icon: XCircle, color: '#ef4444' }
                    ].map((stat, idx) => (
                        <div key={idx} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid #E3DDD0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{
                                background: `${stat.color}15`,
                                padding: '0.75rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <stat.icon size={24} color={stat.color} />
                            </div>
                            <div>
                                <p style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: '#15171A',
                                    margin: 0
                                }}>{stat.value}</p>
                                <p style={{
                                    fontSize: '0.85rem',
                                    color: '#6B6862',
                                    margin: 0
                                }}>{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logs Table */}
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #E3DDD0',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid #E3DDD0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.75rem',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: '#3D4F47',
                            margin: 0
                        }}>
                            Recent Activity
                        </h2>
                        <button style={{
                            background: '#3D4F47',
                            color: '#FAF8F4',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Activity size={16} />
                            Refresh
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                            <thead>
                                <tr style={{
                                    background: '#F3EFE6',
                                    borderBottom: '1px solid #E3DDD0'
                                }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#3D4F47', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#3D4F47', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#3D4F47', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Module</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#3D4F47', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#3D4F47', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, idx) => (
                                    <tr key={log.id} style={{
                                        borderBottom: idx < logs.length - 1 ? '1px solid #F3EFE6' : 'none',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#FAF8F4'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                color: getLevelColor(log.level),
                                                fontWeight: 500,
                                                fontSize: '0.85rem',
                                                textTransform: 'capitalize'
                                            }}>
                                                {getLevelIcon(log.level)}
                                                {log.level}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6B6862', fontFamily: "'JetBrains Mono', monospace" }}>
                                            {log.timestamp}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#15171A', fontWeight: 500 }}>
                                            {log.module}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6B6862', maxWidth: '400px' }}>
                                            {log.message}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6B6862' }}>
                                            {log.user}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LogsPage;