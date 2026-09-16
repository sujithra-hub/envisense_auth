// src/hooks/useFirebaseValue.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

/**
 * Helper to extract fallback value from /envisence/nodes structure
 * when /envisence/live/* path is empty in Firebase.
 */
const resolveFallbackFromNodes = (targetPath, nodesData) => {
  if (!nodesData || typeof nodesData !== 'object') return null;

  const nodeKeys = Object.keys(nodesData);
  if (nodeKeys.length === 0) return null;

  // Pick the first or active node
  const activeNode = nodesData[nodeKeys[0]];
  if (!activeNode) return null;

  const subPath = targetPath.replace(/^\/?envisence\/live\/?/, '');

  switch (subPath) {
    case 'sensors':
      return activeNode.sensors || null;

    case 'device':
      return {
        online: activeNode.online ?? activeNode.deviceStatus?.online ?? true,
        last_update: activeNode.last_update ?? activeNode.deviceStatus?.lastSeen ?? Date.now(),
        firmware_version: activeNode.deviceStatus?.firmwareVersion || '1.0.0',
        name: activeNode.name || 'Forest Monitoring Node 1',
        area: activeNode.area || 'Forest Zone A',
        rssi: activeNode.deviceStatus?.wifiRSSI || -65,
      };

    case 'overall_status': {
      const ff = activeNode.predictions?.forest_fire;
      const eh = activeNode.predictions?.extreme_heat;
      const ls = activeNode.predictions?.landslide;
      if (ff?.severity === 'CRITICAL' || eh?.severity === 'CRITICAL' || ls?.severity === 'CRITICAL') {
        return 'CRITICAL';
      }
      if (ff?.severity === 'WARNING' || eh?.severity === 'WARNING' || ls?.severity === 'WARNING') {
        return 'WARNING';
      }
      return 'SAFE';
    }

    case 'forest_fire':
      return activeNode.predictions?.forest_fire || null;

    case 'extreme_heat':
      return activeNode.predictions?.extreme_heat || null;

    case 'landslide':
      return activeNode.predictions?.landslide || null;

    default:
      if (subPath && activeNode[subPath]) {
        return activeNode[subPath];
      }
      return null;
  }
};

/**
 * Hook to subscribe to a Firebase Realtime Database path.
 * Includes intelligent fallback to /envisence/nodes for live sensor data.
 */
export const useFirebaseValue = (path) => {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normalize path string
  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '/';

  useEffect(() => {
    let isMounted = true;
    const dataRef = ref(db, normalizedPath);

    let nodesUnsub = null;

    const mainUnsub = onValue(
      dataRef,
      (snapshot) => {
        const val = snapshot.val();
        if (val !== null && val !== undefined) {
          if (isMounted) {
            setValue(val);
            setLoading(false);
          }
        } else if (normalizedPath.startsWith('/envisence/live')) {
          // If /envisence/live subpath is null, listen to /envisence/nodes as fallback
          const nodesRef = ref(db, '/envisence/nodes');
          if (nodesUnsub) nodesUnsub();
          nodesUnsub = onValue(
            nodesRef,
            (nodesSnap) => {
              if (isMounted) {
                const fallbackVal = resolveFallbackFromNodes(normalizedPath, nodesSnap.val());
                setValue(fallbackVal);
                setLoading(false);
              }
            },
            () => {
              if (isMounted) setLoading(false);
            }
          );
        } else {
          if (isMounted) {
            setValue(null);
            setLoading(false);
          }
        }
      },
      (error) => {
        console.error(`Firebase read error at [${normalizedPath}]:`, error);
        if (isMounted) setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      mainUnsub();
      if (nodesUnsub) nodesUnsub();
    };
  }, [normalizedPath]);

  return { value, loading };
};

