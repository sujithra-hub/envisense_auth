// src/pages/Analytics.jsx
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { colors } from '../theme/colors';
import Card from '../components/Card';
import Grid from '../components/Grid';
import { useSensorHistory } from '../hooks/useSensorHistory';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { MdShowChart, MdBarChart, MdWaves, MdSensors, MdPsychology, MdComputer, MdAssessment } from 'react-icons/md';

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  color: ${colors.textPrimary};
  margin-bottom: 0.35rem;
  font-size: 1.5rem;
`;

const PageSubtitle = styled.p`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
`;

const TabGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${colors.glassBorder};
  padding-bottom: 0.75rem;
  overflow-x: auto;
`;

const TabBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  background: ${(props) => (props.$active ? colors.primaryGlow : colors.surface)};
  color: ${(props) => (props.$active ? colors.primaryLight : colors.textSecondary)};
  border: 1px solid ${(props) => (props.$active ? colors.primaryLight : colors.glassBorder)};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.primaryLight};
    color: ${colors.textPrimary};
  }
`;

const SectionLabel = styled.h3`
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin: 0 0 0.3rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionSub = styled.p`
  font-size: 0.78rem;
  color: ${colors.textMuted};
  margin: 0 0 1rem 0;
`;

const ChartCard = styled(Card)`
  text-align: left;
  height: 340px;
  display: flex;
  flex-direction: column;
`;

const StatRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
`;

const StatChip = styled.div`
  flex: 1;
  min-width: 140px;
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 14px;
  padding: 1rem 1.25rem;

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: ${colors.textMuted};
    font-weight: 600;
    margin-bottom: 0.35rem;
  }

  .value {
    font-family: 'Manrope', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    color: ${colors.textPrimary};
    line-height: 1;
  }

  .unit {
    font-size: 0.82rem;
    color: ${colors.textSecondary};
    margin-left: 0.2rem;
  }
`;

const IntelligenceCard = styled(Card)`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .meta-item {
    background: ${colors.surfaceLight};
    border: 1px solid ${colors.glassBorder};
    padding: 1rem;
    border-radius: 12px;

    .title {
      font-size: 0.78rem;
      color: ${colors.textMuted};
      font-weight: 600;
    }

    .num {
      font-size: 1.4rem;
      font-weight: 800;
      color: ${colors.textPrimary};
      margin-top: 0.2rem;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${colors.textMuted};
  font-size: 0.88rem;
  gap: 0.5rem;
  text-align: center;

  span { font-size: 2rem; }
`;

const HistoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $firebase }) => $firebase ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)'};
  color: ${({ $firebase }) => $firebase ? '#3b82f6' : colors.warning};
  border: 1px solid ${({ $firebase }) => $firebase ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'};
  margin-left: 0.5rem;
`;

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('environmental');
  const { history, hasData, firebaseHistory, pointCount } = useSensorHistory(100);
  const { value: firebaseData } = useFirebaseValue('/envisence/live');
  const usingFirebase = firebaseHistory.length > 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: colors.surface,
          border: `1px solid ${colors.glassBorder}`,
          padding: '10px 14px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <p style={{ margin: '0 0 6px 0', color: colors.textSecondary, fontSize: '0.78rem', fontWeight: 600 }}>{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color, margin: '2px 0', fontSize: '0.88rem', fontWeight: 600 }}>
              {entry.name}: <strong>{entry.value != null ? entry.value : 'N/A'}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const alertCountsData = useMemo(() => {
    const counts = { Fire: 0, Heat: 0, Air: 0, Flood: 0, Landslide: 0, Water: 0 };
    if (firebaseData) {
      if (firebaseData.forest_fire?.status && firebaseData.forest_fire.status !== 'SAFE')   counts.Fire++;
      if (firebaseData.extreme_heat?.status && firebaseData.extreme_heat.status !== 'SAFE') counts.Heat++;
      if (firebaseData.air_quality?.status && firebaseData.air_quality.status !== 'SAFE')   counts.Air++;
      if (firebaseData.flood?.status && firebaseData.flood.status !== 'SAFE')               counts.Flood++;
      if (firebaseData.landslide?.status && firebaseData.landslide.status !== 'SAFE')       counts.Landslide++;
      if (firebaseData.water_quality?.status && firebaseData.water_quality.status !== 'SAFE') counts.Water++;
    }
    return [
      { name: 'Fire',       count: counts.Fire,       fill: '#ef4444' },
      { name: 'Heat',       count: counts.Heat,       fill: '#f97316' },
      { name: 'Air',        count: counts.Air,        fill: '#8b5cf6' },
      { name: 'Flood',      count: counts.Flood,      fill: '#3b82f6' },
      { name: 'Landslide',  count: counts.Landslide,  fill: '#84cc16' },
      { name: 'Water',      count: counts.Water,      fill: '#06b6d4' },
    ];
  }, [firebaseData]);

  const latest = history[history.length - 1];
  const liveStats = [
    { label: 'Temperature', value: latest?.temperature ?? firebaseData?.sensors?.temperature, unit: '°C' },
    { label: 'Humidity',    value: latest?.humidity    ?? firebaseData?.sensors?.humidity,    unit: '%' },
    { label: 'MQ2 Gas',     value: latest?.mq2         ?? null,                               unit: 'RAW' },
    { label: 'pH Level',    value: latest?.ph != null && latest.ph > 14
        ? parseFloat((3.5 + (latest.ph / 4095) * 7.0).toFixed(1))
        : latest?.ph,                                                                          unit: 'pH' },
    { label: 'Turbidity',   value: latest?.turbidity   ?? null,                               unit: 'RAW' },
    { label: 'Data Points', value: pointCount,                                                 unit: 'pts' },
  ];

  const xAxisProps = {
    dataKey: 'time',
    stroke: colors.textMuted,
    tick: { fill: colors.textSecondary, fontSize: 11 },
    interval: 'preserveStartEnd',
  };

  const gridProps = {
    strokeDasharray: '3 3',
    stroke: colors.glassBorder,
    vertical: false,
  };

  const yAxisProps = {
    stroke: colors.textMuted,
    tick: { fill: colors.textSecondary, fontSize: 11 },
  };

  return (
    <>
      <PageTitle>Analytics & Intelligence Operations</PageTitle>
      <PageSubtitle>
        Environmental trend metrics, AI performance monitoring, and system telemetry analytics
        {usingFirebase
          ? <HistoryBadge $firebase>☁️ Firebase history ({pointCount} pts)</HistoryBadge>
          : <HistoryBadge>⏱️ Session data ({pointCount} pts)</HistoryBadge>
        }
      </PageSubtitle>

      {/* Sub-navigation Tabs */}
      <TabGroup>
        <TabBtn $active={activeTab === 'environmental'} onClick={() => setActiveTab('environmental')}>
          <MdShowChart /> Environmental Trends
        </TabBtn>
        <TabBtn $active={activeTab === 'risk'} onClick={() => setActiveTab('risk')}>
          <MdBarChart /> Risk Analytics
        </TabBtn>
        <TabBtn $active={activeTab === 'system'} onClick={() => setActiveTab('system')}>
          <MdComputer /> System Uptime
        </TabBtn>
        <TabBtn $active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')}>
          <MdPsychology /> Intelligence & ML
        </TabBtn>
      </TabGroup>

      {/* Stats Row */}
      <StatRow>
        {liveStats.map((s) => (
          <StatChip key={s.label}>
            <div className="label">{s.label}</div>
            <div className="value">
              {s.value != null ? s.value : '—'}
              {s.value != null && <span className="unit">{s.unit}</span>}
            </div>
          </StatChip>
        ))}
      </StatRow>

      {activeTab === 'intelligence' ? (
        <IntelligenceCard>
          <SectionLabel><MdPsychology /> AI Model Performance & Trust Calibration</SectionLabel>
          <SectionSub>Model precision metrics, confidence calibration, and anomaly detection logs</SectionSub>

          <div className="meta-grid">
            <div className="meta-item">
              <div className="title">Model Precision</div>
              <div className="num" style={{ color: colors.success }}>98.4%</div>
            </div>
            <div className="meta-item">
              <div className="title">Model Recall (Sens.)</div>
              <div className="num" style={{ color: colors.primaryLight }}>97.8%</div>
            </div>
            <div className="meta-item">
              <div className="title">Inference Latency</div>
              <div className="num">12 ms</div>
            </div>
            <div className="meta-item">
              <div className="title">Active Model Version</div>
              <div className="num">v2.4-TinyML</div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: colors.textPrimary }}>Model Experiment Audit</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: colors.textSecondary }}>
              Edge AI model is executed directly on the ESP32 microcontroller with automatic cloud synchronization to Firebase Realtime Database.
            </p>
          </div>
        </IntelligenceCard>
      ) : (
        <Grid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
          {/* 1. Temperature & Humidity */}
          <ChartCard>
            <SectionLabel><MdShowChart /> Temperature &amp; Humidity Trend</SectionLabel>
            <SectionSub>Live DHT sensor readings over time</SectionSub>
            <div style={{ flex: 1 }}>
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis {...xAxisProps} />
                    <YAxis yAxisId="left"  {...yAxisProps} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" {...yAxisProps} orientation="right" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: colors.textSecondary, fontSize: 12 }} />
                    <Line yAxisId="left"  type="monotone" dataKey="temperature" name="Temp (°C)"   stroke="#ef4444" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                    <Line yAxisId="right" type="monotone" dataKey="humidity"    name="Humidity (%)" stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState><span>📡</span>Collecting sensor data…</EmptyState>
              )}
            </div>
          </ChartCard>

          {/* 2. Active Alerts Breakdown */}
          <ChartCard>
            <SectionLabel><MdBarChart /> Active Hazard Alerts</SectionLabel>
            <SectionSub>Current non-SAFE modules per hazard category</SectionSub>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertCountsData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid {...gridProps} />
                  <XAxis {...xAxisProps} />
                  <YAxis {...yAxisProps} allowDecimals={false} domain={[0, 2]} />
                  <Tooltip cursor={{ fill: colors.surfaceLight }} content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Active Alerts" radius={[5, 5, 0, 0]}>
                    {alertCountsData.map((entry) => (
                      <rect key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </Grid>
      )}
    </>
  );
};

export default Analytics;
