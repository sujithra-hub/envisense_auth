import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Grid from '../components/Grid';
import StatusBadge from '../components/StatusBadge';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';
import RiskEventDetailModal from '../components/RiskEventDetailModal';
import { 
  MdSensors, MdWarning, MdError, MdCheckCircle, MdRouter, 
  MdSpeed, MdShield, MdArrowForward, MdDvr, MdReportProblem
} from 'react-icons/md';

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const KpiCard = styled(Card)`
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .label {
    font-size: 0.75rem;
    font-weight: 700;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .val {
    font-size: 1.7rem;
    font-weight: 800;
    font-family: 'Manrope', sans-serif;
    color: ${colors.textPrimary};
    margin-top: 0.2rem;
  }

  .icon-box {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    background: ${(props) => props.$bg || colors.primaryGlow};
    color: ${(props) => props.$color || colors.primaryLight};
  }
`;

const SystemHealthCard = styled(Card)`
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.5rem;

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.05rem;
    font-family: 'Manrope', sans-serif;
    color: ${colors.textPrimary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .health-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .health-item {
    background: ${colors.surfaceLight};
    border: 1px solid ${colors.glassBorder};
    padding: 0.85rem 1rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    .name {
      font-size: 0.78rem;
      color: ${colors.textMuted};
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .status-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 1rem;
      color: ${colors.textPrimary};
    }

    .bar {
      height: 4px;
      border-radius: 999px;
      background: ${colors.surfaceMid};
      overflow: hidden;

      .fill {
        height: 100%;
        background: ${colors.primaryLight};
        border-radius: 999px;
      }
    }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0 1rem;

  h3 {
    margin: 0;
    font-family: 'Manrope', sans-serif;
    font-size: 1.15rem;
    color: ${colors.textPrimary};
  }
`;

const PriorityEventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
`;

const PriorityEventCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${(props) => (props.$critical ? colors.danger : colors.warning)};
  border-radius: 14px;
  padding: 1.1rem 1.3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;

    .sev-badge {
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
      background: ${(props) => (props.$critical ? colors.dangerBg : colors.warningBg)};
      color: ${(props) => (props.$critical ? colors.danger : colors.warning)};
    }

    .info {
      h4 {
        margin: 0 0 0.2rem 0;
        font-size: 1rem;
        color: ${colors.textPrimary};
      }

      p {
        margin: 0;
        font-size: 0.82rem;
        color: ${colors.textSecondary};
      }
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 1rem;

    .confidence {
      text-align: right;
      font-size: 0.8rem;
      color: ${colors.textMuted};

      strong {
        display: block;
        color: ${colors.success};
        font-size: 0.9rem;
      }
    }

    button {
      background: ${colors.surfaceLight};
      border: 1px solid ${colors.glassBorder};
      color: ${colors.textPrimary};
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: ${colors.primaryLight};
        color: ${colors.primaryLight};
      }
    }
  }
`;

const QuickActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
`;

const ActionBtn = styled(Link)`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 12px;
  padding: 0.9rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: ${colors.textPrimary};
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.primaryLight};
    color: ${colors.primaryLight};
    background: ${colors.primaryGlow};
  }
`;

const StatusCard = styled(Card)`
  text-align: left;
  border: 1px solid ${({ $status }) =>
    $status === 'SAFE'
      ? 'hsla(152, 70%, 48%, 0.25)'
      : $status === 'WARNING'
      ? 'hsla(45, 95%, 55%, 0.25)'
      : 'hsla(0, 75%, 58%, 0.25)'};
  margin-bottom: 1.5rem;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const DeviceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${colors.glassBorder};
  font-size: 0.82rem;
  color: ${colors.textMuted};
`;

const OnlineDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $online }) => ($online ? colors.success : colors.danger)};
  box-shadow: 0 0 8px ${({ $online }) => ($online ? colors.success : colors.danger)};
  display: inline-block;
`;

const DashboardHome = () => {
  const { value: overallStatus, loading: statusLoading } = useFirebaseValue('/envisence/live/overall_status');
  const { value: sensors }                               = useFirebaseValue('/envisence/live/sensors');
  const { value: device }                                = useFirebaseValue('/envisence/live/device');
  const [modalOpen, setModalOpen] = React.useState(false);

  const status = typeof overallStatus === 'string' ? overallStatus : 'SAFE';

  return (
    <div>
      <PageTitle>
        <span>Command Center Overview</span>
        <span style={{ fontSize: '0.85rem', color: colors.textMuted, fontWeight: 500 }}>
          Real-time Environmental Operational Control
        </span>
      </PageTitle>

      {/* Top Level KPIs */}
      <KpiGrid>
        <KpiCard>
          <div>
            <div className="label">Nodes Online</div>
            <div className="val">{device?.online !== false ? '1' : '0'} <span style={{ fontSize: '0.9rem', color: colors.textMuted }}>/ 1</span></div>
          </div>
          <div className="icon-box" $bg="rgba(52, 199, 89, 0.12)" $color={colors.success}>
            <MdSensors />
          </div>
        </KpiCard>

        <KpiCard>
          <div>
            <div className="label">Active Risks</div>
            <div className="val">{status === 'SAFE' ? '0' : '1'}</div>
          </div>
          <div className="icon-box" $bg="rgba(255, 204, 0, 0.12)" $color={colors.warning}>
            <MdWarning />
          </div>
        </KpiCard>

        <KpiCard>
          <div>
            <div className="label">Critical Risks</div>
            <div className="val">{status === 'CRITICAL' ? '1' : '0'}</div>
          </div>
          <div className="icon-box" $bg="rgba(255, 59, 48, 0.12)" $color={colors.danger}>
            <MdError />
          </div>
        </KpiCard>

        <KpiCard>
          <div>
            <div className="label">Offline Nodes</div>
            <div className="val">{device?.online === false ? '1' : '0'}</div>
          </div>
          <div className="icon-box" $bg="rgba(0, 122, 255, 0.12)" $color={colors.primaryLight}>
            <MdRouter />
          </div>
        </KpiCard>
      </KpiGrid>

      {/* System Health Breakdown Card */}
      <SystemHealthCard>
        <h3>
          <MdShield style={{ color: colors.primaryLight }} /> System Trust & Hardware Health
        </h3>
        <div className="health-grid">
          <div className="health-item">
            <div className="name"><MdRouter /> Network Health</div>
            <div className="status-line">96% <span>Good</span></div>
            <div className="bar"><div className="fill" style={{ width: '96%' }} /></div>
          </div>

          <div className="health-item">
            <div className="name"><MdSensors /> Sensor Health</div>
            <div className="status-line">93% <span>Operational</span></div>
            <div className="bar"><div className="fill" style={{ width: '93%' }} /></div>
          </div>

          <div className="health-item">
            <div className="name"><MdSpeed /> Data Quality</div>
            <div className="status-line">95% <span>High Quality</span></div>
            <div className="bar"><div className="fill" style={{ width: '95%' }} /></div>
          </div>

          <div className="health-item">
            <div className="name"><MdDvr /> Gateway Status</div>
            <div className="status-line">Active <span>1/1 Gateways</span></div>
            <div className="bar"><div className="fill" style={{ width: '100%' }} /></div>
          </div>
        </div>
      </SystemHealthCard>

      {/* Overall Status Banner */}
      <StatusCard $status={status}>
        <StatusHeader>
          <h3>Active Multi-Hazard Environmental Status</h3>
          <StatusBadge status={status}>{status}</StatusBadge>
        </StatusHeader>
        <DeviceRow>
          <OnlineDot $online={device?.online ?? true} />
          <span>ESP32 Hardware Node {device?.online ?? true ? 'Online' : 'Offline'}</span>
          <span style={{ color: colors.textMuted }}>•</span>
          <span>Temp: {sensors?.temperature ?? 28}°C</span>
          <span style={{ color: colors.textMuted }}>•</span>
          <span>MQ2 Gas: {sensors?.mq2 ?? 450} PPM</span>
        </DeviceRow>
      </StatusCard>

      {/* Priority Events Section */}
      <SectionHeader>
        <h3>Priority Risk Events</h3>
        <span style={{ fontSize: '0.82rem', color: colors.textMuted }}>Explainable AI & Trust-Aware Reasoning</span>
      </SectionHeader>

      <PriorityEventsList>
        {status !== 'SAFE' ? (
          <PriorityEventCard $critical={status === 'CRITICAL'}>
            <div className="left">
              <span className="sev-badge">{status}</span>
              <div className="info">
                <h4>Environmental Hazard Anomaly — Station Alpha</h4>
                <p>Location: Velachery Zone • Trend: Rapidly Rising • Detected: Just Now</p>
              </div>
            </div>
            <div className="right">
              <div className="confidence">
                Confidence: <strong>HIGH (94%)</strong>
                <span>Multiple sensors agree</span>
              </div>
              <button onClick={() => setModalOpen(true)}>Investigate Risk</button>
            </div>
          </PriorityEventCard>
        ) : (
          <PriorityEventCard $critical={false} style={{ borderColor: colors.glassBorder }}>
            <div className="left">
              <span className="sev-badge" style={{ background: colors.successBg, color: colors.success }}>NORMAL</span>
              <div className="info">
                <h4>No Critical Priority Risk Events Active</h4>
                <p>All monitored environmental parameters are within safe baseline limits.</p>
              </div>
            </div>
            <div className="right">
              <div className="confidence">
                Sensor Agreement: <strong style={{ color: colors.success }}>100%</strong>
              </div>
            </div>
          </PriorityEventCard>
        )}
      </PriorityEventsList>

      {/* Quick Actions */}
      <SectionHeader>
        <h3>Quick Operations & Navigation</h3>
      </SectionHeader>

      <QuickActionGrid>
        <ActionBtn to="/dashboard/map">
          <span>🗺️ Live Risk Map</span>
          <MdArrowForward />
        </ActionBtn>
        <ActionBtn to="/dashboard/incidents">
          <span>📋 Active Incidents</span>
          <MdArrowForward />
        </ActionBtn>
        <ActionBtn to="/dashboard/nodes">
          <span>📡 Node Network</span>
          <MdArrowForward />
        </ActionBtn>
        <ActionBtn to="/dashboard/analytics">
          <span>📊 System Analytics</span>
          <MdArrowForward />
        </ActionBtn>
      </QuickActionGrid>
      {/* Explainable Risk Detail Inspection Modal */}
      <RiskEventDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        moduleKey={status === 'CRITICAL' ? 'forest_fire' : 'flood'}
        locationName="Velachery • Drainage Underpass"
      />
    </div>
  );
};

export default DashboardHome;
