import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Upload,
  Download,
  Filter,
  X,
  Calendar,
  Clock,
  File,
  FileText,
  Image,
  FileSpreadsheet
} from 'lucide-react';

const Colors = {
  primaryDark: '#1a202c',
  white: '#FFFFFF',
  lightGray: '#f7fafc',
  mediumGray: '#e2e8f0',
  darkGray: '#4a5568',
  primaryBlue: '#3182ce',
  secondaryBlue: '#2c5282',
  shadowLight: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowDark: 'rgba(0, 0, 0, 0.1)'
};

const DocumentsContainer = styled.div`
  min-height: 100vh;
  background: 
    linear-gradient(rgba(44, 62, 80, 0), rgba(44, 62, 80, 0)),
    url('/background.jpg') no-repeat center center fixed;
  background-size: cover;
  background-attachment: fixed;
  padding: 1rem;
  color: ${Colors.white};
  padding-bottom: 80px;
  position: relative;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: left;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.white};
  margin: 0 0 0.2rem 0;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.p`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
`;

const UploadSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 0.8rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const UploadTitle = styled.div`
  font-size: 0.9rem;
  color: ${Colors.primaryDark};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const UploadButton = styled.label`
  display: inline-block;
  background: ${Colors.primaryBlue};
  color: ${Colors.white};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  
  &:hover {
    background: ${Colors.secondaryBlue};
    transform: translateY(-1px);
  }
  
  input {
    display: none;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
  padding: 0.4rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? Colors.primaryBlue : 'rgba(255, 255, 255, 0.12)'};
  color: ${props => props.active ? Colors.white : 'rgba(255, 255, 255, 0.8)'};
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    background: ${props => props.active ? Colors.secondaryBlue : 'rgba(255, 255, 255, 0.2)'};
  }
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

// Ultra compact grid
const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.7rem;
`;

// Ultra compact card
const DocumentCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.7rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    background: rgba(255, 255, 255, 0.98);
  }
`;

// Card content - single row layout
const CardContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
`;

const CardLeft = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  flex-shrink: 0;
`;

// File info section
const FileInfo = styled.div`
  margin-bottom: 0.4rem;
`;

const FileName = styled.div`
  font-size: 0.8rem;
  color: ${Colors.primaryDark};
  font-weight: 600;
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileType = styled.div`
  font-size: 0.7rem;
  color: ${Colors.primaryBlue};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

// Metadata section
const FileMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.7rem;
  color: ${Colors.darkGray};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  svg {
    width: 10px;
    height: 10px;
    color: ${Colors.primaryBlue};
  }
`;

const MetaText = styled.span`
  color: ${Colors.darkGray};
  font-weight: 400;
`;

// Compact download button
const DownloadButton = styled.button`
  background: ${Colors.primaryBlue};
  color: ${Colors.white};
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 500;
  white-space: nowrap;
  
  &:hover {
    background: ${Colors.secondaryBlue};
    transform: translateY(-1px);
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 1.5rem;
  font-size: 0.9rem;
  color: ${Colors.white};
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin: 1rem 0;
  
  svg {
    margin-bottom: 0.6rem;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 6px;
  padding: 0.8rem;
  color: #ff4444;
  margin-bottom: 0.8rem;
  font-size: 0.8rem;
`;

const NoDocuments = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  color: ${Colors.darkGray};
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 0.8rem 0;
  
  h3 {
    color: ${Colors.primaryDark};
    margin-bottom: 0.4rem;
    font-size: 1rem;
    font-weight: 600;
  }
  
  p {
    color: ${Colors.darkGray};
    font-size: 0.8rem;
  }
`;

// PDF Viewer Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${Colors.white};
  border-radius: 8px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

const ModalHeader = styled.div`
  padding: 0.8rem;
  background: ${Colors.primaryDark};
  color: ${Colors.white};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  color: ${Colors.white};
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PDFContainer = styled.div`
  flex: 1;
  min-height: 0;
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const DocumentsPage = ({ onLogout, onBack }) => {
  const [deceasedData, setDeceasedData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    fetchDeceasedData();
  }, []);

  const fetchDeceasedData = async () => {
    try {
      const deceasedId = localStorage.getItem('deceased_id');
      const sessionToken = localStorage.getItem('session_token');
      
      if (!deceasedId || !sessionToken) {
        setError('Please log in to view documents');
        setLoading(false);
        return;
      }

      const infoResponse = await fetch(
        `http://localhost:5000/api/v1/restpoint/portal/info/${deceasedId}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!infoResponse.ok) {
        throw new Error('Failed to fetch deceased information');
      }

      const infoData = await infoResponse.json();
      setDeceasedData(infoData.data);

      const docsResponse = await fetch(
        `http://localhost:5000/api/v1/restpoint/portal/documents/${deceasedId}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!docsResponse.ok) {
        throw new Error('Failed to fetch documents');
      }

      const docsData = await docsResponse.json();
      setDocuments(docsData.documents || []);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('PDF')) return <FileText size={10} />;
    if (type.includes('Excel') || type.includes('Spreadsheet')) return <FileSpreadsheet size={10} />;
    if (type.includes('Image')) return <Image size={10} />;
    return <File size={10} />;
  };

  const getFileTypeText = (type) => {
    if (type.includes('PDF')) return 'PDF';
    if (type.includes('Excel') || type.includes('Spreadsheet')) return 'Excel';
    if (type.includes('Image')) return 'Image';
    if (type.includes('Word')) return 'Doc';
    return 'File';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('category', 'General');
    formData.append('type', file.type);

    try {
      const deceasedId = localStorage.getItem('deceased_id');
      const sessionToken = localStorage.getItem('session_token');

      const response = await fetch(
        `http://localhost:5000/api/v1/restpoint/portal/documents/${deceasedId}/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
          },
          body: formData
        }
      );

      if (response.ok) {
        alert('Document uploaded successfully!');
        fetchDeceasedData();
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      alert('Error uploading document: ' + err.message);
    }
  };

  const handleDownload = (document) => {
    const filePath = document.path.replace(/\\/g, '/');
    const downloadUrl = `http://localhost:5000${filePath}`;
    window.open(downloadUrl, '_blank');
  };

  const filteredDocuments = selectedCategory === 'All' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const categories = ['All', ...new Set(documents.map(doc => doc.category).filter(Boolean))];

  if (loading) {
    return (
      <DocumentsContainer>
        <ContentWrapper>
          <LoadingSpinner>
            <FileText size={16} />
            <div>Loading documents...</div>
          </LoadingSpinner>
        </ContentWrapper>
      </DocumentsContainer>
    );
  }

  return (
    <DocumentsContainer>
      <ContentWrapper>
        <Header>
          <Title>Documents</Title>
          {deceasedData?.deceased?.full_name && (
            <Subtitle>{deceasedData.deceased.full_name}</Subtitle>
          )}
        </Header>

        {error && (
          <ErrorMessage>
            <strong>Error:</strong> {error}
          </ErrorMessage>
        )}

        <UploadSection>
          <UploadTitle>
            <Upload size={16} />
            Upload New Document
          </UploadTitle>
          <UploadButton>
            Choose File
            <input 
              type="file" 
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
            />
          </UploadButton>
        </UploadSection>

        {documents.length > 0 && (
          <CategoryFilter>
            {categories.map(category => (
              <FilterButton
                key={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                <Filter size={10} />
                {category}
              </FilterButton>
            ))}
          </CategoryFilter>
        )}

        {filteredDocuments.length === 0 ? (
          <NoDocuments>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>📁</div>
            <h3>No documents found</h3>
            <p>{documents.length === 0 ? 'Upload documents to get started' : 'No documents match the selected category'}</p>
          </NoDocuments>
        ) : (
          <DocumentsGrid>
            {filteredDocuments.map((doc, index) => (
              <DocumentCard key={index}>
                <CardContent>
                  <CardLeft>
                    <FileInfo>
                      <FileName title={doc.filename}>
                        {doc.filename.length > 30 
                          ? doc.filename.substring(0, 30) + '...' 
                          : doc.filename}
                      </FileName>
                      <FileType>
                        {getFileIcon(doc.type)}
                        {getFileTypeText(doc.type)}
                      </FileType>
                    </FileInfo>
                    <FileMetadata>
                      <MetaItem>
                        <Calendar size={10} />
                        <MetaText>{formatDate(doc.uploaded_at)}</MetaText>
                      </MetaItem>
                      <MetaItem>
                        <Clock size={10} />
                        <MetaText>v{doc.version}</MetaText>
                      </MetaItem>
                    </FileMetadata>
                  </CardLeft>
                  <CardRight>
                    <DownloadButton onClick={() => handleDownload(doc)}>
                      <Download size={12} />
                      Download
                    </DownloadButton>
                  </CardRight>
                </CardContent>
              </DocumentCard>
            ))}
          </DocumentsGrid>
        )}

        {showPDF && selectedDocument && (
          <ModalOverlay onClick={() => setShowPDF(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>{selectedDocument.filename}</ModalTitle>
                <ModalClose onClick={() => setShowPDF(false)}>
                  <X size={16} />
                </ModalClose>
              </ModalHeader>
              <PDFContainer>
                <iframe 
                  src={selectedDocument.fullUrl} 
                  title={selectedDocument.filename}
                />
              </PDFContainer>
            </ModalContent>
          </ModalOverlay>
        )}
      </ContentWrapper>
    </DocumentsContainer>
  );
};

export default DocumentsPage;