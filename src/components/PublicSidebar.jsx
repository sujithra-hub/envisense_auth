// src/components/PublicSidebar.jsx
import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { colors } from '../theme/colors';
import {
  MdHome,
  MdLocationOn,
  MdMap,
  MdWarning,
  MdNotifications,
  MdEco,
  MdSecurity,
  MdPhoneInTalk,
  MdPerson,
  MdShield,
} from 'react-icons/md';

const SidebarContainer = styled.nav`
  width: 240px;
  min-width: 240px;
  background: ${colors.sidebarBg};
  border-right: 1px solid ${colors.glassBorder};
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  overflow-y: auto;
  height: calc(100vh - 56px);

  @media (max-width: 768px) {
    width: 100%;
    min-width: unset;
    height: auto;
    flex-direction: row;
    padding: 0.5rem;
    border-right: none;
    border-bottom: 1px solid ${colors.glassBorder};
    overflow-x: auto;
  }
`;

const SectionTitle = styled.div`
  margin: 0.75rem 0 0.35rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-left: 0.85rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: ${colors.textSecondary};
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;

  svg {
    font-size: 1.15rem;
    flex-shrink: 0;
    transition: color 0.2s ease;
  }

  &.active {
    background: ${colors.sidebarActiveBg};
    color: ${colors.sidebarActiveText};
    font-weight: 700;

    svg {
      color: ${colors.sidebarActiveText};
    }

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      border-radius: 0 3px 3px 0;
      background: ${colors.sidebarActiveBar};
    }
  }

  &:hover:not(.active) {
    background: #e1ebe8;
    color: #285153;
  }

  @media (max-width: 768px) {
    padding: 0.45rem 0.75rem;
    font-size: 0.78rem;

    &.active::before {
      display: none;
    }
  }
`;

const PublicSidebar = () => {
  return (
    <SidebarContainer>
      <SectionTitle>Public Safety Portal</SectionTitle>
      <StyledLink to="/public" end>
        <MdLocationOn /> Area Status
      </StyledLink>
      <StyledLink to="/public/profile">
        <MdPerson /> My Safety Profile
      </StyledLink>
      <StyledLink to="/public/map">
        <MdMap /> Live Risk Map
      </StyledLink>
      <StyledLink to="/public/risks">
        <MdWarning /> Nearby Risks
      </StyledLink>

      <SectionTitle>Real-Time Intelligence</SectionTitle>
      <StyledLink to="/public/alerts">
        <MdNotifications /> Alert Center
      </StyledLink>
      <StyledLink to="/public/status">
        <MdEco /> Environment Metrics
      </StyledLink>

      <SectionTitle>Preparedness & Help</SectionTitle>
      <StyledLink to="/public/safety">
        <MdSecurity /> Safety Guides
      </StyledLink>
      <StyledLink to="/public/emergency">
        <MdPhoneInTalk /> Emergency Contacts
      </StyledLink>
    </SidebarContainer>
  );
};

export default PublicSidebar;
