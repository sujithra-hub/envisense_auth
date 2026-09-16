import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';
import { colors } from '../theme/colors';
import { MdAdd, MdClose, MdCheckCircle } from 'react-icons/md';

/* ── animations ── */
const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/* ── styled components ── */
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
`;

const ModalCard = styled(motion.div)`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  padding: 2rem 2.25rem;
  width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${colors.glassBorder}; border-radius: 4px; }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  margin: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 1.25rem;
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: ${colors.textMuted};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s;
  &:hover { background: ${colors.surfaceLight}; color: ${colors.textPrimary}; }
`;

const SectionLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${colors.textMuted};
  margin: 1.2rem 0 0.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${colors.textSecondary};
  margin-bottom: 0.3rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.55rem 0.75rem;
  margin-bottom: 0.9rem;
  border: 1px solid ${colors.glassBorder};
  border-radius: 8px;
  background: ${colors.surfaceLight};
  color: ${colors.textPrimary};
  font-size: 0.9rem;
  font-family: 'Public Sans', sans-serif;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus { border-color: ${colors.primaryLight}; }
  &::placeholder { color: ${colors.textMuted}; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  ${Input} { margin-bottom: 0.9rem; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #fff;
  background: linear-gradient(135deg, ${colors.primaryLight}, ${colors.primary || '#6366f1'});
  background-size: 200% 100%;
  transition: all 0.3s ease;

  &:hover {
    animation: ${shimmer} 1.5s infinite;
    box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    animation: none;
  }
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  color: ${colors.success};

  svg { font-size: 3rem; }

  span {
    font-size: 1.05rem;
    font-weight: 600;
    color: ${colors.textPrimary};
  }

  small {
    color: ${colors.textSecondary};
    font-size: 0.85rem;
  }
`;

const ErrorMsg = styled.div`
  color: ${colors.danger};
  font-size: 0.82rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
`;

/* ── component ── */
const INITIAL_SENSORS = {
  temperature: '',
  humidity: '',
  mq2_raw: '',
  vibration_raw: '',
  ph_raw: '',
  turbidity: '',
  soil_moisture_raw: '',
};

export const AddNodeModal = ({ isOpen, onClose, onAdded }) => {
  const [nodeId, setNodeId] = useState('');
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [sensors, setSensors] = useState({ ...INITIAL_SENSORS });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setNodeId('');
    setName('');
    setArea('');
    setLat('');
    setLng('');
    setSensors({ ...INITIAL_SENSORS });
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const updateSensor = (key, val) => {
    setSensors((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nodeId.trim()) { setError('Node ID is required.'); return; }

    setSaving(true);
    setError('');

    // Build sensor object — only include fields with values
    const sensorData = {};
    Object.entries(sensors).forEach(([key, val]) => {
      if (val !== '' && val !== null && val !== undefined) {
        sensorData[key] = isNaN(Number(val)) ? val : Number(val);
      }
    });

    const nodePath = `/envisence/nodes/${nodeId.trim()}`;
    const nodeData = {
      name: name.trim() || nodeId.trim(),
      area: area.trim() || 'Custom Area',
      latitude: parseFloat(lat) || 0,
      longitude: parseFloat(lng) || 0,
      online: false,
      last_update: new Date().toISOString(),
      sensors: sensorData,
    };

    try {
      await set(ref(db, nodePath), nodeData);
      setSuccess(true);
      onAdded && onAdded();
      // Auto-close after brief success display
      setTimeout(() => { handleClose(); }, 1800);
    } catch (err) {
      setError(`Firebase write failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalCard
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <Title><MdAdd /> Add New Monitoring Node</Title>
              <CloseBtn onClick={handleClose}><MdClose size={20} /></CloseBtn>
            </ModalHeader>

            {success ? (
              <SuccessMessage
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <MdCheckCircle />
                <span>Node "{nodeId}" created!</span>
                <small>Data pushed to Firebase successfully. It will appear in all dashboards.</small>
              </SuccessMessage>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && <ErrorMsg>{error}</ErrorMsg>}

                {/* ── Node Identity ── */}
                <SectionLabel>Node Identity</SectionLabel>

                <Label htmlFor="add-node-id">Node ID *</Label>
                <Input
                  id="add-node-id"
                  placeholder="e.g. NODE_002"
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                  required
                />

                <Label htmlFor="add-node-name">Display Name</Label>
                <Input
                  id="add-node-name"
                  placeholder="e.g. Node 002 — River Monitoring"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Label htmlFor="add-node-area">Assigned Area</Label>
                <Input
                  id="add-node-area"
                  placeholder="e.g. Coastal Zone"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />

                {/* ── Geolocation ── */}
                <SectionLabel>Geolocation</SectionLabel>
                <Row>
                  <div>
                    <Label htmlFor="add-node-lat">Latitude</Label>
                    <Input
                      id="add-node-lat"
                      placeholder="12.9785"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                  <div>
                    <Label htmlFor="add-node-lng">Longitude</Label>
                    <Input
                      id="add-node-lng"
                      placeholder="80.2184"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                </Row>

                {/* ── Initial Sensor Values (optional) ── */}
                <SectionLabel>Initial Sensor Values (optional)</SectionLabel>

                <Row>
                  <div>
                    <Label>Temperature (°C)</Label>
                    <Input
                      placeholder="e.g. 28"
                      value={sensors.temperature}
                      onChange={(e) => updateSensor('temperature', e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                  <div>
                    <Label>Humidity (%)</Label>
                    <Input
                      placeholder="e.g. 65"
                      value={sensors.humidity}
                      onChange={(e) => updateSensor('humidity', e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                </Row>

                <Row>
                  <div>
                    <Label>MQ2 / Gas (raw)</Label>
                    <Input
                      placeholder="e.g. 450"
                      value={sensors.mq2_raw}
                      onChange={(e) => updateSensor('mq2_raw', e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                  <div>
                    <Label>Vibration (raw)</Label>
                    <Input
                      placeholder="e.g. 12"
                      value={sensors.vibration_raw}
                      onChange={(e) => updateSensor('vibration_raw', e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                </Row>

                <Row>
                  <div>
                    <Label>pH (raw)</Label>
                    <Input
                      placeholder="e.g. 7.2"
                      value={sensors.ph_raw}
                      onChange={(e) => updateSensor('ph_raw', e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                  <div>
                    <Label>Turbidity (raw)</Label>
                    <Input
                      placeholder="e.g. 3400"
                      value={sensors.turbidity}
                      onChange={(e) => updateSensor('turbidity', e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                </Row>

                <Label>Soil Moisture (raw)</Label>
                <Input
                  placeholder="e.g. 2500"
                  value={sensors.soil_moisture_raw}
                  onChange={(e) => updateSensor('soil_moisture_raw', e.target.value)}
                  type="number"
                  step="any"
                />

                <SubmitBtn type="submit" disabled={saving}>
                  <MdAdd /> {saving ? 'Saving…' : 'Add Node to Firebase'}
                </SubmitBtn>
              </form>
            )}
          </ModalCard>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
