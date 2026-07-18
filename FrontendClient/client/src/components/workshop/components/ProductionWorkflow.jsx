import React, { useState, useEffect } from 'react';
import { useSocket } from '../../../utils/context/socketContext';
import { useSocketEvents } from '../hooks/useSocketEvents';
import {
    CheckCircle2, Circle, Play, Pause,
    Clock, User, AlertTriangle, ChevronRight
} from 'lucide-react';

const PRODUCTION_STAGES = [
    { id: 'design', name: 'Design', description: 'Create coffin design specifications' },
    { id: 'cutting', name: 'Cutting', description: 'Cut materials according to design' },
    { id: 'assembly', name: 'Assembly', description: 'Assemble coffin components' },
    { id: 'polishing', name: 'Polishing', description: 'Polish and smooth surfaces' },
    { id: 'finishing', name: 'Finishing', description: 'Final touches and quality check' }
];

const ProductionWorkflow = ({ order, onUpdate }) => {
    const [stages, setStages] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const { connected } = useSocket();

    useEffect(() => {
        if (order?.stages) {
            setStages(order.stages);
        }
    }, [order]);

    // Real-time updates for production stages
    useSocketEvents({
        onProductionStageUpdated: (updatedStage) => {
            if (updatedStage.coffin_order_id === order?.id) {
                setStages(prev => prev.map(s => s.id === updatedStage.id ? updatedStage : s));
            }
        }
    });

    const getStageStatus = (stage) => {
        if (stage.completed_at) return 'completed';
        if (stage.started_at) return 'in_progress';
        return 'pending';
    };

    const getStageIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={20} style={{ color: '#14DD3C' }} />;
            case 'in_progress': return <Play size={20} style={{ color: '#2563eb' }} />;
            default: return <Circle size={20} style={{ color: '#cbd5e1' }} />;
        }
    };

    const getStageColor = (status) => {
        switch (status) {
            case 'completed': return { bg: '#f0fdf4', border: '#14DD3C' };
            case 'in_progress': return { bg: '#eff6ff', border: '#2563eb' };
            default: return { bg: '#f8fafc', border: '#e2e8f0' };
        }
    };

    const handleStageClick = async (stage) => {
        const status = getStageStatus(stage);
        if (status === 'completed') return; // Can't update completed stages

        setIsUpdating(true);
        try {
            const updates = {};

            if (status === 'pending') {
                // Start the stage
                updates.status = 'in_progress';
                updates.started_at = new Date().toISOString();
            } else if (status === 'in_progress') {
                // Complete the stage
                updates.status = 'completed';
                updates.completed_at = new Date().toISOString();
            }

            // Emit update via socket
            const { emit } = useSocket();
            emit('update_stage', { stageId: stage.id, ...updates });

            // Update local state
            setStages(prev => prev.map(s =>
                s.id === stage.id ? { ...s, ...updates } : s
            ));

            // Check if all stages are completed
            const updatedStages = stages.map(s =>
                s.id === stage.id ? { ...s, ...updates } : s
            );

            const allCompleted = updatedStages.every(s => getStageStatus(s) === 'completed');
            if (allCompleted && onUpdate) {
                onUpdate({ ...order, status: 'completed', stages: updatedStages });
            }
        } catch (error) {
            console.error('Error updating stage:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const calculateProgress = () => {
        if (!stages.length) return 0;
        const completed = stages.filter(s => getStageStatus(s) === 'completed').length;
        return (completed / stages.length) * 100;
    };

    const progress = calculateProgress();

    return (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                        Production Workflow
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Order #{order?.order_number || order?.id}
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: progress === 100 ? '#f0fdf4' : '#f8fafc',
                    borderRadius: '8px'
                }}>
                    <div style={{
                        width: '100px',
                        height: '8px',
                        background: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: progress === 100 ? '#14DD3C' : '#2563eb',
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {PRODUCTION_STAGES.map((stageConfig, index) => {
                    const stage = stages.find(s => s.stage === stageConfig.id) || {
                        stage: stageConfig.id,
                        status: 'pending'
                    };
                    const status = getStageStatus(stage);
                    const colors = getStageColor(status);

                    return (
                        <div key={stageConfig.id}>
                            <div
                                onClick={() => handleStageClick(stage)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: colors.bg,
                                    border: `2px solid ${colors.border}`,
                                    borderRadius: '10px',
                                    cursor: status === 'completed' ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: isUpdating ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (status !== 'completed') {
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ flexShrink: 0 }}>
                                    {getStageIcon(status)}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '0.25rem'
                                    }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: '#64748b',
                                            background: 'white',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: '4px'
                                        }}>
                                            STEP {index + 1}
                                        </span>
                                        <span style={{
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            color: '#0f172a'
                                        }}>
                                            {stageConfig.name}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.8rem',
                                        color: '#64748b'
                                    }}>
                                        {stageConfig.description}
                                    </p>

                                    {stage.started_at && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            marginTop: '0.5rem',
                                            fontSize: '0.75rem',
                                            color: '#64748b'
                                        }}>
                                            <Clock size={12} />
                                            <span>
                                                {status === 'completed' ? 'Completed' : 'Started'}: {' '}
                                                {new Date(stage.started_at).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ flexShrink: 0 }}>
                                    {status === 'pending' && (
                                        <span style={{
                                            padding: '0.4rem 0.8rem',
                                            background: 'white',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500,
                                            color: '#64748b'
                                        }}>
                                            Not Started
                                        </span>
                                    )}
                                    {status === 'in_progress' && (
                                        <span style={{
                                            padding: '0.4rem 0.8rem',
                                            background: '#2563eb',
                                            color: 'white',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            In Progress
                                        </span>
                                    )}
                                    {status === 'completed' && (
                                        <span style={{
                                            padding: '0.4rem 0.8rem',
                                            background: '#14DD3C',
                                            color: 'white',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            Completed
                                        </span>
                                    )}
                                </div>

                                {status !== 'completed' && (
                                    <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                                )}
                            </div>

                            {index < PRODUCTION_STAGES.length - 1 && (
                                <div style={{
                                    marginLeft: '2.1rem',
                                    paddingLeft: '1rem',
                                    borderLeft: '2px dashed #e2e8f0',
                                    height: '1rem'
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {connected && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#f0fdf4',
                    border: '1px solid #14DD3C',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#166534'
                }}>
                    <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#14DD3C',
                        boxShadow: '0 0 6px #14DD3C'
                    }} />
                    Real-time updates active - Changes sync across all users
                </div>
            )}
        </div>
    );
};

export default ProductionWorkflow;