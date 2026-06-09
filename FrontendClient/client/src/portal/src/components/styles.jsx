import styled from 'styled-components';

export const GlobalStyle = styled.createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1626 100%);
    color: #f3f4f6;
  }
`;

export const MobileFrame = styled.div`
  max-width: 100%;
  margin: 0 auto;
  position: relative;
`;

export const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1626 100%);
  position: relative;
  overflow: hidden;
`;