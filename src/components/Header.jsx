// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MdNotifications, MdNotificationsOff, MdNotificationsActive } from 'react-icons/md';
import { colors } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { useNotifications } from '../hooks/useNotifications';
import BrandLogo from './BrandLogo';

const HeaderBar = styled.header`
  width: 100%;
  padding: 0.85rem 2rem;
  background: ${colors.headerBg};
  border-bottom: 1px solid ${colors.headerBorder};
  color: ${colors.textPrimary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;

  @media (max-width: 640px) {
    padding: 0.65rem 0.85rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const DeviceStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: ${colors.textSecondary};
  padding: 0.3rem 0.7rem;
  background: ${colors.glass};
  border-radius: 999px;
  border: 1px solid ${colors.glassBorder};

  @media (max-width: 480px) {
    display: none;
  }
`;

const OnlineDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $online }) => ($online ? colors.success : colors.danger)};
  box-shadow: 0 0 8px ${({ $online }) => ($online ? colors.success : colors.danger)};
  display: inline-block;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 640px) {
    gap: 0.4rem;
  }
`;

const UserInfo = styled.span`
  font-size: 0.82rem;
  color: ${colors.textSecondary};

  @media (max-width: 640px) {
    display: none;
  }
`;

const LogoutBtn = styled.button`
  padding: 0.4rem 1rem;
  border: 1px solid ${colors.glassBorder};
  border-radius: 8px;
  background: transparent;
  color: ${colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.surfaceLight};
    color: ${colors.textPrimary};
    border-color: ${colors.primaryLight};
  }
`;

const NotifBtn = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ $active }) => ($active ? colors.primaryLight : colors.glassBorder)};
  background: ${({ $active }) => ($active ? colors.primaryGlow : 'transparent')};
  color: ${({ $active }) => ($active ? colors.primaryLight : colors.textSecondary)};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;

  &:hover {
    background: ${colors.surfaceLight};
    color: ${colors.textPrimary};
    border-color: ${colors.primaryLight};
  }
`;

const NotifTooltip = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 12px;
  padding: 1rem 1.25rem;
  min-width: 240px;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: ${colors.textPrimary};
    font-family: 'Manrope', sans-serif;
  }

  p {
    margin: 0 0 0.75rem 0;
    font-size: 0.8rem;
    color: ${colors.textSecondary};
    line-height: 1.5;
  }

  button {
    width: 100%;
    padding: 0.5rem;
    border-radius: 8px;
    border: none;
    background: ${colors.headerGradient};
    color: #fff;
    font-weight: 700;
    font-size: 0.82rem;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: default; }
  }
`;

const StatusPill = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${({ $status }) =>
    $status === 'granted'
      ? 'rgba(16, 185, 129, 0.15)'
      : $status === 'denied'
      ? 'rgba(239, 68, 68, 0.15)'
      : 'rgba(245, 158, 11, 0.15)'};
  color: ${({ $status }) =>
    $status === 'granted'
      ? colors.success
      : $status === 'denied'
      ? colors.danger
      : colors.warning};
`;

const Header = () => {
  const { user, signOut } = useAuth();
  const { value: device } = useFirebaseValue('/envisence/live/device');
  const { requestPermission, permissionStatus } = useNotifications();
  const isOnline = device?.online ?? false;
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Keep permission state fresh after user interaction
  const [localPerm, setLocalPerm] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  useEffect(() => {
    setLocalPerm(permissionStatus);
  }, [permissionStatus]);

  const handleRequestPermission = async () => {
    setRequesting(true);
    const granted = await requestPermission();
    setLocalPerm(granted ? 'granted' : 'denied');
    setRequesting(false);
    if (granted) setTimeout(() => setShowNotifPanel(false), 1200);
  };

  const notifIcon =
    localPerm === 'granted'
      ? <MdNotificationsActive />
      : localPerm === 'denied'
      ? <MdNotificationsOff />
      : <MdNotifications />;

  return (
    <HeaderBar>
      <LeftSection>
        <BrandLogo size={32} />
        <DeviceStatus>
          <OnlineDot $online={isOnline} />
          ESP32 {isOnline ? 'Online' : 'Offline'}
        </DeviceStatus>
      </LeftSection>

      <RightSection>
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <NotifBtn
            $active={localPerm === 'granted'}
            onClick={() => setShowNotifPanel((v) => !v)}
            title="Push Notifications"
          >
            {notifIcon}
          </NotifBtn>

          {showNotifPanel && (
            <NotifTooltip>
              <h4>🔔 Push Notifications</h4>
              <p>
                Get instant browser alerts when environmental status changes to{' '}
                <strong>WARNING</strong> or <strong>CRITICAL</strong>.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: colors.textSecondary }}>Status:</span>
                <StatusPill $status={localPerm}>
                  {localPerm === 'granted' ? '✅ Enabled' : localPerm === 'denied' ? '❌ Blocked' : '⏳ Not Set'}
                </StatusPill>
              </div>
              <button
                onClick={handleRequestPermission}
                disabled={requesting || localPerm === 'denied' || localPerm === 'granted'}
              >
                {requesting
                  ? 'Requesting…'
                  : localPerm === 'granted'
                  ? '✅ Notifications Active'
                  : localPerm === 'denied'
                  ? '❌ Blocked in Browser Settings'
                  : '🔔 Enable Push Notifications'}
              </button>
              {localPerm === 'denied' && (
                <p style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: colors.danger }}>
                  To enable, click the lock icon in your browser address bar and allow notifications for this site.
                </p>
              )}
            </NotifTooltip>
          )}
        </div>

        {user?.email && <UserInfo>{user.email}</UserInfo>}
        <LogoutBtn onClick={signOut}>Sign Out</LogoutBtn>
      </RightSection>
    </HeaderBar>
  );
};

export default Header;
