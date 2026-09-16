import styled from 'styled-components';
import { motion } from 'framer-motion';
import { colors } from '../theme/colors';

const Card = styled(motion.div)`
  background: ${colors.glass};
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 1.5rem;
  border-radius: 16px;
  color: ${colors.textPrimary};
  border: 1px solid ${colors.glassBorder};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${colors.headerGradient};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: rgba(64, 145, 108, 0.4);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    background: ${colors.cardGradientHover};

    &::before {
      opacity: 1;
    }
  }

  h3 {
    font-family: 'Manrope', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: ${colors.textPrimary};
  }

  h4 {
    font-family: 'Manrope', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${colors.textSecondary};
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.9rem;
    color: ${colors.textSecondary};
    margin: 0.3rem 0;
    line-height: 1.5;
  }
`;

export default Card;
