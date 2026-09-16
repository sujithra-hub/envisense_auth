// src/context/LocationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRESET_LOCATIONS, calculateDistance } from '../services/locationService';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [selectedArea, setSelectedArea] = useState(() => {
    return localStorage.getItem('envisense_selected_area') || 'Velachery';
  });

  const [customLocation, setCustomLocation] = useState(() => {
    const preset = PRESET_LOCATIONS.find((p) => p.name === selectedArea);
    return preset ? { lat: preset.lat, lng: preset.lng } : { lat: 12.9785, lng: 80.2184 };
  });

  const [usingGeolocation, setUsingGeolocation] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const setAreaByName = (areaName) => {
    setSelectedArea(areaName);
    localStorage.setItem('envisense_selected_area', areaName);
    const preset = PRESET_LOCATIONS.find((p) => p.name === areaName);
    if (preset) {
      setCustomLocation({ lat: preset.lat, lng: preset.lng });
      setUsingGeolocation(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCustomLocation(coords);
        setSelectedArea('Current Geolocation');
        setUsingGeolocation(true);
        setGeoError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGeoError('Unable to fetch precise GPS. Using default area.');
      }
    );
  };

  const getDistanceTo = (targetLat, targetLng) => {
    return calculateDistance(customLocation.lat, customLocation.lng, targetLat, targetLng);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedArea,
        userLocation: customLocation,
        usingGeolocation,
        geoError,
        presetLocations: PRESET_LOCATIONS,
        setAreaByName,
        useCurrentLocation,
        getDistanceTo,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
