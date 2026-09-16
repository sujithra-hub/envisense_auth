import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { colors } from '../theme/colors';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  color: ${colors.textPrimary};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${colors.textSecondary};
  margin-bottom: 2rem;
`;

const InstructionCard = styled(motion.div)`
  background: ${colors.surface};
  border: 1px solid ${colors.glassBorder};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const HazardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${colors.glassBorder};
`;

const HazardIcon = styled.span`
  font-size: 1.5rem;
`;

const HazardName = styled.h3`
  margin: 0;
  color: ${colors.textPrimary};
  font-size: 1.1rem;
`;

const ActionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActionItem = styled.li`
  color: ${colors.textSecondary};
  font-size: 0.95rem;
  display: flex;
  gap: 0.75rem;
  line-height: 1.5;

  &::before {
    content: '•';
    color: ${colors.primaryLight};
    font-weight: bold;
  }
`;

const safetyGuidelines = [
  {
    id: 'fire',
    name: 'Forest Fire',
    icon: '🔥',
    actions: [
      'Avoid entering the affected forest or brush areas.',
      'Stay indoors and keep windows closed to avoid smoke inhalation.',
      'Follow local authority evacuation instructions immediately if issued.',
      'Report any visible uncontrolled fires through official emergency channels (112 / 101).'
    ]
  },
  {
    id: 'heat',
    name: 'Extreme Heat',
    icon: '🌡️',
    actions: [
      'Stay hydrated. Drink plenty of water even if you do not feel thirsty.',
      'Avoid prolonged outdoor activities between 11 AM and 4 PM.',
      'Stay in cool or shaded places. Use fans or air conditioning.',
      'Check on vulnerable neighbors and elderly individuals.'
    ]
  },
  {
    id: 'flood',
    name: 'Flood',
    icon: '🌊',
    actions: [
      'Avoid driving or walking through flooded roads. 6 inches of moving water can knock you down.',
      'Move to a safer, elevated location if instructed by authorities.',
      'Turn off main power switches if water enters your home.',
      'Do not drink tap water until authorities declare it safe.'
    ]
  },
  {
    id: 'air',
    name: 'Air Pollution',
    icon: '🌫️',
    actions: [
      'Limit prolonged outdoor exertion.',
      'Wear an N95 mask if you must go outside during high pollution alerts.',
      'Keep indoor air clean (close windows, use air purifiers if available).',
      'Individuals with respiratory issues should keep medication readily available.'
    ]
  }
];

const SafetyAlerts = () => {
  return (
    <Container>
      <PageTitle>Safety Instructions</PageTitle>
      <Subtitle>Official guidelines on how to stay safe during environmental hazards.</Subtitle>

      {safetyGuidelines.map((guide, index) => (
        <InstructionCard
          key={guide.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <HazardHeader>
            <HazardIcon>{guide.icon}</HazardIcon>
            <HazardName>{guide.name} Safety</HazardName>
          </HazardHeader>
          <ActionList>
            {guide.actions.map((action, i) => (
              <ActionItem key={i}>{action}</ActionItem>
            ))}
          </ActionList>
        </InstructionCard>
      ))}
    </Container>
  );
};

export default SafetyAlerts;
