import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import styled, { keyframes, css } from 'styled-components';
import {
  Shield,
  Users,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Clock,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader as LoaderIcon
} from 'lucide-react';

// Modern Color Palette
const Colors = {
  primary: '#2C3E50',
  primaryLight: '#34495E',
  secondary: '#000000ff',
  accent: '#0ee945ff',
  white: '#FFFFFF',
  lightGray: '#F8F9FA',
  mediumGray: '#E9ECEF',
  darkGray: '#495057',
  cardBg: 'rgba(255, 255, 255, 0.98)',
  glassEffect: 'rgba(255, 255, 255, 0.25)',
  danger: '#DC3545',
  success: '#28A745',
  info: '#17A2B8',
  warning: '#FFC107',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  textPrimary: '#2D3748',
  textSecondary: '#718096'
};

// Enhanced Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const slideInFromLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
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

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(120deg);
  }
  66% {
    transform: translateY(5px) rotate(240deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-15px);
  }
  70% {
    transform: translateY(-7px);
  }
`;

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  align-items: center;
  justify-content: center;
  padding: 0px 0px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 50%, ${Colors.gradientEnd} 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    animation: ${float} 20s ease-in-out infinite;
  }
`;

const FloatingShapes = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;

  div {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: ${float} 15s infinite linear;
    
    &:nth-child(1) {
      width: 80px;
      height: 80px;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }
    
    &:nth-child(2) {
      width: 120px;
      height: 120px;
      top: 70%;
      left: 80%;
      animation-delay: -5s;
    }
    
    &:nth-child(3) {
      width: 60px;
      height: 60px;
      top: 20%;
      left: 85%;
      animation-delay: -10s;
    }
    
    &:nth-child(4) {
      width: 100px;
      height: 100px;
      top: 80%;
      left: 15%;
      animation-delay: -7s;
    }
  }
`;

const LoginCard = styled.div`
  background: ${Colors.cardBg};
  backdrop-filter: blur(40px);
  border-radius: 0px;
  box-shadow: 
    0 35px 70px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  overflow: hidden;
  animation: ${fadeIn} 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 0px solid ${Colors.glassEffect};
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  z-index: 10;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
`;

const LoginLeftPanel = styled.div`
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 100%);
  padding: 4rem 3rem;
  color: ${Colors.white};
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${slideInFromLeft} 1s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
    animation: ${shimmer} 3s ease-in-out infinite;
  }

  @media (max-width: 968px) {
    padding: 3rem 2rem;
    min-height: 300px;
  }
`;

const LoginRightPanel = styled.div`
  padding: 1rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  animation: ${slideInFromRight} 1s ease-out;

  @media (max-width: 968px) {
    padding: 3rem 2rem;
  }
`;

const LoginLogo = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  svg {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    animation: ${bounce} 2s infinite;
  }
`;

const LoginSubtitle = styled.p`
  font-size: 1.3rem;
  margin: 0 0 2rem 0;
  opacity: 0.95;
  font-weight: 400;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0 0 0;
  
  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    font-weight: 500;
    
    svg {
      width: 24px;
      height: 24px;
      color: ${Colors.accent};
      flex-shrink: 0;
    }
  }
`;

const TimeDisplay = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 20px;
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  align-self: flex-start;

  svg {
    animation: ${spin} 60s linear infinite;
  }
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const WelcomeTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 800;
  color: ${Colors.textPrimary};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const WelcomeText = styled.p`
  color: ${Colors.textSecondary};
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.6;
  font-weight: 500;
`;

const FormGroup = styled.div`
  position: relative;
  margin-bottom: 0.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${Colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  ${props => props.$hasError && css`
    animation: ${pulse} 0.5s ease;
  `}
`;

const FormInput = styled.input`
  width: 100%;
  padding: 1.25rem 1.25rem 1.25rem 3.5rem;
  border: 2px solid ${props => props.$hasError ? Colors.danger : Colors.mediumGray};
  border-radius: 16px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  background: ${Colors.lightGray};
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? Colors.danger : Colors.secondary};
    box-shadow: 0 0 0 4px ${props => props.$hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 184, 148, 0.1)'};
    background: ${Colors.white};
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: ${Colors.darkGray};
    font-weight: 400;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.$hasError ? Colors.danger : Colors.darkGray};
  z-index: 2;
  transition: all 0.3s ease;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${Colors.darkGray};
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${Colors.primary};
    background: rgba(99, 102, 241, 0.1);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 1.375rem;
  background: linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryLight} 100%);
  color: ${Colors.white};
  border: none;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(44, 62, 80, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 15px 35px rgba(44, 62, 80, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    animation: ${pulse} 0.5s ease;
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 15px rgba(44, 62, 80, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.7s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const Loader = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: ${Colors.white};
  animation: ${spin} 0.8s ease infinite;
`;

const Message = styled.div`
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 6px solid;
  animation: ${fadeIn} 0.5s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  ${props => props.type === 'error' && css`
    background: rgba(239, 68, 68, 0.1);
    color: ${Colors.danger};
    border-left-color: ${Colors.danger};
  `}
  
  ${props => props.type === 'success' && css`
    background: rgba(16, 185, 129, 0.1);
    color: ${Colors.success};
    border-left-color: ${Colors.success};
  `}
  
  ${props => props.type === 'info' && css`
    background: rgba(59, 130, 246, 0.1);
    color: ${Colors.info};
    border-left-color: ${Colors.info};
  `}
  
  ${props => props.type === 'warning' && css`
    background: rgba(245, 158, 11, 0.1);
    color: ${Colors.warning};
    border-left-color: ${Colors.warning};
  `}
`;

// Authentication Popup Modal
const AuthPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const PopupContent = styled.div`
  background: ${Colors.white};
  padding: 3rem;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease;
  max-width: 400px;
  width: 90%;
`;

const PopupIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.success ?
    'rgba(16, 185, 129, 0.1)' :
    'rgba(59, 130, 246, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    width: 40px;
    height: 40px;
    color: ${props => props.success ? Colors.success : Colors.info};
    animation: ${bounce} 1s ease;
  }
`;

const PopupTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${Colors.textPrimary};
  margin: 0 0 1rem 0;
`;

const PopupMessage = styled.p`
  color: ${Colors.textSecondary};
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
`;

// Enhanced Login Component 
function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentTime, setCurrentTime] = useState('');
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authPopupData, setAuthPopupData] = useState({ success: false, message: '' });
  const navigate = useNavigate();

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setCurrentTime(`${dateString} • ${timeString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clear any stale auth data on mount (fixes stuck login state)
  useEffect(() => {
    // Clear any invalid tokens on login page load
    const token = localStorage.getItem('authToken');
    if (token === 'undefined' || token === 'null') {
      localStorage.clear();
    }
  }, []);

  // Set cookie function
  const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (!identifier.trim() || !password.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter both email/username and password'
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting login...');
      
      const data = await authApi.login({
        email: identifier.trim(),  // Use 'email' instead of 'identifier'
        password: password.trim()
      });
      
      console.log('📦 Login response:', data);

      if (data && data.success) {
        // Store token - use the correct key from API response
        const token = data.token || data.accessToken;
        
        if (!token) {
          throw new Error('No token received from server');
        }
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTime', new Date().toISOString());

        // Store token in cookie
        setCookie('authToken', token, 7);
        if (data.user?.role) setCookie('userRole', data.user.role, 7);

        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting to dashboard...'
        });

        // Show success popup
        setAuthPopupData({ success: true, message: 'Authentication successful! Redirecting to dashboard...' });
        setShowAuthPopup(true);

        // Redirect after delay
        setTimeout(() => {
          setShowAuthPopup(false);
          navigate('/dashboard');
        }, 1500);

      } else {
        setMessage({
          type: 'error',
          text: data?.message || 'Login failed. Please check your credentials.'
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Unable to connect to server. Please check your connection.'
      });
      setIsLoading(false);
    }
  };

  const hasError = message.type === 'error';

  return (
    <>
      <LoginContainer>
        <FloatingShapes>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </FloatingShapes>

        <LoginCard>
          <LoginLeftPanel>
            <LoginLogo>
              <Shield size={40} />
              RP MMS
            </LoginLogo>
            <LoginSubtitle>
              Secure Access Portal for Mortuary Management Software (MMS)
            </LoginSubtitle>

            <FeatureList>
              <li>
                <CheckCircle size={20} />
                Secure & Encrypted Data Storage
              </li>
              <li>
                <CheckCircle size={20} />
                Real-time Monitoring & Alerts
              </li>
              <li>
                <CheckCircle size={20} />
                Advanced Analytics & Dashboards
              </li>
              <li>
                <CheckCircle size={20} />
                24/7 System uptime!
              </li>
            </FeatureList>

            {currentTime && (
              <TimeDisplay>
                <Clock size={20} />
                {currentTime}
              </TimeDisplay>
            )}
          </LoginLeftPanel>

          <LoginRightPanel>
            <LoginForm onSubmit={handleLogin}>
              <WelcomeSection>
                <WelcomeTitle>
                  <Users size={32} />
                  Welcome Back!
                </WelcomeTitle>
                <WelcomeText>
                  Welcome back! Let's get things in order.
                </WelcomeText>
              </WelcomeSection>

              {message.text && (
                <Message type={message.type}>
                  {message.type === 'success' ?
                    <CheckCircle size={24} /> :
                    <AlertCircle size={24} />
                  }
                  {message.text}
                </Message>
              )}

              <FormGroup>
                <FormLabel>
                  <Mail size={20} />
                  Email Address
                </FormLabel>
                <InputWrapper $hasError={hasError && !identifier}>
                  <IconWrapper $hasError={hasError && !identifier}>
                    <User size={22} />
                  </IconWrapper>
                  <FormInput
                    type="email"
                    placeholder="Enter your email address"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={isLoading}
                    $hasError={hasError && !identifier}
                  />
                </InputWrapper>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  <Lock size={20} />
                  Password
                </FormLabel>
                <InputWrapper $hasError={hasError && !password}>
                  <IconWrapper $hasError={hasError && !password}>
                    <Lock size={22} />
                  </IconWrapper>
                  <FormInput
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    $hasError={hasError && !password}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </PasswordToggle>
                </InputWrapper>
              </FormGroup>

              <LoginButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogOut size={24} />
                    Sign In - RP MMS
                  </>
                )}
              </LoginButton>
            </LoginForm>
          </LoginRightPanel>
        </LoginCard>
      </LoginContainer>

      {/* Authentication Popup */}
      {showAuthPopup && (
        <AuthPopup>
          <PopupContent>
            <PopupIcon success={authPopupData.success}>
              {authPopupData.success ? (
                <CheckCircle />
              ) : (
                <LoaderIcon className="spinning" />
              )}
            </PopupIcon>
            <PopupTitle>
              {authPopupData.success ? 'Success!' : 'Authenticating...'}
            </PopupTitle>
            <PopupMessage>
              {authPopupData.message}
            </PopupMessage>
          </PopupContent>
        </AuthPopup>
      )}
    </>
  );
}

export default LoginPage;