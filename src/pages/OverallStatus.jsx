// src/pages/OverallStatus.jsx
import styled from 'styled-components';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: ${colors.glass};
  backdrop-filter: blur(12px);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: ${colors.textPrimary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: ${({ status }) =>
    status === 'SAFE'
      ? colors.success
      : status === 'WARNING'
      ? colors.warning
      : colors.danger};
  color: #fff;
  font-weight: 600;
`;

const OverallStatus = () => {
  const { value: statusObj, loading } = useFirebaseValue('/envisence/live/overall_status');
  const status = statusObj?.status || 'SAFE';

  return (
    <Card
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Overall Status</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <StatusBadge status={status}>{status}</StatusBadge>
      )}
    </Card>
  );
};

export default OverallStatus;
