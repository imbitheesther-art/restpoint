import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { User, Calendar, Clock, Info, Phone, BookText, PlusCircle, Trash2, X, Loader2, Users, Eye, Search, Filter, Mail, MapPin, UserPlus, UserCheck, UserMinus } from '../../utils/icons/icons';
import api from '../../api/axios';

// Modern, softer color palette
const Colors = {
  // Primary colors - Softer blue
  primary: '#4F46E5',
  primaryLight: '#6366F1',
  primaryDark: '#4338CA',

  // Background colors
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  cardHover: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text colors
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',

  // Status colors - Softer variants
  success: '#0EA5E9', // Sky blue
  warning: '#F97316', // Orange
  danger: '#EF4444',
  info: '#06B6D4',

  // Accent colors
  accentPurple: '#8B5CF6',
  accentTeal: '#14B8A6',
  accentPink: '#EC4899',
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-6px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Main Container
const VisitorsContainer = styled.div`
  background: ${Colors.background};
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid ${Colors.border};
  animation: ${fadeIn} 0.3s ease-out;
  min-height: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 1rem;
  }
`;

// Header Section
const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.accentPurple} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
`;

const TitleContent = styled.div`
  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${Colors.textPrimary};
    margin: 0 0 0.125rem 0;
  }
  
  p {
    color: ${Colors.textSecondary};
    margin: 0;
    font-size: 0.875rem;
  }
`;

// Stats Cards
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: ${Colors.cardBg};
  border: 1px solid ${Colors.border};
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${Colors.primaryLight};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .stat-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .stat-content {
    flex: 1;
    
    .stat-value {
      font-size: 1rem;
      font-weight: 700;
      color: ${Colors.textPrimary};
      margin: 0;
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: ${Colors.textSecondary};
      margin: 0;
    }
  }
`;

// Sleek Action Button
const ActionButton = styled.button`
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryLight} 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.2);
  min-width: 140px;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Search and Filter Section
const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 0;
  position: relative;
  
  input {
    width: 100%;
    padding: 0.625rem 0.75rem 0.625rem 2.5rem;
    border: 1px solid ${Colors.border};
    border-radius: 0.75rem;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    background: ${Colors.cardBg};
    color: ${Colors.textPrimary};
    
    &:focus {
      outline: none;
      border-color: ${Colors.primary};
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    
    &::placeholder {
      color: ${Colors.textLight};
    }
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${Colors.textLight};
    size: 16px;
  }
`;

const FilterSelect = styled.select`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${Colors.border};
  border-radius: 0.75rem;
  background: ${Colors.cardBg};
  color: ${Colors.textPrimary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

// Visitors Grid
const VisitorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

// Visitor Card
const VisitorCard = styled.div`
  background: ${Colors.cardBg};
  border: 1px solid ${Colors.border};
  border-radius: 1rem;
  padding: 1.25rem;
  position: relative;
  transition: all 0.3s ease;
  animation: ${slideIn} 0.3s ease-out;
  
  &:hover {
    border-color: ${Colors.primaryLight};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const VisitorAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, ${props =>
    props.relationshipType === 'family' ? Colors.accentPurple :
      props.relationshipType === 'friend' ? Colors.success :
        Colors.primary
  } 0%, ${props =>
    props.relationshipType === 'family' ? '#A78BFA' :
      props.relationshipType === 'friend' ? '#38BDF8' :
        Colors.primaryLight
  } 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const VisitorInfo = styled.div`
  flex: 1;
  margin-left: 0.75rem;
  
  h4 {
    font-size: 1rem;
    font-weight: 700;
    color: ${Colors.textPrimary};
    margin: 0 0 0.25rem 0;
    line-height: 1.3;
  }
  
  .relationship {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    background: ${Colors.borderLight};
    color: ${Colors.textSecondary};
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.75rem;
  }
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.textLight};
  padding: 0.375rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${Colors.danger};
    background: rgba(239, 68, 68, 0.08);
  }
`;

const CardContent = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.25rem 0;
  
  svg {
    color: ${Colors.primary};
    flex-shrink: 0;
    size: 14px;
    margin-top: 0.125rem;
  }
  
  span {
    color: ${Colors.textSecondary};
    font-size: 0.8rem;
    line-height: 1.4;
    
    strong {
      color: ${Colors.textPrimary};
      font-weight: 500;
    }
  }
`;

const DateBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: ${Colors.background};
  color: ${Colors.textSecondary};
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid ${Colors.border};
  
  svg {
    color: ${Colors.textLight};
  }
`;

// Empty State
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${Colors.textSecondary};
  animation: ${fadeIn} 0.4s ease-out;
  
  .empty-icon {
    width: 3.5rem;
    height: 3.5rem;
    background: linear-gradient(135deg, ${Colors.borderLight} 0%, #F1F5F9 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: ${Colors.textLight};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  h3 {
    color: ${Colors.textPrimary};
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.5;
  }
`;

// Optional Note
const OptionalNote = styled.div`
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 1.5rem 0;
  font-size: 0.875rem;
  color: ${Colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${Colors.accentPurple};
    flex-shrink: 0;
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: ${Colors.cardBg};
  border-radius: 1rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out;

  @media (max-width: 640px) {
    padding: 1.25rem;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: ${Colors.textPrimary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.textLight};
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${Colors.border};
    color: ${Colors.textPrimary};
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${Colors.textPrimary};
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  .optional {
    color: ${Colors.textLight};
    font-weight: normal;
    font-size: 0.75rem;
  }
`;

const Input = styled.input`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${Colors.border};
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: ${Colors.cardBg};
  color: ${Colors.textPrimary};
  
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  &::placeholder {
    color: ${Colors.textLight};
  }
`;

const TextArea = styled.textarea`
  padding: 0.625rem 0.75rem;
  border: 1px solid ${Colors.border};
  border-radius: 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
  background: ${Colors.cardBg};
  color: ${Colors.textPrimary};
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
  
  &::placeholder {
    color: ${Colors.textLight};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryLight} 100%);
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled.button`
  background: ${Colors.background};
  color: ${Colors.textSecondary};
  border: 1px solid ${Colors.border};
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 500;
  font-size: 0.875rem;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${Colors.border};
    color: ${Colors.textPrimary};
  }
`;

// Message Component
const Message = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  font-weight: 500;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${fadeIn} 0.3s ease-out;
  
  ${props => props.type === 'success' && `
    background: rgba(14, 165, 233, 0.1);
    color: ${Colors.success};
    border: 1px solid rgba(14, 165, 233, 0.2);
  `}
  
  ${props => props.type === 'error' && `
    background: rgba(239, 68, 68, 0.1);
    color: ${Colors.danger};
    border: 1px solid rgba(239, 68, 68, 0.2);
  `}
  
  ${props => props.type === 'info' && `
    background: rgba(79, 70, 229, 0.1);
    color: ${Colors.primary};
    border: 1px solid rgba(79, 70, 229, 0.2);
  `}
`;

// Modal Component
const AddVisitorModal = ({ show, onClose, onAddVisitor, isSubmitting }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    relationship: '',
    contact: '',
    reason_for_visit: '',
  });

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only submit if we have at least a name
    if (formData.full_name.trim()) {
      onAddVisitor(formData);
    }
  };

  useEffect(() => {
    if (!show) {
      setFormData({
        full_name: '',
        relationship: '',
        contact: '',
        reason_for_visit: '',
      });
    }
  }, [show]);

  if (!show) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3><UserPlus size={18} /> Add Visitor</h3>
          <CloseButton onClick={onClose}>
            <X size={16} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              Full Name
              <span className="optional">(required)</span>
            </Label>
            <Input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Visitor's full name"
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Relationship
              <span className="optional">(optional)</span>
            </Label>
            <Input
              type="text"
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              placeholder="e.g., Family, Friend, Colleague"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Contact
              <span className="optional">(optional)</span>
            </Label>
            <Input
              type="tel"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="Phone number"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Reason for Visit
              <span className="optional">(optional)</span>
            </Label>
            <TextArea
              name="reason_for_visit"
              value={formData.reason_for_visit}
              onChange={handleInputChange}
              placeholder="Reason for visit..."
            />
          </FormGroup>

          <div style={{
            padding: '0.75rem',
            background: Colors.background,
            borderRadius: '0.75rem',
            fontSize: '0.75rem',
            color: Colors.textSecondary,
            marginBottom: '0.5rem'
          }}>
            💡 Only name is required. Other fields are optional.
          </div>

          <ButtonGroup>
            <SecondaryButton type="button" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting || !formData.full_name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Adding...
                </>
              ) : (
                'Add Visitor'
              )}
            </PrimaryButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

// Main VisitorsSection Component
const VisitorsSection = ({ visitors = [], onAdd, onDelete, isLoading, error, apiResponse }) => {
  const { id, deceasedId, slug } = useParams();
  const currentDeceasedId = deceasedId || id;

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const hasVisitors = visitors && visitors.length > 0;

  // Calculate stats
  const totalVisitors = visitors.length;
  const familyVisitors = visitors.filter(v =>
    v.relationship && v.relationship.toLowerCase().includes('family')
  ).length;
  const friendVisitors = visitors.filter(v =>
    v.relationship && v.relationship.toLowerCase().includes('friend')
  ).length;

  // Filter visitors based on search and filter
  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.relationship && visitor.relationship.toLowerCase().includes(searchTerm.toLowerCase())) ||
      visitor.reason_for_visit.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'family') return matchesSearch && visitor.relationship && visitor.relationship.toLowerCase().includes('family');
    if (filter === 'friend') return matchesSearch && visitor.relationship && visitor.relationship.toLowerCase().includes('friend');

    return matchesSearch;
  });

  const handleAddVisitor = async (newVisitorData) => {
    if (!currentDeceasedId) {
      setMessage({
        type: 'error',
        text: 'Cannot add visitor: Missing deceased information.'
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await api.post(`/api/v2/restpoint/visitors/register-visitor`, {
        ...newVisitorData,
        deceased_id: currentDeceasedId,
        check_in_time: new Date().toISOString(),
        visitor_type: 'walk-in'
      }, {
        headers: { 'x-tenant-slug': slug || 'system_shared' }
      });

      if (response.data?.success) {
        setMessage({ type: 'success', text: '✅ Visitor added successfully' });
        setShowModal(false);
        if (onAdd) onAdd();
      } else {
        throw new Error(response.data?.message || 'Failed to add visitor');
      }
    } catch (error) {
      console.error('Error adding visitor:', error);
      setMessage({
        type: 'error',
        text: `❌ ${error.response?.data?.message || error.message || 'Failed to add visitor'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVisitor = async (visitorId) => {
    if (!window.confirm('Are you sure you want to delete this visitor?')) {
      return;
    }

    setMessage(null);
    try {
      const response = await api.delete(`/api/v2/restpoint/visitors/${visitorId}`, {
        headers: { 'x-tenant-slug': slug || 'system_shared' }
      });

      if (response.data?.success) {
        if (onDelete) onDelete();
        setMessage({ type: 'success', text: '✅ Visitor removed successfully' });
      } else {
        throw new Error(response.data?.message || 'Failed to delete visitor');
      }
    } catch (error) {
      console.error('Error deleting visitor:', error);
      setMessage({ type: 'error', text: `❌ ${error.response?.data?.message || 'Failed to delete visitor'}` });
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getRelationshipType = (relationship) => {
    if (!relationship) return 'other';
    if (relationship.toLowerCase().includes('family')) return 'family';
    if (relationship.toLowerCase().includes('friend')) return 'friend';
    return 'other';
  };

  return (
    <VisitorsContainer>
      {/* Header */}
      <HeaderSection>
        <TitleSection>
          <IconWrapper>
            <Users size={18} />
          </IconWrapper>
          <TitleContent>
            <h2>Visitors</h2>
            <p>Manage visitor records for this deceased</p>
          </TitleContent>
        </TitleSection>

        <ActionButton
          onClick={() => setShowModal(true)}
          disabled={!currentDeceasedId || isLoading}
        >
          <UserPlus size={14} /> Add Visitor
        </ActionButton>
      </HeaderSection>

      {/* Optional Note */}
      <OptionalNote>
        <Info size={14} />
        <span>Visitors are optional. You can add them if available, or proceed without.</span>
      </OptionalNote>

      {/* Stats Cards */}
      {hasVisitors && (
        <StatsContainer>
          <StatCard>
            <div className="stat-icon" style={{ background: Colors.primary }}>
              <UserCheck size={16} />
            </div>
            <div className="stat-content">
              <p className="stat-value">{totalVisitors}</p>
              <p className="stat-label">Total Visitors</p>
            </div>
          </StatCard>

          <StatCard>
            <div className="stat-icon" style={{ background: Colors.accentPurple }}>
              <Users size={16} />
            </div>
            <div className="stat-content">
              <p className="stat-value">{familyVisitors}</p>
              <p className="stat-label">Family</p>
            </div>
          </StatCard>

          <StatCard>
            <div className="stat-icon" style={{ background: Colors.success }}>
              <User size={16} />
            </div>
            <div className="stat-content">
              <p className="stat-value">{friendVisitors}</p>
              <p className="stat-label">Friends</p>
            </div>
          </StatCard>
        </StatsContainer>
      )}

      {/* Message Display */}
      {message && (
        <Message type={message.type}>
          {message.text}
        </Message>
      )}

      {/* Search and Filter */}
      {hasVisitors && (
        <SearchSection>
          <SearchInput>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search visitors by name or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Visitors</option>
            <option value="family">Family Only</option>
            <option value="friend">Friends Only</option>
          </FilterSelect>
        </SearchSection>
      )}

      {/* Loading State */}
      {isLoading && (
        <EmptyState>
          <Loader2 size={24} style={{
            animation: 'spin 1s linear infinite',
            color: Colors.primary,
            margin: '0 auto 1rem'
          }} />
          <p>Loading visitors...</p>
        </EmptyState>
      )}

      {/* Visitors Grid */}
      {!isLoading && hasVisitors ? (
        <VisitorsGrid>
          {filteredVisitors.map((visitor) => {
            const { date, time } = formatTime(visitor.check_in_time);
            const relationshipType = getRelationshipType(visitor.relationship);

            return (
              <VisitorCard key={visitor.visitor_id || visitor.id}>
                <CardHeader>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <VisitorAvatar relationshipType={relationshipType}>
                      {getInitials(visitor.full_name)}
                    </VisitorAvatar>
                    <VisitorInfo>
                      <h4>{visitor.full_name}</h4>
                      <div className="relationship">
                        {visitor.relationship || 'Visitor'}
                      </div>
                    </VisitorInfo>
                  </div>
                  <DeleteButton onClick={() => handleDeleteVisitor(visitor.visitor_id || visitor.id)}>
                    <Trash2 size={14} />
                  </DeleteButton>
                </CardHeader>

                <CardContent>
                  {visitor.contact && (
                    <InfoRow>
                      <Phone size={14} />
                      <span><strong>Contact:</strong> {visitor.contact}</span>
                    </InfoRow>
                  )}

                  {visitor.reason_for_visit && (
                    <InfoRow>
                      <BookText size={14} />
                      <span><strong>Reason:</strong> {visitor.reason_for_visit}</span>
                    </InfoRow>
                  )}

                  <InfoRow>
                    <User size={14} />
                    <span><strong>Type:</strong> {visitor.visitor_type || 'Walk-in'}</span>
                  </InfoRow>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <DateBadge>
                      <Calendar size={12} /> {date}
                    </DateBadge>
                    <DateBadge>
                      <Clock size={12} /> {time}
                    </DateBadge>
                  </div>
                </CardContent>
              </VisitorCard>
            );
          })}
        </VisitorsGrid>
      ) : !isLoading && (
        <EmptyState>
          <div className="empty-icon">
            <Eye size={20} />
          </div>
          <h3>No Visitors Yet</h3>
          <p>Visitors are optional. Add them if available, or you can proceed without.</p>
          <ActionButton
            onClick={() => setShowModal(true)}
            disabled={!currentDeceasedId}
            style={{ margin: '0 auto' }}
          >
            <UserPlus size={14} /> Add First Visitor
          </ActionButton>
        </EmptyState>
      )}

      {/* Add Visitor Modal */}
      <AddVisitorModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onAddVisitor={handleAddVisitor}
        isSubmitting={isSubmitting}
      />
    </VisitorsContainer>
  );
};

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default VisitorsSection;