import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// Sample verses data in case the JSON file is not available
const defaultVerses = [
  {
    text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
    reference: "Psalm 34:18"
  },
  {
    text: "Blessed are those who mourn, for they will be comforted.",
    reference: "Matthew 5:4"
  },
  {
    text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.",
    reference: "Revelation 21:4"
  },
  {
    text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives.",
    reference: "John 14:27"
  },
  {
    text: "Cast all your anxiety on him because he cares for you.",
    reference: "1 Peter 5:7"
  },
  {
    text: "God is our refuge and strength, an ever-present help in trouble.",
    reference: "Psalm 46:1"
  }
];

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

const scrollFromRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
`;

const LoginContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1626 100%);
`;

// Background Image Layer - Pure Black with subtle green accents
const BackgroundImageLayer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1626 100%);
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 50%);
    z-index: 1;
  }
`;

const VerseBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
`;







const ScrollContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 45px  10px 0px 10px;
  overflow-y: auto;
  position: relative;
  z-index: 2;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(241, 241, 241, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(193, 193, 193, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(168, 168, 168, 0.5);
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 50px;
  animation: ${fadeInUp} 0.8s ease-out;
  flex-shrink: 0;
`;

const BrandLogo = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 16px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
  animation: ${fadeInUp} 1s ease-out;
`;

const Title = styled.h1`
  font-size: 36px;
  color: #ffffff !important;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  display: block;

  span {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Tagline = styled.p`
  color: #e2e8f0;
  font-size: 16px;
  line-height: 1.6;
  margin: 12px 0 0 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 400;
  letter-spacing: 0.3px;
`;

const Subtitle = styled.p`
  color: #a1a5b3;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: 400;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
`;

const LoginForm = styled.form`
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  flex-shrink: 0;
  background: rgba(26, 31, 58, 0.8);
  backdrop-filter: blur(25px);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 1px rgba(34, 197, 94, 0.2) inset;
  border: 1px solid rgba(34, 197, 94, 0.15);
  max-width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 28px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
  color: #e2e8f0;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: 'Inter', sans-serif;

  &:focus {
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15), 0 2px 8px rgba(0, 0, 0, 0.2);
    outline: none;
    background: rgba(255, 255, 255, 0.12);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
  letter-spacing: 0.5px;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(34, 197, 94, 0.6);
    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 3px solid transparent;
  border-top: 3px solid white;
  border-radius: 50%;
  animation: ${pulse} 1s linear infinite;
  margin-right: 12px;
`;

const ErrorMessage = styled.div`
  background: rgba(254, 215, 215, 0.98);
  color: #c53030;
  padding: 14px 18px;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 15px;
  animation: ${fadeInUp} 0.3s ease-out;
  border-left: 5px solid #c53030;
  box-shadow: 0 3px 10px rgba(197, 48, 48, 0.1);
`;

const InfoMessage = styled.div`
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.08) 100%);
  color: #a1f3a0;
  padding: 16px 18px;
  border-radius: 12px;
  margin-bottom: 30px;
  font-size: 14px;
  text-align: center;
  border: 1px solid rgba(34, 197, 94, 0.3);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
  font-weight: 500;
  backdrop-filter: blur(8px);
  
  strong {
    color: #22c55e;
    font-weight: 600;
  }
`;

const StaticVerseContainer = styled.div`
  margin-top: 30px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.05) 100%);
  backdrop-filter: blur(15px);
  border-radius: 14px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  text-align: center;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
`;

const VerseText = styled.p`
  color: #e2e8f0;
  font-style: italic;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 12px;
  font-weight: 400;
  letter-spacing: 0.2px;
`;

const VerseReference = styled.p`
  color: #22c55e;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
`;

const LoginPage = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verses, setVerses] = useState(defaultVerses);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const verseBackgroundRef = useRef(null);
  const logoVerseContainerRef = useRef(null);
  const verseElementsRef = useRef([]);
  const logoVerseElementsRef = useRef([]);

  // Load verses from JSON file
  useEffect(() => {
    const loadVerses = async () => {
      try {
        // Try to load from the JSON file
        const loadedVerses = await import('../assets/verses/verses.json');
        if (loadedVerses.default && loadedVerses.default.verses) {
          setVerses(loadedVerses.default.verses);
        }
      } catch (error) {
        console.log('Using default verses');
        setVerses(defaultVerses);
      }
    };

    loadVerses();
  }, []);

  // Initialize and manage verses
  useEffect(() => {
    if (!verses || verses.length === 0) return;

    // Set initial verse for display
    setCurrentVerseIndex(Math.floor(Math.random() * verses.length));

    const createVerseElements = () => {
      if (!verseBackgroundRef.current) return;

      // Clear existing verses
      verseElementsRef.current.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      verseElementsRef.current = [];

      // Create 8-12 verse elements for background
      const verseCount = 10;
      for (let i = 0; i < verseCount; i++) {
        const verse = verses[Math.floor(Math.random() * verses.length)];
        const verseElement = document.createElement('div');
        
        // Random vertical position (10% to 90%)
        const topPosition = 10 + Math.random() * 80;
        verseElement.style.top = `${topPosition}%`;
        
        // Random duration (40-60 seconds)
        const duration = 40 + Math.random() * 20;
        verseElement.style.animationDuration = `${duration}s`;
        
        // Random delay so they don't all start at once
        const delay = Math.random() * -30;
        verseElement.style.animationDelay = `${delay}s`;
        
        // Random font size
        const fontSize = 1.2 + Math.random() * 0.6;
        verseElement.style.fontSize = `${fontSize}rem`;
        
        // Set content
        verseElement.textContent = `"${verse.text}" - ${verse.reference}`;
        verseElement.style.cssText += verseElement.style.cssText + `
          position: absolute;
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
          font-size: ${fontSize}rem;
          font-weight: 500;
          font-style: italic;
          padding: 12px 24px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 74, 162, 0.3));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          animation: scrollFromRight ${duration}s linear ${delay}s forwards;
          pointer-events: none;
          user-select: none;
          opacity: 0;
          z-index: 2;
        `;
        
        verseBackgroundRef.current.appendChild(verseElement);
        verseElementsRef.current.push(verseElement);
      }
    };

    const createLogoVerseElements = () => {
      if (!logoVerseContainerRef.current) return;

      // Clear existing logo verses
      logoVerseElementsRef.current.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      logoVerseElementsRef.current = [];

      // Create 3 verses for logo (faster movement)
      for (let i = 0; i < 3; i++) {
        const verse = verses[Math.floor(Math.random() * verses.length)];
        const verseElement = document.createElement('div');
        
        // Get shorter text for logo
        const words = verse.text.split(' ');
        const shortText = words.length > 6 
          ? words.slice(0, 6).join(' ') + '...' 
          : verse.text;
        
        // Faster movement for logo (15-25 seconds)
        const duration = 15 + Math.random() * 10;
        const delay = i * 8; // Staggered starts
        
        verseElement.textContent = `"${shortText}"`;
        verseElement.style.cssText += `
          position: absolute;
          white-space: nowrap;
          color: rgba(255, 255, 255, 0.98);
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
          font-size: 1.5rem;
          font-weight: 600;
          font-style: italic;
          padding: 10px 18px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.35), rgba(118, 74, 162, 0.35));
          border-radius: 10px;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          animation: scrollFromRight ${duration}s linear ${delay}s infinite;
          pointer-events: none;
          user-select: none;
          opacity: 0;
          z-index: 3;
        `;
        
        logoVerseContainerRef.current.appendChild(verseElement);
        logoVerseElementsRef.current.push(verseElement);
      }
    };

    // Create initial elements
    createVerseElements();
    createLogoVerseElements();

    // Refresh verses periodically
    const backgroundInterval = setInterval(() => {
      createVerseElements();
    }, 60000); // Refresh every minute

    const logoVerseInterval = setInterval(() => {
      createLogoVerseElements();
    }, 45000); // Refresh logo verses every 45 seconds

    const displayedVerseInterval = setInterval(() => {
      if (verses.length > 0) {
        setCurrentVerseIndex(Math.floor(Math.random() * verses.length));
      }
    }, 15000); // Change displayed verse every 15 seconds

    return () => {
      clearInterval(backgroundInterval);
      clearInterval(logoVerseInterval);
      clearInterval(displayedVerseInterval);
      
      // Clean up DOM elements
      verseElementsRef.current.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      logoVerseElementsRef.current.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    };
  }, [verses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!identifier.trim()) {
        throw new Error('Please enter admission number or phone number');
      }

      const response = await fetch('http://localhost:5000/api/v1/restpoint/portal/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.status === 'success') {
        if (data.user_type === 'vendor' || data.role === 'vendor') {
          window.location.href = '/vendor';
          return;
        }

        if (data.deceased && data.deceased.deceased_id) {
          localStorage.setItem('deceased_id', data.deceased.deceased_id);
        }

        if (data.session_token) {
          localStorage.setItem('session_token', data.session_token);
        }

        onLogin(data);
      } else {
        throw new Error(data.message || 'Login failed');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setIdentifier(e.target.value);
  };

  return (
    <LoginContainer>
      {/* Sticky Background Image */}
      <BackgroundImageLayer />
      
      {/* Moving Verses Overlay */}
      <VerseBackground ref={verseBackgroundRef} />
      
      <ScrollContent>
        <HeaderSection>
          <BrandLogo>⚰️</BrandLogo>
          <Title><span>LEE</span> Funeral Home</Title>
          <Tagline>Providing Clarity in Difficult Times</Tagline>
          <Subtitle>Families deserve compassionate support and clear access to essential information when they need it most</Subtitle>
        </HeaderSection>

        <InfoMessage>
          You can login using either <strong>deceased admission number</strong> or <strong>next of kin phone number</strong>
        </InfoMessage>

        <LoginForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="identifier">Adm-No or Phone Number</Label>
            <Input
              type="text"
              id="identifier"
              name="identifier"
              placeholder="Enter adm-no (LEE-ADM-001) or phone number"
              value={identifier}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner />
                Logging in...
              </>
            ) : (
              'Login to Portal'
            )}
          </SubmitButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </LoginForm>

        {verses.length > 0 && verses[currentVerseIndex] && (
          <StaticVerseContainer>
            <VerseText>"{verses[currentVerseIndex].text}"</VerseText>
            <VerseReference>{verses[currentVerseIndex].reference}</VerseReference>
          </StaticVerseContainer>
        )}

        {/* Extra spacing for better scrolling */}
        <div style={{ height: '40px' }}></div>
      </ScrollContent>
    </LoginContainer>
  );
};

export default LoginPage;