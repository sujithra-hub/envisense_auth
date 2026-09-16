import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  MdAir, MdWaterDrop, MdThermostat, MdPsychology, MdAnalytics, 
  MdCheckCircle, MdWarning, MdError, MdScience, MdSpeed, MdCloudQueue
} from 'react-icons/md';
import Card from '../components/Card';
import Grid from '../components/Grid';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';
import RiskEventDetailModal from '../components/RiskEventDetailModal';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitleGroup = styled.div`
  h2 {
    font-family: 'Manrope', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${colors.textPrimary};
    margin: 0 0 0.25rem 0;
  }
  p {
    margin: 0;
    font-size: 0.88rem;
    color: ${colors.textSecondary};
  }
`;

const SectionCard = styled(Card)`
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${colors.surfaceLight};
    color: ${colors.primaryLight};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Manrope', sans-serif;
  color: ${colors.textPrimary};
  margin: 0;
`;

const LiveBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) =>
    props.$status === 'CRITICAL' || props.$status === 'HIGH' || props.$status === 'RISK'
      ? 'hsla(0, 75%, 58%, 0.15)'
      : props.$status === 'WARNING' || props.$status === 'MODERATE'
      ? 'hsla(45, 95%, 55%, 0.15)'
      : 'hsla(152, 70%, 48%, 0.15)'};
  color: ${(props) =>
    props.$status === 'CRITICAL' || props.$status === 'HIGH' || props.$status === 'RISK'
      ? colors.danger
      : props.$status === 'WARNING' || props.$status === 'MODERATE'
      ? colors.warning
      : colors.success};
  border: 1px solid
    ${(props) =>
      props.$status === 'CRITICAL' || props.$status === 'HIGH' || props.$status === 'RISK'
        ? 'hsla(0, 75%, 58%, 0.3)'
        : props.$status === 'WARNING' || props.$status === 'MODERATE'
        ? 'hsla(45, 95%, 55%, 0.3)'
        : 'hsla(152, 70%, 48%, 0.3)'};
`;

const DataList = styled.div`
  margin-bottom: 1rem;
`;

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${colors.glassBorder};
  font-size: 0.88rem;

  &:last-child {
    border-bottom: none;
  }
`;

const DataLabel = styled.span`
  color: ${colors.textMuted};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const DataValue = styled.span`
  color: ${colors.textPrimary};
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
`;

const InspectButton = styled.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${colors.surfaceLight};
  border: 1px solid ${colors.glassBorder};
  color: ${colors.textPrimary};
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.primaryGlow};
    border-color: ${colors.primaryLight};
    color: ${colors.primaryLight};
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

const EnvironmentalMonitoring = () => {
  const { value: sensors, loading: sensorsLoading } = useFirebaseValue('/envisence/live/sensors');
  const { value: airQuality, loading: airLoading } = useFirebaseValue('/envisence/live/air_quality');
  const { value: waterQuality, loading: waterLoading } = useFirebaseValue('/envisence/live/water_quality');
  const { value: disasterData } = useFirebaseValue('/envisence/live/disaster_prediction');

  const [selectedEvent, setSelectedEvent] = useState(null);

  const loading = sensorsLoading || airLoading || waterLoading;

  // Dynamic Air Quality status computation
  const mq2Val = sensors?.mq2_raw ?? 450;
  const smokeCond = sensors?.smoke_condition ?? 'Normal';
  const flameCond = sensors?.flame_condition ?? 'Clear';
  let airStatus = 'SAFE';
  if (mq2Val > 800 || smokeCond === 'Smoke Detected' || flameCond === 'Flame Detected') {
    airStatus = 'CRITICAL';
  } else if (mq2Val > 600 || airQuality?.ai_prediction === 'RISK') {
    airStatus = 'WARNING';
  }

  // Dynamic Water Quality status computation
  const phRaw = sensors?.ph_raw ?? 2400;
  const tdsVal = sensors?.tds_ppm ?? 180;
  const turbidityStatus = sensors?.turbidity_status ?? 'Clear';
  let waterStatus = 'SAFE';
  if (turbidityStatus === 'Dirty / High Turbidity' || tdsVal > 500) {
    waterStatus = 'WARNING';
  } else if (waterQuality?.ai_prediction === 'RISK') {
    waterStatus = 'WARNING';
  }

  // Climate status computation
  const tempVal = sensors?.temperature ?? 28;
  const humVal = sensors?.humidity ?? 65;
  let climateStatus = 'SAFE';
  if (tempVal >= 40) {
    climateStatus = 'CRITICAL';
  } else if (tempVal >= 36) {
    climateStatus = 'WARNING';
  }

  return (
    <>
      <PageHeader>
        <PageTitleGroup>
          <h2>Environmental & IoT Telemetry Monitoring</h2>
          <p>Live sensor stream, dynamic hazard assessment, and explainable AI insights</p>
        </PageTitleGroup>
      </PageHeader>

      {loading ? (
        <p style={{ color: colors.textMuted }}>Streaming telemetry from IoT edge nodes…</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Grid>
            {/* Air Quality */}
            <SectionCard variants={item} whileHover={{ y: -3 }}>
              <div>
                <CardHeader>
                  <CardTitleGroup>
                    <div className="icon-box">
                      <MdAir />
                    </div>
                    <CardTitle>Air Quality Index</CardTitle>
                  </CardTitleGroup>
                  <LiveBadge $status={airStatus}>
                    {airStatus === 'SAFE' ? <MdCheckCircle /> : <MdWarning />}
                    {airStatus}
                  </LiveBadge>
                </CardHeader>
                <DataList>
                  <DataRow>
                    <DataLabel><MdCloudQueue /> MQ2 Gas Level</DataLabel>
                    <DataValue>{mq2Val} PPM</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdSpeed /> Smoke Condition</DataLabel>
                    <DataValue>{smokeCond}</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdScience /> Flame Sensor</DataLabel>
                    <DataValue>{flameCond}</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdPsychology /> AI Model Prediction</DataLabel>
                    <DataValue>{airQuality?.ai_prediction ?? 'NORMAL'}</DataValue>
                  </DataRow>
                </DataList>
              </div>
              <InspectButton
                onClick={() =>
                  setSelectedEvent({
                    type: 'air_quality',
                    title: 'Air Quality & Toxic Gas Telemetry Analysis',
                    location: 'Guindy Industrial Sector • Node 003',
                    severity: airStatus,
                    confidence: '94%',
                    trend: airStatus === 'SAFE' ? 'STABLE' : 'RISING',
                  })
                }
              >
                <MdPsychology size={18} /> Inspect Explainable AI
              </InspectButton>
            </SectionCard>

            {/* Water Quality */}
            <SectionCard variants={item} whileHover={{ y: -3 }}>
              <div>
                <CardHeader>
                  <CardTitleGroup>
                    <div className="icon-box">
                      <MdWaterDrop />
                    </div>
                    <CardTitle>Water Quality & Purity</CardTitle>
                  </CardTitleGroup>
                  <LiveBadge $status={waterStatus}>
                    {waterStatus === 'SAFE' ? <MdCheckCircle /> : <MdWarning />}
                    {waterStatus}
                  </LiveBadge>
                </CardHeader>
                <DataList>
                  <DataRow>
                    <DataLabel><MdScience /> pH Level Raw</DataLabel>
                    <DataValue>{phRaw}</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdSpeed /> TDS Concentration</DataLabel>
                    <DataValue>{tdsVal} PPM</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdCloudQueue /> Turbidity Status</DataLabel>
                    <DataValue>{turbidityStatus}</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdPsychology /> AI Model Prediction</DataLabel>
                    <DataValue>{waterQuality?.ai_prediction ?? 'CLEAN'}</DataValue>
                  </DataRow>
                </DataList>
              </div>
              <InspectButton
                onClick={() =>
                  setSelectedEvent({
                    type: 'water_quality',
                    title: 'Hydrological Quality & Contamination Inspection',
                    location: 'Velachery Drainage Canal • Station W-01',
                    severity: waterStatus,
                    confidence: '92%',
                    trend: waterStatus === 'SAFE' ? 'STABLE' : 'ELEVATED',
                  })
                }
              >
                <MdPsychology size={18} /> Inspect Explainable AI
              </InspectButton>
            </SectionCard>

            {/* Climate & Ambient Monitoring */}
            <SectionCard variants={item} whileHover={{ y: -3 }}>
              <div>
                <CardHeader>
                  <CardTitleGroup>
                    <div className="icon-box">
                      <MdThermostat />
                    </div>
                    <CardTitle>Climate & Heat Stress</CardTitle>
                  </CardTitleGroup>
                  <LiveBadge $status={climateStatus}>
                    {climateStatus === 'SAFE' ? <MdCheckCircle /> : <MdWarning />}
                    {climateStatus}
                  </LiveBadge>
                </CardHeader>
                <DataList>
                  <DataRow>
                    <DataLabel><MdThermostat /> Temperature</DataLabel>
                    <DataValue>{tempVal} °C</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdWaterDrop /> Relative Humidity</DataLabel>
                    <DataValue>{humVal} %</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdCloudQueue /> Precipitation / Rain</DataLabel>
                    <DataValue>{sensors?.rain_condition ?? 'Clear'}</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel><MdScience /> Soil Moisture</DataLabel>
                    <DataValue>{sensors?.soil_moisture_raw ?? 'Optimal'}</DataValue>
                  </DataRow>
                </DataList>
              </div>
              <InspectButton
                onClick={() =>
                  setSelectedEvent({
                    type: 'heat',
                    title: 'Thermal Index & Extreme Heat Intelligence',
                    location: 'Central Urban Core • Sensor Cluster T-04',
                    severity: climateStatus,
                    confidence: '96%',
                    trend: tempVal > 35 ? 'RISING' : 'STABLE',
                  })
                }
              >
                <MdPsychology size={18} /> Inspect Explainable AI
              </InspectButton>
            </SectionCard>
          </Grid>
        </motion.div>
      )}

      {/* 7-Section Explainable Risk Inspection Modal */}
      {selectedEvent && (
        <RiskEventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
};

export default EnvironmentalMonitoring;

