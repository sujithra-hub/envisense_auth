import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { colors } from '../theme/colors';
import { useFirebaseValue } from '../hooks/useFirebaseValue';
import { getActiveNodes } from '../services/locationService';
import { AddNodeModal } from '../components/AddNodeModal';
import { MdAdd } from 'react-icons/md';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitle = styled.h2`
  font-family: 'Manrope', sans-serif;
  color: ${colors.textPrimary};
  margin: 0;
`;

const AddNodeBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, ${colors.primaryLight}, ${colors.primary || '#6366f1'});
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 10px rgba(99, 102, 241, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 18px rgba(99, 102, 241, 0.4);
  }
`;

const TableContainer = styled.div`
  background: ${colors.surface};
  border-radius: 12px;
  border: 1px solid ${colors.glassBorder};
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 1rem 1.5rem;
  background: hsla(220, 20%, 15%, 0.5);
  color: ${colors.textSecondary};
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid ${colors.glassBorder};
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${colors.glassBorder};
  color: ${colors.textPrimary};
  font-size: 0.95rem;
`;

const Tr = styled(motion.tr)`
  &:last-child ${Td} {
    border-bottom: none;
  }
  &:hover {
    background: ${colors.surfaceLight};
  }
`;

const StatusBadge = styled.span`
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  background: ${({ status }) => 
    status === 'SAFE' || status === 'ONLINE' ? 'hsla(152, 70%, 48%, 0.2)' : 
    status === 'WARNING' ? 'hsla(45, 95%, 55%, 0.2)' : 
    status === 'OFFLINE' ? 'hsla(220, 10%, 42%, 0.2)' :
    'hsla(0, 75%, 58%, 0.2)'};
  color: ${({ status }) => 
    status === 'SAFE' || status === 'ONLINE' ? colors.success : 
    status === 'WARNING' ? colors.warning : 
    status === 'OFFLINE' ? colors.textMuted :
    colors.danger};
`;

const EmptyState = styled.div`
  padding: 3rem 1.5rem;
  text-align: center;
  color: ${colors.textMuted};
  font-size: 0.95rem;
`;

const NodeManagement = () => {
  const { value: firebaseData } = useFirebaseValue('/envisence');
  const [isModalOpen, setModalOpen] = useState(false);

  const activeNodes = getActiveNodes(firebaseData);

  const nodes = activeNodes.map((node) => ({
    id: node.id,
    area: node.area,
    status: node.status,
    risk: node.overallStatus || 'SAFE',
    lastUpdate: node.lastUpdate,
    module: 'All Sensors Active'
  }));

  return (
    <Container>
      <HeaderRow>
        <PageTitle>Monitoring Nodes Management</PageTitle>
        <AddNodeBtn id="btn-add-node" onClick={() => setModalOpen(true)}>
          <MdAdd size={18} /> Add New Node
        </AddNodeBtn>
      </HeaderRow>
      
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Node ID</Th>
              <Th>Assigned Area</Th>
              <Th>Connection Status</Th>
              <Th>Current Risk Level</Th>
              <Th>Active Modules</Th>
              <Th>Last Update</Th>
            </tr>
          </thead>
          <tbody>
            {nodes.length > 0 ? (
              nodes.map((node, i) => (
                <Tr 
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Td style={{ fontWeight: 600, fontFamily: 'Manrope' }}>{node.id}</Td>
                  <Td>{node.area}</Td>
                  <Td><StatusBadge status={node.status}>{node.status}</StatusBadge></Td>
                  <Td><StatusBadge status={node.risk}>{node.risk}</StatusBadge></Td>
                  <Td style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>{node.module}</Td>
                  <Td style={{ color: colors.textMuted, fontSize: '0.85rem' }}>{node.lastUpdate}</Td>
                </Tr>
              ))
            ) : (
              <tr>
                <Td colSpan={6}>
                  <EmptyState>No active nodes found. Click "Add New Node" to register one.</EmptyState>
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      <AddNodeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={() => {/* Firebase listener auto-refreshes */}}
      />
    </Container>
  );
};

export default NodeManagement;

