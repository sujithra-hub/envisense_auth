// src/pages/EmergencyCenter.jsx
import React from 'react';
import styled from 'styled-components';
import { MdLocalPolice, MdLocalFireDepartment, MdLocalHospital, MdPhoneInTalk, MdShield, MdCall } from 'react-icons/md';
import { colors } from '../theme/colors';

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

const HotlinesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
`;

const HotlineCard = styled.a`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: ${colors.textPrimary};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${colors.primaryLight};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;

    .icon-box {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      background: ${(props) => props.$bg || colors.primaryGlow};
      color: ${(props) => props.$color || colors.primaryLight};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
    }

    h3 {
      margin: 0 0 0.2rem 0;
      font-family: 'Manrope', sans-serif;
      font-size: 1.1rem;
    }

    p {
      margin: 0;
      font-size: 0.8rem;
      color: ${colors.textMuted};
    }
  }

  .call-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${colors.success};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }
`;

const EMERGENCY_SERVICES = [
  { name: 'Police Control Room', number: '100', subtitle: 'Crime & Security Emergency', icon: <MdLocalPolice />, bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  { name: 'Fire & Rescue Service', number: '101', subtitle: 'Fire Outbreaks & Rescue', icon: <MdLocalFireDepartment />, bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  { name: 'Medical Ambulance', number: '108', subtitle: '24/7 Emergency Medical Response', icon: <MdLocalHospital />, bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  { name: 'Disaster Management', number: '1077', subtitle: 'State Disaster Response Force', icon: <MdShield />, bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  { name: 'Women Emergency Helpline', number: '1091', subtitle: 'Safety & Protection Helpline', icon: <MdPhoneInTalk />, bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' },
  { name: 'Municipal Control Room', number: '1913', subtitle: 'Flooding & Municipal Issues', icon: <MdPhoneInTalk />, bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' },
];

const EmergencyCenter = () => {
  return (
    <Container>
      <Header>
        <h2>🚨 Emergency Hotline Services</h2>
        <p>Direct 24/7 toll-free emergency call actions for public citizens</p>
      </Header>

      <HotlinesGrid>
        {EMERGENCY_SERVICES.map((srv) => (
          <HotlineCard key={srv.number} href={`tel:${srv.number}`} $bg={srv.bg} $color={srv.color}>
            <div className="left">
              <div className="icon-box">{srv.icon}</div>
              <div>
                <h3>{srv.name} ({srv.number})</h3>
                <p>{srv.subtitle}</p>
              </div>
            </div>
            <div className="call-btn">
              <MdCall />
            </div>
          </HotlineCard>
        ))}
      </HotlinesGrid>
    </Container>
  );
};

export default EmergencyCenter;
