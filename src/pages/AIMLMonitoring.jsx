import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Grid from '../components/Grid';
import StatusBadge from '../components/StatusBadge';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 1.5rem;
`;

const ModelCard = styled(Card)`
  text-align: left;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
`;

const PredictionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${colors.glassBorder};
  font-size: 0.88rem;
  &:last-child { border-bottom: none; }
`;

const PredLabel = styled.span`
  color: ${colors.textMuted};
`;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const AIMLMonitoring = () => {
  const { value: airQuality, loading: airLoading } = useFirebaseValue('/envisence/live/air_quality');
  const { value: waterQuality, loading: waterLoading } = useFirebaseValue('/envisence/live/water_quality');
  const { value: extremeHeat, loading: heatLoading } = useFirebaseValue('/envisence/live/extreme_heat');
  const { value: forestFire, loading: fireLoading } = useFirebaseValue('/envisence/live/forest_fire');

  const loading = airLoading || waterLoading || heatLoading || fireLoading;

  const models = [
    { name: '🌫️ Air Quality Model',    prediction: airQuality?.ai_prediction,   status: airQuality?.status },
    { name: '💧 Water Quality Model',  prediction: waterQuality?.ai_prediction, status: waterQuality?.status },
    { name: '🌡️ Extreme Heat Model',   prediction: extremeHeat?.ai_prediction,  status: extremeHeat?.status },
    { name: '🔥 Forest Fire Model',    prediction: forestFire?.ai_prediction,   status: forestFire?.status },
  ];

  return (
    <>
      <PageTitle>AI / ML Monitoring</PageTitle>
      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading AI predictions…</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Grid>
            {models.map(({ name, prediction, status }) => (
              <ModelCard
                key={name}
                variants={item}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <CardHeader>
                  <CardTitle>{name}</CardTitle>
                </CardHeader>
                <PredictionRow>
                  <PredLabel>Status</PredLabel>
                  <StatusBadge status={status}>{status ?? 'N/A'}</StatusBadge>
                </PredictionRow>
                <PredictionRow>
                  <PredLabel>AI Prediction</PredLabel>
                  <StatusBadge status={prediction}>{prediction ?? 'N/A'}</StatusBadge>
                </PredictionRow>
              </ModelCard>
            ))}
          </Grid>
        </motion.div>
      )}
    </>
  );
};

export default AIMLMonitoring;
