// src/pages/IncidentManagement.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { MdAssignment, MdCheckCircle, MdTimeline, MdPersonAdd, MdFilterList } from 'react-icons/md';
import { colors } from '../theme/colors';

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

const IncidentsTable = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1fr 1fr 1.2fr 1fr;
  padding: 1rem 1.25rem;
  background: ${colors.surfaceLight};
  font-size: 0.8rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1.5fr 1fr 1fr 1.2fr 1fr;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid ${colors.glassBorder};
  align-items: center;
  font-size: 0.88rem;

  &:last-child {
    border-bottom: none;
  }

  .id-tag {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: ${colors.primaryLight};
  }

  .status-badge {
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    width: fit-content;
    background: ${(props) =>
      props.$status === 'ACTIVE'
        ? 'rgba(239, 68, 68, 0.15)'
        : props.$status === 'ACKNOWLEDGED'
        ? 'rgba(245, 158, 11, 0.15)'
        : props.$status === 'INVESTIGATING'
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(16, 185, 129, 0.15)'};
    color: ${(props) =>
      props.$status === 'ACTIVE'
        ? colors.danger
        : props.$status === 'ACKNOWLEDGED'
        ? colors.warning
        : props.$status === 'INVESTIGATING'
        ? '#3b82f6'
        : colors.success};
  }

  select {
    background: ${colors.surfaceLight};
    border: 1px solid ${colors.glassBorder};
    color: ${colors.textPrimary};
    padding: 0.35rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    outline: none;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const SeverityBadge = styled.span`
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: ${(props) =>
    props.$severity === 'CRITICAL'
      ? 'rgba(239, 68, 68, 0.2)'
      : props.$severity === 'HIGH'
      ? 'rgba(249, 115, 22, 0.2)'
      : props.$severity === 'WARNING'
      ? 'rgba(245, 158, 11, 0.2)'
      : 'rgba(16, 185, 129, 0.2)'};
  color: ${(props) =>
    props.$severity === 'CRITICAL'
      ? colors.danger
      : props.$severity === 'HIGH'
      ? '#f97316'
      : props.$severity === 'WARNING'
      ? colors.warning
      : colors.success};
  border: 1px solid
    ${(props) =>
      props.$severity === 'CRITICAL'
        ? 'rgba(239, 68, 68, 0.5)'
        : props.$severity === 'HIGH'
        ? 'rgba(249, 115, 22, 0.5)'
        : props.$severity === 'WARNING'
        ? 'rgba(245, 158, 11, 0.5)'
        : 'rgba(16, 185, 129, 0.5)'};
`;

const TimelineCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  padding: 1.5rem;

  h3 {
    margin: 0 0 1.25rem 0;
    font-family: 'Manrope', sans-serif;
    font-size: 1.1rem;
    color: ${colors.textPrimary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  padding-left: 1.5rem;

  &::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 5px;
    bottom: 5px;
    width: 2px;
    background: ${colors.glassBorder};
  }
`;

const TimelineItem = styled.div`
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${(props) => (props.$active ? colors.primaryLight : colors.textMuted)};
    border: 2px solid ${colors.surface};
  }

  .time {
    font-size: 0.78rem;
    color: ${colors.textMuted};
    font-weight: 600;
  }

  .desc {
    font-size: 0.88rem;
    color: ${colors.textPrimary};
    font-weight: 500;
    margin-top: 0.2rem;
  }
`;

import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { getActiveNodes } from '../services/locationService';

const IncidentManagement = () => {
  const { value: firebaseData } = useFirebaseValue('/envisence');
  const activeNodes = getActiveNodes(firebaseData);
  const [statusOverrides, setStatusOverrides] = useState({});

  // Default initial operational incidents
  const defaultIncidents = [
    {
      id: 'INC-2026-089',
      hazard: 'Air Quality & Toxic Gas Spike',
      node: 'Node 003 (Guindy Industrial Sector)',
      severity: 'CRITICAL',
      status: statusOverrides['INC-2026-089'] || 'ACTIVE',
      team: 'HazMat Rapid Unit 1',
      logged: '10 mins ago'
    },
    {
      id: 'INC-2026-090',
      hazard: 'Drainage Water Accumulation',
      node: 'Node 001 (Velachery Underpass)',
      severity: 'WARNING',
      status: statusOverrides['INC-2026-090'] || 'INVESTIGATING',
      team: 'Hydro-Municipal Team B',
      logged: '25 mins ago'
    }
  ];

  const defaultTimeline = [
    {
      id: 'log-089',
      time: '10 mins ago - Edge Telemetry Gateway',
      desc: 'CRITICAL alert generated: Gas level 2992 PPM at Guindy Industrial (INC-2026-089). HazMat Rapid Unit 1 dispatched.',
      active: true
    },
    {
      id: 'log-090',
      time: '25 mins ago - Water Level Sensor',
      desc: 'WARNING alert generated: Water level elevated at Velachery Underpass (INC-2026-090). Hydro Team B assigned.',
      active: false
    }
  ];

  const incidents = [...defaultIncidents];
  const timeline = [...defaultTimeline];

  activeNodes.forEach(node => {
    Object.entries(node.risks.hazards).forEach(([key, hazard]) => {
      if (hazard.risk !== 'SAFE') {
        const id = `INC-${node.id}-${key.toUpperCase()}`;
        if (!incidents.some(i => i.id === id)) {
          const currentStatus = statusOverrides[id] || (hazard.risk === 'CRITICAL' ? 'ACTIVE' : 'INVESTIGATING');
          incidents.push({
            id,
            hazard: hazard.name,
            node: `${node.name} (${node.area})`,
            severity: hazard.risk,
            status: currentStatus,
            team: 'Auto-Assigned Unit',
            logged: node.lastUpdate
          });

          timeline.unshift({
            id: `${id}-log`,
            time: `${node.lastUpdate} - Edge AI Engine`,
            desc: `${hazard.risk} alert generated for ${hazard.name} at ${node.area} (Status: ${currentStatus}).`,
            active: hazard.risk === 'CRITICAL' || hazard.risk === 'HIGH'
          });
        }
      }
    });
  });

  const updateStatus = (id, newStatus) => {
    setStatusOverrides(prev => ({
      ...prev,
      [id]: newStatus
    }));
  };

  return (
    <Container>
      <Header>
        <div>
          <h2>Operational Incident Management</h2>
          <p>Lifecycle tracking, team assignment, and chronological resolution logging</p>
        </div>
      </Header>

      <IncidentsTable>
        <TableHeader>
          <span>Incident ID</span>
          <span>Hazard & Location</span>
          <span>Severity</span>
          <span>Status</span>
          <span>Assigned Team</span>
          <span>Update Action</span>
        </TableHeader>

        {incidents.map((inc) => (
          <TableRow key={inc.id} $status={inc.status}>
            <span className="id-tag">{inc.id}</span>
            <div>
              <strong>{inc.hazard}</strong>
              <div style={{ fontSize: '0.78rem', color: colors.textMuted }}>{inc.node}</div>
            </div>
            <SeverityBadge $severity={inc.severity}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {inc.severity}
            </SeverityBadge>
            <span className="status-badge">{inc.status}</span>
            <span>{inc.team}</span>
            <select value={inc.status} onChange={(e) => updateStatus(inc.id, e.target.value)}>
              <option value="DETECTED">DETECTED</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </TableRow>
        ))}
      </IncidentsTable>

      <TimelineCard>
        <h3>
          <MdTimeline /> Real-Time Operational Incident Audit Trail
        </h3>
        <TimelineList>
          {timeline.length > 0 ? (
            timeline.map(item => (
              <TimelineItem key={item.id} $active={item.active}>
                <div className="time">{item.time}</div>
                <div className="desc">{item.desc}</div>
              </TimelineItem>
            ))
          ) : (
            <div style={{ color: colors.textMuted, fontSize: '0.9rem' }}>
              No active incidents to display in the audit trail.
            </div>
          )}
        </TimelineList>
      </TimelineCard>
    </Container>
  );
};

export default IncidentManagement;
