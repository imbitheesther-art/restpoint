import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import axios from 'axios';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  FlaskConical, 
  TrendingUp, 
  Users, 
  Truck,
  Calendar,
  Plus,
  X,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Loader2,
  FileText,
  Edit3,
  Trash2
} from 'lucide-react';

// Modern color palette
const colors = {
  primary: '#5D5FEF',
  primaryLight: '#8183f2',
  primaryGradient: 'linear-gradient(135deg, #5D5FEF 0%, #8183f2 100%)',
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(93, 95, 239, 0.5); }
  50% { box-shadow: 0 0 20px rgba(93, 95, 239, 0.8); }
  100% { box-shadow: 0 0 5px rgba(93, 95, 239, 0.5); }
`;

const slideIn = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const Container = styled.div`
  background: ${colors.white};
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid ${colors.gray200};
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  margin: 16px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${colors.primaryGradient};
  }

  @media (max-width: 768px) {
    padding: 20px;
    margin: 12px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin: 8px;
    border-radius: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.gray900};
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  background: ${colors.primaryGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  svg {
    color: ${colors.primary};
  }

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    gap: 8px;
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${colors.gray50};
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${colors.gray200};
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 14px;
    gap: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    gap: 8px;
  }
`;

const ProgressText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.gray600};
  min-width: 100px;

  @media (max-width: 480px) {
    min-width: 80px;
    font-size: 12px;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 10px;
  background: ${colors.gray200};
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  min-width: 120px;

  @media (max-width: 480px) {
    height: 8px;
    min-width: 100px;
  }
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${colors.primaryGradient};
  border-radius: 5px;
  transition: width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  width: ${props => props.progress}%;
  box-shadow: 0 0 8px rgba(93, 95, 239, 0.3);
`;

const ProgressPercentage = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.primary};
  min-width: 40px;
  text-align: right;

  @media (max-width: 480px) {
    font-size: 13px;
    min-width: 35px;
  }
`;

const Timeline = styled.div`
  display: grid;
  gap: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, ${colors.primary} 0%, ${colors.gray200} 100%);
    z-index: 1;
  }

  @media (max-width: 768px) {
    gap: 16px;
    
    &::before {
      left: 20px;
    }
  }

  @media (max-width: 480px) {
    gap: 12px;
    
    &::before {
      left: 18px;
    }
  }
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  z-index: 2;
  padding: 6px;
  border-radius: 14px;
  transition: all 0.3s ease;

  ${props => props.status === 'active' && css`
    background: rgba(93, 95, 239, 0.05);
    border: 1px solid rgba(93, 95, 239, 0.1);
    transform: translateX(6px);
  `}

  ${props => props.status === 'completed' && css`
    opacity: 0.9;
  `}

  @media (max-width: 480px) {
    gap: 12px;
    padding: 4px;
  }
`;

const TimelineIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;

  ${props => props.status === 'completed' && css`
    background: ${colors.success};
    color: ${colors.white};
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.25);
  `}

  ${props => props.status === 'active' && css`
    background: ${colors.primary};
    color: ${colors.white};
    box-shadow: 0 0 0 6px rgba(93, 95, 239, 0.15);
    animation: ${pulse} 2s infinite, ${glow} 3s infinite;
  `}

  ${props => props.status === 'pending' && css`
    background: ${colors.gray100};
    color: ${colors.gray400};
    border: 2px solid ${colors.gray300};
  `}

  ${props => props.hasWarning && css`
    &::after {
      content: '';
      position: absolute;
      top: -3px;
      right: -3px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${colors.error};
      border: 2px solid ${colors.white};
      animation: ${pulse} 1.5s infinite;
    }
  `}

  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    
    &::after {
      width: 14px;
      height: 14px;
      top: -2px;
      right: -2px;
    }
  }
`;

const TimelineContent = styled.div`
  flex: 1;
  padding: 10px;
  border-radius: 14px;
  transition: all 0.3s ease;

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const TimelineTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${props => {
    switch(props.status) {
      case 'completed': return colors.success;
      case 'active': return colors.primary;
      default: return colors.gray600;
    }
  }};
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    font-size: 14px;
    gap: 4px;
  }
`;

const TimelineDescription = styled.p`
  font-size: 13px;
  color: ${colors.gray500};
  margin: 0;
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 12px;
    line-height: 1.3;
  }
`;

const TimelineTime = styled.span`
  font-size: 11px;
  color: ${colors.gray400};
  display: block;
  margin-top: 6px;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 10px;
    margin-top: 4px;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 6px;

  ${props => props.status === 'completed' && css`
    background: rgba(16, 185, 129, 0.1);
    color: ${colors.success};
  `}

  ${props => props.status === 'active' && css`
    background: rgba(93, 95, 239, 0.1);
    color: ${colors.primary};
  `}

  ${props => props.status === 'pending' && css`
    background: rgba(156, 163, 175, 0.1);
    color: ${colors.gray500};
  `}

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 3px 8px;
    margin-left: 4px;
  }
`;

const AddServiceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.primaryGradient};
  color: ${colors.white};
  border: none;
  padding: 12px 18px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(93, 95, 239, 0.25);
  font-size: 14px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(93, 95, 239, 0.35);
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 13px;
    width: 100%;
    justify-content: center;
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const ModalContent = styled.div`
  background: ${colors.white};
  border-radius: 20px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.4s ease;
  position: relative;

  @media (max-width: 768px) {
    padding: 20px;
    max-width: 90vw;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${colors.gray200};

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.gray900};
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.gray500};
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.gray100};
    color: ${colors.gray700};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.gray700};
  margin-bottom: 8px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.gray200};
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: ${colors.white};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(93, 95, 239, 0.1);
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 13px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${colors.gray200};
  border-radius: 10px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
  background: ${colors.white};
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(93, 95, 239, 0.1);
  }

  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 13px;
    min-height: 70px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: ${colors.primaryGradient};
  color: ${colors.white};
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(93, 95, 239, 0.35);
  }

  &:disabled {
    background: ${colors.gray300};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 480px) {
    padding: 12px;
    font-size: 13px;
  }
`;

// Charges List Components
const ChargesList = styled.div`
  margin-top: 24px;
`;

const ChargeItem = styled.div`
  background: ${colors.gray50};
  border: 1px solid ${colors.gray200};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 480px) {
    padding: 14px;
    flex-direction: column;
    gap: 12px;
  }
`;

const ChargeInfo = styled.div`
  flex: 1;
`;

const ChargeTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.gray800};
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const ChargeDescription = styled.p`
  font-size: 14px;
  color: ${colors.gray600};
  margin: 0 0 8px 0;
  line-height: 1.4;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ChargeMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: ${colors.gray500};

  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const ChargeAmount = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.success};
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'edit' ? colors.primary : colors.error};
  color: ${colors.white};
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 480px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.gray500};

  svg {
    margin-bottom: 12px;
    color: ${colors.gray400};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: ${colors.gray500};
  font-weight: 500;
  
  svg {
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: ${colors.error};
  font-weight: 500;
  text-align: center;
  flex-direction: column;
  gap: 12px;
`;

// Status Timeline Component
const StatusTimeline = ({ deceasedData }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    charge_type: '',
    amount: '',
    notes: '',
    requested_by: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charges, setCharges] = useState([]);
  const [editingCharge, setEditingCharge] = useState(null);

  const { id: deceasedId } = useParams();
  const API_BASE_URL = 'http://localhost:8009/api/v1/restpoint';

  const fetchCharges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/extra-charges/deceased/${deceasedId}`);
      setCharges(response.data.extraCharges || []);
    } catch (err) {
      console.error("Error fetching charges:", err);
    }
  };

  useEffect(() => {
    if (deceasedId) {
      fetchCharges();
    }
  }, [deceasedId]);

  // Calculate status based on backend data
  const isEmbalmed = deceasedData.is_embalmed === 1;
  const autopsyDone = deceasedData.postmortem !== null;
  const hasNextOfKin = deceasedData.next_of_kin && deceasedData.next_of_kin.length > 0;
  const status = deceasedData.status || 'Received';

  const steps = [
    {
      id: 'received',
      title: 'Body Received',
      description: 'Deceased has been received and registered in the system',
      icon: <User size={20} />,
      status: 'completed',
      time: 'Completed',
      hasWarning: false
    },
    {
      id: 'autopsy',
      title: 'Autopsy',
      description: 'Post-mortem examination and documentation',
      icon: <FlaskConical size={20} />,
      status: autopsyDone ? 'completed' : status === 'Pending Autopsy' ? 'active' : 'pending',
      time: autopsyDone ? 'Completed' : 'Pending',
      hasWarning: !autopsyDone
    },
    {
      id: 'embalming',
      title: 'Embalming Process',
      description: 'Preservation and preparation of the deceased',
      icon: <TrendingUp size={20} />,
      status: isEmbalmed ? 'completed' : 'pending',
      time: isEmbalmed ? 'Completed' : 'Not Started',
      hasWarning: !isEmbalmed
    },
    {
      id: 'nextofkin',
      title: 'Next of Kin',
      description: 'Family notification and documentation',
      icon: <Users size={20} />,
      status: hasNextOfKin ? 'completed' : 'pending',
      time: hasNextOfKin ? 'Verified' : 'Awaiting',
      hasWarning: !hasNextOfKin
    },
    {
      id: 'dispatch',
      title: 'Dispatch Ready',
      description: 'Preparation for release and transportation',
      icon: <Truck size={20} />,
      status: status === 'Dispatched' ? 'completed' : status === 'Ready for Collection' ? 'active' : 'pending',
      time: status === 'Dispatched' ? 'Completed' : 'Preparing',
      hasWarning: status === 'Received'
    }
  ];

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  const handleAddCharge = () => {
    setEditingCharge(null);
    setFormData({
      charge_type: '',
      amount: '',
      notes: '',
      requested_by: ''
    });
    setShowModal(true);
  };

  const handleEditCharge = (charge) => {
    setEditingCharge(charge);
    setFormData({
      charge_type: charge.charge_type || '',
      amount: charge.amount || '',
      notes: charge.notes || '',
      requested_by: charge.requested_by || ''
    });
    setShowModal(true);
  };

  const handleDeleteCharge = async (chargeId) => {
    if (window.confirm('Are you sure you want to delete this charge?')) {
      try {
        await axios.delete(`${API_BASE_URL}/extra-charges/${chargeId}`);
        await fetchCharges();
      } catch (err) {
        console.error("Error deleting charge:", err);
        alert('Failed to delete charge. Please try again.');
      }
    }
  };

  const handleSubmitCharge = async () => {
    if (!formData.charge_type || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const chargeData = {
        deceased_id: deceasedId,
        charge_type: formData.charge_type,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
        requested_by: formData.requested_by
      };

      if (editingCharge) {
        await axios.put(`${API_BASE_URL}/extra-charges/${editingCharge.id}`, chargeData);
      } else {
        await axios.post(`${API_BASE_URL}/extra-charges`, chargeData);
      }

      setShowModal(false);
      await fetchCharges();
    } catch (err) {
      console.error("Error saving charge:", err);
      alert('Failed to save charge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `KSh ${parseFloat(amount).toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <>
      <Container>
        <Header>
          <Title>
            <Calendar size={24} />
            Mortuary Process Timeline
          </Title>
        </Header>

        <ProgressContainer>
          <ProgressText>Process Completion</ProgressText>
          <ProgressBar>
            <ProgressFill progress={progressPercentage} />
          </ProgressBar>
          <ProgressPercentage>{progressPercentage}%</ProgressPercentage>
        </ProgressContainer>

        <Timeline>
          {steps.map((step) => (
            <TimelineItem key={step.id} status={step.status}>
              <TimelineIcon status={step.status} hasWarning={step.hasWarning}>
                {step.icon}
                {step.hasWarning && <AlertTriangle size={10} style={{ position: 'absolute', top: 3, right: 3, color: 'white' }} />}
              </TimelineIcon>
              
              <TimelineContent status={step.status}>
                <TimelineTitle status={step.status}>
                  {step.title}
                  <StatusBadge status={step.status}>
                    {step.status.toUpperCase()}
                  </StatusBadge>
                </TimelineTitle>
                
                <TimelineDescription>
                  {step.description}
                </TimelineDescription>
                
                <TimelineTime>
                  {step.time}
                </TimelineTime>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>

        <ChargesList>
          <Header>
            <Title>
              <DollarSign size={20} />
              Extra Charges
            </Title>
            <AddServiceButton onClick={handleAddCharge}>
              <Plus size={18} />
              Add New Charge
            </AddServiceButton>
          </Header>

          {charges.length === 0 ? (
            <EmptyState>
              <FileText size={48} />
              <h3>No Extra Charges</h3>
              <p>Add your first extra charge to get started</p>
            </EmptyState>
          ) : (
            charges.map((charge) => (
              <ChargeItem key={charge.id}>
                <ChargeInfo>
                  <ChargeTitle>
                    <User size={16} />
                    {charge.charge_type}
                  </ChargeTitle>
                  {charge.notes && (
                    <ChargeDescription>{charge.notes}</ChargeDescription>
                  )}
                  <ChargeMeta>
                    {charge.requested_by && (
                      <span>Requested by: {charge.requested_by}</span>
                    )}
                    <span>
                      <Calendar size={12} />
                      {formatDate(charge.service_date || charge.created_at)}
                    </span>
                  </ChargeMeta>
                </ChargeInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <ChargeAmount>
                    <DollarSign size={16} />
                    {formatCurrency(charge.amount)}
                  </ChargeAmount>
                  <ActionButtons>
                    <ActionButton 
                      variant="edit" 
                      onClick={() => handleEditCharge(charge)}
                    >
                      <Edit3 size={14} />
                      Edit
                    </ActionButton>
                    <ActionButton 
                      variant="delete" 
                      onClick={() => handleDeleteCharge(charge.id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </ActionButton>
                  </ActionButtons>
                </div>
              </ChargeItem>
            ))
          )}
        </ChargesList>
      </Container>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Sparkles size={20} />
                {editingCharge ? 'Edit Charge' : 'Add New Charge'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <Label>Service Type *</Label>
              <Input
                type="text"
                placeholder="Enter service type (e.g., Transportation, Documentation, etc.)"
                value={formData.charge_type}
                onChange={(e) => setFormData({...formData, charge_type: e.target.value})}
              />
            </FormGroup>

            <FormGroup>
              <Label>Amount (KSh) *</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                min="0"
                step="0.01"
              />
            </FormGroup>

            <FormGroup>
              <Label>Requested By</Label>
              <Input
                type="text"
                placeholder="Who requested this service?"
                value={formData.requested_by}
                onChange={(e) => setFormData({...formData, requested_by: e.target.value})}
              />
            </FormGroup>

            <FormGroup>
              <Label>Notes</Label>
              <TextArea
                placeholder="Additional notes or description..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </FormGroup>

            <SubmitButton 
              onClick={handleSubmitCharge}
              disabled={!formData.charge_type || !formData.amount || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} />
                  {editingCharge ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  {editingCharge ? 'Update Charge' : 'Add Charge'}
                </>
              )}
            </SubmitButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

// Main Component
const ProcessTimeline = () => {
  const { id: deceasedId } = useParams();
  const [deceasedData, setDeceasedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

  const fetchDeceasedData = async () => {
    if (!deceasedId) {
      setError('No deceased ID provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/deceased-id?id=${deceasedId}`);
      
      if (response.data && response.data.data) {
        setDeceasedData(response.data.data);
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError(err.response?.data?.message || "Failed to load deceased data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeceasedData();
  }, [deceasedId]);

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <Loader2 size={24} />
          Loading timeline data...
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <AlertCircle size={24} />
          {error}
        </ErrorContainer>
      </Container>
    );
  }

  if (!deceasedData) {
    return (
      <Container>
        <ErrorContainer>
          No data found for this deceased record
        </ErrorContainer>
      </Container>
    );
  }

  return <StatusTimeline deceasedData={deceasedData} />;
};

export default ProcessTimeline;