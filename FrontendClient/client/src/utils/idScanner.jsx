import React, { useState } from 'react';
import { QRScanner } from '@vkhangstack/veloqr';

export const IDScannerComponent = ({ onScanComplete, onClose, autoCapture, captureDelay }) => {
    const [isScanning, setIsScanning] = useState(true);

    const handleDecode = (result) => {
        if (result && result.data) {
            setIsScanning(false);
            if (onScanComplete) {
                // Return string directly, or whatever deceasedIntake expects
                onScanComplete({ text: result.data, data: result.data }); 
            }
        }
    };

    const handleError = (error) => {
        console.error("Scanner Error:", error);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(21, 23, 26, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
        }}>
            <div style={{ 
                background: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #E3DDD0',
                width: '100%',
                maxWidth: '500px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #E3DDD0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#15171A', margin: 0 }}>
                        Scan ID QR Code
                    </h3>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6B6862' }}
                    >
                        &times;
                    </button>
                </div>
                
                <div style={{ padding: '1.5rem', background: '#FAF8F4' }}>
                    {isScanning ? (
                        <>
                            <div style={{ overflow: 'hidden', borderRadius: '8px', border: '2px dashed #8B7355', marginBottom: '1.5rem', background: '#000' }}>
                                <QRScanner
                                    onDecode={handleDecode}
                                    onError={handleError}
                                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                                    facingMode="environment" // Use rear camera by default
                                />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <button 
                                    onClick={onClose}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#F3EFE6',
                                        color: '#15171A',
                                        border: '1px solid #E3DDD0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        width: '100%'
                                    }}
                                >
                                    Cancel Scanning
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <p style={{ color: '#475A43', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                                Scan Complete!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IDScannerComponent;