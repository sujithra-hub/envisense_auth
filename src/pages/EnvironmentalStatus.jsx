// src/pages/EnvironmentalStatus.jsx
import React from 'react';
import styled from 'styled-components';
import { MdThermostat, MdWaterDrop, MdAir, MdTerrain, MdOpacity, MdScience } from 'react-icons/md';
import { colors } from '../theme/colors';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { useLocationContext } from '../context/LocationContext';
import { deriveHazardRisks } from '../services/locationService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  h2 {
    font-family: 'Manrope', sans-serif;
    font-size: 1.4rem;
    margin: 0 0 0.2rem 0;
    color: ${colors.textPrimary};
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: ${colors.textSecondary};
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
`;

const MetricCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .header {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon-wrapper {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: ${colors.surfaceLight};
      color: ${colors.primaryLight};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }

    h4 {
      margin: 0;
      font-size: 0.95rem;
      color: ${colors.textSecondary};
    }
  }

  .value {
    font-size: 2rem;
    font-weight: 800;
    font-family: 'Manrope', sans-serif;
    color: ${colors.textPrimary};
    display: flex;
    align-items: baseline;
    gap: 0.3rem;

    span {
      font-size: 1rem;
      font-weight: 500;
      color: ${colors.textMuted};
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: ${colors.textMuted};

    .status-tag {
      font-weight: 700;
      color: ${(props) =>
        props.$status === 'SAFE' ? colors.success : props.$status === 'WARNING' ? colors.warning : colors.danger};
    }
  }
`;

const EnvironmentalStatus = () => {
  const { value: firebaseData } = useFirebaseValue('envisence');
  const { selectedArea } = useLocationContext();

  const nodes = firebaseData?.nodes || {};
  const firstNodeId = Object.keys(nodes)[0];
  const telemetry = firebaseData?.live?.sensors || firebaseData?.nodes?.NODE_001?.sensors || (firstNodeId ? nodes[firstNodeId]?.sensors : null) || {};
  const hazardData = deriveHazardRisks(telemetry);

  const temp = telemetry.temperature ?? 'N/A';
  const humidity = telemetry.humidity ?? 'N/A';
  const mq2 = telemetry.mq2_raw ?? telemetry.mq2 ?? 'N/A';
  const vibration = telemetry.vibration_raw ?? telemetry.vibration ?? 'N/A';
  const ph = telemetry.ph_raw ?? telemetry.ph ?? 'N/A';
  const turbidity = telemetry.turbidity_status ?? telemetry.turbidity ?? 'N/A';

  return (
    <Container>
      <Header>
        <h2>Today's Environmental Telemetry</h2>
        <p>Live meteorological and environmental conditions for {selectedArea}</p>
      </Header>

      <MetricsGrid>
        <MetricCard $status={temp > 38 ? 'WARNING' : 'SAFE'}>
          <div className="header">
            <div className="icon-wrapper">
              <MdThermostat />
            </div>
            <h4>Ambient Temperature</h4>
          </div>
          <div className="value">
            {temp} <span>°C</span>
          </div>
          <div className="footer">
            <span>Optimal: 22 - 35°C</span>
            <span className="status-tag">{temp > 38 ? 'ELEVATED' : 'NORMAL'}</span>
          </div>
        </MetricCard>

        <MetricCard $status={humidity > 85 ? 'WARNING' : 'SAFE'}>
          <div className="header">
            <div className="icon-wrapper">
              <MdWaterDrop />
            </div>
            <h4>Relative Humidity</h4>
          </div>
          <div className="value">
            {humidity} <span>%</span>
          </div>
          <div className="footer">
            <span>Optimal: 40 - 75%</span>
            <span className="status-tag">{humidity > 85 ? 'HIGH HUMIDITY' : 'NORMAL'}</span>
          </div>
        </MetricCard>

        <MetricCard $status={hazardData.hazards.air_quality.risk}>
          <div className="header">
            <div className="icon-wrapper">
              <MdAir />
            </div>
            <h4>Air Quality Index (MQ2)</h4>
          </div>
          <div className="value">
            {mq2} <span>PPM</span>
          </div>
          <div className="footer">
            <span>Safe Threshold: &lt; 500</span>
            <span className="status-tag">{hazardData.hazards.air_quality.risk}</span>
          </div>
        </MetricCard>

        <MetricCard $status={hazardData.hazards.water_quality.risk}>
          <div className="header">
            <div className="icon-wrapper">
              <MdScience />
            </div>
            <h4>Water pH & Turbidity</h4>
          </div>
          <div className="value">
            {ph} <span>pH ({turbidity} NTU)</span>
          </div>
          <div className="footer">
            <span>Standard: pH 6.5 - 8.5</span>
            <span className="status-tag">{hazardData.hazards.water_quality.risk}</span>
          </div>
        </MetricCard>

        <MetricCard $status={hazardData.hazards.landslide.risk}>
          <div className="header">
            <div className="icon-wrapper">
              <MdTerrain />
            </div>
            <h4>Seismic / Vibration</h4>
          </div>
          <div className="value">
            {vibration} <span>m/s²</span>
          </div>
          <div className="footer">
            <span>Threshold: &lt; 50</span>
            <span className="status-tag">{hazardData.hazards.landslide.risk}</span>
          </div>
        </MetricCard>
      </MetricsGrid>
    </Container>
  );
};

export default EnvironmentalStatus;
