import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Grid from '../components/Grid';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 1.5rem;
`;

const SensorCard = styled(Card)`
  text-align: left;
`;

const Label = styled.p`
  color: ${colors.textMuted};
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
  margin: 0 0 0.3rem;
`;

const Value = styled.p`
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin: 0;
  letter-spacing: -0.01em;
`;

const ValueUnit = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${colors.textSecondary};
  margin-left: 0.15rem;
`;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const SensorData = () => {
  const { value: sensors, loading } = useFirebaseValue('/envisence/live/sensors');

  const sensorMap = sensors
    ? [
        { label: 'Temperature',      value: sensors.temperature,            unit: '°C',  icon: '🌡️' },
        { label: 'Humidity',          value: sensors.humidity,               unit: '%',   icon: '💧' },
        { label: 'MQ2 Raw',          value: sensors.mq2_raw,               unit: '',    icon: '🔬' },
        { label: 'Smoke',            value: sensors.smoke_condition,        unit: '',    icon: '🌫️' },
        { label: 'Flame',            value: sensors.flame_condition,        unit: '',    icon: '🔥' },
        { label: 'Rain',             value: sensors.rain_condition,         unit: '',    icon: '🌧️' },
        { label: 'Water Level',      value: sensors.water_level_condition,  unit: '',    icon: '🌊' },
        { label: 'Soil Moisture',    value: sensors.soil_moisture_raw,      unit: 'raw', icon: '🌱' },
        { label: 'TDS',              value: sensors.tds_ppm,               unit: 'ppm', icon: '💎' },
        { label: 'Turbidity',        value: sensors.turbidity_status,       unit: '',    icon: '🔍' },
        { label: 'Accel X',          value: sensors.accel_x != null ? sensors.accel_x.toFixed(3) : null, unit: 'g', icon: '📐' },
        { label: 'Accel Y',          value: sensors.accel_y != null ? sensors.accel_y.toFixed(3) : null, unit: 'g', icon: '📐' },
        { label: 'Accel Z',          value: sensors.accel_z != null ? sensors.accel_z.toFixed(3) : null, unit: 'g', icon: '📐' },
        { label: 'Vibration',        value: sensors.vibration_raw,          unit: 'raw', icon: '📳' },
        { label: 'pH',               value: sensors.ph_raw,                unit: 'raw', icon: '🧪' },
      ]
    : [];

  return (
    <>
      <PageTitle>Live Sensor Data</PageTitle>
      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading live sensors…</p>
      ) : sensors ? (
        <motion.div variants={container} initial="hidden" animate="show">
          <Grid>
            {sensorMap.map(({ label, value, unit, icon }) => (
              <SensorCard
                key={label}
                variants={item}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Label>{icon} {label}</Label>
                <Value>
                  {value ?? 'N/A'}
                  {unit && value != null && <ValueUnit>{unit}</ValueUnit>}
                </Value>
              </SensorCard>
            ))}
          </Grid>
        </motion.div>
      ) : (
        <p style={{ color: colors.textMuted }}>No sensor data available.</p>
      )}
    </>
  );
};

export default SensorData;
