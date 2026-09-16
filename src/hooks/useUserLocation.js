import { useState, useEffect } from 'react';

// Central Chennai roughly (used as default if location fails or is denied)
const DEFAULT_LOCATION = { lat: 13.0827, lng: 80.2707 };

export const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLocation(DEFAULT_LOCATION);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError('Unable to retrieve your location. Using default location.');
        setLocation(DEFAULT_LOCATION); // Fallback to default
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // Automatically request on mount
    requestLocation();
  }, []);

  return { location, error, loading, requestLocation };
};
