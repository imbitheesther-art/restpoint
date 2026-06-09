import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* 1. FIX: The @import MUST be at the very top of the CSS. */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  /* 2. FIX: Ensure html and body take up full height and enable scrolling */
  html, body {
    height: 100%; /* Important for body to inherit height correctly */
    min-height: 100vh;
    overflow-y: scroll; /* Forces vertical scrollbar when content is too long */
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1626 100%);
    line-height: 1.6;
    color: #f3f4f6;
  }

  #root {
    min-height: 100vh;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input {
    font-family: inherit;
    outline: none;
  }
`;