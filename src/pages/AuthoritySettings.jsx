// src/pages/AuthoritySettings.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { MdSettings, MdTune, MdShield, MdCheck } from 'react-icons/md';
import { colors } from '../theme/colors';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 850px;
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

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  h3 {
    margin: 0;
    font-family: 'Manrope', sans-serif;
    font-size: 1.1rem;
    color: ${colors.textPrimary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid ${colors.glassBorder};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${colors.textPrimary};

    span {
      display: block;
      font-size: 0.78rem;
      font-weight: 400;
      color: ${colors.textMuted};
    }
  }

  input[type='number'] {
    width: 100px;
    background: ${colors.surfaceLight};
    border: 1px solid ${colors.glassBorder};
    color: ${colors.textPrimary};
    padding: 0.4rem 0.65rem;
    border-radius: 8px;
    outline: none;
  }
`;

const SaveBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  border-radius: 10px;
  border: none;
  background: ${colors.headerGradient};
  color: #fff;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  width: fit-content;
`;

const AuthoritySettings = () => {
  const [mq2Threshold, setMq2Threshold] = useState(() => {
    const saved = localStorage.getItem('envisense_mq2_thresh');
    return saved ? Number(saved) : 3051;
  });
  const [tempThreshold, setTempThreshold] = useState(() => {
    const saved = localStorage.getItem('envisense_temp_thresh');
    return saved ? Number(saved) : 39;
  });
  const [vibrationThreshold, setVibrationThreshold] = useState(() => {
    const saved = localStorage.getItem('envisense_vib_thresh');
    return saved ? Number(saved) : 70;
  });
  const [syncInterval, setSyncInterval] = useState(() => {
    const saved = localStorage.getItem('envisense_sync_int');
    return saved ? Number(saved) : 5;
  });
  const [emergencyPhone, setEmergencyPhone] = useState(() => {
    const saved = localStorage.getItem('envisense_emg_phone');
    return saved || '112';
  });
  const [autoSiren, setAutoSiren] = useState(() => {
    const saved = localStorage.getItem('envisense_auto_siren');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = () => {
    localStorage.setItem('envisense_mq2_thresh', mq2Threshold);
    localStorage.setItem('envisense_temp_thresh', tempThreshold);
    localStorage.setItem('envisense_vib_thresh', vibrationThreshold);
    localStorage.setItem('envisense_sync_int', syncInterval);
    localStorage.setItem('envisense_emg_phone', emergencyPhone);
    localStorage.setItem('envisense_auto_siren', JSON.stringify(autoSiren));

    // Notify whole app of settings change
    window.dispatchEvent(new Event('storage'));
    showToast('System thresholds & configurations saved! Applied live across system.');
  };

  const handleResetDefaults = () => {
    setMq2Threshold(3051);
    setTempThreshold(39);
    setVibrationThreshold(70);
    setSyncInterval(5);
    setEmergencyPhone('112');
    setAutoSiren(true);

    localStorage.setItem('envisense_mq2_thresh', 3051);
    localStorage.setItem('envisense_temp_thresh', 39);
    localStorage.setItem('envisense_vib_thresh', 70);
    localStorage.setItem('envisense_sync_int', 5);
    localStorage.setItem('envisense_emg_phone', '112');
    localStorage.setItem('envisense_auto_siren', 'true');

    window.dispatchEvent(new Event('storage'));
    showToast('Reset system configurations back to factory defaults!');
  };

  const testSirenSound = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance("System Alert Test. Audio Siren and Broadcaster check initiated.");
      window.speechSynthesis.speak(msg);
    }
    showToast('Audio Siren & Voice Broadcaster test initiated!');
  };

  const testDispatchCall = () => {
    window.open(`tel:${emergencyPhone}`);
    showToast(`Test call initiated to Emergency Helpline: ${emergencyPhone}`);
  };

  return (
    <Container>
      <Header>
        <h2>Command Center System Thresholds & Configuration</h2>
        <p>Configure automated Edge AI hazard alert triggering thresholds, system telemetry sync, and emergency dispatch</p>
      </Header>

      {toastMsg && (
        <div style={{ background: colors.success, color: '#fff', padding: '0.75rem 1.2rem', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
          <MdCheck size={20} /> {toastMsg}
        </div>
      )}

      <Card>
        <h3>
          <MdTune /> Automated Alert Trigger Levels
        </h3>

        <SettingRow>
          <label>
            MQ2 Gas Critical Threshold (RAW ADC)
            <span>Automatic Fire & Smoke alert is generated at or above this raw value</span>
          </label>
          <input type="number" value={mq2Threshold} onChange={(e) => setMq2Threshold(Number(e.target.value))} />
        </SettingRow>

        <SettingRow>
          <label>
            Ambient Heatwave Threshold (°C)
            <span>Automatic Extreme Heat warning is generated at or above this value</span>
          </label>
          <input type="number" value={tempThreshold} onChange={(e) => setTempThreshold(Number(e.target.value))} />
        </SettingRow>

        <SettingRow>
          <label>
            Seismic Vibration Threshold (G / m/s²)
            <span>Automatic Landslide risk notice is generated at or above this value</span>
          </label>
          <input type="number" value={vibrationThreshold} onChange={(e) => setVibrationThreshold(Number(e.target.value))} />
        </SettingRow>
      </Card>

      <Card>
        <h3>
          <MdShield /> Dispatch & System Telemetry Controls
        </h3>

        <SettingRow>
          <label>
            Telemetry Sync Refresh Rate (Seconds)
            <span>Frequency of pulling hardware telemetry updates</span>
          </label>
          <input type="number" value={syncInterval} min="1" max="60" onChange={(e) => setSyncInterval(Number(e.target.value))} />
        </SettingRow>

        <SettingRow>
          <label>
            Primary Emergency Hotline Number
            <span>Direct helpline number for emergency dispatch callouts</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="text" style={{ width: '110px', background: colors.surfaceLight, border: `1px solid ${colors.glassBorder}`, color: colors.textPrimary, padding: '0.4rem 0.65rem', borderRadius: '8px', outline: 'none' }} value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
            <button type="button" onClick={testDispatchCall} style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: colors.surfaceLight, border: `1px solid ${colors.glassBorder}`, color: colors.primaryLight, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Test Call</button>
          </div>
        </SettingRow>

        <SettingRow>
          <label>
            Automated Siren Broadcaster
            <span>Trigger audio siren during CRITICAL hazard alerts</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              type="button"
              onClick={() => setAutoSiren(!autoSiren)} 
              style={{ 
                background: autoSiren ? colors.success : colors.surfaceLight, 
                border: 'none', 
                color: '#fff', 
                padding: '0.4rem 1rem', 
                borderRadius: '999px', 
                fontWeight: 700, 
                cursor: 'pointer' 
              }}
            >
              {autoSiren ? 'ENABLED' : 'DISABLED'}
            </button>
            <button type="button" onClick={testSirenSound} style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', background: colors.surfaceLight, border: `1px solid ${colors.glassBorder}`, color: colors.warning, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Test Siren</button>
          </div>
        </SettingRow>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <SaveBtn onClick={handleSave}>
            <MdCheck /> Save System Configurations
          </SaveBtn>
          <button type="button" onClick={handleResetDefaults} style={{ padding: '0.65rem 1.2rem', borderRadius: '10px', background: colors.surfaceLight, border: `1px solid ${colors.glassBorder}`, color: colors.textSecondary, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
            Reset Factory Defaults
          </button>
        </div>
      </Card>
    </Container>
  );
};

export default AuthoritySettings;
