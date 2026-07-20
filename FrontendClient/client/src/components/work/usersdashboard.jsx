import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Users, UserPlus, UserMinus, KeyRound, Calendar, Search, Filter, MoreVertical, Edit, Trash2, Eye, LogOut, Shield, Briefcase, Building2, Mail, Phone, Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, UserCheck, Crown, Server, HardDrive, X, AlertTriangle, Settings, RefreshCw, Menu } from '../../utils/icons/icons';
import Swal from "sweetalert2";

// External Components
const ExternalLoader = lazy(() => import('../loader/loader'));

// --- Centralized Theme & Services ---
import Colors from "../../styles/theme/colors";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`;

// --- Sound Notification System ---
class SoundManager {
  constructor() {
    this.beepSound = new Audio('/audio/beep.mp3');
    this.isEnabled = true;
  }

  async playWarning() {
    if (!this.isEnabled) return;

    try {
      await this.beepSound.play();
    } catch (error) {
      console.log('Sound play failed:', error);
    }
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

const soundManager = new SoundManager();

// --- Token Management with Refresh ---
// Token management and Axios interceptors have been centralized in src/api/client.js

// --- Styled Components ---
const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${Colors.background};
  padding: 5px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ManagementContainer = styled.div`
  max-width: 1800px;
  margin: 0 auto;
  background: ${Colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    border-radius: 0;
    box-shadow: none;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 100%);
  color: white;
  padding: 30px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const HeaderTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 24px 0;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
`;

const HeaderStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  padding: 18px;
  border-radius: 10px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 15px 10px;
  }
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  color: white;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ControlsBar = styled.div`
  background: ${Colors.background};
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  border-bottom: 1px solid ${Colors.border};
  
  @media (max-width: 768px) {
    padding: 15px;
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: 100%;
    order: 2;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 1px solid ${Colors.border};
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: ${Colors.surface};
  color: ${Colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${Colors.accent};
    box-shadow: 0 0 0 3px ${Colors.accent}15;
  }
  
  @media (max-width: 768px) {
    padding: 12px 15px 12px 40px;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${Colors.textMuted};
  
  @media (max-width: 768px) {
    left: 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    order: 1;
    justify-content: space-between;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  ${props => props.primary && `
    background: ${Colors.accent};
    color: ${Colors.surface};
    
    &:hover {
      background: ${Colors.accentDark};
      transform: translateY(-2px);
    }
  `}

  ${props => props.secondary && `
    background: ${Colors.background};
    color: ${Colors.textPrimary};
    border: 1px solid ${Colors.border};
    
    &:hover {
      background: ${Colors.surface};
      border-color: ${Colors.accent};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 0.85rem;
    flex: 1;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${Colors.border};
  background: ${Colors.surface};
  color: ${Colors.textPrimary};
  font-size: 0.9rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${Colors.accent};
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 0.85rem;
    flex: 1;
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

// Table Styles
const TableContainer = styled.div`
  padding: 0;
  overflow-x: auto;
  
  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${Colors.surface};
  
  @media (max-width: 768px) {
    min-width: 800px;
  }
`;

const TableHeader = styled.thead`
  background: ${Colors.background};
  border-bottom: 2px solid ${Colors.border};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableHeaderCell = styled.th`
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: ${Colors.textPrimary};
  font-size: 0.9rem;
  white-space: nowrap;
  
  &:first-child {
    padding-left: 30px;
  }
  
  &:last-child {
    padding-right: 30px;
  }
  
  @media (max-width: 768px) {
    padding: 8px 10px;
    
    &:first-child {
      padding-left: 15px;
    }
    
    &:last-child {
      padding-right: 15px;
    }
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${Colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${Colors.background};
  }
  
  ${props => props.isInactive && `
    background: ${Colors.error}08;
    
    &:hover {
      background: ${Colors.error}12;
    }
  `}
  
  @media (max-width: 768px) {
    display: block;
    margin-bottom: 15px;
    border: 1px solid ${Colors.border};
    border-radius: 8px;
    padding: 15px;
    
    &:hover {
      background: ${Colors.surface};
    }
  }
`;

const TableCell = styled.td`
  padding: 16px 12px;
  font-size: 0.9rem;
  color: ${Colors.textSecondary};
  
  &:first-child {
    padding-left: 30px;
  }
  
  &:last-child {
    padding-right: 30px;
  }
  
  @media (max-width: 768px) {
    display: block;
    padding: 8px 0;
    border: none;
    
    &:first-child {
      padding-left: 0;
    }
    
    &:last-child {
      padding-right: 0;
    }
    
    &:before {
      content: attr(data-label);
      font-weight: 600;
      color: ${Colors.textPrimary};
      display: inline-block;
      width: 120px;
      margin-right: 10px;
    }
  }
`;

// Enhanced Status Badge
const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid;
  
  ${props => props.active && `
    background: ${Colors.success}15;
    color: ${Colors.success};
    border-color: ${Colors.success}30;
  `}
  
  ${props => props.inactive && `
    background: ${Colors.error}15;
    color: ${Colors.error};
    border-color: ${Colors.error}30;
  `}
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
`;

// Role Badge with special styling for administrators
const RoleBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.role) {
      case 'system-administrator':
      case 'database-administrator':
        return `
          background: linear-gradient(135deg, ${Colors.warning}15, ${Colors.error}15);
          color: ${Colors.warning};
          border: 1px solid ${Colors.warning}30;
        `;
      case 'admin':
      case 'it-administrator':
        return `
          background: ${Colors.info}15;
          color: ${Colors.info};
          border: 1px solid ${Colors.info}30;
        `;
      default:
        return `
          background: ${Colors.accent}15;
          color: ${Colors.accent};
          border: 1px solid ${Colors.accent}30;
        `;
    }
  }}
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
`;

const ActionButtonsCell = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    justify-content: space-between;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid ${Colors.border};
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${Colors.border};
  border-radius: 6px;
  background: ${Colors.surface};
  color: ${Colors.textSecondary};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    
    ${props => props.variant === 'status' && `
      background: ${props.active ? Colors.error : Colors.success};
      color: ${Colors.surface};
      border-color: ${props.active ? Colors.error : Colors.success};
    `}
    
    ${props => props.variant === 'password' && `
      background: ${Colors.warning};
      color: ${Colors.surface};
      border-color: ${Colors.warning};
    `}
    
    ${props => props.variant === 'delete' && `
      background: ${Colors.error};
      color: ${Colors.surface};
      border-color: ${Colors.error};
    `}
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    padding: 10px;
    font-size: 0.75rem;
  }
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${Colors.textSecondary};

  svg {
    margin-bottom: 20px;
    opacity: 0.5;
  }

  h3 {
    color: ${Colors.textPrimary};
    margin-bottom: 8px;
  }
`;

// Enhanced Registration Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
    align-items: flex-start;
    overflow-y: auto;
  }
`;

const ModalContent = styled.div`
  background: ${Colors.surface};
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 800px;
  max-height: 95vh;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid ${Colors.border};
  
  @media (max-width: 768px) {
    padding: 20px;
    max-height: 90vh;
    margin-top: 20px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid ${Colors.background};
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding-bottom: 15px;
  }
`;

const ModalTitle = styled.h2`
  color: ${Colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.8rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    gap: 8px;
  }
`;

const CloseButton = styled.button`
  background: ${Colors.background};
  border: none;
  color: ${Colors.textMuted};
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${Colors.error}15;
    color: ${Colors.error};
  }
  
  @media (max-width: 768px) {
    padding: 8px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${Colors.textPrimary};
  font-size: 0.95rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${Colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: ${Colors.surface};
  color: ${Colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${Colors.accent};
    box-shadow: 0 0 0 3px ${Colors.accent}15;
  }

  ${props => props.error && `
    border-color: ${Colors.error};
  `}
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    font-size: 0.95rem;
  }
`;

const ErrorText = styled.div`
  color: ${Colors.error};
  font-size: 0.85rem;
  margin-top: 6px;
  font-weight: 500;
`;

const FormActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px solid ${Colors.background};
  
  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 30px;
    padding-top: 20px;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  background: ${Colors.success};
  color: ${Colors.surface};
  
  &:hover:not(:disabled) {
    background: #219653;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: 1px solid ${Colors.border};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  background: ${Colors.surface};
  color: ${Colors.textPrimary};
  
  &:hover {
    background: ${Colors.background};
    border-color: ${Colors.textMuted};
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
    order: -1;
  }
`;

// Mobile Menu Component
const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: ${Colors.surface};
    border-bottom: 1px solid ${Colors.border};
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.textPrimary};
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${Colors.background};
  }
`;

// Mobile Filters Component
const MobileFilters = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    background: ${Colors.background};
    border-bottom: 1px solid ${Colors.border};
  }
`;

// Format last login time
const formatLastLogin = (timestamp) => {
  if (!timestamp) return "Never logged in";

  const now = new Date();
  const loginTime = new Date(timestamp);
  const diffDays = Math.floor((now - loginTime) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};

// Get role icon
const getRoleIcon = (role) => {
  switch (role) {
    case 'system-administrator':
    case 'database-administrator':
      return <Crown size={14} />;
    case 'admin':
    case 'it-administrator':
      return <Server size={14} />;
    default:
      return <Briefcase size={14} />;
  }
};

// Enhanced Registration Form Component
const RegistrationForm = ({ isOpen, onClose, onUserRegistered }) => {
  const initialValues = {
    name: '',
    username: '',
    email: '',
    password: '',
    role: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Full name is required'),
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    role: Yup.string().required('Role is required')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const registrationData = {
        ...values,
        branch_id: 1 // Always use branch ID 1
      };

      const data = await userService.registerUser(registrationData);

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'User Registered',
          text: `${values.name} has been registered successfully!`,
          timer: 3000,
          showConfirmButton: false
        });

        resetForm();
        onClose();
        if (onUserRegistered) {
          onUserRegistered();
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: message,
        timer: 4000
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <UserPlus size={32} />
            Register New User
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, handleChange, handleBlur, values }) => (
            <Form>
              <FormGrid>
                <FormGroup>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && errors.name}
                  />
                  {touched.name && errors.name && (
                    <ErrorText>{errors.name}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username && errors.username}
                  />
                  {touched.username && errors.username && (
                    <ErrorText>{errors.username}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter email address"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && errors.email}
                  />
                  {touched.email && errors.email && (
                    <ErrorText>{errors.email}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter password (min 6 characters)"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && errors.password}
                  />
                  {touched.password && errors.password && (
                    <ErrorText>{errors.password}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    type="text"
                    id="role"
                    name="role"
                    placeholder="e.g., manager, staff, cashier, assistant, etc."
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.role && errors.role}
                  />
                  {touched.role && errors.role && (
                    <ErrorText>{errors.role}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    type="text"
                    id="branch"
                    name="branch"
                    value="Main Branch (ID: 1)"
                    disabled
                    style={{ background: Colors.background, color: Colors.textMuted }}
                  />
                  <div style={{ fontSize: '0.85rem', color: Colors.textMuted, marginTop: '4px' }}>
                    Branch ID 1 will be automatically assigned
                  </div>
                </FormGroup>
              </FormGrid>

              <FormActions>
                <CancelButton type="button" onClick={onClose}>
                  <X size={18} />
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="spinner" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Register User
                    </>
                  )}
                </SubmitButton>
              </FormActions>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </ModalOverlay>
  );
};

// Enhanced User Management Component
const UsersDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  // Enhanced fetch users with error handling
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();

      if (data.success) {
        const filteredData = data.data.filter(user =>
          user.role !== 'database-administrator'
        ).map(user => ({
          ...user,
          lastLogin: formatLastLogin(user.last_login),
          status: user.is_active ? "active" : "inactive"
        }));

        setUsers(filteredData);
        setFilteredUsers(filteredData);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: 'Failed to fetch users data',
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search and filter users
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (activeFilter === "active") {
      filtered = filtered.filter(user => user.is_active);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter(user => !user.is_active);
    } else if (activeFilter === "admin") {
      filtered = filtered.filter(user =>
        ['system-administrator', 'admin', 'it-administrator'].includes(user.role)
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, activeFilter, users]);

  // Enhanced status toggle with SweetAlert confirmation and sound
  const handleToggleStatus = async (user) => {
    await soundManager.playWarning();

    // Protect IT Administrators from deactivation
    if (user.role === 'it-administrator' && user.is_active) {
      Swal.fire({
        icon: 'error',
        title: 'Action Denied',
        text: 'Cannot deactivate IT Administrators',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    const newStatus = !user.is_active;
    const action = newStatus ? 'activate' : 'deactivate';

    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${action} ${user.name}. This will ${newStatus ? 'grant' : 'revoke'} their system access.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? Colors.success : Colors.error,
      cancelButtonColor: Colors.textMuted,
      confirmButtonText: `Yes, ${action} user!`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const data = await userService.updateUserStatus(user.id, newStatus);

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Status Updated',
            text: `${user.name} has been ${action}d successfully`,
            timer: 3000,
            showConfirmButton: false
          });
          fetchUsers();
        }
      } catch (error) {
        const message = error.response?.data?.message || "Status update failed";
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: message,
          timer: 4000
        });
      }
    }
  };

  // Enhanced delete with SweetAlert confirmation and sound
  const handleDeleteUser = async (user) => {
    await soundManager.playWarning();

    // Protect IT Administrators from deletion
    if (user.role === 'it-administrator') {
      Swal.fire({
        icon: 'error',
        title: 'Action Denied',
        text: 'Cannot delete IT Administrators',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    if (user.id === currentUser?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Action Denied',
        text: 'Cannot delete your own account',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to permanently delete ${user.name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: Colors.error,
      cancelButtonColor: Colors.textMuted,
      confirmButtonText: 'Yes, delete user!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const data = await userService.deleteUser(user.id);

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'User Deleted',
            text: `${user.name} has been deleted successfully`,
            timer: 3000,
            showConfirmButton: false
          });
          fetchUsers();
        }
      } catch (error) {
        const message = error.response?.data?.message || "Deletion failed";
        Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: message,
          timer: 4000
        });
      }
    }
  };

  // Enhanced password change with SweetAlert
  const handleChangePassword = async (user) => {
    await soundManager.playWarning();

    // Protect IT Administrators from password changes
    if (user.role === 'it-administrator') {
      Swal.fire({
        icon: 'error',
        title: 'Action Denied',
        text: 'Cannot change IT Administrator passwords',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    const { value: newPassword } = await Swal.fire({
      title: `Change Password for ${user.name}`,
      input: 'password',
      inputLabel: 'New Password',
      inputPlaceholder: 'Enter new password (min 6 characters)',
      inputAttributes: {
        minlength: 6,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Update Password',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value || value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
      }
    });

    if (newPassword) {
      try {
        const data = await userService.updateUserPassword(user.id, newPassword);

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Password Updated',
            text: `Password for ${user.name} has been changed successfully`,
            timer: 3000,
            showConfirmButton: false
          });
        }
      } catch (error) {
        const message = error.response?.data?.message || "Password change failed";
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: message,
          timer: 4000
        });
      }
    }
  };

  // Check if action is allowed - Only protect IT Administrators
  const isActionAllowed = (user, action) => {
    // Only protect IT Administrators
    if (user.role === 'it-administrator') {
      if (action === 'delete') return false;
      if (action === 'deactivate') return false;
      if (action === 'password') return false;
    }

    if (user.id === currentUser?.id && action === 'delete') return false;

    return true;
  };

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(w => w.is_active).length,
    inactive: users.filter(w => !w.is_active).length,
    admins: users.filter(w =>
      ['system-administrator', 'admin', 'it-administrator'].includes(w.role)
    ).length
  };

  if (loading) {
    return (
      <PageWrapper>
        <ManagementContainer>
          <Suspense fallback={<div>Loading...</div>}>
            <ExternalLoader />
          </Suspense>
        </ManagementContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <ManagementContainer>
        {/* Mobile Menu */}
        <MobileMenu>
          <HeaderTitle>
            <Users size={24} />
            User Management
          </HeaderTitle>
          <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={20} />
          </MobileMenuButton>
        </MobileMenu>

        {/* Mobile Filters */}
        <MobileFilters isOpen={isMobileMenuOpen}>
          <Select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="admin">Administrators</option>
          </Select>
          <Button secondary onClick={fetchUsers}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </MobileFilters>

        {/* Header */}
        <Header>
          <HeaderContent>
            <HeaderTitle>
              <Users size={36} />
              User Management System
            </HeaderTitle>
            <HeaderSubtitle>
              Comprehensive user administration and access control
            </HeaderSubtitle>

            <HeaderStats>
              <StatCard>
                <StatNumber>{stats.total}</StatNumber>
                <StatLabel>Total Users</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.active}</StatNumber>
                <StatLabel>Active Users</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.inactive}</StatNumber>
                <StatLabel>Inactive</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{stats.admins}</StatNumber>
                <StatLabel>Administrators</StatLabel>
              </StatCard>
            </HeaderStats>
          </HeaderContent>
        </Header>

        {/* Controls */}
        <ControlsBar>
          <SearchContainer>
            <SearchIcon size={18} />
            <SearchInput
              type="text"
              placeholder="Search users by name, username, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <ActionButtons>
            <Select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }}
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="admin">Administrators</option>
            </Select>

            <Button secondary onClick={fetchUsers} style={{ display: window.innerWidth <= 768 ? 'none' : 'flex' }}>
              <RefreshCw size={16} />
              Refresh
            </Button>

            {/* Registration Button */}
            <Button primary onClick={() => setShowRegistration(true)}>
              <UserPlus size={16} />
              Register New User
            </Button>
          </ActionButtons>
        </ControlsBar>

        {/* Users Table */}
        <TableContainer>
          {filteredUsers.length === 0 ? (
            <EmptyState>
              <Users size={48} />
              <h3>No users found</h3>
              <p>Try adjusting your search criteria or check your filters.</p>
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>User</TableHeaderCell>
                  <TableHeaderCell>Role</TableHeaderCell>
                  <TableHeaderCell>Email</TableHeaderCell>
                  <TableHeaderCell>Branch</TableHeaderCell>
                  <TableHeaderCell>Last Login</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </tr>
              </TableHeader>
              <tbody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} isInactive={!user.is_active}>
                    <TableCell data-label="User">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${Colors.accent}, ${Colors.info})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: Colors.surface,
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: Colors.textPrimary }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: Colors.textMuted }}>
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-label="Role">
                      <RoleBadge role={user.role}>
                        {getRoleIcon(user.role)}
                        {user.role.replace('-', ' ')}
                      </RoleBadge>
                    </TableCell>
                    <TableCell data-label="Email">
                      {user.email || "—"}
                    </TableCell>
                    <TableCell data-label="Branch">
                      {user.branch_name || "Main"}
                    </TableCell>
                    <TableCell data-label="Last Login">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell data-label="Status">
                      <StatusBadge active={user.is_active} inactive={!user.is_active}>
                        {user.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {user.is_active ? "Active" : "Inactive"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell data-label="Actions">
                      <ActionButtonsCell>
                        <IconButton
                          variant="status"
                          active={user.is_active}
                          onClick={() => handleToggleStatus(user)}
                          disabled={!isActionAllowed(user, 'deactivate')}
                          title={!isActionAllowed(user, 'deactivate') ?
                            "Cannot modify IT Administrators" :
                            user.is_active ? "Deactivate user" : "Activate user"}
                        >
                          <UserCheck size={12} />
                          {user.is_active ? "Deactivate" : "Activate"}
                        </IconButton>

                        <IconButton
                          variant="password"
                          onClick={() => handleChangePassword(user)}
                          disabled={!isActionAllowed(user, 'password')}
                          title={!isActionAllowed(user, 'password') ?
                            "Cannot change IT Administrator passwords" :
                            "Change password"}
                        >
                          <Key size={12} />
                          Password
                        </IconButton>

                        <IconButton
                          variant="delete"
                          onClick={() => handleDeleteUser(user)}
                          disabled={!isActionAllowed(user, 'delete')}
                          title={!isActionAllowed(user, 'delete') ?
                            "Cannot delete this user" :
                            "Delete user"}
                        >
                          <Trash2 size={12} />
                          Delete
                        </IconButton>
                      </ActionButtonsCell>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </TableContainer>
      </ManagementContainer>

      {/* Enhanced Registration Modal */}
      <RegistrationForm
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onUserRegistered={fetchUsers}
      />
    </PageWrapper>
  );
};

export default UsersDashboard;