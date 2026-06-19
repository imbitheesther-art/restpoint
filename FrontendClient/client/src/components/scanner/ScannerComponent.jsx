import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Upload, FileText, X, Loader2, 
  CheckCircle, AlertTriangle, Camera,
  Printer, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getScanners, 
  initiateScan, 
  uploadScannedDocument, 
  createScanWebSocket 
} from '../../api/scannerApi';

// Styled Components
const Card = styled.div`
  background: #FFFFFF;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #EAECF0;
  max-width: 100%;
  margin: 0 auto;
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1A1A1A;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 0.75rem 1rem;
  background: ${props => props.disabled ? '#E5E7EB' : '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #2563EB;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 0.75rem 1rem;
  background: transparent;
  color: #6B7280;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #F9FAFB;
    border-color: #D1D5DB;
    color: #374151;
  }
`;

const StatusMessage = styled.div`
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.type === 'success' && `
    background: #D1FAE5;
    color: #065F46;
    border: 1px solid #A7F3D0;
  `}
  
  ${props => props.type === 'error' && `
    background: #FEE2E2;
    color: #991B1B;
    border: 1px solid #FECACA;
  `}
  
  ${props => props.type === 'info' && `
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FDE68A;
  `}
`;

const ProgressBar = styled.div`
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  margin: 0.75rem 0;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: #10B981;
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const ScannerList = styled.div`
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
`;

const ScannerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F3F4F6;
    border-color: #3B82F6;
  }
`;

const ScannerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ScannerIcon = styled.div`
  background: ${props => props.active ? '#D1FAE5' : '#EFF6FF'};
  border-radius: 6px;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScannerDetails = styled.div`
  flex: 1;
`;

const ScannerName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.125rem;
`;

const ScannerType = styled.div`
  font-size: 0.75rem;
  color: #6B7280;
`;

const ScannerStatus = styled.span`
  background: ${props => props.active ? '#10B981' : '#9CA3AF'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const DocumentTypeSelect = styled.select`
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
`;

const ScannerComponent = ({ 
  deceasedId, 
  deceasedData, 
  onScanComplete,
  onUploadSuccess 
}) => {
  const [scanners, setScanners] = useState([]);
  const [selectedScanner, setSelectedScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [documentType, setDocumentType] = useState('death_certificate');
  const [showScannerList, setShowScannerList] = useState(false);
  const [isLoadingScanners, setIsLoadingScanners] = useState(false);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);

  const documentTypes = [
    { value: 'death_certificate', label: 'Death Certificate' },
    { value: 'id_document', label: 'ID Document' },
    { value: 'medical_report', label: 'Medical Report' },
    { value: 'postmortem_report', label: 'Postmortem Report' },
    { value: 'burial_permit', label: 'Burial Permit' },
    { value: 'other', label: 'Other' },
  ];

  // Fetch available scanners
  const fetchScanners = async () => {
    setIsLoadingScanners(true);
    try {
      const data = await getScanners();
      
      if (data.success) {
        setScanners(data.data);
        if (data.data.length > 0) {
          setSelectedScanner(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching scanners:', error);
      toast.error('Failed to load scanners');
    } finally {
      setIsLoadingScanners(false);
    }
  };

  useEffect(() => {
    fetchScanners();
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle physical scanner scan
  const handleScan = async () => {
    if (!selectedScanner) {
      toast.error('Please select a scanner');
      return;
    }

    if (!deceasedId) {
      toast.error('No deceased selected');
      return;
    }

    setIsScanning(true);
    setScanStatus('scanning');
    setScanProgress(0);

    try {
      // Initiate scan using centralized API
      const scanData = await initiateScan({
        deceased_id: deceasedId,
        document_type: documentType,
        scanner_id: selectedScanner.id,
        format: 'pdf',
        dpi: 300,
        color_mode: 'color',
        pages: 1,
      });

      if (!scanData.success) {
        throw new Error(scanData.message || 'Scan failed');
      }

      // Connect to WebSocket for real-time updates
      const jobId = scanData.job_id;
      connectWebSocket(jobId);

    } catch (error) {
      console.error('Scan error:', error);
      setScanStatus('error');
      toast.error(error.message || 'Scan failed');
      setIsScanning(false);
    }
  };

  // Connect to WebSocket for real-time status
  const connectWebSocket = (jobId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    wsRef.current = createScanWebSocket(
      jobId,
      (data) => {
        console.log('WebSocket message:', data);
        
        if (data.type === 'status') {
          const statusData = data.data;
          setScanProgress(statusData.progress || 0);
          
          if (statusData.status === 'completed') {
            setScanStatus('completed');
            setIsScanning(false);
            toast.success('Scan completed successfully!');
            if (onScanComplete) onScanComplete(statusData);
            if (wsRef.current) wsRef.current.close();
          } else if (statusData.status === 'failed') {
            setScanStatus('error');
            setIsScanning(false);
            toast.error(statusData.error || 'Scan failed');
            if (wsRef.current) wsRef.current.close();
          }
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
        setScanStatus('error');
        setIsScanning(false);
        toast.error('Connection lost');
      },
      () => {
        console.log('WebSocket closed');
      }
    );
  };

  // Handle mobile scan
  const handleMobileScan = () => {
    // Open mobile scanner page in new window
    const mobileScannerUrl = `${window.location.origin}/mobile-scanner?deceasedId=${deceasedId}&documentType=${documentType}`;
    window.open(mobileScannerUrl, '_blank', 'width=500,height=700');
  };

  // Handle file upload (fallback)
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('deceased_id', deceasedId);
    formData.append('document_type', documentType);

    try {
      const data = await uploadScannedDocument(formData);

      if (data.success) {
        toast.success('Document uploaded successfully');
        if (onUploadSuccess) onUploadSuccess(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <Card>
      <CardTitle>
        <Printer size={18} />
        Document Scanner
      </CardTitle>

      {/* Document Type Selection */}
      <DocumentTypeSelect
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value)}
        disabled={isScanning}
      >
        {documentTypes.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </DocumentTypeSelect>

      {/* Scanner Selection */}
      <ScannerItem onClick={() => setShowScannerList(!showScannerList)}>
        <ScannerInfo>
          <ScannerIcon active={selectedScanner?.status === 'available'}>
            <Printer size={16} color={selectedScanner?.status === 'available' ? '#10B981' : '#6B7280'} />
          </ScannerIcon>
          <ScannerDetails>
            <ScannerName>
              {selectedScanner ? selectedScanner.name : 'Select Scanner'}
            </ScannerName>
            <ScannerType>
              {selectedScanner ? `${selectedScanner.type} • ${selectedScanner.location}` : 'Click to select'}
            </ScannerType>
          </ScannerDetails>
        </ScannerInfo>
        <ScannerStatus active={selectedScanner?.status === 'available'}>
          {selectedScanner?.status || 'N/A'}
        </ScannerStatus>
      </ScannerItem>

      {/* Scanner List Dropdown */}
      {showScannerList && (
        <ScannerList>
          {scanners.map(scanner => (
            <ScannerItem
              key={scanner.id}
              onClick={() => {
                setSelectedScanner(scanner);
                setShowScannerList(false);
              }}
            >
              <ScannerInfo>
                <ScannerIcon active={scanner.status === 'available'}>
                  <Printer size={16} color={scanner.status === 'available' ? '#10B981' : '#6B7280'} />
                </ScannerIcon>
                <ScannerDetails>
                  <ScannerName>{scanner.name}</ScannerName>
                  <ScannerType>{scanner.type} • {scanner.location}</ScannerType>
                </ScannerDetails>
              </ScannerInfo>
              <ScannerStatus active={scanner.status === 'available'}>
                {scanner.status}
              </ScannerStatus>
            </ScannerItem>
          ))}
        </ScannerList>
      )}

      {/* Status Messages */}
      {scanStatus === 'scanning' && (
        <StatusMessage type="info">
          <Loader2 size={16} className="spinner" />
          Scanning document... {scanProgress}%
        </StatusMessage>
      )}

      {scanStatus === 'completed' && (
        <StatusMessage type="success">
          <CheckCircle size={16} />
          Scan completed successfully!
        </StatusMessage>
      )}

      {scanStatus === 'error' && (
        <StatusMessage type="error">
          <AlertTriangle size={16} />
          Scan failed. Please try again.
        </StatusMessage>
      )}

      {/* Progress Bar */}
      {scanStatus === 'scanning' && (
        <ProgressBar>
          <Progress progress={scanProgress} />
        </ProgressBar>
      )}

      {/* Action Buttons */}
      <ButtonGroup>
        <PrimaryButton
          onClick={handleScan}
          disabled={isScanning || !selectedScanner || selectedScanner.status !== 'available'}
        >
          {isScanning ? (
            <>
              <Loader2 size={16} className="spinner" />
              Scanning...
            </>
          ) : (
            <>
              <Printer size={16} />
              Scan
            </>
          )}
        </PrimaryButton>

        <SecondaryButton
          onClick={handleMobileScan}
          disabled={isScanning}
        >
          <Camera size={16} />
          Mobile Scan
        </SecondaryButton>

        <SecondaryButton
          onClick={handleFileUpload}
          disabled={isScanning}
        >
          <Upload size={16} />
          Upload
        </SecondaryButton>
      </ButtonGroup>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
      />
    </Card>
  );
};

export default ScannerComponent;