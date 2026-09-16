// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import BrandLogo from '../components/BrandLogo';


const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.background};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(45, 106, 79, 0.10) 0%, transparent 70%);
    top: -150px;
    right: -100px;
  }

  &::after {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(182, 81, 7, 0.08) 0%, transparent 70%);
    bottom: -100px;
    left: -100px;
  }
`;

const LoginCard = styled.div`
  background: ${colors.glass};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 2.5rem 2.5rem 2rem;
  border-radius: 20px;
  width: 380px;
  max-width: 90vw;
  border: 1px solid ${colors.glassBorder};
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  animation: ${float} 6s ease-in-out infinite;
`;

const Logo = styled.h1`
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 0.25rem;
  background: ${colors.headerGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.08em;
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${colors.textMuted};
  font-size: 0.85rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 0.9rem;
  border: 1px solid ${colors.glassBorder};
  border-radius: 10px;
  background: ${colors.surfaceLight};
  color: ${colors.textPrimary};
  font-size: 0.9rem;
  font-family: 'Public Sans', sans-serif;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${colors.textMuted};
  }

  &:focus {
    border-color: ${colors.primaryLight};
    box-shadow: 0 0 0 3px ${colors.primaryGlow};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.85rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  color: #fff;
  background: ${colors.headerGradient};
  background-size: 200% auto;
  transition: all 0.3s ease;

  &:hover {
    animation: ${shimmer} 2s linear infinite;
    box-shadow: 0 4px 20px ${colors.primaryGlow};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: ${colors.danger};
  text-align: center;
  font-size: 0.85rem;
  margin-top: 0.75rem;
`;

const LoginPage = () => {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Container>
      <LoginCard>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <BrandLogo size={36} subtext="AUTHORITY CONTROL CENTER" />
        </div>
        <Subtitle>Environmental Monitoring Dashboard</Subtitle>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </LoginCard>
    </Container>
  );
};

export default LoginPage;
