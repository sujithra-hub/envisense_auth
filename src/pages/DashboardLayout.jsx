// src/pages/DashboardLayout.jsx
import React from 'react';
import styled from 'styled-components';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { GlobalStyles } from '../theme/GlobalStyles';
import { colors } from '../theme/colors';
import { useSensorSnapshot } from '../hooks/useSensorSnapshot';
import { useNotifications } from '../hooks/useNotifications';

import DashboardHome from './DashboardHome';
import DisasterMonitoring from './DisasterMonitoring';
import EnvironmentalMonitoring from './EnvironmentalMonitoring';
import SensorData from './SensorData';
import AIMLMonitoring from './AIMLMonitoring';
import AlertSystem from './AlertSystem';
import DeviceInfo from './DeviceInfo';
import AuthorityMap from './AuthorityMap';
import NodeManagement from './NodeManagement';
import Analytics from './Analytics';
import IncidentManagement from './IncidentManagement';
import ReportsPage from './ReportsPage';
import AuthoritySettings from './AuthoritySettings';

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const ContentRow = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.75rem 2rem;
  overflow-y: auto;
  background: ${colors.background};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const DashboardLayout = () => {
  // Background services — run for entire authority session
  useSensorSnapshot();
  useNotifications();

  return (
    <LayoutWrapper>
      <GlobalStyles />
      <Header />
      <ContentRow>
        <Sidebar />
        <MainContent>
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="home" element={<DashboardHome />} />
            <Route path="map" element={<AuthorityMap />} />
            <Route path="alerts" element={<AlertSystem />} />
            <Route path="incidents" element={<IncidentManagement />} />
            <Route path="disaster" element={<DisasterMonitoring />} />
            <Route path="environment" element={<EnvironmentalMonitoring />} />
            <Route path="sensors" element={<SensorData />} />
            <Route path="ai" element={<AIMLMonitoring />} />
            <Route path="device" element={<DeviceInfo />} />
            <Route path="nodes" element={<NodeManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<AuthoritySettings />} />
            <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
          </Routes>
        </MainContent>
      </ContentRow>
    </LayoutWrapper>
  );
};

export default DashboardLayout;
