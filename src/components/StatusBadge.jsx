import styled from 'styled-components';
import { colors } from '../theme/colors';

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  background: ${({ status }) =>
    status === 'SAFE'
      ? 'hsla(152, 70%, 48%, 0.15)'
      : status === 'WARNING'
      ? 'hsla(45, 95%, 55%, 0.15)'
      : 'hsla(0, 75%, 58%, 0.15)'};

  color: ${({ status }) =>
    status === 'SAFE'
      ? colors.success
      : status === 'WARNING'
      ? colors.warning
      : colors.danger};

  border: 1px solid ${({ status }) =>
    status === 'SAFE'
      ? 'hsla(152, 70%, 48%, 0.3)'
      : status === 'WARNING'
      ? 'hsla(45, 95%, 55%, 0.3)'
      : 'hsla(0, 75%, 58%, 0.3)'};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ status }) =>
      status === 'SAFE'
        ? colors.success
        : status === 'WARNING'
        ? colors.warning
        : colors.danger};
    box-shadow: 0 0 6px ${({ status }) =>
      status === 'SAFE'
        ? colors.success
        : status === 'WARNING'
        ? colors.warning
        : colors.danger};
  }
`;

export default StatusBadge;
