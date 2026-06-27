import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, UserX, Shield, Mail, Phone, Search,
  CheckCircle, AlertCircle, X, RefreshCw,
} from 'lucide-react';
import api from '../../api/axios';

const C = {
  ink: '#15171A',
  bone: '#FAF8F4',
  bone2: '#F3EFE6',
  brass: '#8B7355',
  brassLight: '#A98F6E',
  verdigris: '#3D4F47',
  verdigrisDark: '#2E3F37',
  line: '#E3DDD0',
  lineDark: 'rgba(250,248,244,0.14)',
  gray: '#6B6862',
  grayLight: 'rgba(250,248,244,0.62)',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
};

const MAX_ADMINS = 2;

const UserManagement = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    email: '', full_name: '', phone: '', password: '', role: 'staff',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formResult, setFormResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const userStr = localStorage.getItem('user');
  let currentUser = {};
  try { currentUser = JSON.parse(userStr || '{}'); } catch (e) { }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/v2/restpoint/users`, {
        headers: { 'x-tenant-slug': slug || 'system_shared' }
      });
      setUsers(response.data?.users || response.data?.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const adminCount = users.filter(u => u.role === 'admin').length;

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.password || formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.role === 'admin' && adminCount >= MAX_ADMINS) errors.role = `Maximum ${MAX_ADMINS} admins allowed`;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormResult(null);

    try {
      const response = await api.post(`/api/v2/restpoint/users/register`, formData, {
        headers: { 'x-tenant-slug': slug || 'system_shared' }
      });

      if (response.data?.success) {
        setFormResult({ success: true, message: 'User added successfully!' });
        setFormData({ email: '', full_name: '', phone: '', password: '', role: 'staff' });
        fetchUsers();
        setTimeout(() => { setShowAddModal(false); setFormResult(null); }, 1500);
      } else {
        setFormResult({ success: false, message: response.data?.message || 'Failed to add user' });
      }
    } catch (error) {
      setFormResult({
        success: false,
        message: error.response?.data?.message || 'Failed to add user. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await api.delete(`/api/v2/restpoint/users/${userId}`, {
        headers: { 'x-tenant-slug': slug || 'system_shared' }
      });

      if (response.data?.success) {
        fetchUsers();
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: { bg: 'rgba(139,115,85,0.12)', color: C.brass, label: 'Admin' },
      manager: { bg: 'rgba(61,79,71,0.1)', color: C.verdigris, label: 'Manager' },
      staff: { bg: 'rgba(34,197,94,0.1)', color: C.success, label: 'Staff' },
      user: { bg: 'rgba(107,104,98,0.1)', color: C.gray, label: 'User' },
    };
    const s = styles[role] || styles.user;
    return (
      <span style={{
        fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
        background: s.bg, color: s.color, textTransform: 'capitalize',
      }}>
        {role === 'admin' ? <Shield size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> : null}
        {s.label}
      </span>
    );
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = `width: 100%; padding: 0.7rem 0.85rem; border: 1px solid ${C.line}; border-radius: 8px; font-size: 0.85rem; outline: none; transition: all 0.2s ease; background: ${C.bone}; color: ${C.ink};`;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.ink, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} /> User Management
          </h1>
          <p style={{ color: C.gray, marginTop: '0.25rem', fontSize: '0.85rem' }}>
            {users.length} users · {adminCount}/{MAX_ADMINS} admins
          </p>
        </div>
        <button onClick={() => { setFormData({ email: '', full_name: '', phone: '', password: '', role: 'staff' }); setFormResult(null); setFormErrors({}); setShowAddModal(true); }}
          style={{
            padding: '0.65rem 1.25rem', background: C.ink,
            color: C.bone, border: 'none', borderRadius: '2px', fontSize: '0.85rem', fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.25s ease',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={(e) => { e.target.style.background = '#000'; }}
          onMouseLeave={(e) => { e.target.style.background = C.ink; }}
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.gray }} />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name or email..."
          style={{ ...inputStyle, paddingLeft: '2.5rem' }}
        />
      </div>

      {/* Error State */}
      {error && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', background: C.bone, borderRadius: '2px', border: `1px solid ${C.line}`, marginBottom: '1rem' }}>
          <AlertCircle size={48} color={C.danger} style={{ marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600, color: C.ink, marginBottom: '0.5rem' }}>Unable to Load Users</p>
          <p style={{ color: C.gray, fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={fetchUsers}
            style={{
              padding: '0.65rem 1.25rem', background: C.ink, color: C.bone, border: 'none',
              borderRadius: '2px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.25s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => { e.target.style.background = '#000'; }}
            onMouseLeave={(e) => { e.target.style.background = C.ink; }}
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: C.gray }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTop: '3px solid #8B7355', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading users...
        </div>
      ) : !error && filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: C.gray, background: C.bone, borderRadius: '2px', border: `1px solid ${C.line}` }}>
          <Users size={48} color={C.line} style={{ marginBottom: '1rem' }} />
          <p style={{ fontWeight: 600, color: C.ink, marginBottom: '0.25rem' }}>No Users Found</p>
          <p style={{ fontSize: '0.85rem' }}>{searchTerm ? 'Try a different search term' : 'Click "Add User" to get started'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredUsers.map((user) => (
            <div key={user.user_id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.25rem', background: C.bone, borderRadius: '2px',
              border: `1px solid ${C.line}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: user.role === 'admin' ? 'rgba(139,115,85,0.15)' : 'rgba(61,79,71,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: user.role === 'admin' ? C.brass : C.verdigris }}>
                    {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: C.ink, fontSize: '0.9rem' }}>
                      {user.full_name || 'Unknown'}
                    </span>
                    {getRoleBadge(user.role)}
                    {!user.is_active && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', color: C.danger }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: C.gray }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Mail size={12} /> {user.email || 'No email'}
                    </span>
                    {user.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={12} /> {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {/* Only admin can delete, and can't delete themselves */}
                {currentUser?.role === 'admin' && user.user_id !== currentUser?.userId && (
                  <button onClick={() => setShowDeleteConfirm(user)}
                    style={{
                      padding: '0.5rem', border: `1px solid rgba(239,68,68,0.2)`, borderRadius: '8px',
                      cursor: 'pointer', background: 'rgba(239,68,68,0.05)', color: C.danger,
                      display: 'flex', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.target.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'rgba(239,68,68,0.05)'; }}
                    title="Delete user"
                  >
                    <UserX size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(21,23,26,0.92)', backdropFilter: 'blur(8px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: C.bone, borderRadius: '2px', maxWidth: '460px', width: '100%',
            maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)', animation: 'slideUp 0.25s ease',
            border: `1px solid ${C.line}`,
          }}>
            <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: C.ink,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '2px',
                  background: 'rgba(139,115,85,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UserPlus size={18} color={C.brassLight} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: C.bone }}>Add New User</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: C.grayLight }}>
                    {adminCount}/{MAX_ADMINS} admins used
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowAddModal(false); setFormResult(null); }}
                style={{ background: 'rgba(250,248,244,0.1)', border: `1px solid ${C.lineDark}`, borderRadius: '2px', padding: '6px', cursor: 'pointer', display: 'flex', color: C.grayLight }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              {formResult && (
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '2px', marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 500,
                  background: formResult.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${formResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  color: formResult.success ? C.success : C.danger,
                }}>
                  {formResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {formResult.message}
                </div>
              )}

              <form onSubmit={handleAddUser}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: C.ink, marginBottom: '0.4rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Full Name *
                  </label>
                  <input value={formData.full_name} onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="John Doe" style={inputStyle} />
                  {formErrors.full_name && <p style={{ fontSize: '0.7rem', color: C.danger, marginTop: '0.2rem' }}>{formErrors.full_name}</p>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: C.ink, marginBottom: '0.4rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Email Address *
                  </label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="user@example.com" style={inputStyle} />
                  {formErrors.email && <p style={{ fontSize: '0.7rem', color: C.danger, marginTop: '0.2rem' }}>{formErrors.email}</p>}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: C.ink, marginBottom: '0.4rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Phone Number
                  </label>
                  <input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+254 700 000 000" style={inputStyle} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: C.ink, marginBottom: '0.4rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Password *
                  </label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min. 6 characters" style={inputStyle} />
                  {formErrors.password && <p style={{ fontSize: '0.7rem', color: C.danger, marginTop: '0.2rem' }}>{formErrors.password}</p>}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: C.ink, marginBottom: '0.4rem', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Role *
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['admin', 'manager', 'staff'].map(role => (
                      <button key={role} type="button" onClick={() => setFormData(p => ({ ...p, role }))}
                        disabled={role === 'admin' && adminCount >= MAX_ADMINS}
                        style={{
                          flex: 1, padding: '0.6rem', border: `2px solid ${formData.role === role ? (role === 'admin' ? C.brass : C.verdigris) : C.line}`,
                          borderRadius: '2px', cursor: role === 'admin' && adminCount >= MAX_ADMINS ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize',
                          background: formData.role === role ? (role === 'admin' ? 'rgba(139,115,85,0.08)' : 'rgba(61,79,71,0.08)') : C.bone,
                          color: formData.role === role ? (role === 'admin' ? C.brass : C.verdigris) : C.gray,
                          opacity: role === 'admin' && adminCount >= MAX_ADMINS ? 0.5 : 1,
                          fontFamily: "'Inter', sans-serif",
                        }}>
                        {role === 'admin' && <Shield size={12} style={{ marginRight: '3px' }} />}
                        {role}
                      </button>
                    ))}
                  </div>
                  {formErrors.role && <p style={{ fontSize: '0.7rem', color: C.danger, marginTop: '0.2rem' }}>{formErrors.role}</p>}
                </div>

                <button type="submit" disabled={isSubmitting}
                  style={{
                    width: '100%', padding: '0.75rem', border: 'none', borderRadius: '2px',
                    fontSize: '0.85rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    background: isSubmitting ? C.gray : C.ink,
                    color: C.bone, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.25s ease',
                    fontFamily: "'Inter', sans-serif",
                  }}>
                  {isSubmitting ? 'Adding User...' : <><UserPlus size={16} /> Add User</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(21,23,26,0.92)', backdropFilter: 'blur(8px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: C.bone, borderRadius: '2px', maxWidth: '400px', width: '100%', padding: '2rem',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)', textAlign: 'center',
            border: `1px solid ${C.line}`,
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <AlertCircle size={28} color={C.danger} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: C.ink, marginBottom: '0.5rem', fontFamily: "'Fraunces', serif" }}>Delete User?</h2>
            <p style={{ color: C.gray, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
              Are you sure you want to delete <strong style={{ color: C.ink }}>{showDeleteConfirm.full_name}</strong>?
            </p>
            <p style={{ color: C.danger, fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '0.65rem 1.5rem', border: `1px solid ${C.line}`, borderRadius: '2px',
                  cursor: 'pointer', background: C.bone, color: C.ink, fontSize: '0.85rem', fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                }}>
                Cancel
              </button>
              <button onClick={() => handleDeleteUser(showDeleteConfirm.user_id)}
                style={{
                  padding: '0.65rem 1.5rem', border: 'none', borderRadius: '2px',
                  cursor: 'pointer', background: C.danger, color: C.bone, fontSize: '0.85rem', fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                }}>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add global styles for consistency
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

export default UserManagement;
