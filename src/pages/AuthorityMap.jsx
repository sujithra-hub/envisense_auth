import React, { useState } from 'react';
import { AddNodeModal } from '../components/AddNodeModal';
import styled from 'styled-components';
import RiskMap from '../components/RiskMap';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { colors } from '../theme/colors';
import { getActiveNodes } from '../services/locationService';

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin-bottom: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  background: ${({ active }) => active ? colors.primaryGlow : colors.surface};
  color: ${({ active }) => active ? colors.primaryLight : colors.textSecondary};
  border: 1px solid ${({ active }) => active ? colors.primaryLight : colors.glassBorder};
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.surfaceLight};
    color: ${colors.textPrimary};
  }
`;

// AddNode button styling (reuses FilterBtn look)
const AddButton = styled.button`
  background: ${colors.primaryGlow};
  color: ${colors.textPrimary};
  border: 1px solid ${colors.primaryLight};
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  margin-left: auto;
  transition: all 0.2s ease;

  &:hover { background: ${colors.primaryLight}; }
`;

const AuthorityMap = () => {
  const { value: firebaseData } = useFirebaseValue('/envisence');
  
  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setModalOpen] = useState(false);

  const allNodes = getActiveNodes(firebaseData);

  const filteredNodes = filter === 'ALL' 
    ? allNodes 
    : allNodes.filter(n => n.risks.hazards[filter] && n.risks.hazards[filter].risk !== 'SAFE');

  const handleNodeAdded = () => {
    // Refresh Firebase data by re-triggering hook (it will auto update)
  };

  return (
    <>
      <PageTitle>Environmental Risk Map</PageTitle>
      
      <FilterContainer>
        <FilterBtn active={filter === 'ALL'} onClick={() => setFilter('ALL')}>All Zones</FilterBtn>
        <FilterBtn active={filter === 'FIRE'} onClick={() => setFilter('FIRE')}>🔥 Fire Risks</FilterBtn>
        <FilterBtn active={filter === 'AIR'} onClick={() => setFilter('AIR')}>🌫️ Air Quality</FilterBtn>
        <FilterBtn active={filter === 'WATER'} onClick={() => setFilter('WATER')}>💧 Water / Flood</FilterBtn>
        <AddButton onClick={() => setModalOpen(true)}>Add Node</AddButton>
      </FilterContainer>

      <RiskMap nodes={filteredNodes} height="calc(100vh - 200px)" />
      <AddNodeModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onAdded={handleNodeAdded} />
    </>
  );
};

export default AuthorityMap;
