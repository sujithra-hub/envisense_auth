// src/pages/NearbyRisks.jsx
import React from 'react';
import styled from 'styled-components';
import { MdWarning, MdLocationOn, MdAccessTime, MdSecurity } from 'react-icons/md';
import { colors } from '../theme/colors';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { useLocationContext } from '../context/LocationContext';
import { getActiveNodes } from '../services/locationService';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 900px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

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

const RiskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RiskItemCard = styled.div`
  background: ${colors.surface};
  border: 1px solid
    ${(props) =>
      props.$risk === 'HIGH' || props.$risk === 'CRITICAL'
        ? colors.danger
        : props.$risk === 'WARNING' || props.$risk === 'MODERATE'
        ? colors.warning
        : colors.glassBorder};
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;

  .main-info {
    display: flex;
    align-items: center;
    gap: 1rem;

    .icon-box {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      font-size: 1.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${(props) =>
        props.$risk === 'HIGH' || props.$risk === 'CRITICAL'
          ? 'rgba(239, 68, 68, 0.15)'
          : props.$risk === 'WARNING' || props.$risk === 'MODERATE'
          ? 'rgba(245, 158, 11, 0.15)'
          : 'rgba(16, 185, 129, 0.15)'};
    }

    h3 {
      margin: 0 0 0.2rem 0;
      font-size: 1.1rem;
      color: ${colors.textPrimary};
      font-family: 'Manrope', sans-serif;
    }

    p {
      margin: 0;
      font-size: 0.82rem;
      color: ${colors.textSecondary};
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }
  }

  .meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.35rem;

    .dist {
      font-size: 0.9rem;
      font-weight: 700;
      color: ${colors.primaryLight};
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      color: ${(props) =>
        props.$risk === 'HIGH' || props.$risk === 'CRITICAL'
          ? colors.danger
          : props.$risk === 'WARNING' || props.$risk === 'MODERATE'
          ? colors.warning
          : colors.success};
      background: ${(props) =>
        props.$risk === 'HIGH' || props.$risk === 'CRITICAL'
          ? 'rgba(239, 68, 68, 0.15)'
          : props.$risk === 'WARNING' || props.$risk === 'MODERATE'
          ? 'rgba(245, 158, 11, 0.15)'
          : 'rgba(16, 185, 129, 0.15)'};
    }

    @media (max-width: 640px) {
      align-items: flex-start;
    }
  }
`;

const SeverityWeight = {
  CRITICAL: 4,
  HIGH: 3,
  WARNING: 2,
  MODERATE: 1,
  SAFE: 0,
};

const NearbyRisks = () => {
  const { value: firebaseData } = useFirebaseValue('envisence');
  const { selectedArea, getDistanceTo } = useLocationContext();
  const nodes = getActiveNodes(firebaseData);

  // Flatten active non-SAFE risks from live nodes
  const activeRisks = [];
  nodes.forEach((node) => {
    const dist = getDistanceTo(node.lat, node.lng);
    const s = node.sensorData || {};
    
    Object.entries(node.risks.hazards).forEach(([key, hazard]) => {
      if (hazard.risk !== 'SAFE') {
        let sensorDetail = '';
        if (key === 'water_quality') sensorDetail = `Turbidity: ${s.turbidity ?? 3400} RAW | pH: ${s.ph ?? 7.2}`;
        else if (key === 'forest_fire') sensorDetail = `MQ2: ${s.mq2 ?? 450} RAW | Temp: ${s.temperature ?? 28}°C`;
        else if (key === 'air_quality') sensorDetail = `MQ2 Gas: ${s.mq2 ?? 450} RAW`;
        else if (key === 'extreme_heat') sensorDetail = `Temp: ${s.temperature ?? 28}°C`;
        else if (key === 'flood') sensorDetail = `Humidity: ${s.humidity ?? 65}%`;
        else if (key === 'landslide') sensorDetail = `Vibration: ${s.vibration ?? 12} RAW | Soil Moisture: ${s.soil_moisture_raw != null ? s.soil_moisture_raw : 'N/A'} RAW`;

        activeRisks.push({
          id: `${node.id}-${key}`,
          nodeName: node.name,
          area: node.area,
          hazardName: hazard.name,
          icon: hazard.icon,
          risk: hazard.risk,
          distance: dist,
          lastUpdate: node.lastUpdate,
          sensorDetail,
          nodeStatus: node.status,
          overallStatus: node.overallStatus
        });
      }
    });
  });

  // Sort by Severity (descending) first, then Distance (ascending)
  activeRisks.sort((a, b) => {
    const wA = SeverityWeight[a.risk] || 0;
    const wB = SeverityWeight[b.risk] || 0;
    if (wB !== wA) return wB - wA;
    return a.distance - b.distance;
  });

  return (
    <Container>
      <HeaderSection>
        <div>
          <h2>Nearby Hazard Risks & Proximity</h2>
          <p>Filtered by Live Overall Status & Module Telemetry for {selectedArea}</p>
        </div>
      </HeaderSection>

      <RiskList>
        {activeRisks.length > 0 ? (
          activeRisks.map((item) => (
            <RiskItemCard key={item.id} $risk={item.risk}>
              <div className="main-info">
                <div className="icon-box">{item.icon}</div>
                <div>
                  <h3>{item.hazardName}</h3>
                  <p>
                    <span>
                      <MdLocationOn style={{ verticalAlign: 'middle', color: colors.primaryLight }} /> {item.area} ({item.nodeName})
                    </span>
                    <span>
                      <MdAccessTime style={{ verticalAlign: 'middle' }} /> {item.lastUpdate}
                    </span>
                  </p>
                  {item.sensorDetail && (
                    <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginTop: '0.3rem', fontWeight: 600 }}>
                      📊 Telemetry: {item.sensorDetail}
                    </div>
                  )}
                </div>
              </div>

              <div className="meta">
                <span className="dist">📏 {item.distance} km away</span>
                <span className="badge">{item.risk} RISK</span>
              </div>
            </RiskItemCard>
          ))
        ) : (
          <div style={{ background: colors.surface, border: `1px solid ${colors.glassBorder}`, borderRadius: '16px', padding: '3rem 1.5rem', textAlign: 'center', color: colors.textSecondary }}>
            <MdSecurity size={48} style={{ color: colors.success, marginBottom: '1rem' }} />
            <h3 style={{ color: colors.textPrimary, margin: '0 0 0.5rem 0' }}>All Nearby Stations Are Safe</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>No active elevated hazard risks detected around {selectedArea}. All IoT sensor modules report normal parameters.</p>
          </div>
        )}
      </RiskList>
    </Container>
  );
};

export default NearbyRisks;
