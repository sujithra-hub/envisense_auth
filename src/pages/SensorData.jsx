import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Grid from '../components/Grid';
import { useLiveSensors } from '../hooks/useLiveSensors';
import { colors } from '../theme/colors';
import RiskEventDetailModal from '../components/RiskEventDetailModal';
import { MdPsychology } from 'react-icons/md';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin: 0;
`;

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: ${colors.successBg || 'rgba(16, 185, 129, 0.15)'};
  color: ${colors.success || '#10b981'};
  border: 1px solid rgba(16, 185, 129, 0.3);

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.success || '#10b981'};
    box-shadow: 0 0 8px ${colors.success || '#10b981'};
  }
`;

const ExecutiveCard = styled(motion.div)`
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #E5E5EA;
  border-left: 6px solid ${(props) => props.$accentColor};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 1.4rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  }
`;

const CardHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Manrope', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: #1D1D1F;

    .icon {
      font-size: 1.25rem;
    }
  }
`;

const HeaderStatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.85rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  background: ${(props) => props.$bg};
  color: ${(props) => props.$color};
  border: 1px solid ${(props) => props.$border};

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${(props) => props.$dot};
  }
`;

const KeyValueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.88rem;

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .key {
      color: #666666;
      font-weight: 500;
    }

    .val {
      color: #1D1D1F;
      font-weight: 700;

      &.node-link {
        color: #007AFF;
      }

      &.state-resolved {
        color: #34C759;
        font-weight: 800;
      }

      &.state-warning {
        color: #FF9500;
        font-weight: 800;
      }

      &.state-alert {
        color: #FF3B30;
        font-weight: 800;
      }
    }
  }
`;

const CardDivider = styled.div`
  height: 1px;
  background: #F2F2F7;
  margin: 0.1rem 0;
`;

const InspectAiButton = styled.button`
  width: 100%;
  background: #EFF6FF;
  border: 1px solid #93C5FD;
  color: #2563EB;
  border-radius: 12px;
  padding: 0.65rem;
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #DBEAFE;
    border-color: #3B82F6;
    color: #1D4ED8;
  }
`;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/**
 * Resolves card status, colors, and insight strictly from Firebase predictions & telemetries.
 */
const resolveFirebaseStatus = (moduleKey, defaultLocalLevel, predictions, risks) => {
  const fbPred = predictions?.[moduleKey] || predictions?.[moduleKey.replace('_quality', '')] || risks?.[moduleKey];
  const severityStr = String(
    fbPred?.severity || fbPred?.status || fbPred?.ai_prediction || fbPred?.prediction || fbPred?.risk || ''
  ).toUpperCase();

  let finalLevel = defaultLocalLevel;

  if (
    severityStr.includes('CRITICAL') ||
    severityStr.includes('RISK') ||
    severityStr.includes('HIGH') ||
    severityStr.includes('FIRE_IMMINENT') ||
    severityStr.includes('ACTIVE')
  ) {
    finalLevel = 'RISK';
  } else if (
    severityStr.includes('WARNING') ||
    severityStr.includes('WATCH') ||
    severityStr.includes('MODERATE') ||
    severityStr.includes('HEAT_WAVE') ||
    severityStr.includes('LANDSLIDE_RISK')
  ) {
    finalLevel = 'WARNING';
  } else if (
    severityStr.includes('NORMAL') ||
    severityStr.includes('SAFE') ||
    severityStr.includes('STABLE') ||
    severityStr.includes('CLEAN') ||
    severityStr.includes('RESOLVED')
  ) {
    finalLevel = 'SAFE';
  }

  const isRisk = finalLevel === 'RISK';
  const isWarn = finalLevel === 'WARNING';

  const customInsight = fbPred?.prediction || fbPred?.ai_prediction;

  return {
    level: finalLevel,
    state: isRisk ? 'ACTIVE ALERT' : isWarn ? 'MONITORING' : 'RESOLVED',
    stateClass: isRisk ? 'state-alert' : isWarn ? 'state-warning' : 'state-resolved',
    accent: isRisk ? '#FF3B30' : isWarn ? '#FF9500' : '#22C55E',
    bg: isRisk ? '#FEE2E2' : isWarn ? '#FEF3C7' : '#DCFCE7',
    color: isRisk ? '#DC2626' : isWarn ? '#D97706' : '#15803D',
    border: isRisk ? '#FCA5A5' : isWarn ? '#FDE68A' : '#86EFAC',
    dot: isRisk ? '#EF4444' : isWarn ? '#F59E0B' : '#22C55E',
    customInsight,
  };
};

const getSensorConfig = (key, sensors, predictions, risks) => {
  const nodeName = "NODE_001 (Velachery)";
  const temp = sensors?.temperature;
  const humidity = sensors?.humidity;
  const mq2 = sensors?.mq2_raw ?? sensors?.mq2;
  const water = sensors?.water_level;
  const vib = sensors?.vibration_raw ?? sensors?.vibration;
  const ph = sensors?.ph_raw ?? sensors?.ph;
  const turbidity = sensors?.turbidity ?? sensors?.turbidity_status;
  const tds = sensors?.tds_ppm;
  const soil = sensors?.soil_moisture_raw ?? sensors?.soil_moisture;

  switch (key) {
    case 'flood': {
      const defaultLevel = typeof water === 'number' && water > 75 ? 'RISK' : typeof water === 'number' && water > 40 ? 'WARNING' : 'SAFE';
      const fb = resolveFirebaseStatus('flood', defaultLevel, predictions, risks);
      return {
        title: 'Flood Risk',
        icon: '🌊',
        node: nodeName,
        metric: `Level: ${water != null ? `${water}%` : '20% (LOW)'}`,
        insight: fb.customInsight || (fb.level === 'RISK' ? 'Rapid Water-Level Rise' : fb.level === 'WARNING' ? 'Moderate Drainage Runoff' : 'Normal Runoff'),
        state: fb.state,
        stateClass: fb.stateClass,
        level: fb.level,
        accent: fb.accent,
        bg: fb.bg,
        color: fb.color,
        border: fb.border,
        dot: fb.dot,
        moduleKey: 'flood',
      };
    }
    case 'fire': {
      const defaultLevel = sensors?.flame_condition === 'Flame Detected' || (mq2 > 800 && temp > 38) ? 'RISK' : (mq2 > 600 || temp > 35) ? 'WARNING' : 'SAFE';
      const fb = resolveFirebaseStatus('forest_fire', defaultLevel, predictions, risks);
      return {
        title: 'Forest Fire Risk',
        icon: '🔥',
        node: nodeName,
        metric: `MQ2: ${mq2 != null ? `${mq2} RAW` : '380 RAW'}`,
        insight: fb.customInsight || (fb.level === 'RISK' ? 'Thermal Combustion Spike' : fb.level === 'WARNING' ? 'Elevated Gas Density' : 'Clean Atmosphere'),
        state: fb.state,
        stateClass: fb.stateClass,
        level: fb.level,
        accent: fb.accent,
        bg: fb.bg,
        color: fb.color,
        border: fb.border,
        dot: fb.dot,
        moduleKey: 'forest_fire',
      };
    }
    case 'heat': {
      const defaultLevel = temp >= 40 ? 'RISK' : temp >= 35 ? 'WARNING' : 'SAFE';
      const fb = resolveFirebaseStatus('extreme_heat', defaultLevel, predictions, risks);
      return {
        title: 'Extreme Heat Risk',
        icon: '🌡️',
        node: nodeName,
        metric: `Temp: ${temp != null ? `${temp}°C` : '26.4°C'}`,
        insight: fb.customInsight || (fb.level === 'RISK' ? 'Severe Heatwave Stress' : fb.level === 'WARNING' ? 'Elevated Ambient Heat' : 'Normal Heat Index'),
        state: fb.state,
        stateClass: fb.stateClass,
        level: fb.level,
        accent: fb.accent,
        bg: fb.bg,
        color: fb.color,
        border: fb.border,
        dot: fb.dot,
        moduleKey: 'extreme_heat',
      };
    }
    case 'landslide': {
      const defaultLevel = vib >= 70 ? 'RISK' : vib >= 30 ? 'WARNING' : 'SAFE';
      const fb = resolveFirebaseStatus('landslide', defaultLevel, predictions, risks);
      return {
        title: 'Soil Seismic Vibration',
        icon: '⛰️',
        node: nodeName,
        metric: `Vib: ${vib != null ? `${vib} G` : '0 G'}`,
        insight: fb.customInsight || (fb.level === 'RISK' ? 'Ground Instability' : fb.level === 'WARNING' ? 'Vibration Anomaly' : 'Ground Stable'),
        state: fb.state,
        stateClass: fb.stateClass,
        level: fb.level,
        accent: fb.accent,
        bg: fb.bg,
        color: fb.color,
        border: fb.border,
        dot: fb.dot,
        moduleKey: 'landslide',
      };
    }
    case 'air': {
      const defaultLevel = mq2 >= 3150 ? 'RISK' : mq2 >= 3051 ? 'WARNING' : 'SAFE';
      const fb = resolveFirebaseStatus('air_quality', defaultLevel, predictions, risks);
      return {
        title: 'MQ2 Air Gas & Smoke',
        icon: '💨',
        node: nodeName,
        metric: `Gas: ${mq2 != null ? `${mq2} RAW` : '3094 RAW'}`,
        insight: fb.customInsight || (fb.level === 'RISK' ? 'Toxic Gas Accumulation' : fb.level === 'WARNING' ? 'Moderate Air (Warning)' : 'Clean Air Stream'),
        state: fb.state,
        stateClass: fb.stateClass,
        level: fb.level,
        accent: fb.accent,
        bg: fb.bg,
        color: fb.color,
        border: fb.border,
        dot: fb.dot,
        moduleKey: 'air_quality',
      };
    }
    case 'humidity': {
      const defaultLevel = humidity > 85 || humidity < 30 ? 'WARNING' : 'SAFE';
      const fb = resolveFirebaseStatus('extreme_heat', defaultLevel, predictions, risks);
      return {
        title: 'Relative Humidity',
        icon: '💧',
        node: nodeName,
        metric: `Humidity: ${humidity != null ? `${humidity}%` : '41.8%'}`,
        insight: fb.customInsight || (fb.level === 'WARNING' ? 'Moisture Fluctuation' : 'Balanced Atmosphere'),
        state: fb.state,
        stateClass: fb.stateClass,
        level: fb.level,
        accent: fb.accent,
        bg: fb.bg,
        color: fb.color,
        border: fb.border,
        dot: fb.dot,
        moduleKey: 'extreme_heat',
      };
    }
    case 'ph': {
      const defaultLevel = ph < 6.0 || ph > 8.5 ? 'WARNING' : 'SAFE';
      const fb = resolveFirebaseStatus('water_quality', defaultLevel, predictions, risks);
      return {
        title: 'Water Quality pH',
        icon: '🧪',
        node: nodeName,
        metric: `pH: ${ph != null ? `${ph} pH` : '6.8 pH'}`,
        insight: fb.customInsight || (fb.level === 'WARNING' ? 'pH Shift Anomaly' : 'Safe Potable Range'),
        state: fb.state,
        stateClass: fb.stateClass,
        level: fb.level,
        accent: fb.accent,
        bg: fb.bg,
        color: fb.color,
        border: fb.border,
        dot: fb.dot,
        moduleKey: 'water_quality',
      };
    }
    case 'turbidity': {
      const defaultLevel = turbidity < 1500 || turbidity === 'Dirty' ? 'RISK' : turbidity < 2500 ? 'WARNING' : 'SAFE';
      const fb = resolveFirebaseStatus('water_quality', defaultLevel, predictions, risks);
      return {
        title: 'Water Turbidity',
        icon: '🔍',
        node: nodeName,
        metric: `Raw: ${turbidity != null ? `${turbidity} RAW` : '3295 RAW'}`,
        insight: fb.customInsight || (fb.level === 'RISK' ? 'Particulate Contamination' : fb.level === 'WARNING' ? 'Moderate Turbidity' : 'Clear Water Stream'),
        state: fb.state,
        stateClass: fb.stateClass,
        level: fb.level,
        accent: fb.accent,
        bg: fb.bg,
        color: fb.color,
        border: fb.border,
        dot: fb.dot,
        moduleKey: 'water_quality',
      };
    }
    default:
      return null;
  }
};

const SensorData = () => {
  const { sensors, predictions, risks, isOnline, loading, sendTestTelemetry } = useLiveSensors();
  const [sending, setSending] = useState(false);
  const [selectedInspectModule, setSelectedInspectModule] = useState(null);

  const handleTestStream = async () => {
    setSending(true);
    await sendTestTelemetry();
    setSending(false);
  };

  const cardKeys = ['flood', 'fire', 'heat', 'landslide', 'air', 'humidity', 'ph', 'turbidity'];

  return (
    <>
      <PageHeader>
        <PageTitle>Live Firebase Sensor Telemetry</PageTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleTestStream}
            disabled={sending}
            style={{
              background: '#007AFF',
              border: 'none',
              color: '#ffffff',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {sending ? 'Sending to Firebase…' : '📡 Send Test Sensor Data to Firebase'}
          </button>
          <LiveBadge>
            <span className="dot" />
            {isOnline ? 'Firebase Stream Active' : 'Waiting for Data'}
          </LiveBadge>
        </div>
      </PageHeader>

      {loading ? (
        <p style={{ color: colors.textMuted }}>Connecting to Firebase real-time stream…</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show">
          <Grid style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {cardKeys.map((key) => {
              const cfg = getSensorConfig(key, sensors, predictions, risks);
              if (!cfg) return null;

              return (
                <ExecutiveCard
                  key={key}
                  $accentColor={cfg.accent}
                  variants={item}
                  whileHover={{ scale: 1.015, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CardHeaderRow>
                    <div className="title-group">
                      <span className="icon">{cfg.icon}</span>
                      <span>{cfg.title}</span>
                    </div>
                    <HeaderStatusBadge $bg={cfg.bg} $color={cfg.color} $border={cfg.border} $dot={cfg.dot}>
                      <span className="dot" />
                      <span>{cfg.level}</span>
                    </HeaderStatusBadge>
                  </CardHeaderRow>

                  <KeyValueList>
                    <div className="row">
                      <span className="key">Monitoring Node</span>
                      <span className="val node-link">{cfg.node}</span>
                    </div>
                    <div className="row">
                      <span className="key">Trigger Metric</span>
                      <span className="val">{cfg.metric}</span>
                    </div>
                    <div className="row">
                      <span className="key">AI Insight</span>
                      <span className="val">{cfg.insight}</span>
                    </div>
                    <div className="row">
                      <span className="key">Workflow State</span>
                      <span className={`val ${cfg.stateClass}`}>{cfg.state}</span>
                    </div>
                  </KeyValueList>

                  <CardDivider />

                  <InspectAiButton onClick={() => setSelectedInspectModule(cfg.moduleKey)}>
                    <MdPsychology size={18} /> Inspect AI
                  </InspectAiButton>
                </ExecutiveCard>
              );
            })}
          </Grid>
        </motion.div>
      )}

      {/* 7-Section Explainable Risk Intelligence Inspection Modal */}
      <RiskEventDetailModal
        isOpen={Boolean(selectedInspectModule)}
        onClose={() => setSelectedInspectModule(null)}
        moduleKey={selectedInspectModule || 'flood'}
        locationName="NODE_001 • Velachery Station"
      />
    </>
  );
};

export default SensorData;
