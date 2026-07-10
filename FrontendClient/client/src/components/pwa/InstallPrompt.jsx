import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

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
        <div className="install-wrapper">
            <style>{`
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .install-wrapper {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.85);
                    border: 1px solid rgba(250, 248, 244, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    max-width: 280px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 115, 85, 0.1);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    z-index: 9998;
                    color: #FAF8F4;
                    font-family: 'Inter', sans-serif;
                    animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                .install-header {
                    display: flex;
                    gap: 0.75rem;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                .install-icon-box {
                    width: 32px;
                    height: 32px;
                    background: rgba(139, 115, 85, 0.15);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #A98F6E;
                    flex-shrink: 0;
                }
                .install-title {
                    font-family: 'Fraunces', serif;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #FAF8F4;
                    margin: 0 0 0.15rem 0;
                    line-height: 1.2;
                }
                .install-desc {
                    font-size: 0.75rem;
                    color: rgba(250, 248, 244, 0.6);
                    margin: 0;
                    line-height: 1.4;
                }
                .install-close {
                    background: none;
                    border: none;
                    color: rgba(250, 248, 244, 0.4);
                    cursor: pointer;
                    padding: 0;
                    margin-left: auto;
                    transition: color 0.2s;
                }
                .install-close:hover { color: #FAF8F4; }
                
                .install-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .btn-sm {
                    flex: 1;
                    padding: 0.5rem 0.8rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.78rem;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.3rem;
                }
                .btn-install {
                    background: #8B7355;
                    color: #FAF8F4;
                    border: none;
                }
                .btn-install:hover {
                    background: #A98F6E;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(139, 115, 85, 0.3);
                }
                .btn-dismiss {
                    background: transparent;
                    color: rgba(250, 248, 244, 0.7);
                    border: 1px solid rgba(250, 248, 244, 0.15);
                }
                .btn-dismiss:hover {
                    color: #FAF8F4;
                    border-color: rgba(250, 248, 244, 0.4);
                }
            `}</style>

            <div className="install-header">
                <div className="install-icon-box">
                    <Smartphone size={18} />
                </div>
                <div>
                    <h3 className="install-title">Install App</h3>
                    <p className="install-desc">Add to home screen for quick access.</p>
                </div>
                <button className="install-close" onClick={handleDismiss} aria-label="Dismiss">
                    <X size={16} />
                </button>
            </div>

            <div className="install-actions">
                <button className="btn-sm btn-dismiss" onClick={handleDismiss}>
                    Not Now
                </button>
                <button className="btn-sm btn-install" onClick={handleInstall}>
                    <Download size={14} />
                    Install
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;