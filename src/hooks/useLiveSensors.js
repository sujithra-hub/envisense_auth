// src/hooks/useLiveSensors.js
import { useFirebaseValue } from './useFirebaseValue';
import { deriveHazardRisks } from '../services/locationService';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';

/**
 * Pushes simulated live telemetry to Firebase Realtime Database
 * under /envisence/nodes/ENVISENSE_001/sensors for instant testing.
 */
export const pushTestTelemetryToFirebase = async (customData = {}) => {
  try {
    const nodeRef = ref(db, '/envisence/nodes/ENVISENSE_001');
    const now = Date.now();
    await set(nodeRef, {
      name: "Forest Monitoring Node 1",
      area: "Velachery Tech Zone",
      latitude: 12.9785,
      longitude: 80.2184,
      online: true,
      last_update: now,
      sensors: {
        temperature: customData.temperature ?? 34.2,
        humidity: customData.humidity ?? 62.0,
        mq2_raw: customData.mq2_raw ?? 420,
        soil_moisture_raw: customData.soil_moisture_raw ?? 350,
        water_level: customData.water_level ?? 45,
        vibration_raw: customData.vibration_raw ?? 12,
        ph_raw: customData.ph_raw ?? 7.2,
        turbidity: customData.turbidity ?? 3200,
        tds_ppm: customData.tds_ppm ?? 190,
        accel_x: 0.012,
        accel_y: -0.004,
        accel_z: 0.982,
        smoke_condition: "Normal",
        flame_condition: "Clear",
        rain_condition: "None",
        water_level_condition: "Normal",
        turbidity_status: "Clear",
        ...customData
      },
      predictions: {
        forest_fire: { prediction: "safe", severity: "NORMAL", score: 15, confidence: 0.95 },
        extreme_heat: { prediction: "normal", severity: "NORMAL", score: 10, confidence: 0.90 },
        landslide: { prediction: "stable", severity: "NORMAL", score: 20, confidence: 0.88 }
      },
      deviceStatus: {
        online: true,
        uptime: 7200,
        wifiRSSI: -58,
        firmwareVersion: "1.0.0",
        lastSeen: new Date().toISOString()
      }
    });

    // Also copy to /envisence/live/sensors for single-node consumers
    const liveSensorsRef = ref(db, '/envisence/live/sensors');
    await set(liveSensorsRef, {
      temperature: customData.temperature ?? 34.2,
      humidity: customData.humidity ?? 62.0,
      mq2_raw: customData.mq2_raw ?? 420,
      soil_moisture_raw: customData.soil_moisture_raw ?? 350,
      water_level: customData.water_level ?? 45,
      vibration_raw: customData.vibration_raw ?? 12,
      ph_raw: customData.ph_raw ?? 7.2,
      turbidity: customData.turbidity ?? 3200,
      tds_ppm: customData.tds_ppm ?? 190,
      accel_x: 0.012,
      accel_y: -0.004,
      accel_z: 0.982,
      smoke_condition: "Normal",
      flame_condition: "Clear",
      rain_condition: "None",
      water_level_condition: "Normal",
      turbidity_status: "Clear",
      ...customData
    });

    // Write live prediction statuses to /envisence/live/
    await set(ref(db, '/envisence/live/air_quality'), {
      ai_prediction: customData.air_prediction || 'SAFE',
      status: customData.air_status || 'SAFE',
      severity: customData.air_severity || 'NORMAL',
    });
    await set(ref(db, '/envisence/live/water_quality'), {
      ai_prediction: customData.water_prediction || 'SAFE',
      status: customData.water_status || 'SAFE',
      severity: customData.water_severity || 'NORMAL',
    });
    await set(ref(db, '/envisence/live/forest_fire'), {
      prediction: customData.fire_prediction || 'safe',
      status: customData.fire_status || 'SAFE',
      severity: customData.fire_severity || 'NORMAL',
    });
    await set(ref(db, '/envisence/live/extreme_heat'), {
      prediction: customData.heat_prediction || 'normal',
      status: customData.heat_status || 'SAFE',
      severity: customData.heat_severity || 'NORMAL',
    });
    await set(ref(db, '/envisence/live/landslide'), {
      prediction: customData.landslide_prediction || 'stable',
      status: customData.landslide_status || 'SAFE',
      severity: customData.landslide_severity || 'NORMAL',
    });
    await set(ref(db, '/envisence/live/overall_status'), customData.overall_status || 'SAFE');

    console.log('[Firebase] Test telemetry successfully published to Realtime Database.');
    return true;
  } catch (err) {
    console.error('[Firebase] Failed to write test telemetry:', err);
    return false;
  }
};

/**
 * Custom React Hook to retrieve normalized live sensor values from Firebase.
 * Dynamically resolves sensors from /envisence/live or /envisence/nodes.
 */
export const useLiveSensors = () => {
  const { value: liveSensors, loading: sensorsLoading } = useFirebaseValue('/envisence/live/sensors');
  const { value: fullEnvisence, loading: envisenceLoading } = useFirebaseValue('/envisence');
  const { value: device, loading: deviceLoading }   = useFirebaseValue('/envisence/live/device');
  const { value: overallStatusVal }                  = useFirebaseValue('/envisence/live/overall_status');

  // Dynamic sensor extraction hierarchy:
  // 1. /envisence/live/sensors
  // 2. /envisence/nodes/{firstNodeId}/sensors
  // 3. /envisence/sensors
  let activeSensors = liveSensors;

  if (!activeSensors && fullEnvisence && typeof fullEnvisence === 'object') {
    if (fullEnvisence.nodes && typeof fullEnvisence.nodes === 'object') {
      const nodeKeys = Object.keys(fullEnvisence.nodes);
      if (nodeKeys.length > 0 && fullEnvisence.nodes[nodeKeys[0]]?.sensors) {
        activeSensors = fullEnvisence.nodes[nodeKeys[0]].sensors;
      }
    }
    if (!activeSensors && fullEnvisence.sensors) {
      activeSensors = fullEnvisence.sensors;
    }
  }

  const normalizedSensors = activeSensors
    ? {
        temperature: activeSensors.temperature ?? null,
        humidity: activeSensors.humidity ?? null,
        mq2_raw: activeSensors.mq2_raw ?? activeSensors.mq2 ?? null,
        soil_moisture_raw: activeSensors.soil_moisture_raw ?? activeSensors.soil_moisture ?? null,
        water_level: activeSensors.water_level ?? activeSensors.water_level_cm ?? null,
        vibration_raw: activeSensors.vibration_raw ?? activeSensors.vibration ?? null,
        ph_raw: activeSensors.ph_raw ?? activeSensors.ph ?? null,
        turbidity: activeSensors.turbidity ?? activeSensors.turbidity_raw ?? null,
        tds_ppm: activeSensors.tds_ppm ?? activeSensors.tds ?? null,
        accel_x: activeSensors.accel_x ?? null,
        accel_y: activeSensors.accel_y ?? null,
        accel_z: activeSensors.accel_z ?? null,
        smoke_condition: activeSensors.smoke_condition ?? null,
        flame_condition: activeSensors.flame_condition ?? null,
        rain_condition: activeSensors.rain_condition ?? null,
        water_level_condition: activeSensors.water_level_condition ?? null,
        turbidity_status: activeSensors.turbidity_status ?? null,
      }
    : null;

  let firebasePredictions = {};
  if (fullEnvisence && typeof fullEnvisence === 'object') {
    if (fullEnvisence.nodes) {
      const firstNodeKey = Object.keys(fullEnvisence.nodes)[0];
      if (firstNodeKey && fullEnvisence.nodes[firstNodeKey]?.predictions) {
        firebasePredictions = { ...fullEnvisence.nodes[firstNodeKey].predictions };
      }
    }
    if (fullEnvisence.live) {
      firebasePredictions = {
        ...firebasePredictions,
        forest_fire: fullEnvisence.live.forest_fire || firebasePredictions.forest_fire,
        extreme_heat: fullEnvisence.live.extreme_heat || firebasePredictions.extreme_heat,
        landslide: fullEnvisence.live.landslide || firebasePredictions.landslide,
        air_quality: fullEnvisence.live.air_quality || firebasePredictions.air_quality,
        water_quality: fullEnvisence.live.water_quality || firebasePredictions.water_quality,
        flood: fullEnvisence.live.flood || firebasePredictions.flood,
      };
    }
  }

  const calculatedRisks = deriveHazardRisks(normalizedSensors || {});
  const overallStatus = overallStatusVal || calculatedRisks.overallStatus || 'SAFE';

  return {
    sensors: normalizedSensors,
    rawSensors: activeSensors,
    device: device || { online: Boolean(normalizedSensors), last_update: Date.now() },
    isOnline: device?.online ?? Boolean(normalizedSensors),
    overallStatus,
    predictions: firebasePredictions,
    risks: calculatedRisks.hazards,
    loading: sensorsLoading || envisenceLoading || deviceLoading,
    hasData: Boolean(normalizedSensors),
    sendTestTelemetry: pushTestTelemetryToFirebase,
  };
};


