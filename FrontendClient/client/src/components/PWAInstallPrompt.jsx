import { useState, useEffect } from 'react';

/**
 * PWA Install Prompt Component
 * Shows a floating "Install App" button when the PWA is installable
 */
const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebApp = window.navigator.standalone === true;

        if (isStandalone || isInWebApp) {
            setIsInstalled(true);
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Show the install prompt UI
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`[PWA] User response to install prompt: ${outcome}`);

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for this session
        sessionStorage.setItem('pwa-install-dismissed', 'true');
    };

    // Don't show if already installed or dismissed this session
    if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
        return null;
    }

    return (
        <div className="pwa-install-prompt" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '400px',
            background: 'linear-gradient(135deg, #3D4F47 0%, #15171A 100%)',
            border: '1px solid #A98F6E',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            animation: 'slideInRight 0.5s ease-out'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px'
            }}>
                <img
                    src="/logo.png"
                    alt="Rest Point"
                    style={{
                        width: '48px',
                        height: '48px',
                        marginRight: '12px',
                        borderRadius: '8px'
                    }}
                />
                <div>
                    <h3 style={{
                        margin: 0,
                        color: '#FAF8F4',
                        fontSize: '1.1rem',
                        fontWeight: 600
                    }}>
                        Install Rest Point
                    </h3>
                    <p style={{
                        margin: '4px 0 0 0',
                        color: '#A98F6E',
                        fontSize: '0.85rem'
                    }}>
                        Get quick access from your desktop
                    </p>
                </div>
            </div>

            <p style={{
                margin: '0 0 16px 0',
                color: '#FAF8F4',
                fontSize: '0.9rem',
                lineHeight: '1.5'
            }}>
                Install our app for faster access, offline support, and a better experience.
            </p>

            <div style={{
                display: 'flex',
                gap: '8px'
            }}>
                <button
                    onClick={handleInstallClick}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #A98F6E 0%, #8B7355 100%)',
                        color: '#15171A',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(169, 143, 110, 0.3)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    Install App
                </button>
                <button
                    onClick={handleDismiss}
                    style={{
                        padding: '10px 16px',
                        background: 'transparent',
                        color: '#FAF8F4',
                        border: '1px solid rgba(250, 248, 244, 0.2)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = 'rgba(250, 248, 244, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'transparent';
                    }}
                >
                    Not Now
                </button>
            </div>

            <style>
                {`
          @keyframes slideInRight {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
            </style>
        </div>
    );
};

export default PWAInstallPrompt;