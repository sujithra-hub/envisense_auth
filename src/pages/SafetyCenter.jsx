// src/pages/SafetyCenter.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { MdSecurity, MdCheck, MdClose, MdWarning, MdArrowForward } from 'react-icons/md';
import { colors } from '../theme/colors';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 950px;
  margin: 0 auto;
`;

const Header = styled.div`
  h2 {
    font-family: 'Manrope', sans-serif;
    font-size: 1.4rem;
    margin: 0 0 0.2rem 0;
    color: ${colors.textPrimary};
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: ${colors.textSecondary};
  }
`;

const HazardTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
`;

const TabButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1rem;
  border-radius: 12px;
  border: 1px solid ${(props) => (props.$active ? colors.primaryLight : colors.glassBorder)};
  background: ${(props) => (props.$active ? colors.primaryGlow : colors.surface)};
  color: ${(props) => (props.$active ? colors.primaryLight : colors.textSecondary)};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.primaryLight};
    color: ${colors.textPrimary};
  }
`;

const PhaseNav = styled.div`
  display: flex;
  gap: 1rem;
  background: ${colors.surfaceLight};
  padding: 0.35rem;
  border-radius: 12px;
  width: fit-content;
`;

const PhaseBtn = styled.button`
  padding: 0.45rem 1.25rem;
  border-radius: 8px;
  border: none;
  background: ${(props) => (props.$active ? colors.surface : 'transparent')};
  color: ${(props) => (props.$active ? colors.textPrimary : colors.textMuted)};
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: ${(props) => (props.$active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none')};
  transition: all 0.2s ease;
`;

const ContentCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  .title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .icon {
      font-size: 2rem;
    }

    h3 {
      margin: 0;
      font-family: 'Manrope', sans-serif;
      font-size: 1.3rem;
      color: ${colors.textPrimary};
    }
  }
`;

const AdviceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
`;

const AdviceColumn = styled.div`
  background: ${colors.surfaceLight};
  border-radius: 12px;
  padding: 1.25rem;

  h4 {
    margin: 0 0 0.85rem 0;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${(props) => (props.$type === 'do' ? colors.success : colors.danger)};
  }

  ul {
    margin: 0;
    padding-left: 1.2rem;
    font-size: 0.85rem;
    color: ${colors.textSecondary};

    li {
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
  }
`;

const SAFETY_GUIDES = {
  fire: {
    title: 'Forest Fire & Brushfire Safety',
    icon: '🔥',
    before: {
      do: ['Clear dry leaves and brush within 10 meters of buildings.', 'Keep emergency N95 masks and goggles ready.', 'Plan two clear evacuation routes from your neighborhood.'],
      dont: ['Do not burn trash or yard waste on high-wind days.', 'Never store flammable liquids near open flames.'],
    },
    during: {
      do: ['Evacuate immediately if instructed by authorities.', 'Cover mouth and nose with a damp cloth or N95 mask.', 'Stay low to the ground to avoid inhaling dense smoke.'],
      dont: ['Do not drive towards thick smoke clouds.', 'Do not stop to gather non-essential personal items.'],
    },
    after: {
      do: ['Wait for official all-clear before returning to burned areas.', 'Check building structures for residual hot spots.'],
      dont: ['Do not touch downed electrical lines or smoldering debris.'],
    },
  },
  flood: {
    title: 'Flash Flood & Heavy Rainfall Safety',
    icon: '🌊',
    before: {
      do: ['Clear drainage channels around your house.', 'Move valuable electronics and documents to upper floors.'],
      dont: ['Do not build temporary barriers that block street drains.'],
    },
    during: {
      do: ['Move to higher ground or upper building levels.', 'Disconnect electrical appliances if water enters buildings.'],
      dont: ['Never walk or drive through moving floodwaters (15cm can knock you over).'],
    },
    after: {
      do: ['Boil drinking water before consumption.', 'Disinfect flooded areas before occupying.'],
      dont: ['Do not consume food that came into contact with floodwater.'],
    },
  },
  landslide: {
    title: 'Landslide & Slope Stability Safety',
    icon: '⛰️',
    before: {
      do: ['Watch for signs of ground movement, leaning trees, or cracks.', 'Maintain natural slope vegetation to prevent erosion.'],
      dont: ['Avoid building near steep un-reinforced hillsides.'],
    },
    during: {
      do: ['If indoors, curl into a tight ball and protect your head.', 'Run perpendicular to the landslide path if outdoors.'],
      dont: ['Do not stay near river valleys or low-lying drainage paths.'],
    },
    after: {
      do: ['Watch for secondary landslides or flooding after mudflows.'],
      dont: ['Do not enter damaged structures until certified safe.'],
    },
  },
  heat: {
    title: 'Extreme Heatwave Safety',
    icon: '🌡️',
    before: {
      do: ['Stock electrolyte drinks and oral rehydration salts.', 'Check air conditioning or cooling fan operations.'],
      dont: ['Avoid heavy outdoor physical exertion during midday.'],
    },
    during: {
      do: ['Drink plenty of water even if you do not feel thirsty.', 'Wear loose, lightweight, light-colored cotton clothes.'],
      dont: ['Never leave children or pets inside parked vehicles.'],
    },
    after: {
      do: ['Rest in shaded or air-conditioned environments after heat exposure.'],
      dont: ['Do not consume alcohol or caffeine during high heat days.'],
    },
  },
};

const SafetyCenter = () => {
  const [selectedHazard, setSelectedHazard] = useState('fire');
  const [phase, setPhase] = useState('during');

  const guide = SAFETY_GUIDES[selectedHazard] || SAFETY_GUIDES.fire;
  const currentPhaseData = guide[phase] || guide.during;

  return (
    <Container>
      <Header>
        <h2>Public Safety & Disaster Preparedness Center</h2>
        <p>Official action protocols before, during, and after environmental emergencies</p>
      </Header>

      <HazardTabs>
        {Object.entries(SAFETY_GUIDES).map(([key, item]) => (
          <TabButton key={key} $active={selectedHazard === key} onClick={() => setSelectedHazard(key)}>
            <span>{item.icon}</span> {item.title.split(' ')[0]}
          </TabButton>
        ))}
      </HazardTabs>

      <ContentCard>
        <div className="title-row">
          <span className="icon">{guide.icon}</span>
          <div>
            <h3>{guide.title}</h3>
            <span style={{ fontSize: '0.82rem', color: colors.textMuted }}>Official Safety Protocol</span>
          </div>
        </div>

        <PhaseNav>
          <PhaseBtn $active={phase === 'before'} onClick={() => setPhase('before')}>
            BEFORE (Preparation)
          </PhaseBtn>
          <PhaseBtn $active={phase === 'during'} onClick={() => setPhase('during')}>
            DURING (Active Event)
          </PhaseBtn>
          <PhaseBtn $active={phase === 'after'} onClick={() => setPhase('after')}>
            AFTER (Recovery)
          </PhaseBtn>
        </PhaseNav>

        <AdviceGrid>
          <AdviceColumn $type="do">
            <h4>
              <MdCheck /> What You SHOULD Do
            </h4>
            <ul>
              {currentPhaseData.do.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </AdviceColumn>

          <AdviceColumn $type="dont">
            <h4>
              <MdClose /> What You MUST AVOID
            </h4>
            <ul>
              {currentPhaseData.dont.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </AdviceColumn>
        </AdviceGrid>
      </ContentCard>
    </Container>
  );
};

export default SafetyCenter;
