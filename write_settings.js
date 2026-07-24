const fs = require('fs');
const path = require('path');

const code = `import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';

const THEME = {
    colors: {
        ink: '#15171A',
        bone: '#FAF8F4',
        bone2: '#F3EFE6',
        brass: '#8B7355',
        brassHover: '#A98F6E',
        brassLight: '#F5F0E8',
        line: '#E3DDD0',
        gray: '#6B6862',
        white: '#FFFFFF',
        success: '#475A43',
        successBg: '#EEF3EC',
        red: '#9B4A3F',
        redBg: '#F7ECE9',
        amber: '#7A5C1E',
        amberBg: '#FEF6E4',
    },
};

const fmt = (amount, currency) =>
    (currency || 'KES') + ' ' + Number(amount || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const tabBtn = (active) => ({
    padding: '0.75rem 1.25rem', background: 'none', border: 'none',
    borderBottom: '2px solid ' + (active ? THEME.colors.brass : 'transparent'),
    color: active ? THEME.colors.ink : THEME.colors.gray,
    fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", marginBottom: '-1px', whiteSpace: 'nowrap',
});

const inputStyle = {
    width: '100%', padding: '0.6rem 0.75rem',
    border: '1px solid ' + THEME.colors.line, borderRadius: '6px',
    fontSize: '0.88rem', fontFamily: "'Inter', sans-serif",
    background: THEME.colors.white, color: THEME.colors.ink, outline: 'none',
};

const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 600, color: THEME.colors.gray,
    textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem',
};

export default function SettingsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('charges');
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [cs, setCs] = useState({
        daily_storage_rate: 500, initial_admission_fee: 2000, embalming_fee: 5000,
        viewing_fee_per_session: 1000, certificate_processing_fee: 500,
        currency: 'KES', charge_type: 'daily', free_days: 0, notes: '',
    });
    const [csLoading, setCsLoading] = useState(false);
    const [csSaving, setCsSaving] = useState(false);
    const [csSaved, setCsSaved] = useState(false);
    const [csError, setCsError] = useState(null);
    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [uf, setUf] = useState({ email: '', password: '', full_name: '', phone: '', role: 'staff', branch_id: '' });

    useEffect(() => {
        const ud = localStorage.getItem('user');
        if (ud) {
            const u = JSON.parse(ud); setCurrentUser(u);
            if (u.role === 'driver') { navigate('/driver-portal'); return; }
        }
        loadData();
    }, [navigate]);

    const loadData = async () => {
        try {
            const slug = localStorage.getItem('tenantSlug');
            const [sr, ur, br] = await Promise.all([
                api.get(ENDPOINTS.TENANT.SETTINGS(slug)),
                api.get(ENDPOINTS.TENANT.USERS(slug)),
                api.get(ENDPOINTS.TENANT.BRANCHES(slug)),
            ]);
            setSettings(sr.data.data); setUsers(ur.data.data || []); setBranches(br.data.data || []);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const loadChargeSettings = useCallback(async () => {
        const slug = localStorage.getItem('tenantSlug');
        if (!slug) return;
        setCsLoading(true); setCsError(null);
        try {
            const res = await api.get(ENDPOINTS.TENANT.MORTUARY_CHARGES(slug));
            if (res.data && res.data.data) {
                const d = res.data.data;
                setCs({
                    daily_storage_rate: d.daily_storage_rate != null ? d.daily_storage_rate : 500,
                    initial_admission_fee: d.initial_admission_fee != null ? d.initial_admission_fee : 2000,
                    embalming_fee: d.embalming_fee != null ? d.embalming_fee : 5000,
                    viewing_fee_per_session: d.viewing_fee_per_session != null ? d.viewing_fee_per_session : 1000,
                    certificate_processing_fee: d.certificate_processing_fee != null ? d.certificate_processing_fee : 500,
                    currency: d.currency || 'KES', charge_type: d.charge_type || 'daily',
                    free_days: d.free_days != null ? d.free_days : 0, notes: d.notes || '',
                });
            }
        } catch (e) { setCsError('Could not load saved settings. Showing defaults.'); }
        finally { setCsLoading(false); }
    }, []);

    const loadPreview = useCallback(async () => {
        const slug = localStorage.getItem('tenantSlug');
        if (!slug) return;
        setPreviewLoading(true);
        try {
            const res = await api.get(ENDPOINTS.TENANT.MORTUARY_CHARGES_PREVIEW(slug));
            setPreview(res.data && res.data.data ? res.data.data : null);
        } catch (e) { console.error(e); } finally { setPreviewLoading(false); }
    }, []);

    useEffect(() => {
        if (activeTab === 'charges') { loadChargeSettings(); loadPreview(); }
    }, [activeTab, loadChargeSettings, loadPreview]);

    const handleSaveCharges = async (e) => {
        e.preventDefault();
        const slug = localStorage.getItem('tenantSlug');
        setCsSaving(true); setCsError(null); setCsSaved(false);
        try {
            await api.put(ENDPOINTS.TENANT.MORTUARY_CHARGES(slug), cs);
            setCsSaved(true); loadPreview(); setTimeout(() => setCsSaved(false), 3500);
        } catch (e) { setCsError(e.response && e.response.data ? e.response.data.message : 'Failed to save.'); }
        finally { setCsSaving(false); }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const slug = localStorage.getItem('tenantSlug');
            await api.post(ENDPOINTS.TENANT.CREATE_USER(slug), { ...uf, branch_id: uf.branch_id || null });
            setShowAddUserModal(false);
            setUf({ email: '', password: '', full_name: '', phone: '', role: 'staff', branch_id: '' });
            loadData();
        } catch (e) { alert(e.response && e.response.data ? e.response.data.message : 'Failed to add user'); }
    };

    const isMulti = settings && settings.deploymentType === 'multi';
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isMgr = (currentUser && currentUser.role === 'manager') || isAdmin;

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: THEME.colors.bone }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid ' + THEME.colors.line, borderTopColor: THEME.colors.brass, borderRadius: '50%', animation: 'spin 0.65s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ color: THEME.colors.gray, fontSize: '0.88rem' }}>Loading settings...</p>
            </div>
        </div>
    );

    const feeFields = [
        { key: 'initial_admission_fee', label: 'Initial Admission Fee', help: 'One-time fee on admission' },
        { key: 'daily_storage_rate', label: (cs.charge_type === 'hourly' ? 'Hourly' : 'Daily') + ' Storage Rate', help: 'Per ' + (cs.charge_type === 'hourly' ? 'hour' : 'day') + ' of stay' },
        { key: 'embalming_fee', label: 'Embalming Fee', help: 'Charged when embalming is performed' },
        { key: 'viewing_fee_per_session', label: 'Viewing Fee (per session)', help: 'Per family viewing session' },
        { key: 'certificate_processing_fee', label: 'Certificate Processing Fee', help: 'Documentation processing fee' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: THEME.colors.bone, fontFamily: "'Inter', sans-serif" }}>
            <style>{\`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
                .si:focus { border-color: #8B7355 !important; box-shadow: 0 0 0 3px #F5F0E8; }
                .cr:hover { background: #F3EFE6 !important; }
                .pr:hover td { background: #FAF8F4 !important; }
                .sb:hover:not(:disabled) { background: #A98F6E !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(139,115,85,0.3); }
                .sb:disabled { opacity:0.6; cursor:not-allowed; }
            \`}</style>

            <div style={{ background: THEME.colors.white, borderBottom: '1px solid ' + THEME.colors.line, padding: '1.5rem 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: THEME.colors.ink, marginBottom: '0.25rem' }}>Settings</h1>
                        <p style={{ fontSize: '0.85rem', color: THEME.colors.gray }}>
                            {isMulti ? 'Multi-Branch' : 'Single Location'}{settings ? ' \u2022 ' + settings.tenantName : ''}
                        </p>
                    </div>
                    {isMgr && activeTab === 'users' && (
                        <button onClick={() => setShowAddUserModal(true)} style={{ padding: '0.6rem 1.2rem', background: THEME.colors.brass, color: THEME.colors.white, border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>+ Add User</button>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                <div style={{ padding: '1.25rem 1.5rem', background: THEME.colors.white, border: '1px solid ' + THEME.colors.line, borderRadius: '10px', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
                        {[['Organization', settings && settings.tenantName],['Location', settings && settings.location || 'Not set'],['Country', settings && settings.country || 'Not set'],['Email', settings && settings.email || 'Not set']].map(([l,v]) => (
                            <div key={l}>
                                <p style={{ fontSize: '0.72rem', color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{l}</p>
                                <p style={{ fontSize: '0.9rem', color: THEME.colors.ink, fontWeight: 500 }}>{v}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid ' + THEME.colors.line, overflowX: 'auto' }}>
                    <button onClick={() => setActiveTab('charges')} style={tabBtn(activeTab === 'charges')}>Mortuary Charges</button>
                    {isMgr && <button onClick={() => setActiveTab('users')} style={tabBtn(activeTab === 'users')}>Users &amp; Roles</button>}
                    {isMulti && <button onClick={() => setActiveTab('branches')} style={tabBtn(activeTab === 'branches')}>Branches</button>}
                    <button onClick={() => setActiveTab('analytics')} style={tabBtn(activeTab === 'analytics')}>Analytics</button>
                </div>

                {activeTab === 'charges' && (
                    <div style={{ animation: 'fadeIn 0.25s ease' }}>
                        {csLoading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: THEME.colors.white, borderRadius: '10px', border: '1px solid ' + THEME.colors.line }}>
                                <div style={{ width: '36px', height: '36px', border: '3px solid ' + THEME.colors.line, borderTopColor: THEME.colors.brass, borderRadius: '50%', animation: 'spin 0.65s linear infinite', margin: '0 auto 0.75rem' }} />
                                <p style={{ color: THEME.colors.gray, fontSize: '0.88rem' }}>Loading charge settings...</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ background: THEME.colors.white, border: '1px solid ' + THEME.colors.line, borderRadius: '10px', padding: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: THEME.colors.ink, marginBottom: '0.25rem' }}>Default Mortuary Fee Structure</h3>
                                        <p style={{ fontSize: '0.8rem', color: THEME.colors.gray, marginBottom: '1.25rem' }}>Applies to every deceased admitted to this facility</p>

                                        {csError && <div style={{ padding: '0.75rem', background: THEME.colors.redBg, border: '1px solid rgba(155,74,63,0.25)', borderRadius: '6px', fontSize: '0.82rem', color: THEME.colors.red, marginBottom: '1rem' }}>{csError}</div>}
                                        {csSaved && <div style={{ padding: '0.75rem', background: THEME.colors.successBg, border: '1px solid rgba(71,90,67,0.25)', borderRadius: '6px', fontSize: '0.82rem', color: THEME.colors.success, marginBottom: '1rem', animation: 'fadeIn 0.2s ease' }}>Charge settings saved successfully!</div>}

                                        <form onSubmit={handleSaveCharges}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div>
                                                    <label style={labelStyle}>Currency</label>
                                                    <select className="si" value={cs.currency} onChange={e => setCs(p => ({ ...p, currency: e.target.value }))} style={inputStyle}>
                                                        {['KES','USD','UGX','TZS','ETB','GHS','NGN','ZAR','EUR','GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={labelStyle}>Charge Interval</label>
                                                    <select className="si" value={cs.charge_type} onChange={e => setCs(p => ({ ...p, charge_type: e.target.value }))} style={inputStyle}>
                                                        <option value="daily">Daily Rate</option>
                                                        <option value="hourly">Hourly Rate</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={labelStyle}>Free Grace Days</label>
                                                <input className="si" type="number" min="0" value={cs.free_days} onChange={e => setCs(p => ({ ...p, free_days: e.target.value }))} style={inputStyle} placeholder="0" />
                                                <p style={{ fontSize: '0.74rem', color: THEME.colors.gray, marginTop: '0.3rem' }}>Days after admission before storage charges begin</p>
                                            </div>

                                            <label style={{ ...labelStyle, marginBottom: '0.6rem' }}>Fee Schedule</label>
                                            {feeFields.map(f => (
                                                <div key={f.key} className="cr" style={{ marginBottom: '0.75rem', padding: '0.875rem', borderRadius: '8px', border: '1px solid ' + THEME.colors.line, transition: 'background 0.15s' }}>
                                                    <label style={labelStyle}>{f.label}</label>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: THEME.colors.gray, minWidth: '44px' }}>{cs.currency}</span>
                                                        <input className="si" type="number" min="0" step="0.01" value={cs[f.key]} onChange={e => setCs(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                                                    </div>
                                                    <p style={{ fontSize: '0.72rem', color: THEME.colors.gray, marginTop: '0.25rem' }}>{f.help}</p>
                                                </div>
                                            ))}

                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <label style={labelStyle}>Policy Notes</label>
                                                <textarea className="si" value={cs.notes} onChange={e => setCs(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="e.g. Charges may be waived for indigent families with manager approval..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                                            </div>

                                            <button type="submit" disabled={csSaving} className="sb" style={{ width: '100%', padding: '0.9rem', background: THEME.colors.brass, color: THEME.colors.white, border: 'none', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                                                {csSaving ? 'Saving...' : 'Save Charge Settings'}
                                            </button>
                                        </form>
                                    </div>

                                    <div style={{ marginTop: '1rem', background: THEME.colors.brassLight, border: '1px solid rgba(139,115,85,0.2)', borderRadius: '10px', padding: '1.25rem' }}>
                                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: THEME.colors.brass, marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Fee Summary</h4>
                                        {[['Admission (one-time)', cs.initial_admission_fee],[(cs.charge_type==='hourly'?'Hourly':'Daily')+' Storage',cs.daily_storage_rate],['Embalming',cs.embalming_fee],['Viewing / session',cs.viewing_fee_per_session],['Certificate',cs.certificate_processing_fee]].map(([label,value]) => (
                                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.82rem', color: THEME.colors.gray }}>{label}</span>
                                                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: THEME.colors.ink }}>{fmt(value, cs.currency)}</span>
                                            </div>
                                        ))}
                                        {Number(cs.free_days) > 0 && (
                                            <div style={{ borderTop: '1px solid rgba(139,115,85,0.2)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.82rem', color: THEME.colors.success }}>Grace period</span>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: THEME.colors.success }}>{cs.free_days} day{Number(cs.free_days) !== 1 ? 's' : ''} free</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ background: THEME.colors.white, border: '1px solid ' + THEME.colors.line, borderRadius: '10px', padding: '1.5rem', minHeight: '400px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: THEME.colors.ink, marginBottom: '0.2rem' }}>Estimated Charges</h3>
                                                <p style={{ fontSize: '0.78rem', color: THEME.colors.gray }}>Live calculation for all active deceased</p>
                                            </div>
                                            <button onClick={loadPreview} style={{ padding: '0.4rem 0.8rem', background: THEME.colors.bone2, border: '1px solid ' + THEME.colors.line, borderRadius: '6px', fontSize: '0.75rem', color: THEME.colors.gray, cursor: 'pointer' }}>Refresh</button>
                                        </div>

                                        {preview && preview.summary && (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                                {[['Active Deceased', preview.summary.total_deceased],['Est. Revenue', fmt(preview.summary.total_estimated_revenue, preview.summary.currency)],['Grace Days', cs.free_days + ' day' + (Number(cs.free_days) !== 1 ? 's' : '')]].map(([l,v]) => (
                                                    <div key={l} style={{ padding: '0.875rem', background: THEME.colors.bone, borderRadius: '8px', textAlign: 'center', border: '1px solid ' + THEME.colors.line }}>
                                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: THEME.colors.ink, marginBottom: '0.2rem' }}>{v}</div>
                                                        <div style={{ fontSize: '0.68rem', color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {previewLoading ? (
                                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                <div style={{ width: '30px', height: '30px', border: '3px solid ' + THEME.colors.line, borderTopColor: THEME.colors.brass, borderRadius: '50%', animation: 'spin 0.65s linear infinite', margin: '0 auto 0.75rem' }} />
                                                <p style={{ color: THEME.colors.gray, fontSize: '0.82rem' }}>Calculating charges...</p>
                                            </div>
                                        ) : preview && preview.deceased && preview.deceased.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '2.5rem', background: THEME.colors.bone, borderRadius: '8px', border: '2px dashed ' + THEME.colors.line }}>
                                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🕊️</div>
                                                <p style={{ fontSize: '0.88rem', color: THEME.colors.gray }}>No active deceased currently in the facility</p>
                                            </div>
                                        ) : preview && preview.deceased ? (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '2px solid ' + THEME.colors.line }}>
                                                            {['Name','Admitted','Days','Billable','Storage','Admission','Total'].map(h => (
                                                                <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {preview.deceased.map(d => (
                                                            <tr key={d.deceased_id} className="pr" style={{ borderBottom: '1px solid ' + THEME.colors.line }}>
                                                                <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600, color: THEME.colors.ink, whiteSpace: 'nowrap' }}>{d.full_name}</td>
                                                                <td style={{ padding: '0.6rem 0.5rem', color: THEME.colors.gray, whiteSpace: 'nowrap' }}>{new Date(d.date_admitted).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                                                                <td style={{ padding: '0.6rem 0.5rem' }}>
                                                                    <span style={{ padding: '0.2rem 0.45rem', background: d.total_days > 7 ? THEME.colors.redBg : THEME.colors.bone2, color: d.total_days > 7 ? THEME.colors.red : THEME.colors.ink, borderRadius: '4px', fontWeight: 600, fontSize: '0.78rem' }}>{d.total_days}d</span>
                                                                </td>
                                                                <td style={{ padding: '0.6rem 0.5rem', color: THEME.colors.ink }}>{d.billable_days}d</td>
                                                                <td style={{ padding: '0.6rem 0.5rem', color: THEME.colors.ink, fontWeight: 500 }}>{fmt(d.storage_fee, d.currency)}</td>
                                                                <td style={{ padding: '0.6rem 0.5rem', color: THEME.colors.ink }}>{fmt(d.initial_admission_fee, d.currency)}</td>
                                                                <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: THEME.colors.brass, whiteSpace: 'nowrap' }}>{fmt(d.total_estimated_fee, d.currency)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    {preview.deceased.length > 0 && preview.summary && (
                                                        <tfoot>
                                                            <tr style={{ borderTop: '2px solid ' + THEME.colors.line, background: THEME.colors.bone }}>
                                                                <td colSpan={6} style={{ padding: '0.6rem 0.5rem', fontWeight: 700, fontSize: '0.78rem', color: THEME.colors.gray, textTransform: 'uppercase' }}>Total Estimated</td>
                                                                <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700, color: THEME.colors.brass }}>{fmt(preview.summary.total_estimated_revenue, preview.summary.currency)}</td>
                                                            </tr>
                                                        </tfoot>
                                                    )}
                                                </table>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '2rem', color: THEME.colors.gray, fontSize: '0.88rem' }}>Save settings to preview charges</div>
                                        )}

                                        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: THEME.colors.amberBg, borderRadius: '8px', border: '1px solid rgba(122,92,30,0.15)' }}>
                                            <p style={{ fontSize: '0.75rem', color: THEME.colors.amber, lineHeight: 1.6 }}>
                                                <strong>Formula:</strong> Total = Admission Fee + (Billable Days x {cs.charge_type === 'hourly' ? 'Hourly' : 'Daily'} Rate).
                                                Billable Days = Total Days - Grace Days ({cs.free_days || 0} free).
                                                Embalming and viewing fees apply separately when services are rendered.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && isMgr && (
                    <div style={{ animation: 'fadeIn 0.25s ease', background: THEME.colors.white, border: '1px solid ' + THEME.colors.line, borderRadius: '10px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: THEME.colors.ink, marginBottom: '1rem' }}>User Management</h3>
                        {users.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: THEME.colors.gray }}>
                                <p style={{ fontSize: '0.88rem', marginBottom: '0.5rem' }}>No users registered yet</p>
                                <p style={{ fontSize: '0.82rem' }}>Click Add User to create your first account</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid ' + THEME.colors.line }}>
                                            {['Name','Email','Role',...(isMulti ? ['Branch'] : []),'Status'].map(h => (
                                                <th key={h} style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: THEME.colors.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.user_id} style={{ borderBottom: '1px solid ' + THEME.colors.line }}>
                                                <td style={{ padding: '0.75rem', fontSize: '0.88rem', color: THEME.colors.ink, fontWeight: 500 }}>{u.full_name}</td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.88rem', color: THEME.colors.gray }}>{u.email}</td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{ padding: '0.25rem 0.6rem', background: u.role === 'admin' ? THEME.colors.redBg : THEME.colors.bone2, color: u.role === 'admin' ? THEME.colors.red : THEME.colors.ink, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, textTransform: 'capitalize' }}>{u.role}</span>
                                                </td>
                                                {isMulti && <td style={{ padding: '0.75rem', fontSize: '0.88rem', color: THEME.colors.gray }}>{u.branch_name || '—'}</td>}
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{ padding: '0.25rem 0.6rem', background: THEME.colors.successBg, color: THEME.colors.success, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>Active</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'branches' && isMulti && (
                    <div style={{ animation: 'fadeIn 0.25s ease', background: THEME.colors.white, border: '1px solid ' + THEME.colors.line, borderRadius: '10px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: THEME.colors.ink, marginBottom: '1rem' }}>Branch Management</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                            {branches.map(b => (
                                <div key={b.branch_id} style={{ padding: '1.25rem', background: THEME.colors.bone, border: '1px solid ' + THEME.colors.line, borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: THEME.colors.ink }}>{b.branch_name}</h4>
                                        <span style={{ padding: '0.2rem 0.5rem', background: THEME.colors.successBg, color: THEME.colors.success, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500 }}>Active</span>
                                    </div>
                                    <p style={{ fontSize: '0.82rem', color: THEME.colors.gray, marginBottom: '0.35rem' }}>Slug: {b.branch_slug}</p>
                                    {b.branch_location && <p style={{ fontSize: '0.82rem', color: THEME.colors.gray, marginBottom: '0.35rem' }}>📍 {b.branch_location}</p>}
                                    {b.branch_phone && <p style={{ fontSize: '0.82rem', color: THEME.colors.gray }}>📞 {b.branch_phone}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div style={{ animation: 'fadeIn 0.25s ease', background: THEME.colors.white, border: '1px solid ' + THEME.colors.line, borderRadius: '10px', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: THEME.colors.ink, marginBottom: '1rem' }}>Analytics Dashboard</h3>
                        <div style={{ padding: '3rem', background: THEME.colors.bone2, border: '2px dashed ' + THEME.colors.line, borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: THEME.colors.ink, marginBottom: '0.5rem' }}>{isMulti ? 'Comprehensive Analytics' : 'Basic Analytics'}</h4>
                            <p style={{ fontSize: '0.88rem', color: THEME.colors.gray, maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                                {isMulti ? 'View analytics across all branches including deceased registrations, revenue, and operational metrics.' : 'View analytics for your location including registrations and key metrics.'}
                            </p>
                            <button onClick={() => navigate('/analytics')} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: THEME.colors.brass, color: THEME.colors.white, border: 'none', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>View Analytics</button>
                        </div>
                    </div>
                )}
            </div>

            {showAddUserModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(21,23,26,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div style={{ background: THEME.colors.white, borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.2s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: THEME.colors.ink }}>Add New User</h2>
                            <button onClick={() => setShowAddUserModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: THEME.colors.gray, cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            {[['Full Name','full_name','text',true],['Email','email','email',true],['Password','password','password',true],['Phone','phone','tel',false]].map(([label,key,type,req]) => (
                                <div key={key} style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>
                                        {label} {req && <span style={{ color: THEME.colors.red }}>*</span>}
                                    </label>
                                    <input className="si" type={type} value={uf[key]} onChange={e => setUf({ ...uf, [key]: e.target.value })} required={!!req} minLength={key === 'password' ? 6 : undefined} style={inputStyle} />
                                </div>
                            ))}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>Role <span style={{ color: THEME.colors.red }}>*</span></label>
                                <select className="si" value={uf.role} onChange={e => setUf({ ...uf, role: e.target.value })} style={inputStyle}>
                                    {['admin','manager','staff','user','driver'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                </select>
                            </div>
                            {isMulti && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: THEME.colors.ink, marginBottom: '0.4rem' }}>Branch</label>
                                    <select className="si" value={uf.branch_id} onChange={e => setUf({ ...uf, branch_id: e.target.value })} style={inputStyle}>
                                        <option value="">Select a branch</option>
                                        {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowAddUserModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: THEME.colors.gray, border: '1px solid ' + THEME.colors.line, borderRadius: '6px', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '0.75rem', background: THEME.colors.brass, color: THEME.colors.white, border: 'none', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer' }}>Add User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
`;

const target = path.join('C:/Users/User/Downloads/restpoint/FrontendClient/client/src/components/settings/SettingsPage.jsx');
fs.writeFileSync(target, code, 'utf8');
console.log('Written successfully:', fs.statSync(target).size, 'bytes');
