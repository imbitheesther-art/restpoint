import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileUp, Download, Trash2, File, Search, Plus, AlertCircle, Loader,
  Eye, Pencil, X, FileText, LayoutTemplate as Template, Edit3, Save, Upload, Copy,
  ChevronDown, ChevronUp, Filter, Grid, List, Wifi, WifiOff
} from 'lucide-react';

import Swal from 'sweetalert2';
import DocumentEditor from './DocumentEditor';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1/restpoint` : 'http://localhost:5000/api/v1/restpoint';

// Debug mode - set to true for detailed logging
const DEBUG_MODE = true;

// Logging utility
const log = {
  info: (msg, data) => DEBUG_MODE && console.log(`[EDocuments] ${msg}`, data || ''),
  error: (msg, error) => {
    console.error(`[EDocuments] ${msg}`, error);
    if (error?.response) {
      console.error('[EDocuments] Response data:', error.response.data);
      console.error('[EDocuments] Response status:', error.response.status);
    }
  },
  warn: (msg, data) => DEBUG_MODE && console.warn(`[EDocuments] ${msg}`, data || '')
};

// Offline storage utilities
const offlineStorage = {
  getDocuments: () => {
    try {
      const docs = localStorage.getItem('edocuments_documents');
      return docs ? JSON.parse(docs) : [];
    } catch {
      return [];
    }
  },
  saveDocuments: (docs) => {
    try {
      localStorage.setItem('edocuments_documents', JSON.stringify(docs));
    } catch (error) {
      log.error('Failed to save documents to localStorage', error);
    }
  },
  getTemplates: () => {
    try {
      const templates = localStorage.getItem('edocuments_templates');
      return templates ? JSON.parse(templates) : [];
    } catch {
      return [];
    }
  },
  saveTemplates: (templates) => {
    try {
      localStorage.setItem('edocuments_templates', JSON.stringify(templates));
    } catch (error) {
      log.error('Failed to save templates to localStorage', error);
    }
  },
  addPendingUpload: (file) => {
    try {
      const pending = JSON.parse(localStorage.getItem('edocuments_pending_uploads') || '[]');
      pending.push({
        file: file.name,
        size: file.size,
        type: file.type,
        timestamp: Date.now()
      });
      localStorage.setItem('edocuments_pending_uploads', JSON.stringify(pending));
    } catch (error) {
      log.error('Failed to save pending upload', error);
    }
  },
  getPendingUploads: () => {
    try {
      return JSON.parse(localStorage.getItem('edocuments_pending_uploads') || '[]');
    } catch {
      return [];
    }
  },
  clearPendingUploads: () => {
    localStorage.removeItem('edocuments_pending_uploads');
  }
};

// API call with timeout
const apiCall = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await axios({
      url,
      signal: controller.signal,
      ...options
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const EDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Template management state
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', type: 'form', fields: [] });

  // Autofill data
  const [showAutofillModal, setShowAutofillModal] = useState(false);
  const [autofillTemplate, setAutofillTemplate] = useState(null);
  const [autofillData, setAutofillData] = useState({});

  const tenantSlug = localStorage.getItem('tenantSlug') || 'default';

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      log.info('Back online - syncing data');
      Swal.fire({
        icon: 'success',
        title: 'Back Online',
        text: 'Syncing data with server...',
        timer: 2000,
        showConfirmButton: false
      });
      fetchDocuments();
      fetchTemplates();
    };

    const handleOffline = () => {
      setIsOnline(false);
      log.warn('Gone offline - using local data');
      Swal.fire({
        icon: 'warning',
        title: 'Offline Mode',
        text: 'You are offline. Changes will be saved locally.',
        timer: 3000,
        showConfirmButton: false
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch documents with timeout and fallback
  const fetchDocuments = async () => {
    log.info('Fetching documents...');
    setFetchingInitial(true);
    setError(null);

    try {
      const response = await apiCall(`${API_BASE_URL}/edocuments`, {
        headers: { 'x-tenant-slug': tenantSlug }
      }, 10000);

      const docs = response.data?.data?.documents || [];
      log.info(`Fetched ${docs.length} documents from backend`);
      setDocuments(docs);
      offlineStorage.saveDocuments(docs);
    } catch (error) {
      log.error('Error fetching documents from backend', error);

      // Fallback to localStorage
      const localDocs = offlineStorage.getDocuments();
      if (localDocs.length > 0) {
        log.info(`Using ${localDocs.length} documents from localStorage`);
        setDocuments(localDocs);
        setError('Using offline data - backend unavailable');
      } else {
        setError('Failed to load documents. Working offline.');
        setDocuments([]);
      }
    } finally {
      setFetchingInitial(false);
    }
  };

  // Fetch templates with timeout and fallback
  const fetchTemplates = async () => {
    log.info('Fetching templates...');
    try {
      const response = await apiCall(`${API_BASE_URL}/edocuments/templates`, {
        headers: { 'x-tenant-slug': tenantSlug }
      }, 10000);

      const tmpls = response.data?.data?.templates || [];
      log.info(`Fetched ${tmpls.length} templates from backend`);
      setTemplates(tmpls);
      offlineStorage.saveTemplates(tmpls);
    } catch (error) {
      log.error('Error fetching templates from backend', error);

      // Fallback to localStorage
      const localTemplates = offlineStorage.getTemplates();
      if (localTemplates.length > 0) {
        log.info(`Using ${localTemplates.length} templates from localStorage`);
        setTemplates(localTemplates);
      }
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchTemplates();
  }, []);

  // Handle file upload - immediately open in editor
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    log.info('File selected for upload:', file.name);

    // Store file info for later upload
    if (!isOnline) {
      offlineStorage.addPendingUpload(file);
      Swal.fire({
        icon: 'info',
        title: 'Offline Mode',
        text: 'File will be uploaded when you reconnect',
        timer: 2000,
        showConfirmButton: false
      });
    }

    // Immediately open editor with the file
    setEditingFile(file);
    setEditingDocument(null);
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  // Open template in editor
  const openTemplateInEditor = (template) => {
    log.info('Opening template in editor:', template.name);
    setSelectedTemplate(template);
    setEditingDocument(null);
    setEditingFile(null);
    setShowEditor(true);
  };

  // Open existing document in editor
  const openInEditor = (doc) => {
    log.info('Opening document in editor:', doc.title);
    setEditingDocument(doc);
    setEditingFile(null);
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  // Handle editor save
  const handleEditorSave = async (savedDoc) => {
    log.info('Document saved from editor:', savedDoc.title);

    // Update local state
    if (editingDocument?.id) {
      setDocuments(prev => prev.map(doc =>
        doc.id === editingDocument.id ? { ...doc, ...savedDoc } : doc
      ));
    } else {
      setDocuments(prev => [savedDoc, ...prev]);
    }

    // Save to localStorage for offline access
    offlineStorage.saveDocuments(documents);

    // Try to sync with backend if online
    if (isOnline) {
      try {
        if (editingDocument?.id) {
          await apiCall(`${API_BASE_URL}/edocuments/${editingDocument.id}`, {
            method: 'PUT',
            headers: { 'x-tenant-slug': tenantSlug, 'Content-Type': 'application/json' },
            data: savedDoc
          }, 10000);
          log.info('Document synced to backend');
        } else {
          await apiCall(`${API_BASE_URL}/edocuments`, {
            method: 'POST',
            headers: { 'x-tenant-slug': tenantSlug, 'Content-Type': 'application/json' },
            data: savedDoc
          }, 10000);
          log.info('New document uploaded to backend');
        }
      } catch (error) {
        log.error('Failed to sync document to backend', error);
        Swal.fire({
          icon: 'warning',
          title: 'Saved Locally',
          text: 'Document saved offline. Will sync when connection restored.',
          timer: 3000,
          showConfirmButton: false
        });
      }
    }

    setShowEditor(false);
    setEditingDocument(null);
    setEditingFile(null);
    setSelectedTemplate(null);
  };

  // Delete document
  const handleDelete = async (doc) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Document?',
      text: `Delete "${doc.title}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });

    if (result.isConfirmed) {
      try {
        await apiCall(`${API_BASE_URL}/edocuments/${doc.id}`, {
          method: 'DELETE',
          headers: { 'x-tenant-slug': tenantSlug }
        }, 10000);

        setDocuments(prev => prev.filter(d => d.id !== doc.id));
        offlineStorage.saveDocuments(documents.filter(d => d.id !== doc.id));
        Swal.fire('Deleted!', 'Document deleted.', 'success');
        log.info('Document deleted:', doc.id);
      } catch (error) {
        log.error('Failed to delete document', error);
        Swal.fire('Error', 'Failed to delete document', 'error');
      }
    }
  };

  // Download document
  const handleDownload = async (doc) => {
    try {
      const response = await apiCall(`${API_BASE_URL}/edocuments/download/${doc.fileName}`, {
        headers: { 'x-tenant-slug': tenantSlug },
        responseType: 'blob'
      }, 10000);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName || doc.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      log.info('Document downloaded:', doc.fileName);
    } catch (error) {
      log.error('Failed to download document', error);
      Swal.fire('Error', 'Failed to download document', 'error');
    }
  };

  // Export document as PDF
  const handleExportPDF = async (doc) => {
    try {
      const response = await apiCall(`${API_BASE_URL}/edocuments/${doc.id}/export-pdf`, {
        method: 'POST',
        headers: { 'x-tenant-slug': tenantSlug },
        responseType: 'blob'
      }, 10000);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      log.info('Document exported as PDF:', doc.id);
    } catch (error) {
      log.error('Failed to export PDF', error);
      Swal.fire('Error', 'Failed to export PDF', 'error');
    }
  };

  // Show autofill modal for template
  const showAutofillForTemplate = (template) => {
    log.info('Showing autofill modal for template:', template.name);
    setAutofillTemplate(template);
    setAutofillData({});
    setShowAutofillModal(true);
  };

  // Generate document from template with autofill data
  const handleAutofillGenerate = async () => {
    try {
      const response = await apiCall(`${API_BASE_URL}/edocuments/generate`, {
        method: 'POST',
        headers: {
          'x-tenant-slug': tenantSlug,
          'Content-Type': 'application/json'
        },
        data: {
          templateId: autofillTemplate.id,
          fieldValues: autofillData,
          title: `${autofillTemplate.name} - ${new Date().toLocaleDateString()}`
        }
      }, 10000);

      const newDoc = response.data?.data?.document;
      if (newDoc) {
        setDocuments(prev => [newDoc, ...prev]);
        offlineStorage.saveDocuments([newDoc, ...documents]);
      }

      setShowAutofillModal(false);
      Swal.fire('Success', 'Document generated successfully!', 'success');
      log.info('Document generated from template:', autofillTemplate.name);
    } catch (error) {
      log.error('Failed to generate document', error);
      Swal.fire('Error', 'Failed to generate document', 'error');
    }
  };

  // Create new template
  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      Swal.fire('Error', 'Template name is required', 'error');
      return;
    }

    try {
      const response = await apiCall(`${API_BASE_URL}/edocuments/templates`, {
        method: 'POST',
        headers: {
          'x-tenant-slug': tenantSlug,
          'Content-Type': 'application/json'
        },
        data: newTemplate
      }, 10000);

      const template = response.data?.data?.template;
      if (template) {
        setTemplates(prev => [...prev, template]);
        offlineStorage.saveTemplates([...templates, template]);
      }

      setShowCreateTemplateModal(false);
      setNewTemplate({ name: '', description: '', type: 'form', fields: [] });
      Swal.fire('Success', 'Template created successfully!', 'success');
      log.info('Template created:', newTemplate.name);
    } catch (error) {
      log.error('Failed to create template', error);
      Swal.fire('Error', 'Failed to create template', 'error');
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Connection Status Banner */}
      {!isOnline && (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        }}>
          <WifiOff size={24} />
          <div>
            <strong>Offline Mode</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
              You are working offline. Changes will be saved locally and synced when connection is restored.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && isOnline && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        }}>
          <AlertCircle size={24} />
          <div>
            <strong>Connection Issue</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', opacity: 0.9 }}>{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <FileText size={32} color="#c9a84c" />
            E-Documents
          </h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            Manage documents, templates, and generate certificates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #c9a84c 0%, #a68a4a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(201, 168, 76, 0.3)'
            }}
          >
            <Upload size={18} />
            Upload Document
          </button>
          <input
            id="file-upload"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8'
          }} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.875rem',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Types</option>
          <option value="certificate">Certificates</option>
          <option value="permit">Permits</option>
          <option value="receipt">Receipts</option>
          <option value="report">Reports</option>
          <option value="other">Other</option>
        </select>

        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '4px'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === 'grid' ? 'white' : 'transparent',
              color: viewMode === 'grid' ? '#1e293b' : '#64748b',
              cursor: 'pointer',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === 'list' ? 'white' : 'transparent',
              color: viewMode === 'list' ? '#1e293b' : '#64748b',
              cursor: 'pointer',
              boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {fetchingInitial && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: '#64748b'
        }}>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: 500 }}>Loading documents...</p>
        </div>
      )}

      {/* Empty State */}
      {!fetchingInitial && filteredDocuments.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: '#64748b'
        }}>
          <FileText size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No Documents Found</h3>
          <p style={{ margin: '0 0 1.5rem 0' }}>
            {searchTerm ? 'Try adjusting your search' : 'Upload a document or create from template'}
          </p>
          {!isOnline && (
            <p style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
              Working offline - documents will sync when connected
            </p>
          )}
        </div>
      )}

      {/* Documents Grid/List */}
      {!fetchingInitial && filteredDocuments.length > 0 && (
        <div style={viewMode === 'grid' ? gridStyle : listStyle}>
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              style={viewMode === 'grid' ? gridCardStyle : listCardStyle}
              onClick={() => openInEditor(doc)}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #c9a84c 0%, #a68a4a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <File size={24} color="white" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#1e293b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {doc.title}
                </h3>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.875rem',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {doc.description || 'No description'}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.75rem',
                  color: '#94a3b8'
                }}>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  <span style={{
                    padding: '2px 8px',
                    background: '#f1f5f9',
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}>
                    {doc.type || 'document'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                  style={{
                    padding: '0.5rem',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Download"
                >
                  <Download size={16} color="#64748b" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                  style={{
                    padding: '0.5rem',
                    background: '#fef2f2',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Delete"
                >
                  <Trash2 size={16} color="#dc2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Editor Modal */}
      {showEditor && (
        <DocumentEditor
          document={editingDocument}
          file={editingFile}
          template={selectedTemplate}
          onClose={() => {
            setShowEditor(false);
            setEditingDocument(null);
            setEditingFile(null);
            setSelectedTemplate(null);
          }}
          onSave={handleEditorSave}
          tenantSlug={tenantSlug}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Grid view styles
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1.5rem'
};

const gridCardStyle = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer'
};

// List view styles
const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const listCardStyle = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer'
};

export default EDocumentsPage;