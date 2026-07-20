import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DollarSign, AlertCircle, CheckCircle, Loader2, Calendar, Clock, ClipboardList, Truck, UserCheck, CreditCard, TrendingUp, AlertTriangle, Info, Home, FileText, Users, Plus, Edit, Trash2, X, Save, Tag } from '../../utils/icons/icons';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import styled, { keyframes } from 'styled-components';
import { Container, Row, Col, Card, Badge, Button, Modal, Form } from 'react-bootstrap';

// Modern color palette with gradients
const Colors = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  secondary: '#64748B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  infoBlue: '#3B82F6',
  cardBg: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  borderColor: '#E5E7EB',
  accentGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  successGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  warningGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  dangerGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  shadow: '0 6px 20px rgba(0,0,0,0.05), 0 3px 8px rgba(0,0,0,0.03)',
  shadowHover: '0 10px 30px rgba(0,0,0,0.08), 0 5px 12px rgba(0,0,0,0.05)',
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

// --- Styled Components ---
const PageWrapper = styled.div`
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f8fafc;
  color: ${Colors.textPrimary};
  min-height: 100vh;
  animation: ${fadeIn} 0.5s ease-out;
  padding: 1rem 0;
`;

const StyledCard = styled(Card)`
  border-radius: 0.75rem;
  box-shadow: ${Colors.shadow};
  border: none;
  margin-bottom: 1.25rem;
  transition: all 0.2s ease;
  overflow: hidden;
  
  &:hover {
    box-shadow: ${Colors.shadowHover};
    transform: translateY(-1px);
  }
`;

const InnerCard = styled.div`
  background: ${props => props.highlight ? '#f0f9ff' : '#f9fafb'};
  border: 1px solid ${props => props.highlight ? Colors.primary + '20' : Colors.borderColor};
  border-radius: 0.6rem;
  padding: 0.4rem;
  height: 100%;
  transition: all 0.2s ease;
  
  strong {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${Colors.textSecondary};
    display: block;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  
  span {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${Colors.textPrimary};
  }
  
  .icon {
    color: ${props => props.highlight ? Colors.primary : Colors.secondary};
    margin-right: 0.4rem;
  }
`;

const IconWrapper = styled.div`
  background: ${props => props.gradient ? props.gradient : '#f1f5f9'};
  padding: 0.5rem;
  border-radius: 0.75rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.08);
`;

const Title = styled.h5`
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${Colors.textPrimary};
`;

const PaymentAmount = styled.span`
  font-size: 1rem;
  font-weight: 700;
  line-height: 1;
  color: ${({ isBalanceDue }) => (isBalanceDue ? Colors.danger : Colors.success)};
  transition: all 0.2s ease;
  animation: ${pulse} 2s infinite;
`;

const PaymentStatus = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ isBalanceDue }) => (isBalanceDue ? Colors.danger : Colors.success)};
  padding: 0.35rem 0.75rem;
  border-radius: 1.5rem;
  border: 1.5px solid ${({ isBalanceDue }) => (isBalanceDue ? Colors.danger + '20' : Colors.success + '20')};
`;

const ProgressBarContainer = styled.div`
  height: 10px;
  background-color: #f1f5f9;
  border-radius: 0.75rem;
  margin: 1rem 0 0.4rem;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
`;

const StyledProgressBar = styled.div.attrs(props => ({
  style: {
    width: `${props.progress}%`,
    background: props.progress === 100 ? Colors.successGradient : Colors.accentGradient
  }
}))`
  height: 100%;
  border-radius: 0.75rem;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border-radius: 0.75rem;
  padding: 0.9rem;
  border: 1px solid ${Colors.borderColor};
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  span {
    color: ${Colors.textPrimary};
    font-size: 0.85rem;
    font-weight: 500;
    flex: 1;
  }
`;

const StatBadge = styled(Badge)`
  background: ${props => {
    switch (props.variant) {
      case 'success': return Colors.successGradient;
      case 'warning': return Colors.warningGradient;
      case 'danger': return Colors.dangerGradient;
      default: return Colors.accentGradient;
    }
  }};
  color: white;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 0.75rem;
  border: none;
  font-size: 0.75rem;
`;

const CardHeader = styled.div`
  background: #f8fafc;
  padding: 0.9rem;
  border-bottom: 1px solid ${Colors.borderColor};
`;

const CardBody = styled.div`
  padding: 0.4rem;
`;

const RefreshButton = styled(Button)`
  background: ${Colors.accentGradient};
  border: none;
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const ActionButton = styled(Button)`
  border: none;
  border-radius: 0.5rem;
  padding: 0.4rem 0.8rem;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const AddButton = styled(ActionButton)`
  background: ${Colors.successGradient};
  color: white;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

const EditButton = styled(ActionButton)`
  background: ${Colors.accentGradient};
  color: white;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const DeleteButton = styled(ActionButton)`
  background: ${Colors.dangerGradient};
  color: white;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
`;

const ExtraChargeItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid ${Colors.borderColor};
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${Colors.primary};
    transform: translateX(2px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ChargeTypeBadge = styled(Badge)`
  background: ${Colors.infoBlue};
  color: white;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
`;

// Main Component
function MortuaryCharges() {
  const { id: deceasedId } = useParams();
  const idToFetch = deceasedId;

  const [deceasedData, setDeceasedData] = useState(null);
  const [extraCharges, setExtraCharges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExtraChargeModal, setShowExtraChargeModal] = useState(false);
  const [editingCharge, setEditingCharge] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    charge_type: '',
    custom_charge_type: ''
  });
  const [showCustomInput, setShowCustomInput] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';

  // Common charge types for suggestions
  const commonChargeTypes = [
    'Transportation',
    'Embalming',
    'Casket',
    'Burial Preparation',
    'Documentation',
    'Storage',
    'Viewing Room',
    'Cleaning',
    'Administrative',
    'Other Services'
  ];

  const getDaysInMortuary = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchDeceasedData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/deceased/deceased-id/${idToFetch}`);

      if (response.data && response.data.data) {
        setDeceasedData(response.data.data);
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError(err.response?.data?.message || "Failed to load data. Please check the API URL and server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExtraCharges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/extra-charges/deceased/${idToFetch}`);
      if (response.data) {
        setExtraCharges(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching extra charges:", err);
    }
  };

  useEffect(() => {
    if (idToFetch) {
      fetchDeceasedData();
      fetchExtraCharges();
    }
  }, [idToFetch]);

  const handleRefresh = () => {
    fetchDeceasedData();
    fetchExtraCharges();
  };

  const handleAddExtraCharge = () => {
    setEditingCharge(null);
    setFormData({
      description: '',
      amount: '',
      charge_type: '',
      custom_charge_type: ''
    });
    setShowCustomInput(false);
    setShowExtraChargeModal(true);
  };

  const handleEditExtraCharge = (charge) => {
    setEditingCharge(charge);
    const isCustomType = !commonChargeTypes.includes(charge.charge_type);
    setFormData({
      description: charge.description,
      amount: charge.amount,
      charge_type: isCustomType ? 'custom' : charge.charge_type,
      custom_charge_type: isCustomType ? charge.charge_type : ''
    });
    setShowCustomInput(isCustomType);
    setShowExtraChargeModal(true);
  };

  const handleDeleteExtraCharge = async (chargeId) => {
    if (window.confirm('Are you sure you want to delete this extra charge?')) {
      try {
        await axios.delete(`${API_BASE_URL}/extra-charges/${chargeId}`);
        fetchExtraCharges();
        fetchDeceasedData();
      } catch (err) {
        console.error("Error deleting extra charge:", err);
      }
    }
  };

  const handleSaveExtraCharge = async () => {
    try {
      // Determine the final charge type
      const finalChargeType = formData.charge_type === 'custom'
        ? formData.custom_charge_type
        : formData.charge_type;

      const chargeData = {
        deceased_id: idToFetch,
        description: formData.description,
        amount: parseFloat(formData.amount),
        charge_type: finalChargeType
      };

      if (editingCharge) {
        await axios.put(`${API_BASE_URL}/extra-charges/${editingCharge.id}`, chargeData);
      } else {
        await axios.post(`${API_BASE_URL}/extra-charges`, chargeData);
      }

      setShowExtraChargeModal(false);
      fetchExtraCharges();
      fetchDeceasedData();
    } catch (err) {
      console.error("Error saving extra charge:", err);
    }
  };

  const handleChargeTypeChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      charge_type: value,
      custom_charge_type: value === 'custom' ? '' : formData.custom_charge_type
    });
    setShowCustomInput(value === 'custom');
  };

  const calculateTotalExtraCharges = () => {
    return extraCharges.reduce((total, charge) => total + parseFloat(charge.amount || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center p-4 rounded-3">
          <Loader2 className="animate-spin text-primary mb-3" size={36} style={{ animation: 'spin 1s linear infinite' }} />
          <span className="fs-6 fw-medium text-secondary">Loading Financial Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center p-4 rounded-3 text-danger">
          <AlertCircle size={36} className="mb-3" />
          <span className="fs-6 fw-medium d-block mb-3">{error}</span>
          <RefreshButton onClick={handleRefresh}>
            Try Again
          </RefreshButton>
        </div>
      </div>
    );
  }

  if (!deceasedData) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center rounded-3 text-secondary">
          <AlertCircle size={36} className="mb-3" />
          <span className="fs-6 fw-medium d-block mb-3">No data found for this deceased ID.</span>
          <RefreshButton onClick={handleRefresh}>
            Refresh
          </RefreshButton>
        </div>
      </div>
    );
  }

  // Extract financial data from API response
  const financialDetails = deceasedData.financial_details || {};
  const daysInMortuary = financialDetails.days_spent || getDaysInMortuary(deceasedData.date_admitted);
  const baseMortuaryCharge = parseFloat(deceasedData.total_mortuary_charge) || 0;
  const totalExtraCharges = calculateTotalExtraCharges();
  const totalMortuaryCharge = baseMortuaryCharge + totalExtraCharges;
  const totalPaid = parseFloat(financialDetails.total_payments) || 0;
  const balance = totalMortuaryCharge - totalPaid;
  const coldRoomCharges = parseFloat(financialDetails.cold_room_charges) || 0;

  // Calculate payment percentage
  const paymentPercentage = totalMortuaryCharge > 0 ?
    Math.min(Math.round((totalPaid / totalMortuaryCharge) * 100), 100) : 0;

  // Calculate daily rate based on actual charges
  const dailyRate = daysInMortuary > 0 ? Math.round(coldRoomCharges / daysInMortuary) : 0;

  // Get payments from API response
  const payments = deceasedData.payments || [];

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate notifications based on API data
  const apiNotifications = deceasedData.notifications || [];
  const customNotifications = [
    {
      message: `💰 Outstanding balance of KSh ${Math.abs(balance).toLocaleString()}`,
      type: balance > 0 ? 'warning' : 'success'
    },
    {
      message: `✅ ${payments.length} payment(s) received totaling KSh ${totalPaid.toLocaleString()}`,
      type: 'success'
    },
    {
      message: `📅 ${daysInMortuary} days in mortuary`,
      type: 'info'
    },
    ...(extraCharges.length > 0 ? [{
      message: `📋 ${extraCharges.length} extra charge(s) added - KSh ${totalExtraCharges.toLocaleString()}`,
      type: 'info'
    }] : []),
    ...(balance > 0 ? [{
      message: `⚠️ Payment overdue - please settle outstanding balance`,
      type: 'danger'
    }] : [])
  ];

  // Combine API notifications with custom financial notifications
  const allNotifications = [...customNotifications, ...apiNotifications.map(notif => ({
    message: notif.message,
    type: notif.status
  }))];

  return (
    <PageWrapper>
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={12}>
            {/* Header Section */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <IconWrapper gradient={Colors.accentGradient}>
                      <UserCheck size={24} />
                    </IconWrapper>
                    <div>
                      <h1 className="h5 fw-bold text-dark mb-1">{deceasedData.full_name || 'Unknown Deceased'}</h1>
                      <span className="text-secondary small">Mortuary Financial Overview - {deceasedData.deceased_id}</span>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <StatBadge variant={balance > 0 ? "warning" : "success"}>
                      {balance > 0 ? 'Balance Due' : 'Account Settled'}
                    </StatBadge>
                    <RefreshButton onClick={handleRefresh} size="sm">
                      Refresh
                    </RefreshButton>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  <Col xs={12} md={3}>
                    <InnerCard highlight>
                      <strong><Calendar size={16} className="icon" />Admission Date</strong>
                      <span>{formatDate(deceasedData.date_admitted)}</span>
                    </InnerCard>
                  </Col>
                  <Col xs={12} md={4}>
                    <InnerCard>
                      <strong><Clock size={16} className="icon" />Days in Mortuary</strong>
                      <span>{daysInMortuary} days</span>
                    </InnerCard>
                  </Col>
                  <Col xs={12} md={4}>
                    <InnerCard>
                      <strong><Truck size={16} className="icon" />Status</strong>
                      <span>{deceasedData.status || 'In Mortuary'}</span>
                    </InnerCard>
                  </Col>
                </Row>
              </CardBody>
            </StyledCard>

            {/* Financial Summary Section */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <IconWrapper gradient={Colors.accentGradient}>
                    <DollarSign size={20} />
                  </IconWrapper>
                  <Title>Financial Summary</Title>
                </div>
              </CardHeader>
              <CardBody>
                <Row className="g-3 align-items-center">
                  <Col xs={12} md={6} className="text-center text-md-start">
                    <div className="mb-3">
                      <span className="text-secondary fw-semibold text-uppercase small d-block mb-1">
                        {balance > 0 ? 'Outstanding Balance' : 'Account Status'}
                      </span>
                      <PaymentAmount isBalanceDue={balance > 0}>
                        KSh {Math.abs(balance).toLocaleString()}
                      </PaymentAmount>
                      <PaymentStatus isBalanceDue={balance > 0} className="d-block mt-2">
                        {balance > 0 ? 'Payment Required' : 'Fully Paid'}
                      </PaymentStatus>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary fw-medium small">
                        <CreditCard size={14} className="me-1" />
                        Total Charges
                      </span>
                      <span className="fw-semibold text-dark small">KSh {totalMortuaryCharge.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary fw-medium small">
                        <TrendingUp size={14} className="me-1" />
                        Amount Paid
                      </span>
                      <span className="fw-semibold text-success small">KSh {totalPaid.toLocaleString()}</span>
                    </div>
                    <ProgressBarContainer>
                      <StyledProgressBar progress={paymentPercentage} />
                    </ProgressBarContainer>
                    <div className="d-flex justify-content-between text-secondary fw-medium small mt-1">
                      <span>Payment Progress</span>
                      <span className="fw-bold" style={{ color: Colors.primary }}>{paymentPercentage}%</span>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </StyledCard>

            {/* Charge Breakdown Section */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <IconWrapper gradient={Colors.infoBlue}>
                      <FileText size={20} />
                    </IconWrapper>
                    <Title>Charge Breakdown</Title>
                  </div>

                </div>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  <Col xs={12} md={4}>
                    <InnerCard>
                      <strong><Home size={16} className="icon" />Cold Room Charges</strong>
                      <span>KSh</span>
                      <small className="text-muted d-block mt-1">
                        {dailyRate > 0 ? `@ KSh /day` : 'Daily rate not available'}
                      </small>
                    </InnerCard>
                  </Col>
                  <Col xs={12} md={4}>
                    <InnerCard>
                      <strong><Info size={16} className="icon" />Extra Charges</strong>
                      <span>KSh {totalExtraCharges.toLocaleString()}</span>
                      <small className="text-muted d-block mt-1">
                        holding
                      </small>
                    </InnerCard>
                  </Col>
                  <Col xs={12} md={4}>
                    <InnerCard highlight>
                      <strong><DollarSign size={16} className="icon" />Total Charges</strong>
                      <span>KSh {totalMortuaryCharge.toLocaleString()}</span>
                    </InnerCard>
                  </Col>
                </Row>

                {/* Extra Charges List */}
                {extraCharges.length > 0 && (
                  <div className="mt-4">
                    <h6 className="fw-bold mb-3">Extra Charges Details</h6>
                    {extraCharges.map((charge) => (
                      <ExtraChargeItem key={charge.id}>
                        <div className="flex-grow-1">
                          <div className="fw-semibold d-flex align-items-center gap-2">
                            {charge.description}
                            <ChargeTypeBadge>
                              <Tag size={10} className="me-1" />
                              {charge.charge_type}
                            </ChargeTypeBadge>
                          </div>
                          <small className="text-muted">
                            Added {formatDate(charge.created_at)}
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-dark">KSh {parseFloat(charge.amount).toLocaleString()}</span>
                          <EditButton
                            size="sm"
                            onClick={() => handleEditExtraCharge(charge)}
                          >
                            <Edit size={14} />
                          </EditButton>
                          <DeleteButton
                            size="sm"
                            onClick={() => handleDeleteExtraCharge(charge.id)}
                          >
                            <Trash2 size={14} />
                          </DeleteButton>
                        </div>
                      </ExtraChargeItem>
                    ))}
                  </div>
                )}
              </CardBody>
            </StyledCard>



            {/* Additional Information Section */}
            <StyledCard>
              <CardHeader>
                <div className="d-flex align-items-center gap-2">
                  <IconWrapper gradient={Colors.warningGradient}>
                    <Users size={20} />
                  </IconWrapper>
                  <Title>Additional Information</Title>
                </div>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <InnerCard>
                      <strong><UserCheck size={16} className="icon" />Next of Kin</strong>
                      <span>
                        {deceasedData.next_of_kin && deceasedData.next_of_kin.length > 0
                          ? `${deceasedData.next_of_kin[0].full_name} (${deceasedData.next_of_kin[0].relationship})`
                          : 'Not specified'
                        }
                      </span>
                    </InnerCard>
                  </Col>
                  <Col xs={12} md={6}>
                    <InnerCard>
                      <strong><FileText size={16} className="icon" />Documents</strong>
                      <span>{deceasedData.documents ? deceasedData.documents.length : 0} document(s)</span>
                    </InnerCard>
                  </Col>
                </Row>
              </CardBody>
            </StyledCard>



          </Col>
        </Row>
      </Container>


    </PageWrapper>
  );
}

export default MortuaryCharges;