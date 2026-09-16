// src/components/BrandLogo.jsx
import React from 'react';
import styled from 'styled-components';
import { colors } from '../theme/colors';

const LogoContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  user-select: none;
`;

const SvgIcon = styled.svg`
  flex-shrink: 0;
  filter: drop-shadow(0 3px 10px rgba(0, 122, 255, 0.3));
  transition: transform 0.25s ease;

  &:hover {
    transform: scale(1.04);
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1;
`;

const MainTitle = styled.span`
  font-family: 'Manrope', sans-serif;
  font-weight: 800;
  font-size: ${({ $size }) => ($size ? `${$size * 0.58}px` : '1.2rem')};
  letter-spacing: 0.06em;
  background: ${colors.headerGradient || 'linear-gradient(135deg, #007AFF 0%, #3395FF 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SubBadge = styled.span`
  font-size: 0.63rem;
  font-weight: 700;
  color: ${colors.textMuted || '#8e8e93'};
  letter-spacing: 0.12em;
  margin-top: 3px;
  text-transform: uppercase;
`;

export const BrandIconSvg = ({ size = 32, ...props }) => (
  <SvgIcon
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="enviFormalGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#007AFF" />
        <stop offset="50%" stopColor="#0066D6" />
        <stop offset="100%" stopColor="#004499" />
      </linearGradient>
      <linearGradient id="enviBorderGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#5AC8FA" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#007AFF" stopOpacity="0.5" />
      </linearGradient>
    </defs>

    {/* Background rounded badge */}
    <rect x="2" y="2" width="36" height="36" rx="9" fill="url(#enviFormalGrad)" />
    <rect x="2" y="2" width="36" height="36" rx="9" stroke="url(#enviBorderGrad)" strokeWidth="1.2" fill="none" />

    {/* Formal Authority Shield Emblem */}
    <path
      d="M20 7L31 11.5V19.5C31 26.5 20 32.5 20 32.5C20 32.5 9 26.5 9 19.5V11.5L20 7Z"
      fill="#ffffff"
      fillOpacity="0.15"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />

    {/* Concentric Telemetry Sensor Rings */}
    <path
      d="M14 16C16 14.2 24 14.2 26 16"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M16 19.5C17.5 18 22.5 18 24 19.5"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.95"
    />

    {/* Central Precision Beacon Dot */}
    <circle cx="20" cy="23.5" r="2.2" fill="#5AC8FA" />
    <circle cx="20" cy="23.5" r="1.1" fill="#ffffff" />
  </SvgIcon>
);

const BrandLogo = ({ size = 32, showText = true, subtext, className }) => {
  return (
    <LogoContainer className={className}>
      <BrandIconSvg size={size} />
      {showText && (
        <TextWrapper>
          <MainTitle $size={size}>ENVISENSE</MainTitle>
          {subtext && <SubBadge>{subtext}</SubBadge>}
        </TextWrapper>
      )}
    </LogoContainer>
  );
};

export default BrandLogo;
