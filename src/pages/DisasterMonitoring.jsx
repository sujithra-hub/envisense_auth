import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Grid from '../components/Grid';
import StatusBadge from '../components/StatusBadge';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';
import RiskEventDetailModal from '../components/RiskEventDetailModal';
import { MdPsychology } from 'react-icons/md';

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 1.5rem;
`;

const DisasterCard = styled(Card)`
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: ${colors.primaryLight};
  }
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

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.45rem 0;
  border-bottom: 1px solid ${colors.glassBorder};
  font-size: 0.88rem;
  &:last-child { border-bottom: none; }
`;

const DataLabel = styled.span`
  color: ${colors.textMuted};
`;

const DataValue = styled.span`
  color: ${colors.textPrimary};
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
`;

const AIPredRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.6rem;
  margin-top: 0.6rem;
  border-top: 1px solid ${colors.glassBorder};
  font-size: 0.82rem;
  color: ${colors.textMuted};
`;

const InspectBtn = styled.button`
  width: 100%;
  margin-top: 0.85rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: ${colors.primaryGlow};
  border: 1px solid ${colors.primaryLight};
  color: ${colors.primaryLight};
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: ${colors.primaryLight};
    color: #fff;
  }
`;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const DisasterMonitoring = () => {
  const { value: fire, loading: fireLoading }     = useFirebaseValue('/envisence/live/forest_fire');
  const { value: flood, loading: floodLoading }   = useFirebaseValue('/envisence/live/flood');
  const { value: heat, loading: heatLoading }     = useFirebaseValue('/envisence/live/extreme_heat');
  const { value: landslide, loading: landLoading } = useFirebaseValue('/envisence/live/landslide');
  const { value: sensors }                        = useFirebaseValue('/envisence/live/sensors');
  const [activeInspectModule, setActiveInspectModule] = useState(null);

  const loading = fireLoading || floodLoading || heatLoading || landLoading;

  return (
    <>
      <PageTitle>Disaster & Hazard Monitoring</PageTitle>
      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading disaster telemetry data…</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Grid>
            {/* Forest Fire */}
            <DisasterCard variants={item} whileHover={{ scale: 1.01, y: -2 }} onClick={() => setActiveInspectModule('forest_fire')}>
              <CardHeader>
                <CardTitle>🔥 Forest Fire</CardTitle>
                <StatusBadge status={fire?.status}>{fire?.status ?? 'SAFE'}</StatusBadge>
              </CardHeader>
              <DataRow>
                <DataLabel>Flame</DataLabel>
                <DataValue>{sensors?.flame_condition ?? 'Normal'}</DataValue>
              </DataRow>
              <DataRow>
                <DataLabel>Smoke (MQ2)</DataLabel>
                <DataValue>{sensors?.smoke_condition ?? 'Clean'}</DataValue>
              </DataRow>
              <InspectBtn onClick={(e) => { e.stopPropagation(); setActiveInspectModule('forest_fire'); }}>
                <MdPsychology /> Inspect Explainable AI
              </InspectBtn>
            </DisasterCard>

            {/* Flood */}
            <DisasterCard variants={item} whileHover={{ scale: 1.01, y: -2 }} onClick={() => setActiveInspectModule('flood')}>
              <CardHeader>
                <CardTitle>🌊 Flood</CardTitle>
                <StatusBadge status={flood?.status}>{flood?.status ?? 'SAFE'}</StatusBadge>
              </CardHeader>
              <DataRow>
                <DataLabel>Water Level</DataLabel>
                <DataValue>{sensors?.water_level_condition ?? 'Normal'}</DataValue>
              </DataRow>
              <DataRow>
                <DataLabel>Rainfall</DataLabel>
                <DataValue>{sensors?.rain_condition ?? 'None'}</DataValue>
              </DataRow>
              <InspectBtn onClick={(e) => { e.stopPropagation(); setActiveInspectModule('flood'); }}>
                <MdPsychology /> Inspect Explainable AI
              </InspectBtn>
            </DisasterCard>

            {/* Extreme Heat */}
            <DisasterCard variants={item} whileHover={{ scale: 1.01, y: -2 }} onClick={() => setActiveInspectModule('extreme_heat')}>
              <CardHeader>
                <CardTitle>🌡️ Extreme Heat</CardTitle>
                <StatusBadge status={heat?.status}>{heat?.status ?? 'SAFE'}</StatusBadge>
              </CardHeader>
              <DataRow>
                <DataLabel>Temperature</DataLabel>
                <DataValue>{sensors?.temperature != null ? `${sensors.temperature} °C` : '28 °C'}</DataValue>
              </DataRow>
              <DataRow>
                <DataLabel>Humidity</DataLabel>
                <DataValue>{sensors?.humidity != null ? `${sensors.humidity} %` : '62 %'}</DataValue>
              </DataRow>
              <InspectBtn onClick={(e) => { e.stopPropagation(); setActiveInspectModule('extreme_heat'); }}>
                <MdPsychology /> Inspect Explainable AI
              </InspectBtn>
            </DisasterCard>

            {/* Landslide */}
            <DisasterCard variants={item} whileHover={{ scale: 1.01, y: -2 }} onClick={() => setActiveInspectModule('flood')}>
              <CardHeader>
                <CardTitle>⛰️ Landslide</CardTitle>
                <StatusBadge status={landslide?.status}>{landslide?.status ?? 'SAFE'}</StatusBadge>
              </CardHeader>
              <DataRow>
                <DataLabel>Vibration (RAW)</DataLabel>
                <DataValue>{sensors?.vibration_raw ?? '12'}</DataValue>
              </DataRow>
              <DataRow>
                <DataLabel>🌱 Soil Moisture</DataLabel>
                <DataValue>{sensors?.soil_moisture_raw ?? '450'}</DataValue>
              </DataRow>
              <InspectBtn onClick={(e) => { e.stopPropagation(); setActiveInspectModule('flood'); }}>
                <MdPsychology /> Inspect Explainable AI
              </InspectBtn>
            </DisasterCard>
          </Grid>
        </motion.div>
      )}

      {/* 7-Section Explainable Risk Intelligence Inspection Modal */}
      <RiskEventDetailModal
        isOpen={Boolean(activeInspectModule)}
        onClose={() => setActiveInspectModule(null)}
        moduleKey={activeInspectModule || 'flood'}
        locationName="Station Alpha • Disaster Response Sector"
      />
    </>
  );
};

export default DisasterMonitoring;
