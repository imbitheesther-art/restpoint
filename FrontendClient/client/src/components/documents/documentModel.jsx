// components/DocumentsModal.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Download, Trash2, FileText, Image } from '../../utils/icons/icons';

import { toast } from 'react-toastify';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E2E8F0;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1E293B;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #F1F5F9;
  }
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DocumentCard = styled.div`
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const DocumentIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: #3B82F6;
`;

const DocumentName = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1E293B;
  word-break: break-word;
`;

const DocumentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #64748B;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.download {
    color: #3B82F6;
    background: #EFF6FF;
    
    &:hover {
      background: #DBEAFE;
    }
  }
  
  &.delete {
    color: #EF4444;
    background: #FEF2F2;
    
    &:hover {
      background: #FEE2E2;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748B;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
`;

const DocumentsModal = ({ isOpen, onClose, deceasedId, deceasedName }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async () => {
    if (!deceasedId) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getDocuments(deceasedId);
      setDocuments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch documents');
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, deceasedId]);

  const handleDownload = async (documentId, documentName) => {
    try {
      const response = await apiService.downloadDocument(documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await apiService.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      fetchDocuments(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getDocumentIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return <FileText size={32} />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <Image size={32} />;
    return <File size={32} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FileText size={24} />
            Documents for {deceasedName}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        {isLoading ? (
          <LoadingState>
            <div>Loading documents...</div>
          </LoadingState>
        ) : documents.length === 0 ? (
          <EmptyState>
            <FileText size={48} />
            <p>No documents found for this deceased.</p>
          </EmptyState>
        ) : (
          <DocumentsGrid>
            {documents.map((doc) => (
              <DocumentCard key={doc.id}>
                <DocumentIcon>
                  {getDocumentIcon(doc.document_name)}
                </DocumentIcon>
                <DocumentName>{doc.document_name}</DocumentName>
                <DocumentMeta>
                  <span>{doc.document_type}</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                </DocumentMeta>
                <DocumentActions>
                  <ActionButton 
                    className="download" 
                    onClick={() => handleDownload(doc.id, doc.document_name)}
                    title="Download document"
                  >
                    <Download size={16} />
                  </ActionButton>
                  <ActionButton 
                    className="delete" 
                    onClick={() => handleDelete(doc.id)}
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </DocumentActions>
              </DocumentCard>
            ))}
          </DocumentsGrid>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default DocumentsModal;