import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Users,
  UserCheck,
  Phone,
  PlusCircle,
  Trash2,
  X,
  Loader2,
  Mail,
  UserPlus,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Professional color scheme matching flower bookings
const COLORS = {
  primary: '#0A2463',
  primaryLight: '#1A3A7A',
  white: '#FFFFFF',
  bg: '#F5F7FA',
  border: '#E8ECF0',
  borderLight: '#F3F4F6',
  text: '#1A1D24',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#E74C3C',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  accent: '#3B82F6',
  accentHover: '#2563eb',
  accentGlow: 'rgba(59, 130, 246, 0.1)',
  radius: '14px',
  radiusSm: '8px',
  radiusXs: '6px',
  shadowSm: '0 1px 4px rgba(0, 0, 0, 0.06)',
  shadowMd: '0 4px 12px rgba(0, 0, 0, 0.08)',
  shadowLg: '0 12px 32px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.2s ease',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  background: ${COLORS.white};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowSm};
  border: 1px solid ${COLORS.border};
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${COLORS.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Counter = styled.span`
  background: ${COLORS.accent};
  color: ${COLORS.white};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: ${COLORS.radiusSm};
  margin-left: 0.5rem;
  letter-spacing: 0.3px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: ${COLORS.radiusSm};
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${COLORS.border};
  background: ${COLORS.white};
  color: ${COLORS.text};
  cursor: pointer;
  transition: ${COLORS.transition};
  min-height: 40px;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${COLORS.shadowMd};
    border-color: ${COLORS.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &.primary {
    background: ${COLORS.accent};
    color: ${COLORS.white};
    border-color: transparent;
    box-shadow: ${COLORS.shadowSm};

    &:hover {
      background: ${COLORS.accentHover};
      border-color: transparent;
      box-shadow: ${COLORS.shadowMd};
    }
  }
`;

const KinGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }
`;

const KinCard = styled.div`
  padding: 1.25rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  background: ${COLORS.bg};
  transition: ${COLORS.transition};
  animation: ${slideUp} 0.4s ease-out;

  &:hover {
    border-color: ${COLORS.accent};
    box-shadow: 0 4px 12px ${COLORS.accentGlow};
    transform: translateY(-2px);
  }
`;

const KinHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const KinName = styled.div`
  font-weight: 600;
  color: ${COLORS.text};
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
`;

const Relationship = styled.span`
  background: ${COLORS.infoLight};
  color: ${COLORS.info};
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: ${COLORS.radiusXs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${COLORS.textMuted};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: ${COLORS.radiusXs};
  transition: ${COLORS.transition};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  flex-shrink: 0;

  &:hover {
    color: ${COLORS.danger};
    background: ${COLORS.dangerLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const KinDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${COLORS.textSecondary};

  svg {
    width: 14px;
    height: 14px;
    color: ${COLORS.accent};
    flex-shrink: 0;
  }
`;

const DetailText = styled.span`
  color: ${COLORS.text};
  font-weight: 500;
  word-break: break-word;
`;

const NoKin = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  color: ${COLORS.textSecondary};
  font-size: 0.9rem;
  border: 2px dashed ${COLORS.border};
  border-radius: ${COLORS.radius};
  margin: 1.5rem;
  background: ${COLORS.bg};

  svg {
    opacity: 0.5;
    margin-bottom: 0.75rem;
  }
`;

const Message = styled.div`
  padding: 0.75rem 1rem;
  border-radius: ${COLORS.radiusSm};
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  margin: 1rem 1.5rem 0;
  background: ${props => props.type === 'error' ? COLORS.dangerLight : COLORS.successLight};
  color: ${props => props.type === 'error' ? COLORS.danger : COLORS.success};
  border: 1px solid ${props => props.type === 'error' ? COLORS.danger : COLORS.success};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${COLORS.white};
  border-radius: ${COLORS.radius};
  box-shadow: ${COLORS.shadowLg};
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.bg};

  h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${COLORS.text};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ModalButton = styled.button`
  background: transparent;
  border: none;
  color: ${COLORS.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${COLORS.radiusXs};
  transition: ${COLORS.transition};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${COLORS.border};
    color: ${COLORS.text};
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.text};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Required = styled.span`
  color: ${COLORS.danger};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid ${COLORS.border};
  border-radius: ${COLORS.radiusSm};
  font-size: 0.875rem;
  color: ${COLORS.text};
  transition: ${COLORS.transition};
  background: ${COLORS.white};

  &:focus {
    outline: none;
    border-color: ${COLORS.accent};
    box-shadow: 0 0 0 3px ${COLORS.accentGlow};
  }

  &::placeholder {
    color: ${COLORS.textMuted};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: ${COLORS.radiusSm};
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid ${COLORS.border};
  background: ${COLORS.bg};
  color: ${COLORS.text};
  cursor: pointer;
  transition: ${COLORS.transition};
  min-height: 40px;
  flex: 1;

  &:hover {
    background: ${COLORS.border};
    border-color: ${COLORS.textSecondary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NextOfKinSection = ({ nextOfKin, onUpdate }) => {
  const { id: deceasedId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [localKin, setLocalKin] = useState([]);

  const [fullName, setFullName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');

  const kinEndpoint = `/deceased/${deceasedId}/next-of-kin`;

  useEffect(() => {
    if (nextOfKin && Array.isArray(nextOfKin)) {
      setLocalKin(nextOfKin);
    }
  }, [nextOfKin]);

  const resetForm = () => {
    setFullName('');
    setRelationship('');
    setContact('');
    setEmail('');
  };

  const clearMessage = () => {
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const handleDelete = async (kinId) => {
    if (!window.confirm('Remove this next of kin?')) return;
    setMessage(null);
    try {
      await api.delete(`${kinEndpoint}/${kinId}`);
      setLocalKin(prev => prev.filter(kin => kin.id !== kinId));
      setMessage({ text: 'Kin removed successfully', type: 'success' });
      if (onUpdate) onUpdate();
      clearMessage();
    } catch (error) {
      console.error('Delete kin error:', error);
      setMessage({ text: 'Error removing kin: ' + (error.response?.data?.message || error.message), type: 'error' });
      clearMessage();
    }
  };

  const handleAddKin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    if (!fullName.trim() || !relationship.trim() || !contact.trim()) {
      setMessage({ text: 'Please fill in required fields', type: 'error' });
      setIsLoading(false);
      clearMessage();
      return;
    }
    const payload = {
      deceased_id: deceasedId,
      full_name: fullName.trim(),
      relationship: relationship.trim(),
      contact: contact.trim(),
      email: email.trim() === '' ? null : email.trim(),
    };
    try {
      await api.post(kinEndpoint, payload);
      setShowModal(false);
      resetForm();
      setMessage({ text: 'Kin added successfully', type: 'success' });
      if (onUpdate) onUpdate();
      clearMessage();
    } catch (error) {
      console.error('Add kin error:', error);
      setMessage({ text: 'Error adding kin: ' + (error.response?.data?.message || error.message), type: 'error' });
      clearMessage();
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
    setMessage(null);
  };

  const hasNextOfKin = localKin && Array.isArray(localKin) && localKin.length > 0;

  return (
    <Container>
      <Header>
        <Title>
          <Users size={20} />
          Next of Kin
          {hasNextOfKin && <Counter>{localKin.length}</Counter>}
        </Title>

        <Button
          className="primary"
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
          disabled={isLoading}
        >
          <UserPlus size={16} />
          Add Next of Kin
        </Button>
      </Header>

      {message && (
        <Message type={message.type}>
          {message.text}
        </Message>
      )}

      {hasNextOfKin ? (
        <KinGrid>
          {localKin.map(kin => (
            <KinCard key={kin.id}>
              <KinHeader>
                <KinName>
                  <UserCheck size={16} color={COLORS.accent} />
                  {kin.full_name}
                  <Relationship>{kin.relationship}</Relationship>
                </KinName>
                <DeleteButton
                  onClick={() => handleDelete(kin.id)}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </DeleteButton>
              </KinHeader>
              <KinDetails>
                <DetailItem>
                  <Phone size={14} />
                  <DetailText>{kin.contact}</DetailText>
                </DetailItem>
                {kin.email && (
                  <DetailItem>
                    <Mail size={14} />
                    <DetailText>{kin.email}</DetailText>
                  </DetailItem>
                )}
              </KinDetails>
            </KinCard>
          ))}
        </KinGrid>
      ) : (
        <NoKin>
          <Users size={32} />
          <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>No next of kin added</div>
          <div style={{ fontSize: '0.8rem' }}>
            Click "Add Next of Kin" to add family members
          </div>
        </NoKin>
      )}

      {showModal && (
        <ModalOverlay onClick={handleModalClose}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h4>
                <UserPlus size={20} />
                Add Next of Kin
              </h4>
              <ModalButton onClick={handleModalClose}>
                <X size={20} />
              </ModalButton>
            </ModalHeader>
            <ModalBody>
              <Form onSubmit={handleAddKin}>
                <FormGroup>
                  <Label>
                    Full Name <Required>*</Required>
                  </Label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </FormGroup>
                <FormGroup>
                  <Label>
                    Relationship <Required>*</Required>
                  </Label>
                  <Input
                    type="text"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    placeholder="e.g., Father, Mother, Spouse"
                    required
                    disabled={isLoading}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>
                    Phone Number <Required>*</Required>
                  </Label>
                  <Input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+254 700 000 000"
                    required
                    disabled={isLoading}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>
                    Email Address (Optional)
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    disabled={isLoading}
                  />
                </FormGroup>
                <ModalActions>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    style={{ flex: 1 }}
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                    {isLoading ? 'Adding...' : 'Add Next of Kin'}
                  </Button>
                  <SecondaryButton
                    type="button"
                    onClick={handleModalClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </SecondaryButton>
                </ModalActions>
              </Form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default NextOfKinSection;