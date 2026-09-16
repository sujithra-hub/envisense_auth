import React, { useEffect } from 'react';
import styled from 'styled-components';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { colors } from '../theme/colors';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored icons
const createIcon = (color) => {
  const markerHtmlStyles = `
    background-color: ${color};
    width: 22px;
    height: 22px;
    display: block;
    left: -11px;
    top: -11px;
    position: relative;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 0 12px ${color};
  `;
  return L.divIcon({
    className: 'custom-pin',
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
    html: `<span style="${markerHtmlStyles}" />`
  });
};

const createBlueIcon = () => {
  const markerHtmlStyles = `
    background-color: #3b82f6;
    width: 22px;
    height: 22px;
    display: block;
    left: -11px;
    top: -11px;
    position: relative;
    border-radius: 50%;
    border: 3px solid #FFFFFF;
    box-shadow: 0 0 14px #3b82f6;
  `;
  return L.divIcon({
    className: 'custom-pin-user',
    iconAnchor: [0, 0],
    popupAnchor: [0, -10],
    html: `<span style="${markerHtmlStyles}" />`
  });
};

const icons = {
  SAFE: createIcon(colors.success),
  WARNING: createIcon(colors.warning),
  HIGH: createIcon(colors.danger),
  CRITICAL: createIcon(colors.danger),
  DANGER: createIcon(colors.danger),
  OFFLINE: createIcon(colors.textMuted),
};

const MapWrapper = styled.div`
  height: ${({ height }) => height || '500px'};
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${colors.glassBorder};
  z-index: 1;

  .leaflet-container {
    height: 100%;
    width: 100%;
    background: ${colors.background};
  }

  /* Dark mode map tiles via CSS filter */
  .leaflet-tile-pane {
    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
  }
`;

const PopupContent = styled.div`
  h4 { margin: 0 0 5px; color: #333; font-family: 'Manrope', sans-serif; }
  p { margin: 2px 0; font-size: 0.85rem; color: #555; }
  .status { font-weight: bold; }
`;

const RiskMap = ({ nodes = [], center, zoom = 12, height }) => {
  const mapCenter = center || (nodes.length > 0 ? [nodes[0].lat, nodes[0].lng] : [12.9785, 80.2184]);
  return (
    <MapWrapper height={height}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Our Location (Command Center HQ) Marker - Blue Dot */}
        <Marker position={[13.0418, 80.2341]} icon={createBlueIcon()}>
          <Popup>
            <PopupContent>
              <h4>🔵 Our Location (Command Center HQ)</h4>
              <p>Central Authority Command & Dispatch Headquarters</p>
            </PopupContent>
          </Popup>
        </Marker>
        
        {nodes.map((node) => {
          const riskStatus = node.overallStatus || node.status || 'SAFE';
          const icon = icons[riskStatus] || icons.SAFE;

          return (
            <React.Fragment key={node.id}>
              {/* Module Location Marker (Status Colored Dot) */}
              <Marker position={[node.lat, node.lng]} icon={icon}>
                <Popup>
                  <PopupContent>
                    <h4>📡 {node.name}</h4>
                    <p>Location: {node.area}</p>
                    <p className="status" style={{ color: riskStatus === 'SAFE' ? colors.success : riskStatus === 'WARNING' ? colors.warning : colors.danger }}>
                      Module Risk Status: {riskStatus}
                    </p>
                    <p>Connection: {node.status}</p>
                    {node.prediction && <p>AI Prediction: {node.prediction}</p>}
                  </PopupContent>
                </Popup>
              </Marker>

              {/* Risk Radius Circle for Warnings/Dangers */}
              {riskStatus !== 'SAFE' && riskStatus !== 'OFFLINE' && (
                <Circle 
                  center={[node.lat, node.lng]} 
                  pathOptions={{ 
                    color: riskStatus === 'CRITICAL' || riskStatus === 'HIGH' || riskStatus === 'DANGER' ? colors.danger : colors.warning, 
                    fillColor: riskStatus === 'CRITICAL' || riskStatus === 'HIGH' || riskStatus === 'DANGER' ? colors.danger : colors.warning, 
                    fillOpacity: 0.2 
                  }} 
                  radius={2500} 
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </MapWrapper>
  );
};

export default RiskMap;
