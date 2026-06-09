import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
`;

const ScrollContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 30px;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeInUp} 0.8s ease-out;
  flex-shrink: 0;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #2d3748;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 16px;
  line-height: 1.5;
`;

const LoginForm = styled.form`
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  flex-shrink: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${pulse} 1s linear infinite;
  margin-right: 8px;
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 16px;
  font-size: 14px;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const CompassionMessage = styled.div`
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  padding: 20px;
  border-radius: 12px;
  margin-top: 30px;
  text-align: center;
  border-left: 4px solid #e53e3e;
  flex-shrink: 0;
`;

const SupportInfo = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
`;

const SupportTitle = styled.h3`
  color: #2d3748;
  margin-bottom: 15px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SupportItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px;
  background: #f7fafc;
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SupportText = styled.span`
  color: #4a5568;
  font-size: 14px;
`;

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    deceasedId: '',
    nextOfKin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!formData.deceasedId || !formData.nextOfKin) {
        throw new Error('Please fill in all fields');
      }

      const userData = {
        id: formData.deceasedId,
        name: formData.nextOfKin,
        deceasedName: "Margaret Johnson",
        dateOfDeath: "2024-01-15",
        status: "In Care"
      };

      onLogin(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <LoginContainer>
      <ScrollContent>
        <HeaderSection>
          <Logo>✝</Logo>
          <Title>Condolence Portal</Title>
          <Subtitle>Access information about your loved one with care and compassion</Subtitle>
        </HeaderSection>

        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="deceasedId">Deceased ID</Label>
            <Input
              type="text"
              id="deceasedId"
              name="deceasedId"
              placeholder="Enter deceased identification number"
              value={formData.deceasedId}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="nextOfKin">Next of Kin Name</Label>
            <Input
              type="text"
              id="nextOfKin"
              name="nextOfKin"
              placeholder="Enter your full name"
              value={formData.nextOfKin}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner />
                Accessing Information...
              </>
            ) : (
              'Login to Portal'
            )}
          </SubmitButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </LoginForm>

        <CompassionMessage>
          <strong>Our Deepest Condolences</strong>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#718096' }}>
            During this difficult time, we're here to support you with compassion and care.
          </p>
        </CompassionMessage>

        <SupportInfo>
          <SupportTitle>💁 Need Help?</SupportTitle>
          <SupportItem>
            <span>📞</span>
            <SupportText>24/7 Support: +1 (555) HELP-NOW</SupportText>
          </SupportItem>
          <SupportItem>
            <span>🕒</span>
            <SupportText>Office Hours: Mon-Sun, 8AM-8PM</SupportText>
          </SupportItem>
          <SupportItem>
            <span>📍</span>
            <SupportText>Visit: 123 Compassion Street</SupportText>
          </SupportItem>
        </SupportInfo>

        {/* Extra spacing for better scrolling */}
        <div style={{ height: '40px' }}></div>
      </ScrollContent>
    </LoginContainer>
  );
};

export default LoginPage;