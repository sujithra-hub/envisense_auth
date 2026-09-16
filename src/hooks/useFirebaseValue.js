// src/hooks/useFirebaseValue.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

/**
 * Hook to subscribe to a Firebase Realtime Database path.
 * Returns the current value and a loading flag.
 */
export const useFirebaseValue = (path) => {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(db, path);
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        setValue(snapshot.val());
        setLoading(false);
      },
      (error) => {
        console.error('Firebase read error:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [path]);

  return { value, loading };
};
