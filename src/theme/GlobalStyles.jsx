// src/theme/GlobalStyles.jsx
import { createGlobalStyle } from 'styled-components';
import { colors } from './colors';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: ${colors.background};
    color: ${colors.textPrimary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  #root {
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* Light theme scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${colors.surfaceLight}; }
  ::-webkit-scrollbar-thumb {
    background: ${colors.surfaceMid};
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover { background: ${colors.textMuted}; }

  a {
    color: ${colors.primaryLight};
    text-decoration: none;
    transition: color 0.2s ease;
  }
  a:hover { color: ${colors.primary}; }

  /* Terra Civic: Manrope for headings */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Manrope', sans-serif;
    color: ${colors.textPrimary};
    letter-spacing: -0.02em;
  }

  p {
    line-height: 1.6;
    color: ${colors.textSecondary};
  }

  button { font-family: 'Public Sans', sans-serif; }
  code, pre, .mono { font-family: 'JetBrains Mono', monospace; }
`;
