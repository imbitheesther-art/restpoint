import React from 'react';
import {
    Move, Type, Pen, Eraser, Square, Circle,
    Trash2, RefreshCw, Image as ImageIcon, X
} from 'lucide-react';
import { COLOR_PRESETS } from './helpers';

// ============================================
// TOOL BUTTON COMPONENT
// ============================================

const ToolButton = ({ icon, active, onClick, title, disabled }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        style={{
            width: '100%',
            height: '42px',
            borderRadius: '8px',
            border: active ? '1.5px solid #c9a84c' : '1px solid #475569',
            backgroundColor: active ? 'rgba(201, 168, 76, 0.15)' : '#334155',
            color: active ? '#c9a84c' : '#cbd5e1',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            opacity: disabled ? 0.5 : 1
        }}
    >
        {icon}
    </button>
);

// ============================================
// SQUARE BUTTON COMPONENT
// ============================================

const SquareButton = ({ children, onClick, title, disabled, style }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        style={{
            width: '100%',
            height: '56px',
            borderRadius: '8px',
            border: '1px solid #475569',
            backgroundColor: '#334155',
            color: '#cbd5e1',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            opacity: disabled ? 0.5 : 1,
            ...style
        }}
    >
        {children}
    </button>
);

// ============================================
// LEFT PANEL COMPONENT
// ============================================

const LeftPanel = ({
    activeTool,
    setActiveTool,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    selectedObject,
    isLoading,
    onAddText,
    onAddRectangle,
    onAddCircle,
    onAddLine,
    onAddArrow,
    onAddStamp,
    onOpenSignature,
    onImportImage,
    onDeleteSelected,
    onClearCanvas
}) => {
    return (
        <div style={{
            width: '180px',
            backgroundColor: '#1e293b',
            borderRight: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 12px',
            gap: '12px',
            overflowY: 'auto',
            boxSizing: 'border-box'
        }}>
            {/* Tools Section */}
            <div>
                <h4 style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '8px 0 4px 0'
                }}>
                    Tools
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                }}>
                    <ToolButton
                        icon={<Move size={18} />}
                        active={activeTool === 'select'}
                        onClick={() => setActiveTool('select')}
                        title="Select / Move Elements"
                        disabled={isLoading}
                    />
                    <ToolButton
                        icon={<Type size={18} />}
                        active={activeTool === 'text'}
                        onClick={() => { setActiveTool('select'); onAddText(); }}
                        title="Add Editable Text"
                        disabled={isLoading}
                    />
                    <ToolButton
                        icon={<Pen size={18} />}
                        active={activeTool === 'pen'}
                        onClick={() => setActiveTool('pen')}
                        title="Freehand Pencil"
                        disabled={isLoading}
                    />
                    <ToolButton
                        icon={<Eraser size={18} />}
                        active={activeTool === 'eraser'}
                        onClick={() => setActiveTool('eraser')}
                        title="Eraser (White Brush)"
                        disabled={isLoading}
                    />
                    <ToolButton
                        icon={<Square size={18} />}
                        active={activeTool === 'rect'}
                        onClick={() => { setActiveTool('select'); onAddRectangle(); }}
                        title="Draw Rectangle"
                        disabled={isLoading}
                    />
                    <ToolButton
                        icon={<Circle size={18} />}
                        active={activeTool === 'circle'}
                        onClick={() => { setActiveTool('select'); onAddCircle(); }}
                        title="Draw Circle"
                        disabled={isLoading}
                    />
                    <ToolButton
                        icon={<div style={{ width: '18px', height: '2px', background: 'currentColor' }} />}
                        active={activeTool === 'line'}
                        onClick={() => { setActiveTool('select'); onAddLine(); }}
                        title="Draw Line"
                        disabled={isLoading}
                    />
                    <ToolButton
                        icon={<div style={{ width: '0', height: '0', borderLeft: '9px solid currentColor', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' }} />}
                        active={activeTool === 'arrow'}
                        onClick={() => { setActiveTool('select'); onAddArrow(); }}
                        title="Draw Arrow"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Divider */}
            <div style={{
                height: '1px',
                backgroundColor: '#334155',
                margin: '8px 0'
            }} />

            {/* Shapes & Stamps Section */}
            <div>
                <h4 style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '8px 0 4px 0'
                }}>
                    Shapes & Stamps
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                }}>
                    <SquareButton
                        onClick={() => { setActiveTool('select'); onAddStamp('APPROVED'); }}
                        title="Add Approved Stamp"
                        disabled={isLoading}
                    >
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626' }}>✓</div>
                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Approved</span>
                    </SquareButton>
                    <SquareButton
                        onClick={() => { setActiveTool('select'); onAddStamp('REJECTED'); }}
                        title="Add Rejected Stamp"
                        disabled={isLoading}
                    >
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626' }}>✗</div>
                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Rejected</span>
                    </SquareButton>
                    <SquareButton
                        onClick={() => { setActiveTool('select'); onAddStamp('PENDING'); }}
                        title="Add Pending Stamp"
                        disabled={isLoading}
                    >
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#f59e0b' }}>⏳</div>
                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Pending</span>
                    </SquareButton>
                </div>
            </div>

            {/* Divider */}
            <div style={{
                height: '1px',
                backgroundColor: '#334155',
                margin: '8px 0'
            }} />

            {/* Insert Section */}
            <div>
                <h4 style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '8px 0 4px 0'
                }}>
                    Insert
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                }}>
                    <SquareButton
                        onClick={() => { setActiveTool('select'); onOpenSignature(); }}
                        title="Add Signature"
                        disabled={isLoading}
                    >
                        <div style={{ fontSize: '18px' }}>✒️</div>
                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Signature</span>
                    </SquareButton>
                    <SquareButton
                        onClick={onImportImage}
                        title="Upload Image"
                        disabled={isLoading}
                    >
                        <ImageIcon size={18} />
                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Image</span>
                    </SquareButton>
                </div>
            </div>

            {/* Divider */}
            <div style={{
                height: '1px',
                backgroundColor: '#334155',
                margin: '8px 0'
            }} />

            {/* Brush Color Section */}
            <div>
                <h4 style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '8px 0 4px 0'
                }}>
                    Brush Color
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '6px',
                    justifyContent: 'center'
                }}>
                    {COLOR_PRESETS.map(color => (
                        <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: color,
                                border: brushColor === color ? '2px solid #c9a84c' : '1px solid #4b5563',
                                cursor: 'pointer',
                                padding: 0
                            }}
                            title={color}
                            disabled={isLoading}
                        />
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div style={{
                height: '1px',
                backgroundColor: '#334155',
                margin: '8px 0'
            }} />

            {/* Brush Size Section */}
            <div>
                <h4 style={{
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '8px 0 4px 0'
                }}>
                    Brush Size: {brushSize}px
                </h4>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    style={{
                        width: '100%',
                        accentColor: '#c9a84c',
                        cursor: 'pointer'
                    }}
                    disabled={isLoading}
                />
            </div>

            {/* Divider */}
            {selectedObject && (
                <>
                    <div style={{
                        height: '1px',
                        backgroundColor: '#334155',
                        margin: '8px 0'
                    }} />
                    <div>
                        <h4 style={{
                            color: '#9ca3af',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: '8px 0 4px 0'
                        }}>
                            Actions
                        </h4>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <SquareButton
                                onClick={onDeleteSelected}
                                style={{
                                    backgroundColor: '#7f1d1d',
                                    color: '#fca5a5',
                                    width: '100%',
                                    height: '40px'
                                }}
                                title="Delete Selected (Del)"
                                disabled={isLoading}
                            >
                                <Trash2 size={16} style={{ marginRight: '6px' }} />
                                Delete
                            </SquareButton>
                            <SquareButton
                                onClick={onClearCanvas}
                                style={{
                                    backgroundColor: '#991b1b',
                                    color: '#fca5a5',
                                    width: '100%',
                                    height: '40px'
                                }}
                                title="Clear All"
                                disabled={isLoading}
                            >
                                <RefreshCw size={16} style={{ marginRight: '6px' }} />
                                Clear All
                            </SquareButton>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LeftPanel;