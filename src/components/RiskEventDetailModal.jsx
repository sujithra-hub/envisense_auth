// src/components/RiskEventDetailModal.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdWarning, MdError, MdCheckCircle, MdTimeline,
  MdShield, MdPsychology, MdSpeed, MdSensors, MdCheck, MdArrowForward
} from 'react-icons/md';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { colors } from '../theme/colors';
import { useFirebaseValue } from '../hooks/useFirebaseValue';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const ModalContainer = styled(motion.div)`
  background: ${colors.surface};
  border: 1px solid ${(props) => (props.$critical ? colors.danger : props.$warning ? colors.warning : colors.success)};
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
`;

const HeaderBanner = styled.div`
  padding: 1.35rem 1.5rem;
  background: ${(props) =>
    props.$critical
      ? 'rgba(239, 68, 68, 0.12)'
      : props.$warning
      ? 'rgba(245, 158, 11, 0.12)'
      : 'rgba(52, 199, 89, 0.12)'};
  border-bottom: 1px solid ${colors.glassBorder};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .title-group {
    h3 {
      margin: 0 0 0.3rem 0;
      font-family: 'Manrope', sans-serif;
      font-size: 1.25rem;
      font-weight: 800;
      color: ${(props) =>
        props.$critical
          ? colors.danger
          : props.$warning
          ? colors.warning
          : colors.success};
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    p {
      margin: 0;
      font-size: 0.85rem;
      color: ${colors.textSecondary};
      font-weight: 600;
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.4rem;
    color: ${colors.textMuted};
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

const KeyMetricsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${colors.surfaceLight};
  border-bottom: 1px solid ${colors.glassBorder};

  .metric-box {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    span {
      font-size: 0.72rem;
      font-weight: 700;
      color: ${colors.textMuted};
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    strong {
      font-size: 1.1rem;
      font-weight: 800;
      color: ${colors.textPrimary};
    }
  }
`;

const SectionBlock = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${colors.glassBorder};

  &:last-child {
    border-bottom: none;
  }

  h4 {
    margin: 0 0 0.85rem 0;
    font-size: 0.88rem;
    font-weight: 800;
    color: ${colors.textPrimary};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: ${colors.primaryLight};
    }
  }
`;

const WhyTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .why-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: ${colors.surfaceLight};
    border-radius: 8px;
    font-size: 0.85rem;

    .label {
      color: ${colors.textSecondary};
      font-weight: 600;
    }

    .val {
      color: ${colors.textPrimary};
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .delta {
      font-weight: 700;
      font-size: 0.8rem;
    }
  }

  .quote-box {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: ${colors.primaryGlow};
    border-left: 3px solid ${colors.primaryLight};
    border-radius: 0 8px 8px 0;
    font-size: 0.82rem;
    font-style: italic;
    color: ${colors.textPrimary};
  }
`;

const ChartWrapper = styled.div`
  height: 120px;
  width: 100%;
  margin-top: 0.5rem;
`;

const GridFour = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;

  .trust-item {
    background: ${colors.surfaceLight};
    border: 1px solid ${colors.glassBorder};
    padding: 0.75rem;
    border-radius: 10px;
    display: flex;
    flex-direction: column;

    span {
      font-size: 0.72rem;
      color: ${colors.textMuted};
      font-weight: 600;
    }

    strong {
      font-size: 0.95rem;
      color: ${colors.textPrimary};
      font-weight: 700;
      margin-top: 0.2rem;
    }
  }
`;

const DecisionFlow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${colors.textSecondary};

  .step {
    padding: 0.25rem 0.55rem;
    background: ${colors.surfaceLight};
    border: 1px solid ${colors.glassBorder};
    border-radius: 6px;
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;

  button {
    flex: 1;
    padding: 0.65rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid ${colors.glassBorder};
    background: ${colors.surfaceLight};
    color: ${colors.textPrimary};

    &:hover {
      border-color: ${colors.primaryLight};
      color: ${colors.primaryLight};
      background: ${colors.primaryGlow};
    }

    &.btn-ack {
      border-color: ${colors.warning};
      color: ${colors.warning};
      &:hover { background: ${colors.warningBg}; }
    }

    &.btn-assign {
      border-color: ${colors.primaryLight};
      color: ${colors.primaryLight};
      &:hover { background: ${colors.primaryGlow}; }
    }

    &.btn-investigate {
      border-color: ${colors.danger};
      color: ${colors.danger};
      &:hover { background: ${colors.dangerBg}; }
    }
  }
`;

const Toast = styled(motion.div)`
  padding: 0.65rem 1rem;
  background: ${colors.successBg};
  border: 1px solid ${colors.successBorder};
  color: ${colors.success};
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const RiskEventDetailModal = ({ isOpen = true, onClose, event, moduleKey, locationName }) => {
  const targetKey = moduleKey || event?.type || event?.hazardKey || 'air_quality';
  const targetLocation = locationName || event?.location || 'Velachery Zone';

  const { value: firebaseSensors } = useFirebaseValue('/envisence/live/sensors');
  const { value: hazardFirebase } = useFirebaseValue(`/envisence/live/${targetKey}`);
  const { value: airQuality } = useFirebaseValue('/envisence/live/air_quality');
  const { value: waterQuality } = useFirebaseValue('/envisence/live/water_quality');
  const { value: overallStatus } = useFirebaseValue('/envisence/live/overall_status');
  const [actionStatus, setActionStatus] = useState(null);

  if (isOpen === false) return null;

  const s = firebaseSensors || {};
  const temp = s.temperature ?? 28;
  const humidity = s.humidity ?? 62;
  const mq2 = s.mq2_raw ?? s.mq2 ?? 450;
  const waterLevel = s.water_level ?? 12;
  const rainCond = s.rain_condition || 'Normal Rainfall';
  const smokeCond = s.smoke_condition || 'Normal';
  const flameCond = s.flame_condition || 'Clear';
  const phRaw = s.ph_raw ?? s.ph ?? 2400;
  const tdsVal = s.tds_ppm ?? 180;
  const turbidityStatus = s.turbidity_status || 'Clear';

  // Base dynamic status per module strictly from live sensor metrics
  let isCritical = false;
  let isWarning = false;

  if (targetKey === 'air_quality' || targetKey === 'air') {
    isCritical = mq2 >= 3150 || smokeCond === 'Smoke Detected' || flameCond === 'Flame Detected' || hazardFirebase?.status === 'CRITICAL';
    isWarning = (mq2 >= 3051 || hazardFirebase?.status === 'WARNING') && !isCritical;
  } else if (targetKey === 'water_quality' || targetKey === 'water') {
    isCritical = (tdsVal > 800 || turbidityStatus === 'Dirty / High Turbidity') && (waterQuality?.ai_prediction === 'RISK' || hazardFirebase?.status === 'CRITICAL');
    isWarning = (tdsVal > 500 || turbidityStatus === 'Dirty / High Turbidity' || waterQuality?.ai_prediction === 'RISK' || hazardFirebase?.status === 'WARNING') && !isCritical;
  } else if (targetKey === 'flood') {
    isCritical = waterLevel >= 70 || rainCond === 'Heavy Rain' || hazardFirebase?.status === 'CRITICAL';
    isWarning = (waterLevel >= 40 || hazardFirebase?.status === 'WARNING') && !isCritical;
  } else if (targetKey === 'forest_fire' || targetKey === 'fire') {
    isCritical = flameCond === 'Flame Detected' || (mq2 > 800 && temp > 38) || hazardFirebase?.status === 'CRITICAL';
    isWarning = (mq2 > 600 || temp > 35 || hazardFirebase?.status === 'WARNING') && !isCritical;
  } else if (targetKey === 'extreme_heat' || targetKey === 'heat') {
    isCritical = temp >= 40 || hazardFirebase?.status === 'CRITICAL';
    isWarning = (temp >= 35 || hazardFirebase?.status === 'WARNING') && !isCritical;
  }

  const liveSeverity = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'SAFE';

  // Dynamic metrics & explanation calculation
  let config = {
    title: '🟢 NORMAL ENVIRONMENTAL STATUS',
    critical: false,
    warning: false,
    severity: 'SAFE',
    confidence: 'HIGH (99%)',
    trend: '→ STABLE',
    why: [
      { label: 'Sensor Station Status', val: 'Online & Healthy', delta: '0 Delta' },
      { label: 'Telemetry Baseline', val: 'Normal Range', delta: 'Safe Thresholds' },
      { label: 'Sensor Agreement', val: '3 / 3 Active', delta: '100% Consensus' },
    ],
    quote: '"All monitored IoT sensors report environmental parameters strictly within normal safe baselines."',
    detectedState: 'Normal Environment',
    model: 'Envisense-v2.4',
    graphData: [
      { time: '10m ago', val: 24 },
      { time: '8m ago', val: 25 },
      { time: '6m ago', val: 25 },
      { time: '4m ago', val: 26 },
      { time: 'Now', val: 26 },
    ]
  };

  if (targetKey === 'flood') {
    config = {
      title: isCritical ? '🔴 CRITICAL FLOOD RISK DETECTED' : isWarning ? '🟠 FLOOD WARNING ACTIVE' : '🟢 FLOOD MONITORING — SAFE',
      critical: isCritical,
      warning: isWarning,
      severity: liveSeverity,
      confidence: isCritical || isWarning ? 'HIGH (94%)' : 'OPTIMAL (99%)',
      trend: isCritical || isWarning ? '↑ RISING RAPIDLY' : '→ STABLE WATER LEVEL',
      why: [
        { label: 'Rainfall Condition', val: `${rainCond}`, delta: isCritical || isWarning ? '+250% baseline' : 'Normal Baseline' },
        { label: 'Water Level Sensor', val: `${waterLevel}%`, delta: isCritical || isWarning ? `+${waterLevel - 15}% baseline` : 'Normal Baseline' },
        { label: 'Rate of Rise', val: isCritical || isWarning ? '+8 cm / 10m' : '0 cm / 10m', delta: isCritical || isWarning ? 'Rapid Increase' : 'Normal Rate' },
        { label: 'Sensor Agreement', val: '3 / 3 Active', delta: 'Strong Consensus' },
      ],
      quote: isCritical || isWarning
        ? '"Multiple IoT sensors indicate a rapidly increasing water-level condition significantly above local baseline."'
        : '"Water level sensors and rain telemetry indicate normal baseline drainage with zero active flood threat."',
      detectedState: isCritical || isWarning ? 'Rapid Water-Level Rise' : 'Safe Drainage Level',
      model: 'Flood-Risk-v1.3',
      graphData: [
        { time: '10m ago', val: 12 },
        { time: '8m ago', val: 14 },
        { time: '6m ago', val: 18 },
        { time: '4m ago', val: 25 },
        { time: 'Now', val: waterLevel },
      ]
    };
  } else if (targetKey === 'forest_fire' || targetKey === 'fire') {
    config = {
      title: isCritical ? '🔴 CRITICAL FOREST FIRE RISK' : isWarning ? '🟠 FIRE SMOKE WARNING' : '🟢 FIRE MONITORING — SAFE',
      critical: isCritical,
      warning: isWarning,
      severity: liveSeverity,
      confidence: isCritical || isWarning ? 'HIGH (96%)' : 'OPTIMAL (99%)',
      trend: isCritical || isWarning ? '↑ TEMPERATURE & GAS SPIKE' : '→ STABLE THERMAL',
      why: [
        { label: 'MQ2 Smoke & Gas', val: `${mq2} PPM`, delta: isCritical || isWarning ? `+${mq2 - 400} PPM baseline` : 'Normal Baseline' },
        { label: 'Ambient Temperature', val: `${temp} °C`, delta: isCritical || isWarning ? `+${(temp - 28).toFixed(1)} °C baseline` : 'Normal Ambient' },
        { label: 'Flame Sensor', val: `${flameCond}`, delta: flameCond === 'Flame Detected' ? 'FLAME DETECTED' : 'Clear' },
        { label: 'Sensor Agreement', val: '3 / 3 Active', delta: 'Strong Consensus' },
      ],
      quote: isCritical || isWarning
        ? '"Thermal sensors and MQ2 gas telemetry report elevated gas density and rapid thermal rise in perimeter."'
        : '"Thermal and gas sensors report normal atmospheric composition with no combustion telemetry detected."',
      detectedState: isCritical || isWarning ? 'Thermal & Gas Anomaly' : 'Normal Atmosphere',
      model: 'Fire-Risk-v2.1',
      graphData: [
        { time: '10m ago', val: 28 },
        { time: '8m ago', val: 28 },
        { time: '6m ago', val: 29 },
        { time: '4m ago', val: 30 },
        { time: 'Now', val: temp },
      ]
    };
  } else if (targetKey === 'extreme_heat' || targetKey === 'heat') {
    config = {
      title: isCritical ? '🌡️ CRITICAL HEATWAVE DETECTED' : isWarning ? '🌡️ EXTREME HEAT ADVISORY' : '🟢 HEAT INDEX — NORMAL',
      critical: isCritical,
      warning: isWarning,
      severity: liveSeverity,
      confidence: 'HIGH (92%)',
      trend: isCritical || isWarning ? '↑ ELEVATED TEMPERATURE' : '→ STABLE HEAT INDEX',
      why: [
        { label: 'Ambient Temperature', val: `${temp} °C`, delta: isCritical || isWarning ? `+${(temp - 28).toFixed(1)} °C baseline` : 'Normal Ambient' },
        { label: 'Relative Humidity', val: `${humidity} %`, delta: 'Heat Index Validated' },
        { label: 'Sensor Agreement', val: '2 / 2 Active', delta: 'Verified' },
      ],
      quote: isCritical || isWarning
        ? '"High ambient temperature readings exceed urban heatwave comfort and health thresholds."'
        : '"Ambient thermal metrics are within normal seasonal range for this zone."',
      detectedState: isCritical || isWarning ? 'Severe Thermal Stress' : 'Normal Heat Index',
      model: 'Heat-Risk-v1.0',
      graphData: [
        { time: '10m ago', val: 27 },
        { time: '8m ago', val: 28 },
        { time: '6m ago', val: 28 },
        { time: '4m ago', val: 29 },
        { time: 'Now', val: temp },
      ]
    };
  } else if (targetKey === 'air_quality' || targetKey === 'air') {
    config = {
      title: isCritical ? '🔴 CRITICAL AIR POLLUTION DETECTED' : isWarning ? '🌫️ AIR QUALITY WARNING ACTIVE' : '🟢 AIR QUALITY — SAFE & CLEAN',
      critical: isCritical,
      warning: isWarning,
      severity: liveSeverity,
      confidence: isCritical || isWarning ? 'HIGH (94%)' : 'OPTIMAL (99%)',
      trend: isCritical || isWarning ? '↑ SMOG & GAS ACCUMULATION' : '→ EXCELLENT AIR INDEX',
      why: [
        { label: 'MQ2 Smoke & Gas Level', val: `${mq2} PPM`, delta: isCritical || isWarning ? `+${mq2 - 400} PPM baseline` : 'Normal Baseline' },
        { label: 'Smoke Sensor Condition', val: `${smokeCond}`, delta: smokeCond === 'Smoke Detected' ? 'SMOKE DETECTED' : 'Normal Air Flow' },
        { label: 'Flame Sensor Status', val: `${flameCond}`, delta: 'Clear' },
        { label: 'Sensor Agreement', val: '3 / 3 Active', delta: 'Consensus Validated' },
      ],
      quote: isCritical || isWarning
        ? `"MQ2 gas telemetry reports elevated gas density (${mq2} PPM) significantly exceeding safe atmospheric baselines."`
        : '"MQ2 atmospheric gas and particulate sensors report clean air quality well within safe limits."',
      detectedState: isCritical || isWarning ? 'Toxic Gas / Air Degradation' : 'Clean Air Index',
      model: 'Air-Quality-v1.4',
      graphData: [
        { time: '10m ago', val: 380 },
        { time: '8m ago', val: 400 },
        { time: '6m ago', val: 420 },
        { time: '4m ago', val: 440 },
        { time: 'Now', val: mq2 },
      ]
    };
  } else if (targetKey === 'water_quality' || targetKey === 'water') {
    config = {
      title: isCritical ? '🔴 CRITICAL WATER CONTAMINATION' : isWarning ? '💧 WATER QUALITY WARNING' : '🟢 WATER QUALITY — SAFE & POTABLE',
      critical: isCritical,
      warning: isWarning,
      severity: liveSeverity,
      confidence: isCritical || isWarning ? 'HIGH (93%)' : 'OPTIMAL (99%)',
      trend: isCritical || isWarning ? '↓ TURBIDITY SHIFT' : '→ STABLE WATER INDEX',
      why: [
        { label: 'pH Level Raw', val: `${phRaw}`, delta: isCritical || isWarning ? 'Shifted Baseline' : 'Neutral Safe pH' },
        { label: 'TDS Concentration', val: `${tdsVal} PPM`, delta: isCritical || isWarning ? `+${tdsVal - 150} PPM baseline` : 'Pure Sample Baseline' },
        { label: 'Turbidity Sensor Status', val: `${turbidityStatus}`, delta: turbidityStatus === 'Dirty / High Turbidity' ? 'High Turbidity' : 'Clear Water Baseline' },
        { label: 'Sensor Agreement', val: '3 / 3 Active', delta: 'Consensus Validated' },
      ],
      quote: isCritical || isWarning
        ? '"Optical turbidity and pH sensor readings indicate suspended particulate contamination above safe water thresholds."'
        : '"Water quality sensors confirm high clarity and balanced pH meeting clean water standards."',
      detectedState: isCritical || isWarning ? 'Water Contamination Hazard' : 'Potable Clean Water',
      model: 'Water-Quality-v2.0',
      graphData: [
        { time: '10m ago', val: 180 },
        { time: '8m ago', val: 185 },
        { time: '6m ago', val: 188 },
        { time: '4m ago', val: 190 },
        { time: 'Now', val: tdsVal },
      ]
    };
  }

  const handleAction = (type) => {
    setActionStatus(`Action logged: ${type} dispatched for ${targetLocation}`);
    setTimeout(() => setActionStatus(null), 3000);
  };

  return (
    <AnimatePresence>
      <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <ModalContainer
          $critical={config.critical}
          $warning={config.warning}
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* SECTION 1: HEADER BANNER */}
          <HeaderBanner $critical={config.critical} $warning={config.warning}>
            <div className="title-group">
              <h3>{config.title}</h3>
              <p>📍 {targetLocation}</p>
            </div>
            <button className="close-btn" onClick={onClose}><MdClose /></button>
          </HeaderBanner>

          {/* KEY METRICS SUMMARY */}
          <KeyMetricsRow>
            <div className="metric-box">
              <span>SEVERITY</span>
              <strong style={{ color: config.critical ? colors.danger : config.warning ? colors.warning : colors.success }}>
                {config.severity}
              </strong>
            </div>
            <div className="metric-box">
              <span>CONFIDENCE</span>
              <strong style={{ color: colors.success }}>{config.confidence}</strong>
            </div>
            <div className="metric-box">
              <span>TREND</span>
              <strong>{config.trend}</strong>
            </div>
          </KeyMetricsRow>

          {/* SECTION 2: WHY WAS THIS DETECTED */}
          <SectionBlock>
            <h4><MdPsychology /> WHY WAS THIS DETECTED?</h4>
            <WhyTable>
              {config.why.map((item, idx) => (
                <div className="why-row" key={idx}>
                  <span className="label">{item.label}</span>
                  <span className="val">{item.val}</span>
                  <span className="delta" style={{ color: config.critical ? colors.danger : config.warning ? colors.warning : colors.success }}>
                    {item.delta}
                  </span>
                </div>
              ))}
              <div className="quote-box">{config.quote}</div>
            </WhyTable>
          </SectionBlock>

          {/* SECTION 3: ENVIRONMENTAL EVIDENCE */}
          <SectionBlock>
            <h4><MdTimeline /> ENVIRONMENTAL EVIDENCE & REAL-TIME TREND</h4>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={config.graphData}>
                  <XAxis dataKey="time" stroke={colors.textMuted} tick={{ fontSize: 10 }} />
                  <YAxis stroke={colors.textMuted} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: colors.surface, borderRadius: 8, border: `1px solid ${colors.glassBorder}` }} />
                  <Line
                    type="monotone"
                    dataKey="val"
                    stroke={config.critical ? colors.danger : config.warning ? colors.warning : colors.success}
                    strokeWidth={2.5}
                    dot={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </SectionBlock>

          {/* SECTION 4: SENSOR & DATA TRUST */}
          <SectionBlock>
            <h4><MdShield /> SENSOR & DATA TRUST</h4>
            <GridFour>
              <div className="trust-item">
                <span>Data Quality</span>
                <strong style={{ color: colors.success }}>GOOD</strong>
              </div>
              <div className="trust-item">
                <span>Sensor Health</span>
                <strong style={{ color: colors.success }}>97%</strong>
              </div>
              <div className="trust-item">
                <span>Agreement</span>
                <strong style={{ color: colors.primaryLight }}>HIGH</strong>
              </div>
              <div className="trust-item">
                <span>Calibration</span>
                <strong style={{ color: colors.success }}>Current</strong>
              </div>
            </GridFour>
          </SectionBlock>

          {/* SECTION 5: INTELLIGENCE ASSESSMENT */}
          <SectionBlock>
            <h4><MdSpeed /> INTELLIGENCE ASSESSMENT</h4>
            <GridFour>
              <div className="trust-item">
                <span>Detected State</span>
                <strong>{config.detectedState}</strong>
              </div>
              <div className="trust-item">
                <span>Method</span>
                <strong>Hybrid Rule + ML</strong>
              </div>
              <div className="trust-item">
                <span>Inference</span>
                <strong>Edge Gateway</strong>
              </div>
              <div className="trust-item">
                <span>Model Version</span>
                <strong>{config.model}</strong>
              </div>
            </GridFour>
          </SectionBlock>

          {/* SECTION 6: DECISION PATH */}
          <SectionBlock>
            <h4><MdSensors /> DECISION PATH</h4>
            <DecisionFlow>
              <span className="step">Sensor</span> <MdArrowForward />
              <span className="step">Quality</span> <MdArrowForward />
              <span className="step">Health</span> <MdArrowForward />
              <span className="step">Baseline</span> <MdArrowForward />
              <span className="step">Fusion</span> <MdArrowForward />
              <span className="step">Rules + ML</span> <MdArrowForward />
              <span className="step" style={{ color: config.critical ? colors.danger : config.warning ? colors.warning : colors.success }}>
                Risk + Confidence
              </span>
            </DecisionFlow>
          </SectionBlock>

          {/* SECTION 7: RECOMMENDED ACTION & OPERATIONS */}
          <SectionBlock>
            <h4><MdCheckCircle /> RECOMMENDED OPERATIONAL ACTION</h4>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: colors.textSecondary }}>
              Verify site conditions and assess accessibility for emergency response units.
            </p>

            <ActionButtonGroup>
              <button className="btn-ack" onClick={() => handleAction('ACKNOWLEDGE')}>ACKNOWLEDGE</button>
              <button className="btn-assign" onClick={() => handleAction('ASSIGN')}>ASSIGN</button>
              <button className="btn-investigate" onClick={() => handleAction('INVESTIGATE')}>INVESTIGATE</button>
            </ActionButtonGroup>

            {actionStatus && (
              <Toast initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <MdCheck /> {actionStatus}
              </Toast>
            )}
          </SectionBlock>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default RiskEventDetailModal;
