import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  Upload,
  FileText,
  X,
  Loader2,
  FileDigit,
  FolderOpen,
  FileUp,
  CheckCircle,
  Trash2,
  Eye,
  Printer,
  Download,
  File,
  Image,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

// Bootstrap-inspired color scheme
const COLORS = {
  primary: '#1a5f7a',
  primaryLight: '#2c8ac9',
  primaryDark: '#134b5f',
  white: '#FFFFFF',
  bg: '#f5f7fa',
  surface: '#ffffff',
  border: '#d1d5db',
  borderLight: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  success: '#10b981',
  successLight: '#d1fae5',
  successDark: '#059669',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningDark: '#d97706',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  dangerDark: '#dc2626',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#2563eb',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  accentGlow: 'rgba(59, 130, 246, 0.1)',
  radius: '8px',
  radiusSm: '6px',
  radiusXs: '4px',
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 4px 6px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.15s ease',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  animation: ${fadeIn} 0.25s ease-out;
`;

const Card = styled.div`
  background: ${COLORS.surface};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};
`;

const CardTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${COLORS.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.25rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.$highlight ? COLORS.primary : COLORS.borderLight};
  color: ${props => props.$highlight ? COLORS.white : COLORS.textSecondary};
`;

const Dropzone = styled.div`
  border: 2px dashed ${props => props.$active ? COLORS.primary : COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 2rem 1.5rem;
  text-align: center;
  background: ${props => props.$active ? COLORS.accentGlow : COLORS.bg};
  transition: ${COLORS.transition};
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    border-color: ${COLORS.primary};
    background: ${COLORS.accentGlow};
  }
`;

const DropzoneContent = styled.div`
  color: ${COLORS.textSecondary};
  font-size: 0.875rem;

  svg {
    margin-bottom: 0.75rem;
    color: ${COLORS.primary};
  }
`;

const PrimaryButton = styled.button`
  background: ${COLORS.primary};
  color: ${COLORS.white};
  border: none;
  border-radius: ${COLORS.radiusSm};
  padding: 0.625rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: ${COLORS.transition};
  box-shadow: ${COLORS.shadowSm};

  &:hover {
    background: ${COLORS.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${COLORS.shadowMd};
  }

  &:disabled {
    background: ${COLORS.textMuted};
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.text};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  padding: 0.625rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: ${COLORS.transition};

  &:hover {
    background: ${COLORS.bg};
    border-color: ${COLORS.textSecondary};
  }

  &:disabled {
    background: ${COLORS.textMuted};
    cursor: not-allowed;
  }
`;

const DocumentList = styled.div`
  margin-top: 1.5rem;
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.875rem;
  background: ${COLORS.bg};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  margin-bottom: 0.625rem;
  transition: ${COLORS.transition};

  &:hover {
    border-color: ${COLORS.primary};
    box-shadow: 0 2px 6px rgba(26, 95, 122, 0.06);
  }
`;

const DocumentIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${COLORS.radiusXs};
  background: ${props => props.$color || COLORS.infoLight};
  color: ${props => props.$iconColor || COLORS.info};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.875rem;
  flex-shrink: 0;
`;

const DocumentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DocumentName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${COLORS.text};
  margin-bottom: 0.25rem;
  word-break: break-word;
`;

const DocumentMeta = styled.div`
  font-size: 0.75rem;
  color: ${COLORS.textSecondary};
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-left: 0.75rem;
`;

const IconButton = styled.button`
  background: ${COLORS.surface};
  color: ${COLORS.textSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusXs};
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${COLORS.transition};

  &:hover {
    background: ${props => props.$danger ? COLORS.dangerLight : COLORS.primaryLight};
    color: ${props => props.$danger ? COLORS.danger : COLORS.primaryDark};
    border-color: ${props => props.$danger ? COLORS.danger : COLORS.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1.5rem;
  color: ${COLORS.textSecondary};

  svg {
    width: 2.5rem;
    height: 2.5rem;
    margin-bottom: 0.75rem;
    opacity: 0.4;
  }

  h4 {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 0 0 0.375rem;
    color: ${COLORS.text};
  }

  p {
    font-size: 0.8125rem;
    margin: 0;
    color: ${COLORS.textSecondary};
  }
`;

const StatusMessage = styled.div`
  padding: 0.75rem;
  border-radius: ${COLORS.radiusSm};
  font-size: 0.8125rem;
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.type === 'success' && `
    background: ${COLORS.successLight};
    color: ${COLORS.successDark};
    border: 1px solid ${COLORS.success}30;
  `}

  ${props => props.type === 'error' && `
    background: ${COLORS.dangerLight};
    color: ${COLORS.dangerDark};
    border: 1px solid ${COLORS.danger}30;
  `}
`;

const ProgressBar = styled.div`
  height: 4px;
  background: ${COLORS.borderLight};
  border-radius: 2px;
  margin: 0.75rem 0;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: ${COLORS.success};
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const getTenantSlug = () => {
  return localStorage.getItem('tenantSlug') ||
    localStorage.getItem('tenant_slug') ||
    (() => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.tenantSlug || user.tenant?.slug || 'default';
      } catch {
        return 'default';
      }
    })();
};

const getFileIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return <FileText size={20} color="#EF4444" />;
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <Image size={20} color="#10B981" />;
    case 'word':
    case 'doc':
    case 'docx':
      return <FileText size={20} color="#3B82F6" />;
    case 'excel':
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet size={20} color="#10B981" />;
    default:
      return <File size={20} color={COLORS.textSecondary} />;
  }
};

const getFileIconColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'pdf': return '#FEE2E2';
    case 'image': return '#D1FAE5';
    case 'word': return '#DBEAFE';
    case 'excel': return '#D1FAE5';
    default: return COLORS.borderLight;
  }
};

const getFileIconTextColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'pdf': return '#DC2626';
    case 'image': return '#059669';
    case 'word': return '#2563EB';
    case 'excel': return '#059669';
    default: return COLORS.textSecondary;
  }
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const DocumentUpload = ({ deceasedId, onUploadSuccess, deceasedData }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const fileInputRef = useRef(null);

  // Load existing documents
  useEffect(() => {
    if (deceasedData?.documents) {
      setDocuments(deceasedData.documents);
    }
  }, [deceasedData]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (!selectedFiles.length) return;

    const validFiles = selectedFiles.filter(file => {
      const maxSize = 20 * 1024 * 1024; // 20MB

      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds 20MB limit`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      const filesWithType = validFiles.map(file => ({
        file,
        type: getFileType(file),
        size: file.size,
        name: file.name
      }));

      setFiles(prev => [...prev, ...filesWithType]);
      toast.success(`Added ${validFiles.length} file(s)`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (file) => {
    if (file.type.includes('pdf')) return 'PDF';
    if (file.type.includes('image')) return 'Image';
    if (file.type.includes('word')) return 'Word';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'Excel';
    if (file.type.includes('text')) return 'Text';
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) return 'Archive';
    return 'Document';
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!deceasedId) {
      toast.error('No deceased selected');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(({ file }) => {
        formData.append('files', file);
      });
      formData.append('deceased_id', deceasedId);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch(`${API_BASE_URL}/deceased/${deceasedId}/documents`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        setUploadProgress(100);
        const result = await response.json();
        setUploadStatus('success');

        // Add uploaded files to documents list
        if (result.files && result.files.length > 0) {
          setDocuments(prev => [...prev, ...result.files]);
        }

        toast.success(`Successfully uploaded ${files.length} file(s)`);

        // Clear files after success
        setTimeout(() => {
          setFiles([]);
          setUploadStatus(null);
          setUploadProgress(0);

          if (onUploadSuccess) {
            onUploadSuccess(result);
          }
        }, 2000);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const tenantSlug = getTenantSlug();
      await axios.delete(`${API_BASE_URL}/deceased/${deceasedId}/documents/${docId}`, {
        headers: { 'x-tenant-slug': tenantSlug }
      });

      setDocuments(prev => prev.filter(doc => doc.document_id !== docId && doc.id !== docId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const handlePrintDocument = (doc) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      toast.info('Document preview not available');
    }
  };

  const handleDownloadDocument = (doc) => {
    if (doc.url) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.file_name || doc.name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info('Download not available');
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle>
            <FileText size={18} />
            Document Management
            <Badge $highlight={documents.length > 0}>
              <FileDigit size={14} />
              {documents.length} doc{documents.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardBody>
          {/* Document Summary */}
          {deceasedData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem',
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: COLORS.radiusSm,
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              color: COLORS.text
            }}>
              <FolderOpen size={18} color={COLORS.primary} />
              <div>
                <span style={{ fontWeight: 500 }}>
                  {deceasedData.full_name || 'Unknown'}
                </span>
                <span style={{ marginLeft: '0.5rem', color: COLORS.textSecondary }}>
                  • {documents.length} uploaded file{documents.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <Dropzone
            $active={files.length > 0}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <DropzoneContent>
              <Upload size={32} />
              <div style={{ fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                {files.length === 0 ? 'Select files to upload' : `${files.length} file${files.length !== 1 ? 's' : ''} selected`}
              </div>
              <div style={{ fontSize: '0.8125rem', color: COLORS.textSecondary }}>
                {files.length === 0
                  ? 'Click or drag files here (PDF, Images, Docs, Excel)'
                  : `${formatFileSize(files.reduce((sum, f) => sum + f.size, 0))} total • Max 20MB per file`
                }
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                style={{ display: 'none' }}
              />
            </DropzoneContent>
          </Dropzone>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: COLORS.text }}>
                  Selected Files ({files.length})
                </div>
                <SecondaryButton
                  onClick={clearFiles}
                  disabled={isUploading}
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                >
                  <Trash2 size={14} /> Clear All
                </SecondaryButton>
              </div>

              {files.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: COLORS.radiusXs,
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: COLORS.radiusXs,
                    background: getFileIconColor(file.type),
                    color: getFileIconTextColor(file.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem',
                    flexShrink: 0
                  }}>
                    {getFileIcon(file.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: COLORS.text }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary }}>
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <IconButton
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    style={{ padding: '0.375rem' }}
                  >
                    <X size={16} />
                  </IconButton>
                </div>
              ))}
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'uploading' && (
            <StatusMessage type="info">
              <Loader2 size={16} className="animate-spin" />
              Uploading {files.length} file{files.length !== 1 ? 's' : ''}...
            </StatusMessage>
          )}

          {uploadStatus === 'success' && (
            <StatusMessage type="success">
              <CheckCircle size={16} />
              Upload completed successfully!
            </StatusMessage>
          )}

          {uploadStatus === 'error' && (
            <StatusMessage type="error">
              <X size={16} />
              Upload failed. Please try again.
            </StatusMessage>
          )}

          {uploadStatus === 'uploading' && (
            <ProgressBar>
              <Progress progress={uploadProgress} />
            </ProgressBar>
          )}

          {/* Upload Button */}
          {files.length > 0 && (
            <PrimaryButton
              onClick={handleUpload}
              disabled={isUploading || !deceasedId}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <FileUp size={16} /> Upload Documents
                </>
              )}
            </PrimaryButton>
          )}

          {/* Documents List */}
          {documents.length > 0 && (
            <DocumentList>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: COLORS.text,
                marginBottom: '0.75rem',
                paddingBottom: '0.5rem',
                borderBottom: `1px solid ${COLORS.border}`
              }}>
                Uploaded Documents
              </div>

              {documents.map((doc) => (
                <DocumentItem key={doc.document_id || doc.id}>
                  <DocumentIcon
                    $color={getFileIconColor(doc.file_type || doc.type)}
                    $iconColor={getFileIconTextColor(doc.file_type || doc.type)}
                  >
                    {getFileIcon(doc.file_type || doc.type)}
                  </DocumentIcon>

                  <DocumentInfo>
                    <DocumentName>
                      {doc.file_name || doc.name || 'Untitled Document'}
                    </DocumentName>
                    <DocumentMeta>
                      <span>{formatFileSize(doc.file_size || doc.size)}</span>
                      <span>•</span>
                      <span>{doc.file_type || doc.type || 'Document'}</span>
                      {doc.uploaded_at && (
                        <>
                          <span>•</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </DocumentMeta>
                  </DocumentInfo>

                  <DocumentActions>
                    <IconButton
                      onClick={() => handlePrintDocument(doc)}
                      title="View/Print"
                    >
                      <Printer size={16} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDownloadDocument(doc)}
                      title="Download"
                    >
                      <Download size={16} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteDocument(doc.document_id || doc.id)}
                      $danger
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </DocumentActions>
                </DocumentItem>
              ))}
            </DocumentList>
          )}

          {/* Empty State for Documents */}
          {documents.length === 0 && !isLoadingDocs && (
            <EmptyState>
              <FolderOpen size={48} />
              <h4>No Documents Yet</h4>
              <p>Upload documents using the area above</p>
            </EmptyState>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default DocumentUpload;