// src/hooks/useSensorHistory.js
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

/**
 * Hook that subscribes to live sensor data and accumulates
 * timestamped readings for chart rendering.
 * 
 * Returns rolling history from the current browser session.
 * Also reads from Firebase /envisence/history/ if available.
 * 
 * ALL DATA IS REAL — no mock values.
 */
export const useSensorHistory = (maxPoints = 50) => {
  const [history, setHistory] = useState([]);
  const [firebaseHistory, setFirebaseHistory] = useState([]);
  const lastRecordTime = useRef(0);
  const RECORD_INTERVAL = 10000; // Record every 10 seconds

  useEffect(() => {
    // Subscribe to live sensors for session-based accumulation
    const sensorsRef = ref(db, '/envisence/live/sensors');
    const unsubscribeSensors = onValue(sensorsRef, (snapshot) => {
      const sensors = snapshot.val();
      if (!sensors) return;

      const now = Date.now();
      if (now - lastRecordTime.current < RECORD_INTERVAL) return;
      lastRecordTime.current = now;

      const timestamp = new Date();
      const timeLabel = timestamp.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const entry = {
        time: timeLabel,
        timestamp: now,
        temperature: sensors.temperature ?? null,
        humidity: sensors.humidity ?? null,
        mq2: sensors.mq2_raw ?? null,
        vibration: sensors.vibration_raw ?? null,
        ph: sensors.ph_raw ?? null,
        tds: sensors.tds_ppm ?? null,
        soilMoisture: sensors.soil_moisture_raw ?? null,
        smoke: sensors.smoke_condition ?? null,
        flame: sensors.flame_condition ?? null,
        rain: sensors.rain_condition ?? null,
        waterLevel: sensors.water_level_condition ?? null,
      };

      setHistory((prev) => {
        const updated = [...prev, entry];
        return updated.slice(-maxPoints);
      });
    });

    // Also try to read Firebase-stored history if available
    const historyRef = ref(db, '/envisence/history');
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (!data || typeof data !== 'object') return;

      const entries = Object.values(data)
        .filter((e) => e && e.timestamp)
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(-maxPoints)
        .map((e) => ({
          time: new Date(e.timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          ...e,
        }));

      setFirebaseHistory(entries);
    });

    return () => {
      unsubscribeSensors();
      unsubscribeHistory();
    };
  }, [maxPoints]);

  // Prefer Firebase history if available, otherwise use session history
  const combinedHistory = firebaseHistory.length > 0 ? firebaseHistory : history;

  return {
    history: combinedHistory,
    sessionHistory: history,
    firebaseHistory,
    hasData: combinedHistory.length > 0,
    pointCount: combinedHistory.length,
  };
};
