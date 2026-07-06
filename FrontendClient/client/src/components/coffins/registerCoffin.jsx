import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import styled, { keyframes, css } from 'styled-components';
import {
  Tag, Box, Diamond, Maximize2, Paintbrush, Package,
  DollarSign, Image, Save, Loader2, UploadCloud, Truck,
  CheckCircle, XCircle, Camera, X, RotateCcw, Globe, MapPin,
  ArrowLeft
} from 'lucide-react';
import { Square as Button } from 'lucide-react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ENDPOINTS } from '../../api/endpoints';
import env from '../../config/env';

// --- Enhanced Color Palette ---
const Colors = {
  primaryDark: '#1a1a2e',
  accentTeal: '#0ea5e9',
  accentOrange: '#f59e0b',
  accentPurple: '#8b5cf6',
  white: '#FFFFFF',
  lightGray: '#f8fafc',
  mediumGray: '#e2e8f0',
  darkGray: '#334155',
  successGreen: '#10b981',
  dangerRed: '#ef4444',
  infoBlue: '#3b82f6',
  inputBorder: '#cbd5e1',
  inputFocus: '#0ea5e9',
  textMuted: '#64748b',
};

// --- Animations ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromTop = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const spin = keyframes`
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
`;

// --- Enhanced Styled Components ---
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${Colors.lightGray} 0%, #f1f5f9 100%);
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  animation: ${fadeIn} 0.8s ease-out;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }

  @media (max-width: 576px) {
    padding: 0.5rem;
  }
`;

const Card = styled.div`
  background: ${Colors.white};
  border-radius: 1.25rem;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
  width: 100%;
  max-width: 900px;
  border: 1px solid ${Colors.mediumGray};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  ${props => props.blurred && css`
    filter: blur(3px);
    pointer-events: none;
  `}

  &:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 20px 40px -12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 1rem;
  }

  @media (max-width: 576px) {
    padding: 0.75rem;
    border-radius: 0.875rem;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${Colors.mediumGray};
  border-top: 4px solid ${Colors.accentTeal};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  @media (max-width: 576px) {
    width: 50px;
    height: 50px;
  }
`;

const LoadingText = styled.div`
  color: ${Colors.white};
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  text-align: center;

  @media (max-width: 576px) {
    font-size: 0.875rem;
  }
`;

const SuccessNotification = styled.div`
  position: fixed;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  background: ${Colors.successGreen};
  color: ${Colors.white};
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1001;
  animation: ${slideInFromTop} 0.5s ease-out;
  max-width: 400px;
  margin: 0 auto;
  
  svg {
    font-size: 1.5rem;
    animation: ${pulse} 2s infinite;
  }
  
  .success-content {
    flex: 1;
    
    h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 700;
    }
    
    p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.875rem;
    }
  }

  @media (max-width: 576px) {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    
    svg {
      font-size: 1.25rem;
    }
    
    .success-content h4 {
      font-size: 0.875rem;
    }
    
    .success-content p {
      font-size: 0.75rem;
    }
  }
`;

const ErrorNotification = styled(SuccessNotification)`
  background: ${Colors.dangerRed};
`;

const CameraModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: ${fadeIn} 0.3s ease-out;
  padding: 1rem;
`;

const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  background: ${Colors.darkGray};
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
`;

const WebcamContainer = styled.div`
  width: 100%;
  height: 400px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  .react-webcam {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    height: 300px;
  }

  @media (max-width: 576px) {
    height: 250px;
  }
`;

const CameraControls = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: ${Colors.darkGray};
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 576px) {
    gap: 0.5rem;
    padding: 0.75rem;
  }
`;

const CameraButton = styled.button`
  background: ${props => props.primary ? Colors.accentTeal : Colors.dangerRed};
  color: ${Colors.white};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 576px) {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const SwitchCameraButton = styled.button`
  background: ${Colors.infoBlue};
  color: ${Colors.white};
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 576px) {
    padding: 0.5rem;
    font-size: 0.75rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.7);
  color: ${Colors.white};
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${Colors.dangerRed};
    transform: scale(1.1);
  }

  @media (max-width: 576px) {
    width: 2rem;
    height: 2rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ImagePreviewContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border: 2px dashed ${Colors.mediumGray};
  border-radius: 0.75rem;
  text-align: center;
  background: ${Colors.lightGray};
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${Colors.textMuted};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${Colors.accentTeal};
    background: ${Colors.white};
    
    .overlay {
      opacity: 1;
    }
  }

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
    width: 100%;
    max-height: 250px;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .image-item {
    position: relative;
    border-radius: 0.5rem;
    overflow: hidden;
    aspect-ratio: 1;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .remove-btn {
      position: absolute;
      top: 0.25rem;
      right: 0.25rem;
      background: ${Colors.dangerRed};
      color: white;
      border: none;
      border-radius: 50%;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-size: 0.75rem;
    }
    
    &:hover .remove-btn {
      opacity: 1;
    }
  }

  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    
    svg {
      font-size: 2.5rem;
      opacity: 0.7;
    }
    
    .placeholder-text {
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    .placeholder-subtext {
      font-size: 0.75rem;
      opacity: 0.8;
      text-align: center;
      max-width: 300px;
    }
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(14, 165, 233, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  @media (max-width: 576px) {
    padding: 0.75rem;
    min-height: 150px;
    
    .image-grid {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 0.5rem;
    }
    
    .placeholder-content {
      padding: 0.5rem;
      
      svg {
        font-size: 2rem;
      }
      
      .placeholder-text {
        font-size: 0.75rem;
      }
      
      .placeholder-subtext {
        font-size: 0.65rem;
      }
    }
  }
`;

const UploadOptions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 576px) {
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
`;

const UploadOptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 2px solid ${Colors.accentTeal};
  background: ${props => props.active ? Colors.accentTeal : 'transparent'};
  color: ${props => props.active ? Colors.white : Colors.accentTeal};
  border-radius: 0.625rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  flex: 1;
  min-width: 140px;
  justify-content: center;
  
  &:hover {
    background: ${Colors.accentTeal};
    color: ${Colors.white};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 576px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    min-width: 120px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;
  animation: ${slideIn} 0.5s ease-out;

  label {
    font-weight: 600;
    color: ${Colors.darkGray};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    svg {
      color: ${Colors.accentTeal};
      width: 16px;
      height: 16px;
    }
    
    .required-badge {
      margin-left: auto;
      font-size: 0.7rem;
      background: ${Colors.dangerRed};
      color: ${Colors.white};
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
    }
  }

  .form-control, .form-select {
    border-radius: 0.75rem;
    border: 2px solid ${Colors.inputBorder};
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
    transition: all 0.2s ease-in-out;
    background: ${Colors.white};
    font-weight: 500;

    &:focus {
      border-color: ${Colors.inputFocus};
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
      transform: translateY(-1px);
    }

    &::placeholder {
      color: ${Colors.textMuted};
      font-weight: 400;
    }
  }

  .form-text {
    color: ${Colors.textMuted};
    font-size: 0.75rem;
    margin-top: 0.375rem;
    font-style: italic;
  }

  @media (max-width: 576px) {
    margin-bottom: 1rem;
    
    label {
      font-size: 0.75rem;
    }
    
    .form-control, .form-select {
      padding: 0.75rem;
      font-size: 0.75rem;
    }
    
    .form-text {
      font-size: 0.65rem;
    }
  }
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, ${Colors.accentTeal} 0%, ${Colors.infoBlue} 100%);
  color: ${Colors.white};
  border: none;
  cursor: pointer;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 300px;
  margin: 1.5rem auto 0;
  min-height: 48px;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 10px 20px -5px rgba(14, 165, 233, 0.25),
      0 6px 10px -5px rgba(0, 0, 0, 0.1);
    
    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    margin-right: 0.5rem;
    width: 18px;
    height: 18px;
  }

  @media (max-width: 576px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.875rem;
    max-width: 100%;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${Colors.mediumGray};
  
  &:last-of-type {
    border-bottom: none;
  }
  
  .section-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: ${Colors.primaryDark};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    svg {
      color: ${Colors.accentTeal};
      width: 20px;
      height: 20px;
    }
  }

  @media (max-width: 576px) {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    
    .section-title {
      font-size: 1rem;
      
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: ${Colors.primaryDark};
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    
    svg {
      color: ${Colors.accentTeal};
      width: 28px;
      height: 28px;
    }
  }
  
  .subtitle {
    color: ${Colors.textMuted};
    font-size: 0.875rem;
    font-weight: 500;
  }

  @media (max-width: 576px) {
    margin-bottom: 1.5rem;
    
    h1 {
      font-size: 1.5rem;
      
      svg {
        width: 24px;
        height: 24px;
      }
    }
    
    .subtitle {
      font-size: 0.75rem;
    }
  }
`;

const CurrencyDisplay = styled.div`
  background: ${Colors.lightGray};
  padding: 0.75rem;
  border-radius: 0.625rem;
  margin-top: 0.5rem;
  border: 1px solid ${Colors.mediumGray};
  
  .currency-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .amount {
      font-weight: 600;
      color: ${Colors.accentTeal};
    }
    
    .conversion {
      color: ${Colors.textMuted};
      font-style: italic;
    }
  }

  @media (max-width: 576px) {
    padding: 0.625rem;
    
    .currency-info {
      font-size: 0.65rem;
    }
  }
`;

// --- ENHANCED COMPONENT WITH MULTIPLE IMAGES & CURRENCY SUPPORT ---
const RegisterCoffin = () => {
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);

  const [coffinData, setCoffinData] = useState({
    type: '',
    material: '',
    size: '',
    color: '',
    quantity: '',
    exact_price: '',
    currency: 'KES',
    supplier: '',
    origin: '',
    category: 'locally_made'
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('gallery');
  const [facingMode, setFacingMode] = useState('environment');
  const [exchangeRate] = useState(150); // 1 USD = 150 KES
  const { slug } = useParams();

  // Get tenant slug from URL params or localStorage
  const getTenantSlug = () => {
    return slug ||
      localStorage.getItem('tenantSlug') ||
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

  // Get username from localStorage with fallback
  const getUsername = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.username || user.name || 'Admin';
      }
    } catch (error) {
      console.log('Could not get user from localStorage:', error);
    }
    return 'Admin';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCoffinData({ ...coffinData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        setTimeout(() => setError(null), 5000);
        return;
      }

      newImageFiles.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreviews.push(reader.result);
        if (newImagePreviews.length === newImageFiles.length) {
          setImagePreviews([...newImagePreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(newImageFiles);
  };

  const removeImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
  };

  const handleImageClick = () => {
    if (uploadMethod === 'camera') {
      setShowCamera(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to blob
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], `coffin-photo-${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });

            const newImageFiles = [...imageFiles, file];
            const newImagePreviews = [...imagePreviews, imageSrc];

            setImageFiles(newImageFiles);
            setImagePreviews(newImagePreviews);
            setShowCamera(false);

            setSuccessMessage('Photo captured successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
          })
          .catch(err => {
            console.error('Error processing photo:', err);
            setError('Failed to capture photo. Please try again.');
            setTimeout(() => setError(null), 5000);
          });
      }
    }
  }, [webcamRef, imageFiles, imagePreviews]);

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const videoConstraints = {
    facingMode: facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  };

  // Calculate price conversion
  const calculatePriceConversion = () => {
    const price = parseFloat(coffinData.exact_price) || 0;
    if (coffinData.currency === 'USD') {
      return {
        kes: price * exchangeRate,
        usd: price
      };
    } else {
      return {
        kes: price,
        usd: price / exchangeRate
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Enhanced validation
    if (!coffinData.type || !coffinData.material || !coffinData.exact_price || !coffinData.currency) {
      setError('Model, Material, Price, and Currency are required fields.');
      setLoading(false);
      return;
    }

    if (parseFloat(coffinData.exact_price) <= 0) {
      setError('Price must be greater than 0.');
      setLoading(false);
      return;
    }

    const formData = new FormData();

    // Append all fields that match backend expectations
    Object.keys(coffinData).forEach(key => {
      if (coffinData[key] !== '') {
        formData.append(key, coffinData[key]);
      }
    });

    // Add username/created_by information
    formData.append('created_by', getUsername());

    // Append multiple images - field name must match multer upload.array('images', 10) on backend
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });

    try {
      console.log('Sending request to server...');

      // Use the API gateway URL directly for coffin registration
      // The gateway proxies /api/v1/restpoint/coffins/register to the coffin service
      const registerUrl = `${env.FULL_API_URL}${ENDPOINTS.COFFINS.BASE}/register`;
      const response = await fetch(registerUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Unknown server error');
      }

      // Success!
      setSuccessMessage(result.message || 'Coffin registered successfully! ⚰️✅');

      // Reset form
      setCoffinData({
        type: '',
        material: '',
        size: '',
        color: '',
        quantity: '',
        exact_price: '',
        currency: 'KES',
        supplier: '',
        origin: '',
        category: 'locally_made'
      });
      setImageFiles([]);
      setImagePreviews([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Auto-hide success after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

    } catch (err) {
      console.error('Error registering coffin:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');

      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const priceConversion = calculatePriceConversion();

  return (
    <PageContainer>
      {/* Loading Overlay */}
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Registering Coffin...</LoadingText>
        </LoadingOverlay>
      )}

      {/* Success Notification */}
      {successMessage && (
        <SuccessNotification>
          <CheckCircle size={24} />
          <div className="success-content">
            <h4>Success!</h4>
            <p>{successMessage}</p>
          </div>
        </SuccessNotification>
      )}

      {/* Error Notification */}
      {error && (
        <ErrorNotification>
          <XCircle size={24} />
          <div className="success-content">
            <h4>Error</h4>
            <p>{error}</p>
          </div>
        </ErrorNotification>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraModal>
          <CloseButton onClick={() => setShowCamera(false)}>
            <X size={20} />
          </CloseButton>
          <CameraContainer>
            <WebcamContainer>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="react-webcam"
                mirrored={facingMode === 'user'}
              />
            </WebcamContainer>
            <CameraControls>
              <SwitchCameraButton onClick={switchCamera}>
                <RotateCcw size={16} />
                Switch Camera
              </SwitchCameraButton>
              <CameraButton onClick={capturePhoto} primary>
                <Camera size={16} />
                Capture Photo
              </CameraButton>
              <CameraButton onClick={() => setShowCamera(false)}>
                <X size={16} />
                Cancel
              </CameraButton>
            </CameraControls>
          </CameraContainer>
        </CameraModal>
      )}

      <Card blurred={loading || showCamera}>
        <PageHeader>
          <h1>
            <Box /> Register New Coffin
          </h1>
          <div className="subtitle">
            Add coffin details to inventory management system
          </div>
        </PageHeader>

        <Form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <FormSection>
            <div className="section-title">
              <Box /> Basic Information
            </div>
            <Row>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formType">
                  <Form.Label>
                    <Box /> Model
                    <span className="required-badge">REQUIRED</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="type"
                    value={coffinData.type}
                    onChange={handleInputChange}
                    placeholder="e.g., Classic Mahogany"
                    required
                  />
                </StyledFormGroup>
              </Col>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formMaterial">
                  <Form.Label>
                    <Diamond /> Material
                    <span className="required-badge">REQUIRED</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="material"
                    value={coffinData.material}
                    onChange={handleInputChange}
                    placeholder="e.g., Mahogany Wood"
                    required
                  />
                </StyledFormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formCategory">
                  <Form.Label>
                    <Globe /> Origin Type
                    <span className="required-badge">REQUIRED</span>
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={coffinData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="locally_made">Locally Made</option>
                    <option value="imported">Imported</option>
                  </Form.Select>
                </StyledFormGroup>
              </Col>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formSupplier">
                  <Form.Label>
                    <Truck /> Supplier
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier"
                    value={coffinData.supplier}
                    onChange={handleInputChange}
                    placeholder="e.g., Woodcraft Co."
                  />
                  <Form.Text>
                    Optional - leave blank if not applicable
                  </Form.Text>
                </StyledFormGroup>
              </Col>
            </Row>
          </FormSection>

          {/* Specifications Section */}
          <FormSection>
            <div className="section-title">
              <Maximize2 /> Specifications
            </div>
            <Row>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formSize">
                  <Form.Label>
                    <Maximize2 /> Size
                  </Form.Label>
                  <Form.Select
                    name="size"
                    value={coffinData.size}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Size (Optional)</option>
                    <option value="Small">Small</option>
                    <option value="Standard">Standard</option>
                    <option value="Large">Large</option>
                    <option value="Extra Large">Extra Large</option>
                  </Form.Select>
                </StyledFormGroup>
              </Col>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formColor">
                  <Form.Label>
                    <Paintbrush /> Color
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="color"
                    value={coffinData.color}
                    onChange={handleInputChange}
                    placeholder="e.g., Dark Brown"
                  />
                </StyledFormGroup>
              </Col>
            </Row>
          </FormSection>

          {/* Pricing & Inventory Section */}
          <FormSection>
            <div className="section-title">
              <DollarSign /> Pricing & Inventory
            </div>
            <Row>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formCurrency">
                  <Form.Label>
                    <DollarSign /> Currency
                    <span className="required-badge">REQUIRED</span>
                  </Form.Label>
                  <Form.Select
                    name="currency"
                    value={coffinData.currency}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </Form.Select>
                </StyledFormGroup>
              </Col>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formExactPrice">
                  <Form.Label>
                    <DollarSign /> Price
                    <span className="required-badge">REQUIRED</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="exact_price"
                    value={coffinData.exact_price}
                    onChange={handleInputChange}
                    placeholder={coffinData.currency === 'USD' ? "e.g., 250.00" : "e.g., 25000.00"}
                    required
                    min="0"
                    step="0.01"
                  />
                  <Form.Text>
                    Enter price in {coffinData.currency}
                  </Form.Text>

                  {/* Price Conversion Display */}
                  {coffinData.exact_price && (
                    <CurrencyDisplay>
                      <div className="currency-info">
                        <span>Kenyan Shilling:</span>
                        <span className="amount">Ksh {priceConversion.kes.toFixed(2)}</span>
                      </div>
                      <div className="currency-info">
                        <span>US Dollar:</span>
                        <span className="amount">${priceConversion.usd.toFixed(2)}</span>
                      </div>
                      <div className="currency-info">
                        <span className="conversion">
                          Exchange rate: 1 USD = {exchangeRate} KES
                        </span>
                      </div>
                    </CurrencyDisplay>
                  )}
                </StyledFormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={12} lg={6}>
                <StyledFormGroup controlId="formQuantity">
                  <Form.Label>
                    <Package /> Stock Quantity
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={coffinData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 5"
                    min="0"
                  />
                  <Form.Text>
                    Defaults to 1 if not specified
                  </Form.Text>
                </StyledFormGroup>
              </Col>
            </Row>
          </FormSection>

          {/* Image Upload Section */}
          <FormSection>
            <div className="section-title">
              <Image /> Coffin Images
            </div>
            <Row>
              <Col md={12}>
                <StyledFormGroup controlId="formImageFile">
                  <Form.Label>
                    <Image /> Coffin Images
                  </Form.Label>

                  {/* Upload Method Selection - Sleek Mobile Design */}
                  <UploadOptions>
                    <UploadOptionButton
                      type="button"
                      active={uploadMethod === 'camera'}
                      onClick={() => setUploadMethod('camera')}
                    >
                      <Camera size={16} />
                      Take Photos
                    </UploadOptionButton>
                    <UploadOptionButton
                      type="button"
                      active={uploadMethod === 'gallery'}
                      onClick={() => setUploadMethod('gallery')}
                    >
                      <UploadCloud size={16} />
                      Upload Images
                    </UploadOptionButton>
                  </UploadOptions>

                  {/* Hidden file input for gallery upload */}
                  <Form.Control
                    type="file"
                    name="coffin_images"
                    onChange={handleFileChange}
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    multiple
                  />

                  {/* Image Preview Area */}
                  <ImagePreviewContainer onClick={handleImageClick}>
                    {imagePreviews.length > 0 ? (
                      <>
                        <div className="image-grid">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="image-item">
                              <img src={preview} alt={`Coffin preview ${index + 1}`} />
                              <button
                                type="button"
                                className="remove-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="overlay">
                          {uploadMethod === 'camera' ? 'Tap to take more photos' : 'Tap to add more images'}
                        </div>
                      </>
                    ) : (
                      <div className="placeholder-content">
                        {uploadMethod === 'camera' ? (
                          <>
                            <Camera size={40} />
                            <div className="placeholder-text">Tap to take photos</div>
                            <div className="placeholder-subtext">
                              Use your camera to capture coffin images from different angles
                            </div>
                          </>
                        ) : (
                          <>
                            <UploadCloud size={40} />
                            <div className="placeholder-text">Tap to upload images</div>
                            <div className="placeholder-subtext">
                              Select existing images from your device gallery
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </ImagePreviewContainer>

                  <Form.Text>
                    {uploadMethod === 'camera'
                      ? 'Capture multiple photos from different angles for better documentation'
                      : 'Upload multiple images (JPG, PNG up to 5MB each)'
                    }
                  </Form.Text>
                </StyledFormGroup>
              </Col>
            </Row>
          </FormSection>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Save />
                Register Coffin
              </>
            )}
          </PrimaryButton>

          {/* Back to Inventory Button */}
          <Button
            onClick={() => {
              const tenantSlug = getTenantSlug();
              navigate(`/tenant/${tenantSlug}/coffins`);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              background: 'transparent',
              border: `2px solid ${Colors.mediumGray}`,
              color: Colors.darkGray,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              width: '100%',
              maxWidth: '300px',
              margin: '1rem auto 0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = Colors.accentTeal;
              e.currentTarget.style.color = Colors.accentTeal;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = Colors.mediumGray;
              e.currentTarget.style.color = Colors.darkGray;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft size={18} />
            Back to Inventory
          </Button>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default RegisterCoffin;