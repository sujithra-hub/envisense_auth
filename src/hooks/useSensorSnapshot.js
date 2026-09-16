// src/hooks/useSensorSnapshot.js
import { useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_HISTORY_ENTRIES = 288; // 24h × 12 snapshots/hour

/**
 * Runs a background service that:
 *  1. Listens to live sensor data from Firebase
 *  2. Every 5 minutes, writes a timestamped snapshot to /envisence/history/{timestamp}
 *  3. Prunes oldest entries if > MAX_HISTORY_ENTRIES
 *
 * Mount this hook once at the top level (DashboardLayout) to keep it running.
 */
export const useSensorSnapshot = () => {
  const latestSensorsRef   = useRef(null);
  const latestOverallRef   = useRef(null);
  const historyKeysRef     = useRef([]);
  const intervalRef        = useRef(null);

  // ------------------------------------------------------------------
  // Keep a live reference to current sensor data
  // ------------------------------------------------------------------
  useEffect(() => {
    let nodesUnsub = null;
    const sensorsRef = ref(db, '/envisence/live/sensors');
    const unsub1 = onValue(sensorsRef, (snap) => {
      const val = snap.val();
      if (val) {
        latestSensorsRef.current = val;
      } else {
        const nodesRef = ref(db, '/envisence/nodes');
        if (nodesUnsub) nodesUnsub();
        nodesUnsub = onValue(nodesRef, (nodesSnap) => {
          const nodes = nodesSnap.val();
          if (nodes && typeof nodes === 'object') {
            const firstNode = Object.values(nodes)[0];
            if (firstNode?.sensors) {
              latestSensorsRef.current = firstNode.sensors;
            }
          }
        });
      }
    });

    const overallRef = ref(db, '/envisence/live/overall_status');
    const unsub2 = onValue(overallRef, (snap) => {
      latestOverallRef.current = snap.val();
    });

    // Track existing keys so we can prune
    const historyRef = ref(db, '/envisence/history');
    const unsub3 = onValue(historyRef, (snap) => {
      const data = snap.val();
      if (data && typeof data === 'object') {
        historyKeysRef.current = Object.keys(data).sort();
      }
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      if (nodesUnsub) nodesUnsub();
    };
  }, []);

  // ------------------------------------------------------------------
  // Write snapshot every 5 minutes
  // ------------------------------------------------------------------
  useEffect(() => {
    const writeSnapshot = async () => {
      const sensors = latestSensorsRef.current;
      if (!sensors) return; // no data yet — skip

      const now = Date.now();
      const overallStatus = latestOverallRef.current ?? 'SAFE';

      const snapshot = {
        timestamp: now,
        overallStatus,
        temperature:  sensors.temperature    ?? null,
        humidity:     sensors.humidity       ?? null,
        mq2:          sensors.mq2_raw        ?? sensors.mq2 ?? null,
        vibration:    sensors.vibration_raw  ?? sensors.vibration ?? null,
        ph:           sensors.ph_raw         ?? sensors.ph ?? null,
        turbidity:    sensors.turbidity      ?? null,
        tds:          sensors.tds_ppm        ?? null,
        rain:         sensors.rain_condition  ?? null,
        waterLevel:   sensors.water_level_condition ?? null,
        flame:        sensors.flame_condition ?? null,
        smoke:        sensors.smoke_condition ?? null,
      };

      try {
        const snapshotRef = ref(db, `/envisence/history/${now}`);
        await set(snapshotRef, snapshot);

        // Prune oldest entries if over limit
        const keys = [...historyKeysRef.current, String(now)].sort();
        if (keys.length > MAX_HISTORY_ENTRIES) {
          const toDelete = keys.slice(0, keys.length - MAX_HISTORY_ENTRIES);
          await Promise.all(
            toDelete.map((k) => set(ref(db, `/envisence/history/${k}`), null))
          );
        }

        console.log(`[Envisense] Snapshot saved at ${new Date(now).toLocaleTimeString()}`);
      } catch (err) {
        console.warn('[Envisense] Snapshot write failed:', err.message);
      }
    };

    // Write once immediately (catches first load), then every interval
    const timeout = setTimeout(() => {
      writeSnapshot();
      intervalRef.current = setInterval(writeSnapshot, SNAPSHOT_INTERVAL_MS);
    }, 15000); // Wait 15s after mount so sensors are loaded

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
};
