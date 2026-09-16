// src/components/Grid.jsx
import styled from 'styled-components';

// Responsive grid that adapts to screen width
export const Grid = styled.div`
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export default Grid;
