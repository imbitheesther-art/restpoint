import React, { useState } from 'react';
import styled from 'styled-components';
import LoginPage from './login';
import Dashboard from './dashboard';

const AppContainer = styled.div`
  min-height: 100vh;
 
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
`;

const MobileWrapper = styled.div`
  width: 100%;
  width: 100%;
  min-height: 100vh;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;

  @media (max-width: 480px) {
    height: 100vh;
    border-radius: 0;
    max-width: 100%;
  }
`;

const ClientPortal = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLogin = (userData) => {
    setUserData(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
  };

  return (
    <AppContainer>
      <MobileWrapper>
        {!isAuthenticated ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Dashboard userData={userData} onLogout={handleLogout} />
        )}
      </MobileWrapper>
    </AppContainer>
  );
};

export default ClientPortal;