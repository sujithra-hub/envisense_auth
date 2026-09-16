import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdNotificationsActive, MdFilterList, MdAssignmentInd, MdCheck, MdPsychology } from 'react-icons/md';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';
import RiskEventDetailModal from '../components/RiskEventDetailModal';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  h2 {
    font-family: 'Manrope', sans-serif;
    font-size: 1.4rem;
    margin: 0;
    color: ${colors.textPrimary};
  }

  p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: ${colors.textSecondary};
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  background: ${({ $active }) => ($active ? colors.primaryGlow : colors.surface)};
  color: ${({ $active }) => ($active ? colors.primaryLight : colors.textSecondary)};
  border: 1px solid ${({ $active }) => ($active ? colors.primaryLight : colors.glassBorder)};
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.surfaceLight};
    color: ${colors.textPrimary};
  }
`;

const AlertGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
`;

const AlertCard = styled(Card)`
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 4px solid ${({ status }) =>
    status === 'SAFE'
      ? colors.success
      : status === 'WARNING'
      ? colors.warning
      : colors.danger};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: ${colors.textSecondary};
  margin-bottom: 0.4rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid ${colors.glassBorder};
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  flex: 1;
  min-width: 100px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${colors.glassBorder};
  background: ${colors.surfaceLight};
  color: ${colors.textPrimary};
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.primaryGlow};
    color: ${colors.primaryLight};
    border-color: ${colors.primaryLight};
  }

  &.inspect-btn {
    border-color: ${colors.primaryLight};
    color: ${colors.primaryLight};
    background: ${colors.primaryGlow};
  }
`;

const AlertSystem = () => {
  const { value: fire } = useFirebaseValue('/envisence/live/forest_fire');
  const { value: flood } = useFirebaseValue('/envisence/live/flood');
  const { value: heat } = useFirebaseValue('/envisence/live/extreme_heat');
  const { value: airQuality } = useFirebaseValue('/envisence/live/air_quality');
  const { value: water } = useFirebaseValue('/envisence/live/water_quality');
  const { value: sensors } = useFirebaseValue('/envisence/live/sensors');

  const [lifecycleState, setLifecycleState] = useState({});
  const [filter, setFilter] = useState('ALL');
  const [inspectModule, setInspectModule] = useState(null);

  const s = sensors || {};
  const mq2Val = s.mq2_raw ?? s.mq2 ?? 450;
  const tempVal = s.temperature ?? 28;
  const waterLevelVal = s.water_level ?? 12;
  const tdsVal = s.tds_ppm ?? 180;
  const turbidityStatus = s.turbidity_status || 'Clear';

  // Pure live sensor hazard status calculations
  const airStatus = mq2Val > 800 ? 'CRITICAL' : mq2Val > 600 || airQuality?.ai_prediction === 'RISK' ? 'WARNING' : 'SAFE';
  const floodStatus = waterLevelVal >= 70 ? 'CRITICAL' : waterLevelVal >= 40 || flood?.ai_prediction === 'RISK' ? 'WARNING' : 'SAFE';
  const heatStatus = tempVal >= 40 ? 'CRITICAL' : tempVal >= 35 || heat?.ai_prediction === 'RISK' ? 'WARNING' : 'SAFE';
  const waterStatus = (tdsVal > 500 || turbidityStatus === 'Dirty / High Turbidity' || water?.ai_prediction === 'RISK') ? 'WARNING' : 'SAFE';
  const fireStatus = (s.flame_condition === 'Flame Detected' || (mq2Val > 800 && tempVal > 38)) ? 'CRITICAL' : mq2Val > 600 || tempVal > 35 ? 'WARNING' : 'SAFE';

  const baseAlerts = [
    { id: 'air_quality', name: '🌫️ Air Quality & Toxic Gas', status: airStatus, node: 'NODE_003 (Guindy)', ai: airQuality?.ai_prediction || 'Gas Stream Active', value: `${mq2Val} PPM` },
    { id: 'water_quality', name: '💧 Water Quality & Purity', status: waterStatus, node: 'NODE_001 (Velachery)', ai: water?.ai_prediction || 'Clean Water', value: `TDS: ${tdsVal} PPM (${turbidityStatus})` },
    { id: 'flood', name: '🌊 Flood Risk', status: floodStatus, node: 'NODE_001 (Velachery)', ai: flood?.ai_prediction || 'Normal Runoff', value: `Level: ${waterLevelVal}%` },
    { id: 'forest_fire', name: '🔥 Forest Fire', status: fireStatus, node: 'NODE_002 (Perimeter)', ai: fire?.ai_prediction || 'Thermal Normal', value: `Gas: ${mq2Val} PPM | Temp: ${tempVal}°C` },
    { id: 'extreme_heat', name: '🌡️ Extreme Heat Index', status: heatStatus, node: 'NODE_001 (Urban Core)', ai: heat?.ai_prediction || 'Comfortable', value: `${tempVal} °C` },
  ];

  const handleAction = (id, newLifecycle) => {
    setLifecycleState((prev) => ({ ...prev, [id]: newLifecycle }));
  };

  const formattedAlerts = baseAlerts.map((a) => ({
    ...a,
    lifecycle: lifecycleState[a.id] || (a.status === 'SAFE' ? 'RESOLVED' : 'ACTIVE'),
  }));

  const filtered = formattedAlerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.lifecycle === filter;
  });

  return (
    <Container>
      <Header>
        <div>
          <h2>Authority Alert Management</h2>
          <p>Real-time threat monitoring and response workflow dispatcher</p>
        </div>
        <FilterGroup>
          <FilterBtn $active={filter === 'ALL'} onClick={() => setFilter('ALL')}>All Alerts</FilterBtn>
          <FilterBtn $active={filter === 'ACTIVE'} onClick={() => setFilter('ACTIVE')}>🚨 Active</FilterBtn>
          <FilterBtn $active={filter === 'ACKNOWLEDGED'} onClick={() => setFilter('ACKNOWLEDGED')}>👁️ Acknowledged</FilterBtn>
          <FilterBtn $active={filter === 'RESOLVED'} onClick={() => setFilter('RESOLVED')}>✅ Resolved</FilterBtn>
        </FilterGroup>
      </Header>

      <AlertGrid>
        {filtered.map((alert) => (
          <AlertCard key={alert.id} status={alert.status}>
            <div>
              <CardHeader>
                <CardTitle>{alert.name}</CardTitle>
                <StatusBadge status={alert.status}>{alert.status}</StatusBadge>
              </CardHeader>

              <DetailRow>
                <span>Monitoring Node</span>
                <strong style={{ color: colors.primaryLight }}>{alert.node}</strong>
              </DetailRow>

              <DetailRow>
                <span>Trigger Metric</span>
                <strong style={{ color: colors.textPrimary }}>{alert.value}</strong>
              </DetailRow>

              {alert.ai && (
                <DetailRow>
                  <span>AI Insight</span>
                  <span style={{ color: colors.accentYellow }}>{alert.ai}</span>
                </DetailRow>
              )}

              <DetailRow style={{ marginTop: '0.4rem' }}>
                <span>Workflow State</span>
                <strong style={{ color: alert.lifecycle === 'RESOLVED' ? colors.success : colors.warning }}>
                  {alert.lifecycle}
                </strong>
              </DetailRow>
            </div>

            <ActionRow>
              <ActionBtn className="inspect-btn" onClick={() => setInspectModule(alert.id)}>
                <MdPsychology /> Inspect AI
              </ActionBtn>
              {alert.lifecycle !== 'ACKNOWLEDGED' && alert.lifecycle !== 'RESOLVED' && (
                <ActionBtn onClick={() => handleAction(alert.id, 'ACKNOWLEDGED')}>
                  <MdCheck /> Ack
                </ActionBtn>
              )}
              {alert.lifecycle !== 'RESOLVED' && (
                <ActionBtn onClick={() => handleAction(alert.id, 'RESOLVED')}>
                  <MdCheckCircle /> Resolve
                </ActionBtn>
              )}
            </ActionRow>
          </AlertCard>
        ))}
      </AlertGrid>

      {/* 7-Section Explainable Risk Intelligence Inspection Modal */}
      <RiskEventDetailModal
        isOpen={Boolean(inspectModule)}
        onClose={() => setInspectModule(null)}
        moduleKey={inspectModule || 'flood'}
        locationName="Velachery • Station Alpha"
      />
    </Container>
  );
};

export default AlertSystem;
