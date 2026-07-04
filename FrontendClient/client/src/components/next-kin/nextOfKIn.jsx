import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Users,
  SquareUser,
  Handshake,
  Phone,
  PlusCircle,
  Trash2,
  X,
  Loader2,
  Mail,
  Edit3,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Elegant Vintage Color Palette
const THEME = {
  colors: {
    ink: '#15171A',
    bone: '#FAF8F4',
    bone2: '#F3EFE6',
    brass: '#8B7355',
    brassHover: '#A98F6E',
    verdigris: '#3D4F47',
    verdigrisDark: '#2E3F37',
    line: '#E3DDD0',
    lineDark: '#2C2F33',
    gray: '#6B6862',
    grayLight: 'rgba(250,248,244,0.62)',
    red: '#9B4A3F',
    redBg: '#F7ECE9',
    redLine: '#E8D2CC',
    white: '#FFFFFF',
    success: '#475A43',
    successBg: '#EEF3EC',
    successLine: '#DCE6D9',
    shadow: 'rgba(21,23,26,0.12)',
    overlay: 'rgba(21,23,26,0.88)',
  }
};

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const Container = styled.div`
  background: ${THEME.colors.bone};
  border-radius: 16px;
  padding: 1.75rem;
  border: 1px solid ${THEME.colors.line};
  box-shadow: 0 4px 20px ${THEME.colors.shadow};
  animation: ${fadeIn} 0.5s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 8px 32px ${THEME.colors.shadow};
    border-color: ${THEME.colors.brass};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${THEME.colors.line};
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${THEME.colors.ink};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: ${THEME.colors.brass};
  }
`;

const Counter = styled.span`
  background: ${THEME.colors.verdigris};
  color: ${THEME.colors.bone};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  margin-left: 0.5rem;
  letter-spacing: 0.3px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;

  &.primary {
    background: ${THEME.colors.verdigris};
    color: ${THEME.colors.bone};
    box-shadow: 0 2px 8px rgba(61, 79, 71, 0.2);

    &:hover {
      background: ${THEME.colors.verdigrisDark};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(61, 79, 71, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  &.secondary {
    background: ${THEME.colors.bone2};
    color: ${THEME.colors.ink};
    border: 1px solid ${THEME.colors.line};

    &:hover {
      background: ${THEME.colors.line};
    }
  }
`;

const KinGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const KinCard = styled.div`
  padding: 1.25rem;
  border: 1px solid ${THEME.colors.line};
  border-radius: 12px;
  position: relative;
  background: linear-gradient(135deg, ${THEME.colors.bone} 0%, ${THEME.colors.bone2} 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px ${THEME.colors.shadow};
  animation: ${slideUp} 0.4s ease-out;

  &:hover {
    border-color: ${THEME.colors.brass};
    box-shadow: 0 8px 24px ${THEME.colors.shadow};
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
  color: ${THEME.colors.ink};
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Relationship = styled.span`
  background: ${THEME.colors.verdigris};
  color: ${THEME.colors.bone};
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: ${THEME.colors.gray};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;

  &:hover {
    color: ${THEME.colors.red};
    background: ${THEME.colors.redBg};
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
  color: ${THEME.colors.gray};

  svg {
    width: 14px;
    height: 14px;
    color: ${THEME.colors.brass};
  }
`;

const DetailText = styled.span`
  color: ${THEME.colors.ink};
  font-weight: 500;
`;

const NoKin = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  color: ${THEME.colors.gray};
  font-size: 0.9rem;
  border: 2px dashed ${THEME.colors.line};
  border-radius: 12px;
  margin-bottom: 1rem;
  background: ${THEME.colors.bone2};

  svg {
    opacity: 0.5;
    margin-bottom: 0.75rem;
  }
`;

const Message = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 1rem;
  background: ${props => props.type === 'error' ? THEME.colors.redBg : THEME.colors.successBg};
  color: ${props => props.type === 'error' ? THEME.colors.red : THEME.colors.success};
  border: 1px solid ${props => props.type === 'error' ? THEME.colors.redLine : THEME.colors.successLine};
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
  padding: 1rem;
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${THEME.colors.bone};
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  padding: 1.75rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  border: 1px solid ${THEME.colors.line};
  animation: ${slideUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${THEME.colors.line};
`;

const ModalTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${THEME.colors.ink};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: ${THEME.colors.brass};
  }
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
  font-size: 0.85rem;
  font-weight: 600;
  color: ${THEME.colors.ink};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Required = styled.span`
  color: ${THEME.colors.red};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid ${THEME.colors.line};
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: ${THEME.colors.white};
  color: ${THEME.colors.ink};

  &:focus {
    outline: none;
    border-color: ${THEME.colors.brass};
    box-shadow: 0 0 0 3px rgba(139, 115, 85, 0.1);
  }

  &::placeholder {
    color: ${THEME.colors.gray};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const SecondaryButton = styled(Button)`
  background: ${THEME.colors.bone2};
  color: ${THEME.colors.ink};
  border: 1px solid ${THEME.colors.line};

  &:hover {
    background: ${THEME.colors.line};
  }
`;

// Main Component
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

  const kinEndpoint = ENDPOINTS.DECEASED.NEXT_OF_KIN(deceasedId);

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
                  <UserCheck size={16} color={THEME.colors.verdigris} />
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
              <ModalTitle>
                <UserPlus size={20} />
                Add Next of Kin
              </ModalTitle>
              <DeleteButton onClick={handleModalClose}>
                <X size={20} />
              </DeleteButton>
            </ModalHeader>
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
          </ModalContent>
        </ModalOverlay>
      )}

    </Container>
  );
};

export default NextOfKinSection;