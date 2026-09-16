import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Grid from '../components/Grid';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 1.5rem;
`;

const DeviceCard = styled(Card)`
  text-align: left;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${colors.glassBorder};
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OnlineDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ online }) => (online ? colors.success : colors.danger)};
  box-shadow: 0 0 10px ${({ online }) => (online ? colors.success : colors.danger)};
  display: inline-block;
`;

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.05);
  font-size: 0.95rem;

  &:last-child {
    border-bottom: none;
  }
`;

const DataLabel = styled.span`
  color: ${colors.textMuted};
  font-weight: 500;
`;

const DataValue = styled.span`
  color: ${colors.textPrimary};
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
`;

const StatusText = styled.span`
  color: ${({ online }) => (online ? colors.success : colors.danger)};
  font-weight: 700;
`;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const DeviceInfo = () => {
  const { value: device, loading } = useFirebaseValue('/envisence/live/device');

  // Format last_update (millis uptime) into a readable string
  const formatUptime = (ms) => {
    if (ms == null) return 'N/A';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <>
      <PageTitle>Device Status</PageTitle>
      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading device info…</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Grid style={{ gridTemplateColumns: '1fr', maxWidth: '600px' }}>
            <DeviceCard variants={item}>
              <CardHeader>
                <CardTitle>
                  <OnlineDot online={device?.online} />
                  ESP32 Main Sensor Node
                </CardTitle>
              </CardHeader>

              <DataRow>
                <DataLabel>Connection Status</DataLabel>
                <DataValue>
                  <StatusText online={device?.online}>
                    {device?.online ? 'ONLINE' : 'OFFLINE'}
                  </StatusText>
                </DataValue>
              </DataRow>

              <DataRow>
                <DataLabel>System Uptime</DataLabel>
                <DataValue>{formatUptime(device?.last_update)}</DataValue>
              </DataRow>

              <DataRow>
                <DataLabel>Last Update (ms)</DataLabel>
                <DataValue>{device?.last_update ?? 'N/A'}</DataValue>
              </DataRow>

            </DeviceCard>
          </Grid>
        </motion.div>
      )}
    </>
  );
};

export default DeviceInfo;
