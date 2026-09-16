// src/hooks/useNotifications.js
import { useEffect, useRef, useCallback } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const HAZARD_LABELS = {
  forest_fire:  { icon: '🔥', name: 'Forest Fire Alert' },
  extreme_heat: { icon: '🌡️', name: 'Extreme Heat Alert' },
  flood:        { icon: '🌊', name: 'Flood Risk Alert' },
  landslide:    { icon: '⛰️', name: 'Landslide Alert' },
  air_quality:  { icon: '🌫️', name: 'Air Quality Alert' },
  water_quality:{ icon: '💧', name: 'Water Quality Alert' },
  industrial:   { icon: '🏭', name: 'Industrial Safety Alert' },
};

const SEVERITY_RANK = { SAFE: 0, WARNING: 1, HIGH: 2, CRITICAL: 3 };

/**
 * Hook that:
 *  1. Requests Notification permission on first call (must be triggered by user gesture externally)
 *  2. Watches /envisence/live/overall_status and individual hazard paths
 *  3. Fires browser notifications when status transitions to WARNING or above
 */
export const useNotifications = () => {
  const prevOverallRef  = useRef(null);
  const prevHazardsRef  = useRef({});
  const permGranted     = useRef(false);

  // ------------------------------------------------------------------
  // Permission helpers
  // ------------------------------------------------------------------
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      permGranted.current = true;
      return true;
    }
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    permGranted.current = result === 'granted';
    return permGranted.current;
  }, []);

  const fireNotification = useCallback((title, body, icon = '/vite.svg') => {
    if (!permGranted.current || Notification.permission !== 'granted') return;
    try {
      const n = new Notification(title, {
        body,
        icon,
        badge: '/vite.svg',
        tag: title, // prevent duplicate stacking for same alert type
        requireInteraction: false,
      });
      // Auto-close after 8 seconds
      setTimeout(() => n.close(), 8000);
    } catch (e) {
      console.warn('Notification error:', e);
    }
  }, []);

  // ------------------------------------------------------------------
  // Initialise: request permission silently if already granted
  // ------------------------------------------------------------------
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      permGranted.current = true;
    }
  }, []);

  // ------------------------------------------------------------------
  // Overall status watcher
  // ------------------------------------------------------------------
  useEffect(() => {
    const statusRef = ref(db, '/envisence/live/overall_status');
    const unsub = onValue(statusRef, (snap) => {
      const current = snap.val();
      const prev    = prevOverallRef.current;

      if (prev !== null && current !== prev) {
        const rank = SEVERITY_RANK[current] ?? 0;
        if (rank >= 1) {
          // Escalating
          fireNotification(
            `⚠️ ENVISENSE — Environment Status: ${current}`,
            `Overall environmental status has changed from ${prev} → ${current}. Review the dashboard for details.`
          );
        } else if (prev && (SEVERITY_RANK[prev] ?? 0) > 0 && rank === 0) {
          // All-clear
          fireNotification(
            `✅ ENVISENSE — All Clear`,
            `Environmental status has returned to SAFE. All hazard modules nominal.`
          );
        }
      }
      prevOverallRef.current = current;
    });

    return () => unsub();
  }, [fireNotification]);

  // ------------------------------------------------------------------
  // Per-hazard watcher — fires per-module alerts
  // ------------------------------------------------------------------
  useEffect(() => {
    const hazardKeys = Object.keys(HAZARD_LABELS);
    const unsubs = hazardKeys.map((key) => {
      const hazardRef = ref(db, `/envisence/live/${key}`);
      return onValue(hazardRef, (snap) => {
        const data    = snap.val();
        const current = data?.status ?? 'SAFE';
        const prev    = prevHazardsRef.current[key];

        if (prev !== undefined && current !== prev) {
          const rank = SEVERITY_RANK[current] ?? 0;
          if (rank >= 2) {
            // HIGH or CRITICAL
            const meta = HAZARD_LABELS[key];
            fireNotification(
              `${meta.icon} ${meta.name} — ${current}`,
              `${meta.name} detected at NODE-001 (Velachery Tech Corridor). Immediate attention required.`
            );
          } else if (rank === 1 && (SEVERITY_RANK[prev] ?? 0) === 0) {
            // Newly WARNING
            const meta = HAZARD_LABELS[key];
            fireNotification(
              `${meta.icon} ${meta.name} — WARNING`,
              `${meta.name} has entered WARNING level. Monitor conditions closely.`
            );
          }
        }
        prevHazardsRef.current[key] = current;
      });
    });

    return () => unsubs.forEach((u) => u());
  }, [fireNotification]);

  return {
    requestPermission,
    isSupported: 'Notification' in window,
    permissionStatus: typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported',
  };
};
