// src/components/Sidebar.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import { colors } from '../theme/colors';
import {
  MdDashboard,
  MdMap,
  MdAssignment,
  MdSensors,
  MdBarChart,
  MdExpandMore,
  MdChevronRight,
  MdNotifications,
  MdDeviceHub,
  MdInsights,
  MdWarning,
  MdEco,
  MdList,
  MdSummarize,
  MdSettings,
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

const MainCategoryGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: ${(props) => (props.$active ? colors.sidebarActiveText : colors.textPrimary)};
  background: ${(props) => (props.$active ? colors.sidebarActiveBg : 'transparent')};
  font-weight: ${(props) => (props.$active ? '700' : '600')};
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  .left {
    display: flex;
    align-items: center;
    gap: 0.65rem;

    svg {
      font-size: 1.15rem;
      flex-shrink: 0;
      color: ${(props) => (props.$active ? colors.sidebarActiveText : colors.textSecondary)};
    }
  }

  .toggle-icon {
    font-size: 1.1rem;
    color: ${colors.textMuted};
  }

  &:hover {
    background: ${colors.sidebarActiveBg};
    color: ${colors.sidebarActiveText};
  }
`;

const PrimaryLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: ${colors.textPrimary};
  text-decoration: none;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;

  svg {
    font-size: 1.15rem;
    flex-shrink: 0;
    color: ${colors.textSecondary};
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
    background: ${colors.sidebarActiveBg};
    color: ${colors.sidebarActiveText};
  }
`;

const SubMenu = styled.div`
  display: ${(props) => (props.$open ? 'flex' : 'none')};
  flex-direction: column;
  gap: 0.15rem;
  padding-left: 1.5rem;
  margin-top: 0.15rem;

  @media (max-width: 768px) {
    display: ${(props) => (props.$open ? 'flex' : 'none')};
    flex-direction: row;
    padding-left: 0.25rem;
    flex-shrink: 0;
  }
`;

const SubLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  color: ${colors.textSecondary};
  text-decoration: none;
  font-weight: 500;
  font-size: 0.82rem;
  transition: all 0.2s ease;

  svg {
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  &.active {
    color: ${colors.sidebarActiveText};
    background: ${colors.sidebarActiveBg};
    font-weight: 700;
  }

  &:hover:not(.active) {
    color: ${colors.textPrimary};
    background: ${colors.surfaceLight};
  }
`;

const Sidebar = () => {
  const location = useLocation();

  // Accordion open states for the 5 locked pillars
  const [openCmd, setOpenCmd] = useState(true);
  const [openNet, setOpenNet] = useState(
    location.pathname.includes('/nodes') ||
    location.pathname.includes('/sensors') ||
    location.pathname.includes('/device')
  );
  const [openAnalytics, setOpenAnalytics] = useState(
    location.pathname.includes('/analytics') ||
    location.pathname.includes('/ai') ||
    location.pathname.includes('/disaster') ||
    location.pathname.includes('/environment') ||
    location.pathname.includes('/reports') ||
    location.pathname.includes('/settings')
  );

  const isCmdActive = location.pathname === '/dashboard' || location.pathname === '/dashboard/home' || location.pathname === '/dashboard/alerts';
  const isNetActive = location.pathname.includes('/nodes') || location.pathname.includes('/sensors') || location.pathname.includes('/device');
  const isAnalyticsActive = location.pathname.includes('/analytics') || location.pathname.includes('/ai') || location.pathname.includes('/disaster') || location.pathname.includes('/environment') || location.pathname.includes('/reports') || location.pathname.includes('/settings');

  return (
    <SidebarContainer>
      {/* 1. COMMAND CENTER */}
      <MainCategoryGroup>
        <CategoryHeader $active={isCmdActive} onClick={() => setOpenCmd(!openCmd)}>
          <div className="left">
            <MdDashboard />
            <span>COMMAND CENTER</span>
          </div>
          <span className="toggle-icon">
            {openCmd ? <MdExpandMore /> : <MdChevronRight />}
          </span>
        </CategoryHeader>
        <SubMenu $open={openCmd}>
          <SubLink to="/dashboard/home" end>
            <MdDashboard /> Overview
          </SubLink>
          <SubLink to="/dashboard/alerts">
            <MdNotifications /> Alerts Lifecycle
          </SubLink>
        </SubMenu>
      </MainCategoryGroup>

      {/* 2. RISK MAP */}
      <PrimaryLink to="/dashboard/map">
        <MdMap />
        <span>RISK MAP</span>
      </PrimaryLink>

      {/* 3. INCIDENTS */}
      <PrimaryLink to="/dashboard/incidents">
        <MdAssignment />
        <span>INCIDENTS</span>
      </PrimaryLink>

      {/* 4. NETWORK */}
      <MainCategoryGroup>
        <CategoryHeader $active={isNetActive} onClick={() => setOpenNet(!openNet)}>
          <div className="left">
            <MdSensors />
            <span>NETWORK</span>
          </div>
          <span className="toggle-icon">
            {openNet ? <MdExpandMore /> : <MdChevronRight />}
          </span>
        </CategoryHeader>
        <SubMenu $open={openNet}>
          <SubLink to="/dashboard/nodes">
            <MdList /> Node Management
          </SubLink>
          <SubLink to="/dashboard/sensors">
            <MdSensors /> Live Sensors Telemetry
          </SubLink>
          <SubLink to="/dashboard/device">
            <MdDeviceHub /> Device Health
          </SubLink>
        </SubMenu>
      </MainCategoryGroup>

      {/* 5. ANALYTICS */}
      <MainCategoryGroup>
        <CategoryHeader $active={isAnalyticsActive} onClick={() => setOpenAnalytics(!openAnalytics)}>
          <div className="left">
            <MdBarChart />
            <span>ANALYTICS</span>
          </div>
          <span className="toggle-icon">
            {openAnalytics ? <MdExpandMore /> : <MdChevronRight />}
          </span>
        </CategoryHeader>
        <SubMenu $open={openAnalytics}>
          <SubLink to="/dashboard/analytics">
            <MdBarChart /> System Analytics
          </SubLink>
          <SubLink to="/dashboard/ai">
            <MdInsights /> AI / ML Engine
          </SubLink>
          <SubLink to="/dashboard/disaster">
            <MdWarning /> Disaster Monitor
          </SubLink>
          <SubLink to="/dashboard/environment">
            <MdEco /> Environment Metrics
          </SubLink>
          <SubLink to="/dashboard/reports">
            <MdSummarize /> Shift Reports
          </SubLink>
          <SubLink to="/dashboard/settings">
            <MdSettings /> System Settings
          </SubLink>
        </SubMenu>
      </MainCategoryGroup>
    </SidebarContainer>
  );
};

export default Sidebar;
