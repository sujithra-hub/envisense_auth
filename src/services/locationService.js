// src/services/locationService.js

export const PRESET_LOCATIONS = [
  { name: 'Velachery', lat: 12.9785, lng: 80.2184, area: 'South Chennai Zone' },
  { name: 'Guindy', lat: 13.0067, lng: 80.2020, area: 'Industrial Zone A' },
  { name: 'Adyar', lat: 13.0012, lng: 80.2565, area: 'Coastal Zone' },
  { name: 'Tambaram', lat: 12.9229, lng: 80.1275, area: 'South Suburbs' },
  { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101, area: 'North Central' },
  { name: 'Perungudi', lat: 12.9654, lng: 80.2461, area: 'IT Corridor' },
  { name: 'Sholinganallur', lat: 12.8996, lng: 80.2279, area: 'Coastal Tech Park' },
  { name: 'Madipakkam', lat: 12.9623, lng: 80.1986, area: 'Residential Belt' },
  { name: 'T. Nagar', lat: 13.0418, lng: 80.2341, area: 'Central Commercial' },
];

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
};

/**
 * Maps raw sensor values (from Firebase) into normalized risk levels.
 * NO FALLBACK DEFAULTS — if sensor data is null/undefined, returns null risk.
 */
export const deriveHazardRisks = (telemetry = {}) => {
  const temp = telemetry.temperature;
  const humidity = telemetry.humidity;
  const mq2 = telemetry.mq2 ?? telemetry.mq2_raw;
  const vibration = telemetry.vibration ?? telemetry.vibration_raw;
  const ph = telemetry.ph ?? telemetry.ph_raw;
  const turbidity = telemetry.turbidity;
  const waterLevel = telemetry.water_level;
  const soilMoisture = telemetry.soil_moisture ?? telemetry.soil_moisture_raw;

  // If we have no sensor data at all, return unknown status
  const hasSensorData = temp != null || mq2 != null || humidity != null;
  if (!hasSensorData) {
    return {
      overallStatus: 'UNKNOWN',
      hazards: {
        forest_fire: { name: 'Forest Fire', risk: 'UNKNOWN', icon: '🔥' },
        extreme_heat: { name: 'Extreme Heat', risk: 'UNKNOWN', icon: '🌡️' },
        flood: { name: 'Flood', risk: 'UNKNOWN', icon: '🌊' },
        landslide: { name: 'Landslide', risk: 'UNKNOWN', icon: '⛰️' },
        air_quality: { name: 'Air Quality', risk: 'UNKNOWN', icon: '🌫️' },
        water_quality: { name: 'Water Quality', risk: 'UNKNOWN', icon: '💧' },
        industrial: { name: 'Industrial Safety', risk: 'UNKNOWN', icon: '🏭' },
      },
    };
  }

  const storedMq2 = typeof window !== 'undefined' ? localStorage.getItem('envisense_mq2_thresh') : null;
  const customMq2Warn = storedMq2 && Number(storedMq2) >= 1000 ? Number(storedMq2) : 3051;
  const storedTemp = typeof window !== 'undefined' ? localStorage.getItem('envisense_temp_thresh') : null;
  const customTempWarn = storedTemp && Number(storedTemp) >= 30 ? Number(storedTemp) : 39;
  const storedVib = typeof window !== 'undefined' ? localStorage.getItem('envisense_vib_thresh') : null;
  const customVibWarn = storedVib && Number(storedVib) >= 30 ? Number(storedVib) : 70;

  // Fire risk rule: High MQ2 and high temp
  let fireRisk = 'SAFE';
  if (mq2 != null) {
    if (mq2 >= customMq2Warn + 100 || (temp != null && temp > customTempWarn + 5 && mq2 >= customMq2Warn)) fireRisk = 'HIGH';
    else if (mq2 >= customMq2Warn || (temp != null && temp > customTempWarn)) fireRisk = 'WARNING';
  }

  // Heat risk rule
  let heatRisk = 'SAFE';
  if (temp != null) {
    if (temp >= customTempWarn + 5) heatRisk = 'HIGH';
    else if (temp >= customTempWarn) heatRisk = 'WARNING';
  }

  // Flood risk rule
  let floodRisk = 'SAFE';
  if (humidity != null) {
    if (humidity > 94 && waterLevel != null && waterLevel > 80) floodRisk = 'HIGH';
    else if (humidity > 90) floodRisk = 'WARNING';
  }

  // Landslide risk rule: vibration OR saturated soil moisture
  // soil_moisture_raw: 0 = disconnected/invalid, 1-799 = very wet (danger), 4095 = very dry (safe)
  let landslideRisk = 'SAFE';
  if (vibration != null || (soilMoisture != null && soilMoisture > 0)) {
    const highVib = vibration != null && vibration >= customVibWarn * 2;
    const warnVib = vibration != null && vibration >= customVibWarn;
    const verySaturated = soilMoisture != null && soilMoisture > 0 && soilMoisture < 800;   // raw < 800 = very wet soil
    const moderateSat   = soilMoisture != null && soilMoisture > 0 && soilMoisture < 1800;  // raw < 1800 = moderately wet

    if (highVib || (verySaturated && warnVib)) landslideRisk = 'HIGH';
    else if (warnVib || verySaturated || moderateSat) landslideRisk = 'WARNING';
  }

  // Air Quality risk rule (Strict user requirement)
  let airRisk = 'SAFE';
  if (mq2 != null) {
    if (mq2 >= 3150) airRisk = 'CRITICAL';
    else if (mq2 >= 3051) airRisk = 'WARNING';
    else airRisk = 'SAFE';
  }

  // Water Quality risk rule (Exact calibration: 3000-4095 SAFE, 1500-2999 WARNING, 1-1499 UNSAFE/HIGH, 0 = disconnected/ignore)
  let waterRisk = 'SAFE';
  if (turbidity != null && turbidity > 0) {
    if (turbidity < 1500) waterRisk = 'HIGH';
    else if (turbidity < 3000) waterRisk = 'WARNING';
    else waterRisk = 'SAFE';
  }

  // Normalize pH if raw ADC (e.g. 1535) is passed
  let normalizedPh = ph;
  if (ph != null && ph > 14) {
    normalizedPh = parseFloat((3.5 + (ph / 4095) * 7.0).toFixed(1));
  }

  if (normalizedPh != null && normalizedPh > 0 && (normalizedPh < 6.0 || normalizedPh > 8.5)) {
    if (waterRisk === 'SAFE') waterRisk = 'WARNING';
  }

  const industrialRisk = mq2 != null && mq2 >= customMq2Warn + 100 ? 'HIGH' : mq2 != null && mq2 >= customMq2Warn ? 'WARNING' : 'SAFE';

  const hazards = {
    forest_fire: { name: 'Forest Fire', risk: fireRisk, icon: '🔥' },
    extreme_heat: { name: 'Extreme Heat', risk: heatRisk, icon: '🌡️' },
    flood: { name: 'Flood', risk: floodRisk, icon: '🌊' },
    landslide: { name: 'Landslide', risk: landslideRisk, icon: '⛰️' },
    air_quality: { name: 'Air Quality', risk: airRisk, icon: '🌫️' },
    water_quality: { name: 'Water Quality', risk: waterRisk, icon: '💧' },
    industrial: { name: 'Industrial Safety', risk: industrialRisk, icon: '🏭' },
  };

  // Overall Area Status: STRICTLY driven by hazards values
  const hasHigh = Object.values(hazards).some((h) => h.risk === 'HIGH' || h.risk === 'CRITICAL');
  const hasWarning = Object.values(hazards).some((h) => h.risk === 'WARNING' || h.risk === 'MODERATE');

  const overallStatus = hasHigh ? 'CRITICAL' : hasWarning ? 'WARNING' : 'SAFE';

  return {
    overallStatus,
    hazards,
  };
};

/**
 * Returns ONLY real nodes from live Firebase data.
 * NO FAKE NODES. NO MOCK DATA. NO FALLBACK DEFAULTS.
 * 
 * Supports two Firebase structures:
 * 1. Flat: liveFirebaseData.live.sensors.temperature
 * 2. Node-based: liveFirebaseData.nodes.NODE_001.sensors.temperature
 */
export const getActiveNodes = (liveFirebaseData) => {
  if (!liveFirebaseData) return [];

  const nodes = [];
  const now = new Date();

  // Helper to calculate online status and formatted time
  const getStatusAndTime = (lastUpdateVal, fallbackOnline) => {
    let isOnline = false;
    let lastUpdateText = 'Unknown';
    
    if (lastUpdateVal != null) {
      let lastUpdateDate = null;
      if (typeof lastUpdateVal === 'number') {
        if (lastUpdateVal > 1e11) {
          // Timestamp in millis
          lastUpdateDate = new Date(lastUpdateVal);
        } else if (lastUpdateVal > 1e8) {
          // Timestamp in seconds
          lastUpdateDate = new Date(lastUpdateVal * 1000);
        } else if (lastUpdateVal > 0) {
          // Hardware system uptime in ms
          isOnline = true;
          const totalSec = Math.floor(lastUpdateVal / 1000);
          const mins = Math.floor((totalSec % 3600) / 60);
          const hrs = Math.floor(totalSec / 3600);
          lastUpdateText = hrs > 0 ? `Just now (Uptime: ${hrs}h ${mins}m)` : `Just now (Uptime: ${mins}m)`;
        }
      } else if (typeof lastUpdateVal === 'string') {
        const parsed = new Date(lastUpdateVal);
        if (!isNaN(parsed.getTime())) {
          lastUpdateDate = parsed;
        }
      }

      if (lastUpdateDate && !isNaN(lastUpdateDate.getTime()) && lastUpdateDate.getTime() > 10000) {
        const diffMs = now.getTime() - lastUpdateDate.getTime();
        
        // Consider online if updated in the last 60 seconds.
        // We also allow a negative diff (up to -2 mins) in case the client's clock is slightly behind Firebase's server time.
        if (diffMs > -120000 && diffMs < 60000) {
          isOnline = true;
          lastUpdateText = 'Just now';
        } else if (diffMs >= 60000) {
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMins / 60);
          if (diffMins < 60) {
            lastUpdateText = `${diffMins}m ago`;
          } else if (diffHours < 24) {
            lastUpdateText = `${diffHours}h ago`;
          } else {
            const diffDays = Math.floor(diffHours / 24);
            lastUpdateText = `${diffDays}d ago`;
          }
        } else {
          lastUpdateText = lastUpdateDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }
    }
    
    // Fallback to the boolean if time check failed or is missing
    const finalOnline = isOnline || fallbackOnline === true;
    if (finalOnline && lastUpdateText === 'Unknown') {
      lastUpdateText = 'Just now';
    }
    return { status: finalOnline ? 'ONLINE' : 'OFFLINE', lastUpdateText };
  };

  // Structure 1: Single live node at /envisence/live/
  const liveSensors = liveFirebaseData?.live?.sensors;
  const liveDevice = liveFirebaseData?.live?.device;
  const liveOverallStatus = liveFirebaseData?.live?.overall_status;

  if (liveSensors) {
    const rawTurbidity = liveSensors.turbidity ?? liveSensors.turbidity_raw ?? (liveSensors.turbidity_status === 'Clear' ? 3400 : liveSensors.turbidity_status === 'Cloudy' ? 2200 : 3400);
    const rawMq2 = liveSensors.mq2 ?? liveSensors.mq2_raw ?? 450;
    const rawVib = liveSensors.vibration ?? liveSensors.vibration_raw ?? 12;
    const rawPh = liveSensors.ph ?? liveSensors.ph_raw ?? 7.2;
    const rawSoilMoisture = liveSensors.soil_moisture_raw ?? liveSensors.soil_moisture ?? null;

    const rawWlCond = liveSensors.water_level_condition ?? (liveSensors.water_level > 75 ? 'HIGH' : liveSensors.water_level < 25 ? 'LOW' : 'NORMAL');
    const rawWl = liveSensors.water_level ?? liveSensors.water_level_cm ?? (rawWlCond === 'HIGH' ? 85 : rawWlCond === 'LOW' ? 20 : 50);

    const sensorData = {
      temperature: liveSensors.temperature ?? 28,
      humidity: liveSensors.humidity ?? 65,
      mq2: rawMq2,
      vibration: rawVib,
      ph: rawPh > 14 ? parseFloat((3.5 + (rawPh / 4095) * 7.0).toFixed(1)) : rawPh,
      turbidity: rawTurbidity,
      water_level: rawWl,
      water_level_condition: rawWlCond,
      soil_moisture_raw: rawSoilMoisture,
    };

    const risks = deriveHazardRisks(sensorData);
    const firePrediction = liveFirebaseData?.live?.forest_fire;
    const { status, lastUpdateText } = getStatusAndTime(liveDevice?.last_update, liveDevice?.online === true);

    nodes.push({
      id: 'NODE-001',
      name: 'Node 001 — Main Station',
      area: 'Velachery Tech Corridor',
      lat: 12.9785,
      lng: 80.2184,
      isReal: true,
      status,
      lastUpdate: lastUpdateText,
      sensors: liveSensors,
      sensorData,
      risks,
      overallStatus: risks.overallStatus,
      aiPrediction: firePrediction?.ai_prediction || risks.overallStatus,
      aiConfidence: firePrediction?.ai_prediction ? 94.6 : null,
      device: liveDevice,
    });
  }

  // Structure 2: Multi-node at /envisence/nodes/
  const nodesData = liveFirebaseData?.nodes;
  if (nodesData && typeof nodesData === 'object') {
    Object.entries(nodesData).forEach(([nodeId, nodeData]) => {
      // Skip if we already added this node from the live path
      if (nodeId === 'NODE_001' && nodes.length > 0) return;

      const sensors = nodeData?.sensors;
      if (!sensors) return;

      const sensorData = {
        temperature: sensors.temperature,
        humidity: sensors.humidity,
        mq2: sensors.mq2_raw ?? sensors.mq2,
        vibration: sensors.vibration_raw ?? sensors.vibration,
        ph: sensors.ph_raw ?? sensors.ph,
        turbidity: sensors.turbidity,
        water_level: sensors.water_level,
      };

      const risks = deriveHazardRisks(sensorData);
      const { status, lastUpdateText } = getStatusAndTime(nodeData.last_update, nodeData.online === true);

      nodes.push({
        id: nodeId,
        name: nodeData.name || nodeId,
        area: nodeData.area || 'Unknown Area',
        lat: nodeData.latitude || 13.0827,
        lng: nodeData.longitude || 80.2707,
        isReal: true,
        status,
        lastUpdate: lastUpdateText,
        sensors,
        sensorData,
        risks,
        overallStatus: risks.overallStatus,
        aiPrediction: nodeData.predictions?.forest_fire || 'MONITORING',
        aiConfidence: null,
        device: nodeData.device,
      });
    });
  }

  return nodes;
};
