import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#15171A',
            border: '2px solid #4D6359',
            borderRadius: '8px',
            padding: '1.5rem',
            maxWidth: '350px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 9999,
            color: '#FAF8F4',
        }}>
            <h3 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '1.2rem',
                marginBottom: '0.5rem',
                color: '#FAF8F4',
            }}>
                Install Rest Point
            </h3>
            <p style={{
                fontSize: '0.9rem',
                color: 'rgba(250,248,244,0.8)',
                marginBottom: '1rem',
                lineHeight: 1.5,
            }}>
                Install our app for quick access and a better experience, even offline.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={handleInstall}
                    style={{
                        flex: 1,
                        padding: '0.6rem 1rem',
                        background: '#4D6359',
                        color: '#FAF8F4',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#3D4F47'}
                    onMouseLeave={(e) => e.target.style.background = '#4D6359'}
                >
                    Install
                </button>
                <button
                    onClick={handleDismiss}
                    style={{
                        flex: 1,
                        padding: '0.6rem 1rem',
                        background: 'transparent',
                        color: 'rgba(250,248,244,0.7)',
                        border: '1px solid rgba(250,248,244,0.3)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = '#FAF8F4';
                        e.target.style.color = '#FAF8F4';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = 'rgba(250,248,244,0.3)';
                        e.target.style.color = 'rgba(250,248,244,0.7)';
                    }}
                >
                    Not Now
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;