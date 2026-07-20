import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle, AlertCircle, Lock, KeyRound, RefreshCw } from '../../utils/icons/icons';
import { authApi } from '../../api/authApi';
import { ENDPOINTS } from '../../api/endpoints';
import api from '../../api/axios';

const C = {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassLight: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    verdigrisLight: '#4D6359',
    verdigrisTint: '#EBEFEF',
    line: '#E3DDD0',
    lineDark: 'rgba(250,248,244,0.14)',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    red: '#9B4A3F',
    redBg: '#F7ECE9',
    redLine: '#E8D2CC',
    success: '#475A43',
    successBg: '#EEF3EC',
    white: '#FFFFFF',
};

const Mark = ({ size = 28, color = C.verdigris }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
        <path d="M16 8V24M8 16H24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="3.5" fill={color} />
    </svg>
);

const Spinner = () => (
    <span className="cp-spinner" />
);

const AlertMessage = ({ type, text }) => {
    if (!text) return null;
    const config = {
        error: { bg: C.redBg, color: C.red, border: C.redLine, icon: AlertCircle },
        success: { bg: C.successBg, color: C.success, border: '#DCE6D9', icon: CheckCircle },
    };
    const s = config[type] || config.error;
    const Icon = s.icon;
    return (
        <div className="cp-alert" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
            <Icon size={16} />
            <span>{text}</span>
        </div>
    );
};

const PasswordStrength = ({ password }) => {
    if (!password) return null;

    const checks = [
        { label: 'At least 6 characters', met: password.length >= 6 },
        { label: 'Contains a number', met: /\d/.test(password) },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
    ];

    const score = checks.filter(c => c.met).length;
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['', C.red, '#B8860B', C.brass, C.success];

    return (
        <div className="cp-strength">
            <div className="cp-strength-header">
                <span className="cp-strength-label">Password strength</span>
                <span className="cp-strength-value" style={{ color: strengthColors[score] }}>
                    {strengthLabels[score]}
                </span>
            </div>
            <div className="cp-strength-bars">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="cp-strength-bar"
                        style={{
                            background: i <= score ? strengthColors[score] : C.line,
                        }}
                    />
                ))}
            </div>
            <div className="cp-strength-checks">
                {checks.map((c, i) => (
                    <div key={i} className={`cp-strength-check ${c.met ? 'met' : ''}`}>
                        {c.met ? <CheckCircle size={13} /> : <div className="cp-check-dot" />}
                        <span>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ChangePassword() {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showSuccess, setShowSuccess] = useState(false);
    const [email, setEmail] = useState(() => {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData).email || '' : '';
        } catch {
            return '';
        }
    });

    const clearMessage = () => { if (message.text) setMessage({ type: '', text: '' }); };

    const validateForm = () => {
        if (!currentPassword) {
            setMessage({ type: 'error', text: 'Please enter your current password.' });
            return false;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return false;
        }
        if (newPassword === currentPassword) {
            setMessage({ type: 'error', text: 'New password must be different from your current password.' });
            return false;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return false;
        }
        return true;
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
                email: email,
                currentPassword,
                newPassword,
                confirmPassword,
            });

            if (response.data?.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    navigate(-1);
                }, 2200);
            } else {
                setMessage({ type: 'error', text: response.data?.message || 'Could not change your password.' });
            }
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg?.toLowerCase().includes('current') || msg?.toLowerCase().includes('incorrect')) {
                setMessage({ type: 'error', text: 'Current password is incorrect.' });
            } else {
                setMessage({ type: 'error', text: msg || 'Something went wrong. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    }, [currentPassword, newPassword, confirmPassword, navigate]);

    return (
        <div className="cp-page-wrapper">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:${C.gray};background:${C.bone2};-webkit-font-smoothing:antialiased}
        h1,h2,h3,h4{font-family:'Fraunces',serif;font-weight:500;letter-spacing:-0.01em;color:${C.ink}}

        .cp-page-wrapper { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:1.5rem; background:${C.bone2}; }

        .cp-container { width:100%; max-width:920px; display:flex; background:${C.white}; border-radius:24px; overflow:hidden; box-shadow:0 40px 80px -20px rgba(21,23,26,0.12), 0 10px 20px rgba(21,23,26,0.04); min-height:580px; }

        /* Sidebar */
        .cp-sidebar { width:380px; background:#000000; padding:3rem 2.5rem; display:flex; flex-direction:column; justify-content:space-between; position:relative; overflow:hidden; flex-shrink:0; }
        .cp-sidebar-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; }
        .cp-sidebar-glow { position:absolute; inset:0; background:radial-gradient(circle at 70% 60%,rgba(139,115,85,0.15) 0%,transparent 60%); pointer-events:none; }
        .cp-sidebar-inner { position:relative; z-index:1; color:${C.bone}; height:100%; display:flex; flex-direction:column; }
        .cp-sidebar-logo { display:flex; align-items:center; gap:0.7rem; font-family:'Fraunces',serif; font-size:1.3rem; color:${C.bone}; margin-bottom:3rem; cursor:pointer; transition:opacity .2s; }
        .cp-sidebar-logo:hover { opacity:0.8; }

        .cp-sidebar-icon-wrap { width:48px; height:48px; border-radius:12px; background:rgba(139,115,85,0.12); border:1px solid rgba(139,115,85,0.2); display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; color:${C.brassLight}; }
        .cp-sidebar-headline { font-family:'Fraunces',serif; font-size:1.8rem; line-height:1.3; margin-bottom:1rem; color:${C.bone}; }
        .cp-sidebar-text { font-size:0.9rem; color:rgba(255,255,255,0.6); line-height:1.6; margin-bottom:0.6rem; }

        .cp-sidebar-tips { margin-top:2.5rem; padding-top:2rem; border-top:1px solid rgba(255,255,255,0.08); }
        .cp-sidebar-tips-title { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.35); margin-bottom:1rem; }
        .cp-sidebar-tip { display:flex; align-items:flex-start; gap:0.6rem; margin-bottom:0.75rem; font-size:0.82rem; color:rgba(255,255,255,0.55); line-height:1.5; }
        .cp-sidebar-tip-dot { width:5px; height:5px; border-radius:50%; background:${C.brassLight}; margin-top:0.4rem; flex-shrink:0; opacity:0.6; }

        .cp-sidebar-footer { font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:rgba(255,255,255,0.3); letter-spacing:0.05em; margin-top:auto; padding-top:2rem; }

        /* Form */
        .cp-form { flex:1; padding:3rem 3.5rem; display:flex; flex-direction:column; justify-content:center; }
        .cp-form-header { margin-bottom:1.8rem; }
        .cp-form-header h1 { font-size:1.8rem; margin-bottom:0.4rem; }
        .cp-form-header p { font-size:0.92rem; color:${C.gray}; line-height:1.5; }

        .cp-form-group { margin-bottom:1.1rem; }
        .cp-form-label { display:block; font-family:'JetBrains Mono',monospace; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase; color:${C.brass}; margin-bottom:0.5rem; font-weight:500; }
        .cp-form-hint { font-size:0.75rem; color:${C.gray}; margin-top:0.35rem; opacity:0.7; }

        .cp-input-wrap { position:relative; border:1px solid ${C.line}; border-radius:8px; background:${C.bone2}; transition:all .2s; }
        .cp-input-wrap:focus-within { border-color:${C.brass}; background:${C.white}; box-shadow:0 0 0 3px rgba(139,115,85,0.12); }
        .cp-input-wrap.has-error { border-color:${C.red}; }
        .cp-input-wrap.has-error:focus-within { box-shadow:0 0 0 3px rgba(155,74,63,0.1); }
        .cp-input { width:100%; padding:0.85rem 1rem; background:transparent; border:none; border-radius:8px; font-size:0.9rem; color:${C.ink}; font-family:'Inter',sans-serif; outline:none; }
        .cp-input::placeholder { color:${C.gray}; opacity:0.7; }
        .cp-input-icon-btn { position:absolute; right:0.5rem; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:${C.gray}; padding:0.5rem; display:flex; align-items:center; justify-content:center; transition:color .2s; border-radius:4px; }
        .cp-input-icon-btn:hover { color:${C.ink}; background:rgba(0,0,0,0.04); }

        .cp-alert { display:flex; align-items:center; gap:0.6rem; padding:0.8rem 1rem; border-radius:8px; border:1px solid; font-size:0.85rem; font-weight:500; margin-bottom:1.2rem; animation:cpFadeUp .35s cubic-bezier(0.16,1,0.3,1) both; }

        /* Password strength */
        .cp-strength { margin-top:0.5rem; margin-bottom:0.3rem; }
        .cp-strength-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem; }
        .cp-strength-label { font-size:0.72rem; color:${C.gray}; }
        .cp-strength-value { font-family:'JetBrains Mono',monospace; font-size:0.68rem; font-weight:600; letter-spacing:0.05em; text-transform:uppercase; }
        .cp-strength-bars { display:flex; gap:4px; margin-bottom:0.7rem; }
        .cp-strength-bar { height:3px; flex:1; border-radius:2px; transition:background .3s ease; }
        .cp-strength-checks { display:grid; grid-template-columns:1fr 1fr; gap:0.3rem 1rem; }
        .cp-strength-check { display:flex; align-items:center; gap:0.4rem; font-size:0.72rem; color:${C.gray}; opacity:0.5; transition:all .25s ease; }
        .cp-strength-check.met { opacity:1; color:${C.success}; }
        .cp-check-dot { width:13px; height:13px; border-radius:50%; border:1.5px solid ${C.line}; flex-shrink:0; }

        /* Divider */
        .cp-divider { display:flex; align-items:center; gap:1rem; margin:1.3rem 0; }
        .cp-divider-line { flex:1; height:1px; background:${C.line}; }
        .cp-divider-text { font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.1em; text-transform:uppercase; color:${C.gray}; opacity:0.5; white-space:nowrap; }

        /* Buttons */
        .cp-btn-primary { width:100%; padding:0.9rem 1.2rem; font-size:0.9rem; font-weight:600; font-family:'Inter',sans-serif; border:none; border-radius:8px; background:${C.ink}; color:${C.bone}; cursor:pointer; transition:all .3s ease; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
        .cp-btn-primary:hover:not(:disabled) { background:${C.verdigris}; transform:translateY(-1px); box-shadow:0 10px 20px rgba(21,23,26,0.15); }
        .cp-btn-primary:active:not(:disabled) { transform:translateY(0); }
        .cp-btn-primary:disabled { background:${C.gray}; cursor:not-allowed; opacity:0.5; transform:none; box-shadow:none; }

        .cp-btn-ghost { background:none; border:none; cursor:pointer; font-family:'Inter',sans-serif; font-size:0.85rem; font-weight:500; padding:0.4rem 0; display:inline-flex; align-items:center; gap:0.35rem; transition:color .2s; }
        .cp-btn-ghost.brass { color:${C.brass}; }
        .cp-btn-ghost.brass:hover { color:${C.brassLight}; }
        .cp-btn-ghost.verdigris { color:${C.verdigris}; }
        .cp-btn-ghost.verdigris:hover { color:${C.verdigrisDark}; }

        .cp-form-footer { margin-top:2rem; padding-top:1.5rem; border-top:1px solid ${C.line}; text-align:center; }
        .cp-encrypted-badge { display:flex; align-items:center; justify-content:center; gap:0.4rem; margin-top:0.8rem; font-size:0.7rem; font-family:'JetBrains Mono',monospace; color:${C.gray}; opacity:0.6; }

        .cp-spinner { width:16px; height:16px; border:2px solid rgba(250,248,244,0.3); border-top-color:${C.bone}; border-radius:50%; animation:cpSpin .65s linear infinite; display:inline-block; }

        /* Success modal */
        .cp-modal-overlay { position:fixed; inset:0; background:rgba(21,23,26,0.7); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:1000; animation:cpFadeIn .3s ease both; }
        .cp-modal-card { background:${C.white}; border-radius:16px; padding:2.5rem 2rem; text-align:center; max-width:380px; width:90%; animation:cpPopIn .4s cubic-bezier(0.16,1,0.3,1) both; box-shadow:0 40px 80px rgba(21,23,26,0.3); }
        .cp-modal-icon { width:56px; height:56px; border-radius:50%; background:${C.successBg}; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem; color:${C.success}; }
        .cp-modal-title { font-family:'Fraunces',serif; font-size:1.4rem; color:${C.ink}; margin-bottom:0.5rem; font-weight:500; }
        .cp-modal-text { font-size:0.9rem; color:${C.gray}; margin-bottom:1.5rem; }
        .cp-modal-progress { width:60%; height:4px; background:${C.line}; border-radius:2px; margin:0 auto; overflow:hidden; }
        .cp-modal-progress-bar { width:100%; height:100%; background:${C.verdigris}; border-radius:2px; animation:cpShimmer 1.2s ease infinite; background-size:200% 100%; background-image:linear-gradient(90deg,${C.verdigris} 0%,${C.verdigrisLight} 50%,${C.verdigris} 100%); }

        /* Animations */
        @keyframes cpSpin { to { transform:rotate(360deg); } }
        @keyframes cpFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cpFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes cpPopIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes cpShimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }

        /* Responsive */
        @media (max-width:768px) {
          .cp-container { flex-direction:column; max-width:440px; }
          .cp-sidebar { width:100%; padding:2rem; min-height:auto; }
          .cp-sidebar-logo { margin-bottom:1.5rem; }
          .cp-sidebar-headline { font-size:1.4rem; }
          .cp-sidebar-tips { display:none; }
          .cp-form { padding:2.5rem 2rem; }
          .cp-strength-checks { grid-template-columns:1fr; }
        }
        @media (max-width:480px) {
          .cp-page-wrapper { padding:0; }
          .cp-container { border-radius:0; min-height:100vh; }
          .cp-sidebar { padding:1.5rem; }
          .cp-sidebar-headline { display:none; }
          .cp-sidebar-text { display:none; }
          .cp-sidebar-icon-wrap { display:none; }
          .cp-form { padding:2rem 1.5rem; }
        }
      `}</style>

            <div className="cp-container">
                {/* Sidebar */}
                <div className="cp-sidebar">
                    <div className="cp-sidebar-grid" />
                    <div className="cp-sidebar-glow" />
                    <div className="cp-sidebar-inner">
                        <div className="cp-sidebar-logo" onClick={() => navigate('/')}>
                            <Mark size={28} color={C.brassLight} />
                            Rest Point
                        </div>

                        <div>
                            <div className="cp-sidebar-icon-wrap">
                                <KeyRound size={22} />
                            </div>
                            <h2 className="cp-sidebar-headline">Update your credentials.</h2>
                            <p className="cp-sidebar-text">Regularly changing your password is one of the simplest ways to keep your account secure.</p>
                        </div>

                        <div className="cp-sidebar-tips">
                            <div className="cp-sidebar-tips-title">Security tips</div>
                            <div className="cp-sidebar-tip">
                                <div className="cp-sidebar-tip-dot" />
                                <span>Use a unique password you don't use elsewhere</span>
                            </div>
                            <div className="cp-sidebar-tip">
                                <div className="cp-sidebar-tip-dot" />
                                <span>Mix uppercase, numbers, and symbols</span>
                            </div>
                            <div className="cp-sidebar-tip">
                                <div className="cp-sidebar-tip-dot" />
                                <span>Avoid personal info like names or dates</span>
                            </div>
                            <div className="cp-sidebar-tip">
                                <div className="cp-sidebar-tip-dot" />
                                <span>Consider a password manager for storage</span>
                            </div>
                        </div>

                        <div className="cp-sidebar-footer">
                            WELT TALLIS TECHNOLOGIES
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="cp-form">
                    <div className="cp-form-header">
                        <h1>Change password</h1>
                        <p>Enter your current password, then choose a new one.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <AlertMessage type={message.type} text={message.text} />

                        {/* Current password */}
                        <div className="cp-form-group">
                            <label className="cp-form-label">Current password</label>
                            <div className="cp-input-wrap">
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => { setCurrentPassword(e.target.value); clearMessage(); }}
                                    placeholder="Enter your current password"
                                    disabled={loading}
                                    autoComplete="current-password"
                                    className="cp-input"
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    disabled={loading}
                                    className="cp-input-icon-btn"
                                >
                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="cp-divider">
                            <div className="cp-divider-line" />
                            <span className="cp-divider-text">New password</span>
                            <div className="cp-divider-line" />
                        </div>

                        {/* New password */}
                        <div className="cp-form-group">
                            <label className="cp-form-label">New password</label>
                            <div className="cp-input-wrap">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); clearMessage(); }}
                                    placeholder="Create a strong password"
                                    disabled={loading}
                                    autoComplete="new-password"
                                    className="cp-input"
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    disabled={loading}
                                    className="cp-input-icon-btn"
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <PasswordStrength password={newPassword} />
                        </div>

                        {/* Confirm password */}
                        <div className="cp-form-group" style={{ marginTop: '0.3rem' }}>
                            <label className="cp-form-label">Confirm new password</label>
                            <div className={`cp-input-wrap ${confirmPassword && confirmPassword !== newPassword ? 'has-error' : ''}`}>
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); clearMessage(); }}
                                    placeholder="Repeat your new password"
                                    disabled={loading}
                                    autoComplete="new-password"
                                    className="cp-input"
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    disabled={loading}
                                    className="cp-input-icon-btn"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {confirmPassword && confirmPassword !== newPassword && (
                                <span className="cp-form-hint" style={{ color: C.red, opacity: 1 }}>
                                    Passwords do not match
                                </span>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                            className="cp-btn-primary"
                            style={{ marginTop: '1.4rem' }}
                        >
                            {loading ? (
                                <><Spinner /><span>Updating password...</span></>
                            ) : (
                                <><RefreshCw size={16} /><span>Update password</span></>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="cp-form-footer">
                        <button onClick={() => navigate(-1)} className="cp-btn-ghost verdigris" style={{ fontWeight: 500, fontSize: '0.88rem' }}>
                            <ArrowLeft size={14} /> Go back
                        </button>
                        <div className="cp-encrypted-badge">
                            <ShieldCheck size={12} />
                            <span>End-to-end encrypted</span>
                            <span style={{ opacity: 0.3 }}>·</span>
                            <span>© 2026 Rest Point</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="cp-modal-overlay">
                    <div className="cp-modal-card">
                        <div className="cp-modal-icon">
                            <CheckCircle size={28} />
                        </div>
                        <h3 className="cp-modal-title">Password updated</h3>
                        <p className="cp-modal-text">Your password has been changed successfully. You may need to sign in again on other devices.</p>
                        <div className="cp-modal-progress">
                            <div className="cp-modal-progress-bar" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}